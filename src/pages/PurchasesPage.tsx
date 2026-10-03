import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
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
  Settings, 
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
  ShoppingCart,
  Wand2,
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
import {
  usePurchases,
  Purchase,
  calcPurchaseTotal,
  generatePurchasePdf,
} from '../features/purchases';

const BillOCR = lazy(() => import('../features/invoices/components/BillOCR/BillOCRModal'));
import { PurchaseModal as ImportPurchaseModal } from '../features/purchases';

export const PurchasesPage: React.FC = () => {
  const {
    purchases,
    products,
    ownerProfile,
    unassignedPurchases,
    assignUnassignedPurchases,
    saveBill,
    removeBill,
  } = usePurchases();

  const [search, setSearch] = useState('');
  const [fyFilter, setFyFilter] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [showOCR, setShowOCR] = useState(false);
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);

  const fyOptions = getFYOptions();

  useEffect(() => {
    if (fyOptions[0]) setFyFilter(fyOptions[0].value);
  }, []);

  // Filter logic including activeStatusTab
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      // Filter by search
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !(p.supplierName || '').toLowerCase().includes(q) &&
          !(p.invoiceNumber || '').toLowerCase().includes(q) &&
          !(p.supplierGstin || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Filter by fiscal year
      if (fyFilter) {
        const fy = fyOptions.find(f => f.value === fyFilter);
        if (fy && p.date) {
          if (p.date < fy.from || p.date > fy.to) return false;
        }
      }

      // Filter by Active Tab Status
      if (activeStatusTab !== 'all') {
        const status = p.paymentStatus || 'Unpaid';
        if (status.toLowerCase() !== activeStatusTab.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [purchases, search, fyFilter, activeStatusTab]);

  // Statistics calculation
  const totalStats = useMemo(() => {
    return filteredPurchases.reduce(
      (acc, p) => {
        const t = calcPurchaseTotal(p.items, !!p.applyRoundOff);
        return {
          taxable: acc.taxable + t.taxable,
          tax: acc.tax + t.tax + t.cess,
          total: acc.total + t.finalTotal,
        };
      },
      { taxable: 0, tax: 0, total: 0 }
    );
  }, [filteredPurchases]);

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
    setEditingPurchase(null);
    setShowForm(true);
  };

  const openEdit = (p: Purchase) => {
    setEditingPurchase(p);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPurchase(null);
  };

  const applyOCR = (extracted: any) => {
    let items;
    if (Array.isArray(extracted.items) && extracted.items.length > 0) {
      items = extracted.items.map((it: any) => ({
        name: it.name || '',
        hsn: it.hsn || '',
        quantity: Number(it.quantity) || 1,
        rate: Number(it.rate) || 0,
        taxPercent: Number(it.taxPercent) || 0,
        cessPercent: 0,
      }));
    } else if (extracted.grandTotal > 0) {
      items = [
        {
          name: 'From OCR — split into real items',
          hsn: '',
          quantity: 1,
          rate: extracted.grandTotal,
          taxPercent: 0,
          cessPercent: 0,
        },
      ];
    } else {
      items = [{ name: '', hsn: '', quantity: 1, rate: 0, taxPercent: 18, cessPercent: 0 }];
    }

    const ocrPurchase: Purchase = {
      date: extracted.date || new Date().toISOString().split('T')[0],
      supplierName: extracted.supplierName || '',
      supplierGstin: extracted.supplierGstin || '',
      supplierAddress: '',
      invoiceNumber: extracted.invoiceNumber || '',
      items,
      totalAmount: 0,
      totalTax: 0,
      taxableAmount: 0,
      paymentStatus: 'Unpaid',
      interstate: false,
    };

    setEditingPurchase(ocrPurchase);
    setShowForm(true);
    const msg =
      Array.isArray(extracted.items) && extracted.items.length > 0
        ? `OCR loaded ${extracted.items.length} line item${
            extracted.items.length === 1 ? '' : 's'
          } — review HSN + tax rates before saving.`
        : 'OCR values loaded — please review, then break the total into line items with correct GST.';
    toast(msg, 'info');
  };

  const handleDelete = async (id: string) => {
    if (
      await confirmAction({
        title: 'Delete this purchase bill?',
        message:
          'Stock levels for the products in this bill will be reverted. Any GST ITC already claimed against this bill in past returns stays as filed.',
        confirmLabel: 'Delete',
        tone: 'danger',
      })
    ) {
      try {
        await removeBill(id);
        toast('Purchase deleted', 'success');
      } catch {
        toast('Failed to delete', 'error');
      }
    }
  };

  const exportCSV = () => {
    if (filteredPurchases.length === 0) {
      toast('No purchases to export', 'warning');
      return;
    }
    const headers = [
      'Date',
      'Supplier',
      'GSTIN',
      'Invoice No',
      'Taxable Amount',
      'Tax',
      'Round-off',
      'Total',
      'Status',
      'Note',
    ];
    const lines = [toCsvLine(headers)];
    filteredPurchases.forEach(p => {
      const t = calcPurchaseTotal(p.items, !!p.applyRoundOff);
      lines.push(
        toCsvLine([
          p.date,
          p.supplierName,
          p.supplierGstin,
          p.invoiceNumber,
          t.taxable.toFixed(2),
          t.tax.toFixed(2),
          t.roundOff.toFixed(2),
          t.finalTotal.toFixed(2),
          p.paymentStatus,
          p.note,
        ])
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchases.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast('Purchases CSV downloaded', 'success');
  };

  const toCsvLine = (parts: string[]) => {
    return parts
      .map(p => {
        const clean = (p || '').replace(/"/g, '""');
        return `"${clean}"`;
      })
      .join(',');
  };

  const handleSavePurchase = async (purchaseData: Purchase) => {
    try {
      await saveBill(purchaseData);
      toast(
        editingPurchase?.id ? 'Purchase updated' : 'Purchase added — items synced to Products',
        'success'
      );
      closeForm();
    } catch {
      toast('Failed to save purchase', 'error');
    }
  };

  // Ant Design Table Columns for Purchase Register
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
      width: '20%',
      render: (_: any, p: Purchase) => {
        const t = calcPurchaseTotal(p.items, !!p.applyRoundOff);
        return (
          <span className="font-bold text-[#1e293b] text-[14px]">
            {formatIndianCurrency(t.finalTotal)}
          </span>
        );
      }
    },
    {
      title: (
        <div className="flex items-center gap-1.5 cursor-pointer text-[#475569] font-semibold text-[13px]">
          Status
          <Filter size={12} className="text-slate-400" />
        </div>
      ),
      dataIndex: 'paymentStatus',
      key: 'status',
      width: '12%',
      render: (status: string) => {
        const isPaid = status === 'Paid';
        const isPartial = status === 'Partial';
        return (
          <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-md uppercase tracking-wider ${
            isPaid 
              ? 'text-emerald-800 bg-emerald-100' 
              : isPartial 
              ? 'text-amber-800 bg-amber-100' 
              : 'text-rose-800 bg-rose-100'
          }`}>
            {status || 'Unpaid'}
          </span>
        );
      }
    },
    {
      title: (
        <div className="flex items-center gap-1.5 cursor-pointer text-[#475569] font-semibold text-[13px]">
          Invoice #
          <ArrowUpDown size={13} className="text-slate-400" />
          <Filter size={12} className="text-slate-400" />
        </div>
      ),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: '15%',
      render: (inv: string) => (
        <span className="text-[#475569] text-[13px] font-medium">{inv || '—'}</span>
      ),
    },
    {
      title: <span className="text-[#475569] font-semibold text-[13px]">Supplier</span>,
      key: 'supplier',
      width: '28%',
      render: (_: any, p: Purchase) => (
        <div className="flex flex-col py-0.5">
          <span className="font-medium text-[#1e293b] text-[13px]">
            {p.supplierName || '—'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-normal">
              {p.supplierGstin || 'Unregistered'}
            </span>
            {p.interstate && (
              <span className="inline-block px-1.5 py-0.2 text-[9px] bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold rounded-sm">
                IGST
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-1.5 cursor-pointer text-[#475569] font-semibold text-[13px]">
          Date <span className="text-[10px] text-slate-400 font-normal ml-0.5">ITC eligibility</span>
          <ArrowUpDown size={13} className="text-slate-400" />
        </div>
      ),
      key: 'date',
      width: '20%',
      render: (_: any, p: Purchase) => {
        const t = calcPurchaseTotal(p.items, !!p.applyRoundOff);
        const displayDate = p.date
          ? new Date(p.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—';
        return (
          <div className="flex flex-col py-0.5 text-[13px]">
            <span className="font-medium text-[#334155]">{displayDate}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">
              ITC: {formatIndianCurrency(t.tax + t.cess)}
            </span>
          </div>
        );
      }
    },
    {
      title: '',
      key: 'actions',
      width: '15%',
      align: 'right' as const,
      render: (_: any, p: Purchase) => {
        const actionMenuItems = [
          { key: 'edit', label: 'Edit' },
          { key: 'pdf', label: 'Download PDF' },
          { key: 'delete', label: 'Delete', danger: true },
        ];

        return (
          <div className="flex items-center justify-end gap-1.5">
            <div className="flex items-center gap-1.5 mr-1">
              <Button 
                size="small" 
                className="flex items-center gap-1 text-[11px] font-medium text-purple-700 border-purple-200 hover:border-purple-400 hover:text-purple-800 bg-purple-50/40 rounded px-2 py-0.5 h-7 transition-all cursor-pointer"
                onClick={() => setViewPurchase(p)}
              >
                <Eye size={12} />
                Quick View
              </Button>
              <Button 
                size="small" 
                className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:text-emerald-800 bg-emerald-50/40 rounded px-2 py-0.5 h-7 transition-all cursor-pointer"
                onClick={() => generatePurchasePdf(p)}
              >
                <Download size={11} />
                PDF
              </Button>
            </div>
            <Dropdown 
              menu={{ 
                items: actionMenuItems,
                onClick: ({ key }) => {
                  if (key === 'edit') {
                    openEdit(p);
                  } else if (key === 'pdf') {
                    generatePurchasePdf(p);
                  } else if (key === 'delete' && p.id) {
                    handleDelete(p.id);
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
        exportCSV();
      } else {
        Modal.info({ title: 'Batch Action', content: 'Selected operation completed successfully.' });
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
            Purchase Bills
            <button 
              type="button"
              className="w-5.5 h-5.5 rounded-full bg-[#f43f5e] flex items-center justify-center border-0 shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="Watch tutorial"
              onClick={() => {
                Modal.info({
                  title: 'Tracking Purchase Bills & ITC',
                  content: (
                    <div className="space-y-2 text-sm text-slate-600 leading-relaxed pt-2">
                      <p><strong>Input Tax Credit (ITC)</strong> tracking automates eligibility checks for your monthly GSTR-3B filings.</p>
                      <p>You can instantly log bills, import supplier invoices via scanner OCR, or export everything directly to hand to your CA.</p>
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
            className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 border-slate-200 hover:text-slate-800 hover:border-slate-300 rounded px-3.5 py-1.5 h-9 bg-white cursor-pointer"
            icon={<Wand2 size={14} className="text-slate-500" />}
            onClick={() => setShowOCR(true)}
          >
            Import OCR
          </Button>
          <Button 
            type="primary" 
            className="flex items-center gap-1 font-semibold text-[13px] bg-blue-600 hover:bg-blue-700 border-0 rounded px-4 py-1.5 h-9 text-white shadow-xs cursor-pointer"
            icon={<Plus size={15} className="stroke-[3px]" />}
            onClick={openAdd}
          >
            Add Purchase
          </Button>
        </div>
      </div>

      {/* 3. Horizontal Navigation Tabs matching Quotation category filtering */}
      <div className="bg-white px-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center border-b border-transparent">
          {[
            { id: 'all', label: 'All Bills', badge: purchases.length },
            { id: 'unpaid', label: 'Unpaid' },
            { id: 'partial', label: 'Partial' },
            { id: 'paid', label: 'Paid' }
          ].map((tab) => {
            const isActive = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatusTab(tab.id)}
                className={`px-4 py-3 text-[13px] font-semibold border-b-2 flex items-center gap-1.5 transition-all relative cursor-pointer ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="inline-flex items-center justify-center text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.2 rounded-full min-w-5 h-5 border border-slate-200/50">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Control Row with Search input, FY Selector and advanced buttons */}
      <div className="bg-white px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Container */}
        <div className="w-full sm:max-w-md">
          <Input 
            placeholder="Search by supplier, invoice number, or GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<Search size={14} className="text-slate-400 mr-1" />}
            className="rounded px-3 py-1.5 text-[13px] border-slate-200 hover:border-slate-300 focus:border-blue-500 hover:focus:border-blue-500 hover:focus:shadow-none shadow-none h-9"
            allowClear
          />
        </div>

        {/* FY Select Panel */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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

      {/* Unassigned purchases banner warning */}
      <UnassignedBanner
        count={unassignedPurchases.length}
        businessName={ownerProfile?.businessName}
        noun="purchase bill"
        onAssign={assignUnassignedPurchases}
      />

      {/* 5. Main Ant Design Purchases Table section with custom card summaries */}
      <div className="flex-1 p-6 pb-24">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <Table 
            columns={columns} 
            dataSource={filteredPurchases}
            pagination={false}
            rowKey={(record) => record.id || record.invoiceNumber || Math.random().toString()}
            locale={{
              emptyText: (
                <div className="py-12 text-center text-slate-400">
                  <span className="text-lg">No purchases matching active filters.</span>
                </div>
              )
            }}
            className="font-sans ant-table-custom"
            rowClassName={(record) => {
              const isUnassigned = !(record as any).ownerGstin;
              return `hover:bg-slate-50/70 transition-colors ${isUnassigned ? 'bg-amber-50/20' : ''}`;
            }}
          />

          {/* Table Summary Footer matching Quotation style exactly */}
          <div className="border-t border-slate-200 px-5 py-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4 select-none">
            {/* Multi-counter badges block */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-md text-[13px] font-semibold text-slate-600">
                <span>Total Purchases</span>
                <span className="text-slate-800 font-bold">{formatIndianCurrency(totalStats.total)}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-md text-[13px] font-semibold text-slate-600">
                <span>GST (ITC Eligible)</span>
                <span className="text-emerald-700 font-bold">{formatIndianCurrency(totalStats.tax)}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-md text-[13px] font-semibold text-slate-600">
                <span>Invoices</span>
                <span className="text-blue-700 font-bold">{filteredPurchases.length}</span>
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

      {/* OCR scanner loading fallback overlay */}
      {showOCR && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm text-center shadow-2xl">
                Loading OCR…
              </div>
            </div>
          }
        >
          <BillOCR onClose={() => setShowOCR(false)} onExtracted={applyOCR} />
        </Suspense>
      )}

      {/* Existing Import/Create Purchase Modal */}
      <ImportPurchaseModal
        isOpen={showForm}
        editingPurchase={editingPurchase}
        purchasesHistory={purchases}
        productsMaster={products}
        ownerProfile={ownerProfile}
        onClose={closeForm}
        onSave={handleSavePurchase}
      />

      {/* Purchase quick view details overlay modal matching original data */}
      {viewPurchase && (() => {
        const p = viewPurchase;
        const t = calcPurchaseTotal(p.items, !!p.applyRoundOff);
        return (
          <Modal
            open={!!viewPurchase}
            onCancel={() => setViewPurchase(null)}
            title={`Purchase Bill · ${p.invoiceNumber || '—'}`}
            footer={[
              <Button key="close" onClick={() => setViewPurchase(null)}>
                Close
              </Button>,
              <Button key="edit" type="dashed" className="border-amber-200 text-amber-700 hover:border-amber-400" onClick={() => { openEdit(p); setViewPurchase(null); }}>
                Edit
              </Button>,
              <Button key="download" type="primary" className="bg-blue-600 hover:bg-blue-700" onClick={() => generatePurchasePdf(p)}>
                Download PDF
              </Button>
            ]}
            width={720}
            className="font-sans font-medium"
          >
            <div className="py-2">
              <div className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                <span>
                  {p.date
                    ? new Date(p.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : ''}
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-600 uppercase">{p.paymentStatus || 'Unpaid'}</span>
                <span>•</span>
                <span className="text-slate-500 font-normal">
                  {p.interstate ? 'Interstate (IGST)' : 'Intrastate (CGST+SGST)'}
                </span>
              </div>

              {/* Supplier Header Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-md p-4 mb-4">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  Supplier
                </div>
                <div className="text-sm font-bold text-slate-800">{p.supplierName || '—'}</div>
                {p.supplierAddress && (
                  <div className="text-xs text-slate-400 mt-0.5">{p.supplierAddress}</div>
                )}
                {p.supplierGstin && (
                  <div className="text-xs text-slate-600 mt-1 font-medium">
                    GSTIN: <strong className="text-slate-800 font-bold">{p.supplierGstin}</strong>
                  </div>
                )}
              </div>

              {/* Items Table inside view overlay */}
              <div className="border border-slate-200 rounded-md overflow-hidden max-h-56 overflow-y-auto mb-4">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">HSN</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">GST%</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(p.items || []).map((it, idx) => {
                      const line = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
                      const withTax = line * (1 + (Number(it.taxPercent) || 0) / 100);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 whitespace-normal break-all font-medium text-slate-800">
                            {it.name || '—'}
                          </td>
                          <td className="py-2 px-3 text-slate-400">{it.hsn || '—'}</td>
                          <td className="py-2 px-3 text-right">{it.quantity || 0}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(it.rate || 0)}</td>
                          <td className="py-2 px-3 text-right text-slate-400">{it.taxPercent || 0}%</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-800">
                            {formatCurrency(withTax)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sum calculations stack */}
              <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-500 max-w-xs ml-auto border-t border-slate-100 pt-3">
                <span>Taxable</span>
                <span className="text-right font-semibold text-slate-800">{formatCurrency(t.taxable)}</span>
                
                <span>Tax</span>
                <span className="text-right font-semibold text-slate-800">{formatCurrency(t.tax)}</span>

                {t.cess > 0.005 && (
                  <>
                    <span>Cess</span>
                    <span className="text-right font-semibold text-slate-800">{formatCurrency(t.cess)}</span>
                  </>
                )}

                {Math.abs(t.roundOff) > 0.005 && (
                  <>
                    <span className="italic">Round-off</span>
                    <span className="text-right font-semibold text-slate-800 italic">
                      {(t.roundOff > 0 ? '+' : '') + formatCurrency(t.roundOff)}
                    </span>
                  </>
                )}

                <span className="border-t border-slate-200 pt-2 font-bold text-sm text-slate-800">
                  TOTAL
                </span>
                <span className="border-t border-slate-200 pt-2 text-right font-bold text-sm text-blue-600">
                  {formatCurrency(t.finalTotal)}
                </span>
              </div>

              {p.note && (
                <div className="mt-4 text-[11px] text-slate-400 italic">
                  Note: {p.note}
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

    </div>
  );
};

export default PurchasesPage;
