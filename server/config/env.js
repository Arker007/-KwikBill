import fs from 'fs';
import { PORT_FILE } from './paths.js';

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_TEST = NODE_ENV === 'test';

export const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10);
export const MAX_PORT_SCAN = 50;
export const BODY_LIMIT = '5mb';
export const DIR_CACHE_TTL_MS = 5000;

// Storage engine configuration (Phase 5: SQLite adapter & dual-write shadow mode)
export const USE_SQLITE = process.env.USE_SQLITE === 'true';
export const SQLITE_DUAL_WRITE = process.env.SQLITE_DUAL_WRITE !== 'false';

/**
 * Resolves the initial server port from environment or persisted port file.
 * @returns {number}
 */
export function getStartingPort() {
  if (process.env.PORT) {
    const envPort = parseInt(process.env.PORT, 10);
    if (Number.isFinite(envPort) && envPort >= 1024 && envPort <= 65535) {
      return envPort;
    }
  }

  try {
    if (fs.existsSync(PORT_FILE)) {
      const persisted = parseInt(fs.readFileSync(PORT_FILE, 'utf-8').trim(), 10);
      if (Number.isFinite(persisted) && persisted >= 1024 && persisted <= 65535) {
        return persisted;
      }
    }
  } catch {
    // Ignore file read failure and fall back to default
  }

  return DEFAULT_PORT;
}
