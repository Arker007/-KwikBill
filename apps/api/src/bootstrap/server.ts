import fs from 'fs';
import type { Server } from 'http';
import { app, setupFrontendMiddleware } from './app.ts';
import { DATA_DIR, PORT_FILE, ERRORS_LOG, ensureDirectoriesExist } from '../config/paths.ts';
import { getStartingPort, MAX_PORT_SCAN } from '../config/env.ts';
import { startRecurringEngine, stopRecurringEngine, startTrashEngine, stopTrashEngine } from '../infrastructure/scheduler/index.ts';
import { startBackupEngine, stopBackupEngine } from '../infrastructure/backups/index.ts';
import { writeFileAtomic } from '../../../../server/shared/utils/atomicFs.js';

ensureDirectoriesExist();

// Log rotation
const ERRORS_LOG_MAX = 200 * 1024;
function rotateErrorsIfLarge(): void {
  try {
    if (!fs.existsSync(ERRORS_LOG)) return;
    const stat = fs.statSync(ERRORS_LOG);
    if (stat.size <= ERRORS_LOG_MAX) return;
    const fd = fs.openSync(ERRORS_LOG, 'r');
    const keep = Buffer.alloc(ERRORS_LOG_MAX);
    fs.readSync(fd, keep, 0, ERRORS_LOG_MAX, stat.size - ERRORS_LOG_MAX);
    fs.closeSync(fd);
    const s = keep.toString('utf-8');
    const nl = s.indexOf('\n');
    writeFileAtomic(ERRORS_LOG, nl >= 0 ? s.slice(nl + 1) : s);
  } catch {
    /* ignore */
  }
}

export function logFatal(err: any, source: string = 'fatal'): void {
  try {
    rotateErrorsIfLarge();
    const ts = new Date().toISOString();
    const msg = err && err.stack ? err.stack : String(err);
    fs.appendFileSync(ERRORS_LOG, `[${ts}] [${source}] ${msg}\n`, 'utf-8');
  } catch {
    /* ignore */
  }
}

process.on('uncaughtException', (err) => logFatal(err, 'uncaughtException'));
process.on('unhandledRejection', (err) => logFatal(err, 'unhandledRejection'));

const STARTING_PORT = getStartingPort();
let activeServer: Server | null = null;

export function startServer(port: number): Server {
  const server = app.listen(port, '0.0.0.0', () => {
    activeServer = server;
    // Set activePort on app.locals so systemController can read it
    app.locals.activePort = port;
    try {
      fs.writeFileSync(PORT_FILE, String(port), 'utf-8');
    } catch {
      /* ignore */
    }
    console.log(`\n  Free GST Billing Software running at http://0.0.0.0:${port}`);
    console.log(`  Data stored in: ${DATA_DIR}\n`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE' && port < STARTING_PORT + MAX_PORT_SCAN) {
      console.log(`  Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else if (err.code === 'EADDRINUSE') {
      console.warn(`  Scanned ${MAX_PORT_SCAN} ports from ${STARTING_PORT} — letting OS assign a free one.`);
      startServer(0);
    } else {
      console.error(`  Failed to start server: ${err.message}`);
      logFatal(err, 'startup');
      process.exit(1);
    }
  });

  return server;
}

export function gracefulShutdown(signal: string): void {
  console.log(`\n  Received ${signal}, closing connections...`);
  stopRecurringEngine();
  stopTrashEngine();
  stopBackupEngine();
  if (!activeServer) {
    process.exit(0);
    return;
  }
  const force = setTimeout(() => {
    console.warn('  Force-exiting after 3s grace period');
    process.exit(1);
  }, 3000);
  force.unref();
  activeServer.close(() => {
    clearTimeout(force);
    console.log('  Server closed cleanly.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export async function bootstrap(): Promise<void> {
  await setupFrontendMiddleware(app);
  startServer(STARTING_PORT);
  startRecurringEngine({ initialDelayMs: 3000, intervalMs: 24 * 60 * 60 * 1000 });
  startBackupEngine({ initialDelayMs: 5000, intervalMs: 24 * 60 * 60 * 1000 });
  startTrashEngine();
}
