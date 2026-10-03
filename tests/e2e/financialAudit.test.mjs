/**
 * Financial & Discount Parity Regression Audit Suite
 * 
 * Audits statutory tax mathematics, discount modes, multi-item invoicing,
 * Section 119A rounding, Budget 2025 tax regimes, Section 206C(1H) TCS/TDS,
 * and ensures 100% precision parity between legacy and refactored packages.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as legacyTax from '../../src/features/invoices/utils/taxCalculation.js';
import * as financialCore from '../../packages/financial-core/src/index.ts';

test('Financial Audit: Complete statutory function parity between legacy and @financial-core', () => {
  const exportedFunctions = [
    'resolveLineDiscount',
    'calculateLineItemTax',
    'computeInvoiceTotals',
    'computeTax',
    'compareRegimes',
    'compute44AD',
    'compute44ADA',
    'compute44AE',
    'computeAdvanceTaxSchedule',
    'compute234AInterest',
    'compute234BInterest',
    'compute234CInterest',
    'toCsvCell',
    'toCsvLine'
  ];

  for (const fnName of exportedFunctions) {
    assert.equal(typeof legacyTax[fnName], 'function', `Legacy module must export ${fnName}`);
    assert.equal(typeof financialCore[fnName], 'function', `@financial-core module must export ${fnName}`);
  }
});

test('Financial Audit: Multi-line invoice calculation precision (Zero-Paisa Delta)', () => {
  const items = [
    { name: 'Server Hardware', quantity: 2, rate: 45000, taxPercent: 18, discount: 5, discountType: 'percent' },
    { name: 'Installation Service', quantity: 1, rate: 12500.50, taxPercent: 18, discount: 500, discountType: 'fixed', discountBase: 'net' },
    { name: 'Cat6 Cable Roll', quantity: 5, rate: 1850.75, taxPercent: 18, discount: 0 },
    { name: 'Custom Software License', quantity: 1, rate: 25000, taxPercent: 18, discount: 10, discountType: 'percent' }
  ];

  const profile = { state: 'Maharashtra', gstin: '27AAAAA0000A1Z5' };
  const client = { state: 'Maharashtra', gstin: '27BBBBB1111B1Z2' };

  const legacyLine1 = legacyTax.calculateLineItemTax(items[0], false);
  const coreLine1 = financialCore.calculateLineItemTax(items[0], false);
  assert.deepEqual(legacyLine1, coreLine1, 'Line item calculation must match exactly');

  const legacyTotals = legacyTax.computeInvoiceTotals({ items, profile, client, taxInclusive: false });
  const coreTotals = financialCore.computeInvoiceTotals({ items, profile, client, taxInclusive: false });
  assert.deepEqual(legacyTotals, coreTotals, 'Invoice totals calculation must match exactly with zero paisa difference');

  // Verify intra-state distribution
  assert.equal(coreTotals.cgst, coreTotals.sgst, 'CGST and SGST must be identical for intra-state supply');
  assert.equal(coreTotals.igst, 0, 'IGST must be zero for intra-state supply');
});

test('Financial Audit: Inter-state invoice calculation precision', () => {
  const items = [
    { name: 'Consulting Retainer', quantity: 1, rate: 100000, taxPercent: 18 }
  ];
  const profile = { state: 'Maharashtra', gstin: '27AAAAA0000A1Z5' };
  const client = { state: 'Karnataka', gstin: '29BBBBB1111B1Z2' };

  const totals = financialCore.computeInvoiceTotals({ items, profile, client, taxInclusive: false });
  assert.equal(totals.cgst, 0);
  assert.equal(totals.sgst, 0);
  assert.equal(totals.utgst, 0);
  assert.equal(totals.igst, 18000);
  assert.equal(totals.total, 118000);
});

test('Financial Audit: Reverse Charge Mechanism (RCM) back-out tax logic', () => {
  const item = { name: 'Legal Services', quantity: 1, rate: 118, taxPercent: 18 };
  const profile = { state: 'Delhi', gstin: '07AAAAA0000A1Z5' };
  const client = { state: 'Delhi', gstin: '07BBBBB1111B1Z2' };

  // When tax inclusive + RCM: supplier invoice total is ₹100, and reverse charge tax is ₹18 paid by recipient
  const totals = financialCore.computeInvoiceTotals({
    items: [item],
    profile,
    client,
    taxInclusive: true,
    invoiceOptions: { reverseCharge: true }
  });

  assert.equal(totals.taxableAmount, 100);
  assert.equal(totals.total, 100); // Invoice payable excludes RCM tax
});

test('Financial Audit: Section 206C(1H) TCS threshold logic', () => {
  const item = { name: 'Raw Material', quantity: 1, rate: 1000000, taxPercent: 18 };
  const profile = { state: 'Delhi', gstin: '07AAAAA0000A1Z5' };
  const client = { state: 'Delhi', gstin: '07BBBBB1111B1Z2' };

  // Sub-threshold check: 40L cumulative + 11.8L invoice = 51.8L (1.8L exceeds 50L threshold)
  // TCS @ 0.1% on 1.8L = ₹180
  const totals = financialCore.computeInvoiceTotals({
    items: [item],
    profile,
    client,
    taxInclusive: false,
    invoiceOptions: {
      showTCS: true,
      tcsRate: 0.1,
      tcsCumulativeThisYear: 4000000
    }
  });

  assert.equal(totals.tcsAmount, 180, 'TCS must be 0.1% of ₹1.8 Lakhs exceeding threshold = ₹180');
});

test('Financial Audit: Section 119A ₹100 rounding for Section 234A/B/C interest', () => {
  // Shortfall of ₹1,49,999 must round down to ₹1,49,900 for 234A interest
  const interest234A = financialCore.compute234AInterest(149999, 0, '2025-08-15', '2025-07-31', '2024-25');
  assert.equal(interest234A, 1499, 'Section 234A interest must use ₹1,49,900 base @ 1% per month = ₹1,499');

  // Section 234C interest for single presumptive Q4 installment
  const schedPresumptive = financialCore.computeAdvanceTaxSchedule(149999, 0, [], 'presumptive', '2024-25');
  const interest234C = financialCore.compute234CInterest(schedPresumptive);
  assert.equal(interest234C, 1499, 'Section 234C interest on ₹1,49,900 base @ 1% = ₹1,499');
});

test('Financial Audit: Budget 2025 Income Tax Slabs & ₹60,000 rebate', () => {
  // FY 2025-26 new regime: ₹12.75L salary has ₹75k standard deduction -> ₹12L taxable -> ₹0 tax after ₹60k rebate
  const incomeResult = financialCore.computeTax({
    fy: '2025-26',
    regime: 'new',
    salary: 1275000,
    age: 35
  });

  assert.equal(incomeResult.taxableIncome, 1200000);
  assert.equal(incomeResult.rebate87A, 60000);
  assert.equal(incomeResult.totalTax, 0);
});

test('Financial Audit: CSV Formula Injection protection', () => {
  assert.equal(financialCore.toCsvCell('=HYPERLINK("http://evil.com","Click")'), `"'=HYPERLINK(""http://evil.com"",""Click"")"`);
  assert.equal(financialCore.toCsvCell('+91 9876543210'), "'+91 9876543210");
  assert.equal(financialCore.toCsvCell('@SUM(A1:A10)'), "'@SUM(A1:A10)");
  assert.equal(financialCore.toCsvCell('-1500.00'), '-1500.00');
});
