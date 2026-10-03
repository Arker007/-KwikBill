/**
 * Native Node.js HTTP Smoke Test Harness (E2E)
 * 
 * Verifies live backend API endpoints and frontend SPA delivery without
 * requiring heavy browser automation binaries (Playwright/Puppeteer).
 * 
 * Usage:
 *   node tests/e2e/smoke.test.mjs
 */

import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cleanupIsolatedDataDir } from '../helpers/isolatedDataDir.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

let baseUrl = 'http://127.0.0.1:3000';
let serverProc = null;

before(async () => {
  // Always start an isolated server; never mutate an already-running user instance.
  serverProc = spawn(process.execPath, ['server.js'], {
    cwd: ROOT_DIR,
    env: { ...process.env, PORT: '3000' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  baseUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server did not report ready within 15s')), 15000);
    serverProc.stdout.on('data', (chunk) => {
      const match = String(chunk).match(/http:\/\/(?:0\.0\.0\.0|localhost|127\.0\.0\.1):(\d+)/);
      if (match) {
        clearTimeout(timer);
        const port = match[1] || '3000';
        resolve(`http://127.0.0.1:${port}`);
      }
    });
    serverProc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    serverProc.on('exit', (code) => {
      clearTimeout(timer);
      if (code !== 0 && code !== null) {
        reject(new Error(`Server process exited prematurely with code ${code}`));
      }
    });
  });
});

after(async () => {
  if (serverProc) {
    const exited = new Promise((resolve) => serverProc.once('exit', resolve));
    serverProc.kill();
    await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 3000))]);
  }
  cleanupIsolatedDataDir();
});

test('health check: GET /api/health returns 200 and { ok: true }', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/health');
  const body = await res.json();
  assert.equal(body.ok, true, 'Expected body.ok to be true');
});

