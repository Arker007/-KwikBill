/**
 * Reports Domain Types & Data Contracts
 */

export type ReportTabKey = 'pl' | 'aging' | 'clients' | 'products';
export type ReportFilterMode = 'fy' | 'month';

export interface MonthlyPLItem {
  revenue: number;
  tax: number;
  expense: number;
  expGst: number;
}

export type AgingBucket = 'current' | '31to60' | '61to90' | '90plus';

export interface AgingRow {
  clientName: string;
  invoiceNumber: string;
  invoiceDate?: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  outstanding: number;
  daysOverdue: number;
  bucket: AgingBucket;
  currency: string;
}

export interface AgingCurrencySummary {
  total: number;
  current: number;
  '31to60': number;
  '61to90': number;
  '90plus': number;
}

export interface ClientAnalyticsRow {
  name: string;
  revenue: number;
  paid: number;
  outstanding: number;
  count: number;
  lastInvoiceDate: string;
}

export interface ProductPerformanceRow {
  name: string;
  hsn: string;
  qty: number;
  revenue: number;
  txns: number;
  lastSold: string;
}
