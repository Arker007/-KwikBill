import fs from 'fs';
import { ERRORS_LOG } from '../../config/paths.js';
import { AppError } from '../errors/AppError.js';

export const ERROR_MESSAGES = {
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
 * @param {string} code
 * @param {Error|*} err
 */
export function logErrorToFile(code, err) {
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
 * @param {import('express').Response} res
 * @param {number} status
 * @param {string} code
 * @param {Error|*} [err]
 */
export function errRes(res, status, code, err) {
  if (err) {
    logErrorToFile(code, err);
  }
  const message = ERROR_MESSAGES[code] || code;
  return res.status(status).json({ error: message, code });
}

/**
 * Centralized Express error handler middleware.
 * @param {Error|AppError} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let status = 500;
  let code = 'server-error';

  if (err instanceof AppError) {
    status = err.statusCode;
    code = err.code;
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
    code
  });
}
