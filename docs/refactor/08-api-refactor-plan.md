# 08 — API Refactor Plan

## 1. Current API Client Architecture Audit

Currently, API communication is fragmented across three distinct patterns:
1. **`src/store.js` wrapper (`apiFetch`)**:
   ```javascript
   const apiFetch = async (url, options = {}) => {
     const res = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
     if (!res.ok) throw new Error(...);
     return res.json();
   }
   ```
2. **Direct `fetch()` in React Components**:
   - `App.jsx`: `fetch('/api/check-update')`, `fetch('/api/profile')`, `fetch('/api/meta/lastRecurringAutoFire')`
   - `Dashboard.jsx`: `fetch('/api/trash-pdf', ...)`
   - `ControlPanel.jsx`: `fetch('/api/control-panel/status')`, `fetch('/api/control-panel/launch-script')`
   - `SettingsView.jsx`: `fetch('/api/check-update')`
3. **Missing Features**:
   - No request timeout interceptors (hanging requests stall UI)
   - No uniform error envelope parsing
   - No offline request queueing
   - No structured TypeScript response contracts

---

## 2. Target API Client Architecture (`src/services/api/`)

```
src/services/api/
├── client.ts             # Base HTTP client with timeout, headers, and interceptors
├── errors.ts             # Typed ApiError classes (NetworkError, ServerError, ValidationError)
└── endpoints.ts          # Centralized route dictionary mapping all backend paths
```

### Base Client Responsibilities:
- Standardized baseURL (`/api`)
- Automatic JSON serialization and header injection
- Configurable AbortSignal timeout (default: 10 seconds)
- Unified error unwrapping returning `{ ok: false, message: string, code: number }`

---

## 3. Comprehensive REST Endpoint Contract Catalog

Below is the complete inventory of all 44 endpoints currently supported by the backend:

