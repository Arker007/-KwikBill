export type ProductItemType = 'product' | 'service';
export type TaxInclusiveMode = 'exclusive' | 'inclusive';

export interface Product {
  id?: string;
  name: string;
  type?: ProductItemType;
  category?: string;
  hsn?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  rate?: number;
  taxPercent?: number;
  taxType?: TaxInclusiveMode;
  unit?: string;
  stock?: number;
  minStock?: number;
  trackStock?: boolean;
  barcode?: string;
  description?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
  name: string;
  type?: ProductItemType;
  category?: string;
  hsn: string;
  purchasePrice: string;
  sellingPrice: string;
  taxPercent: string;
  taxType?: TaxInclusiveMode;
  unit: string;
  stock: string;
  minStock?: string;
  trackStock?: boolean;
  barcode?: string;
  description: string;
}

export interface StockAlertSettings {
  enabled: boolean;
  threshold: number;
}
