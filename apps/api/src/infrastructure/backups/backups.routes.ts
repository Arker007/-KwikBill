import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { DATA_DIR, BACKUPS_DIR } from '../../config/paths.ts';
import { readJsonSafe, writeJsonAtomic } from '../../../../../server/shared/utils/atomicFs.js';
import { safeFileName, isPathInside } from '../../../../../server/shared/utils/pathUtils.js';
import { errRes } from '../../../../../server/shared/middleware/errorHandler.js';
import { runDailyBackup } from './backupEngine.ts';
import {
  createBackupSnapshot,
  listBackupSnapshots,
  restoreBackupSnapshot,
  deleteBackupSnapshot,
} from './snapshotManager.ts';
import { invoicingService } from '../../modules/invoicing/invoicing.service.ts';

let lastBackupNowMs = 0;

function readAllFromDir(dirName: string): any[] {
  const p = path.join(DATA_DIR, dirName);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJsonSafe(path.join(p, f), null))
    .filter(Boolean);
}

export const backupsRouter: Router = Router();

// /api/export
backupsRouter.get('/export', (req: Request, res: Response): void => {
  try {
    const data = {
      bills: readAllFromDir('bills'),
      profile: readJsonSafe(path.join(DATA_DIR, 'profile.json'), { businessName: '', address: '', gstin: '' }),
      clients: readAllFromDir('clients'),
      termsTemplates: readAllFromDir('templates'),
      products: readAllFromDir('products'),
      expenses: readAllFromDir('expenses'),
      recurring: readAllFromDir('recurring'),
      receipts: readAllFromDir('receipts'),
      profiles: readAllFromDir('profiles'),
      purchases: readAllFromDir('purchases'),
      meta: readJsonSafe(path.join(DATA_DIR, 'meta.json'), {}),
      exportedAt: new Date().toISOString(),
    };
    res.json(data);
  } catch (err: any) {
    errRes(res, 500, 'server-error', err);
  }
});

// /api/import
backupsRouter.post('/import', (req: Request, res: Response): void => {
  try {
    const data = req.body || {};
    const overwrite = req.query.overwrite === '1' || req.query.overwrite === 'true';
    const counts: Record<string, number> = {
      billCount: 0, billSkipped: 0,
      clientCount: 0, clientSkipped: 0,
      templateCount: 0, templateSkipped: 0,
      productCount: 0, productSkipped: 0,
      expenseCount: 0, expenseSkipped: 0,
      recurringCount: 0, recurringSkipped: 0,
      receiptCount: 0, receiptSkipped: 0,
      profileCount: 0, profileSkipped: 0,
      purchaseCount: 0, purchaseSkipped: 0,
    };

    const upsertOne = (dirName: string, entity: any, countKey: string, skipKey: string) => {
      if (!entity?.id) return;
      const p = path.join(DATA_DIR, dirName, safeFileName(entity.id) + '.json');
      if (!overwrite && fs.existsSync(p)) {
        counts[skipKey]++;
        return;
      }
      writeJsonAtomic(p, entity);
      counts[countKey]++;
    };

    if (data.profile) {
      const pPath = path.join(DATA_DIR, 'profile.json');
      if (overwrite || !fs.existsSync(pPath)) {
        writeJsonAtomic(pPath, data.profile);
      }
    }

    (data.bills || []).forEach((b: any) => upsertOne('bills', b, 'billCount', 'billSkipped'));
    (data.clients || []).forEach((c: any) => upsertOne('clients', c, 'clientCount', 'clientSkipped'));
    (data.termsTemplates || []).forEach((t: any) => upsertOne('templates', t, 'templateCount', 'templateSkipped'));
    (data.products || []).forEach((p: any) => upsertOne('products', p, 'productCount', 'productSkipped'));
    (data.expenses || []).forEach((e: any) => upsertOne('expenses', e, 'expenseCount', 'expenseSkipped'));
    (data.recurring || []).forEach((r: any) => upsertOne('recurring', r, 'recurringCount', 'recurringSkipped'));
    (data.receipts || []).forEach((r: any) => upsertOne('receipts', r, 'receiptCount', 'receiptSkipped'));
    (data.profiles || []).forEach((p: any) => upsertOne('profiles', p, 'profileCount', 'profileSkipped'));
    (data.purchases || []).forEach((p: any) => upsertOne('purchases', p, 'purchaseCount', 'purchaseSkipped'));

    const mPath = path.join(DATA_DIR, 'meta.json');
    if (data.meta) {
      if (overwrite || !fs.existsSync(mPath)) {
        writeJsonAtomic(mPath, data.meta);
      }
    }

    // Reconcile sequence counters
    try {
      const meta = readJsonSafe(mPath, {});
      const billsDir = path.join(DATA_DIR, 'bills');
      if (fs.existsSync(billsDir)) {
        const billFiles = fs.readdirSync(billsDir).filter((f) => f.endsWith('.json'));
        const maxByPrefix: Record<string, number> = {};
        for (const f of billFiles) {
          let bill: any;
          try {
            bill = readJsonSafe(path.join(billsDir, f), null);
          } catch {
            continue;
          }
          const num = String(bill?.invoiceNumber || bill?.id || '');
          const m = num.match(/^([A-Z]+)[\W_].*?(\d+)\s*$/i);
          if (!m) continue;
          const prefix = m[1].toUpperCase();
          const suffix = parseInt(m[2], 10);
          if (!Number.isFinite(suffix)) continue;
          if (!maxByPrefix[prefix] || suffix > maxByPrefix[prefix]) {
            maxByPrefix[prefix] = suffix;
          }
        }
        let metaChanged = false;
        for (const [prefix, maxNum] of Object.entries(maxByPrefix)) {
          const key = `counter_${prefix}`;
          const existing = Number(meta[key]) || 0;
          if (maxNum > existing) {
            meta[key] = maxNum;
            metaChanged = true;
          }
        }
        if (metaChanged) {
          writeJsonAtomic(mPath, meta);
        }
      }
    } catch (err) {
      console.error('Post-import counter reconciliation failed:', err);
    }

    try {
      invoicingService.invalidateCache();
    } catch {
      /* ignore */
    }

    res.json({ ...counts, hasProfile: !!data.profile });
  } catch (err: any) {
    errRes(res, 500, 'server-error', err);
  }
});

