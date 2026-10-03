export interface PurchaseItem {
  name: string;
  hsn: string;
  quantity: number;
  rate: number;
  taxPercent: number;
  cessPercent: number;
}

export interface Purchase {
  id?: string;
  date: string;
  supplierName: string;
  supplierAddress?: string;
  supplierGstin: string;
  invoiceNumber: string;
  ownerGstin?: string;
  ownerName?: string;
  items: PurchaseItem[];
  totalAmount: number;
  totalTax: number;
  taxableAmount: number;
  applyRoundOff?: boolean;
  roundOff?: number;
  paymentStatus: 'Unpaid' | 'Paid' | 'Partial' | string;
  interstate?: boolean;
  note?: string;
}

export interface PurchaseFormData {
  date: string;
  supplierName: string;
  supplierAddress: string;
  supplierGstin: string;
  invoiceNumber: string;
  items: PurchaseItem[];
  paymentStatus: string;
  interstate: boolean;
  applyRoundOff: boolean;
  note: string;
}

export interface PurchaseTotals {
  taxable: number;
  tax: number;
  cess: number;
  total: number;
  roundOff: number;
  finalTotal: number;
}
