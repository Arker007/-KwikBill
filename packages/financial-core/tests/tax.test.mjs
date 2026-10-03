// v1.10.1 — Extracted financial-core package test runner.
// Run: `node packages/financial-core/tests/tax.test.mjs`

import {
  calculateLineItemTax,
  generateEWayBillJSON,
  computeInvoiceTotals,
  isUnionTerritoryWithoutLegislature,
  getStateCode,
} from '../src/index.ts';
import {
  compute44AE,
  computeSurcharge,
  computeAdvanceTaxSchedule,
  compute234CInterest,
  compute234BInterest,
  compute234AInterest,
  DEDUCTION_CAPS,
  effectiveDeductionCap,
  computeTax,
  computeAllowedDeductions,
  computeRebate87A,
  getAdvanceTaxSchedule,
  getCapitalGainsConfig,
  get87AConfig,
  getOldRegimeSlabs,
  getNewRegimeSlabs,
  CURRENT_FY,
  NEW_REGIME_SLABS_FY_2025_26,
} from '../../../src/utils/itr.js';

let passed = 0, failed = 0;
function eq(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.log(`  ✗ ${label}\n     expected: ${JSON.stringify(expected)}\n     actual:   ${JSON.stringify(actual)}`); }
}
function approx(actual, expected, label, tol = 0.01) {
  const ok = Math.abs(actual - expected) < tol;
  if (ok) { passed++; console.log(`  ✓ ${label} (${actual})`); }
  else { failed++; console.log(`  ✗ ${label}  expected≈${expected}  actual=${actual}`); }
}
function truthy(x, label) { if (x) { passed++; console.log(`  ✓ ${label}`); } else { failed++; console.log(`  ✗ ${label}  (got ${JSON.stringify(x)})`); } }

// ─────────────────────────────────────────────────────────────────────
// C5 — Interstate detection when profile.state is BLANK
// ─────────────────────────────────────────────────────────────────────
console.log('\n[C5] Interstate detection when business state is blank');
{
  const r = computeInvoiceTotals({
    items: [{ quantity: 1, rate: 100000, discount: 0, taxPercent: 18 }],
    profile: { country: 'India', state: '' },
    client: { state: 'Karnataka' },
    details: { placeOfSupply: 'Karnataka' },
    showGST: true,
  });
  truthy(r.warnings && r.warnings.some(w => /state.*not set/i.test(w)),
    'blank business state produces a "state not set" warning');
  truthy(r.needsProfileFix, 'sets needsProfileFix flag');
}

// ─────────────────────────────────────────────────────────────────────
// C6 — UTGST for intra-UT supplies (Chandigarh)
// ─────────────────────────────────────────────────────────────────────
console.log('\n[C6] UTGST bucket for intra-UT supplies');
{
  eq(isUnionTerritoryWithoutLegislature('04'), true, 'Chandigarh (04) → UT w/o legislature');
  eq(isUnionTerritoryWithoutLegislature('35'), true, 'A&N (35) → UT w/o legislature');
  eq(isUnionTerritoryWithoutLegislature('38'), true, 'Ladakh (38) → UT w/o legislature');
  eq(isUnionTerritoryWithoutLegislature('31'), true, 'Lakshadweep (31) → UT w/o legislature');
  eq(isUnionTerritoryWithoutLegislature('26'), true, 'DN&DD (26) → UT w/o legislature');
  eq(isUnionTerritoryWithoutLegislature('07'), false, 'Delhi (07) → HAS legislature (SGST, not UTGST)');
  eq(isUnionTerritoryWithoutLegislature('34'), false, 'Puducherry (34) → HAS legislature');
  eq(isUnionTerritoryWithoutLegislature('27'), false, 'Maharashtra → not UT');

  // Intra-Chandigarh supply → CGST + UTGST, sgst=0, utgst=9%
  const r = computeInvoiceTotals({
    items: [{ quantity: 1, rate: 100, discount: 0, taxPercent: 18 }],
    profile: { country: 'India', state: 'Chandigarh' },
    client: { state: 'Chandigarh' },
    details: { placeOfSupply: 'Chandigarh' },
    showGST: true,
  });
  approx(r.cgst, 9, 'Chandigarh→Chandigarh: CGST = 9');
  approx(r.utgst, 9, 'Chandigarh→Chandigarh: UTGST = 9');
  approx(r.sgst, 0, 'Chandigarh→Chandigarh: SGST = 0');
  approx(r.igst, 0, 'Chandigarh→Chandigarh: IGST = 0');
}

