# 01 — Current Architecture Audit

## 1. Directory Tree & Responsibilities

This audit catalogs every folder and major module in the repository, evaluating its intended purpose versus actual implementation reality.

| Directory / Module | Current Stated Purpose | Actual Runtime Responsibility | Identified Issues | Recommended Destination | Priority | Risk |
|---|---|---|---|---|---|---|
| `src/components/` | React UI components | Entire presentation, page routing, business logic, calculations, and ad-hoc HTTP calls | 24 components ranging from 50 to 4,146 lines; god-components; direct DOM manipulations; dynamic imports causing chunk collisions | Split into `src/shared/components/`, `src/features/*/components/`, and `src/pages/` | P1 | HIGH |
| `src/utils.js` | General utility helper | Monolithic kitchen-sink (tax engine, string formatters, currency words, GSTIN validator, PDF generation) | 1,727 lines; imported by 20+ modules; high churn rate; risk of tax regression | Split into `src/shared/utils/` and `src/features/invoices/utils/tax.ts` | P0 | CRITICAL |
| `src/utils/` | Sub-utility modules | Mixed domain logic (`clientCredit.js`, `hsnRates.js`, `itr.js`, `printSettings.js`, `share.js`) | Domain logic mixed with general utilities; `itr.js` (1,287 lines) is an entire tax computation engine living as a loose util | Relocate to feature domains: `src/features/income-tax/`, `src/features/inventory/`, etc. | P1 | MEDIUM |
| `src/store.js` | Data persistence & state | Direct REST API calls, localStorage wrapper, DOM event dispatcher, sequential invoice counter | 470 lines; mixing storage, HTTP transport, and domain event dispatching; race conditions in counter | Split into `src/services/api/` and `src/store/` | P1 | HIGH |
| `src/services/` | External services | Only `googleDrive.js` exists | Client-side OAuth mixed with cloud backup file generation; lacks typing and retry policies | `src/features/settings/services/googleDrive.ts` | P2 | LOW |
| `src/App.jsx` | Main application shell | View router, global hotkey listener, profile switcher, notification center, currency manager, layout renderer | 1,138 lines; giant switch statement rendering 14 views; prop drilling 20+ state setters | `src/app/` (Router, Shell Layout, Notification Provider) | P1 | MEDIUM |
| `server.js` | Backend API server | Express API router, filesystem persistence, backup manager, trash lifecycle, recurring invoice scheduler, static server | 1,589 lines in a single file; 44 routes; sync file operations; direct DB manipulation inside route handlers | `server/` with modular routing, controllers, services, and repositories | P0 | HIGH |
| `data/` | Database persistence | JSON flat-file storage for 10 entities | Inconsistent schema validation; potential file write collisions; unbounded file growth in `trash/` | Keep structure; wrap access in `server/infrastructure/fileDb.js` | P1 | HIGH |
| `scripts/` | Tooling & build scripts | Build automation, icon generation, Tesseract asset bundling, regression test runners | Test scripts mixed with packaging scripts; regression tests lack formal assertions runner | `scripts/` and `tests/integration/` | P2 | LOW |
| `public/` | Static web assets | Web icons, favicon, manifest, bundled Tesseract WebAssembly & language models (~6MB) | Large binary assets tracked in git; clean separation required | Keep as `public/` | P3 | LOW |
| `src/index.css` | Global styling | Monolithic CSS rules, CSS variables, utility classes, print stylesheets, responsive media queries | 1,000+ lines; competing class definitions; hardcoded hex colors; no tokenized spacing scale | Split into `src/styles/` (tokens, themes, components, print) | P2 | MEDIUM |

---

## 2. Deep Dive Audit of Critical Modules

### 2.1 `src/components/InvoiceGenerator.jsx` (4,146 lines)
- **Current Responsibility**: The primary invoice creation view.
- **Actual Responsibility**:
  - State manager for invoice lines, client details, tax preferences, payment terms, delivery challans, and multi-currency exchange.
  - Calculation driver running `computeInvoiceTotals` on every keypress.
  - Barcode scanner reader and keyboard shortcut listener (`Alt+A`, `Ctrl+S`, `Ctrl+P`).
  - Inline modal renderer for Client Selection, Product Catalog, Terms Templates, e-Way Bill JSON, and Payment Allocation.
  - Thermal receipt formatter and A4 print generator.
