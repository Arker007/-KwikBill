import fs from 'fs';
import path from 'path';
import {
  writeJsonAtomic,
  writeJsonAtomicAsync,
  readJsonSafe,
  readJsonSafeAsync,
} from '../../../../../server/shared/utils/atomicFs.js';
import { getDb, isDbReady, initDb } from './sqlite.ts';
import { USE_SQLITE, SQLITE_DUAL_WRITE } from '../../config/env.ts';

function getCurrentFinancialYear(): string {
  try {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    if (month >= 3) {
      return `${year}-${String(year + 1).slice(-2)}`;
    } else {
      return `${year - 1}-${String(year).slice(-2)}`;
    }
  } catch {
    return '2026-27';
  }
}

/**
 * Generic repository managing a standalone single-file JSON record (e.g. meta.json, profile.json, settings.json).
 * Provides dual-write and reconciliation with SQLite (meta_counters, app_settings) when managing meta.json.
 */
export class SingleFileRepository<T = any> {
  public filePath: string;
  public defaultData: T | null;
  public isMeta: boolean;
  public useSqlite: boolean;
  public dualWrite: boolean;

  constructor(filePath: string, defaultData: T | null = null) {
    this.filePath = filePath;
    this.defaultData = defaultData;
    this.isMeta = path.basename(filePath) === 'meta.json';
    this.useSqlite = String(USE_SQLITE) !== 'false' && USE_SQLITE !== false;
    this.dualWrite = String(SQLITE_DUAL_WRITE) !== 'false' && SQLITE_DUAL_WRITE !== false;

    if (this.isMeta && this.useSqlite) {
      this.reconcileMetaWithSqlite();
    }
  }

  /**
   * Reconciles data/meta.json with SQLite meta_counters and app_settings tables.
   */
  public reconcileMetaWithSqlite(): void {
    try {
      if (!isDbReady()) {
        initDb();
      }
      const db = getDb();
      if (!db) return;

      const jsonData = readJsonSafe(this.filePath, {}) || {};
      const now = Date.now();
      const curFy = getCurrentFinancialYear();

      // Read SQLite meta_counters
      const counterRows = db.prepare('SELECT prefix, last_sequence FROM meta_counters;').all() as Array<{ prefix: string; last_sequence: number }>;
      const sqlCounters: Record<string, number> = {};
      for (const row of counterRows) {
        sqlCounters[row.prefix] = Number(row.last_sequence);
      }

      // Read SQLite app_settings
      const settingRows = db.prepare('SELECT key, value_json FROM app_settings;').all() as Array<{ key: string; value_json: string }>;
      const sqlSettings: Record<string, any> = {};
      for (const row of settingRows) {
        try {
          sqlSettings[row.key] = JSON.parse(row.value_json);
        } catch {
          sqlSettings[row.key] = row.value_json;
        }
      }

      let jsonChanged = false;
      const merged: Record<string, any> = { ...jsonData };

      // Reconcile counters: take max of JSON and SQLite to ensure no sequence loss
      for (const [key, val] of Object.entries(jsonData)) {
        if (key.startsWith('counter_')) {
          const prefix = key.replace('counter_', '');
          const sqlVal = sqlCounters[prefix];
          const jsonVal = Number(val) || 0;
          if (sqlVal !== undefined) {
            const maxVal = Math.max(jsonVal, sqlVal);
            merged[key] = maxVal;
            if (maxVal !== jsonVal) jsonChanged = true;
            // Update SQLite if needed
            if (maxVal !== sqlVal || maxVal === jsonVal) {
              db.prepare('INSERT OR REPLACE INTO meta_counters (prefix, financial_year, last_sequence, updated_at) VALUES (?, ?, ?, ?);')
                .run(prefix, curFy, maxVal, now);
            }
          } else {
            // Not in SQLite yet -> insert into SQLite
            db.prepare('INSERT OR REPLACE INTO meta_counters (prefix, financial_year, last_sequence, updated_at) VALUES (?, ?, ?, ?);')
              .run(prefix, curFy, jsonVal, now);
          }
        } else {
          // App settings
          const sqlVal = sqlSettings[key];
          if (sqlVal !== undefined) {
            if (typeof val === 'number' && typeof sqlVal === 'number') {
              const maxVal = Math.max(val, sqlVal);
              merged[key] = maxVal;
              if (maxVal !== val) jsonChanged = true;
              db.prepare('INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?);')
                .run(key, JSON.stringify(maxVal), now);
            } else {
              db.prepare('INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?);')
                .run(key, JSON.stringify(val), now);
            }
          } else {
            // Setting in JSON but not in SQLite -> insert into SQLite
            db.prepare('INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?);')
              .run(key, JSON.stringify(val), now);
          }
        }
      }

      // Check for any counters/settings in SQLite that weren't in JSON
      for (const [prefix, seq] of Object.entries(sqlCounters)) {
        const k = `counter_${prefix}`;
        if (merged[k] === undefined) {
          merged[k] = seq;
          jsonChanged = true;
        }
      }

      for (const [k, v] of Object.entries(sqlSettings)) {
        if (merged[k] === undefined) {
          merged[k] = v;
          jsonChanged = true;
        }
      }

      if (jsonChanged) {
        writeJsonAtomic(this.filePath, merged);
      }
    } catch {
      // Non-blocking catch
    }
  }

