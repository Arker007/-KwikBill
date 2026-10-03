import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DATA_DIR, ROOT_DIR } from '../../config/paths.ts';

const DEFAULT_DB_PATH = path.join(DATA_DIR, 'accounting.db');
const DATABASE_DIR = path.join(ROOT_DIR, 'database');
const SCHEMA_FILE_PATH = path.join(DATABASE_DIR, 'schema/schema.sql');

let dbInstance: any = null;
let currentDbPath: string = DEFAULT_DB_PATH;

/**
 * Configure target database path (useful for testing or custom data folders)
 */
export function setDbPath(customPath: string): void {
  if (dbInstance) {
    throw new Error('Cannot change dbPath while database connection is active. Call closeDb() first.');
  }
  currentDbPath = customPath;
}

/**
 * Returns the active DB path
 */
export function getDbPath(): string {
  return currentDbPath;
}

/**
 * Gets or initializes the singleton DatabaseSync connection.
 * Applies WAL mode, foreign keys, and normal synchronous mode.
 */
export function getDb(): any {
  if (dbInstance) {
    return dbInstance;
  }

  const dir = path.dirname(currentDbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dbInstance = new (DatabaseSync as any)(currentDbPath);

  // Connection Pragma Configuration
  dbInstance.exec('PRAGMA busy_timeout = 5000;');
  try {
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  } catch {
    // Journal mode may already be WAL or locked by concurrent reader
  }
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  dbInstance.exec('PRAGMA synchronous = NORMAL;');

  return dbInstance;
}

/**
 * Initializes database tables by executing schema.sql or migrations.
 * Records schema version in schema_migrations.
 */
export function initDb(): { initialized: boolean; version: number; tablesCreated: number } {
  const db = getDb();

  // Create migrations table first if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at INTEGER NOT NULL
    );
  `);

  // Migration Version 1: Initial Schema
  const checkMigration1 = db.prepare(
    'SELECT version FROM schema_migrations WHERE version = 1;'
  ).get();

  if (!checkMigration1) {
    const mig1Path = path.join(DATABASE_DIR, 'migrations/001_initial_schema.sql');
    if (fs.existsSync(mig1Path)) {
      db.exec(fs.readFileSync(mig1Path, 'utf8'));
    } else {
      if (fs.existsSync(SCHEMA_FILE_PATH)) {
        db.exec(fs.readFileSync(SCHEMA_FILE_PATH, 'utf8'));
      } else {
        throw new Error(`Schema file not found at ${SCHEMA_FILE_PATH}`);
      }
    }
    db.prepare(
      'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);'
    ).run(1, 'initial_normalized_relational_schema', Date.now());
  }

  // Migration Version 2: Raw JSON and Documents Table
  const checkMigration2 = db.prepare(
    'SELECT version FROM schema_migrations WHERE version = 2;'
  ).get();

  if (!checkMigration2) {
    const mig2Path = path.join(DATABASE_DIR, 'migrations/002_raw_json_and_documents.sql');
    if (fs.existsSync(mig2Path)) {
      db.exec(fs.readFileSync(mig2Path, 'utf8'));
    } else {
      const tablesNeedingRawJson = ['profiles', 'clients', 'products', 'bills', 'receipts', 'expenses', 'purchases'];
      for (const tbl of tablesNeedingRawJson) {
        try {
          const cols = db.prepare(`PRAGMA table_info(${tbl});`).all();
          const hasRawJson = cols.some((c: any) => c.name === 'raw_json');
          if (!hasRawJson) {
            db.exec(`ALTER TABLE ${tbl} ADD COLUMN raw_json TEXT;`);
          }
        } catch {
          // Table might not exist yet
        }
      }

      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS documents (
            collection TEXT NOT NULL,
            id TEXT NOT NULL,
            raw_json TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            PRIMARY KEY (collection, id)
          );
          CREATE INDEX IF NOT EXISTS idx_documents_col ON documents(collection);
        `);
      } catch {
        // Already created
      }
    }
    db.prepare(
      'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);'
    ).run(2, 'add_raw_json_and_documents_table', Date.now());
  }

  // Seeding: Run seed script if profiles is empty and seed script exists
  try {
    const profileCountRow = db.prepare('SELECT count(*) as count FROM profiles;').get() as { count: number } | undefined;
    if (profileCountRow && profileCountRow.count === 0) {
      const seedPath = path.join(DATABASE_DIR, 'seeds/default_profile.sql');
      if (fs.existsSync(seedPath)) {
        db.exec(fs.readFileSync(seedPath, 'utf8'));
      }
    }
  } catch (err: any) {
    console.warn('Seeding skipped or failed:', err.message);
  }

  // Count registered tables
  const countStmt = db.prepare(
    "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
  );
  const { count } = countStmt.get() as { count: number };

  return {
    initialized: true,
    version: 2,
    tablesCreated: count,
  };
}

/**
 * Closes the active database connection.
 */
export function closeDb(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // Ignored if already closed
    }
    dbInstance = null;
  }
}

/**
 * Checks if the database is initialized with tables.
 */
export function isDbReady(): boolean {
  try {
    if (!fs.existsSync(currentDbPath)) {
      return false;
    }
    const db = getDb();
    const row = db
      .prepare("SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='bills';")
      .get() as { cnt: number } | undefined;
    return Boolean(row && row.cnt > 0);
  } catch {
    return false;
  }
}

/**
 * Executes a callback within an ACID immediate transaction.
 * Automatically commits on success and rolls back on error.
 */
export function executeTransaction<T>(callback: (db: any) => T): T {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE;');
  try {
    const result = callback(db);
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    try {
      db.exec('ROLLBACK;');
    } catch {
      // Ignore rollback errors if transaction already terminated
    }
    throw err;
  }
}

/**
 * Returns record counts for all core entities.
 */
export function getTableCounts(): Record<string, number> {
  const db = getDb();
  const tables = [
    'profiles',
    'meta_counters',
    'app_settings',
    'clients',
    'products',
    'bills',
    'bill_items',
    'receipts',
    'receipt_allocations',
    'expenses',
    'purchases',
    'purchase_items',
    'recurring_templates',
    'terms_templates',
    'documents',
  ];

  const counts: Record<string, number> = {};
  for (const table of tables) {
    try {
      const row = db.prepare(`SELECT count(*) as count FROM ${table};`).get() as { count: number };
      counts[table] = row.count;
    } catch {
      counts[table] = -1; // table does not exist
    }
  }
  return counts;
}
