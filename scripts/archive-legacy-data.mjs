import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const LEGACY_JSON_DIR = path.join(DATA_DIR, 'legacy-json');
const SQLITE_DIR = path.join(DATA_DIR, 'sqlite');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

const DIRS = [LEGACY_JSON_DIR, SQLITE_DIR, UPLOADS_DIR, EXPORTS_DIR, BACKUPS_DIR];
for (const dir of DIRS) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Collections to archive
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
  'trash',
];

const SINGLE_FILES = [
  'meta.json',
  'profile.json',
  'settings.json',
  'supabase_config.json',
  'supabase_sync_log.json',
];

const manifest = {
  version: '1.0.0',
  archived_at: new Date().toISOString(),
  total_documents: 0,
  collections: {},
  files: {},
};

function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return {
    size: content.length,
    sha256: crypto.createHash('sha256').update(content).digest('hex'),
  };
}

// 1. Archive collections
for (const col of COLLECTIONS) {
  const srcColDir = path.join(DATA_DIR, col);
  const dstColDir = path.join(LEGACY_JSON_DIR, col);
  if (!fs.existsSync(dstColDir)) {
    fs.mkdirSync(dstColDir, { recursive: true });
  }

  manifest.collections[col] = { count: 0, documents: [] };

  if (fs.existsSync(srcColDir)) {
    const files = fs.readdirSync(srcColDir).filter((f) => f.endsWith('.json'));
    for (const f of files) {
      const srcFile = path.join(srcColDir, f);
      const dstFile = path.join(dstColDir, f);
      fs.copyFileSync(srcFile, dstFile);
      const meta = hashFile(dstFile);
      manifest.collections[col].count++;
      manifest.total_documents++;
      manifest.collections[col].documents.push({
        filename: f,
        ...meta,
      });
    }
  }
}

// 2. Archive single files
for (const f of SINGLE_FILES) {
  const srcFile = path.join(DATA_DIR, f);
  const dstFile = path.join(LEGACY_JSON_DIR, f);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, dstFile);
    const meta = hashFile(dstFile);
    manifest.files[f] = meta;
  }
}

// 3. Mirror SQLite database into data/sqlite/
const dbFiles = ['accounting.db', 'accounting.db-wal', 'accounting.db-shm'];
for (const dbf of dbFiles) {
  const srcDb = path.join(DATA_DIR, dbf);
  const dstDb = path.join(SQLITE_DIR, dbf);
  if (fs.existsSync(srcDb)) {
    fs.copyFileSync(srcDb, dstDb);
  }
}

// 4. Write manifest
const manifestPath = path.join(LEGACY_JSON_DIR, 'ARCHIVE_MANIFEST.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

console.log(`Successfully generated archive in ${LEGACY_JSON_DIR}`);
console.log(`Total archived documents: ${manifest.total_documents}`);
