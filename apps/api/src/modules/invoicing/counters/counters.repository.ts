import { META_FILE } from '../../../config/paths.ts';
import { SingleFileRepository } from '../../../infrastructure/persistence/SingleFileRepository.ts';
import { getDb, isDbReady } from '../../../infrastructure/persistence/sqlite.ts';

export class CountersRepository {
  private storage: SingleFileRepository;

  constructor(singleFileRepo?: SingleFileRepository) {
    this.storage = singleFileRepo || new SingleFileRepository(META_FILE, {});
  }

  get(): Record<string, any> {
    return this.storage.get({});
  }

  async getAsync(): Promise<Record<string, any>> {
    return await this.storage.getAsync({});
  }

  set(data: Record<string, any>): Record<string, any> {
    return this.storage.set(data);
  }

  async setAsync(data: Record<string, any>): Promise<Record<string, any>> {
    return await this.storage.setAsync(data);
  }

  update(updaterOrPatch: ((current: Record<string, any>) => Record<string, any>) | Record<string, any>): Record<string, any> {
    return this.storage.update(updaterOrPatch);
  }

  async updateAsync(updaterOrPatch: ((current: Record<string, any>) => Record<string, any>) | Record<string, any>): Promise<Record<string, any>> {
    return await this.storage.updateAsync(updaterOrPatch);
  }

  /**
   * Atomically increments a sequence counter or app setting key with dual-write to SQLite and JSON.
   */
  incrementCounter(key: string): number {
    let nextValue = 1;
    this.storage.update((meta: Record<string, any>) => {
      const current = Number(meta?.[key] || 0);
      nextValue = current + 1;
      return {
        ...(meta || {}),
        [key]: nextValue,
      };
    });
    return nextValue;
  }

  /**
   * Atomically increments a sequence counter asynchronously.
   */
  async incrementCounterAsync(key: string): Promise<number> {
    let nextValue = 1;
    await this.storage.updateAsync((meta: Record<string, any>) => {
      const current = Number(meta?.[key] || 0);
      nextValue = current + 1;
      return {
        ...(meta || {}),
        [key]: nextValue,
      };
    });
    return nextValue;
  }

  /**
   * Gets a counter sequence.
   */
  getCounter(prefix: string): number {
    const meta = this.get();
    const key = `counter_${prefix}`;
    if (meta && key in meta) {
      return Number(meta[key]) || 0;
    }
    try {
      if (isDbReady()) {
        const db = getDb();
        const row = db.prepare('SELECT last_sequence FROM meta_counters WHERE prefix = ?').get(prefix) as { last_sequence: number } | undefined;
        if (row) return Number(row.last_sequence) || 0;
      }
    } catch {}
    return 0;
  }

  /**
   * Sets a counter sequence.
   */
  setCounter(prefix: string, sequence: number): void {
    const key = `counter_${prefix}`;
    this.update((meta) => ({
      ...meta,
      [key]: sequence,
    }));
  }

  /**
   * Gets an app setting value.
   */
  getSetting(key: string, defaultValue: any = null): any {
    const meta = this.get();
    if (meta && key in meta) {
      return meta[key];
    }
    try {
      if (isDbReady()) {
        const db = getDb();
        const row = db.prepare('SELECT value_json FROM app_settings WHERE key = ?').get(key) as { value_json: string } | undefined;
        if (row) {
          try {
            return JSON.parse(row.value_json);
          } catch {
            return row.value_json;
          }
        }
      }
    } catch {}
    return defaultValue;
  }

  /**
   * Sets an app setting value.
   */
  setSetting(key: string, value: any): void {
    this.update((meta) => ({
      ...meta,
      [key]: value,
    }));
  }
}

export const countersRepository = new CountersRepository();
export const metaRepository = countersRepository;
