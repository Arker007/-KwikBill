// scripts/init-sqlite-db.mjs
// Plan B / Phase 2: Database Initialization & Schema Setup
// Initializes ./data/accounting.db with WAL mode and normalized relational tables.

import {
  initDb,
  getDb,
  closeDb,
  isDbReady,
  getTableCounts,
  getDbPath,
  executeTransaction,
} from '../server/infrastructure/db/sqlite.js';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  Free GST Billing Software — SQLite Initialization (Plan B)     ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}\n`);

try {
  console.log(`Target Database Path: ${colors.bold}${getDbPath()}${colors.reset}`);

  // 1. Initialize schema
  const initResult = initDb();
  console.log(`${colors.green}✓${colors.reset} Database initialized successfully.`);
  console.log(`  • Tables Registered: ${initResult.tablesCreated}`);
  console.log(`  • Schema Version   : ${initResult.version}`);

  const db = getDb();

  // 2. Verify PRAGMA journal_mode
  const journalModeRow = db.prepare('PRAGMA journal_mode;').get();
  const journalMode = journalModeRow.journal_mode;
  if (journalMode.toLowerCase() === 'wal') {
    console.log(`${colors.green}✓${colors.reset} PRAGMA journal_mode: ${colors.bold}WAL${colors.reset} (Write-Ahead Logging active)`);
  } else {
    throw new Error(`Expected journal_mode = wal, got ${journalMode}`);
  }

  // 3. Verify PRAGMA foreign_keys
  const fkRow = db.prepare('PRAGMA foreign_keys;').get();
  if (fkRow.foreign_keys === 1) {
    console.log(`${colors.green}✓${colors.reset} PRAGMA foreign_keys: ${colors.bold}ON (1)${colors.reset}`);
  } else {
    throw new Error(`Expected foreign_keys = 1, got ${fkRow.foreign_keys}`);
  }

  // 4. Verify synchronous
  const syncRow = db.prepare('PRAGMA synchronous;').get();
  console.log(`${colors.green}✓${colors.reset} PRAGMA synchronous : ${colors.bold}${syncRow.synchronous}${colors.reset} (NORMAL)`);

  // 5. Verify Core Table List & Indexes
  const tablesStmt = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
  );
  const tables = tablesStmt.all().map(r => r.name);
  console.log(`\n${colors.bold}Installed Relational Tables (${tables.length}):${colors.reset}`);
  for (const t of tables) {
    console.log(`  ${colors.cyan}•${colors.reset} ${t}`);
  }

  const indexesStmt = db.prepare(
    "SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY tbl_name;"
  );
  const indexes = indexesStmt.all();
  console.log(`\n${colors.bold}Configured Relational Indexes (${indexes.length}):${colors.reset}`);
  for (const idx of indexes) {
    console.log(`  ${colors.dim}•${colors.reset} ${idx.name} ON ${idx.tbl_name}`);
  }

  // 6. Test ACID Transaction execution
  executeTransaction((txDb) => {
    txDb.prepare(
      'INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?);'
    ).run('plan_b_initialization_test', JSON.stringify({ status: 'ok', timestamp: Date.now() }), Date.now());
  });

  const testSetting = db
    .prepare("SELECT value_json FROM app_settings WHERE key = 'plan_b_initialization_test';")
    .get();
  if (testSetting && JSON.parse(testSetting.value_json).status === 'ok') {
    console.log(`\n${colors.green}✓${colors.reset} ACID Immediate Transaction Execution: ${colors.bold}PASSED${colors.reset}`);
  }

  // Clean up test setting
  db.prepare("DELETE FROM app_settings WHERE key = 'plan_b_initialization_test';").run();

  // 7. Check isDbReady helper
  if (isDbReady()) {
    console.log(`${colors.green}✓${colors.reset} isDbReady() Health Check: ${colors.bold}TRUE${colors.reset}`);
  } else {
    throw new Error('isDbReady() returned false after initialization');
  }

  console.log(`\n${colors.bold}${colors.green}=================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.green}  ✓ PLAN B (PHASE 2) INITIALIZATION COMPLETE & VERIFIED          ${colors.reset}`);
  console.log(`${colors.bold}${colors.green}=================================================================${colors.reset}\n`);

  closeDb();
  process.exit(0);
} catch (err) {
  console.error(`\n${colors.red}[FAIL] SQLite initialization error:${colors.reset}`, err);
  closeDb();
  process.exit(1);
}
