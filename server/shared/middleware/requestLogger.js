import { IS_PRODUCTION } from '../../config/env.js';

/**
 * Express middleware for request execution timing and logging.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const url = req.originalUrl || req.url;
    // Only log API requests or HTTP errors; skip internal Vite dev-server source and asset fetches
    const isApi = url.startsWith('/api');
    if (!isApi && res.statusCode < 400) return;

    if (!IS_PRODUCTION || res.statusCode >= 400) {
      const ts = new Date().toISOString();
      const status = res.statusCode;
      const method = req.method;
      // Filter out noisy health checks in normal operation unless error
      if (url === '/api/health' && status < 400 && IS_PRODUCTION) return;
      console.log(`[${ts}] ${method} ${url} ${status} - ${duration}ms`);
    }
  });

  next();
}
