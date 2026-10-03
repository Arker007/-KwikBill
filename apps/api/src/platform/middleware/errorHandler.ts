import fs from 'fs';
import type { Request, Response, NextFunction } from 'express';
import { ERRORS_LOG } from '../../config/paths.ts';

export const ERROR_MESSAGES: Record<string, string> = {
  'bad-request': 'Invalid request',
  'not-found': 'Not found',
  'conflict': 'Conflict with existing resource',
  'server-error': 'Internal server error',
  'forbidden': 'Refused',
  'invalid-path': 'Invalid path',
  'payload-too-large': 'Request body too large',
};

/**
 * Appends error details to errors.log safely without crashing.
 */
export function logErrorToFile(code: string, err: any): void {
  if (!err) return;
  try {
    const ts = new Date().toISOString();
    const msg = err && err.stack ? err.stack : String(err);
    fs.appendFileSync(ERRORS_LOG, `[${ts}] [api:${code}] ${msg}\n`, 'utf-8');
  } catch {
    // Suppress error log write failures
  }
}

/**
 * Generic error response helper. Never leaks raw Node error messages or absolute paths.
 */
export function errRes(res: Response, status: number, code: string, err?: any): Response {
  if (err) {
    logErrorToFile(code, err);
  }
  const message = ERROR_MESSAGES[code] || code;
  return res.status(status).json({ error: message, code });
}

/**
 * Centralized Express error handler middleware.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): any {
  if (res.headersSent) {
    return next(err);
  }

  let status = 500;
  let code = 'server-error';

  if (err && typeof err.statusCode === 'number') {
    status = err.statusCode;
    code = err.code || 'server-error';
  } else if (err && typeof err.status === 'number') {
    status = err.status;
    code = err.code || 'bad-request';
  } else if (err && err.type === 'entity.too.large') {
    status = 413;
    code = 'payload-too-large';
  }

  logErrorToFile(code, err);

  const clientMessage = ERROR_MESSAGES[code] || 'Internal server error';
  return res.status(status).json({
    error: clientMessage,
    code,
  });
}
