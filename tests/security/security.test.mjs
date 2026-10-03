import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { cleanupIsolatedDataDir } from '../helpers/isolatedDataDir.mjs';
import { app } from '../../server/app.js';
import { safeFileName, safePathSegment, isPathInside, sanitizeId } from '../../apps/api/src/shared/utils/pathUtils.ts';

let server = null;
let baseUrl = 'http://127.0.0.1:3000';

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  cleanupIsolatedDataDir();
});

async function request(pathStr, options = {}) {
  const targetUrl = `${baseUrl}${pathStr.startsWith('/') ? '' : '/'}${pathStr}`;
  const res = await fetch(targetUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body && typeof options.body === 'object' ? JSON.stringify(options.body) : options.body,
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

// ---------------------------------------------------------------------------
// 1. Unit Security Assertions: pathUtils functions
// ---------------------------------------------------------------------------
test('pathUtils.safeFileName: Replaces path separators and reserved characters', () => {
  assert.equal(safeFileName('../../etc/passwd'), '.._.._etc_passwd');
  assert.equal(safeFileName('INV/2026/001'), 'INV_2026_001');
  assert.equal(safeFileName('C:\\Windows\\System32'), 'C__Windows_System32');
  assert.equal(safeFileName('file*name?"<test>|'), 'file_name___test__');
});

test('pathUtils.safePathSegment: Strips directory traversal and control characters', () => {
  assert.equal(safePathSegment('../../etc/passwd'), '----etc-passwd');
  assert.equal(safePathSegment('..%2F..%2Fsecret'), '----secret');
  assert.equal(safePathSegment('invoice/001'), 'invoice-001');
  assert.equal(safePathSegment(''), 'Untitled');
  assert.equal(safePathSegment(null), 'Untitled');
  assert.equal(safePathSegment(undefined, 'Fallback'), 'Fallback');
});

test('pathUtils.isPathInside: Enforces directory confinement', () => {
  const root = '/app/data';
  assert.equal(isPathInside('/app/data/bills/inv1.json', root), true);
  assert.equal(isPathInside('/app/data/bills', root), true);
  assert.equal(isPathInside('/app/data', root), true);
  assert.equal(isPathInside('/app/etc/passwd', root), false);
  assert.equal(isPathInside('/etc/passwd', root), false);
  assert.equal(isPathInside('/app/data/../secret', root), false);
});

test('pathUtils.sanitizeId: Strips double dots and normalizes ID', () => {
  assert.equal(sanitizeId('INV/2026-27/001'), 'INV_2026-27_001');
  assert.equal(sanitizeId('../../secret'), '__secret');
  assert.equal(sanitizeId('normal-id_123'), 'normal-id_123');
  assert.equal(sanitizeId(null), '');
});

// ---------------------------------------------------------------------------
// 2. HTTP Endpoint Path Traversal Fuzzing Matrix
// ---------------------------------------------------------------------------
const collections = ['bills', 'clients', 'products', 'expenses', 'purchases', 'receipts', 'recurring', 'profiles'];
const attackVectors = [
  '..%2F..%2Fetc%2Fpasswd',
  '..%5C..%5Cwindows%5Cwin.ini',
  '....//....//etc/passwd',
  '%2e%2e%2f%2e%2e%2fetc%2fpasswd',
  encodeURIComponent('/etc/passwd'),
  encodeURIComponent('C:\\boot.ini'),
  'INV%00hidden',
  'test%00nullbyte'
];

for (const col of collections) {
  test(`HTTP Path Traversal Security: Rejects traversal attempts on /api/${col}/:id`, async () => {
    for (const vector of attackVectors) {
      const res = await request(`/api/${col}/${vector}`);
      assert.equal(res.status, 400, `Expected HTTP 400 for GET /api/${col}/${vector}`);
    }
  });

  test(`HTTP Body Path Traversal Security: Rejects malicious ID payload on POST /api/${col}`, async () => {
    const maliciousPayloads = [
      { id: '../../etc/passwd', name: 'Exploit' },
      { id: '/etc/shadow', name: 'Exploit' },
      { id: 'C:\\Windows\\win.ini', name: 'Exploit' },
      { id: 'test\0malicious', name: 'Exploit' }
    ];

    for (const payload of maliciousPayloads) {
      const res = await request(`/api/${col}`, {
        method: 'POST',
        body: payload
      });
      assert.equal(res.status, 400, `Expected HTTP 400 for POST /api/${col} with ID "${payload.id}"`);
    }
  });
}

// ---------------------------------------------------------------------------
// 3. Query Parameter Traversal Protection
// ---------------------------------------------------------------------------
test('Path Traversal Security: Rejects traversal in trash pdf queries', async () => {
  const res = await request('/api/trash-pdf?file=..%2F..%2Fsecret.pdf');
  assert.equal(res.status, 400);

  const res2 = await request(`/api/trash-pdf?file=${encodeURIComponent('/etc/passwd')}`);
  assert.equal(res2.status, 400);
});

// ---------------------------------------------------------------------------
// 4. Statutory Invariants: Legitimate Invoice IDs with Slashes
// ---------------------------------------------------------------------------
test('Statutory Invoice Numbers: Permits standard slash separator in invoice ID', async () => {
  const invoiceId = 'INV/2026-27/099';
  const postRes = await request('/api/bills?overwrite=1', {
    method: 'POST',
    body: {
      id: invoiceId,
      invoiceNumber: invoiceId,
      invoiceDate: '2026-09-15',
      client: { name: 'Acme Corp', state: 'Delhi' },
      items: [{ name: 'Widget', qty: 1, rate: 100, taxRate: 18 }],
    }
  });
  assert.equal(postRes.status, 200);

  const getRes = await request(`/api/bills/${encodeURIComponent(invoiceId)}`);
  assert.equal(getRes.status, 200);
  assert.equal(getRes.data.id, invoiceId);

  const delRes = await request(`/api/bills/${encodeURIComponent(invoiceId)}?permanent=1`, {
    method: 'DELETE'
  });
  assert.equal(delRes.status, 200);
});

test('Valid Operations: Normal API endpoints succeed', async () => {
  const res = await request('/api/bills');
  assert.equal(res.status, 200);
  assert(Array.isArray(res.data));
});
