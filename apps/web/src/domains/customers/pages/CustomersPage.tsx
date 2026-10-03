import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Button, 
  Dropdown, 
  Modal, 
  Select as AntSelect, 
  Input as AntInput 
} from 'antd';
import {
  Users,
  Search,
  Upload,
  Download,
  Plus,
  Trash2,
  CheckSquare,
  AlertCircle,
  Coins,
  Play,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Lock,
  ChevronDown
} from 'lucide-react';
import { confirmAction } from '@/shared/components/feedback/ConfirmModal';
import { toast } from '@/shared/components/feedback/Toast';
import { formatCurrency } from '@/shared/utils';
import { Client, ClientFormData } from '@/features/clients/types';
import {
  useCustomers,
  saveCustomerRecord,
  deleteCustomerRecord,
  deleteBillRecord,
  importCustomersFromCSV,
} from '../hooks/useCustomers';
import { CustomerModal } from '../components/CustomerModal';
import { CustomersTable } from '../components/CustomersTable';
import {
  generateClientStatement,
  generateAgingReport,
} from '../components/CustomerLedgerModal';

export interface CustomersPageProps {
  onEdit?: (bill: any) => void;
  onDuplicate?: (bill: any) => void;
  onNew?: () => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onEdit }) => {
  const {
    clients,
    bills,
    profileCountry,
    profileForStatement,
    loadData,
    getClientBills,
    getClientStats,
    getClientAging,
  } = useCustomers();

  const [activeTab, setActiveTab] = useState<'all' | 'groups' | 'deleted'>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [modalClient, setModalClient] = useState<Client | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [rowActionMenu, setRowActionMenu] = useState<{
    clientName: string;
    savedClient?: Client;
    isExpanded: boolean;
    rect: { top: number; right: number; bottom: number; left: number };
  } | null>(null);

  useEffect(() => {
    if (!rowActionMenu) return;
    const handleDismiss = () => setRowActionMenu(null);
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    return () => {
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [rowActionMenu]);

  const [sortField, setSortField] = useState<'balance' | 'name'>('balance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleClientStatement = async (clientName: string) => {
    const clientBills = getClientBills(clientName);
    const stats = getClientStats(clientName);
    await generateClientStatement(clientName, clientBills, clients, stats, profileForStatement);
  };

  const handleAgingReport = async (clientName: string) => {
    const agingResult = getClientAging(clientName);
    await generateAgingReport(clientName, agingResult, profileForStatement);
  };

  const allClientNames = useMemo(
    () =>
      Array.from(
        new Set([
          ...clients.map((c) => c.name),
          ...bills.map((b) => b.clientName).filter(Boolean),
        ])
      ),
    [clients, bills]
  );

  const customerMetrics = useMemo(() => {
    let totalOutstanding = 0;
    let debtorsCount = 0;
    allClientNames.forEach((name) => {
      const stats = getClientStats(name);
      if (stats.unpaid > 0) {
        totalOutstanding += stats.unpaid;
        debtorsCount++;
      }
    });
    return {
      totalCount: allClientNames.length,
      savedCount: clients.length,
      totalOutstanding,
      debtorsCount,
    };
  }, [allClientNames, clients, getClientStats]);

  const toggleSelectCustomer = (clientName: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientName)) next.delete(clientName);
      else next.add(clientName);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    if (paginatedClients.every((name) => selectedIds.has(name))) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedClients.forEach((name) => next.delete(name));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedClients.forEach((name) => next.add(name));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      await confirmAction({
        title: `Remove ${selectedIds.size} selected customer${selectedIds.size !== 1 ? 's' : ''}?`,
        message: 'This will remove the selected customers from your directory. Existing invoices remain intact.',
        confirmLabel: 'Remove Selected',
        tone: 'danger',
      })
    ) {
      let count = 0;
      for (const name of Array.from(selectedIds)) {
        const matched = clients.find((c) => c.name === name || c.id === name);
        const targetId = matched?.id || name;
        await deleteCustomerRecord(targetId);
        count++;
      }
      toast(`Removed ${count} customer${count !== 1 ? 's' : ''}`, 'success');
      clearSelection();
      loadData();
    }
  };

  const handleBulkExportCSV = () => {
    const selectedClients = clients.filter((c) => selectedIds.has(c.name));
    if (selectedClients.length === 0) {
      toast('No saved customer records selected to export', 'warning');
      return;
    }
    const headers = ['Name', 'Phone', 'Email', 'GSTIN', 'Address', 'State', 'Opening Balance'];
    const rows = selectedClients.map((c) => [
      `"${c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.gstin || ''}"`,
      `"${c.address || ''}"`,
      `"${c.state || ''}"`,
      (c as any).openingBalance || 0,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `selected_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Exported ${selectedClients.length} customer records to CSV`, 'success');
  };

  const filteredClients = useMemo(() => {
    if (!search.trim()) return allClientNames;
    const q = search.toLowerCase();
    return allClientNames.filter((name) => {
      const saved = clients.find((c) => c.name === name);
      return (
        name.toLowerCase().includes(q) ||
        saved?.phone?.toLowerCase().includes(q) ||
        saved?.email?.toLowerCase().includes(q) ||
        saved?.gstin?.toLowerCase().includes(q) ||
        (saved as any)?.companyName?.toLowerCase().includes(q)
      );
    });
  }, [allClientNames, clients, search]);

  const toggleSort = (field: 'balance' | 'name') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      if (sortField === 'name') {
        const comp = a.localeCompare(b);
        return sortDirection === 'asc' ? comp : -comp;
      }
      const sa = getClientStats(a);
      const sb = getClientStats(b);
      return sortDirection === 'asc' ? sa.unpaid - sb.unpaid : sb.unpaid - sa.unpaid;
    });
  }, [filteredClients, getClientStats, sortField, sortDirection]);

  const paginatedClients = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedClients.slice(start, start + pageSize);
  }, [sortedClients, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(sortedClients.length / pageSize));

  const handleDeleteClient = async (idOrName: string) => {
    const matched = clients.find(
      (c) => c.id === idOrName || (c.name && c.name.toLowerCase() === idOrName.toLowerCase())
    );
    const targetId = matched?.id || idOrName;

    if (
      await confirmAction({
        title: 'Remove this customer?',
        message:
          'Their existing invoices stay untouched — this only removes them from your saved customers directory.',
        confirmLabel: 'Remove',
        tone: 'danger',
      })
    ) {
      await deleteCustomerRecord(targetId);
      toast('Customer removed', 'success');
      loadData();
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (
      await confirmAction({
        title: 'Delete this invoice?',
        message: 'The invoice will be moved to Trash for 30 days.',
        confirmLabel: 'Delete',
        tone: 'danger',
      })
    ) {
      try {
        await deleteBillRecord(id);
        toast('Invoice deleted', 'success');
        loadData();
      } catch {
        toast('Failed to delete invoice', 'error');
      }
    }
  };

  const openAddClient = (prefill?: Partial<Client>) => {
    setModalClient((prefill as Client) || null);
    setEditingClientId(null);
    setShowForm(true);
  };

  const openEditClient = (client: Client) => {
    setModalClient(client);
    setEditingClientId(client.id || null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setModalClient(null);
    setEditingClientId(null);
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = await importCustomersFromCSV(text);
      if (imported === 0) {
        toast('CSV file is empty or has no valid customer rows', 'warning');
      } else {
        toast(`Imported ${imported} customer${imported !== 1 ? 's' : ''}`, 'success');
        loadData();
      }
    } catch {
      toast('Failed to parse CSV file', 'error');
    }
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const exportCSV = () => {
    if (clients.length === 0) {
      toast('No customer records to export', 'warning');
      return;
    }
    const headers = ['Name', 'Phone', 'Email', 'GSTIN', 'Address', 'State', 'Opening Balance'];
    const rows = clients.map((c) => [
      `"${c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.gstin || ''}"`,
      `"${c.address || ''}"`,
      `"${c.state || ''}"`,
      (c as any).openingBalance || 0,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Customers CSV exported', 'success');
  };

  const handleModalSave = async (formData: ClientFormData) => {
    if (!formData.name.trim()) {
      toast('Customer name is required', 'warning');
      return;
    }
    try {
      const data: Partial<Client> = { ...formData };
      if (editingClientId) data.id = editingClientId;
      await saveCustomerRecord(data);
      toast(editingClientId ? 'Customer updated' : 'Customer added', 'success');
      closeForm();
      loadData();
    } catch {
      toast('Failed to save customer', 'error');
    }
  };

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

  const actionDropdownItems = {
    items: [
      { key: 'import', label: 'Import CSV', icon: <Upload size={14} /> },
      { key: 'export', label: 'Export CSV', icon: <Download size={14} /> }
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'import') {
        csvInputRef.current?.click();
      } else if (key === 'export') {
        exportCSV();
      }
    }
  };

  const bulkDropdownItems = {
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
      {/* Hidden File Input for CSV Import */}
      <input
        type="file"
        accept=".csv"
        ref={csvInputRef}
        style={{ display: 'none' }}
        onChange={handleCSVImport}
      />

      {/* Customer Form Modal */}
      <CustomerModal
        show={showForm}
        onClose={closeForm}
        onSave={handleModalSave}
        client={modalClient}
        isEditing={!!editingClientId}
        defaultCountry={profileCountry}
      />

      {/* 2. Page Header and Main CTA Block */}
      <div className="bg-white px-6 pt-5 pb-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side Title with Pink Play Indicator */}
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-slate-800 m-0 flex items-center gap-2.5 tracking-tight">
            Customers
            <button 
              type="button"
              className="w-5.5 h-5.5 rounded-full bg-[#f43f5e] flex items-center justify-center border-0 shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="Watch tutorial"
              onClick={() => {
                Modal.info({
                  title: 'Managing Customers & Receivables',
                  content: (
                    <div className="space-y-2 text-sm text-slate-600 leading-relaxed pt-2">
                      <p><strong>Customer Ledgers</strong> simplify tracking invoices, unpaid balances, and calculating aging analysis reports.</p>
                      <p>Maintain precise contact coordinates, share ledger status live over WhatsApp, or export audit files cleanly for tax filings.</p>
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
          <Dropdown menu={actionDropdownItems} trigger={['click']}>
            <Button 
              className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 border-slate-200 hover:text-slate-800 hover:border-slate-300 rounded px-3.5 py-1.5 h-9 bg-white cursor-pointer"
              icon={<Download size={14} className="text-slate-500" />}
            >
              CSV Actions
              <ChevronDown size={12} className="text-slate-400" />
            </Button>
          </Dropdown>
          <Button 
            type="primary" 
            className="flex items-center gap-1 font-semibold text-[13px] bg-blue-600 hover:bg-blue-700 border-0 rounded px-4 py-1.5 h-9 text-white shadow-xs cursor-pointer"
            icon={<Plus size={15} className="stroke-[3px]" />}
            onClick={() => openAddClient()}
          >
            New Customer
          </Button>
        </div>
      </div>

      {/* 3. Horizontal Navigation Tabs matching Quotation design */}
      <div className="bg-white px-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center border-b border-transparent">
          {[
            { id: 'all', label: 'All Customers', badge: allClientNames.length },
            { id: 'groups', label: 'Groups' },
            { id: 'deleted', label: 'Deleted' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'all') {
                    setActiveTab('all');
                  } else if (tab.id === 'groups') {
                    toast('Customer Groups feature enabled', 'info');
                  } else {
                    toast('Recycle Bin: No deleted customers pending purge', 'info');
                  }
                }}
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

      {/* 4. Filter Control Row with Search input, Actions dropdown and advanced buttons */}
      <div className="bg-white px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Container */}
        <div className="w-full sm:max-w-md">
          <AntInput 
            placeholder="Search customers by name, company, phone, email, GSTIN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            prefix={<Search size={14} className="text-slate-400 mr-1" />}
            className="rounded px-3 py-1.5 text-[13px] border-slate-200 hover:border-slate-300 focus:border-blue-500 hover:focus:border-blue-500 hover:focus:shadow-none shadow-none h-9"
            allowClear
          />
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {selectedIds.size > 0 && (
            <Dropdown menu={bulkDropdownItems} trigger={['click']}>
              <Button className="flex items-center gap-1 h-9 px-3.5 border-blue-200 hover:border-blue-300 text-blue-700 bg-blue-50/50 text-[13px] font-semibold rounded cursor-pointer">
                Selected ({selectedIds.size})
                <ChevronDown size={14} className="text-blue-400" />
              </Button>
            </Dropdown>
          )}

          <Button 
            className="flex items-center justify-center w-9 h-9 border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 bg-white rounded p-0 cursor-pointer"
            onClick={() => {
              Modal.info({
                title: 'Advanced Filter Matrix',
                content: 'Further state groupings and transaction options are automatically configured inside your bookkeeping workspace settings.',
                okButtonProps: { className: 'bg-blue-600' }
              });
            }}
          >
            <SlidersHorizontal size={14} />
          </Button>
        </div>
      </div>

      {/* 5. Main Customers Table section with custom card summaries */}
      <div className="flex-1 p-6 pb-24">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          {sortedClients.length === 0 ? (
            <div className="p-16 text-center space-y-4 bg-white">
              <Users size={48} className="mx-auto text-slate-300" />
              <div className="text-slate-700 font-semibold text-base">No customers found</div>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                {search ? 'Try adjusting your search query or clear active search input' : 'Start building your directory by adding your first business customer profile'}
              </p>
              <Button
                type="primary"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 border-0 rounded px-4 py-1.5 text-xs font-semibold shadow-xs cursor-pointer"
                icon={<Plus size={14} />}
                onClick={() => openAddClient()}
              >
                New Customer
              </Button>
            </div>
          ) : (
            <CustomersTable
              paginatedClients={paginatedClients}
              clients={clients}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelectCustomer}
              onToggleSelectAll={toggleSelectAllVisible}
              getClientStats={getClientStats}
              getClientBills={getClientBills}
              expandedClient={expandedClient}
              setExpandedClient={setExpandedClient}
              rowActionMenu={rowActionMenu}
              setRowActionMenu={setRowActionMenu}
              sortField={sortField}
              toggleSort={toggleSort}
              handleClientStatement={handleClientStatement}
              handleAgingReport={handleAgingReport}
              handleDeleteClient={handleDeleteClient}
              handleDeleteBill={handleDeleteBill}
              openEditClient={openEditClient}
              openAddClient={openAddClient}
              onEdit={onEdit}
            />
          )}

          {/* Table Summary Footer matching Purchases and Quotations layout exactly */}
          <div className="border-t border-slate-200 px-5 py-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4 select-none">
            {/* Multi-counter badges block */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-md text-[13px] font-semibold text-slate-600">
                <span>Total Customers</span>
                <span className="text-slate-800 font-bold">{customerMetrics.totalCount}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-md text-[13px] font-semibold text-slate-600">
                <span>Receivables Outstanding</span>
                <span className={`${customerMetrics.totalOutstanding > 0 ? 'text-amber-700' : 'text-emerald-700'} font-bold`}>
                  {formatIndianCurrency(customerMetrics.totalOutstanding)}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-md text-[13px] font-semibold text-slate-600">
                <span>Active Ledger Balance</span>
                <span className="text-blue-700 font-bold">{customerMetrics.debtorsCount} account(s)</span>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 ? (
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-slate-500 font-medium">
                  {page}/{totalPages}
                </span>
                <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden shadow-2xs">
                  <button 
                    type="button" 
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={`w-8 h-8 flex items-center justify-center border-0 border-r border-slate-200 text-slate-500 bg-white hover:bg-slate-50 transition-colors ${page === 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button 
                    type="button" 
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={`w-8 h-8 flex items-center justify-center border-0 text-slate-500 bg-white hover:bg-slate-50 transition-colors ${page === totalPages ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            ) : (
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
            )}
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
    </div>
  );
};

export default CustomersPage;
