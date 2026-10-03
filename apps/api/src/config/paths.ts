import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory is 4 levels up from apps/api/src/config/
export const ROOT_DIR: string = path.resolve(__dirname, '../../../../');
export const SERVER_DIR: string = path.join(ROOT_DIR, 'server');
export const APPS_API_DIR: string = path.resolve(__dirname, '../..');

// Data storage directories
const isolatedTestDataDir =
  process.env.NODE_ENV === 'test' ? process.env.FREE_GST_TEST_DATA_DIR : undefined;
export const DATA_DIR: string = isolatedTestDataDir
  ? path.resolve(isolatedTestDataDir)
  : path.join(ROOT_DIR, 'data');
export const SQLITE_DIR: string = path.join(DATA_DIR, 'sqlite');
export const LEGACY_JSON_DIR: string = path.join(DATA_DIR, 'legacy-json');
export const UPLOADS_DIR: string = path.join(DATA_DIR, 'uploads');
export const EXPORTS_DIR: string = path.join(DATA_DIR, 'exports');
export const BILLS_DIR: string = path.join(DATA_DIR, 'bills');
export const CLIENTS_DIR: string = path.join(DATA_DIR, 'clients');
export const PRODUCTS_DIR: string = path.join(DATA_DIR, 'products');
export const EXPENSES_DIR: string = path.join(DATA_DIR, 'expenses');
export const PURCHASES_DIR: string = path.join(DATA_DIR, 'purchases');
export const RECEIPTS_DIR: string = path.join(DATA_DIR, 'receipts');
export const RECURRING_DIR: string = path.join(DATA_DIR, 'recurring');
export const PROFILES_DIR: string = path.join(DATA_DIR, 'profiles');
export const TEMPLATES_DIR: string = path.join(DATA_DIR, 'templates');
export const TRASH_DIR: string = path.join(DATA_DIR, 'trash');
export const BACKUPS_DIR: string = path.join(DATA_DIR, 'backups');

export const INVOICES_DIR: string = path.join(ROOT_DIR, 'Saved Invoices');
export const PDF_TRASH_DIR: string = path.join(ROOT_DIR, 'Trash');

// Single-record files and metadata
export const META_FILE: string = path.join(DATA_DIR, 'meta.json');
export const PROFILE_FILE: string = path.join(DATA_DIR, 'profile.json');
export const SETTINGS_FILE: string = path.join(DATA_DIR, 'settings.json');
export const SUPABASE_CONFIG_FILE: string = path.join(DATA_DIR, 'supabase_config.json');
export const PORT_FILE: string = path.join(DATA_DIR, 'port.txt');
export const ERRORS_LOG: string = path.join(DATA_DIR, 'errors.log');

// Directory names managed as collections
export const DATA_COLLECTIONS: readonly string[] = [
  'sqlite',
  'legacy-json',
  'uploads',
  'exports',
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
  'backups',
];

/**
 * Ensures all required local data directories exist.
 */
export function ensureDirectoriesExist(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  for (const collection of DATA_COLLECTIONS) {
    const dirPath = path.join(DATA_DIR, collection);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