- **Deficiencies**:
  - Extremely high cognitive load.
  - Render cycles are unoptimized (renders entire form tree on any character typed in description).
  - Contains duplicate client creation logic identical to `ClientModal.jsx`.
- **Target Destination**: `src/features/invoices/components/InvoiceEditor/` decomposed into 8 sub-components.

### 2.2 `src/components/GSTReturns.jsx` (2,283 lines)
- **Current Responsibility**: Filing view for Indian Goods & Services Tax returns.
- **Actual Responsibility**:
  - GSTR-1 preparation (Table 4 B2B, Table 5 B2CL, Table 7 B2CS, Table 8 Nil/Exempt, Table 9 Amendments, Table 12 HSN Summary, Table 13 Document Summary).
  - GSTR-3B preparation (Table 3.1 Outward supplies, Table 4 Eligible ITC, Table 5 Exempt/Nil supplies).
  - GSTR-2B JSON import and automated fuzzy-matching reconciliation algorithm.
  - JSON and Excel export builders.
- **Deficiencies**:
  - Massive conditional branch nesting (up to 9 levels deep).
  - Heavy reconciliation calculations run on the main browser thread without Web Workers, freezing UI on 1,000+ bills.
- **Target Destination**: `src/features/gst-returns/` decomposed into dedicated tab modules and reconciliation worker.

### 2.3 `src/components/SettingsView.jsx` (2,068 lines)
- **Current Responsibility**: Application settings screen.
- **Actual Responsibility**:
  - Company profiles CRUD with multi-business profile management.
  - Bank accounts and UPI QR configuration.
  - Custom invoice serial number template configuration.
  - Data backup, restore, reset, and full JSON import/export validation.
  - Cloud sync with Google Drive.
  - Software update verification and changelog display.
- **Deficiencies**:
  - 14 distinct logical subsystems crammed into a single component with tab-based local state.
  - Heavy form states with repetitive input handlers and validation rules.
- **Target Destination**: `src/features/settings/` split into dedicated tabs (`BusinessProfileTab`, `NumberingTab`, `DataManagementTab`, `CloudSyncTab`).

### 2.4 `src/utils.js` (1,727 lines)
- **Current Responsibility**: Pure utility functions.
- **Actual Responsibility**:
  - Indian currency to English/Hindi words converter (`numberToWords`).
  - Statutory GST engine (`computeInvoiceTotals`): Handles 18 statutory edge cases, including intra-UT supplies, RCM, Section 51/52 TDS/TCS ₹50L thresholds, 4 discount modes, tax-inclusive gross back-out, and Rule 119A rounding.
  - Date helpers, fiscal year generators, currency formatters, GSTIN checksum validator.
  - PDF generation pipeline triggering DOM-to-canvas rendering and jsPDF layout construction.
- **Deficiencies**:
  - High risk of regression if touched without isolation.
  - Mixing UI/canvas operations with pure mathematical functions prevents node-side reuse in CLI scripts.
- **Target Destination**:
  - Pure Tax Math: `src/features/invoices/utils/taxCalculation.js` (shared with backend).
  - Formatting Utilities: `src/shared/utils/formatters.js`.
  - PDF Generation: `src/features/invoices/services/pdfGenerator.js`.

### 2.5 `server.js` (1,589 lines)
- **Current Responsibility**: API Server and local file storage.
- **Actual Responsibility**:
  - 44 REST endpoints across 11 business entities.
  - Direct synchronous file reading and JSON parsing on the main request thread.
  - Daily scheduled backups and rolling 30-day retention policies.
  - Port scanning, conflict resolution, and `data/port.txt` file sync.
  - Background cron-like timer evaluating due recurring invoices and auto-generating bills.
- **Deficiencies**:
  - Zero layered architecture: route handlers contain file system paths, validation, data transformation, and HTTP responses.
  - Lack of centralized request validation schema (uses ad-hoc `if (!body.name) return res.status(400)`).
  - Error handling relies on generic try/catch blocks that write to a raw text file (`data/errors.log`).
- **Target Destination**: Layered backend under `server/` (Routes → Controllers → Services → Repositories).
