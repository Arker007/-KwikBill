export type GSTRTab = 'gstr1' | 'gstr3b' | 'gstr2b' | 'tds' | 'guide';

export type FilterMode = 'month' | 'quarter' | 'fy';

export interface B2BRow {
  gstin: string;
  clientName: string;
  invoiceNo: string;
  date: string;
  pos: string;
  supplyType: string;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total: number;
}

export interface B2CRateData {
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total: number;
}

export interface HSNRow {
  hsn: string;
  rate: number;
  uqc: string;
  description: string;
  quantity: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalTax: number;
}

export interface DocSummaryItem {
  type: string;
  from: string;
  to: string;
  total: number;
}

export interface GrandTotals {
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total: number;
  cnTotals?: {
    taxable: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
    total: number;
  };
}

export interface OutputTax {
  cgst: number;
  sgst: number;
  igst: number;
}

export interface NetTax {
  cgst: number;
  sgst: number;
  igst: number;
}

export interface ITCDetails {
  cgst: number;
  sgst: number;
  igst: number;
}

export type ReconStatus = 'matched' | 'amount_mismatch' | 'book_only' | 'twob_only';

export interface ReconRow {
  status: ReconStatus;
  supplier: string;
  ctin: string;
  invoiceNumber: string;
  date: string;
  twoBVal: number;
  twoBTaxable: number;
  twoBIgst: number;
  twoBCgst: number;
  twoBSgst: number;
  bookVal: number;
  bookTaxable: number;
  bookIgst: number;
  bookCgst: number;
  bookSgst: number;
  itcAvailable: boolean;
  valDiff?: number;
  taxableDiff?: number;
}

export interface ReconStats {
  total: number;
  matched: number;
  amount_mismatch: number;
  book_only: number;
  twob_only: number;
}

export interface TDSRow {
  clientName: string;
  clientGstin: string;
  clientPan: string;
  section: string;
  rate: number;
  quarter: string;
  invoiceNumber: string;
  date: string;
  taxable: number;
  tds: number;
}

export interface TCSRow {
  clientName: string;
  clientGstin: string;
  clientPan: string;
  section: string;
  rate: number;
  quarter: string;
  invoiceNumber: string;
  date: string;
  taxable: number;
  tcs: number;
}

export interface SectionSummaryItem {
  section: string;
  quarter: string;
  count: number;
  taxable: number;
  tds?: number;
  tcs?: number;
}

export interface PeriodFilingStatus {
  gstr1?: boolean;
  gstr1Date?: string | null;
  gstr3b?: boolean;
  gstr3bDate?: string | null;
}

export interface StepItem {
  title: string;
  details: string;
}

export interface ValidationWarning {
  type: 'error' | 'warning';
  msg: string;
}
