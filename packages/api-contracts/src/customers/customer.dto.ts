export interface Address {
  street?: string;
  city?: string;
  state?: string;
  pin?: string | number;
  country?: string;
}

export interface Client {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  pin?: string;
  state?: string;
  gstin?: string;
  email?: string;
  phone?: string;
  country?: string;
  isSEZ?: boolean;
  preferredPaperSize?: string;
  preferredCurrency?: string;
  autoPrint?: boolean;
}

export interface ClientFormData {
  name: string;
  address: string;
  city: string;
  pin: string;
  state: string;
  gstin: string;
  email: string;
  phone: string;
  country: string;
  isSEZ: boolean;
  preferredPaperSize: string;
  preferredCurrency: string;
  autoPrint: boolean;
}

export interface ClientStats {
  total: number;
  paid: number;
  unpaid: number;
  count: number;
}

export interface ClientAgingBuckets {
  current: number;
  d31_60: number;
  d61_90: number;
  d90plus: number;
  total: number;
}

export interface ClientAgingItem {
  bill: unknown;
  ageDays: number;
  outstanding: number;
}

export interface ClientAgingResult {
  buckets: ClientAgingBuckets;
  unpaidBills: ClientAgingItem[];
}
