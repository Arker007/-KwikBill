import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanupIsolatedDataDir } from '../helpers/isolatedDataDir.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

let baseUrl = 'http://127.0.0.1:3000';
let serverProc = null;

before(async () => {
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
        resolve(`http://127.0.0.1:${match[1] || '3000'}`);
      }
    });
    serverProc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
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

const entities = ['bills', 'clients', 'products', 'expenses', 'purchases', 'receipts', 'recurring', 'profiles'];

// 1. Assert all entity endpoints
for (const entity of entities) {
  test(`${entity} API contract: GET, POST, GET/:id, DELETE/:id`, async (t) => {
    // GET /
    const getList = await fetch(`${baseUrl}/api/${entity}`);
    assert.equal(getList.status, 200);
    const list = await getList.json();
    assert.ok(Array.isArray(list));

    // POST /
    const dummyPayload = { id: `test-${entity}-${Date.now()}`, name: 'Test' };
    const postRes = await fetch(`${baseUrl}/api/${entity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dummyPayload)
    });
    assert.equal(postRes.status, 200, `POST /api/${entity} failed`);
    const saved = await postRes.json();
    assert.ok(saved.success, `Expected success from POST /api/${entity}`);

    // GET /:id
    const getById = await fetch(`${baseUrl}/api/${entity}/${dummyPayload.id}`);
    assert.equal(getById.status, 200, `GET /api/${entity}/:id failed`);
    const fetched = await getById.json();
    assert.equal(fetched.id, dummyPayload.id);

    // DELETE /:id
    const delRes = await fetch(`${baseUrl}/api/${entity}/${dummyPayload.id}?permanent=1`, { method: 'DELETE' });
    assert.equal(delRes.status, 200, `DELETE /api/${entity}/:id failed`);
  });
}

// 2. Invoice creation, PDF, Backups, Trash
test('System API contract: meta, trash-pdf, backups, trash', async (t) => {
  // meta
  const metaPost = await fetch(`${baseUrl}/api/meta/test_meta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: 'hello' })
  });
  assert.equal(metaPost.status, 200);

  const metaGet = await fetch(`${baseUrl}/api/meta/test_meta`);
  assert.equal(metaGet.status, 200);
  const metaData = await metaGet.json();
  assert.equal(metaData.value, 'hello');

  // backups
  const backupRes = await fetch(`${baseUrl}/api/backups/now`, { method: 'POST' });
  assert.equal(backupRes.status, 200);
  const backupData = await backupRes.json();
  assert.ok(backupData.success);

  const getBackups = await fetch(`${baseUrl}/api/backups`);
  assert.equal(getBackups.status, 200);
  const backupsList = await getBackups.json();
  assert.ok(Array.isArray(backupsList));
  assert.ok(backupsList.length > 0);

  // trash restoration
  const getTrash = await fetch(`${baseUrl}/api/trash`);
  assert.equal(getTrash.status, 200);
  const trashList = await getTrash.json();
  assert.ok(Array.isArray(trashList));
  
  if (trashList.length > 0) {
    const item = trashList[0];
    const restoreRes = await fetch(`${baseUrl}/api/trash/${item.id}/restore`, { method: 'POST' });
    assert.equal(restoreRes.status, 200);
  }
});
