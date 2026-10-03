import type { BankTransaction, AdvanceTaxScheduleResult } from './types.ts';
// ============================================================================
// Indian Income Tax helpers — FY 2024-25 and FY 2025-26 (current filing season)
// ----------------------------------------------------------------------------
// Everything here is pure math. UI components in components/IncomeTax*.jsx
// consume these helpers. Kept in a separate file so the tax logic can be
// unit-tested and audited by a CA without loading React.
//
// Comprehensive tax law compliance:
//   - Budget 2025 new-regime slabs + ₹60k / ₹12L 87A rebate for FY 25-26
//   - Finance (No. 2) Act 2024 STCG 20%, LTCG 12.5% + ₹1.25L exemption
//     (effective 23-Jul-2024)
//   - Senior (60+) and super-senior (80+) old-regime basic exemption slabs
//   - Rule 119A ₹100 rounding for 234B / 234C
//   - Marginal relief on surcharge threshold crossings
//   - 80CCD(2) capped at 10 / 14% of salary
//   - effectiveDeductionCap wired into computeAllowedDeductions
//   - 87A eligibility uses total-income base (includes capital gains)
//   - Special-rate tax (LTCG/STCG) surcharge capped at 15% end-to-end
// ============================================================================

export type TaxRegime = 'old' | 'new';

export interface TaxSlab {
  upto: number;
  rate: number;
}

export interface Rebate87AConfig {
  threshold: number;
  cap: number;
}

export interface CapitalGainsConfig {
  stcgRate: number;
  ltcgRate: number;
  ltcgExemption: number;
  preTransition?: {
    stcgRate: number;
    ltcgRate: number;
    ltcgExemption: number;
  };
}

export interface DeductionContext {
  selfSenior?: boolean;
  parentsSenior?: boolean;
  salary?: number;
  isGovtEmployee?: boolean;
}

export interface SurchargeOptions {
  specialRateTax?: number;
}

export interface TaxComputationInputs {
  salary?: number;
  businessIncome?: number;
  housePropertyIncome?: number;
  otherSources?: number;
  capitalGains?: number;
  stcgAtSpecialRate?: number;
  ltcgAtSpecialRate?: number;
  deductions?: Record<string, number>;
  regime?: TaxRegime;
  fy?: string;
  age?: number;
  selfSenior?: boolean;
  parentsSenior?: boolean;
  isGovtEmployee?: boolean;
}

export interface TaxComputationResult {
  fy: string;
  grossTotalIncome: number;
  salaryAfterStd: number;
  standardDeduction: number;
  allowedDeductions: number;
  taxableIncome: number;
  slabTax: number;
  stcgTax: number;
  ltcgTax: number;
  specialRateTax: number;
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  regime: TaxRegime;
}

export interface RegimeComparisonResult {
  old: TaxComputationResult;
  new: TaxComputationResult;
  savings: number;
  recommended: TaxRegime;
}


export interface BankStatementParseResult {
  bankName: string;
  transactions: BankTransaction[];
}

export interface Presumptive44ADInput {
  digitalReceipts?: number;
  cashReceipts?: number;
  declaredIncome?: number;
}

export interface Presumptive44ADResult {
  turnover: number;
  digitalReceipts: number;
  cashReceipts: number;
  deemedIncome: number;
  presumptiveIncome: number;
  isEligible: boolean;
  section: '44AD';
  threshold: number;
  notes: string[];
}

export interface Presumptive44ADAInput {
  digitalReceipts?: number;
  cashReceipts?: number;
  declaredIncome?: number;
}

export interface Presumptive44ADAResult {
  turnover: number;
  digitalReceipts: number;
  cashReceipts: number;
  deemedIncome: number;
  presumptiveIncome: number;
  isEligible: boolean;
  section: '44ADA';
  threshold: number;
  notes: string[];
}

export interface Presumptive44AEInput {
  heavyVehicleMonths?: number;
  heavyVehicleTonnage?: number;
  lightVehicleMonths?: number;
  declaredIncome?: number;
}

export interface Presumptive44AEResult {
  heavyIncome: number;
  lightIncome: number;
  deemedIncome: number;
  presumptiveIncome: number;
  isEligible: boolean;
  section: '44AE';
  notes: string[];
}

export interface AdvanceTaxInstallment {
  installment: number;
  dueDate: string;
  cumulativePct: number;
  label: string;
}

export interface AdvanceTaxRow extends AdvanceTaxInstallment {
  installmentDue: number;
  cumulativeDue: number;
  totalPaidByDue: number;
  shortfall: number;
}

export interface AdvanceTaxPayment {
  date: string;
  amount: number | string;
}


export interface ITR4FieldMapRow {
  section: string;
  field: string;
  value: string | number;
  note?: string;
  bold?: boolean;
  big?: boolean;
}

/**
 * Current filing season. Change ONE constant here; every
 * FY-relative slab / rate / due-date resolves via this. Setting a different
 * FY as CURRENT_FY makes the app default to that year end-to-end. Callers
 * that need a specific FY pass it explicitly.
 */
export const CURRENT_FY = '2025-26';

// ----------------------------- Regimes ---------------------------------------

/**
 * OLD REGIME slabs — individuals below 60 years.
 *
 * Rebate under Section 87A: full rebate if total income ≤ ₹5L (up to ₹12.5k tax).
 * Standard Deduction: ₹50,000 (for salaried / pensioners only).
 * Health & Education Cess: 4% on tax + surcharge (if any).
 *
 * Surcharge on tax:
 *   > ₹50L up to ₹1Cr  → 10%
 *   > ₹1Cr up to ₹2Cr  → 15%
 *   > ₹2Cr up to ₹5Cr  → 25%
 *   > ₹5Cr             → 37% (or 25% if opted for 115BAC — new regime)
 */
export const OLD_REGIME_SLABS: TaxSlab[] = [
  { upto: 250_000, rate: 0 },
  { upto: 500_000, rate: 0.05 },
  { upto: 1_000_000, rate: 0.20 },
  { upto: Infinity, rate: 0.30 },
];

// Senior citizen (60+ but < 80) old-regime slabs — ₹3L basic exemption.
export const OLD_REGIME_SLABS_SENIOR: TaxSlab[] = [
  { upto: 300_000, rate: 0 },
  { upto: 500_000, rate: 0.05 },
  { upto: 1_000_000, rate: 0.20 },
  { upto: Infinity, rate: 0.30 },
];

// Super senior (80+) old-regime slabs — ₹5L basic exemption.
export const OLD_REGIME_SLABS_SUPER_SENIOR: TaxSlab[] = [
  { upto: 500_000, rate: 0 },
  { upto: 1_000_000, rate: 0.20 },
  { upto: Infinity, rate: 0.30 },
];

