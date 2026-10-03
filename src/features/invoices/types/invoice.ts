import { InvoiceItem, LineItemTaxBreakdown } from './items';

/**
 * Statutory Indian GST invoice document types.
 */
export type InvoiceType =
  | 'tax-invoice'
  | 'bill-of-supply'
  | 'composition'
  | 'delivery-challan'
  | 'proforma'
  | 'quotation'
  | 'credit-note'
  | 'debit-note'
  | 'receipt-voucher';

/**
 * Status of an invoice document.
 */
export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'paid'
  | 'partially-paid'
  | 'overdue'
  | 'cancelled';

/**
 * Payment transaction recorded against an invoice.
 */
export interface PaymentDetail {
  id?: string;
  date: string;
  amount: number;
  mode: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card' | 'other';
  referenceNumber?: string;
  notes?: string;
}

/**
 * Statutory tax & surcharge options for an invoice.
 */
export interface InvoiceOptions {
  reverseCharge?: boolean;
  showRoundOff?: boolean;
  showTDS?: boolean;
  tdsRate?: number;
  tdsCumulativeThisYear?: number;
  showTCS?: boolean;
  tcsRate?: number;
  tcsCumulativeThisYear?: number;
  invoiceDiscountType?: 'fixed' | 'percent';
  invoiceDiscountValue?: number;
}

/**
 * Computed statutory invoice totals breakdown.
 */
export interface InvoiceTotals {
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  utgst: number;
  igst: number;
  cess: number;
  tcsAmount: number;
  tdsAmount: number;
  roundOff: number;
  invoiceDiscountAmount: number;
  invoiceDiscountType: 'fixed' | 'percent';
  invoiceDiscountValue: number;
  total: number;
  netReceivable: number;
  totalTaxAmount: number;
  isInterstate: boolean;
  isIntraUT: boolean;
  isUnionTerritory: boolean;
  taxInclusive: boolean;
  warnings: string[];
  needsProfileFix: boolean;
  lines: LineItemTaxBreakdown[];
  rcmTaxCgst?: number;
  rcmTaxSgst?: number;
  rcmTaxUtgst?: number;
  rcmTaxIgst?: number;
  rcmTaxTotal?: number;
}

/**
 * Party profile details (seller or buyer).
 */
export interface InvoiceParty {
  name?: string;
  companyName?: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isSEZ?: boolean;
}

/**
 * Meta details for an invoice (PO, Place of Supply, e-Way, vehicle).
 */
export interface InvoiceDetails {
  invoiceNumber?: string;
  date?: string;
  dueDate?: string;
  placeOfSupply?: string;
  poNumber?: string;
  poDate?: string;
  vehicleNumber?: string;
  eWayBillNumber?: string;
  notes?: string;
  terms?: string;
}

/**
 * Main Invoice Document structure representing stored invoice data.
 */
export interface InvoiceDocument {
  id: string;
  invoiceNumber: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  date: string;
  dueDate?: string;
  profile?: InvoiceParty;
  client?: InvoiceParty;
  details?: InvoiceDetails;
  items: InvoiceItem[];
  showGST?: boolean;
  taxInclusive?: boolean;
  invoiceOptions?: InvoiceOptions;
  totals?: InvoiceTotals;
  payments?: PaymentDetail[];
  paidAmount?: number;
  dueAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}
