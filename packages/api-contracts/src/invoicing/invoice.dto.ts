export type InvoiceType =
  | 'tax-invoice'
  | 'bill-of-supply'
  | 'delivery-challan'
  | 'proforma'
  | 'quotation'
  | 'credit-note'
  | 'debit-note'
  | 'receipt-voucher';

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'paid'
  | 'partially-paid'
  | 'overdue'
  | 'cancelled';

export type DiscountType = 'fixed' | 'percent';
export type DiscountBase = 'net' | 'unit' | 'with-tax';

export interface DiscountMode {
  type: DiscountType;
  base: DiscountBase;
}

export interface InvoiceItem {
  id?: string;
  productId?: string;
  name: string;
  description?: string;
  hsnSac?: string;
  hsn?: string;
  quantity: number;
  unit?: string;
  rate: number;
  taxPercent: number;
  cessPercent?: number;
  discount?: number;
  discountType?: DiscountType;
  discountBase?: DiscountBase;
}

export interface LineItemTaxBreakdown {
  qty: number;
  rate: number;
  disc: number;
  taxPct: number;
  cessPct: number;
  gross: number;
  afterDisc: number;
  taxable: number;
  tax: number;
  cess: number;
}

export interface PaymentDetail {
  id?: string;
  date: string;
  amount: number;
  mode: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card' | 'other';
  referenceNumber?: string;
  notes?: string;
}

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

export type StandardGSTTaxRate = 0 | 0.1 | 0.25 | 3 | 5 | 12 | 18 | 28;
export type TaxRate = StandardGSTTaxRate | number;
export type GSTBucket = 'cgst' | 'sgst' | 'utgst' | 'igst' | 'cess';

export interface PlaceOfSupply {
  stateCode: string;
  stateName?: string;
  isInterstate: boolean;
  isUnionTerritory: boolean;
}

export interface TaxCalculationBreakdown {
  taxableAmount: number;
  cgst: number;
  sgst: number;
  utgst: number;
  igst: number;
  cess: number;
  totalTax: number;
}

export type GSTStateCode = string;