/**
 * Pick the right old-regime slab table by taxpayer age.
 *   age >= 80  → super senior (₹5L basic exemption)
 *   60 ≤ age < 80 → senior (₹3L basic exemption)
 *   else → regular (₹2.5L basic exemption)
 */
export function getOldRegimeSlabs(age?: number): TaxSlab[] {
  const a = Number(age) || 0;
  if (a >= 80) return OLD_REGIME_SLABS_SUPER_SENIOR;
  if (a >= 60) return OLD_REGIME_SLABS_SENIOR;
  return OLD_REGIME_SLABS;
}

/**
 * NEW REGIME (Section 115BAC) — Budget 2024 slabs for FY 2024-25:
 *   0     - 3L  : 0%
 *   3L    - 7L  : 5%
 *   7L    - 10L : 10%
 *   10L   - 12L : 15%
 *   12L   - 15L : 20%
 *   15L+        : 30%
 *
 * Rebate under Section 87A (new regime): up to ₹25,000 for total income ≤ ₹7L
 * (effectively zero tax up to ₹7L).
 * Standard Deduction: ₹75,000 (raised from ₹50k in Budget 2024).
 */
export const NEW_REGIME_SLABS_FY_2024_25: TaxSlab[] = [
  { upto: 300_000, rate: 0 },
  { upto: 700_000, rate: 0.05 },
  { upto: 1_000_000, rate: 0.10 },
  { upto: 1_200_000, rate: 0.15 },
  { upto: 1_500_000, rate: 0.20 },
  { upto: Infinity, rate: 0.30 },
];

/**
 * NEW REGIME — Budget 2025 slabs for FY 2025-26 (major restructure):
 *   0     - 4L   : 0%
 *   4L    - 8L   : 5%
 *   8L    - 12L  : 10%
 *   12L   - 16L  : 15%
 *   16L   - 20L  : 20%
 *   20L   - 24L  : 25%
 *   24L+         : 30%
 *
 * Rebate under Section 87A (new regime FY 25-26): up to ₹60,000 for total
 * income ≤ ₹12L (effectively zero tax on income up to ₹12L for a taxpayer
 * with no capital gains).
 *
 * New regime remains the DEFAULT since FY 2023-24.
 */
export const NEW_REGIME_SLABS_FY_2025_26: TaxSlab[] = [
  { upto: 400_000, rate: 0 },
  { upto: 800_000, rate: 0.05 },
  { upto: 1_200_000, rate: 0.10 },
  { upto: 1_600_000, rate: 0.15 },
  { upto: 2_000_000, rate: 0.20 },
  { upto: 2_400_000, rate: 0.25 },
  { upto: Infinity, rate: 0.30 },
];

/**
 * Backward-compat alias for pre-v1.10.31 callers that read
 * NEW_REGIME_SLABS directly. Resolves to the CURRENT_FY's table.
 */
export const NEW_REGIME_SLABS: TaxSlab[] =
  CURRENT_FY === '2025-26'
    ? NEW_REGIME_SLABS_FY_2025_26
    : NEW_REGIME_SLABS_FY_2024_25;

/**
 * Pick the new-regime slab table for a given FY. Extending
 * to a new FY = add a new SLABS constant + a case here.
 */
export function getNewRegimeSlabs(fy: string = CURRENT_FY): TaxSlab[] {
  if (fy === '2025-26') return NEW_REGIME_SLABS_FY_2025_26;
  return NEW_REGIME_SLABS_FY_2024_25; // FY 24-25 and earlier
}

/**
 * 87A rebate parameters per FY. Old regime unchanged.
 * New regime FY 25-26 raised threshold from ₹7L → ₹12L and cap from
 * ₹25,000 → ₹60,000 (Budget 2025).
 */
export function get87AConfig(regime: TaxRegime, fy: string = CURRENT_FY): Rebate87AConfig {
  if (regime === 'old') {
    return { threshold: 500_000, cap: 12_500 };
  }
  // new regime
  if (fy === '2025-26') return { threshold: 1_200_000, cap: 60_000 };
  return { threshold: 700_000, cap: 25_000 }; // FY 24-25
}

/**
 * Capital gains rates changed on 23-Jul-2024 (Finance No.2 Act 2024).
 * §111A STCG on listed equity: 15% → 20%
 * §112A LTCG on listed equity: 10% → 12.5%, exemption ₹1L → ₹1.25L
 *
 * For FY 2024-25, gains realised on/after 23-Jul-2024 use new rates. UI
 * asks the user to enter the split; if the user just says "₹X LTCG for
 * FY 24-25" without splitting, we default to the safer (higher) new rates.
 *
 * FY 2025-26 and later: always new rates.
 */
export function getCapitalGainsConfig(fy: string = CURRENT_FY): CapitalGainsConfig {
  if (fy === '2024-25') {
    return {
      stcgRate: 0.20,
      ltcgRate: 0.125,
      ltcgExemption: 125_000,
      preTransition: { stcgRate: 0.15, ltcgRate: 0.10, ltcgExemption: 100_000 },
    };
  }
  // FY 2025-26 and later — post-transition rates.
  return {
    stcgRate: 0.20,
    ltcgRate: 0.125,
    ltcgExemption: 125_000,
    preTransition: { stcgRate: 0.15, ltcgRate: 0.10, ltcgExemption: 100_000 },
  };
}

/**
 * Deduction caps under OLD regime (per Section reference).
 * New regime disallows most of these — only NPS employer contribution (80CCD(2))
 * is available.
 */
export const DEDUCTION_CAPS: Record<string, number> = {
  '80C':     150_000,   // PPF, ELSS, LIC, EPF, tuition, home-loan principal, ULIP, NSC
  '80CCD1B': 50_000,    // Additional NPS (employee contribution beyond ₹1.5L 80C)
  '80D':     100_000,   // MAXIMUM only when BOTH self+family AND parents are seniors
  '80TTA':   10_000,    // Savings-account interest (individuals below 60)
  '80TTB':   50_000,    // Bank/PO deposit interest (senior citizens 60+)
  '80E':     Infinity,  // Education loan interest — no cap, 8-year max claim
  '80G':     Infinity,  // Donations — 50% or 100% of qualifying, subject to limits
  '80GG':    60_000,    // Rent paid when HRA not received (min 25% of AGI - rent-10%AGI - ₹5000/month)
  '80DDB':   100_000,   // Specified serious illness (₹1L for seniors, ₹40k otherwise)
  '80U':     125_000,   // Self-disability (₹75k / ₹1.25L for severe)
  '24b':     200_000,   // Home-loan interest on self-occupied property
};

/**
 * 80D and 80DDB caps are context-sensitive on senior status.
 * The static DEDUCTION_CAPS entry is only the maximum. This helper
 * returns the actual cap given the taxpayer's family setup, so the UI
 * doesn't silently allow ₹1L of 80D for a 30-year-old with 40-year-old
 * parents (statutory max is ₹50k for that case).
 */
