import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  Tabs, 
  Input, 
  Select as AntSelect, 
  Button, 
  Dropdown, 
  Space, 
  Badge, 
  Tooltip,
  Modal
} from 'antd';
import { 
  Wallet, 
  Plus, 
  Search, 
  Eye, 
  Download, 
  MoreHorizontal, 
  Filter, 
  Lock, 
  ChevronDown, 
  Play,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileText,
  IndianRupee,
  Layers,
  Edit3
} from 'lucide-react';
import { UnassignedBanner } from '../shared/components/feedback';
import { toast } from '../shared/components/feedback/Toast';
import { confirmAction } from '../shared/components/feedback/ConfirmModal';
import { formatCurrency, getFYOptions } from '../shared/utils';
import { useExpenses } from '../features/expenses/hooks/useExpenses';
import {
  CATEGORY_NAMES,
  saveExpense,
  deleteExpense,
  exportExpensesToCSV,
} from '../features/expenses/services/expenseService';
import { ExpenseModal } from '../features/expenses/components/ExpenseModal';
import { Expense, ExpenseFormData } from '../features/expenses/types';

export const ExpensesPage: React.FC = () => {
  const {
    expenses,
    unassignedExpenses,
    ownerProfile,
    loadExpenses,
    assignUnassigned,
  } = useExpenses();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [fyFilter, setFyFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [viewExpense, setViewExpense] = useState<Expense | null>(null);

  const fyOptions = getFYOptions();

  useEffect(() => {
    if (fyOptions[0]) setFyFilter(fyOptions[0].value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter logic
  const filtered = useMemo(() => {
    return expenses.filter((exp) => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !(exp.description || '').toLowerCase().includes(q) &&
          !(exp.vendorName || '').toLowerCase().includes(q) &&
          !(exp.invoiceNo || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all') {
        // Special case for 'others' tab if clicked
        if (categoryFilter === 'others') {
          const topCats = CATEGORY_NAMES.slice(0, 4);
          if (topCats.includes(exp.category)) return false;
        } else if (exp.category !== categoryFilter) {
          return false;
        }
      }

      // Fiscal Year Filter
      if (fyFilter) {
        const fy = fyOptions.find((f) => f.value === fyFilter);
        if (fy && exp.date) {
          if (exp.date < fy.from || exp.date > fy.to) return false;
        }
      }

      return true;
    });
  }, [expenses, search, categoryFilter, fyFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    return filtered.reduce(
      (acc, exp) => {
        return {
          amount: acc.amount + (exp.amount || 0),
          gst: acc.gst + (exp.gstAmount || 0),
        };
      },
      { amount: 0, gst: 0 }
    );
  }, [filtered]);

  // Indian styled currency formatting (e.g. ₹ 1,90,570.00)
  const formatIndianCurrency = (num: number) => {
    const parts = num.toFixed(2).split('.');
    let lastThree = parts[0].slice(-3);
    const otherParts = parts[0].slice(0, -3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `₹ ${formattedInt}.${parts[1]}`;
  };

  const openAdd = () => {
    setSelectedExpense(null);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (exp: Expense) => {
    setSelectedExpense(exp);
    setEditingId(exp.id || null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedExpense(null);
  };

  const handleSave = async (form: ExpenseFormData) => {
    if (!form.description.trim()) {
      toast('Description is required', 'warning');
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast('Enter a valid amount', 'warning');
      return;
    }
    try {
      const expense: Partial<Expense> = {
        ...(editingId ? { id: editingId } : {}),
        date: form.date,
        description: form.description.trim(),
        category: form.category,
        amount: parseFloat(form.amount),
        gstAmount: form.gstAmount ? parseFloat(String(form.gstAmount)) : 0,
        gstPercent: form.gstPercent ? parseFloat(String(form.gstPercent)) : 0,
        vendorName: form.vendorName.trim(),
        vendorGstin: form.vendorGstin.trim(),
        invoiceNo: form.invoiceNo.trim(),
        paymentMode: form.paymentMode,
        interstate: !!form.interstate,
        note: form.note.trim(),
        ownerGstin: ownerProfile?.gstin || '',
        ownerName: ownerProfile?.businessName || '',
      };
      await saveExpense(expense);
      toast(editingId ? 'Expense updated' : 'Expense added', 'success');
      closeForm();
      loadExpenses();
    } catch {
      toast('Failed to save expense', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (
      await confirmAction({
        title: 'Delete this expense?',
        message:
          'The row is removed from your expense ledger. Any GST ITC claimed against this bill in past returns stays as filed.',
        confirmLabel: 'Delete',
        tone: 'danger',
      })
    ) {
      try {
        await deleteExpense(id);
        toast('Expense deleted', 'success');
        loadExpenses();
      } catch {
        toast('Failed to delete', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      await confirmAction({
        title: `Delete ${selectedIds.size} selected expense${selectedIds.size !== 1 ? 's' : ''}?`,
        message: 'These rows will be removed from your expense ledger.',
        confirmLabel: 'Delete Selected',
        tone: 'danger',
      })
    ) {
      let count = 0;
      for (const id of Array.from(selectedIds)) {
        await deleteExpense(id);
        count++;
      }
      toast(`Deleted ${count} expense${count !== 1 ? 's' : ''}`, 'success');
      setSelectedIds(new Set());
      loadExpenses();
    }
  };

  const handleBulkExportCSV = () => {
    const selectedExpenses = filtered.filter((exp) => exp.id && selectedIds.has(exp.id));
    if (selectedExpenses.length === 0) {
      toast('No expenses selected to export', 'warning');
      return;
    }
    const csvContent = exportExpensesToCSV(selectedExpenses);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected_expenses_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${selectedExpenses.length} expenses to CSV`, 'success');
  };

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast('No expenses to export', 'warning');
      return;
    }
    const csvContent = exportExpensesToCSV(filtered);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast('Expenses CSV downloaded', 'success');
  };

  // Row Selection configuration for Ant Design Table
  const rowSelection = {
    selectedRowKeys: Array.from(selectedIds),
    onChange: (keys: React.Key[]) => {
      setSelectedIds(new Set(keys.map(k => String(k))));
    }
  };

  // Ant Design Table Columns for Expense register
  const columns = [
    {
      title: (
        <div className="flex items-center gap-1.5 cursor-pointer text-[#475569] font-semibold text-[13px]">
          Amount
          <ArrowUpDown size={13} className="text-slate-400" />
          <Filter size={12} className="text-slate-400" />
        </div>
      ),
      key: 'amount',
      width: '18%',
      render: (_: any, exp: Expense) => (
        <span className="font-bold text-[#1e293b] text-[14px]">
          {formatIndianCurrency(exp.amount || 0)}
        </span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-1.5 cursor-pointer text-[#475569] font-semibold text-[13px]">
          Category
          <Filter size={12} className="text-slate-400" />
        </div>
      ),
      dataIndex: 'category',
      key: 'category',
      width: '18%',
      render: (cat: string) => (
        <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider border border-slate-200/40 dark:border-slate-700/40">
          {cat || 'Expense'}
        </span>
      ),
    },
    {
      title: <span className="text-[#475569] font-semibold text-[13px]">Description</span>,
      key: 'description',
      width: '32%',
      render: (_: any, exp: Expense) => (
        <div className="flex flex-col py-0.5">
          <span className="font-semibold text-[#1e293b] text-[13px]">
            {exp.description || '—'}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-slate-400 font-normal">
              {exp.vendorName ? `Vendor: ${exp.vendorName}` : 'No Vendor Details'}
            </span>
            {exp.vendorGstin && (
              <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 font-bold px-1.5 py-0.2 rounded-xs">
                GST: {exp.vendorGstin}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-1.5 cursor-pointer text-[#475569] font-semibold text-[13px]">
          Date <span className="text-[10px] text-slate-400 font-normal ml-0.5">ITC Claim</span>
          <ArrowUpDown size={13} className="text-slate-400" />
        </div>
      ),
      key: 'date',
      width: '18%',
      render: (_: any, exp: Expense) => {
        const displayDate = exp.date
          ? new Date(exp.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—';
        return (
          <div className="flex flex-col py-0.5 text-[13px]">
            <span className="font-medium text-[#334155]">{displayDate}</span>
            {exp.gstAmount && exp.gstAmount > 0 ? (
              <span className="text-[11px] text-emerald-600 font-semibold">
                ITC: {formatIndianCurrency(exp.gstAmount)}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-normal">No ITC Claim</span>
            )}
          </div>
        );
      }
    },
    {
      title: '',
      key: 'actions',
      width: '14%',
      align: 'right' as const,
      render: (_: any, exp: Expense) => {
        const actionMenuItems = [
          { key: 'edit', label: 'Edit' },
          { key: 'delete', label: 'Delete', danger: true },
        ];

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button 
              size="small" 
              className="flex items-center gap-1 text-[11px] font-medium text-purple-700 border-purple-200 hover:border-purple-400 hover:text-purple-800 bg-purple-50/40 rounded px-2.5 py-0.5 h-7 transition-all cursor-pointer"
              onClick={() => setViewExpense(exp)}
            >
              <Eye size={12} />
              View
            </Button>
            <Dropdown 
              menu={{ 
                items: actionMenuItems,
                onClick: ({ key }) => {
                  if (key === 'edit') {
                    openEdit(exp);
                  } else if (key === 'delete' && exp.id) {
                    handleDelete(exp.id);
                  }
                }
              }} 
              trigger={['click']}
            >
              <Button 
                type="text" 
                size="small" 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center p-1 rounded transition-colors cursor-pointer"
              >
                <MoreHorizontal size={16} />
              </Button>
            </Dropdown>
          </div>
        );
      }
    }
  ];

  const batchActions = {
    items: [
      { key: 'export', label: 'Export Selected to CSV' },
      { key: 'delete', label: 'Delete Selected', danger: true }
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'export') {
        handleBulkExportCSV();
      } else if (key === 'delete') {
        handleBulkDelete();
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative font-sans">
      
      {/* 2. Page Header and Main CTA Block */}
      <div className="bg-white px-6 pt-5 pb-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side Title with Pink Play Indicator */}
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-slate-800 m-0 flex items-center gap-2.5 tracking-tight">
            Expenses
            <button 
              type="button"
              className="w-5.5 h-5.5 rounded-full bg-[#f43f5e] flex items-center justify-center border-0 shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="Watch tutorial"
              onClick={() => {
                Modal.info({
                  title: 'Tracking Business Expenses & ITC',
                  content: (
                    <div className="space-y-2 text-sm text-slate-600 leading-relaxed pt-2">
                      <p><strong>Expense Tracker</strong> simplifies logging business expenses and computing eligible Input Tax Credits (ITC).</p>
                      <p>Track rent, utilities, hardware purchases, subscription services, and software tools, exporting easily for P&L calculations.</p>
                    </div>
                  ),
                  okButtonProps: { className: 'bg-blue-600' }
                });
              }}
            >
              <Play size={10} className="fill-white text-white translate-x-0.5" />
            </button>
          </h1>
        </div>

        {/* Right Side Actions Panel */}
        <div className="flex items-center gap-2.5">
          <Button 
            className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 border-slate-200 hover:text-slate-800 hover:border-slate-300 rounded px-3.5 py-1.5 h-9 bg-white cursor-pointer"
            icon={<Download size={14} className="text-slate-500" />}
            onClick={exportCSV}
          >
            Export CSV
          </Button>
          <Button 
            type="primary" 
            className="flex items-center gap-1 font-semibold text-[13px] bg-blue-600 hover:bg-blue-700 border-0 rounded px-4 py-1.5 h-9 text-white shadow-xs cursor-pointer"
            icon={<Plus size={15} className="stroke-[3px]" />}
            onClick={openAdd}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* 3. Horizontal Navigation Tabs matching Quotation category filtering */}
      <div className="bg-white px-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center border-b border-transparent overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            { id: 'all', label: 'All Expenses', badge: expenses.length },
            ...CATEGORY_NAMES.slice(0, 4).map(c => ({ id: c, label: c })),
            ...(CATEGORY_NAMES.length > 4 ? [{ id: 'others', label: 'Others' }] : [])
          ].map((tab) => {
            const isActive = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-4 py-3 text-[13px] font-semibold border-b-2 flex items-center gap-1.5 transition-all relative cursor-pointer ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
                {'badge' in tab && tab.badge !== undefined && (
                  <span className="inline-flex items-center justify-center text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.2 rounded-full min-w-5 h-5 border border-slate-200/50">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Control Row with Search input, Category selector and advanced buttons */}
      <div className="bg-white px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Container */}
        <div className="w-full sm:max-w-md">
          <Input 
            placeholder="Search by description, vendor name, or invoice number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<Search size={14} className="text-slate-400 mr-1" />}
            className="rounded px-3 py-1.5 text-[13px] border-slate-200 hover:border-slate-300 focus:border-blue-500 hover:focus:border-blue-500 hover:focus:shadow-none shadow-none h-9"
            allowClear
          />
        </div>

        {/* Filters Panel */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <AntSelect 
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: 'all', label: 'All Categories' },
              ...CATEGORY_NAMES.map((c) => ({ value: c, label: c })),
            ]}
            className="w-40 h-9"
            classNames={{ popup: { root: "font-sans text-[13px]" } }}
            suffixIcon={<ChevronDown size={14} className="text-slate-400" />}
          />

          <AntSelect 
            value={fyFilter}
            onChange={setFyFilter}
            options={fyOptions.map(fy => ({ value: fy.value, label: fy.label }))}
            className="w-28 h-9"
            classNames={{ popup: { root: "font-sans text-[13px]" } }}
            suffixIcon={<ChevronDown size={14} className="text-slate-400" />}
          />

          <Dropdown menu={batchActions} trigger={['click']}>
            <Button className="flex items-center gap-1 h-9 px-3.5 border-slate-200 hover:border-slate-300 text-slate-700 text-[13px] font-semibold bg-white rounded cursor-pointer">
              Actions
              <ChevronDown size={14} className="text-slate-400" />
            </Button>
          </Dropdown>

          <Button 
            className="flex items-center justify-center w-9 h-9 border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 bg-white rounded p-0 cursor-pointer"
            onClick={() => {
              Modal.info({
                title: 'Advanced Filter Matrix',
                content: 'Further date limits and payment options are automatically configured inside your financial year settings.',
                okButtonProps: { className: 'bg-blue-600' }
              });
            }}
          >
            <SlidersHorizontal size={14} />
          </Button>
        </div>
      </div>

      {/* Unassigned expenses banner warning */}
      <UnassignedBanner
        count={unassignedExpenses.length}
        businessName={ownerProfile?.businessName}
        noun="expense"
        onAssign={assignUnassigned}
      />

      {/* 5. Main Ant Design Expenses Table section with custom card summaries */}
      <div className="flex-1 p-6 pb-24">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <Table 
            rowSelection={rowSelection}
            columns={columns} 
            dataSource={filtered}
            pagination={false}
            rowKey={(record) => record.id || Math.random().toString()}
            locale={{
              emptyText: (
                <div className="py-12 text-center text-slate-400">
                  <span className="text-lg">No expenses matching active filters.</span>
                </div>
              )
            }}
            className="font-sans ant-table-custom"
            rowClassName={(record) => {
              const isUnassigned = !(record as any).ownerGstin;
              return `hover:bg-slate-50/70 transition-colors ${isUnassigned ? 'bg-amber-50/20' : ''}`;
            }}
          />

          {/* Table Summary Footer matching Purchases and Quotations layout exactly */}
          <div className="border-t border-slate-200 px-5 py-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4 select-none">
            {/* Multi-counter badges block */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-md text-[13px] font-semibold text-slate-600">
                <span>Total Expenses</span>
                <span className="text-slate-800 font-bold">{formatIndianCurrency(stats.amount)}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-md text-[13px] font-semibold text-slate-600">
                <span>GST (ITC claimed)</span>
                <span className="text-emerald-700 font-bold">{formatIndianCurrency(stats.gst)}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-md text-[13px] font-semibold text-slate-600">
                <span>Recorded</span>
                <span className="text-blue-700 font-bold">{filtered.length}</span>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-slate-500 font-medium">
                1/1
              </span>
              <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden shadow-2xs">
                <button 
                  type="button" 
                  disabled 
                  className="w-8 h-8 flex items-center justify-center border-0 border-r border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed"
                >
                  <ChevronLeft size={15} />
                </button>
                <button 
                  type="button" 
                  disabled 
                  className="w-8 h-8 flex items-center justify-center border-0 text-slate-300 bg-slate-50 cursor-not-allowed"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Floating green WhatsApp Chat support trigger */}
      <a 
        href="https://wa.me/910000000000" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 text-white transition-all z-40 cursor-pointer"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.501-5.73-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.592 1.97 14.125.946 11.517.945c-5.44 0-9.864 4.373-9.868 9.803-.001 1.714.463 3.39 1.344 4.873l-.997 3.642 3.754-.975zm13.125-7.854c-.114-.19-.414-.304-.86-.527-.447-.223-2.646-1.303-3.048-1.449-.4-.146-.694-.22-.988.22-.294.441-1.139 1.448-1.393 1.739-.254.29-.508.326-.955.103-.447-.223-1.888-.696-3.597-2.216-1.33-1.183-2.228-2.643-2.49-3.09-.26-.447-.028-.688.196-.91.2-.2.447-.522.67-.783.223-.261.298-.448.447-.746.149-.299.075-.559-.037-.783-.112-.223-.988-2.378-1.354-3.261-.357-.86-.719-.743-.988-.743-.255-.001-.548-.001-.84-.001-.294 0-.77.11-1.173.551-.403.441-1.536 1.501-1.536 3.659s1.571 4.241 1.79 4.532c.22.29 3.1 4.73 7.505 6.632 1.048.452 1.868.721 2.506.924 1.052.333 2.01.286 2.766.173.843-.127 2.646-1.079 3.022-2.124.377-1.045.377-1.942.264-2.124z"/>
        </svg>
      </a>

      {/* 7. Site Branding Footer with secure lock representation */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 mt-auto text-center flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600 fill-current">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          <span className="text-base font-black text-slate-800 tracking-tight lowercase flex items-center">
            swipe
            <span className="text-[9px] font-semibold text-slate-400 ml-0.5 align-super">®</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-normal flex flex-wrap items-center justify-center gap-1">
          <span>©2026 NextSpeed Technologies Private Limited. All rights reserved.</span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <Lock size={11} className="text-slate-400" />
            Data is secured via 'bank-grade' security
          </span>
        </div>
      </footer>

      {/* Expense Creator/Edit form Modal */}
      <ExpenseModal
        show={showForm}
        onClose={closeForm}
        onSave={handleSave}
        editingId={editingId}
        expense={selectedExpense}
      />

      {/* Expense quick view details overlay modal */}
      {viewExpense && (() => {
        const exp = viewExpense;
        return (
          <Modal
            open={!!viewExpense}
            onCancel={() => setViewExpense(null)}
            title={`Expense Details · ${exp.invoiceNo || 'No Bill No'}`}
            footer={[
              <Button key="close" onClick={() => setViewExpense(null)}>
                Close
              </Button>,
              <Button key="edit" type="dashed" className="border-amber-200 text-amber-700 hover:border-amber-400" onClick={() => { openEdit(exp); setViewExpense(null); }}>
                Edit
              </Button>
            ]}
            width={600}
            className="font-sans font-medium"
          >
            <div className="py-2 space-y-4">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>
                  {exp.date
                    ? new Date(exp.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : ''}
                </span>
                <span>•</span>
                <span className="font-semibold text-blue-600 uppercase">{exp.category || 'Expense'}</span>
                <span>•</span>
                <span className="text-slate-500 font-normal">
                  {exp.paymentMode || 'Cash'}
                </span>
              </div>

              {/* Vendor & Details Block */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-md p-4 space-y-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Description</span>
                  <span className="text-sm font-bold text-slate-800">{exp.description}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Vendor Name</span>
                    <span className="text-xs font-semibold text-slate-700">{exp.vendorName || '—'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Vendor GSTIN</span>
                    <span className="text-xs font-semibold text-slate-700">{exp.vendorGstin || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Amount Math block */}
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Calculated Totals</span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-sm">
                    ITC: {exp.gstPercent || 0}% ({exp.interstate ? 'IGST' : 'CGST+SGST'})
                  </span>
                </div>
                <div className="p-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Taxable Base Value</span>
                    <span className="font-semibold text-slate-800">{formatCurrency((exp.amount || 0) - (exp.gstAmount || 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Input Tax Credit (ITC)</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(exp.gstAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2.5 font-bold text-sm text-slate-800">
                    <span>Grand Total Spent</span>
                    <span className="text-blue-600">{formatCurrency(exp.amount || 0)}</span>
                  </div>
                </div>
              </div>

              {exp.note && (
                <div className="text-[11px] text-slate-400 italic bg-amber-50/25 p-2.5 rounded-md border border-amber-100/40">
                  Note: {exp.note}
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

    </div>
  );
};

export default ExpensesPage;