// ─────────────────────────────────────────────────────────────────────
// C7 — E-Way Bill taxable value when tax-inclusive
// ─────────────────────────────────────────────────────────────────────
console.log('\n[C7] E-Way Bill respects tax-inclusive');
{
  const items = [{ quantity: 1, rate: 118, discount: 0, taxPercent: 18, hsn: '9018', name: 'Widget' }];
  const totals = computeInvoiceTotals({
    items, profile: { country: 'India', state: 'Maharashtra', gstin: '27ABCDE1234F1Z5' },
    client: { state: 'Maharashtra' }, details: { placeOfSupply: 'Maharashtra' },
    showGST: true, taxInclusive: true,
  });
  const ewb = generateEWayBillJSON(
    { country: 'India', state: 'Maharashtra', gstin: '27ABCDE1234F1Z5', pin: '400001', address: 'Mumbai' },
    { state: 'Maharashtra', gstin: '27ZZZZZ9999Z1Z9', pin: '400002', address: 'Mumbai' },
    { invoiceNumber: 'INV/1', invoiceDate: '2026-07-08' },
    items, totals, 'tax-invoice',
    { taxInclusive: true },
  );
  // ₹118 gross MRP → taxable value should be ₹100
  approx(ewb.billLists[0].itemList[0].taxableAmount, 100, 'itemList[0].taxableAmount = 100');
  approx(ewb.billLists[0].totalValue, 100, 'totalValue = 100');
  approx(ewb.billLists[0].totInvValue, 118, 'totInvValue = 118');
}

// ─────────────────────────────────────────────────────────────────────
// H6 — TCS 206C(1H) base includes GST
// ─────────────────────────────────────────────────────────────────────
console.log('\n[H6/H7] TCS/TDS on right base + 50L threshold');
{
  const rNotTriggered = computeInvoiceTotals({
    items: [{ quantity: 1, rate: 100000, discount: 0, taxPercent: 18 }],
    profile: { country: 'India', state: 'Maharashtra' },
    client: { state: 'Karnataka' }, details: { placeOfSupply: 'Karnataka' },
    showGST: true,
    invoiceOptions: { showTCS: true, tcsRate: 0.1, tcsCumulativeThisYear: 100000 },
  });
  approx(rNotTriggered.tcsAmount, 0, 'below ₹50L cumulative → TCS = 0');

  const rTriggered = computeInvoiceTotals({
    items: [{ quantity: 1, rate: 100000, discount: 0, taxPercent: 18 }],
    profile: { country: 'India', state: 'Maharashtra' },
    client: { state: 'Karnataka' }, details: { placeOfSupply: 'Karnataka' },
    showGST: true,
    invoiceOptions: { showTCS: true, tcsRate: 0.1, tcsCumulativeThisYear: 5000000 },
  });
  approx(rTriggered.tcsAmount, 118, 'above ₹50L: TCS = 0.1% × 118000 = 118');
}

// ─────────────────────────────────────────────────────────────────────
// M5 — RCM + tax-inclusive should not double-charge buyer
// ─────────────────────────────────────────────────────────────────────
console.log('\n[M5] RCM + tax-inclusive back-out embedded tax');
{
  const r = computeInvoiceTotals({
    items: [{ quantity: 1, rate: 118, discount: 0, taxPercent: 18 }],
    profile: { country: 'India', state: 'Maharashtra' },
    client: { state: 'Maharashtra' }, details: { placeOfSupply: 'Maharashtra' },
    showGST: true, taxInclusive: true,
    invoiceOptions: { reverseCharge: true },
  });
  approx(r.total, 100, 'RCM + inclusive: seller invoice total = 100, not 118');
}

