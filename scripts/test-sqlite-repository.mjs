// scripts/test-sqlite-repository.mjs
// Phase 5: Verification of SqliteCollectionRepository & Shadow Dual-Write

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SqliteCollectionRepository } from '../server/infrastructure/storage/SqliteCollectionRepository.js';
import { JsonCollectionRepository } from '../server/infrastructure/storage/JsonCollectionRepository.js';
import { CollectionRepository } from '../server/infrastructure/storage/CollectionRepository.js';
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

export function runRepositoryAdapterTests() {
  console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Free GST Billing Software — Repository Adapter & Dual-Write    ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}\n`);

  initDb();
  const db = getDb();

  let passed = 0;
  let total = 0;

  function assert(desc, condition, extra = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  ${colors.green}✓${colors.reset} ${desc} ${colors.dim}${extra}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗ [FAIL]${colors.reset} ${desc} — ${extra}`);
    }
  }

  // Test 1: Class inheritance & exports
  const billsRepo = new CollectionRepository('bills', { idField: 'id' });
  assert(
    'CollectionRepository is instance of SqliteCollectionRepository',
    billsRepo instanceof SqliteCollectionRepository
  );

  // Test 2: Querying all bills through SQLite
  const allBills = billsRepo.findAll();
  assert('findAll() returns an array from SQLite', Array.isArray(allBills) && allBills.length >= 1, `(Count: ${allBills.length})`);

  // Test 3: Querying bill by ID
  const firstBill = allBills[0];
  const foundBill = billsRepo.findById(firstBill.id);
  assert('findById() fetches matching document', foundBill && foundBill.id === firstBill.id, `(ID: ${firstBill.id})`);

  // Test 4: Dual-write test on a test collection
  const testRepo = new CollectionRepository('clients', { idField: 'id' });
  const testClient = {
    id: 'CLI_PHASE5_TEST',
    name: 'Dual Write Test Corp',
    gstin: '27AABCT1234F1Z5',
    state: 'Maharashtra',
    stateCode: '27',
    openingBalance: 1500,
  };

  testRepo.save(testClient);

  // Verify SQLite row exists
  const sqlRow = db.prepare('SELECT * FROM clients WHERE id = ?').get(testClient.id);
  assert(
    'save() wrote record into SQLite clients table',
    sqlRow && sqlRow.id === testClient.id && Number(sqlRow.opening_balance_paisa) === 150000,
    `(Opening Balance Paisa: ${sqlRow?.opening_balance_paisa})`
  );

  // Verify JSON file exists (dual-write)
  const jsonPath = path.join(DATA_DIR, 'clients', `${testClient.id}.json`);
  assert(
    'save() shadow dual-wrote record to JSON file via atomicFs',
    fs.existsSync(jsonPath),
    `(Path: ${jsonPath})`
  );

  // Test 5: Verify exists()
  assert('exists() returns true for saved client', testRepo.exists(testClient.id));

  // Test 6: Verify delete() cleans both SQLite and JSON file
  testRepo.delete(testClient.id);
  const sqlAfterDelete = db.prepare('SELECT 1 FROM clients WHERE id = ?').get(testClient.id);
  const jsonAfterDelete = fs.existsSync(jsonPath);
  assert(
    'delete() removed record from both SQLite and JSON file',
    !sqlAfterDelete && !jsonAfterDelete,
    `(SQLite: ${!sqlAfterDelete}, JSON: ${!jsonAfterDelete})`
  );

  // Test 7: Soft-delete / moveTo test
  const trashRepo = new CollectionRepository('trash', { idField: 'id' });
  const tempBill = {
    id: 'INV_PHASE5_TEMP',
    invoiceNumber: 'INV/2026-27/TEMP',
    invoiceDate: '2026-09-23',
    totalAmount: 1000,
    status: 'unpaid',
    data: {
      details: { financialYear: '2026-27' },
      totals: { total: 1000 }
    }
  };

  billsRepo.save(tempBill);
  assert('Temporary bill created in bills repo', billsRepo.exists(tempBill.id));

  billsRepo.moveTo(tempBill.id, trashRepo);
  assert('Temporary bill removed from active bills', !billsRepo.exists(tempBill.id));
  assert('Temporary bill exists in trash repo', trashRepo.exists(tempBill.id));

  // Clean up trash
  trashRepo.delete(tempBill.id);
  assert('Temporary bill cleaned from trash', !trashRepo.exists(tempBill.id));

  // Test 8: Instant rollback check (JsonCollectionRepository can read and write independently)
  const jsonOnlyRepo = new JsonCollectionRepository('bills');
  const jsonBills = jsonOnlyRepo.findAll();
  assert('JsonCollectionRepository functions independently for emergency rollback', Array.isArray(jsonBills), `(Count: ${jsonBills.length})`);

  console.log('\n-----------------------------------------------------------------');
  console.log(`Repository Adapter Suite Summary: ${passed}/${total} assertions passed`);
  if (passed === total) {
    console.log(`${colors.bold}${colors.green}=================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.green}  ✓ PHASE 5 REPOSITORY ADAPTER SWITCH: 100% PASS                  ${colors.reset}`);
    console.log(`${colors.bold}${colors.green}=================================================================${colors.reset}\n`);
    closeDb();
    return true;
  } else {
    console.log(`${colors.bold}${colors.red}Phase 5 verification had failures.${colors.reset}\n`);
    closeDb();
    return false;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ok = runRepositoryAdapterTests();
  process.exit(ok ? 0 : 1);
}
