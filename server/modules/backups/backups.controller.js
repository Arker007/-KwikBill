import fs from 'fs';
import path from 'path';
import { BACKUPS_DIR, DATA_DIR, PROFILE_FILE as PROFILE_PATH, META_FILE as META_PATH } from '../../config/paths.js';
import { readJsonSafe, writeJsonAtomic } from '../../shared/utils/atomicFs.js';
import { safeFileName, isPathInside } from '../../shared/utils/pathUtils.js';
import { errRes } from '../../shared/middleware/errorHandler.js';
import { ensureDir, copyDirRecursive, runDailyBackup } from '../../infrastructure/backup/backupEngine.js';
import { billsService } from '../bills/bills.service.js';

let __lastBackupNowMs = 0;

function readAllFromDir(dirName) {
  const p = path.join(DATA_DIR, dirName);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p)
    .filter(f => f.endsWith('.json'))
    .map(f => readJsonSafe(path.join(p, f), null))
    .filter(Boolean);
}

export const BackupsController = {
  exportData(req, res) {
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
  },

  importData(req, res) {
    const data = req.body;
    const overwrite = req.query.overwrite === '1' || req.query.overwrite === 'true';
    const counts = {
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

    const upsertOne = (dirName, entity, countKey, skipKey) => {
      if (!entity?.id) return;
      const p = path.join(DATA_DIR, dirName, safeFileName(entity.id) + '.json');
      if (!overwrite && fs.existsSync(p)) { counts[skipKey]++; return; }
      writeJsonAtomic(p, entity);
      counts[countKey]++;
    };

    if (data.profile) {
      const pPath = path.join(DATA_DIR, 'profile.json');
      if (overwrite || !fs.existsSync(pPath)) {
        writeJsonAtomic(pPath, data.profile);
      }
    }
    (data.bills || []).forEach(b => upsertOne('bills', b, 'billCount', 'billSkipped'));
    (data.clients || []).forEach(c => upsertOne('clients', c, 'clientCount', 'clientSkipped'));
    (data.termsTemplates || []).forEach(t => upsertOne('templates', t, 'templateCount', 'templateSkipped'));
    (data.products || []).forEach(p => upsertOne('products', p, 'productCount', 'productSkipped'));
    (data.expenses || []).forEach(e => upsertOne('expenses', e, 'expenseCount', 'expenseSkipped'));
    (data.recurring || []).forEach(r => upsertOne('recurring', r, 'recurringCount', 'recurringSkipped'));
    (data.receipts || []).forEach(r => upsertOne('receipts', r, 'receiptCount', 'receiptSkipped'));
    (data.profiles || []).forEach(p => upsertOne('profiles', p, 'profileCount', 'profileSkipped'));
    (data.purchases || []).forEach(p => upsertOne('purchases', p, 'purchaseCount', 'purchaseSkipped'));

    const mPath = path.join(DATA_DIR, 'meta.json');
    if (data.meta) {
      if (overwrite || !fs.existsSync(mPath)) {
        writeJsonAtomic(mPath, data.meta);
      }
    }

    try {
      const meta = readJsonSafe(mPath, {});
      const billFiles = fs.readdirSync(path.join(DATA_DIR, 'bills')).filter(f => f.endsWith('.json'));
      const maxByPrefix = {};
      for (const f of billFiles) {
        let bill;
        try { bill = readJsonSafe(path.join(DATA_DIR, 'bills', f), null); } catch { continue; }
        const num = String(bill?.invoiceNumber || bill?.id || '');
        const m = num.match(/^([A-Z]+)[\W_].*?(\d+)\s*$/i);
        if (!m) continue;
        const prefix = m[1].toUpperCase();
        const suffix = parseInt(m[2], 10);
        if (!Number.isFinite(suffix)) continue;
        if (!maxByPrefix[prefix] || suffix > maxByPrefix[prefix]) maxByPrefix[prefix] = suffix;
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
      if (metaChanged) writeJsonAtomic(mPath, meta);
    } catch (err) {
      console.error('Post-import counter reconciliation failed:', err);
    }

    billsService.invalidateCache();
    res.json({ ...counts, hasProfile: !!data.profile });
  },

  listBackups(req, res) {
    try {
      ensureDir(BACKUPS_DIR);
      const list = fs.readdirSync(BACKUPS_DIR)
        .filter(n => /^\d{4}-\d{2}-\d{2}$/.test(n))
        .sort().reverse()
        .map(name => {
          const stat = fs.statSync(path.join(BACKUPS_DIR, name));
          return { date: name, createdAt: stat.mtime.toISOString() };
        });
      res.json(list);
    } catch (err) { errRes(res, 500, 'server-error', err); }
  },

  deleteBackup(req, res) {
    try {
      const date = req.params.date;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return errRes(res, 400, 'bad-request');
      const [y, m, d] = date.split('-').map(Number);
      if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2000 || y > 2100) {
        return errRes(res, 400, 'bad-request');
      }
      const backupDir = path.join(BACKUPS_DIR, date);
      if (!isPathInside(backupDir, BACKUPS_DIR)) return errRes(res, 400, 'invalid-path');
      if (!fs.existsSync(backupDir)) return errRes(res, 404, 'not-found');
      fs.rmSync(backupDir, { recursive: true, force: true });
      res.json({ success: true, date });
    } catch (err) { errRes(res, 500, 'server-error', err); }
  },

  restoreBackup(req, res) {
    let snapshotDir = null;
    const restoredDirs = [];
    try {
      const date = req.params.date;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return errRes(res, 400, 'bad-request');
      const backupDir = path.join(BACKUPS_DIR, date);
      if (!isPathInside(backupDir, BACKUPS_DIR)) return errRes(res, 400, 'invalid-path');
      if (!fs.existsSync(backupDir)) return errRes(res, 404, 'not-found');

      const [y, m, d] = date.split('-').map(Number);
      if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2000 || y > 2100) {
        return errRes(res, 400, 'bad-request');
      }

      snapshotDir = path.join(BACKUPS_DIR, `pre-restore-${Date.now()}`);
      ensureDir(snapshotDir);
      const liveEntries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
      for (const entry of liveEntries) {
        if (entry.name === 'backups' || entry.name === 'errors.log' || entry.name === 'port.txt') continue;
        const src = path.join(DATA_DIR, entry.name);
        const dst = path.join(snapshotDir, entry.name);
        if (entry.isDirectory()) copyDirRecursive(src, dst);
        else fs.copyFileSync(src, dst);
      }

      const backupEntries = fs.readdirSync(backupDir, { withFileTypes: true });
      for (const entry of backupEntries) {
        const src = path.join(backupDir, entry.name);
        const dst = path.join(DATA_DIR, entry.name);
        if (!isPathInside(dst, DATA_DIR)) continue;
        if (entry.isDirectory()) {
          if (fs.existsSync(dst)) fs.rmSync(dst, { recursive: true, force: true });
          copyDirRecursive(src, dst);
        } else {
          fs.copyFileSync(src, dst);
        }
        restoredDirs.push(entry.name);
      }

      fs.rmSync(snapshotDir, { recursive: true, force: true });
      billsService.invalidateCache();
      res.json({ success: true, restored: date });
    } catch (err) {
      if (snapshotDir && fs.existsSync(snapshotDir)) {
        try {
          for (const name of restoredDirs) {
            const dst = path.join(DATA_DIR, name);
            if (!isPathInside(dst, DATA_DIR)) continue;
            if (fs.existsSync(dst)) fs.rmSync(dst, { recursive: true, force: true });
            const snap = path.join(snapshotDir, name);
            if (fs.existsSync(snap)) {
              if (fs.statSync(snap).isDirectory()) copyDirRecursive(snap, dst);
              else fs.copyFileSync(snap, dst);
            }
          }
        } catch { /* ignore */ }
      }
      errRes(res, 500, 'server-error', err);
    }
  },

  backupNow(req, res) {
    const now = Date.now();
    if (now - __lastBackupNowMs < 5000) {
      return errRes(res, 429, 'server-error');
    }
    __lastBackupNowMs = now;
    runDailyBackup();
    res.json({ success: true });
  }
};