// ─────────────────────────────────────────────────────────────────────
// M8 — totalTaxCollected includes cess (+ UTGST)
// ─────────────────────────────────────────────────────────────────────
console.log('\n[M8] totalTaxCollected includes cess and UTGST');
{
  const r = computeInvoiceTotals({
    items: [{ quantity: 1, rate: 100, discount: 0, taxPercent: 18, cessPercent: 15 }],
    profile: { country: 'India', state: 'Chandigarh' },
    client: { state: 'Chandigarh' }, details: { placeOfSupply: 'Chandigarh' },
    showGST: true,
  });
  approx(r.totalTaxAmount, 9 + 9 + 0 + 15, 'total tax = CGST 9 + UTGST 9 + IGST 0 + cess 15 = 33');
}

// ─────────────────────────────────────────────────────────────────────
// M10 — non-numeric rate coerced safely
// ─────────────────────────────────────────────────────────────────────
console.log('\n[M10] Non-numeric rate/qty stays finite');
{
  const r = computeInvoiceTotals({
    items: [{ quantity: '3', rate: 'abc', discount: 0, taxPercent: 18 }],
    profile: { country: 'India', state: 'Maharashtra' },
    client: { state: 'Maharashtra' }, details: { placeOfSupply: 'Maharashtra' },
    showGST: true,
  });
  eq(Number.isFinite(r.total) && r.total >= 0, true, 'total is finite non-negative');
  approx(r.subtotal, 0, 'bad rate → subtotal 0');
}

// ─────────────────────────────────────────────────────────────────────
// H11 — Per-line rounding consistent between invoice and GSTR-1 export
// ─────────────────────────────────────────────────────────────────────
console.log('\n[H11] Rounding: sum-of-rounded-lines used consistently');
{
  const items = [
    { quantity: 1, rate: 42.05, discount: 0, taxPercent: 18 },
    { quantity: 1, rate: 42.05, discount: 0, taxPercent: 18 },
    { quantity: 1, rate: 42.05, discount: 0, taxPercent: 18 },
  ];
  const r = computeInvoiceTotals({
    items, profile: { country: 'India', state: 'Maharashtra' },
    client: { state: 'Maharashtra' }, details: { placeOfSupply: 'Maharashtra' },
    showGST: true,
  });
  const perLine = items.map(it => Math.round(it.rate * it.taxPercent) / 100);
  const perLineCgst = perLine.reduce((s, v) => s + v/2, 0);
  approx(r.cgst, Math.round(perLineCgst * 100) / 100,
    'invoice CGST equals sum-of-per-line-rounded-halves');
}

// ─────────────────────────────────────────────────────────────────────
// ITR fixes
// ─────────────────────────────────────────────────────────────────────
console.log('\n[H8] 234C for presumptive: 1% × 1 month × Q4 shortfall');
{
  const sched = computeAdvanceTaxSchedule(100000, 0, [], 'presumptive');
  const int234c = compute234CInterest(sched);
  approx(int234c, 1000, '234C = 1000');
}

console.log('\n[H9] Surcharge 15% cap on 111A/112A gains');
{
  const s = computeSurcharge(1000000, 55000000, 'new', { specialRateTax: 15000 });
  approx(s, 248500, 'surcharge respects 15% cap on 111A/112A tax portion');
}

console.log('\n[H10] 80D cap depends on senior status');
{
  approx(effectiveDeductionCap('80D', { selfSenior: false, parentsSenior: false }), 50_000, '80D non-senior = 50k');
  approx(effectiveDeductionCap('80D', { selfSenior: false, parentsSenior: true  }), 75_000, '80D senior parents = 75k');
  approx(effectiveDeductionCap('80D', { selfSenior: true,  parentsSenior: true  }), 100_000, '80D both senior = 100k');
  approx(effectiveDeductionCap('80C', {}), 150_000, '80C untouched');
}

