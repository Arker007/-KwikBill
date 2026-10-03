import express from 'express';
import path from 'path';
import fs from 'fs';
import { SERVER_DIR } from './config/paths.js';
import { corsMiddleware } from './shared/middleware/cors.js';
import { paramSanitizer } from './shared/middleware/paramSanitizer.js';
import { requestLogger } from './shared/middleware/requestLogger.js';
import { errorHandler } from './shared/middleware/errorHandler.js';

import { billsRouter } from './modules/bills/index.js';
import { clientsRouter } from './modules/clients/index.js';
import { productsRouter } from './modules/products/index.js';
import { expensesRouter } from './modules/expenses/index.js';
import { purchasesRouter } from './modules/purchases/index.js';
import { receiptsRouter } from './modules/receipts/index.js';
import { recurringRouter } from './modules/recurring/index.js';
import { profilesRouter, singleProfileRouter } from './modules/profiles/index.js';
import { taxationRouter } from './modules/taxation/index.js';
import { reportingRouter } from './modules/reports/index.js';
import { templatesRouter } from './modules/templates/index.js';
import { metaRouter } from './modules/meta/index.js';
import { backupsRouter } from './modules/backups/index.js';
import { trashRouter } from './modules/trash/index.js';
import { systemRouter } from './modules/system/index.js';
import { supabaseRouter } from './modules/supabase/index.js';

export const app = express();

app.disable('x-powered-by');
app.use(corsMiddleware);

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use(paramSanitizer);
app.use(requestLogger);

// Ensure all /api responses are explicitly JSON and never cached by intermediate proxies as HTML
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  next();
});

// Mount core business modules
app.use('/api/bills', billsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/products', productsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/recurring', recurringRouter);
app.use('/api/profile', singleProfileRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/taxation', taxationRouter);
app.use('/api/reports', reportingRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/meta', metaRouter);

// Mount system & infrastructure modules
app.use('/api', backupsRouter);
app.use('/api', trashRouter);
app.use('/api', systemRouter);
app.use('/api/supabase', supabaseRouter);

// 404 guard for unmatched /api/* calls so they never fall through to Vite SPA or static HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl || req.path });
});

// Serve frontend and static assets
export async function setupFrontendMiddleware(expressApp) {
  const monorepoDist = path.join(SERVER_DIR, '..', 'apps', 'web', 'dist');
  const rootDist = path.join(SERVER_DIR, '..', 'dist');
  const distPath = fs.existsSync(monorepoDist) ? monorepoDist : rootDist;
  const indexPath = path.join(distPath, 'index.html');

  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const appsWebIndex = path.join(SERVER_DIR, '..', 'apps', 'web', 'index.html');
      const configFile = fs.existsSync(appsWebIndex) ? path.join(SERVER_DIR, '..', 'apps', 'web', 'vite.config.ts') : undefined;
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        ...(configFile ? { configFile } : {}),
      });
      expressApp.use(vite.middlewares);
    } catch (err) {
      console.error('Failed to start Vite middleware:', err);
    }
  } else {
    expressApp.use(express.static(distPath, { fallthrough: true }));
    expressApp.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: 'No such endpoint' });
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
      return servePlaceholder(req, res);
    });
  }

  // Global error handler
  expressApp.use(errorHandler);
}

function servePlaceholder(req, res) {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'No such endpoint' });
  const port = req.socket?.localPort || req.app?.locals?.activePort || 3000;
  res.status(503).send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Free GST Billing Software — building…</title>
<meta http-equiv="refresh" content="3">
<style>
  body { font-family: -apple-system, Segoe UI, Inter, sans-serif; max-width: 560px;
         margin: 6rem auto; padding: 2rem; color: #1e293b; line-height: 1.55; }
  h1 { color: #1e40af; margin: 0 0 0.5rem; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid #cbd5e1;
             border-top-color: #1e40af; border-radius: 50%; animation: spin 1s linear infinite;
             vertical-align: middle; margin-right: 6px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .muted { color: #64748b; font-size: 0.9em; }
  .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.85rem 1rem; border-radius: 8px; margin-top: 1rem; }
</style></head>
<body>
  <h1>Free GST Billing Software</h1>
  <p><span class="spinner"></span> The app is still building. This page refreshes every 3 seconds.</p>
  <div class="box">
    <p style="margin:0 0 0.5rem"><strong>Local install?</strong></p>
    <p style="margin:0">If you started the server but never built the frontend, run:</p>
    <p style="margin:0.5rem 0 0"><code>npm run build</code></p>
    <p class="muted" style="margin:0.5rem 0 0">…then reload this page.</p>
  </div>
  <p class="muted" style="margin-top:1.5rem">Server is running on port ${port} · API health: <a href="/api/version">/api/version</a></p>
</body></html>`);
}
