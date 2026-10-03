// scripts/validate-json-data.mjs
// Phase A: Pre-Migration Data Validation & Sanity Audit
// Validates all flat-file JSON storage in ./data/ before SQLite migration.
//
// Usage:
//   node scripts/validate-json-data.mjs
//   node scripts/validate-json-data.mjs --snapshot

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const BACKUPS_DIR = path.resolve(DATA_DIR, 'backups');

const COLLECTIONS = [
  'bills',
  'clients',
  'products',
  'expenses',
  'purchases',
  'receipts',
  'recurring',
  'profiles',
  'templates',
];

const ROOT_JSON_FILES = [
  'meta.json',
  'profile.json',
  'settings.json',
  'supabase_config.json',
  'supabase_sync_log.json',
];

const stats = {
  totalFilesScanned: 0,
  validFiles: 0,
  invalidFiles: 0,
  corruptedFiles: 0,
  warningsCount: 0,
  collections: {},
  rootFiles: {},
  financials: {
    totalBilledPaisa: 0,
    totalTaxPaisa: 0,
    totalPaidPaisa: 0,
    totalExpensesPaisa: 0,
    totalPurchasesPaisa: 0,
  },
  warnings: [],
  errors: [],
};

// ANSI color helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function formatRupees(paisa) {
  const rs = (paisa / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₹${rs}`;
}

function safeReadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) {
      return { ok: false, error: 'Empty (0-byte) file' };
    }
    const data = JSON.parse(raw);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: `Invalid JSON syntax: ${err.message}` };
  }
}

// -----------------------------------------------------------------------------
// Entity Validators
// -----------------------------------------------------------------------------

function validateBill(file, data, clientIds) {
  const issues = [];
  const id = data.id || path.basename(file, '.json');

  if (!data.id) {
    issues.push({ type: 'warning', msg: 'Missing top-level "id" attribute (will infer from filename)' });
  }

  const invoiceNumber = data.invoiceNumber || data.data?.details?.invoiceNumber;
  if (!invoiceNumber) {
    issues.push({ type: 'warning', msg: 'Missing invoiceNumber' });
  }

  const items = Array.isArray(data.items)
    ? data.items
    : (Array.isArray(data.data?.items) ? data.data.items : []);

  if (items.length === 0) {
    issues.push({ type: 'info', msg: 'Bill has 0 line items (draft or empty)' });
  }

  // Financial aggregation in Paisa
  const grandTotal = Number(data.totalAmount ?? data.data?.totals?.total ?? 0);
  const totalTax = Number(data.totalTaxAmount ?? data.data?.totals?.totalTaxAmount ?? 0);
  const paidAmount = Number(data.paidAmount ?? 0);

  const grandTotalPaisa = Math.round(grandTotal * 100);
  const totalTaxPaisa = Math.round(totalTax * 100);
  const paidPaisa = Math.round(paidAmount * 100);

  stats.financials.totalBilledPaisa += grandTotalPaisa;
  stats.financials.totalTaxPaisa += totalTaxPaisa;
  stats.financials.totalPaidPaisa += paidPaisa;

  // Check client reference
  const clientId = data.clientId || data.data?.client?.id;
  const clientName = data.clientName || data.data?.client?.name;
  if (clientId && clientIds && !clientIds.has(clientId)) {
    issues.push({
      type: 'warning',
      msg: `References unknown or deleted clientId "${clientId}" (${clientName || 'Unnamed'})`,
    });
  }

  // Math sanity check on items
  if (items.length > 0) {
    let computedItemsTaxable = 0;
    for (const itm of items) {
      const qty = Number(itm.quantity ?? 1);
      const rate = Number(itm.rate ?? itm.price ?? 0);
      const disc = Number(itm.discount ?? 0);
      computedItemsTaxable += (qty * rate) - disc;
    }
    const recordedTaxable = Number(data.data?.totals?.taxableAmount ?? computedItemsTaxable);
    if (Math.abs(computedItemsTaxable - recordedTaxable) > 0.1) {
      issues.push({
        type: 'warning',
        msg: `Item line total sum (${computedItemsTaxable.toFixed(2)}) differs from recorded taxableAmount (${recordedTaxable.toFixed(2)})`,
      });
    }
  }

  return issues;
}

function validateClient(file, data) {
  const issues = [];
  if (!data.id && !data._id) {
    issues.push({ type: 'warning', msg: 'Missing client id' });
  }
  if (!data.name && !data.clientName) {
    issues.push({ type: 'warning', msg: 'Missing client name' });
  }
  return issues;
}

function validateProduct(file, data) {
  const issues = [];
  if (!data.id && !data._id) {
    issues.push({ type: 'warning', msg: 'Missing product id' });
  }
  if (!data.name && !data.title) {
    issues.push({ type: 'warning', msg: 'Missing product name' });
  }
  return issues;
}

function validateExpense(file, data) {
  const issues = [];
  const amount = Number(data.amount ?? 0);
  stats.financials.totalExpensesPaisa += Math.round(amount * 100);
  if (!data.category) {
    issues.push({ type: 'warning', msg: 'Expense missing category' });
  }
  return issues;
}

function validatePurchase(file, data) {
  const issues = [];
  const grandTotal = Number(data.grandTotal ?? data.total ?? 0);
  stats.financials.totalPurchasesPaisa += Math.round(grandTotal * 100);
  if (!data.billNumber && !data.invoiceNumber) {
    issues.push({ type: 'warning', msg: 'Purchase missing bill number' });
  }
  return issues;
}

// -----------------------------------------------------------------------------
// Audit Runner
// -----------------------------------------------------------------------------

export function runPreMigrationAudit() {
  console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Free GST Billing Software — Pre-Migration Data Audit (Plan A)  ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}\n`);

  if (!fs.existsSync(DATA_DIR)) {
    console.error(`${colors.red}[FAIL] Data directory not found at: ${DATA_DIR}${colors.reset}`);
    process.exit(1);
  }

  // Pre-load client IDs for referential integrity checks
  const clientIds = new Set();
  const clientsDir = path.join(DATA_DIR, 'clients');
  if (fs.existsSync(clientsDir)) {
    for (const f of fs.readdirSync(clientsDir)) {
      if (f.endsWith('.json')) {
        const full = path.join(clientsDir, f);
        const res = safeReadJson(full);
        if (res.ok && (res.data.id || res.data._id)) {
          clientIds.add(String(res.data.id || res.data._id));
        }
      }
    }
  }

  // Audit Collections
  for (const col of COLLECTIONS) {
    const colDir = path.join(DATA_DIR, col);
    stats.collections[col] = { total: 0, valid: 0, invalid: 0 };

    if (!fs.existsSync(colDir)) continue;

    const files = fs.readdirSync(colDir).filter(f => f.endsWith('.json'));
    stats.collections[col].total = files.length;
    stats.totalFilesScanned += files.length;

    for (const file of files) {
      const fullPath = path.join(colDir, file);
      const res = safeReadJson(fullPath);

      if (!res.ok) {
        stats.invalidFiles++;
        stats.collections[col].invalid++;
        stats.errors.push({ file: `${col}/${file}`, error: res.error });
        continue;
      }

      stats.validFiles++;
      stats.collections[col].valid++;

      let issues = [];
      if (col === 'bills') issues = validateBill(file, res.data, clientIds);
      else if (col === 'clients') issues = validateClient(file, res.data);
      else if (col === 'products') issues = validateProduct(file, res.data);
      else if (col === 'expenses') issues = validateExpense(file, res.data);
      else if (col === 'purchases') issues = validatePurchase(file, res.data);

      for (const issue of issues) {
        if (issue.type === 'warning') {
          stats.warningsCount++;
          stats.warnings.push({ file: `${col}/${file}`, msg: issue.msg });
        }
      }
    }
  }

  // Audit Root JSON Files
  for (const rootFile of ROOT_JSON_FILES) {
    const fullPath = path.join(DATA_DIR, rootFile);
    if (!fs.existsSync(fullPath)) continue;

    stats.totalFilesScanned++;
    const res = safeReadJson(fullPath);
    if (!res.ok) {
      stats.invalidFiles++;
      stats.rootFiles[rootFile] = { status: 'INVALID', error: res.error };
      stats.errors.push({ file: rootFile, error: res.error });
    } else {
      stats.validFiles++;
      stats.rootFiles[rootFile] = { status: 'VALID', keys: Object.keys(res.data).length };
    }
  }

  // Print Collection Table
  console.log(`${colors.bold}1. Collection File Scan:${colors.reset}`);
  console.log('-----------------------------------------------------------------');
  console.log(`| Collection   | Total Files | Valid JSON | Issues / Warnings |`);
  console.log('-----------------------------------------------------------------');
  for (const [col, info] of Object.entries(stats.collections)) {
    const warnCount = stats.warnings.filter(w => w.file.startsWith(`${col}/`)).length;
    const colName = col.padEnd(12);
    const totStr = String(info.total).padStart(11);
    const valStr = String(info.valid).padStart(10);
    const warnStr = String(warnCount).padStart(17);
    console.log(`| ${colName} | ${totStr} | ${valStr} | ${warnStr} |`);
  }
  console.log('-----------------------------------------------------------------\n');

  // Print Root Configuration Files
  console.log(`${colors.bold}2. Root Metadata & Configuration Files:${colors.reset}`);
  for (const [rf, info] of Object.entries(stats.rootFiles)) {
    if (info.status === 'VALID') {
      console.log(`  ${colors.green}✓${colors.reset} ${rf.padEnd(24)}: Valid (${info.keys} root keys)`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${rf.padEnd(24)}: Corrupted / Invalid (${info.error})`);
    }
  }
  console.log();

  // Print Financial Rollup
  console.log(`${colors.bold}3. Pre-Migration Financial Rollup (Checksum Baseline):${colors.reset}`);
  console.log(`  • Total Invoiced Amount : ${colors.bold}${formatRupees(stats.financials.totalBilledPaisa)}${colors.reset} (${stats.financials.totalBilledPaisa} paisa)`);
  console.log(`  • Total GST / Tax       : ${colors.bold}${formatRupees(stats.financials.totalTaxPaisa)}${colors.reset} (${stats.financials.totalTaxPaisa} paisa)`);
  console.log(`  • Total Payments Logged : ${colors.bold}${formatRupees(stats.financials.totalPaidPaisa)}${colors.reset}`);
  console.log(`  • Total Recorded Expenses: ${colors.bold}${formatRupees(stats.financials.totalExpensesPaisa)}${colors.reset}`);
  console.log(`  • Total Recorded Purchases: ${colors.bold}${formatRupees(stats.financials.totalPurchasesPaisa)}${colors.reset}\n`);

  // Print Warnings / Notice
  if (stats.warnings.length > 0) {
    console.log(`${colors.bold}${colors.yellow}4. Sanity Notices & Warnings (${stats.warnings.length}):${colors.reset}`);
    for (const w of stats.warnings.slice(0, 10)) {
      console.log(`  ${colors.yellow}⚠${colors.reset} [${w.file}]: ${w.msg}`);
    }
    if (stats.warnings.length > 10) {
      console.log(`  ${colors.dim}... and ${stats.warnings.length - 10} more warnings.${colors.reset}`);
    }
    console.log();
  } else {
    console.log(`${colors.bold}${colors.green}4. Sanity Warnings: None. All documents strictly structured.${colors.reset}\n`);
  }

  // Readiness Verdict
  const isReady = stats.invalidFiles === 0;
  console.log(`${colors.bold}=================================================================${colors.reset}`);
  if (isReady) {
    console.log(`${colors.bold}${colors.green}  ✓ READINESS VERDICT: READY FOR LOCAL SQLITE MIGRATION  ${colors.reset}`);
    console.log(`  All ${stats.totalFilesScanned} scanned files parsed cleanly with zero fatal JSON corruptions.`);
  } else {
    console.log(`${colors.bold}${colors.red}  ✗ READINESS VERDICT: NOT READY (${stats.invalidFiles} corrupt files)  ${colors.reset}`);
  }
  console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}\n`);

  return { isReady, stats };
}

// -----------------------------------------------------------------------------
// Pre-Migration Snapshot Utility
// -----------------------------------------------------------------------------

export function createPreMigrationSnapshot() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetDir = path.join(BACKUPS_DIR, `pre-sql-migration-${timestamp}`);

  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  fs.mkdirSync(targetDir, { recursive: true });

  function copyRecursive(src, dst) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      if (entry.name === 'backups' || entry.name === 'errors.log' || entry.name === 'port.txt') continue;
      const s = path.join(src, entry.name);
      const d = path.join(dst, entry.name);
      if (entry.isDirectory()) {
        copyRecursive(s, d);
      } else {
        fs.copyFileSync(s, d);
      }
    }
  }

  copyRecursive(DATA_DIR, targetDir);

  // Write snapshot manifest
  const manifest = {
    createdAt: new Date().toISOString(),
    snapshotType: 'pre-sql-migration',
    sourceDir: DATA_DIR,
    targetDir,
    financialBaseline: stats.financials,
    filesCount: stats.totalFilesScanned,
  };
  fs.writeFileSync(path.join(targetDir, 'snapshot-manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`${colors.bold}${colors.green}✓ Safety Snapshot Successfully Created:${colors.reset}`);
  console.log(`  Location: ${colors.cyan}${targetDir}${colors.reset}`);
  console.log(`  Manifest: ${colors.dim}snapshot-manifest.json${colors.reset}\n`);

  return targetDir;
}

// -----------------------------------------------------------------------------
// CLI Execution
// -----------------------------------------------------------------------------

const args = process.argv.slice(2);
const shouldSnapshot = args.includes('--snapshot') || args.includes('--backup');

const { isReady } = runPreMigrationAudit();

if (shouldSnapshot) {
  createPreMigrationSnapshot();
} else {
  console.log(`${colors.dim}Tip: Run with --snapshot to generate a pre-migration backup snapshot:${colors.reset}`);
  console.log(`  ${colors.bold}node scripts/validate-json-data.mjs --snapshot${colors.reset}\n`);
}

process.exit(isReady ? 0 : 1);