console.log('\n[M6] 234B uses calendar months');
{
  const sched = { applies: true, netLiability: 100000, totalPaid: 0, fy: '2024-25' };
  const int234b = compute234BInterest(sched, '2025-05-31');
  approx(int234b, 2000, 'Apr-1 to May-31 = 2 calendar months → 2000');
}

console.log('\n[V31-C2] FY 25-26 new regime — Budget 2025 slabs + ₹60k rebate at ₹12L');
{
  const r = computeTax({ salary: 1_275_000, regime: 'new', fy: '2025-26' });
  approx(r.totalTax, 0, '₹12.75L salary FY 25-26 new regime → ₹0 tax');
  const r2 = computeTax({ salary: 1_400_000, regime: 'new', fy: '2025-26' });
  truthy(r2.totalTax > 0, '₹14L salary above rebate threshold → some tax');
}

console.log('\n[V31-C4] Capital gains rates — post-July-2024');
{
  const cg = getCapitalGainsConfig('2025-26');
  approx(cg.stcgRate, 0.20, 'STCG rate FY 25-26 = 20%');
  approx(cg.ltcgRate, 0.125, 'LTCG rate FY 25-26 = 12.5%');
  approx(cg.ltcgExemption, 125_000, 'LTCG exemption FY 25-26 = ₹1.25L');
  const r = computeTax({ ltcgAtSpecialRate: 1_000_000, regime: 'new', fy: '2025-26' });
  approx(r.ltcgTax, 109_375, '₹10L LTCG → ₹1,09,375 tax');
  const r2 = computeTax({ stcgAtSpecialRate: 500_000, regime: 'new', fy: '2025-26' });
  approx(r2.stcgTax, 100_000, '₹5L STCG → ₹1,00,000 tax');
}

console.log('\n[V31-C1] 15% surcharge cap on 111A/112A gains');
{
  const r = computeTax({ salary: 55_000_000, ltcgAtSpecialRate: 1_000_000, regime: 'new', fy: '2025-26' });
  truthy(r.specialRateTax > 0, 'specialRateTax populated');
  truthy(r.surcharge > 0, 'surcharge computed');
  const specialSurcharge = computeSurcharge(r.specialRateTax, 55_000_000, 'new', { specialRateTax: r.specialRateTax });
  approx(specialSurcharge, r.specialRateTax * 0.15, '15% cap on specialRateTax portion honored');
}

console.log('\n[V31-C3] Advance-tax due dates are FY-relative');
{
  const s2526 = getAdvanceTaxSchedule('2025-26');
  eq(s2526[0].dueDate, '2025-06-15', 'FY 25-26 Q1 due');
  eq(s2526[3].dueDate, '2026-03-15', 'FY 25-26 Q4 due');
  const s2425 = getAdvanceTaxSchedule('2024-25');
  eq(s2425[0].dueDate, '2024-06-15', 'FY 24-25 Q1 due');
  const sched = computeAdvanceTaxSchedule(500_000, 0, [{ date: '2025-06-14', amount: 75_000 }], 'regular', '2025-26');
  approx(sched.schedule[0].totalPaidByDue, 75_000, 'FY 25-26 payment counts toward Q1');
}

console.log('\n[V31-H1] effectiveDeductionCap wired into computeAllowedDeductions');
{
  const total = computeAllowedDeductions({ '80D': 100_000 }, 'old', { selfSenior: false, parentsSenior: false });
  approx(total, 50_000, 'Non-senior 80D capped at ₹50k');
  const total2 = computeAllowedDeductions({ '80D': 100_000 }, 'old', { selfSenior: true, parentsSenior: true });
  approx(total2, 100_000, 'Both senior 80D allows full ₹1L');
}

console.log('\n[V31-H5] 80CCD(2) capped');
{
  const total = computeAllowedDeductions({ '80CCD2': 500_000 }, 'new', { salary: 1_000_000 });
  approx(total, 100_000, '80CCD(2) private-sector capped at 10%');
  const total2 = computeAllowedDeductions({ '80CCD2': 500_000 }, 'new', { salary: 1_000_000, isGovtEmployee: true });
  approx(total2, 140_000, '80CCD(2) govt-sector capped at 14%');
  const total3 = computeAllowedDeductions({ '80CCD2': 500_000 }, 'new', {});
  approx(total3, 0, '80CCD(2) without salary context → 0');
}

