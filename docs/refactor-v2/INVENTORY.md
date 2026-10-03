# Repository Discovery & Baseline Inventory

## 1. Baseline Verification Results (Executed: 2026-09-23)
- `node scripts/tax-test.mjs`: **70/70 PASS** (0 failures).
- `node scripts/discount-modes-test.mjs`: **9/9 PASS** (0 failures).
- `node tests/smoke.mjs`: **23/23 PASS** (0 failures, duration 8.8s).
- `compile_applet` (`npm run build`): **Build succeeded** (Clean Vite bundle output).
- `node scripts/test-sqlite-repository.mjs`: **12/12 PASS** (Adapter contracts verified).
- `node scripts/verify-migration-parity.mjs`: **18/20 PASS** (Discrepancies: Bill line items parity JSON: 1 vs SQLite: 0; `test_smoke_counter` JSON: 49 vs SQLite: 47).

## 2. Discovered Architecture & Runtime Facts
- **Total Initial Repository Files**: 334 files.
- **Node & SQLite Engine**: Uses Node.js native `node:sqlite` (`DatabaseSync`) in WAL mode at `./data/accounting.db`.
- **Active Storage Mode**: Dual-write shadow mode active in `server/infrastructure/storage/CollectionRepository.js` (writes to SQLite table and shadow JSON file via `atomicFs.js`).
- **Single-File Repositories**: `server/modules/meta/meta.repository.js` and `server/modules/profiles/profiles.repository.js` (for legacy single-file profile fallback) write exclusively to JSON files (`data/meta.json`, `data/profile.json`) rather than normalized SQLite tables.
- **Frontend Stack**: React 19.3.0, Vite 6.2.3, Tailwind CSS 4.1.14 (`@tailwindcss/vite`), Ant Design 6.6.5, Lucide React 0.546.0, Motion 12.23.24.
- **Backend Stack**: Express 4.21.2, Node.js HTTP server binding `0.0.0.0:3000`. Dual-mode entry in `server/app.js` (Vite middleware in dev, static dist in production).
- **Statutory Financial Calculations**:
  - `src/features/invoices/utils/taxCalculation.ts`: Core GST engine (`computeInvoiceTotals`, `resolveLineDiscount`, `calculateLineItemTax`).
  - `src/features/income-tax/utils/itrCalculation.ts`: Income tax engine (Budget 2025 slabs, 87A rebate, §111A/§112A, §44AD/ADA/AE, §234A/B/C interest, Rule 119A).

## 3. Discovered Technical Debt & Structural Gaps
1. **Monolithic Package Root**: All backend, frontend, scripts, and utilities share a single root `package.json` without workspace boundaries.
2. **Persistence Duality**: Document collections write dual-shadow records, while meta counters and app settings write only to `data/meta.json`.
3. **Cross-Feature Imports in Frontend**: Some frontend views import utility helpers from other feature directories instead of shared packages.
4. **Scattered Test Scripts**: Test files are divided between `scripts/*.mjs` and `tests/*.mjs` with different runners (`node:test` vs custom assertion runners).

## 4. Unresolved Unknowns & Discovery Tasks
- **UNKNOWN-01**: Multi-account payment design spec (`docs/superpowers/specs/2026-04-30-multi-account-payments-design.md`) is present. Is this in active development?
  - *Resolution*: Classified as future scope per Rule A10. Structural refactor must preserve existing single/multi-account data models without adding new business logic.
- **UNKNOWN-02**: Tesseract OCR worker and wasm files in `public/tesseract/core/` are 15MB+.
  - *Resolution*: Must be preserved in `apps/web/public/tesseract/` to maintain 100% offline client-side OCR bill parsing.