| Method | Path | Frontend Consumer | Backend Route Handler | Request Payload | Response Payload | Auth | Risk |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/bills` | `store.getAllBills` | `server.js:193` | None | `Bill[]` | None | LOW |
| `POST` | `/api/bills` | `store.saveBill` | `server.js:199` | `Bill` object | `{ ok: true, id, bill }` | None | HIGH |
| `DELETE` | `/api/bills/:id` | `store.deleteBill` | `server.js:249` | None | `{ ok: true, id }` | None | HIGH |
| `GET` | `/api/profile` | `store.getProfile` | `server.js:295` | None | `BusinessProfile` | None | MED |
| `POST` | `/api/profile` | `store.saveProfile` | `server.js:299` | `BusinessProfile` | `{ ok: true, profile }` | None | MED |
| `GET` | `/api/clients` | `store.getAllClients` | `server.js:307` | None | `Client[]` | None | LOW |
| `POST` | `/api/clients` | `store.saveClient` | `server.js:313` | `Client` | `{ ok: true, id }` | None | MED |
| `DELETE` | `/api/clients/:id` | `store.deleteClient` | `server.js:321` | None | `{ ok: true, id }` | None | MED |
| `GET` | `/api/templates` | `store.getTermsTemplates` | `server.js:330` | None | `Template[]` | None | LOW |
| `POST` | `/api/templates` | `store.saveTermsTemplate` | `server.js:346` | `Template` | `{ ok: true, id }` | None | LOW |
| `DELETE` | `/api/templates/:id` | `store.deleteTermsTemplate` | `server.js:354` | None | `{ ok: true, id }` | None | LOW |
| `GET` | `/api/products` | `store.getAllProducts` | `server.js:363` | None | `Product[]` | None | LOW |
| `POST` | `/api/products` | `store.saveProduct` | `server.js:369` | `Product` | `{ ok: true, id }` | None | MED |
| `DELETE` | `/api/products/:id` | `store.deleteProduct` | `server.js:377` | None | `{ ok: true, id }` | None | MED |
| `GET` | `/api/expenses` | `store.getAllExpenses` | `server.js:386` | None | `Expense[]` | None | LOW |
| `POST` | `/api/expenses` | `store.saveExpense` | `server.js:392` | `Expense` | `{ ok: true, id }` | None | LOW |
| `DELETE` | `/api/expenses/:id` | `store.deleteExpense` | `server.js:400` | None | `{ ok: true, id }` | None | LOW |
| `GET` | `/api/recurring` | `store.getAllRecurring` | `server.js:409` | None | `RecurringTemplate[]` | None | LOW |
| `POST` | `/api/recurring` | `store.saveRecurring` | `server.js:415` | `RecurringTemplate` | `{ ok: true, id }` | None | MED |
| `DELETE` | `/api/recurring/:id` | `store.deleteRecurring` | `server.js:423` | None | `{ ok: true, id }` | None | MED |
| `GET` | `/api/receipts` | `store.getAllReceipts` | `server.js:432` | None | `Receipt[]` | None | LOW |
| `POST` | `/api/receipts` | `store.saveReceipt` | `server.js:438` | `Receipt` | `{ ok: true, id }` | None | LOW |
| `DELETE` | `/api/receipts/:id` | `store.deleteReceipt` | `server.js:446` | None | `{ ok: true, id }` | None | LOW |
| `GET` | `/api/purchases` | `store.getAllPurchases` | `server.js:455` | None | `PurchaseBill[]` | None | LOW |
| `POST` | `/api/purchases` | `store.savePurchase` | `server.js:461` | `PurchaseBill` | `{ ok: true, id }` | None | LOW |
| `DELETE` | `/api/purchases/:id` | `store.deletePurchase` | `server.js:469` | None | `{ ok: true, id }` | None | LOW |
| `GET` | `/api/profiles` | `store.getAllProfiles` | `server.js:478` | None | `BusinessProfile[]` | None | LOW |
| `POST` | `/api/profiles` | `store.saveBusinessProfile` | `server.js:484` | `BusinessProfile` | `{ ok: true, id }` | None | MED |
| `DELETE` | `/api/profiles/:id` | `store.deleteBusinessProfile` | `server.js:492` | None | `{ ok: true, id }` | None | MED |
| `GET` | `/api/meta/:key` | `store.getNextInvoiceNumber` | `server.js:503` | None | `{ value }` | None | MED |
| `POST` | `/api/meta/:key` | `store.saveInvoiceNumberSettings` | `server.js:508` | `{ value }` | `{ ok: true }` | None | MED |
| `POST` | `/api/meta/:key/increment` | `store.getNextInvoiceNumber` | `server.js:520` | None | `{ value, previous }` | None | HIGH |
| `GET` | `/api/export` | `store.exportAllData` | `server.js:532` | `?selection=...` | Full JSON archive | None | HIGH |
| `POST` | `/api/import` | `store.importData` | `server.js:550` | Full JSON archive | `{ ok: true, imported }` | None | CRITICAL |
| `POST` | `/api/save-pdf` | `InvoicePreview` | `server.js:652` | Binary PDF stream | `{ ok: true, path }` | None | MED |
| `POST` | `/api/trash-pdf` | `Dashboard` | `server.js:688` | `{ fileName, clientName }` | `{ ok: true }` | None | LOW |
| `GET` | `/api/version` | `App` | `server.js:757` | None | `{ version, nodeVersion }`| None | LOW |
| `GET` | `/api/check-update` | `App`, `SettingsView` | `server.js:773` | None | Update metadata | None | LOW |
| `GET` | `/api/control-panel/status` | `ControlPanel` | `server.js:872` | None | System diagnostics | None | LOW |
| `POST` | `/api/control-panel/launch-script` | `ControlPanel` | `server.js:933` | `{ script }` | Script output | None | MED |
| `GET` | `/api/backups` | `store.getBackupsList` | `server.js:1020`| None | `BackupSummary[]` | None | LOW |
| `DELETE`| `/api/backups/:date`| `store.deleteBackup` | `server.js:1038`| None | `{ ok: true }` | None | MED |
| `POST` | `/api/backups/:date/restore` | `store.restoreBackup` | `server.js:1054`| None | `{ ok: true }` | None | CRITICAL |
| `POST` | `/api/backups/now` | `store.triggerBackup` | `server.js:1140`| None | `{ ok: true, path }` | None | MED |
| `GET` | `/api/trash` | `store.getTrashedBills` | `server.js:1153`| None | `TrashedBill[]` | None | LOW |
| `POST` | `/api/trash/:id/restore` | `store.restoreTrashedBill` | `server.js:1171`| None | `{ ok: true }` | None | HIGH |
| `DELETE`| `/api/trash/:id` | `store.purgeTrashedBill` | `server.js:1182`| None | `{ ok: true }` | None | HIGH |
| `GET` | `/api/health` | Diagnostic monitoring | `server.js:1211`| None | `{ ok: true, uptime }` | None | LOW |
| `GET` | `/api/supabase/config` | `useSupabaseSync` | `server/modules/supabase/supabase.controller.js` | None | `{ success, configured, supabaseUrl, ... }` | None | LOW |
| `POST` | `/api/supabase/config` | `useSupabaseSync` | `server/modules/supabase/supabase.controller.js` | `{ supabaseUrl, anonKey, ... }` | `{ success, message }` | None | MED |
| `POST` | `/api/supabase/test` | `useSupabaseSync` | `server/modules/supabase/supabase.controller.js` | `{ supabaseUrl, anonKey }` (optional) | `{ success, status, latencyMs }` | None | LOW |
| `GET` | `/api/supabase/tables` | `useSupabaseSync` | `server/modules/supabase/supabase.controller.js` | None | `{ success, tables }` | None | LOW |
| `GET` | `/api/supabase/local-summary` | `useSupabaseSync` | `server/modules/supabase/supabase.controller.js` | None | `{ success, summary }` | None | LOW |
| `POST` | `/api/supabase/sync-up` | `useSupabaseSync` | `server/modules/supabase/supabase.controller.js` | None | `{ success, totalSynced, durationMs }` | None | HIGH |
| `POST` | `/api/supabase/sync-down` | `useSupabaseSync` | `server/modules/supabase/supabase.controller.js` | None | `{ success, totalSynced, backupPath }` | None | HIGH |
| `GET` | `/api/supabase/audit-log` | `useSupabaseSync` | `server/modules/supabase/supabase.controller.js` | None | `{ success, auditLog }` | None | LOW |
