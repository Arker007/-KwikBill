import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../../config/paths.ts';
import { DIR_CACHE_TTL_MS } from '../../config/env.ts';
import {
  writeJsonAtomic,
  writeJsonAtomicAsync,
  readJsonSafe,
  readJsonSafeAsync,
  deleteFileSafe,
  deleteFileSafeAsync,
} from '../../../../../server/shared/utils/atomicFs.js';
import { safeFileName, isPathInside } from '../../../../../server/shared/utils/pathUtils.js';

export interface JsonRepositoryOptions {
  idField?: string;
  cacheTtlMs?: number;
}

/**
 * Pure flat-file JSON collection repository.
 * Retained for emergency rollback and standalone verification.
 */
export class JsonCollectionRepository<T = any> {
  public dirPath: string;
  public dirName: string;
  public idField: string;
  public cacheTtlMs: number;
  protected cache: T[] | null;
  protected cacheTimestamp: number;

  constructor(dirNameOrPath: string, options: JsonRepositoryOptions = {}) {
    this.dirPath = path.isAbsolute(dirNameOrPath)
      ? dirNameOrPath
      : path.join(DATA_DIR, dirNameOrPath);
    this.dirName = path.basename(this.dirPath);
    this.idField = options.idField || 'id';
    this.cacheTtlMs = options.cacheTtlMs || DIR_CACHE_TTL_MS;
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  ensureDir(): void {
    if (!fs.existsSync(this.dirPath)) {
      fs.mkdirSync(this.dirPath, { recursive: true });
    }
  }

  getFilePath(id: string | number): string {
    const strId = String(id);
    if (
      strId.includes('..') ||
      strId.includes('\0') ||
      strId.startsWith('/') ||
      strId.startsWith('\\') ||
      /^[a-zA-Z]:/.test(strId)
    ) {
      const err: any = new Error(`Invalid path traversal detected for document ID: ${id}`);
      err.status = 400;
      err.statusCode = 400;
      err.code = 'bad-request';
      throw err;
    }
    const filename = `${safeFileName(id)}.json`;
    const resolved = path.join(this.dirPath, filename);
    if (!isPathInside(resolved, this.dirPath)) {
      const err: any = new Error(`Invalid path traversal detected for document ID: ${id}`);
      err.status = 400;
      err.statusCode = 400;
      err.code = 'bad-request';
      throw err;
    }
    return resolved;
  }

  invalidateCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  findAll(predicate?: (item: T) => boolean): T[] {
    if (this.cache && (Date.now() - this.cacheTimestamp) < this.cacheTtlMs) {
      return predicate ? this.cache.filter(predicate) : [...this.cache];
    }

    this.ensureDir();
    const files = fs.readdirSync(this.dirPath).filter((f: string) => f.endsWith('.json'));
    const items: T[] = [];

    for (const f of files) {
      const fullPath = path.join(this.dirPath, f);
      const data = readJsonSafe(fullPath);
      if (data) {
        items.push(data);
      }
    }

    this.cache = items;
    this.cacheTimestamp = Date.now();
    return predicate ? items.filter(predicate) : [...items];
  }

  async findAllAsync(predicate?: (item: T) => boolean): Promise<T[]> {
    if (this.cache && (Date.now() - this.cacheTimestamp) < this.cacheTtlMs) {
      return predicate ? this.cache.filter(predicate) : [...this.cache];
    }

    await fs.promises.mkdir(this.dirPath, { recursive: true });
    const files = (await fs.promises.readdir(this.dirPath)).filter((f: string) => f.endsWith('.json'));
    const items: T[] = [];

    for (const f of files) {
      const fullPath = path.join(this.dirPath, f);
      const data = await readJsonSafeAsync(fullPath);
      if (data) {
        items.push(data);
      }
    }

    this.cache = items;
    this.cacheTimestamp = Date.now();
    return predicate ? items.filter(predicate) : [...items];
  }

  findById(id: string | number): T | null {
    const filePath = this.getFilePath(id);
    return readJsonSafe(filePath, null);
  }

  async findByIdAsync(id: string | number): Promise<T | null> {
    const filePath = this.getFilePath(id);
    return await readJsonSafeAsync(filePath, null);
  }

  save(data: any, customId?: string | number): T {
    const id = customId !== undefined ? customId : data[this.idField];
    if (id === undefined || id === null) {
      throw new Error(`Missing '${this.idField}' on record to save in ${this.dirName}`);
    }
    this.ensureDir();
    const filePath = this.getFilePath(id);
    writeJsonAtomic(filePath, data);
    this.invalidateCache();
    return data;
  }

  async saveAsync(data: any, customId?: string | number): Promise<T> {
    const id = customId !== undefined ? customId : data[this.idField];
    if (id === undefined || id === null) {
      throw new Error(`Missing '${this.idField}' on record to save in ${this.dirName}`);
    }
    await fs.promises.mkdir(this.dirPath, { recursive: true });
    const filePath = this.getFilePath(id);
    await writeJsonAtomicAsync(filePath, data);
    this.invalidateCache();
    return data;
  }

  delete(id: string | number): boolean {
    const filePath = this.getFilePath(id);
    deleteFileSafe(filePath);
    this.invalidateCache();
    return true;
  }

  async deleteAsync(id: string | number): Promise<boolean> {
    const filePath = this.getFilePath(id);
    await deleteFileSafeAsync(filePath);
    this.invalidateCache();
    return true;
  }

  moveTo(id: string | number, targetRepo: any): T | null {
    const item = this.findById(id);
    if (!item) return null;
    targetRepo.save(item, id);
    this.delete(id);
    return item;
  }

  async moveToAsync(id: string | number, targetRepo: any): Promise<T | null> {
    const item = await this.findByIdAsync(id);
    if (!item) return null;
    await targetRepo.saveAsync(item, id);
    await this.deleteAsync(id);
    return item;
  }

  exists(id: string | number): boolean {
    try {
      const filePath = this.getFilePath(id);
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  count(): number {
    return this.findAll().length;
  }
}
