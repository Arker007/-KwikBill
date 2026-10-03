/**
 * Discount configuration modes supported for line items.
 */
export type DiscountType = 'fixed' | 'percent';
export type DiscountBase = 'net' | 'unit' | 'with-tax';

export interface DiscountMode {
  type: DiscountType;
  base: DiscountBase;
}

/**
 * Line item in an invoice or bill document.
 */
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

/**
 * Calculated tax breakdown for an individual line item.
 */
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
