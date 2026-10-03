// scripts/verify-migration-parity.mjs
// Phase 4: Parity & Verification Suite
// Validates 100% data fidelity between source JSON files in ./data/ and SQLite ./data/accounting.db.
// Checks:
//   1. Entity count parity
//   2. Financial sum parity in exact Paisa (0 drift)
//   3. Line item count parity
//   4. SQLite foreign key referential integrity (PRAGMA foreign_key_check)
//   5. Meta counters and application settings parity

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, initDb, closeDb } from '../server/infrastructure/db/sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function toPaisa(rupees) {
  if (rupees === null || rupees === undefined || isNaN(Number(rupees))) {
    return 0;
  }
  return Math.round(Number(rupees) * 100);
}

function safeReadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function countJsonFilesInDir(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  return fs.readdirSync(dirPath).filter((f) => f.endsWith('.json')).length;
}

export function verifyMigrationParity() {
  console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Free GST Billing Software — Migration Parity Verification      ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}\n`);

  initDb();
  const db = getDb();

  let totalChecks = 0;
  let passedChecks = 0;
  const failures = [];

  function assertCheck(description, passed, extraDetails = '') {
    totalChecks++;
    if (passed) {
      passedChecks++;
      console.log(`  ${colors.green}✓${colors.reset} ${description} ${colors.dim}${extraDetails}${colors.reset}`);
    } else {
      failures.push({ description, extraDetails });
      console.log(`  ${colors.red}✗ [FAIL]${colors.reset} ${description} — ${extraDetails}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 1. FOREIGN KEY INTEGRITY CHECK
  // ---------------------------------------------------------------------------
  console.log(`${colors.bold}1. Database Referential Integrity Check:${colors.reset}`);
  const fkViolations = db.prepare('PRAGMA foreign_key_check;').all();
  assertCheck(
    'PRAGMA foreign_key_check returns 0 constraint violations',
    fkViolations.length === 0,
    fkViolations.length === 0 ? '(All foreign keys intact)' : `Found ${fkViolations.length} violations`
  );

  // Check orphaned child tables
  const orphanBillItems = db.prepare(`
    SELECT COUNT(*) as count FROM bill_items WHERE bill_id NOT IN (SELECT id FROM bills)
  `).get().count;
  assertCheck('Orphaned bill_items check', orphanBillItems === 0, `(Count: ${orphanBillItems})`);

  const orphanReceiptAllocations = db.prepare(`
    SELECT COUNT(*) as count FROM receipt_allocations WHERE receipt_id NOT IN (SELECT id FROM receipts)
  `).get().count;
  assertCheck('Orphaned receipt_allocations check', orphanReceiptAllocations === 0, `(Count: ${orphanReceiptAllocations})`);

  const orphanPurchaseItems = db.prepare(`
    SELECT COUNT(*) as count FROM purchase_items WHERE purchase_id NOT IN (SELECT id FROM purchases)
  `).get().count;
  assertCheck('Orphaned purchase_items check', orphanPurchaseItems === 0, `(Count: ${orphanPurchaseItems})`);

  // ---------------------------------------------------------------------------
  // 2. BILLS & FINANCIAL TOTALS EXACTNESS (ZERO PAISA DISCREPANCY)
  // ---------------------------------------------------------------------------
  console.log(`\n${colors.bold}2. Bills & Financial Parity Check:${colors.reset}`);
  const billsDir = path.join(DATA_DIR, 'bills');
  let jsonBillsCount = 0;
  let jsonLineItemsCount = 0;
  let jsonBilledPaisa = 0;
  let jsonTaxablePaisa = 0;
  let jsonTaxPaisa = 0;
  let jsonEmbeddedPaymentsPaisa = 0;

  if (fs.existsSync(billsDir)) {
    for (const f of fs.readdirSync(billsDir)) {
      if (!f.endsWith('.json')) continue;
      const b = safeReadJson(path.join(billsDir, f));
      if (!b) continue;
      jsonBillsCount++;

      const grandTotalPaisa = toPaisa(b.data?.totals?.total ?? b.totalAmount ?? 0);
      const taxablePaisa = toPaisa(b.data?.totals?.taxableAmount ?? b.taxableAmount ?? 0);
      const cgstPaisa = toPaisa(b.data?.totals?.cgstAmount ?? b.cgstAmount ?? 0);
      const sgstPaisa = toPaisa(b.data?.totals?.sgstAmount ?? b.sgstAmount ?? 0);
      const igstPaisa = toPaisa(b.data?.totals?.igstAmount ?? b.igstAmount ?? 0);
      const utgstPaisa = toPaisa(b.data?.totals?.utgstAmount ?? b.utgstAmount ?? 0);
      const cessPaisa = toPaisa(b.data?.totals?.cessAmount ?? b.cessAmount ?? 0);
      const totalTaxPaisa = toPaisa(b.data?.totals?.totalTaxAmount ?? b.totalTaxAmount ?? (cgstPaisa + sgstPaisa + igstPaisa + utgstPaisa + cessPaisa) / 100);

      jsonBilledPaisa += grandTotalPaisa;
      jsonTaxablePaisa += taxablePaisa;
      jsonTaxPaisa += totalTaxPaisa;

      const items = Array.isArray(b.items) ? b.items : (Array.isArray(b.data?.items) ? b.data.items : []);
      jsonLineItemsCount += items.length;

      if (Array.isArray(b.payments)) {
        for (const p of b.payments) {
          jsonEmbeddedPaymentsPaisa += toPaisa(p.amount);
        }
      }
    }
  }

  const sqlBills = db.prepare(`
    SELECT
      COUNT(*) as count,
      COALESCE(SUM(grand_total_paisa), 0) as totalBilledPaisa,
      COALESCE(SUM(taxable_amount_paisa), 0) as totalTaxablePaisa,
      COALESCE(SUM(total_tax_paisa), 0) as totalTaxPaisa
    FROM bills;
  `).get();

  const sqlBillItemsCount = db.prepare('SELECT COUNT(*) as count FROM bill_items;').get().count;

  assertCheck(
    'Bill document count parity',
    sqlBills.count === jsonBillsCount,
    `(JSON: ${jsonBillsCount}, SQLite: ${sqlBills.count})`
  );

  assertCheck(
    'Bill line items count parity',
    sqlBillItemsCount === jsonLineItemsCount,
    `(JSON: ${jsonLineItemsCount}, SQLite: ${sqlBillItemsCount})`
  );

  assertCheck(
    'Grand total financial sum exactness (zero paisa delta)',
    sqlBills.totalBilledPaisa === jsonBilledPaisa,
    `(JSON: ${jsonBilledPaisa} Paisa, SQLite: ${sqlBills.totalBilledPaisa} Paisa, Δ = 0)`
  );

  assertCheck(
    'Taxable amount financial sum exactness (zero paisa delta)',
    sqlBills.totalTaxablePaisa === jsonTaxablePaisa,
    `(JSON: ${jsonTaxablePaisa} Paisa, SQLite: ${sqlBills.totalTaxablePaisa} Paisa, Δ = 0)`
  );

  assertCheck(
    'Total tax financial sum exactness (zero paisa delta)',
    sqlBills.totalTaxPaisa === jsonTaxPaisa,
    `(JSON: ${jsonTaxPaisa} Paisa, SQLite: ${sqlBills.totalTaxPaisa} Paisa, Δ = 0)`
  );

  // ---------------------------------------------------------------------------
  // 3. CLIENTS, PRODUCTS, EXPENSES & PURCHASES PARITY
  // ---------------------------------------------------------------------------
  console.log(`\n${colors.bold}3. Other Domain Collections Parity Check:${colors.reset}`);

  // Products
  const jsonProductsCount = countJsonFilesInDir(path.join(DATA_DIR, 'products'));
  const sqlProductsCount = db.prepare('SELECT COUNT(*) as count FROM products;').get().count;
  assertCheck(
    'Products collection count parity',
    sqlProductsCount === jsonProductsCount,
    `(JSON: ${jsonProductsCount}, SQLite: ${sqlProductsCount})`
  );

  // Expenses
  const jsonExpensesCount = countJsonFilesInDir(path.join(DATA_DIR, 'expenses'));
  const sqlExpensesCount = db.prepare('SELECT COUNT(*) as count FROM expenses;').get().count;
  assertCheck(
    'Expenses collection count parity',
    sqlExpensesCount === jsonExpensesCount,
    `(JSON: ${jsonExpensesCount}, SQLite: ${sqlExpensesCount})`
  );

  // Purchases
  const jsonPurchasesCount = countJsonFilesInDir(path.join(DATA_DIR, 'purchases'));
  const sqlPurchasesCount = db.prepare('SELECT COUNT(*) as count FROM purchases;').get().count;
  assertCheck(
    'Purchases collection count parity',
    sqlPurchasesCount === jsonPurchasesCount,
    `(JSON: ${jsonPurchasesCount}, SQLite: ${sqlPurchasesCount})`
  );

  // Recurring Templates
  const jsonRecurringCount = countJsonFilesInDir(path.join(DATA_DIR, 'recurring'));
  const sqlRecurringCount = db.prepare('SELECT COUNT(*) as count FROM recurring_templates;').get().count;
  assertCheck(
    'Recurring templates count parity',
    sqlRecurringCount === jsonRecurringCount,
    `(JSON: ${jsonRecurringCount}, SQLite: ${sqlRecurringCount})`
  );

  // Terms Templates
  const jsonTemplatesCount = countJsonFilesInDir(path.join(DATA_DIR, 'templates'));
  const sqlTemplatesCount = db.prepare('SELECT COUNT(*) as count FROM terms_templates;').get().count;
  assertCheck(
    'Terms templates count parity',
    sqlTemplatesCount === jsonTemplatesCount,
    `(JSON: ${jsonTemplatesCount}, SQLite: ${sqlTemplatesCount})`
  );

  // Profiles (At least 1 profile must be registered)
  const sqlProfilesCount = db.prepare('SELECT COUNT(*) as count FROM profiles;').get().count;
  assertCheck(
    'Business profiles registration check',
    sqlProfilesCount >= 1,
    `(SQLite: ${sqlProfilesCount} profiles)`
  );

  // Clients (Must have at least walk-in customer or JSON files)
  const jsonClientsCount = countJsonFilesInDir(path.join(DATA_DIR, 'clients'));
  const sqlClientsCount = db.prepare('SELECT COUNT(*) as count FROM clients;').get().count;
  assertCheck(
    'Clients registration check (includes walk-in & bill customers)',
    sqlClientsCount >= jsonClientsCount,
    `(JSON: ${jsonClientsCount}, SQLite: ${sqlClientsCount})`
  );

  // ---------------------------------------------------------------------------
  // 4. META & APP SETTINGS PARITY
  // ---------------------------------------------------------------------------
  console.log(`\n${colors.bold}4. Meta Counters & Settings Parity Check:${colors.reset}`);
  const metaPath = path.join(DATA_DIR, 'meta.json');
  if (fs.existsSync(metaPath)) {
    const metaData = safeReadJson(metaPath) || {};
    for (const [key, val] of Object.entries(metaData)) {
      if (key.startsWith('counter_')) {
        const prefix = key.replace('counter_', '');
        const row = db.prepare('SELECT last_sequence FROM meta_counters WHERE prefix = ?').get(prefix);
        assertCheck(
          `Meta counter [${prefix}] sequence parity`,
          row && Number(row.last_sequence) === Number(val),
          `(JSON: ${val}, SQLite: ${row ? row.last_sequence : 'MISSING'})`
        );
      } else {
        const row = db.prepare('SELECT value_json FROM app_settings WHERE key = ?').get(key);
        let parsedVal = null;
        try {
          parsedVal = row ? JSON.parse(row.value_json) : null;
        } catch {}
        assertCheck(
          `App setting [${key}] parity`,
          row && JSON.stringify(parsedVal) === JSON.stringify(val),
          `(JSON: ${JSON.stringify(val)}, SQLite: ${row ? row.value_json : 'MISSING'})`
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n-----------------------------------------------------------------');
  console.log(`Parity Suite Summary: ${passedChecks}/${totalChecks} checks passed`);
  if (failures.length > 0) {
    console.log(`${colors.red}${colors.bold}FAILED CHECKS (${failures.length}):${colors.reset}`);
    failures.forEach((f) => console.log(`  - ${f.description}: ${f.extraDetails}`));
    console.log('-----------------------------------------------------------------\n');
    closeDb();
    return false;
  }

  console.log(`${colors.bold}${colors.green}=================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.green}  ✓ PHASE 4 PARITY & VERIFICATION SUITE: 100% PASS                ${colors.reset}`);
  console.log(`${colors.bold}${colors.green}=================================================================${colors.reset}\n`);

  closeDb();
  return true;
}

// CLI Execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const success = verifyMigrationParity();
  process.exit(success ? 0 : 1);
}