export function effectiveDeductionCap(
  section?: string | null,
  ctx: DeductionContext = {}
): number {
  const s = String(section || '').toUpperCase();
  if (s === '80D') {
    const selfCap = ctx.selfSenior ? 50_000 : 25_000;       // 25k (<60) / 50k (60+)
    const parentsCap = ctx.parentsSenior ? 50_000 : 25_000;  // 25k / 50k
    return selfCap + parentsCap;
  }
  if (s === '80DDB') {
    return ctx.selfSenior ? 100_000 : 40_000;
  }
  return DEDUCTION_CAPS[section || ''] ?? Infinity;
}

// -------------------------- Tax calculation ---------------------------------

/**
 * Apply a slab table to a taxable-income figure.
 * @returns tax before rebate / cess / surcharge
 */
export function computeSlabTax(taxableIncome: number, slabs: TaxSlab[]): number {
  if (!Number.isFinite(taxableIncome) || taxableIncome <= 0) return 0;
  let remaining = taxableIncome;
  let lower = 0;
  let tax = 0;
  for (const slab of slabs) {
    const width = slab.upto - lower;
    const slice = Math.min(remaining, width);
    if (slice <= 0) break;
    tax += slice * slab.rate;
    remaining -= slice;
    lower = slab.upto;
    if (remaining <= 0) break;
  }
  return round2(tax);
}

/**
 * Surcharge on tax based on total income (both regimes use similar tiers).
 * New regime caps surcharge at 25% (instead of 37% for the top old-regime bracket).
 *
 * Finance Act 2022 caps surcharge on tax attributable to
 * sections 111A (STCG on equity), 112A (LTCG on equity) and 115AD
 * (FII gains) at 15%. Callers who have the special-rate portion of tax
 * can pass `opts.specialRateTax` and get the correct blended result.
 */
export function computeSurcharge(
  tax: number,
  totalIncome: number,
  regime: TaxRegime = 'new',
  opts: SurchargeOptions = {}
): number {
  if (!Number.isFinite(totalIncome)) return 0;
  if (totalIncome <= 5_000_000) return 0;

  const tier = (income: number): number => {
    if (income <= 10_000_000) return 0.10;
    if (income <= 20_000_000) return 0.15;
    if (income <= 50_000_000) return 0.25;
    return regime === 'new' ? 0.25 : 0.37;
  };
  const tierRate = tier(totalIncome);
  const specialTax = Math.max(0, Number(opts.specialRateTax) || 0);
  const cappedSpecialRate = Math.min(tierRate, 0.15);
  const regularTax = Math.max(0, tax - specialTax);
  const rawSurcharge = regularTax * tierRate + specialTax * cappedSpecialRate;

  // Marginal relief. Statute mandates the extra tax + surcharge
  // from crossing a threshold cannot exceed the extra income beyond it.
  const thresholds = [50_000_000, 20_000_000, 10_000_000, 5_000_000];
  let applicableThreshold = 0;
  for (const t of thresholds) {
    if (totalIncome > t) {
      applicableThreshold = t;
      break;
    }
  }
  if (applicableThreshold === 0) return round2(rawSurcharge);

  // Surcharge that would apply if income were exactly at the threshold.
  const surchargeAtThreshold = (() => {
    if (applicableThreshold === 5_000_000) return 0;
    return computeSurchargeInner(tax, applicableThreshold - 1, regime, opts);
  })();

  const extraIncome = totalIncome - applicableThreshold;
  const extraTaxBurden = rawSurcharge - surchargeAtThreshold;
  if (extraTaxBurden > extraIncome) {
    const cappedSurcharge = surchargeAtThreshold + extraIncome;
    return round2(Math.max(0, cappedSurcharge));
  }
  return round2(rawSurcharge);
}

// Internal helper — same math as computeSurcharge but without the marginal relief guard.
function computeSurchargeInner(
  tax: number,
  totalIncome: number,
  regime: TaxRegime,
  opts: SurchargeOptions
): number {
  if (totalIncome <= 5_000_000) return 0;
  const tier = (income: number): number => {
    if (income <= 10_000_000) return 0.10;
    if (income <= 20_000_000) return 0.15;
    if (income <= 50_000_000) return 0.25;
    return regime === 'new' ? 0.25 : 0.37;
  };
  const tierRate = tier(totalIncome);
  const specialTax = Math.max(0, Number(opts.specialRateTax) || 0);
  const cappedSpecialRate = Math.min(tierRate, 0.15);
  const regularTax = Math.max(0, tax - specialTax);
  return regularTax * tierRate + specialTax * cappedSpecialRate;
}

/**
 * Section 87A rebate — makes small taxpayers effectively pay zero.
 * Old regime: ≤ ₹5L income → up to ₹12,500 rebate.
 * New regime FY 24-25: ≤ ₹7L income → up to ₹25,000 rebate.
 * New regime FY 25-26: ≤ ₹12L income → up to ₹60,000 rebate (Budget 2025).
 */
export function computeRebate87A(
  totalIncome: number,
  tax: number,
  regime: TaxRegime = 'new',
  fy: string = CURRENT_FY
): number {
  const { threshold, cap } = get87AConfig(regime, fy);
  if (totalIncome <= threshold) return Math.min(tax, cap);
  return 0;
}

/**
 * Health & Education Cess — 4% flat on (tax + surcharge - rebate).
 * Same in both regimes.
 */
export function computeCess(taxAfterRebateAndSurcharge: number): number {
  return round2(Math.max(0, taxAfterRebateAndSurcharge) * 0.04);
}

/**
 * Standard deduction — automatically applied to salary income if declared.
 * Old regime: ₹50,000 · New regime: ₹75,000 (Union Budget 2024).
 */
export function standardDeduction(regime: TaxRegime = 'new'): number {
  return regime === 'new' ? 75_000 : 50_000;
}

/**
 * Cap each declared deduction to its statutory limit.
 * Returns the sum of allowed deductions.
 */
export function computeAllowedDeductions(
  userDeductions: Record<string, number> = {},
  regime: TaxRegime = 'old',
  ctx: DeductionContext = {}
): number {
  const salary = Math.max(0, Number(ctx.salary) || 0);
  // 80CCD(2) — employer NPS. Cap at 10% of salary (14% for central govt).
  // Available in BOTH regimes (unlike other Chapter VI-A deductions).
  const nps2Rate = ctx.isGovtEmployee ? 0.14 : 0.10;
  const nps2Cap = salary * nps2Rate;
  const rawNps2 = Number(userDeductions['80CCD2']) || 0;
  const allowedNps2 = Math.min(rawNps2, nps2Cap);

  if (regime === 'new') {
    // Only 80CCD(2) is allowed under new regime.
    return round2(allowedNps2);
  }

  let total = 0;
  for (const section of Object.keys(DEDUCTION_CAPS)) {
    const claimed = Number(userDeductions[section]) || 0;
    // Use effectiveDeductionCap for context-sensitive sections (80D, 80DDB).
    const cap = effectiveDeductionCap(section, ctx);
    total += Math.min(claimed, cap);
  }
  total += allowedNps2;
  return round2(total);
}