// /api/backups (list)
backupsRouter.get('/backups', (req: Request, res: Response): void => {
  try {
    const list = listBackupSnapshots();
    res.json(list);
  } catch (err: any) {
    errRes(res, 500, 'server-error', err);
  }
});

// /api/backups/create & /api/backups/now
function handleCreateBackup(req: Request, res: Response): void {
  const now = Date.now();
  if (now - lastBackupNowMs < 5000) {
    return errRes(res, 429, 'server-error');
  }
  lastBackupNowMs = now;
  try {
    const customName = req.body?.name;
    const result = customName ? createBackupSnapshot(customName, 'manual') : runDailyBackup();
    res.json({ success: true, ...result });
  } catch (err: any) {
    errRes(res, 500, 'server-error', err);
  }
}

backupsRouter.post('/backups/create', handleCreateBackup);
backupsRouter.post('/backups/now', handleCreateBackup);

// /api/backups/restore (accepts { date: '...' } in body)
backupsRouter.post('/backups/restore', (req: Request, res: Response): void => {
  try {
    const targetDate = req.body?.date || req.body?.name;
    if (!targetDate) {
      return errRes(res, 400, 'bad-request');
    }
    const result = restoreBackupSnapshot(targetDate);
    res.json(result);
  } catch (err: any) {
    errRes(res, 500, 'server-error', err);
  }
});

// /api/backups/:date/restore
backupsRouter.post('/backups/:date/restore', (req: Request, res: Response): void => {
  try {
    const date = req.params.date;
    const result = restoreBackupSnapshot(date);
    res.json(result);
  } catch (err: any) {
    errRes(res, 500, 'server-error', err);
  }
});

// /api/backups/:date (delete)
backupsRouter.delete('/backups/:date', (req: Request, res: Response): void => {
  try {
    const date = req.params.date;
    const result = deleteBackupSnapshot(date);
    res.json(result);
  } catch (err: any) {
    errRes(res, 500, 'server-error', err);
  }
});
