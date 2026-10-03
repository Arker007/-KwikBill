import fs from 'fs';
import path from 'path';
import { DATA_DIR, BACKUPS_DIR } from '../../config/paths.ts';
import { getDb, isDbReady } from '../persistence/sqlite.ts';

export function ensureDir(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch {
    /* ignore */
  }
}

/**
 * Safely copies directory tree.
 * Excludes SQLite database and WAL files when skipSqlite is true.
 */
export function copyDirRecursive(
  src: string,
  dst: string,
  options: { skipSqlite?: boolean } = {}
): void {
  ensureDir(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);

    if (options.skipSqlite && /^(accounting\.db|accounting\.db-wal|accounting\.db-shm)$/.test(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(s, d, options);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

/**
 * Safely backs up the active SQLite database using SQLite's VACUUM INTO pragma/command.
 * Guarantees point-in-time consistency without copying live WAL journals independently.
 */
export function backupSqliteSafe(targetDbFilePath: string): boolean {
  try {
    const liveDbPath = path.join(DATA_DIR, 'accounting.db');
    if (!fs.existsSync(liveDbPath)) {
      return false;
    }

    const dir = path.dirname(targetDbFilePath);
    ensureDir(dir);

    if (fs.existsSync(targetDbFilePath)) {
      fs.unlinkSync(targetDbFilePath);
    }

    const db = getDb();
    const escaped = targetDbFilePath.replace(/'/g, "''");
    db.exec(`VACUUM INTO '${escaped}';`);
    return true;
  } catch (err: any) {
    console.warn('[backup] SQLite VACUUM INTO backup failed:', err?.message || err);
    return false;
  }
}

function todayLocalIso(): string {
  return new Date().toLocaleDateString('sv-SE');
}

/**
 * Executes daily rolling backup of all flat-file collections and SQLite database.
 * Generates point-in-time consistent archive with metadata manifest.
 */
export function runDailyBackup(): { success: boolean; target?: string; error?: string } {
  try {
    ensureDir(BACKUPS_DIR);
    const today = todayLocalIso();
    const target = path.join(BACKUPS_DIR, today);
    if (fs.existsSync(target)) {
      return { success: true, target };
    }

    ensureDir(target);
    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });

    let filesCount = 0;
    for (const entry of entries) {
      if (entry.name === 'backups' || entry.name === 'errors.log' || entry.name === 'port.txt') {
        continue;
      }
      // Never copy SQLite live DB files with copyFileSync
      if (/^(accounting\.db|accounting\.db-wal|accounting\.db-shm)$/.test(entry.name)) {
        continue;
      }

      const src = path.join(DATA_DIR, entry.name);
      const dst = path.join(target, entry.name);
      if (entry.isDirectory()) {
        copyDirRecursive(src, dst, { skipSqlite: true });
      } else {
        fs.copyFileSync(src, dst);
        filesCount++;
      }
    }

    // Safely snapshot SQLite if present
    const sqliteTarget = path.join(target, 'accounting.db');
    const sqliteBackedUp = backupSqliteSafe(sqliteTarget);

    // Write backup manifest
    const manifest = {
      id: today,
      type: 'daily-backup',
      createdAt: new Date().toISOString(),
      sqliteIncluded: sqliteBackedUp,
      version: '2.0.0',
    };
    fs.writeFileSync(path.join(target, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

    console.log(`[backup] Daily snapshot saved: ${target} (SQLite: ${sqliteBackedUp ? 'included' : 'none'})`);

    // Prune backups older than 30 days
    const all = fs.readdirSync(BACKUPS_DIR).filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n)).sort();
    while (all.length > 30) {
      const oldest = all.shift();
      if (oldest) {
        const oldestPath = path.join(BACKUPS_DIR, oldest);
        try {
          fs.rmSync(oldestPath, { recursive: true, force: true });
        } catch {
          /* ignore */
        }
      }
    }

    return { success: true, target };
  } catch (err: any) {
    console.warn('[backup] Daily backup failed:', err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

let backupTimer: any = null;
let dailyBackupInterval: any = null;

export interface BackupEngineOptions {
  initialDelayMs?: number;
  intervalMs?: number;
}

/**
 * Starts the daily backup engine interval runner.
 */
export function startBackupEngine(
  options: BackupEngineOptions = { initialDelayMs: 5000, intervalMs: 24 * 60 * 60 * 1000 }
): void {
  stopBackupEngine();

  backupTimer = setTimeout(runDailyBackup, options.initialDelayMs ?? 5000);
  if (backupTimer && typeof backupTimer.unref === 'function') {
    backupTimer.unref();
  }

  dailyBackupInterval = setInterval(runDailyBackup, options.intervalMs ?? 24 * 60 * 60 * 1000);
  if (dailyBackupInterval && typeof dailyBackupInterval.unref === 'function') {
    dailyBackupInterval.unref();
  }
}

/**
 * Stops the daily backup engine interval runner.
 */
export function stopBackupEngine(): void {
  if (backupTimer) {
    clearTimeout(backupTimer);
    backupTimer = null;
  }
  if (dailyBackupInterval) {
    clearInterval(dailyBackupInterval);
    dailyBackupInterval = null;
  }
}