/**
 * End-to-end tax computation for one regime.
 */
export function computeTax(inputs: TaxComputationInputs): TaxComputationResult {
  const {
    salary = 0,
    businessIncome = 0,
    housePropertyIncome = 0,
    otherSources = 0,
    stcgAtSpecialRate = 0,
    ltcgAtSpecialRate = 0,
    deductions = {},
    regime = 'new',
    fy = CURRENT_FY,
    age = 0,
    selfSenior = false,
    parentsSenior = false,
    isGovtEmployee = false,
  } = inputs;

  // Standard deduction only applies against salary income
  const stdDed = salary > 0 ? Math.min(salary, standardDeduction(regime)) : 0;
  const salaryAfterStd = Math.max(0, salary - stdDed);

  // Gross Total Income = sum of heads (excludes special-rate gains)
  const gti = salaryAfterStd + businessIncome + housePropertyIncome + otherSources;

  // Chapter VI-A deductions — pass context for 80D/80DDB/80CCD(2) caps.
  const deductionCtx: DeductionContext = { selfSenior, parentsSenior, salary, isGovtEmployee };
  const allowedDeductions = computeAllowedDeductions(deductions, regime, deductionCtx);

  // Total taxable income under normal slabs
  const taxableIncome = Math.max(0, gti - allowedDeductions);

  // Slab tax on normal income — FY-aware new regime, age-aware old regime.
  const slabs = regime === 'new'
    ? getNewRegimeSlabs(fy)
    : getOldRegimeSlabs(age);
  const slabTax = computeSlabTax(taxableIncome, slabs);

  // Capital gains rates from FY config (post-23-Jul-2024 rates).
  const cgConfig = getCapitalGainsConfig(fy);
  const stcgTax = round2(stcgAtSpecialRate * cgConfig.stcgRate);
  const ltcgTaxable = Math.max(0, ltcgAtSpecialRate - cgConfig.ltcgExemption);
  const ltcgTax = round2(ltcgTaxable * cgConfig.ltcgRate);
  const specialRateTax = stcgTax + ltcgTax;

  const taxBeforeRebate = slabTax + specialRateTax;

  // 87A eligibility uses TOTAL INCOME under Section 2(45)
  const totalIncomeForRebate = taxableIncome + stcgAtSpecialRate + ltcgAtSpecialRate;
  const rebate = computeRebate87A(totalIncomeForRebate, slabTax, regime, fy);
  const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate);

  // Wire specialRateTax through to surcharge helper
  const totalIncomeForSurcharge = taxableIncome + stcgAtSpecialRate + ltcgAtSpecialRate;
  const surcharge = computeSurcharge(taxAfterRebate, totalIncomeForSurcharge, regime, { specialRateTax });

  const cess = computeCess(taxAfterRebate + surcharge);
  const totalTax = round2(taxAfterRebate + surcharge + cess);

  return {
    fy,
    grossTotalIncome: round2(gti),
    salaryAfterStd: round2(salaryAfterStd),
    standardDeduction: round2(stdDed),
    allowedDeductions: round2(allowedDeductions),
    taxableIncome: round2(taxableIncome),
    slabTax: round2(slabTax),
    stcgTax: round2(stcgTax),
    ltcgTax: round2(ltcgTax),
    specialRateTax: round2(specialRateTax),
    taxBeforeRebate: round2(taxBeforeRebate),
    rebate87A: round2(rebate),
    taxAfterRebate: round2(taxAfterRebate),
    surcharge: round2(surcharge),
    cess: round2(cess),
    totalTax,
    regime,
  };
}

/**
 * Old-vs-New side-by-side comparison. Recommends the cheaper regime.
 * When they tie, recommend NEW (since it's the default and simpler).
 */
export function compareRegimes(inputs: TaxComputationInputs): RegimeComparisonResult {
  const old_ = computeTax({ ...inputs, regime: 'old' });
  const new_ = computeTax({ ...inputs, regime: 'new' });
  const savings = new_.totalTax - old_.totalTax;
  const recommended: TaxRegime = savings > 0.5 ? 'old' : 'new';
  return { old: old_, new: new_, savings: round2(Math.abs(savings)), recommended };
}

// -------------------------- Bank-statement helpers ---------------------------

export interface AutoCategoryRule {
  pattern: RegExp;
  category: string;
}

export const AUTO_CATEGORY_RULES: AutoCategoryRule[] = [
  { pattern: /\bsalary|sal\b|payroll/i,                         category: 'salary' },
  { pattern: /\bint\b|interest|savings interest|sb\s*int/i,     category: 'interest' },
  { pattern: /\brent\b|rental/i,                                category: 'rent_received' },
  { pattern: /\bsip\b|mutual fund|elss|mf\b/i,                  category: 'investment' },
  { pattern: /\bppf|nps\b/i,                                    category: 'investment' },
  { pattern: /\blic\b|life insurance/i,                         category: 'deduction_80C' },
  { pattern: /health insurance|mediclaim/i,                     category: 'deduction_80D' },
  { pattern: /\bgst\b|cgst|sgst|igst/i,                         category: 'gst_paid' },
  { pattern: /\bemi\b|home loan|housing loan/i,                 category: 'business_out' },
  { pattern: /\brent paid|office rent/i,                        category: 'business_out' },
  { pattern: /electric|utility|broadband|internet|telephone/i,  category: 'business_out' },
  { pattern: /aws|amazon web|azure|google cloud|adobe|figma/i,  category: 'business_out' },
  { pattern: /amazon|flipkart|swiggy|zomato/i,                  category: 'personal' },
  { pattern: /\batm|cash withdrawal/i,                          category: 'personal' },
  { pattern: /\bimps|neft|rtgs|upi/i,                           category: 'transfer' },
];

/**
 * Try each rule; return the first matching category, else 'transfer'.
 */
export function autoCategorize(description?: string | null): string {
  const d = String(description || '');
  for (const rule of AUTO_CATEGORY_RULES) {
    if (rule.pattern.test(d)) return rule.category;
  }
  return 'transfer';
}

// ------------------------- CSV parsers per bank ------------------------------

interface BankFormat {
  name: string;
  match: (headers: string[]) => boolean;
  map: (row: string[], hIdx: Record<string, number>) => {
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
  };
  headerMap: (headers: string[]) => Record<string, number>;
}

