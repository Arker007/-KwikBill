export interface ExpenseCategory {
  name: string;
  itrHead: 'business' | 'depreciation' | 'salary' | 'notDeductible';
}

export interface Expense {
  id?: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  gstAmount?: number;
  gstPercent?: number;
  interstate?: boolean;
  vendorName?: string;
  vendorGstin?: string;
  invoiceNo?: string;
  paymentMode?: string;
  note?: string;
  ownerGstin?: string;
  ownerName?: string;
}

export interface ExpenseFormData {
  date: string;
  description: string;
  category: string;
  amount: string;
  gstAmount: string | number;
  gstPercent: string | number;
  interstate: boolean;
  vendorName: string;
  vendorGstin: string;
  invoiceNo: string;
  paymentMode: string;
  note: string;
}
