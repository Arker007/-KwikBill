export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringItem {
  name: string;
  hsn?: string;
  quantity: number | string;
  rate: number | string;
  taxPercent: number | string;
  discount: number | string;
}

export interface RecurringTemplate {
  id?: string;
  clientName: string;
  clientState?: string;
  clientGstin?: string;
  clientAddress?: string;
  frequency: RecurringFrequency | string;
  invoiceType?: string;
  items: RecurringItem[];
  notes?: string;
  nextDate: string;
  active?: boolean;
  ownerGstin?: string;
  ownerName?: string;
  lastGenerated?: string;
}

export interface RecurringFormData {
  clientName: string;
  clientState: string;
  clientGstin: string;
  clientAddress: string;
  frequency: string;
  invoiceType: string;
  items: RecurringItem[];
  notes: string;
  nextDate: string;
  active: boolean;
}
