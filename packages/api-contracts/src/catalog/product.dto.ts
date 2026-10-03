export interface Product {
  id: string;
  name: string;
  description?: string;
  hsnSac?: string;
  hsn?: string;
  rate: number;
  taxPercent: number;
  cessPercent?: number;
  unit?: string;
  stock?: number;
  trackStock?: boolean;
  minStock?: number;
  category?: string;
  sku?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormData {
  id?: string;
  name: string;
  description?: string;
  hsnSac?: string;
  hsn?: string;
  rate: number;
  taxPercent: number;
  cessPercent?: number;
  unit?: string;
  stock?: number;
  trackStock?: boolean;
  minStock?: number;
  category?: string;
  sku?: string;
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  lowStock?: boolean;
}
