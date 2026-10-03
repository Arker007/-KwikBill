/**
 * Shared GST & Statutory Tax Types
 */

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
