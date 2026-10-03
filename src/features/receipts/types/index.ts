export type PaymentMode = 'Bank Transfer' | 'UPI' | 'Cash' | 'Cheque' | 'Card' | 'Other';

export interface Receipt {
  id?: string;
  date: string;
  receiptNo: string;
  clientName: string;
  clientAddress?: string;
  amount: number;
  paymentMode: PaymentMode | string;
  referenceNo?: string;
  againstInvoice?: string;
  note?: string;
}

export interface ReceiptFormData {
  date: string;
  receiptNo: string;
  clientName: string;
  clientAddress: string;
  amount: string;
  paymentMode: string;
  referenceNo: string;
  againstInvoice: string;
  note: string;
}
