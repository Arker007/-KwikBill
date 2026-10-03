/**
 * Shared Currency and Regional Configuration Types
 */

export type CurrencyCode =
  | 'INR'
  | 'AED'
  | 'USD'
  | 'GBP'
  | 'AUD'
  | 'CAD'
  | 'SGD'
  | 'MYR'
  | 'EUR'
  | 'ZAR'
  | 'NGN'
  | 'KES'
  | 'SAR'
  | 'NPR'
  | 'BDT'
  | 'LKR'
  | 'PKR'
  | 'PHP'
  | 'IDR'
  | 'NZD'
  | (string & {});

export interface CurrencyInfo {
  name: string;
  code: string;
  currency: CurrencyCode;
  currencySymbol: string;
  taxLabel: string;
  taxIdLabel: string;
  taxIdPlaceholder: string;
  bankLabel: string;
  postalLabel: string;
  stateLabel: string;
  hasStates: boolean;
  taxRates: number[];
  taxIdRegex?: RegExp;
}

export type RegionMode = 'india' | 'international' | 'both';
