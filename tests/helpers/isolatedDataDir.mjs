import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'free-gst-tests-'));

process.env.NODE_ENV = 'test';
process.env.FREE_GST_TEST_DATA_DIR = TEST_DATA_DIR;
process.env.USE_SQLITE = 'false';
process.env.SQLITE_DUAL_WRITE = 'false';

export function cleanupIsolatedDataDir() {
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
}
