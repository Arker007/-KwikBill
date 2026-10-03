import { LucideIcon, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export interface DashboardVisibleColumns {
  date: boolean;
  invoice: boolean;
  type: boolean;
  client: boolean;
  amount: boolean;
  currency: boolean;
  dueDate: boolean;
  printed: boolean;
  status: boolean;
  actions: boolean;
  [key: string]: boolean;
}

export interface StatusConfigItem {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const STATUS_CONFIG: Record<string, StatusConfigItem> = {
  unpaid:  { label: 'Unpaid',  icon: Clock,          color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)' },
  partial: { label: 'Partial', icon: Clock,          color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.14)' },
  paid:    { label: 'Paid',    icon: CheckCircle,    color: '#059669', bg: 'rgba(5, 150, 105, 0.14)'  },
  overdue: { label: 'Overdue', icon: AlertTriangle,  color: '#dc2626', bg: 'rgba(220, 38, 38, 0.14)'  },
};

export interface DashboardPaymentItem {
  id?: string;
  amount: number;
  date: string;
  mode: string;
  note?: string;
  recordedAt?: string;
  receiptNo?: string;
}

export interface DashboardBill {
  id: string;
  invoiceNumber: string;
  invoiceType?: string;
  invoiceDate: string;
  clientName: string;
  clientPhone?: string;
  totalAmount: number;
  paidAmount?: number;
  totalTaxAmount?: number;
  currency?: string;
  status?: string;
  printedCount?: number;
  payments?: DashboardPaymentItem[];
  data?: {
    profile?: any;
    client?: any;
    details?: {
      dueDate?: string;
      [key: string]: any;
    };
    items?: any[];
    totals?: any;
    invoiceType?: string;
    invoiceOptions?: {
      currency?: string;
      [key: string]: any;
    };
    customTerms?: string;
    customNotes?: string;
    extraSections?: any[];
    internalNote?: string;
    [key: string]: any;
  };
  _isDuplicate?: boolean;
  _convertToType?: string;
}

export interface CurrencyStats {
  total: number;
  tax: number;
  unpaid: number;
}

export interface DashboardStats {
  byCurrency: Record<string, CurrencyStats>;
  count: number;
}

export interface ReceiptModalTarget {
  bill: DashboardBill;
  payment: DashboardPaymentItem;
  remaining: number;
}

export interface EditPaymentModalState {
  bill: DashboardBill;
  idx: number;
  form: {
    amount: string;
    date: string;
    mode: string;
    note: string;
  };
}
