import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../../config/paths.ts';
import { DIR_CACHE_TTL_MS, USE_SQLITE, SQLITE_DUAL_WRITE } from '../../config/env.ts';
import {
  writeJsonAtomic,
  writeJsonAtomicAsync,
  readJsonSafe,
  readJsonSafeAsync,
  deleteFileSafe,
  deleteFileSafeAsync,
} from '../../../../../server/shared/utils/atomicFs.js';
import { safeFileName, isPathInside } from '../../../../../server/shared/utils/pathUtils.js';
import { getDb, initDb, isDbReady } from './sqlite.ts';

function toPaisa(rupees: any): number {
  if (rupees === null || rupees === undefined || isNaN(Number(rupees))) {
    return 0;
  }
  return Math.round(Number(rupees) * 100);
}

export interface RepositoryOptions {
  idField?: string;
  cacheTtlMs?: number;
  dualWrite?: boolean;
  useSqlite?: boolean;
}

/**
 * SQLite-backed repository managing document collections with optional flat-file dual-write.
 */
export class SqliteCollectionRepository<T = any> {
  public dirPath: string;
  public dirName: string;
  public idField: string;
  public cacheTtlMs: number;
  public dualWrite: boolean;
  public useSqlite: boolean;
  protected cache: T[] | null;
  protected cacheTimestamp: number;
  protected isTrash: boolean;

  constructor(dirNameOrPath: string, options: RepositoryOptions = {}) {
    this.dirPath = path.isAbsolute(dirNameOrPath)
      ? dirNameOrPath
      : path.join(DATA_DIR, dirNameOrPath);
    this.dirName = path.basename(this.dirPath);
    this.idField = options.idField || 'id';
    this.cacheTtlMs = options.cacheTtlMs || DIR_CACHE_TTL_MS;
    this.dualWrite = options.dualWrite !== undefined
      ? options.dualWrite
      : (String(SQLITE_DUAL_WRITE) !== 'false' && SQLITE_DUAL_WRITE !== false);
    this.useSqlite = options.useSqlite !== undefined
      ? options.useSqlite
      : (String(USE_SQLITE) !== 'false' && USE_SQLITE !== false);

    this.cache = null;
    this.cacheTimestamp = 0;
    this.isTrash = this.dirName === 'trash';
  }

  /**
   * Safe access to SQLite connection
   */
  _getDb(): any {
    if (!this.useSqlite) return null;
    try {
      if (!isDbReady()) {
        initDb();
      }
      return getDb();
    } catch {
      return null;
    }
  }

  /**
   * Ensures the underlying storage directory exists (for dual-write).
   */
  ensureDir(): void {
    if (!fs.existsSync(this.dirPath)) {
      fs.mkdirSync(this.dirPath, { recursive: true });
    }
  }

  /**
   * Computes traversal-safe absolute path for a document ID.
   */
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

  /**
   * Invalidates memory cache for this collection.
   */
  invalidateCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Reads all documents in collection synchronously.
   */
  findAll(predicate?: (item: T) => boolean): T[] {
    if (this.cache && (Date.now() - this.cacheTimestamp) < this.cacheTtlMs) {
      return predicate ? this.cache.filter(predicate) : [...this.cache];
    }

    const db = this._getDb();
    let items: T[] = [];

    if (db) {
      try {
        items = this._queryAllSql(db);
      } catch {
        items = [];
      }
    }

    // Check flat-file directory for any files that may not be in SQLite (e.g. test artifacts)
    if (this.dualWrite && fs.existsSync(this.dirPath)) {
      try {
        const files = fs.readdirSync(this.dirPath).filter((f: string) => f.endsWith('.json'));
        if (files.length > 0 && items.length < files.length) {
          const knownIds = new Set(items.map((i: any) => String(i[this.idField] || i.id)));
          for (const f of files) {
            const fullPath = path.join(this.dirPath, f);
            const data = readJsonSafe(fullPath);
            if (data) {
              const dataId = String(data[this.idField] || data.id || path.basename(f, '.json'));
              if (!knownIds.has(dataId)) {
                items.push(data);
                knownIds.add(dataId);
                // Ingest into SQLite asynchronously/safely
                try {
                  this._writeSql(db, data, dataId);
                } catch {}
              }
            }
          }
        }
      } catch {}
    }

    // Fallback to pure JSON if SQLite was not available or empty
    if (!db && fs.existsSync(this.dirPath)) {
      const files = fs.readdirSync(this.dirPath).filter((f: string) => f.endsWith('.json'));
      items = files.map((f: string) => readJsonSafe(path.join(this.dirPath, f))).filter(Boolean);
    }

    this.cache = items;
    this.cacheTimestamp = Date.now();
    return predicate ? items.filter(predicate) : [...items];
  }

