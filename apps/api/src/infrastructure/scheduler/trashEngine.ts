import fs from 'fs';
import path from 'path';
import { TRASH_DIR } from '../../config/paths.ts';

let trashTimer: any = null;

function ensureDir(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch {
    /* ignore */
  }
}

/**
 * Purges files from the trash directory older than 30 days.
 */
export function purgeOldTrash(): void {
  try {
    ensureDir(TRASH_DIR);
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    for (const name of fs.readdirSync(TRASH_DIR)) {
      const p = path.join(TRASH_DIR, name);
      try {
        const stat = fs.statSync(p);
        if (now - stat.mtime.getTime() > thirtyDays) {
          try {
            fs.unlinkSync(p);
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
}

/**
 * Starts the trash engine background cleanup interval (every 24 hours).
 */
export function startTrashEngine(): void {
  stopTrashEngine();
  trashTimer = setInterval(purgeOldTrash, 24 * 60 * 60 * 1000);
  if (trashTimer && typeof trashTimer.unref === 'function') {
    trashTimer.unref();
  }
}

/**
 * Stops the trash engine cleanup interval.
 */
export function stopTrashEngine(): void {
  if (trashTimer) {
    clearInterval(trashTimer);
    trashTimer = null;
  }
}