const BANK_FORMATS: BankFormat[] = [
  {
    name: 'SBI',
    match: (headers) =>
      headers.some((h) => /Txn Date/i.test(h)) &&
      headers.some((h) => /Value Date/i.test(h)),
    map: (row, hIdx) => ({
      date: row[hIdx.txnDate] || row[hIdx.valueDate],
      description: row[hIdx.description],
      debit: parseAmt(row[hIdx.debit]),
      credit: parseAmt(row[hIdx.credit]),
      balance: parseAmt(row[hIdx.balance]),
    }),
    headerMap: (headers) => ({
      txnDate: findCol(headers, /Txn Date/i),
      valueDate: findCol(headers, /Value Date/i),
      description: findCol(headers, /Description|Narration/i),
      debit: findCol(headers, /Debit/i),
      credit: findCol(headers, /Credit/i),
      balance: findCol(headers, /Balance/i),
    }),
  },
  {
    name: 'HDFC',
    match: (headers) =>
      headers.some((h) => /Narration/i.test(h)) &&
      headers.some((h) => /Withdrawal Amt/i.test(h)),
    map: (row, hIdx) => ({
      date: row[hIdx.date],
      description: row[hIdx.description],
      debit: parseAmt(row[hIdx.debit]),
      credit: parseAmt(row[hIdx.credit]),
      balance: parseAmt(row[hIdx.balance]),
    }),
    headerMap: (headers) => ({
      date: findCol(headers, /Date/i),
      description: findCol(headers, /Narration/i),
      debit: findCol(headers, /Withdrawal Amt/i),
      credit: findCol(headers, /Deposit Amt/i),
      balance: findCol(headers, /Closing Balance/i),
    }),
  },
  {
    name: 'ICICI',
    match: (headers) =>
      headers.some((h) => /Transaction Remarks/i.test(h)),
    map: (row, hIdx) => ({
      date: row[hIdx.date],
      description: row[hIdx.description],
      debit: parseAmt(row[hIdx.debit]),
      credit: parseAmt(row[hIdx.credit]),
      balance: parseAmt(row[hIdx.balance]),
    }),
    headerMap: (headers) => ({
      date: findCol(headers, /Transaction Date|Value Date/i),
      description: findCol(headers, /Transaction Remarks|Description/i),
      debit: findCol(headers, /Withdrawal Amount|Debit/i),
      credit: findCol(headers, /Deposit Amount|Credit/i),
      balance: findCol(headers, /Balance/i),
    }),
  },
  {
    name: 'Axis',
    match: (headers) =>
      headers.some((h) => /Tran Date/i.test(h)) &&
      headers.some((h) => /Particulars/i.test(h)),
    map: (row, hIdx) => ({
      date: row[hIdx.date],
      description: row[hIdx.description],
      debit: parseAmt(row[hIdx.debit]),
      credit: parseAmt(row[hIdx.credit]),
      balance: parseAmt(row[hIdx.balance]),
    }),
    headerMap: (headers) => ({
      date: findCol(headers, /Tran Date/i),
      description: findCol(headers, /Particulars/i),
      debit: findCol(headers, /Debit/i),
      credit: findCol(headers, /Credit/i),
      balance: findCol(headers, /Balance/i),
    }),
  },
  {
    name: 'Kotak',
    match: (headers) =>
      headers.some((h) => /Chq\/Ref No/i.test(h)) ||
      headers.some((h) => /Withdrawal\(Dr\)/i.test(h)),
    map: (row, hIdx) => ({
      date: row[hIdx.date],
      description: row[hIdx.description],
      debit: parseAmt(row[hIdx.debit]),
      credit: parseAmt(row[hIdx.credit]),
      balance: parseAmt(row[hIdx.balance]),
    }),
    headerMap: (headers) => ({
      date: findCol(headers, /Date/i),
      description: findCol(headers, /Description|Narration/i),
      debit: findCol(headers, /Withdrawal|Debit/i),
      credit: findCol(headers, /Deposit|Credit/i),
      balance: findCol(headers, /Balance/i),
    }),
  },
  {
    name: 'PNB',
    match: (headers) =>
      headers.some((h) => /Chq No/i.test(h)) &&
      headers.some((h) => /Narration/i.test(h)),
    map: (row, hIdx) => ({
      date: row[hIdx.date],
      description: row[hIdx.description],
      debit: parseAmt(row[hIdx.debit]),
      credit: parseAmt(row[hIdx.credit]),
      balance: parseAmt(row[hIdx.balance]),
    }),
    headerMap: (headers) => ({
      date: findCol(headers, /Transaction Date|Date/i),
      description: findCol(headers, /Narration/i),
      debit: findCol(headers, /Debit/i),
      credit: findCol(headers, /Credit/i),
      balance: findCol(headers, /Balance/i),
    }),
  },
  {
    name: 'Yes Bank',
    match: (headers) =>
      headers.some((h) => /Chq No\.|Instrument No/i.test(h)) &&
      headers.some((h) => /Value Date/i.test(h)),
    map: (row, hIdx) => ({
      date: row[hIdx.date],
      description: row[hIdx.description],
      debit: parseAmt(row[hIdx.debit]),
      credit: parseAmt(row[hIdx.credit]),
      balance: parseAmt(row[hIdx.balance]),
    }),
    headerMap: (headers) => ({
      date: findCol(headers, /Transaction Date|Value Date/i),
      description: findCol(headers, /Description|Narration/i),
      debit: findCol(headers, /Debit/i),
      credit: findCol(headers, /Credit/i),
      balance: findCol(headers, /Balance/i),
    }),
  },
  // Fallback — best-effort column detection.
  {
    name: 'Generic',
    match: () => true,
    map: (row, hIdx) => ({
      date: row[hIdx.date],
      description: row[hIdx.description],
      debit: parseAmt(row[hIdx.debit]),
      credit: parseAmt(row[hIdx.credit]),
      balance: parseAmt(row[hIdx.balance]),
    }),
    headerMap: (headers) => ({
      date: findCol(headers, /Date/i),
      description: findCol(headers, /Description|Narration|Particulars|Remarks/i),
      debit: findCol(headers, /Debit|Withdrawal|Dr/i),
      credit: findCol(headers, /Credit|Deposit|Cr/i),
      balance: findCol(headers, /Balance/i),
    }),
  },
];

/**
 * Parse a bank-statement CSV string.
 */
export function parseBankStatement(csvText: string): BankStatementParseResult {
  const rows = parseCSV(csvText);
  if (rows.length < 2) throw new Error('CSV must have a header row + at least one transaction');
  // Find the actual header row — some banks prepend account-info lines
  let headerRowIdx = 0;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const r = rows[i];
    if (r.some((c) => /date/i.test(c)) && r.some((c) => /balance|amount/i.test(c))) {
      headerRowIdx = i;
      break;
    }
  }
  const headers = rows[headerRowIdx];
  const dataRows = rows.slice(headerRowIdx + 1);

  const format = BANK_FORMATS.find((f) => f.match(headers)) || BANK_FORMATS[BANK_FORMATS.length - 1];
  const hIdx = format.headerMap(headers);

  const transactions: BankTransaction[] = dataRows
    .filter((r) => r.length >= 3 && r.some((c) => c && String(c).trim()))
    .map((r) => {
      const parsed = format.map(r, hIdx);
      if (!parsed.date) return null;
      return { ...parsed, category: autoCategorize(parsed.description) };
    })
    .filter((t): t is BankTransaction => Boolean(t));

  return { bankName: format.name, transactions };
}