test('bills list: GET /api/bills returns 200 and an array', async () => {
  const res = await fetch(`${baseUrl}/api/bills`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/bills');
  const body = await res.json();
  assert.ok(Array.isArray(body), 'Expected /api/bills response to be an array');
});

test('clients list: GET /api/clients returns 200 and an array', async () => {
  const res = await fetch(`${baseUrl}/api/clients`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/clients');
  const body = await res.json();
  assert.ok(Array.isArray(body), 'Expected /api/clients response to be an array');
});

test('products list: GET /api/products returns 200 and an array', async () => {
  const res = await fetch(`${baseUrl}/api/products`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/products');
  const body = await res.json();
  assert.ok(Array.isArray(body), 'Expected /api/products response to be an array');
});

test('expenses list: GET /api/expenses returns 200 and an array', async () => {
  const res = await fetch(`${baseUrl}/api/expenses`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/expenses');
  const body = await res.json();
  assert.ok(Array.isArray(body), 'Expected /api/expenses response to be an array');
});

test('purchases list: GET /api/purchases returns 200 and an array', async () => {
  const res = await fetch(`${baseUrl}/api/purchases`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/purchases');
  const body = await res.json();
  assert.ok(Array.isArray(body), 'Expected /api/purchases response to be an array');
});

test('receipts list: GET /api/receipts returns 200 and an array', async () => {
  const res = await fetch(`${baseUrl}/api/receipts`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/receipts');
  const body = await res.json();
  assert.ok(Array.isArray(body), 'Expected /api/receipts response to be an array');
});

test('recurring list: GET /api/recurring returns 200 and an array', async () => {
  const res = await fetch(`${baseUrl}/api/recurring`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/recurring');
  const body = await res.json();
  assert.ok(Array.isArray(body), 'Expected /api/recurring response to be an array');
});

test('profiles list: GET /api/profiles returns 200 and an array', async () => {
  const res = await fetch(`${baseUrl}/api/profiles`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/profiles');
  const body = await res.json();
  assert.ok(Array.isArray(body), 'Expected /api/profiles response to be an array');
});

test('primary profile read: GET /api/profile returns 200 and an object', async () => {
  const res = await fetch(`${baseUrl}/api/profile`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/profile');
  const body = await res.json();
  assert.ok(typeof body === 'object' && body !== null, 'Expected /api/profile response to be an object');
});

test('templates list: GET /api/templates returns 200 and an array', async () => {
  const res = await fetch(`${baseUrl}/api/templates`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/templates');
  const body = await res.json();
  assert.ok(Array.isArray(body), 'Expected /api/templates response to be an array');
});

test('taxation summary: GET /api/taxation/summary returns 200 and GSTR data', async () => {
  const res = await fetch(`${baseUrl}/api/taxation/summary`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/taxation/summary');
  const body = await res.json();
  assert.ok(typeof body === 'object' && body !== null, 'Expected summary object');
  assert.ok('gstr1' in body && 'gstr3b' in body, 'Expected gstr1 and gstr3b in summary');
});

test('reports summary: GET /api/reports/summary returns 200 and overview report', async () => {
  const res = await fetch(`${baseUrl}/api/reports/summary`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/reports/summary');
  const body = await res.json();
  assert.ok(typeof body === 'object' && body !== null, 'Expected overview object');
  assert.ok('totalSales' in body && 'profitAndLoss' in body, 'Expected sales and pnl in report');
});

test('meta read: GET /api/meta/test_smoke_key returns 200 with value', async () => {
  const res = await fetch(`${baseUrl}/api/meta/test_smoke_key`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/meta/test_smoke_key');
  const body = await res.json();
  assert.ok('value' in body, 'Expected body to contain value key');
});

test('meta atomic increment: POST /api/meta/test_smoke_counter/increment returns incremented value', async () => {
  const res = await fetch(`${baseUrl}/api/meta/test_smoke_counter/increment`, { method: 'POST' });
  assert.equal(res.status, 200, 'Expected HTTP 200 for /api/meta/:key/increment');
  const body = await res.json();
  assert.ok(typeof body.value === 'number', 'Expected numeric value from increment');
});

test('frontend static serving: GET / returns 200 and contains <div id="root">', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for /');
  const html = await res.text();
  assert.ok(html.includes('<div id="root">'), 'Expected index.html to contain <div id="root">');
});

test('bills create with slash ID: POST /api/bills accepts standard invoice ID with slash', async () => {
  const testBill = {
    id: 'INV/2026-27/099',
    invoiceNumber: 'INV/2026-27/099',
    invoiceDate: '2026-09-15',
    client: { name: 'Acme Corp', state: 'Delhi' },
    items: [{ name: 'Widget', qty: 1, rate: 100, taxRate: 18 }],
  };
  const res = await fetch(`${baseUrl}/api/bills?overwrite=1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testBill),
  });
  assert.equal(res.status, 200, 'Expected HTTP 200 when saving bill with slash ID');
  const body = await res.json();
  assert.equal(body.success, true);

  // Retrieve bill with slash ID
  const getRes = await fetch(`${baseUrl}/api/bills/${encodeURIComponent(testBill.id)}`);
  assert.equal(getRes.status, 200, 'Expected HTTP 200 when fetching bill with slash ID');
  const getBody = await getRes.json();
  assert.equal(getBody.id, testBill.id);

  // Cleanup: delete bill
  const delRes = await fetch(`${baseUrl}/api/bills/${encodeURIComponent(testBill.id)}?permanent=1`, {
    method: 'DELETE',
  });
  assert.equal(delRes.status, 200, 'Expected HTTP 200 when deleting bill with slash ID');
});

test('path traversal rejection: rejects parent directory in URL and body', async () => {
  // Reject URL path traversal
  const urlRes = await fetch(`${baseUrl}/api/bills/..%2F..%2Fetc%2Fpasswd`);
  assert.equal(urlRes.status, 400, 'Expected HTTP 400 for URL traversal');

  // Reject body ID path traversal
  const bodyRes = await fetch(`${baseUrl}/api/bills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: '../../etc/passwd', invoiceNumber: 'INV-MALICIOUS' }),
  });
  assert.equal(bodyRes.status, 400, 'Expected HTTP 400 for body traversal');

  // Reject absolute path ID
  const absRes = await fetch(`${baseUrl}/api/bills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: '/etc/passwd', invoiceNumber: 'INV-MALICIOUS' }),
  });
  assert.equal(absRes.status, 400, 'Expected HTTP 400 for absolute path ID');
});

test('supabase config: GET and POST /api/supabase/config work safely', async () => {
  const getRes = await fetch(`${baseUrl}/api/supabase/config`);
  assert.equal(getRes.status, 200, 'Expected HTTP 200 for GET /api/supabase/config');
  const body = await getRes.json();
  assert.equal(typeof body.isConfigured, 'boolean', 'Expected isConfigured boolean');
  assert.equal(typeof body.autoSync, 'boolean', 'Expected autoSync boolean');

  // POST update autoSync
  const postRes = await fetch(`${baseUrl}/api/supabase/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ autoSync: false, conflictStrategy: 'local_wins' }),
  });
  assert.equal(postRes.status, 200, 'Expected HTTP 200 for POST /api/supabase/config');
  const updated = await postRes.json();
  assert.equal(updated.autoSync, false);
});

test('supabase test endpoint: POST /api/supabase/test handles connection verification', async () => {
  const res = await fetch(`${baseUrl}/api/supabase/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://test-project.supabase.co', key: 'mock-test-key' }),
  });
  assert.equal(res.status, 200, 'Expected HTTP 200 for POST /api/supabase/test');
  const body = await res.json();
  assert.equal(typeof body.ok, 'boolean', 'Expected boolean ok field');
  assert.equal(typeof body.latencyMs, 'number', 'Expected numeric latencyMs');
});

test('supabase phase 2: GET /api/supabase/local-summary returns collection counts', async () => {
  const res = await fetch(`${baseUrl}/api/supabase/local-summary`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for GET /api/supabase/local-summary');
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(typeof body.total, 'number');
  assert.ok(body.counts.bills !== undefined, 'Expected bills count');
  assert.ok(body.counts.clients !== undefined, 'Expected clients count');
  assert.ok(body.counts.products !== undefined, 'Expected products count');
});

test('supabase phase 2: GET /api/supabase/audit-log returns audit history array', async () => {
  const res = await fetch(`${baseUrl}/api/supabase/audit-log`);
  assert.equal(res.status, 200, 'Expected HTTP 200 for GET /api/supabase/audit-log');
  const body = await res.json();
  assert.ok(Array.isArray(body), 'Expected array of audit logs');
});

test('supabase phase 2: transformers convert bidirectional models for all 8 collections', async () => {
  const { SupabaseTransformers } = await import('../../apps/api/src/infrastructure/cloud-sync/index.ts');

  // 1. Business Profiles
  const localProfile = { id: 'primary', businessName: 'Test Corp', gstin: '27AAAAA0000A1Z5' };
  const remoteProfile = SupabaseTransformers.business_profiles.toRemote(localProfile);
  assert.equal(remoteProfile.business_name, 'Test Corp');
  assert.equal(remoteProfile.gstin, '27AAAAA0000A1Z5');
  const roundtripProfile = SupabaseTransformers.business_profiles.toLocal(remoteProfile);
  assert.equal(roundtripProfile.businessName, 'Test Corp');

  // 2. Clients
  const localClient = { id: 'cli-1', name: 'Acme Ltd', creditLimit: 50000 };
  const remoteClient = SupabaseTransformers.clients.toRemote(localClient);
  assert.equal(remoteClient.name, 'Acme Ltd');
  assert.equal(remoteClient.credit_limit, 50000);
  const roundtripClient = SupabaseTransformers.clients.toLocal(remoteClient);
  assert.equal(roundtripClient.name, 'Acme Ltd');
  assert.equal(roundtripClient.creditLimit, 50000);

  // 3. Products
  const localProduct = { id: 'prd-1', name: 'Widget A', price: 100, gst: 18 };
  const remoteProduct = SupabaseTransformers.products.toRemote(localProduct);
  assert.equal(remoteProduct.selling_price, 100);
  assert.equal(remoteProduct.tax_rate, 18);
  const roundtripProduct = SupabaseTransformers.products.toLocal(remoteProduct);
  assert.equal(roundtripProduct.sellingPrice, 100);

  // 4. Bills
  const localBill = { id: 'INV/2026/001', clientName: 'Client X', totalAmount: 1180, cgst: 90, sgst: 90 };
  const remoteBill = SupabaseTransformers.bills.toRemote(localBill);
  assert.equal(remoteBill.id, 'INV/2026/001');
  assert.equal(remoteBill.grand_total, 1180);
  assert.equal(remoteBill.cgst_total, 90);
  const roundtripBill = SupabaseTransformers.bills.toLocal(remoteBill);
  assert.equal(roundtripBill.id, 'INV/2026/001');

  // 5. Expenses
  const localExpense = { id: 'exp-1', category: 'Rent', totalAmount: 15000 };
  const remoteExpense = SupabaseTransformers.expenses.toRemote(localExpense);
  assert.equal(remoteExpense.category, 'Rent');
  assert.equal(remoteExpense.total_amount, 15000);

  // 6. Purchases
  const localPurchase = { id: 'pur-1', supplierName: 'Vendor Y', totalAmount: 20000 };
  const remotePurchase = SupabaseTransformers.purchases.toRemote(localPurchase);
  assert.equal(remotePurchase.supplier_name, 'Vendor Y');

  // 7. Receipts
  const localReceipt = { id: 'rec-1', receiptNumber: 'REC-001', amount: 5000 };
  const remoteReceipt = SupabaseTransformers.receipts.toRemote(localReceipt);
  assert.equal(remoteReceipt.receipt_number, 'REC-001');
  assert.equal(remoteReceipt.amount, 5000);

  // 8. Recurring
  const localRecurring = { id: 'recur-1', clientName: 'Client Z', frequency: 'monthly' };
  const remoteRecurring = SupabaseTransformers.recurring.toRemote(localRecurring);
  assert.equal(remoteRecurring.client_name, 'Client Z');
  assert.equal(remoteRecurring.frequency, 'monthly');
});

test('supabase phase 2: createSnapshotBeforeSync generates rollback snapshot', async () => {
  const { createSnapshotBeforeSync } = await import('../../apps/api/src/infrastructure/cloud-sync/index.ts');
  const snapshotName = createSnapshotBeforeSync('test-pre-sync');
  assert.ok(snapshotName.startsWith('test-pre-sync-'), 'Expected snapshot name prefix');
  const { BACKUPS_DIR } = await import('../../apps/api/src/config/paths.ts');
  const snapshotPath = path.join(BACKUPS_DIR, snapshotName);
  assert.ok(fs.existsSync(snapshotPath), 'Snapshot folder must exist on disk');

  // Clean up test snapshot
  try { fs.rmSync(snapshotPath, { recursive: true, force: true }); } catch {}
});

test('supabase phase 2: syncUp and syncDown execute with batching and conflict resolution', async () => {
  const { SupabaseSyncService } = await import('../../apps/api/src/infrastructure/cloud-sync/index.ts');
  const service = new SupabaseSyncService();

  // In-memory mock client
  const database = {
    bills: [],
    clients: [],
    products: [],
    expenses: [],
    purchases: [],
    receipts: [],
    recurring: [],
    business_profiles: [],
    sync_audit_log: []
  };

  const mockClient = {
    from(tableName) {
      return {
        async upsert(rows) {
          database[tableName] = database[tableName] || [];
          for (const row of rows) {
            const idx = database[tableName].findIndex(r => r.id === row.id);
            if (idx >= 0) database[tableName][idx] = row;
            else database[tableName].push(row);
          }
          return { error: null };
        },
        async insert(rows) {
          database[tableName] = database[tableName] || [];
          database[tableName].push(...rows);
          return { error: null };
        },
        select(cols) {
          return {
            range: async (start, end) => {
              const rows = database[tableName] || [];
              return { data: rows.slice(start, end + 1), error: null };
            }
          };
        }
      };
    }
  };

  // Test syncUp
  const upResult = await service.syncUp(mockClient, { triggeredBy: 'test' });
  assert.equal(upResult.ok, true, 'syncUp must succeed');
  assert.equal(typeof upResult.durationMs, 'number');
  assert.ok(upResult.summary.collections.bills !== undefined);

  // Test syncDown with local_wins
  const downResult = await service.syncDown(mockClient, { conflictStrategy: 'local_wins', triggeredBy: 'test' });
  assert.equal(downResult.ok, true, 'syncDown must succeed');
  assert.ok(downResult.snapshotCreated.startsWith('pre-supabase-sync-'));

  // Clean up created snapshot
  const { BACKUPS_DIR } = await import('../../apps/api/src/config/paths.ts');
  try {
    fs.rmSync(path.join(BACKUPS_DIR, downResult.snapshotCreated), { recursive: true, force: true });
  } catch {}
});
