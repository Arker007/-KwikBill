/**
 * Shared Common Domain and Primitive Types
 */

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  pin?: string | number;
  country?: string;
}

export type StateCode = string;

export type DiscountType = 'fixed' | 'percent';

export type DiscountBase = 'net' | 'unit' | 'with-tax';

export type DateString = string;

export type Status = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'active' | 'inactive';

export type ID = string | number;

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}