  /**
   * Synchronizes meta keys to SQLite meta_counters and app_settings tables.
   */
  public syncMetaToSqlite(data: any): void {
    if (!data || typeof data !== 'object') return;
    try {
      if (!isDbReady()) {
        initDb();
      }
      const db = getDb();
      if (!db) return;

      const now = Date.now();
      const curFy = getCurrentFinancialYear();

      const insertMetaCounterStmt = db.prepare(`
        INSERT OR REPLACE INTO meta_counters (prefix, financial_year, last_sequence, updated_at)
        VALUES (?, ?, ?, ?);
      `);

      const insertSettingStmt = db.prepare(`
        INSERT OR REPLACE INTO app_settings (key, value_json, updated_at)
        VALUES (?, ?, ?);
      `);

      for (const [k, v] of Object.entries(data)) {
        if (k.startsWith('counter_')) {
          const prefix = k.replace('counter_', '');
          insertMetaCounterStmt.run(prefix, curFy, Number(v) || 0, now);
        } else {
          insertSettingStmt.run(k, JSON.stringify(v), now);
        }
      }
    } catch {
      // Non-blocking in case of DB lock
    }
  }

  /**
   * Reads data synchronously.
   */
  get(fallback: T | null = this.defaultData): T | null {
    const data = readJsonSafe(this.filePath, fallback);
    if (this.isMeta && (!data || Object.keys(data).length === 0) && this.useSqlite) {
      try {
        if (isDbReady()) {
          const db = getDb();
          const reconstructed: Record<string, any> = {};
          const counterRows = db.prepare('SELECT prefix, last_sequence FROM meta_counters;').all() as Array<{ prefix: string; last_sequence: number }>;
          for (const row of counterRows) {
            reconstructed[`counter_${row.prefix}`] = Number(row.last_sequence);
          }
          const settingRows = db.prepare('SELECT key, value_json FROM app_settings;').all() as Array<{ key: string; value_json: string }>;
          for (const row of settingRows) {
            try {
              reconstructed[row.key] = JSON.parse(row.value_json);
            } catch {
              reconstructed[row.key] = row.value_json;
            }
          }
          if (Object.keys(reconstructed).length > 0) {
            return reconstructed as unknown as T;
          }
        }
      } catch {}
    }
    return data;
  }

  /**
   * Reads data asynchronously.
   */
  async getAsync(fallback: T | null = this.defaultData): Promise<T | null> {
    const data = await readJsonSafeAsync(this.filePath, fallback);
    if (this.isMeta && (!data || Object.keys(data).length === 0) && this.useSqlite) {
      return this.get(fallback);
    }
    return data;
  }

  /**
   * Writes data atomically synchronously.
   */
  set(data: T): T {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    writeJsonAtomic(this.filePath, data);
    if (this.isMeta && this.useSqlite) {
      this.syncMetaToSqlite(data);
    }
    return data;
  }

  /**
   * Writes data atomically asynchronously.
   */
  async setAsync(data: T): Promise<T> {
    const dir = path.dirname(this.filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await writeJsonAtomicAsync(this.filePath, data);
    if (this.isMeta && this.useSqlite) {
      this.syncMetaToSqlite(data);
    }
    return data;
  }

  /**
   * Updates data by applying an updater function or patch object synchronously.
   */
  update(updaterOrPatch: ((current: T) => T) | Partial<T>): T {
    const current = (this.get(this.defaultData as any) || {}) as T;
    const updated = typeof updaterOrPatch === 'function'
      ? (updaterOrPatch as (curr: T) => T)(current)
      : ({ ...current, ...updaterOrPatch } as T);
    return this.set(updated);
  }

  /**
   * Updates data by applying an updater function or patch object asynchronously.
   */
  async updateAsync(updaterOrPatch: ((current: T) => T) | Partial<T>): Promise<T> {
    const current = ((await this.getAsync(this.defaultData as any)) || {}) as T;
    const updated = typeof updaterOrPatch === 'function'
      ? (updaterOrPatch as (curr: T) => T)(current)
      : ({ ...current, ...updaterOrPatch } as T);
    return await this.setAsync(updated);
  }

  /**
   * Checks whether the file exists.
   */
  exists(): boolean {
    try {
      return fs.existsSync(this.filePath);
    } catch {
      return false;
    }
  }
}
