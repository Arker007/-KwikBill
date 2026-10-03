import fs from 'fs';
import path from 'path';
import { DATA_DIR, BACKUPS_DIR, PROFILE_FILE, META_FILE, SETTINGS_FILE } from '../../config/paths.ts';
import { ensureDir, copyDirRecursive, backupSqliteSafe } from './backupEngine.ts';
import { closeDb, initDb, isDbReady } from '../persistence/sqlite.ts';
import { isPathInside } from '../../../../../server/shared/utils/pathUtils.js';
import { invoicingService } from '../../modules/invoicing/invoicing.service.ts';

export interface SnapshotManifest {
  id: string;
  type: 'daily' | 'manual' | 'pre-restore' | 'pre-sync';
  createdAt: string;
  sqliteIncluded: boolean;
  version: string;
  collections?: Record<string, number>;
}

export interface SnapshotInfo {
  date: string;
  createdAt: string;
  hasSqlite: boolean;
  type?: string;
}

const CORE_DIRECTORIES = [
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

const CORE_FILES = [
  'profile.json',
  'meta.json',
  'settings.json',
];

/**
 * Creates a pre-sync snapshot before Supabase or external synchronization.
 * Preserves exact backward-compatible contract for supabaseSync.service.js.
 */
export function createSnapshotBeforeSync(prefix: string = 'pre-supabase-sync'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotName = `${prefix}-${timestamp}`;
  const targetDir = path.join(BACKUPS_DIR, snapshotName);

  ensureDir(BACKUPS_DIR);
  ensureDir(targetDir);

  for (const dir of CORE_DIRECTORIES) {
    const src = path.join(DATA_DIR, dir);
    if (fs.existsSync(src)) {
      copyDirRecursive(src, path.join(targetDir, dir), { skipSqlite: true });
    }
  }

  for (const file of CORE_FILES) {
    const src = path.join(DATA_DIR, file);
    if (fs.existsSync(src)) {
      try {
        fs.copyFileSync(src, path.join(targetDir, file));
      } catch {
        /* ignore */
      }
    }
  }

  // Safely snapshot SQLite without copying active WAL journals
  const sqliteBackedUp = backupSqliteSafe(path.join(targetDir, 'accounting.db'));

  const manifest: SnapshotManifest = {
    id: snapshotName,
    type: 'pre-sync',
    createdAt: new Date().toISOString(),
    sqliteIncluded: sqliteBackedUp,
    version: '2.0.0',
  };
  fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  return snapshotName;
}

/**
 * Creates a named or timestamped snapshot of all data.
 */
export function createBackupSnapshot(
  customName?: string,
  type: 'daily' | 'manual' | 'pre-restore' | 'pre-sync' = 'manual'
): { name: string; path: string; manifest: SnapshotManifest } {
  ensureDir(BACKUPS_DIR);
  const name = customName || (type === 'daily' ? new Date().toLocaleDateString('sv-SE') : `backup-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  const targetDir = path.join(BACKUPS_DIR, name);
  ensureDir(targetDir);

  const liveEntries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
  for (const entry of liveEntries) {
    if (entry.name === 'backups' || entry.name === 'errors.log' || entry.name === 'port.txt') {
      continue;
    }
    if (/^(accounting\.db|accounting\.db-wal|accounting\.db-shm)$/.test(entry.name)) {
      continue;
    }

    const src = path.join(DATA_DIR, entry.name);
    const dst = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(src, dst, { skipSqlite: true });
    } else {
      fs.copyFileSync(src, dst);
    }
  }

  const sqliteBackedUp = backupSqliteSafe(path.join(targetDir, 'accounting.db'));

  const manifest: SnapshotManifest = {
    id: name,
    type,
    createdAt: new Date().toISOString(),
    sqliteIncluded: sqliteBackedUp,
    version: '2.0.0',
  };
  fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  return { name, path: targetDir, manifest };
}

/**
 * Lists all existing backups and snapshots in BACKUPS_DIR.
 */
export function listBackupSnapshots(): SnapshotInfo[] {
  ensureDir(BACKUPS_DIR);
  return fs.readdirSync(BACKUPS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dirPath = path.join(BACKUPS_DIR, entry.name);
      let createdAt = '';
      let hasSqlite = fs.existsSync(path.join(dirPath, 'accounting.db'));
      let type: string | undefined;

      const manifestPath = path.join(dirPath, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          createdAt = manifest.createdAt || createdAt;
          hasSqlite = manifest.sqliteIncluded ?? hasSqlite;
          type = manifest.type;
        } catch {
          /* ignore */
        }
      }

      if (!createdAt) {
        try {
          const stat = fs.statSync(dirPath);
          createdAt = stat.mtime.toISOString();
        } catch {
          createdAt = new Date().toISOString();
        }
      }

      return {
        date: entry.name,
        createdAt,
        hasSqlite,
        type,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Deletes a backup snapshot by name or date.
 */
export function deleteBackupSnapshot(nameOrDate: string): { success: boolean; date: string } {
  if (!nameOrDate || typeof nameOrDate !== 'string') {
    throw new Error('Invalid backup identifier');
  }

  const targetDir = path.join(BACKUPS_DIR, nameOrDate);
  if (!isPathInside(targetDir, BACKUPS_DIR)) {
    throw new Error('Invalid path traversal attempt');
  }
  if (!fs.existsSync(targetDir)) {
    throw new Error('Backup not found');
  }

  fs.rmSync(targetDir, { recursive: true, force: true });
  return { success: true, date: nameOrDate };
}

/**
 * Restores all data from a snapshot with automatic atomic rollback on failure.
 */
export function restoreBackupSnapshot(nameOrDate: string): { success: boolean; restored: string } {
  if (!nameOrDate || typeof nameOrDate !== 'string') {
    throw new Error('Invalid backup identifier');
  }

  const backupDir = path.join(BACKUPS_DIR, nameOrDate);
  if (!isPathInside(backupDir, BACKUPS_DIR)) {
    throw new Error('Invalid path traversal attempt');
  }
  if (!fs.existsSync(backupDir)) {
    throw new Error('Backup snapshot not found');
  }

  // 1. Create a pre-restore safety snapshot
  const safetySnapshotDir = path.join(BACKUPS_DIR, `pre-restore-${Date.now()}`);
  ensureDir(safetySnapshotDir);

  const restoredEntries: string[] = [];

  try {
    const liveEntries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    for (const entry of liveEntries) {
      if (entry.name === 'backups' || entry.name === 'errors.log' || entry.name === 'port.txt') {
        continue;
      }
      const src = path.join(DATA_DIR, entry.name);
      const dst = path.join(safetySnapshotDir, entry.name);
      if (entry.isDirectory()) {
        copyDirRecursive(src, dst, { skipSqlite: true });
      } else {
        fs.copyFileSync(src, dst);
      }
    }
    // Safely snapshot SQLite into safety snapshot if present
    backupSqliteSafe(path.join(safetySnapshotDir, 'accounting.db'));

    // 2. Restore SQLite database if present in the backup snapshot
    const backupDbPath = path.join(backupDir, 'accounting.db');
    if (fs.existsSync(backupDbPath)) {
      closeDb();
      const liveDbPath = path.join(DATA_DIR, 'accounting.db');
      const walPath = path.join(DATA_DIR, 'accounting.db-wal');
      const shmPath = path.join(DATA_DIR, 'accounting.db-shm');

      try { if (fs.existsSync(walPath)) fs.unlinkSync(walPath); } catch { /* ignore */ }
      try { if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath); } catch { /* ignore */ }
      fs.copyFileSync(backupDbPath, liveDbPath);
      initDb();
      restoredEntries.push('accounting.db');
    }

    // 3. Restore files and directories
    const backupEntries = fs.readdirSync(backupDir, { withFileTypes: true });
    for (const entry of backupEntries) {
      if (entry.name === 'manifest.json' || entry.name === 'accounting.db') {
        continue;
      }

      const src = path.join(backupDir, entry.name);
      const dst = path.join(DATA_DIR, entry.name);
      if (!isPathInside(dst, DATA_DIR)) continue;

      if (entry.isDirectory()) {
        if (fs.existsSync(dst)) {
          fs.rmSync(dst, { recursive: true, force: true });
        }
        copyDirRecursive(src, dst);
      } else {
        fs.copyFileSync(src, dst);
      }
      restoredEntries.push(entry.name);
    }

    // 4. Invalidate caches
    try {
      invoicingService.invalidateCache();
    } catch {
      /* ignore */
    }

    // Clean up safety snapshot on success
    try {
      fs.rmSync(safetySnapshotDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }

    return { success: true, restored: nameOrDate };
  } catch (err: any) {
    // Roll back from safety snapshot
    if (fs.existsSync(safetySnapshotDir)) {
      try {
        for (const name of restoredEntries) {
          const dst = path.join(DATA_DIR, name);
          if (!isPathInside(dst, DATA_DIR)) continue;
          if (fs.existsSync(dst)) {
            fs.rmSync(dst, { recursive: true, force: true });
          }
          const snap = path.join(safetySnapshotDir, name);
          if (fs.existsSync(snap)) {
            if (fs.statSync(snap).isDirectory()) {
              copyDirRecursive(snap, dst);
            } else {
              fs.copyFileSync(snap, dst);
            }
          }
        }
        // If SQLite was rolled back, re-init
        const safetyDb = path.join(safetySnapshotDir, 'accounting.db');
        if (fs.existsSync(safetyDb)) {
          closeDb();
          fs.copyFileSync(safetyDb, path.join(DATA_DIR, 'accounting.db'));
          initDb();
        }
      } catch {
        /* ignore rollback error */
      }
    }
    throw err;
  }
}