  /**
   * Reads all documents in collection asynchronously.
   */
  async findAllAsync(predicate?: (item: T) => boolean): Promise<T[]> {
    return this.findAll(predicate);
  }

  /**
   * Reads a single document by ID synchronously.
   */
  findById(id: string | number): T | null {
    // Path traversal check
    this.getFilePath(id);

    const db = this._getDb();
    if (db) {
      try {
        const item = this._queryByIdSql(db, id);
        if (item) return item;
      } catch {}
    }

    // Fallback or dual-write check
    const filePath = this.getFilePath(id);
    const item = readJsonSafe(filePath, null);
    if (item && db) {
      // Sync into SQLite
      try {
        this._writeSql(db, item, id);
      } catch {}
    }
    return item;
  }

  /**
   * Reads a single document by ID asynchronously.
   */
  async findByIdAsync(id: string | number): Promise<T | null> {
    return this.findById(id);
  }

  /**
   * Saves or overwrites a document synchronously.
   */
  save(data: any, customId?: string | number): T {
    const id = customId !== undefined ? customId : data[this.idField];
    if (id === undefined || id === null) {
      throw new Error(`Missing '${this.idField}' on record to save in ${this.dirName}`);
    }

    // Validate path traversal
    const filePath = this.getFilePath(id);

    const db = this._getDb();
    if (db) {
      try {
        this._writeSql(db, data, id);
      } catch (err) {
        if (!this.dualWrite) {
          throw err;
        }
      }
    }

    // JSON is the source of truth when SQLite is disabled/unavailable.
    // dualWrite only controls the shadow copy while SQLite is active.
    if (!db || this.dualWrite) {
      this.ensureDir();
      writeJsonAtomic(filePath, data);
    }

    this.invalidateCache();
    return data;
  }

  /**
   * Saves or overwrites a document asynchronously.
   */
  async saveAsync(data: any, customId?: string | number): Promise<T> {
    const id = customId !== undefined ? customId : data[this.idField];
    if (id === undefined || id === null) {
      throw new Error(`Missing '${this.idField}' on record to save in ${this.dirName}`);
    }

    const filePath = this.getFilePath(id);

    const db = this._getDb();
    if (db) {
      try {
        this._writeSql(db, data, id);
      } catch (err) {
        if (!this.dualWrite) {
          throw err;
        }
      }
    }

    if (!db || this.dualWrite) {
      await fs.promises.mkdir(this.dirPath, { recursive: true });
      await writeJsonAtomicAsync(filePath, data);
    }

    this.invalidateCache();
    return data;
  }

  /**
   * Deletes a document by ID synchronously.
   */
  delete(id: string | number): boolean {
    const filePath = this.getFilePath(id);

    const db = this._getDb();
    if (db) {
      try {
        this._deleteSql(db, id);
      } catch {}
    }

    if (!db || this.dualWrite) {
      deleteFileSafe(filePath);
    }

    this.invalidateCache();
    return true;
  }

  /**
   * Deletes a document by ID asynchronously.
   */
  async deleteAsync(id: string | number): Promise<boolean> {
    const filePath = this.getFilePath(id);

    const db = this._getDb();
    if (db) {
      try {
        this._deleteSql(db, id);
      } catch {}
    }

    if (!db || this.dualWrite) {
      await deleteFileSafeAsync(filePath);
    }

    this.invalidateCache();
    return true;
  }

  /**
   * Moves a document from this collection to another CollectionRepository (e.g. soft-delete to trash).
   */
  moveTo(id: string | number, targetRepo: any): T | null {
    const item = this.findById(id);
    if (!item) return null;
    targetRepo.save(item, id);
    this.delete(id);
    return item;
  }

