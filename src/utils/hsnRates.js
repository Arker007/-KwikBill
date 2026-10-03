/**
 * Backward-compatibility facade for HSN / SAC rate lookup.
 * Canonical implementation is now at src/features/inventory/data/hsnRates.ts
 */

export {
  HSN_RATES,
  SAC_RATES,
  suggestGstRate,
  default,
} from '../features/inventory/data/hsnRates.ts';
