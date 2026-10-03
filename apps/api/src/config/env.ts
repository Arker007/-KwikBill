import fs from 'fs';
import { PORT_FILE } from './paths.ts';

export const NODE_ENV: string = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION: boolean = NODE_ENV === 'production';
export const IS_TEST: boolean = NODE_ENV === 'test';

export const DEFAULT_PORT: number = parseInt(process.env.PORT || '3000', 10);
export const MAX_PORT_SCAN: number = 50;
export const BODY_LIMIT: string = '20mb';
export const DIR_CACHE_TTL_MS: number = 5000;

// Storage engine configuration (SQLite adapter & dual-write shadow mode)
export const USE_SQLITE: boolean = process.env.USE_SQLITE === 'true';
export const SQLITE_DUAL_WRITE: boolean = process.env.SQLITE_DUAL_WRITE !== 'false';

/**
 * Resolves the initial server port from environment or persisted port file.
 */
export function getStartingPort(): number {
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