console.log('\n[V31-H6] Senior / super-senior old-regime basic exemption slabs');
{
  const senior = getOldRegimeSlabs(65);
  eq(senior[0].upto, 300_000, 'Senior first slab');
  const superSenior = getOldRegimeSlabs(85);
  eq(superSenior[0].upto, 500_000, 'Super senior first slab');
  const regular = getOldRegimeSlabs(30);
  eq(regular[0].upto, 250_000, 'Regular first slab');
  const r = computeTax({ salary: 300_000, regime: 'old', fy: '2025-26', age: 65 });
  approx(r.slabTax, 0, 'Senior with ₹3L salary → ₹0 slab tax');
}

console.log('\n[V31-H2] 87A eligibility uses TOTAL income');
{
  const r = computeTax({ salary: 530_000, ltcgAtSpecialRate: 50_000, regime: 'old', fy: '2025-26' });
  approx(r.rebate87A, 0, '87A rebate DENIED');
  const r2 = computeTax({ salary: 530_000, regime: 'old', fy: '2025-26' });
  truthy(r2.rebate87A > 0, '87A rebate applies');
}

console.log('\n[V31-H3] Marginal relief on surcharge crossings');
{
  const tax_at_5cr = 1312500;
  const sr = computeSurcharge(tax_at_5cr, 5000010, 'old');
  truthy(sr < 50000, 'Marginal relief caps surcharge');
}

console.log('\n[V31-H4] Rule 119A ₹100 rounding');
{
  const sched = { applies: true, netLiability: 149999, totalPaid: 0, fy: '2024-25' };
  const int234b = compute234BInterest(sched, '2025-05-31');
  approx(int234b, 2998, 'Rule 119A rounded down shortfall');
}

console.log('\n[V31-M2] Section 234A — late-filing interest');
{
  const int1 = compute234AInterest(100000, 0, '2026-08-15', undefined, '2025-26');
  approx(int1, 1000, '1 month late');
  const int2 = compute234AInterest(100000, 0, '2026-07-31', undefined, '2025-26');
  approx(int2, 0, 'On due date');
  const int3 = compute234AInterest(100000, 0, '2026-11-01', undefined, '2025-26');
  approx(int3, 4000, '4 months late');
  const int4 = compute234AInterest(100000, 100000, '2026-08-15', undefined, '2025-26');
  approx(int4, 0, 'Fully paid');
  const int5 = compute234AInterest(149999, 0, '2026-08-15', undefined, '2025-26');
  approx(int5, 1499, 'Rule 119A rounding');
  const int6 = compute234AInterest(100000, 0, '2026-11-15', '2026-10-31', '2025-26');
  approx(int6, 1000, 'Explicit due date');
}

console.log('\n[V31-M3] §44AE parity');
{
  const ok = compute44AE({ heavyVehicleMonths: 24, heavyVehicleTonnage: 12, lightVehicleMonths: 0 });
  eq(ok.isEligible, true, 'Eligible');
  approx(ok.deemedIncome, 288000, 'Deemed income');
  const over = compute44AE({ heavyVehicleMonths: 132, heavyVehicleTonnage: 15, lightVehicleMonths: 0 });
  eq(over.isEligible, false, 'Not eligible');
  const neg = compute44AE({ heavyVehicleMonths: -5, heavyVehicleTonnage: 15, lightVehicleMonths: 0 });
  approx(neg.deemedIncome, 0, 'Negative clamped');
  const under = compute44AE({ heavyVehicleMonths: 24, heavyVehicleTonnage: 12, lightVehicleMonths: 0, declaredIncome: 100000 });
  truthy(under.notes.some(n => /less than the presumptive minimum/i.test(n)), 'Warns when under');
}

console.log('\n────────────────────────────────────────');
console.log(`Passed: ${passed}   Failed: ${failed}`);
if (failed) process.exit(1);
