export type StandardGSTTaxRate = 0 | 0.1 | 0.25 | 3 | 5 | 12 | 18 | 28;

/**
 * Statutory GST Rates and Tax Compliance Thresholds
 */
export const GST_TAX_RATES: readonly StandardGSTTaxRate[] = [0, 0.1, 0.25, 3, 5, 12, 18, 28] as const;

// Section 194Q / 206C(1H) annual cumulative threshold (₹50 Lakhs)
export const TDS_TCS_THRESHOLD = 5_000_000;