// --- tiny CSV helpers (kept in-file to avoid a dependency) --------------------

function parseCSV(text: string): string[][] {
  const lines = String(text || '').split(/\r?\n/);
  const rows: string[][] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQuotes) {
        if (c === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') {
          inQuotes = false;
        } else {
          cur += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ',') {
          row.push(cur);
          cur = '';
        } else {
          cur += c;
        }
      }
    }
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function findCol(headers: string[], pattern: RegExp): number {
  return headers.findIndex((h) => pattern.test(String(h || '').trim()));
}

function parseAmt(v: any): number {
  if (v === null || v === undefined || v === '') return 0;
  const cleaned = String(v).replace(/[₹,\s]/g, '').replace(/^-$/, '0');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ============================================================================
// Presumptive taxation — Sections 44AD, 44ADA, 44AE
// ============================================================================

/**
 * Section 44AD — presumptive business income for eligible businesses.
 */
export function compute44AD({
  digitalReceipts = 0,
  cashReceipts = 0,
  declaredIncome,
}: Presumptive44ADInput): Presumptive44ADResult {
  const digital = Math.max(0, Number(digitalReceipts) || 0);
  const cash = Math.max(0, Number(cashReceipts) || 0);
  const turnover = digital + cash;
  const notes: string[] = [];

  // Threshold: ₹2Cr default, ₹3Cr if cash receipts ≤ 5% of turnover
  const cashPct = turnover > 0 ? cash / turnover : 0;
  const threshold = cashPct <= 0.05 ? 30_000_000 : 20_000_000;
  const isEligible = turnover <= threshold;
  if (!isEligible) {
    notes.push(
      `Turnover of ${formatINR(turnover)} exceeds the §44AD limit of ${formatINR(
        threshold
      )}. You must maintain regular books and file ITR-3 with a Tax Audit Report (§44AB).`
    );
  }
  if (cashPct > 0.05 && turnover <= 30_000_000) {
    notes.push(
      `${(cashPct * 100).toFixed(
        1
      )}% of your turnover is in cash — above the 5% threshold. Reduce cash receipts to qualify for the ₹3Cr limit.`
    );
  }

  const deemed = round2(digital * 0.06 + cash * 0.08);
  const finalIncome = Math.max(deemed, Number(declaredIncome) || 0);

  if (Number(declaredIncome) && Number(declaredIncome) < deemed) {
    notes.push(
      `Declared income (${formatINR(
        declaredIncome
      )}) is less than the presumptive minimum (${formatINR(
        deemed
      )}). Assessee must maintain full books and file ITR-3.`
    );
  }

  return {
    turnover: round2(turnover),
    digitalReceipts: round2(digital),
    cashReceipts: round2(cash),
    deemedIncome: deemed,
    presumptiveIncome: round2(finalIncome),
    isEligible,
    section: '44AD',
    threshold,
    notes,
  };
}

/**
 * Section 44ADA — presumptive taxation for professionals.
 */
export function compute44ADA({
  digitalReceipts = 0,
  cashReceipts = 0,
  declaredIncome,
}: Presumptive44ADAInput): Presumptive44ADAResult {
  const digital = Math.max(0, Number(digitalReceipts) || 0);
  const cash = Math.max(0, Number(cashReceipts) || 0);
  const turnover = digital + cash;
  const notes: string[] = [];

  const cashPct = turnover > 0 ? cash / turnover : 0;
  const threshold = cashPct <= 0.05 ? 7_500_000 : 5_000_000;
  const isEligible = turnover <= threshold;
  if (!isEligible) {
    notes.push(
      `Gross receipts of ${formatINR(turnover)} exceed the §44ADA limit of ${formatINR(
        threshold
      )}. Full books + ITR-3 + audit (§44AB) apply.`
    );
  }

  const deemed = round2(turnover * 0.50);
  const finalIncome = Math.max(deemed, Number(declaredIncome) || 0);

  if (Number(declaredIncome) && Number(declaredIncome) < deemed) {
    notes.push(`Declared income is below 50% of gross receipts. Full books required.`);
  }

  return {
    turnover: round2(turnover),
    digitalReceipts: round2(digital),
    cashReceipts: round2(cash),
    deemedIncome: deemed,
    presumptiveIncome: round2(finalIncome),
    isEligible,
    section: '44ADA',
    threshold,
    notes,
  };
}

/**
 * Section 44AE — presumptive taxation for transporters (goods-carriage owners).
 */
export function compute44AE({
  heavyVehicleMonths = 0,
  heavyVehicleTonnage = 0,
  lightVehicleMonths = 0,
  declaredIncome,
}: Presumptive44AEInput): Presumptive44AEResult {
  const hMonths = Math.max(0, Number(heavyVehicleMonths) || 0);
  const hTonnes = Math.max(0, Number(heavyVehicleTonnage) || 0);
  const lMonths = Math.max(0, Number(lightVehicleMonths) || 0);
  const heavy = round2(hMonths * hTonnes * 1000);
  const light = round2(lMonths * 7500);
  const deemed = heavy + light;
  const finalIncome = Math.max(deemed, Number(declaredIncome) || 0);

  const notes: string[] = [];
  const impliedFleet = (hMonths + lMonths) / 12;
  const isEligible = impliedFleet <= 10.0001;
  if (!isEligible) {
    notes.push(
      `Implied fleet size ≈ ${impliedFleet.toFixed(
        1
      )} vehicles exceeds the §44AE cap of 10 goods carriages. Assessee must maintain regular books and file ITR-3 with a §44AB audit report.`
    );
  }
  if (Number(declaredIncome) && Number(declaredIncome) < deemed) {
    notes.push(
      `Declared income (${formatINR(
        declaredIncome
      )}) is less than the presumptive minimum (${formatINR(
        deemed
      )}). Assessee must maintain full books and file ITR-3.`
    );
  }

  return {
    heavyIncome: heavy,
    lightIncome: light,
    deemedIncome: deemed,
    presumptiveIncome: round2(finalIncome),
    isEligible,
    section: '44AE',
    notes,
  };
}

// ============================================================================
// Advance Tax — Sections 208, 234B, 234C
// ============================================================================

/**
 * Advance-tax due dates derived from the FY.
 */
export function getAdvanceTaxSchedule(fy: string = CURRENT_FY): AdvanceTaxInstallment[] {
  const startYear = Number(String(fy).split('-')[0]);
  if (!Number.isFinite(startYear)) {
    throw new Error(`Invalid FY: ${fy}. Expected format YYYY-YY (e.g. "2025-26").`);
  }
  const endYear = startYear + 1;
  return [
    { installment: 1, dueDate: `${startYear}-06-15`, cumulativePct: 0.15, label: 'By 15 June' },
    { installment: 2, dueDate: `${startYear}-09-15`, cumulativePct: 0.45, label: 'By 15 Sept' },
    { installment: 3, dueDate: `${startYear}-12-15`, cumulativePct: 0.75, label: 'By 15 Dec' },
    { installment: 4, dueDate: `${endYear}-03-15`,   cumulativePct: 1.00, label: 'By 15 March' },
  ];
}

// Backward-compat default
export const ADVANCE_TAX_SCHEDULE: AdvanceTaxInstallment[] = getAdvanceTaxSchedule(CURRENT_FY);

/**
 * Compute the advance-tax schedule.
 */
export function computeAdvanceTaxSchedule(
  totalTax: number,
  tdsAlreadyDeducted: number = 0,
  paid: AdvanceTaxPayment[] = [],
  mode: 'regular' | 'presumptive' = 'regular',
  fy: string = CURRENT_FY
): AdvanceTaxScheduleResult {
  const netLiability = Math.max(0, totalTax - (Number(tdsAlreadyDeducted) || 0));
  if (netLiability < 10_000) {
    return {
      netLiability,
      applies: false,
      note: 'Net liability (after TDS) is below ₹10,000 — no advance tax required.',
      schedule: [],
      fy,
    };
  }
  const schedule = getAdvanceTaxSchedule(fy);
  const rows: AdvanceTaxRow[] = (mode === 'presumptive' ? [schedule[3]] : schedule).map(
    (row, i, arr) => {
      const cumulativeDue = round2(netLiability * row.cumulativePct);
      const totalPaidByDue = paid
        .filter((p) => p.date <= row.dueDate)
        .reduce((s, p) => s + (Number(p.amount) || 0), 0);
      const shortfall = Math.max(0, cumulativeDue - totalPaidByDue);
      const prevCumulative = mode === 'presumptive' ? 0 : arr[i - 1]?.cumulativePct || 0;
      const installmentDue = round2(netLiability * (row.cumulativePct - prevCumulative));
      return {
        ...row,
        installmentDue,
        cumulativeDue,
        totalPaidByDue,
        shortfall,
      };
    }
  );
  const totalPaid = paid.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  return {
    applies: true,
    netLiability,
    totalPaid: round2(totalPaid),
    totalOutstanding: round2(Math.max(0, netLiability - totalPaid)),
    schedule: rows,
    mode,
    fy,
  };
}

/**
 * Rule 119A rounding helper. Round DOWN to nearest ₹100.
 */
function rule119A(amount: number): number {
  return Math.floor(Math.max(0, Number(amount) || 0) / 100) * 100;
}

/**
 * Section 234C interest — for shortfall in any installment.
 */
export function compute234CInterest(schedule: AdvanceTaxScheduleResult): number {
  if (!schedule.applies || !schedule.schedule.length) return 0;
  const netLiab = schedule.netLiability;
  // Presumptive: single installment at 15-Mar, 1 month × 1% on shortfall.
  if (schedule.mode === 'presumptive' || schedule.schedule.length === 1) {
    const only = schedule.schedule[0];
    const shortfall = rule119A(netLiab - (only?.totalPaidByDue || 0));
    return round2(shortfall * 0.01);
  }
  let interest = 0;
  const [i1, i2, i3, i4] = schedule.schedule;
  if (i1 && i1.totalPaidByDue < 0.12 * netLiab) {
    const shortfall = rule119A(netLiab * 0.15 - i1.totalPaidByDue);
    interest += shortfall * 0.03;
  }
  if (i2 && i2.totalPaidByDue < 0.36 * netLiab) {
    const shortfall = rule119A(netLiab * 0.45 - i2.totalPaidByDue);
    interest += shortfall * 0.03;
  }
  if (i3) {
    const shortfall = rule119A(netLiab * 0.75 - i3.totalPaidByDue);
    interest += shortfall * 0.03;
  }
  if (i4) {
    const shortfall = rule119A(netLiab - i4.totalPaidByDue);
    interest += shortfall * 0.01;
  }
  return round2(interest);
}

/**
 * Section 234A interest — for late filing of the return past the due date.
 */
export function compute234AInterest(
  netTaxPayable: number,
  taxPaid: number,
  filingDate?: string,
  dueDate?: string,
  fy: string = CURRENT_FY
): number {
  const outstanding = Math.max(0, (Number(netTaxPayable) || 0) - (Number(taxPaid) || 0));
  if (outstanding <= 0) return 0;
  let due: Date;
  if (dueDate) {
    due = new Date(dueDate);
  } else {
    const startYear = Number(String(fy).split('-')[0]);
    if (!Number.isFinite(startYear)) return 0;
    due = new Date(`${startYear + 1}-07-31`);
  }
  const filed = filingDate ? new Date(filingDate) : new Date();
  if (!(filed > due)) return 0;
  const yearDiff = filed.getFullYear() - due.getFullYear();
  const monthDiff = filed.getMonth() - due.getMonth();
  let months = yearDiff * 12 + monthDiff;
  if (filed.getDate() > due.getDate()) months += 1;
  months = Math.max(1, months);
  const shortfall = rule119A(outstanding);
  return round2(shortfall * 0.01 * months);
}

/**
 * Section 234B interest — for shortfall of ≥ 10% of total tax by 31 Mar.
 */
export function compute234BInterest(
  schedule: AdvanceTaxScheduleResult,
  assessmentPaymentDate?: string,
  fy?: string
): number {
  if (!schedule.applies) return 0;
  const paidByYearEnd = schedule.totalPaid || 0;
  const netLiab = schedule.netLiability;
  if (paidByYearEnd >= 0.9 * netLiab) return 0;
  const shortfall = rule119A(netLiab - paidByYearEnd);
  const useFy = schedule?.fy || fy || CURRENT_FY;
  const startYear = Number(String(useFy).split('-')[0]);
  if (!Number.isFinite(startYear)) return 0;
  const fyEnd = new Date(`${startYear + 1}-04-01`);
  const payDate = assessmentPaymentDate ? new Date(assessmentPaymentDate) : new Date();
  if (payDate <= fyEnd) return 0;
  const yearDiff = payDate.getFullYear() - fyEnd.getFullYear();
  const monthDiff = payDate.getMonth() - fyEnd.getMonth();
  let months = yearDiff * 12 + monthDiff;
  if (payDate.getDate() > fyEnd.getDate()) months += 1;
  months = Math.max(1, months);
  return round2(shortfall * 0.01 * months);
}

// ============================================================================
// ITR-4 field mapping for the Filing Summary PDF
// ============================================================================

/**
 * Build the ITR-4 field list from computed tax + presumptive income + deductions.
 */
export function buildITR4FieldMap(
  inputs: TaxComputationInputs,
  tax: TaxComputationResult,
  presumptive?: any,
  deductions?: Record<string, number>
): ITR4FieldMapRow[] {
  const rows: ITR4FieldMapRow[] = [];
  rows.push({ section: 'Part A — General', field: 'PAN', value: '', note: 'Fill from your profile' });
  rows.push({ section: 'Part A — General', field: 'Filing Status', value: 'Filed under §139(1) — before due date' });
  rows.push({ section: 'Part A — General', field: 'Aadhaar', value: '', note: 'Must be linked' });

  if (presumptive?.section === '44AD') {
    rows.push({ section: 'Part A — Nature of Business', field: 'Section 44AD (Trading / Retail / Manufacturing)', value: 'Yes' });
    rows.push({ section: 'Part A — Nature of Business', field: 'Gross Turnover (digital)', value: presumptive.digitalReceipts });
    rows.push({ section: 'Part A — Nature of Business', field: 'Gross Turnover (cash)', value: presumptive.cashReceipts });
  } else if (presumptive?.section === '44ADA') {
    rows.push({ section: 'Part A — Nature of Business', field: 'Section 44ADA (Profession)', value: 'Yes' });
    rows.push({ section: 'Part A — Nature of Business', field: 'Gross Receipts', value: presumptive.turnover });
  } else if (presumptive?.section === '44AE') {
    rows.push({ section: 'Part A — Nature of Business', field: 'Section 44AE (Transport)', value: 'Yes' });
  }

  const salary = Number(inputs.salary) || 0;
  const std = tax.standardDeduction || 0;
  rows.push({ section: 'B — Income', field: 'B1. Salary (gross)', value: salary, note: salary > 0 ? 'From Form 16' : undefined });
  if (std) rows.push({ section: 'B — Income', field: '  Less: Standard Deduction', value: -std });
  rows.push({ section: 'B — Income', field: '  Net Salary', value: Math.max(0, salary - std) });
  rows.push({ section: 'B — Income', field: 'B2. House Property (net)', value: Number(inputs.housePropertyIncome) || 0 });
  rows.push({
    section: 'B — Income',
    field: 'B3. Business / Profession',
    value: presumptive?.presumptiveIncome ?? (Number(inputs.businessIncome) || 0),
    note: presumptive ? `Presumptive @ §${presumptive.section}` : 'From books',
  });
  rows.push({ section: 'B — Income', field: 'B4. Other Sources', value: Number(inputs.otherSources) || 0 });
  rows.push({ section: 'B — Income', field: 'B5. Gross Total Income', value: tax.grossTotalIncome, bold: true });

  if (tax.regime === 'old') {
    rows.push({ section: 'C — Deductions (Chapter VI-A)', field: '§80C', value: Math.min(150_000, Number(deductions?.['80C']) || 0) });
    rows.push({ section: 'C — Deductions (Chapter VI-A)', field: '§80CCD(1B) — NPS', value: Math.min(50_000, Number(deductions?.['80CCD1B']) || 0) });
    rows.push({ section: 'C — Deductions (Chapter VI-A)', field: '§80D — Health Insurance', value: Math.min(100_000, Number(deductions?.['80D']) || 0) });
    rows.push({ section: 'C — Deductions (Chapter VI-A)', field: '§80TTA — Savings Interest', value: Math.min(10_000, Number(deductions?.['80TTA']) || 0) });
    rows.push({ section: 'C — Deductions (Chapter VI-A)', field: '§80E — Education Loan Interest', value: Number(deductions?.['80E']) || 0 });
    rows.push({ section: 'C — Deductions (Chapter VI-A)', field: '§80G — Donations', value: Number(deductions?.['80G']) || 0 });
    rows.push({ section: 'C — Deductions (Chapter VI-A)', field: '  Total Chapter VI-A', value: tax.allowedDeductions, bold: true });
  } else {
    rows.push({
      section: 'C — Deductions (Chapter VI-A)',
      field: '§80CCD(2) — Employer NPS',
      value: Number(deductions?.['80CCD2']) || 0,
      note: 'Only deduction allowed under new regime',
    });
  }

  rows.push({ section: 'D — Tax Computation', field: 'D1. Taxable Income', value: tax.taxableIncome, bold: true });
  rows.push({ section: 'D — Tax Computation', field: 'D2. Tax on Total Income (slab)', value: tax.slabTax });
  if (tax.stcgTax) rows.push({ section: 'D — Tax Computation', field: '   + STCG (15%)', value: tax.stcgTax });
  if (tax.ltcgTax) rows.push({ section: 'D — Tax Computation', field: '   + LTCG (10%)', value: tax.ltcgTax });
  if (tax.rebate87A) rows.push({ section: 'D — Tax Computation', field: '   − §87A Rebate', value: -tax.rebate87A });
  if (tax.surcharge) rows.push({ section: 'D — Tax Computation', field: '   + Surcharge', value: tax.surcharge });
  rows.push({ section: 'D — Tax Computation', field: '   + Health & Ed Cess (4%)', value: tax.cess });
  rows.push({ section: 'D — Tax Computation', field: 'D3. TOTAL TAX PAYABLE', value: tax.totalTax, bold: true, big: true });

  return rows;
}

function formatINR(n: number | string): string {
  const rounded = Math.round(Number(n) || 0);
  return '₹' + rounded.toLocaleString('en-IN');
}

export default {
  CURRENT_FY,
  OLD_REGIME_SLABS,
  OLD_REGIME_SLABS_SENIOR,
  OLD_REGIME_SLABS_SUPER_SENIOR,
  getOldRegimeSlabs,
  NEW_REGIME_SLABS_FY_2024_25,
  NEW_REGIME_SLABS_FY_2025_26,
  NEW_REGIME_SLABS,
  getNewRegimeSlabs,
  get87AConfig,
  getCapitalGainsConfig,
  DEDUCTION_CAPS,
  effectiveDeductionCap,
  computeSlabTax,
  computeSurcharge,
  computeRebate87A,
  computeCess,
  standardDeduction,
  computeAllowedDeductions,
  computeTax,
  compareRegimes,
  AUTO_CATEGORY_RULES,
  autoCategorize,
  parseBankStatement,
  compute44AD,
  compute44ADA,
  compute44AE,
  getAdvanceTaxSchedule,
  ADVANCE_TAX_SCHEDULE,
  computeAdvanceTaxSchedule,
  compute234CInterest,
  compute234AInterest,
  compute234BInterest,
  buildITR4FieldMap,
};
