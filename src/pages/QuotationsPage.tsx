import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Dropdown,
  Space,
  Modal,
  Spin,
  ConfigProvider,
  type MenuProps,
} from 'antd';
import {
  Settings,
  Plus,
  Search,
  Eye,
  Send,
  MoreHorizontal,
  Filter,
  Lock,
  ChevronDown,
  Play,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  FileText,
  Copy,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { getAllBills, deleteBill, getProfile } from '@/store';
import { useTheme } from '@/app/providers/ThemeProvider';
import { getAntdTheme } from '@/shared/components/ui/AntdThemeConfig';
import { DocumentSettingsDrawer } from '@/features/invoices/components/InvoiceEditor/DocumentSettingsDrawer/DocumentSettingsDrawer';
import { LiveDocumentPreviewModal } from '@/features/invoices/components/Print';
import { toast } from '@/shared/components/feedback/Toast';

export interface QuotationItem {
  key: string;
  amount: number;
  status: 'open' | 'closed' | 'partial' | 'cancelled' | 'draft';
  billNumber: string;
  customerName: string;
  customerPhone?: string;
  date: string;
  rawDate: string;
  createdTime: string;
  hasQuickActions?: boolean;
  rawBill: any;
}

export interface QuotationsPageProps {
  onNew?: (type?: string) => void;
  onEdit?: (bill: any) => void;
  setCurrentView?: (view: any) => void;
  onOpenSettingsTab?: (tab: string) => void;
}

// Helpers
function formatIndianCurrency(num: number): string {
  const safeNum = Number(num) || 0;
  const parts = safeNum.toFixed(2).split('.');
  let lastThree = parts[0].slice(-3);
  const otherParts = parts[0].slice(0, -3);
  if (otherParts !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `₹ ${formattedInt}.${parts[1]}`;
}

function formatDateDisplay(dateStr?: string): { date: string; time: string } {
  if (!dateStr) return { date: '—', time: '—' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { date: dateStr, time: '' };
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;

    return {
      date: `${day} ${month} ${year}`,
      time: `${hour12}:${minutes} ${ampm}`,
    };
  } catch {
    return { date: dateStr, time: '' };
  }
}

function normalizeStatus(status?: string): 'open' | 'closed' | 'partial' | 'cancelled' | 'draft' {
  if (!status) return 'open';
  const s = status.toLowerCase();
  if (s === 'paid' || s === 'closed' || s === 'completed') return 'closed';
  if (s === 'partial' || s === 'partially-paid') return 'partial';
  if (s === 'cancelled' || s === 'void') return 'cancelled';
  if (s === 'draft') return 'draft';
  return 'open';
}

function getFinancialYear(dateStr?: string): string {
  if (!dateStr) return 'FY 26-27';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'FY 26-27';
    const month = d.getMonth() + 1; // 1-12
    const year = d.getFullYear();
    if (month >= 4) {
      const nextY = String(year + 1).slice(-2);
      return `FY ${String(year).slice(-2)}-${nextY}`;
    } else {
      const curY = String(year).slice(-2);
      return `FY ${String(year - 1).slice(-2)}-${curY}`;
    }
  } catch {
    return 'FY 26-27';
  }
}

export default function QuotationsPage({
  onNew,
  onEdit,
  setCurrentView,
  onOpenSettingsTab,
}: QuotationsPageProps) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fiscalYear, setFiscalYear] = useState<string>('all');

  const [profile, setProfile] = useState<any>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [viewingQuotation, setViewingQuotation] = useState<any | null>(null);

  const [invoiceOptions, setInvoiceOptions] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('freegstbill_invoiceOptions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Fetch real bills from database and filter for quotations / proformas
  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const allBills = await getAllBills();
      const billsArray = Array.isArray(allBills) ? allBills : [];

      // Filter for quotations, proformas, or estimates
      const quotationBills = billsArray.filter((b) => {
        const type = (b.invoiceType || b.data?.invoiceType || b.type || '').toLowerCase();
        return (
          type === 'quotation' ||
          type === 'proforma' ||
          type === 'estimate' ||
          b.id?.startsWith('EST') ||
          b.id?.startsWith('QTN') ||
          b.invoiceNumber?.startsWith('EST') ||
          b.invoiceNumber?.startsWith('QTN')
        );
      });

      const mapped: QuotationItem[] = quotationBills.map((b) => {
        const d = b.data || {};
        const amount = Number(b.totalAmount || b.total || d.totals?.total || 0);
        const rawDate = b.invoiceDate || d.details?.invoiceDate || b.createdAt || new Date().toISOString();
        const { date, time } = formatDateDisplay(rawDate);
        const customerName =
          b.clientName || d.client?.name || d.details?.customerName || 'Walk-in Customer';
        const customerPhone = d.client?.phone || b.customerPhone || '';
        const billNumber = b.invoiceNumber || b.id || d.details?.invoiceNumber || 'EST-0001';
        const status = normalizeStatus(b.status || d.status);

        return {
          key: b.id || billNumber,
          amount,
          status,
          billNumber,
          customerName,
          customerPhone,
          date,
          rawDate,
          createdTime: time || 'Just now',
          hasQuickActions: true,
          rawBill: b,
        };
      });

      // Sort newest first
      mapped.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

      setQuotations(mapped);
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
      toast.error('Failed to load quotations from database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotations();
    getProfile().then(setProfile).catch(() => {});
  }, [fetchQuotations]);

  // Sync on window focus
  useEffect(() => {
    const handleFocus = () => fetchQuotations();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchQuotations]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = {
      all: quotations.length,
      open: 0,
      closed: 0,
      partial: 0,
      cancelled: 0,
      draft: 0,
    };
    quotations.forEach((q) => {
      if (counts[q.status] !== undefined) {
        counts[q.status]++;
      }
    });
    return counts;
  }, [quotations]);

  // Available FY options
  const fyOptions = useMemo(() => {
    const set = new Set<string>();
    quotations.forEach((q) => {
      set.add(getFinancialYear(q.rawDate));
    });
    set.add('FY 26-27');
    set.add('FY 25-26');
    const list = Array.from(set).map((fy) => ({ value: fy, label: fy }));
    return [{ value: 'all', label: 'All FY' }, ...list];
  }, [quotations]);

  // Filtered data based on Tab, Search, and Fiscal Year
  const filteredData = useMemo(() => {
    return quotations.filter((item) => {
      // Tab filter
      if (activeTab !== 'all' && item.status !== activeTab) {
        return false;
      }
      // FY filter
      if (fiscalYear !== 'all') {
        const itemFY = getFinancialYear(item.rawDate);
        if (itemFY !== fiscalYear) return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = item.customerName.toLowerCase().includes(q);
        const matchesBill = item.billNumber.toLowerCase().includes(q);
        const matchesPhone = item.customerPhone?.toLowerCase().includes(q) || false;
        const matchesAmount = item.amount.toString().includes(q);
        return matchesName || matchesBill || matchesPhone || matchesAmount;
      }
      return true;
    });
  }, [quotations, activeTab, fiscalYear, searchQuery]);

  // Totals calculations
  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredData]);

  const closedAmount = useMemo(() => {
    return filteredData
      .filter((item) => item.status === 'closed')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [filteredData]);

  // Create new quotation handler
  const handleCreateQuotation = () => {
    if (onNew) {
      onNew('proforma');
    } else if (setCurrentView) {
      setCurrentView('new');
    }
  };

  // Convert quotation to tax invoice
  const handleConvertToInvoice = (record: QuotationItem) => {
    if (onEdit) {
      onEdit({
        ...record.rawBill,
        _convertToType: 'tax-invoice',
        _isDuplicate: true,
      });
    } else if (setCurrentView) {
      setCurrentView('new');
    }
  };

  // Duplicate quotation
  const handleDuplicate = (record: QuotationItem) => {
    if (onEdit) {
      onEdit({
        ...record.rawBill,
        id: undefined,
        _isDuplicate: true,
        invoiceNumber: undefined,
      });
    }
  };

  // Delete quotation
  const handleDelete = (record: QuotationItem) => {
    Modal.confirm({
      title: 'Delete Quotation',
      content: `Are you sure you want to delete quotation ${record.billNumber}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteBill(record.rawBill.id || record.billNumber);
          toast.success(`Quotation ${record.billNumber} deleted`);
          fetchQuotations();
        } catch (err) {
          console.error('Failed to delete quotation:', err);
          toast.error('Failed to delete quotation');
        }
      },
    });
  };

  // Quick WhatsApp Share
  const handleSendWhatsApp = (record: QuotationItem) => {
    const pName = record.customerName || 'Customer';
    const amountStr = formatIndianCurrency(record.amount);
    const text = encodeURIComponent(
      `Hello ${pName}, here is your quotation ${record.billNumber} for ${amountStr}. Please let us know if you would like to proceed with this order.`
    );
    const phone = record.customerPhone ? record.customerPhone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Table Columns Setup
  const columns = [
    {
      title: (
        <div className="flex items-center gap-1.5 cursor-pointer text-[#475569] dark:text-neutral-300 font-semibold text-[13px]">
          Amount
          <ArrowUpDown size={13} className="text-slate-400" />
          <Filter size={12} className="text-slate-400" />
        </div>
      ),
      dataIndex: 'amount',
      key: 'amount',
      width: '18%',
      sorter: (a: QuotationItem, b: QuotationItem) => a.amount - b.amount,
      render: (amount: number) => (
        <span className="font-bold text-[#1e293b] dark:text-white text-[14px]">
          {formatIndianCurrency(amount)}
        </span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-1.5 cursor-pointer text-[#475569] dark:text-neutral-300 font-semibold text-[13px]">
          Status
          <Filter size={12} className="text-slate-400" />
        </div>
      ),
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: string) => {
        let badgeStyle = 'text-amber-800 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300';
        if (status === 'closed') {
          badgeStyle = 'text-emerald-800 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300';
        } else if (status === 'partial') {
          badgeStyle = 'text-blue-800 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
        } else if (status === 'cancelled') {
          badgeStyle = 'text-rose-800 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300';
        } else if (status === 'draft') {
          badgeStyle = 'text-gray-800 bg-gray-100 dark:bg-neutral-800 dark:text-neutral-300';
        }
        return (
          <span
            className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-md uppercase tracking-wider ${badgeStyle}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: (
        <div className="flex items-center gap-1.5 cursor-pointer text-[#475569] dark:text-neutral-300 font-semibold text-[13px]">
          Quotation #
          <ArrowUpDown size={13} className="text-slate-400" />
          <Filter size={12} className="text-slate-400" />
        </div>
      ),
      dataIndex: 'billNumber',
      key: 'billNumber',
      width: '16%',
      render: (bill: string, record: QuotationItem) => (
        <button
          type="button"
          onClick={() => {
            if (onEdit) onEdit(record.rawBill);
          }}
          className="text-[#1E61EB] dark:text-blue-400 hover:underline text-[13px] font-semibold text-left cursor-pointer bg-transparent border-none p-0"
        >
          {bill}
        </button>
      ),
    },
    {
      title: (
        <span className="text-[#475569] dark:text-neutral-300 font-semibold text-[13px]">
          Customer
        </span>
      ),
      dataIndex: 'customerName',
      key: 'customerName',
      width: '26%',
      render: (_: string, record: QuotationItem) => (
        <div className="flex flex-col py-0.5">
          <span className="font-semibold text-[#1e293b] dark:text-neutral-100 text-[13px]">
            {record.customerName}
          </span>
          {record.customerPhone && (
            <span className="text-[11px] text-slate-400 dark:text-neutral-400 font-normal">
              {record.customerPhone}
            </span>
          )}
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-1.5 cursor-pointer text-[#475569] dark:text-neutral-300 font-semibold text-[13px]">
          Date{' '}
          <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-normal ml-0.5">
            Created time
          </span>
          <ArrowUpDown size={13} className="text-slate-400" />
        </div>
      ),
      dataIndex: 'date',
      key: 'date',
      width: '16%',
      render: (_: string, record: QuotationItem) => (
        <div className="flex flex-col py-0.5 text-[13px]">
          <span className="font-medium text-[#334155] dark:text-neutral-200">{record.date}</span>
          <span className="text-[11px] text-slate-400 dark:text-neutral-500">{record.createdTime}</span>
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: '12%',
      align: 'right' as const,
      render: (_: any, record: QuotationItem) => {
        const actionMenuItems: MenuProps['items'] = [
          {
            key: 'view',
            label: 'View / Print',
            icon: <Eye size={13} />,
            onClick: () => setViewingQuotation(record.rawBill),
          },
          {
            key: 'edit',
            label: 'Edit Quotation',
            icon: <FileText size={13} />,
            onClick: () => {
              if (onEdit) onEdit(record.rawBill);
            },
          },
          {
            key: 'convert',
            label: 'Convert to Tax Invoice',
            icon: <FileCheck size={13} />,
            onClick: () => handleConvertToInvoice(record),
          },
          {
            key: 'duplicate',
            label: 'Duplicate',
            icon: <Copy size={13} />,
            onClick: () => handleDuplicate(record),
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <Trash2 size={13} />,
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="small"
              className="flex items-center gap-1 text-[11px] font-medium text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:border-purple-400 hover:text-purple-800 bg-purple-50/40 dark:bg-purple-950/30 rounded px-2 py-0.5 h-7 transition-all cursor-pointer"
              onClick={() => setViewingQuotation(record.rawBill)}
            >
              <Eye size={12} />
              View
            </Button>
            <Button
              size="small"
              className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 hover:text-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/30 rounded px-2 py-0.5 h-7 transition-all cursor-pointer"
              onClick={() => handleSendWhatsApp(record)}
            >
              <Send size={11} />
              Send
            </Button>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']} placement="bottomRight">
              <Button
                type="text"
                size="small"
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center justify-center p-1 rounded transition-colors cursor-pointer"
              >
                <MoreHorizontal size={16} />
              </Button>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#141414] relative font-sans transition-colors">
        {/* 1. Main Header and Action Row */}
        <div className="bg-white dark:bg-[#141414] px-6 pt-5 pb-1 border-b border-gray-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white m-0 flex items-center gap-2.5 tracking-tight">
              Quotations & Estimates
              <button
                type="button"
                className="w-5.5 h-5.5 rounded-full bg-[#f43f5e] flex items-center justify-center border-0 shadow-xs active:scale-95 transition-transform cursor-pointer"
                title="Watch tutorial"
                onClick={() => {
                  Modal.info({
                    title: 'How to use Quotations',
                    content:
                      'Quotations help you send price estimates and business proposals to clients. Once approved, you can instantly convert them into Tax Invoices with a single click.',
                    okButtonProps: { className: 'bg-blue-600' },
                  });
                }}
              >
                <Play size={10} className="fill-white text-white translate-x-0.5" />
              </button>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 dark:text-neutral-300 border-slate-200 dark:border-neutral-700 hover:text-slate-800 dark:hover:text-white rounded px-3.5 py-1.5 h-9 bg-white dark:bg-neutral-800 cursor-pointer"
              icon={<Settings size={14} className="text-slate-500" />}
              onClick={() => setShowSettingsDrawer(true)}
            >
              Document Settings
            </Button>
            <Button
              type="primary"
              className="flex items-center gap-1 font-semibold text-[13px] bg-blue-600 hover:bg-blue-700 border-0 rounded px-4 py-1.5 h-9 text-white shadow-xs cursor-pointer"
              icon={<Plus size={15} className="stroke-[3px]" />}
              onClick={handleCreateQuotation}
            >
              Create Quotation
            </Button>
          </div>
        </div>

        {/* 2. Horizontal Filter Tabs */}
        <div className="bg-white dark:bg-[#141414] px-6 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center border-b border-transparent overflow-x-auto">
            {[
              { id: 'all', label: 'All', badge: tabCounts.all },
              { id: 'open', label: 'Open', badge: tabCounts.open },
              { id: 'closed', label: 'Closed', badge: tabCounts.closed },
              { id: 'partial', label: 'Partial', badge: tabCounts.partial },
              { id: 'cancelled', label: 'Cancelled', badge: tabCounts.cancelled },
              { id: 'draft', label: 'Drafts', badge: tabCounts.draft },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-[13px] font-semibold border-b-2 flex items-center gap-1.5 transition-all relative cursor-pointer shrink-0 ${
                    isActive
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="inline-flex items-center justify-center text-[10px] bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-300 font-bold px-1.5 py-0.2 rounded-full min-w-5 h-5 border border-slate-200/50 dark:border-neutral-700">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Filter & Search Control Bar */}
        <div className="bg-white dark:bg-[#141414] px-6 py-3 border-b border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Search by transaction, customer, quotation # etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<Search size={14} className="text-slate-400 mr-1" />}
              className="rounded px-3 py-1.5 text-[13px] border-slate-200 dark:border-neutral-700 h-9"
              allowClear
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Select
              value={fiscalYear}
              onChange={setFiscalYear}
              options={fyOptions}
              className="w-32 h-9"
              suffixIcon={<ChevronDown size={14} className="text-slate-400" />}
            />

            <Button
              className="flex items-center justify-center w-9 h-9 border-slate-200 dark:border-neutral-700 text-slate-500 dark:text-neutral-300 bg-white dark:bg-neutral-800 rounded p-0 cursor-pointer"
              title="Refresh"
              onClick={fetchQuotations}
            >
              <SlidersHorizontal size={14} />
            </Button>
          </div>
        </div>

        {/* 4. Table Section */}
        <div className="flex-1 p-6 pb-24">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Spin size="large" />
                <span className="text-slate-400 text-sm">Loading real quotations...</span>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={filteredData}
                pagination={false}
                locale={{
                  emptyText: (
                    <div className="py-14 text-center text-slate-400">
                      <FileText size={36} className="mx-auto text-slate-300 dark:text-neutral-600 mb-2" />
                      <p className="text-base font-semibold text-slate-700 dark:text-neutral-300">
                        No quotations found
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                        Create and share price estimates and quotations with your clients.
                      </p>
                      <Button
                        type="primary"
                        icon={<Plus size={14} />}
                        onClick={handleCreateQuotation}
                        className="bg-blue-600 font-semibold"
                      >
                        Create First Quotation
                      </Button>
                    </div>
                  ),
                }}
                className="font-sans ant-table-custom"
                rowClassName="hover:bg-slate-50/70 dark:hover:bg-neutral-800/40 transition-colors"
              />
            )}

            {/* Footer Summary Strip */}
            <div className="border-t border-slate-200 dark:border-neutral-800 px-5 py-4 bg-white dark:bg-[#141414] flex flex-col md:flex-row items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 rounded-md text-[13px] font-semibold text-slate-600 dark:text-neutral-300">
                  <span>Total Quotations:</span>
                  <span className="text-slate-800 dark:text-white font-bold">
                    {formatIndianCurrency(totalAmount)}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 rounded-md text-[13px] font-semibold text-slate-600 dark:text-neutral-300">
                  <span>Closed / Converted:</span>
                  <span className="text-slate-800 dark:text-white font-bold">
                    {formatIndianCurrency(closedAmount)}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-slate-400 dark:text-neutral-500">
                  <span>{filteredData.length} records</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[13px] text-slate-500 dark:text-neutral-400 font-medium">
                  Page 1 of 1
                </span>
                <div className="flex items-center border border-slate-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    disabled
                    className="w-8 h-8 flex items-center justify-center border-0 border-r border-slate-200 dark:border-neutral-700 text-slate-300 dark:text-neutral-600 bg-slate-50 dark:bg-neutral-800 cursor-not-allowed"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    disabled
                    className="w-8 h-8 flex items-center justify-center border-0 text-slate-300 dark:text-neutral-600 bg-slate-50 dark:bg-neutral-800 cursor-not-allowed"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Document Settings Drawer */}
        <DocumentSettingsDrawer
          isOpen={showSettingsDrawer}
          onClose={() => setShowSettingsDrawer(false)}
          invoiceOptions={invoiceOptions}
          setInvoiceOptions={setInvoiceOptions}
          profile={profile}
        />

        {/* 6. Live Quotation Document Preview Modal */}
        {viewingQuotation && (
          <LiveDocumentPreviewModal
            isOpen={!!viewingQuotation}
            onClose={() => setViewingQuotation(null)}
            profile={viewingQuotation.data?.profile || profile}
            client={viewingQuotation.data?.client || { name: viewingQuotation.clientName }}
            details={
              viewingQuotation.data?.details || {
                invoiceNumber: viewingQuotation.invoiceNumber,
                invoiceDate: viewingQuotation.invoiceDate,
              }
            }
            items={viewingQuotation.data?.items || []}
            totals={
              viewingQuotation.data?.totals || {
                total: viewingQuotation.totalAmount,
                subtotal: viewingQuotation.totalAmount,
              }
            }
            invoiceType={viewingQuotation.invoiceType || viewingQuotation.data?.invoiceType || 'proforma'}
            customTerms={viewingQuotation.data?.customTerms}
            customNotes={viewingQuotation.data?.customNotes}
            invoiceOptions={viewingQuotation.data?.invoiceOptions || invoiceOptions}
          />
        )}
      </div>
    </ConfigProvider>
  );
}