  /**
   * Moves a document from this collection to another CollectionRepository asynchronously.
   */
  async moveToAsync(id: string | number, targetRepo: any): Promise<T | null> {
    const item = await this.findByIdAsync(id);
    if (!item) return null;
    await targetRepo.saveAsync(item, id);
    await this.deleteAsync(id);
    return item;
  }

  /**
   * Checks whether a document exists.
   */
  exists(id: string | number): boolean {
    try {
      const filePath = this.getFilePath(id);
      const db = this._getDb();
      if (db) {
        if (this._existsSql(db, id)) return true;
      }
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Total number of documents in collection.
   */
  count(): number {
    return this.findAll().length;
  }

  // ---------------------------------------------------------------------------
  // SQL QUERY DISPATCHERS
  // ---------------------------------------------------------------------------

  _queryAllSql(db: any): T[] {
    switch (this.dirName) {
      case 'bills': {
        const isDeleted = this.isTrash ? 1 : 0;
        const rows = db.prepare('SELECT raw_json FROM bills WHERE is_deleted = ? ORDER BY date DESC, created_at DESC;').all(isDeleted);
        return rows.map((r: any) => r.raw_json ? JSON.parse(r.raw_json) : null).filter(Boolean);
      }
      case 'clients': {
        const rows = db.prepare('SELECT raw_json FROM clients ORDER BY name ASC;').all();
        return rows.map((r: any) => r.raw_json ? JSON.parse(r.raw_json) : null).filter(Boolean);
      }
      case 'products': {
        const rows = db.prepare('SELECT raw_json FROM products ORDER BY name ASC;').all();
        return rows.map((r: any) => r.raw_json ? JSON.parse(r.raw_json) : null).filter(Boolean);
      }
      case 'expenses': {
        const rows = db.prepare('SELECT raw_json FROM expenses ORDER BY date DESC;').all();
        return rows.map((r: any) => r.raw_json ? JSON.parse(r.raw_json) : null).filter(Boolean);
      }
      case 'purchases': {
        const rows = db.prepare('SELECT raw_json FROM purchases ORDER BY date DESC;').all();
        return rows.map((r: any) => r.raw_json ? JSON.parse(r.raw_json) : null).filter(Boolean);
      }
      case 'receipts': {
        const rows = db.prepare('SELECT raw_json FROM receipts ORDER BY date DESC;').all();
        return rows.map((r: any) => r.raw_json ? JSON.parse(r.raw_json) : null).filter(Boolean);
      }
      case 'recurring': {
        const rows = db.prepare('SELECT template_json FROM recurring_templates ORDER BY created_at DESC;').all();
        return rows.map((r: any) => r.template_json ? JSON.parse(r.template_json) : null).filter(Boolean);
      }
      case 'templates': {
        const rows = db.prepare('SELECT id, title, content, is_default, created_at, updated_at FROM terms_templates ORDER BY title ASC;').all();
        return rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          content: r.content,
          isDefault: Boolean(r.is_default),
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })) as any;
      }
      case 'profiles': {
        const rows = db.prepare('SELECT raw_json FROM profiles ORDER BY is_default DESC, company_name ASC;').all();
        return rows.map((r: any) => r.raw_json ? JSON.parse(r.raw_json) : null).filter(Boolean);
      }
      default: {
        const rows = db.prepare('SELECT raw_json FROM documents WHERE collection = ? ORDER BY created_at DESC;').all(this.dirName);
        return rows.map((r: any) => r.raw_json ? JSON.parse(r.raw_json) : null).filter(Boolean);
      }
    }
  }

  _queryByIdSql(db: any, id: string | number): T | null {
    const strId = String(id);
    switch (this.dirName) {
      case 'bills': {
        const isDeleted = this.isTrash ? 1 : 0;
        const row = db.prepare('SELECT raw_json FROM bills WHERE id = ? AND is_deleted = ?;').get(strId, isDeleted);
        return row?.raw_json ? JSON.parse(row.raw_json) : null;
      }
      case 'clients': {
        const row = db.prepare('SELECT raw_json FROM clients WHERE id = ?;').get(strId);
        return row?.raw_json ? JSON.parse(row.raw_json) : null;
      }
      case 'products': {
        const row = db.prepare('SELECT raw_json FROM products WHERE id = ?;').get(strId);
        return row?.raw_json ? JSON.parse(row.raw_json) : null;
      }
      case 'expenses': {
        const row = db.prepare('SELECT raw_json FROM expenses WHERE id = ?;').get(strId);
        return row?.raw_json ? JSON.parse(row.raw_json) : null;
      }
      case 'purchases': {
        const row = db.prepare('SELECT raw_json FROM purchases WHERE id = ?;').get(strId);
        return row?.raw_json ? JSON.parse(row.raw_json) : null;
      }
      case 'receipts': {
        const row = db.prepare('SELECT raw_json FROM receipts WHERE id = ?;').get(strId);
        return row?.raw_json ? JSON.parse(row.raw_json) : null;
      }
      case 'recurring': {
        const row = db.prepare('SELECT template_json FROM recurring_templates WHERE id = ?;').get(strId);
        return row?.template_json ? JSON.parse(row.template_json) : null;
      }
      case 'templates': {
        const row = db.prepare('SELECT id, title, content, is_default, created_at, updated_at FROM terms_templates WHERE id = ?;').get(strId);
        if (!row) return null;
        return {
          id: row.id,
          title: row.title,
          content: row.content,
          isDefault: Boolean(row.is_default),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        } as any;
      }
      case 'profiles': {
        const row = db.prepare('SELECT raw_json FROM profiles WHERE id = ?;').get(strId);
        return row?.raw_json ? JSON.parse(row.raw_json) : null;
      }
      default: {
        const row = db.prepare('SELECT raw_json FROM documents WHERE collection = ? AND id = ?;').get(this.dirName, strId);
        return row?.raw_json ? JSON.parse(row.raw_json) : null;
      }
    }
  }

  _existsSql(db: any, id: string | number): boolean {
    const strId = String(id);
    switch (this.dirName) {
      case 'bills': {
        const isDeleted = this.isTrash ? 1 : 0;
        const row = db.prepare('SELECT 1 FROM bills WHERE id = ? AND is_deleted = ?;').get(strId, isDeleted);
        return Boolean(row);
      }
      case 'clients': {
        const row = db.prepare('SELECT 1 FROM clients WHERE id = ?;').get(strId);
        return Boolean(row);
      }
      case 'products': {
        const row = db.prepare('SELECT 1 FROM products WHERE id = ?;').get(strId);
        return Boolean(row);
      }
      case 'expenses': {
        const row = db.prepare('SELECT 1 FROM expenses WHERE id = ?;').get(strId);
        return Boolean(row);
      }
      case 'purchases': {
        const row = db.prepare('SELECT 1 FROM purchases WHERE id = ?;').get(strId);
        return Boolean(row);
      }
      case 'receipts': {
        const row = db.prepare('SELECT 1 FROM receipts WHERE id = ?;').get(strId);
        return Boolean(row);
      }
      case 'recurring': {
        const row = db.prepare('SELECT 1 FROM recurring_templates WHERE id = ?;').get(strId);
        return Boolean(row);
      }
      case 'templates': {
        const row = db.prepare('SELECT 1 FROM terms_templates WHERE id = ?;').get(strId);
        return Boolean(row);
      }
      case 'profiles': {
        const row = db.prepare('SELECT 1 FROM profiles WHERE id = ?;').get(strId);
        return Boolean(row);
      }
      default: {
        const row = db.prepare('SELECT 1 FROM documents WHERE collection = ? AND id = ?;').get(this.dirName, strId);
        return Boolean(row);
      }
    }
  }

  _deleteSql(db: any, id: string | number): void {
    const strId = String(id);
    switch (this.dirName) {
      case 'bills': {
        if (this.isTrash) {
          db.prepare('DELETE FROM bills WHERE id = ? AND is_deleted = 1;').run(strId);
        } else {
          db.prepare('DELETE FROM bills WHERE id = ?;').run(strId);
        }
        break;
      }
      case 'clients': {
        db.prepare('DELETE FROM clients WHERE id = ?;').run(strId);
        break;
      }
      case 'products': {
        db.prepare('DELETE FROM products WHERE id = ?;').run(strId);
        break;
      }
      case 'expenses': {
        db.prepare('DELETE FROM expenses WHERE id = ?;').run(strId);
        break;
      }
      case 'purchases': {
        db.prepare('DELETE FROM purchases WHERE id = ?;').run(strId);
        break;
      }
      case 'receipts': {
        db.prepare('DELETE FROM receipts WHERE id = ?;').run(strId);
        break;
      }
      case 'recurring': {
        db.prepare('DELETE FROM recurring_templates WHERE id = ?;').run(strId);
        break;
      }
      case 'templates': {
        db.prepare('DELETE FROM terms_templates WHERE id = ?;').run(strId);
        break;
      }
      case 'profiles': {
        db.prepare('DELETE FROM profiles WHERE id = ?;').run(strId);
        break;
      }
      default: {
        db.prepare('DELETE FROM documents WHERE collection = ? AND id = ?;').run(this.dirName, strId);
        break;
      }
    }
  }

  _writeSql(db: any, data: any, id: string | number): void {
    const strId = String(id);
    const now = Date.now();
    const rawJson = JSON.stringify(data);

    switch (this.dirName) {
      case 'bills': {
        const profileId = data.profileId || data.profile_id || 'profile_default';
        const clientId = data.clientId || data.client_id || (data.data?.client?.id ? String(data.data.client.id) : 'client_walkin');
        
        // Ensure profile and client references exist
        db.prepare(`
          INSERT OR IGNORE INTO profiles (id, is_default, company_name, state_code, state_name, created_at, updated_at)
          VALUES (?, 1, 'My Business', '27', 'Maharashtra', ?, ?);
        `).run(profileId, now, now);

        db.prepare(`
          INSERT OR IGNORE INTO clients (id, profile_id, name, state_code, state_name, created_at, updated_at)
          VALUES (?, ?, 'Walk-in Customer', '27', 'Maharashtra', ?, ?);
        `).run(clientId, profileId, now, now);

        const totals = data.data?.totals || {};
        const details = data.data?.details || {};
        const isDeleted = this.isTrash ? 1 : (data.isDeleted ? 1 : 0);

        db.prepare(`
          INSERT OR REPLACE INTO bills (
            id, profile_id, client_id, invoice_number, invoice_type, date, due_date,
            financial_year, place_of_supply, is_interstate, is_reverse_charge, discount_mode,
            tax_inclusive, taxable_amount_paisa, cgst_amount_paisa, sgst_amount_paisa,
            igst_amount_paisa, utgst_amount_paisa, cess_amount_paisa, total_tax_paisa,
            tcs_amount_paisa, tds_amount_paisa, round_off_paisa, grand_total_paisa,
            balance_due_paisa, status, eway_bill_no, irn, qr_code_text, notes, terms,
            print_settings_json, raw_json, is_deleted, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          );
        `).run(
          strId,
          profileId,
          clientId,
          data.invoiceNumber || data.billNumber || strId,
          data.invoiceType || details.invoiceType || 'tax_invoice',
          data.invoiceDate || details.invoiceDate || new Date().toISOString().slice(0, 10),
          data.dueDate || details.dueDate || null,
          details.financialYear || '2026-27',
          details.placeOfSupply || '27-Maharashtra',
          details.isInterstate ? 1 : 0,
          details.reverseCharge ? 1 : 0,
          details.discountMode || 'fixed_net',
          details.taxInclusive ? 1 : 0,
          toPaisa(totals.taxableAmount ?? data.taxableAmount ?? 0),
          toPaisa(totals.cgstAmount ?? data.cgstAmount ?? 0),
          toPaisa(totals.sgstAmount ?? data.sgstAmount ?? 0),
          toPaisa(totals.igstAmount ?? data.igstAmount ?? 0),
          toPaisa(totals.utgstAmount ?? data.utgstAmount ?? 0),
          toPaisa(totals.cessAmount ?? data.cessAmount ?? 0),
          toPaisa(totals.totalTaxAmount ?? data.totalTaxAmount ?? 0),
          toPaisa(totals.tcsAmount ?? 0),
          toPaisa(totals.tdsAmount ?? 0),
          toPaisa(totals.roundOff ?? 0),
          toPaisa(totals.total ?? data.totalAmount ?? 0),
          toPaisa(totals.balanceDue ?? 0),
          data.status || 'unpaid',
          data.ewayBillNo || null,
          data.irn || null,
          data.qrCodeText || null,
          data.notes || null,
          data.terms || null,
          data.settings ? JSON.stringify(data.settings) : null,
          rawJson,
          isDeleted,
          data.createdAt ? new Date(data.createdAt).getTime() : now,
          data.updatedAt ? new Date(data.updatedAt).getTime() : now
        );

        // Sync bill items into relational bill_items table
        const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.data?.items) ? data.data.items : []);
        if (items.length > 0) {
          db.prepare('DELETE FROM bill_items WHERE bill_id = ?;').run(strId);
          const insertBillItemStmt = db.prepare(`
            INSERT OR REPLACE INTO bill_items (
              id, bill_id, product_id, item_order, name, description, hsn_sac,
              quantity, unit, unit_price_paisa, discount_type, discount_base, discount_value,
              gst_rate_percent, cess_percent, taxable_amount_paisa,
              cgst_amount_paisa, sgst_amount_paisa, igst_amount_paisa, utgst_amount_paisa, cess_amount_paisa,
              total_tax_paisa, line_total_paisa
            ) VALUES (
              ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?,
              ?, ?, ?,
              ?, ?, ?, ?, ?,
              ?, ?
            );
          `);

          let itemIndex = 0;
          for (const item of items) {
            itemIndex++;
            const itemId = item.id || `item_${strId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${itemIndex}`;
            insertBillItemStmt.run(
              itemId,
              strId,
              item.productId || null,
              itemIndex,
              item.name || item.description || `Item #${itemIndex}`,
              item.description || null,
              item.hsn || item.hsnSac || '99',
              Number(item.quantity ?? item.qty ?? 1),
              item.unit || 'PCS',
              toPaisa(item.rate ?? item.price ?? item.unitPrice ?? 0),
              item.discountType || 'fixed',
              item.discountBase || 'net',
              Number(item.discount || item.discountValue || 0),
              Number(item.gstRate ?? item.taxRate ?? 18),
              Number(item.cessRate ?? item.cess ?? 0),
              toPaisa(item.taxableAmount ?? item.taxable ?? 0),
              toPaisa(item.cgstAmount ?? item.cgst ?? 0),
              toPaisa(item.sgstAmount ?? item.sgst ?? 0),
              toPaisa(item.igstAmount ?? item.igst ?? 0),
              toPaisa(item.utgstAmount ?? item.utgst ?? 0),
              toPaisa(item.cessAmount ?? item.cess ?? 0),
              toPaisa(item.totalTaxAmount ?? item.totalTax ?? 0),
              toPaisa(item.total ?? item.lineTotal ?? 0)
            );
          }
        }
        break;
      }
      case 'clients': {
        const profileId = data.profileId || 'profile_default';
        db.prepare(`
          INSERT OR IGNORE INTO profiles (id, is_default, company_name, state_code, state_name, created_at, updated_at)
          VALUES (?, 1, 'My Business', '27', 'Maharashtra', ?, ?);
        `).run(profileId, now, now);

        db.prepare(`
          INSERT OR REPLACE INTO clients (
            id, profile_id, name, trade_name, gstin, pan, state_code, state_name,
            billing_address_json, shipping_address_json, is_sez, credit_limit_paisa,
            opening_balance_paisa, notes, raw_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `).run(
          strId,
          profileId,
          data.name || data.clientName || 'Unnamed Client',
          data.tradeName || null,
          data.gstin || null,
          data.pan || null,
          data.stateCode || data.state || '27',
          data.stateName || data.state || 'Maharashtra',
          data.billingAddress ? JSON.stringify(data.billingAddress) : null,
          data.shippingAddress ? JSON.stringify(data.shippingAddress) : null,
          data.isSez ? 1 : 0,
          toPaisa(data.creditLimit || 0),
          toPaisa(data.openingBalance || 0),
          data.notes || null,
          rawJson,
          data.createdAt ? new Date(data.createdAt).getTime() : now,
          data.updatedAt ? new Date(data.updatedAt).getTime() : now
        );
        break;
      }
      case 'products': {
        const profileId = data.profileId || 'profile_default';
        db.prepare(`
          INSERT OR IGNORE INTO profiles (id, is_default, company_name, state_code, state_name, created_at, updated_at)
          VALUES (?, 1, 'My Business', '27', 'Maharashtra', ?, ?);
        `).run(profileId, now, now);

        db.prepare(`
          INSERT OR REPLACE INTO products (
            id, profile_id, item_type, name, sku, hsn_sac, unit, purchase_price_paisa,
            selling_price_paisa, gst_rate_percent, cess_percent, stock_quantity,
            min_stock_alert, raw_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `).run(
          strId,
          profileId,
          data.itemType || 'goods',
          data.name || 'Unnamed Product',
          data.sku || null,
          data.hsn || data.hsnSac || '99',
          data.unit || 'PCS',
          toPaisa(data.purchasePrice || 0),
          toPaisa(data.price || data.sellingPrice || 0),
          Number(data.gstRate || data.gstRatePercent || 18),
          Number(data.cess || data.cessPercent || 0),
          Number(data.stockQuantity || data.stock || 0),
          Number(data.minStockAlert || 0),
          rawJson,
          data.createdAt ? new Date(data.createdAt).getTime() : now,
          data.updatedAt ? new Date(data.updatedAt).getTime() : now
        );
        break;
      }
      case 'expenses': {
        const profileId = data.profileId || 'profile_default';
        db.prepare(`
          INSERT OR IGNORE INTO profiles (id, is_default, company_name, state_code, state_name, created_at, updated_at)
          VALUES (?, 1, 'My Business', '27', 'Maharashtra', ?, ?);
        `).run(profileId, now, now);

        db.prepare(`
          INSERT OR REPLACE INTO expenses (
            id, profile_id, category, vendor_name, vendor_gstin, date, financial_year,
            amount_paisa, gst_rate_percent, itc_eligible, itc_igst_paisa, itc_cgst_paisa,
            itc_sgst_paisa, receipt_url, notes, raw_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `).run(
          strId,
          profileId,
          data.category || 'General',
          data.vendorName || null,
          data.vendorGstin || null,
          data.date || new Date().toISOString().slice(0, 10),
          data.financialYear || '2026-27',
          toPaisa(data.amount || 0),
          Number(data.gstRate || 0),
          data.itcEligible === false ? 0 : 1,
          toPaisa(data.itcIgst || 0),
          toPaisa(data.itcCgst || 0),
          toPaisa(data.itcSgst || 0),
          data.receiptUrl || null,
          data.notes || null,
          rawJson,
          data.createdAt ? new Date(data.createdAt).getTime() : now,
          data.updatedAt ? new Date(data.updatedAt).getTime() : now
        );
        break;
      }
      case 'purchases': {
        const profileId = data.profileId || 'profile_default';
        db.prepare(`
          INSERT OR IGNORE INTO profiles (id, is_default, company_name, state_code, state_name, created_at, updated_at)
          VALUES (?, 1, 'My Business', '27', 'Maharashtra', ?, ?);
        `).run(profileId, now, now);

        db.prepare(`
          INSERT OR REPLACE INTO purchases (
            id, profile_id, supplier_name, supplier_gstin, bill_number, date,
            financial_year, subtotal_paisa, tax_total_paisa, grand_total_paisa,
            itc_eligible, notes, raw_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `).run(
          strId,
          profileId,
          data.supplierName || 'Unknown Supplier',
          data.supplierGstin || null,
          data.billNumber || strId,
          data.date || new Date().toISOString().slice(0, 10),
          data.financialYear || '2026-27',
          toPaisa(data.subtotal || 0),
          toPaisa(data.taxTotal || 0),
          toPaisa(data.grandTotal || data.amount || 0),
          data.itcEligible === false ? 0 : 1,
          data.notes || null,
          rawJson,
          data.createdAt ? new Date(data.createdAt).getTime() : now,
          data.updatedAt ? new Date(data.updatedAt).getTime() : now
        );
        break;
      }
      case 'receipts': {
        const profileId = data.profileId || 'profile_default';
        const clientId = data.clientId || 'client_walkin';
        db.prepare(`
          INSERT OR IGNORE INTO profiles (id, is_default, company_name, state_code, state_name, created_at, updated_at)
          VALUES (?, 1, 'My Business', '27', 'Maharashtra', ?, ?);
        `).run(profileId, now, now);

        db.prepare(`
          INSERT OR IGNORE INTO clients (id, profile_id, name, state_code, state_name, created_at, updated_at)
          VALUES (?, ?, 'Walk-in Customer', '27', 'Maharashtra', ?, ?);
        `).run(clientId, profileId, now, now);

        db.prepare(`
          INSERT OR REPLACE INTO receipts (
            id, profile_id, client_id, receipt_number, date, amount_paisa,
            payment_mode, reference_number, notes, raw_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `).run(
          strId,
          profileId,
          clientId,
          data.receiptNumber || strId,
          data.date || new Date().toISOString().slice(0, 10),
          toPaisa(data.amount || 0),
          data.paymentMode || 'cash',
          data.referenceNumber || null,
          data.notes || null,
          rawJson,
          data.createdAt ? new Date(data.createdAt).getTime() : now,
          data.updatedAt ? new Date(data.updatedAt).getTime() : now
        );
        break;
      }
      case 'recurring': {
        const profileId = data.profileId || 'profile_default';
        const clientId = data.clientId || 'client_walkin';
        db.prepare(`
          INSERT OR IGNORE INTO profiles (id, is_default, company_name, state_code, state_name, created_at, updated_at)
          VALUES (?, 1, 'My Business', '27', 'Maharashtra', ?, ?);
        `).run(profileId, now, now);

        db.prepare(`
          INSERT OR IGNORE INTO clients (id, profile_id, name, state_code, state_name, created_at, updated_at)
          VALUES (?, ?, 'Walk-in Customer', '27', 'Maharashtra', ?, ?);
        `).run(clientId, profileId, now, now);

        db.prepare(`
          INSERT OR REPLACE INTO recurring_templates (
            id, profile_id, client_id, frequency, next_issue_date, auto_generate,
            template_json, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `).run(
          strId,
          profileId,
          clientId,
          data.frequency || 'monthly',
          data.nextIssueDate || data.nextDate || new Date().toISOString().slice(0, 10),
          data.autoGenerate ? 1 : 0,
          rawJson,
          data.isActive === false ? 0 : 1,
          data.createdAt ? new Date(data.createdAt).getTime() : now,
          data.updatedAt ? new Date(data.updatedAt).getTime() : now
        );
        break;
      }
      case 'templates': {
        db.prepare(`
          INSERT OR REPLACE INTO terms_templates (
            id, title, content, is_default, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?);
        `).run(
          strId,
          data.title || 'Untitled Template',
          data.content || '',
          data.isDefault ? 1 : 0,
          data.createdAt ? new Date(data.createdAt).getTime() : now,
          data.updatedAt ? new Date(data.updatedAt).getTime() : now
        );
        break;
      }
      case 'profiles': {
        db.prepare(`
          INSERT OR REPLACE INTO profiles (
            id, is_default, company_name, trade_name, gstin, pan, state_code, state_name,
            address_line1, address_line2, city, pincode, phone, email, bank_details_json,
            upi_id, signature_data_url, logo_data_url, raw_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `).run(
          strId,
          data.isDefault ? 1 : 0,
          data.companyName || data.businessName || 'My Business',
          data.tradeName || null,
          data.gstin || null,
          data.pan || null,
          data.stateCode || data.state || '27',
          data.stateName || data.state || 'Maharashtra',
          data.addressLine1 || data.address || null,
          data.addressLine2 || null,
          data.city || null,
          data.pincode || data.pin || null,
          data.phone || null,
          data.email || null,
          data.bankDetails ? JSON.stringify(data.bankDetails) : null,
          data.upiId || null,
          data.signature || null,
          data.logo || null,
          rawJson,
          data.createdAt ? new Date(data.createdAt).getTime() : now,
          data.updatedAt ? new Date(data.updatedAt).getTime() : now
        );
        break;
      }
      default: {
        db.prepare(`
          INSERT OR REPLACE INTO documents (collection, id, raw_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?);
        `).run(
          this.dirName,
          strId,
          rawJson,
          data.createdAt ? new Date(data.createdAt).getTime() : now,
          now
        );
        break;
      }
    }
  }
}
