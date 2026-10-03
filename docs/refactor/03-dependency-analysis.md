# 03 — Dependency Analysis

## 1. Third-Party Dependencies Audit

### Runtime Dependencies (`package.json`)
| Package | Version | Purpose | Usage Scope | Evaluation & Risk |
|---|---|---|---|---|
| `react` / `react-dom` | `^19.0.1` | UI Library | Universal | Modern React 19; functional components and hooks. Low risk. |
| `express` | `^4.21.2` | Backend Server | Server | Stable HTTP framework. Port binding and routes. Low risk. |
| `lucide-react` | `^0.546.0` | UI Icons | Universal | Used across all views. Safe; high fan-out. Low risk. |
| `jspdf` | `^4.2.1` | PDF Document Generation | Invoices, Reports | Heavy bundle size (~600KB). Isolated in lazy chunks. |
| `html2canvas` | `^1.4.1` | DOM Screenshot to Canvas | Invoice PDF printing | Heavy (~160KB). DOM-dependent. Keep isolated in PDF service. |
| `qrcode` | `^1.5.4` | UPI & e-Invoice QR generation | Invoices, Settings | Lightweight, reliable. Used in InvoicePreview and Settings. |
| `tesseract.js` | `^6.0.1` | OCR image processing | BillOCR modal | Heavy WebAssembly worker (~4MB). Bundled locally in `public/tesseract/`. |
| `dompurify` | `^3.4.15` | HTML Sanitization | Invoices, Print | Security-critical for preventing XSS in rendered invoice notes. |
| `motion` | `^12.23.24` | Animation library | App layouts | Transition effects. |
| `vite-plugin-pwa` | `^1.3.0` | Progressive Web App SW generator | Vite build | Manages service worker lifecycle, workbox caching rules. |
| `cors` | `^2.8.6` | HTTP CORS middleware | Backend server | Handles cross-origin requests for preview containers. |

---

## 2. High Fan-In Modules (Heavily Depended Upon)

These modules are imported by many other files across the repository. Refactoring them carries high blast radius:

1. **`src/utils.js` (Fan-in: 22 files)**
   - Consumers: `App.jsx`, `InvoiceGenerator.jsx`, `InvoicePreview.jsx`, `Dashboard.jsx`, `GSTReturns.jsx`, `IncomeTax.jsx`, `PurchaseBills.jsx`, `ReceiptVoucher.jsx`, `RecurringInvoices.jsx`, `ReportsView.jsx`, `SettingsView.jsx`, `InventoryView.jsx`, `server.js`, test scripts.
   - *Risk*: Modifying `src/utils.js` without path aliases or backward-compatibility wrappers will break almost every view in the application.
   - *Strategy*: Retain `src/utils.js` as a re-exporting facade while extracting targeted sub-modules into `src/shared/utils/` and `src/features/invoices/utils/`.

2. **`src/store.js` (Fan-in: 16 files)**
   - Consumers: `App.jsx`, `Dashboard.jsx`, `InvoiceGenerator.jsx`, `ClientsView.jsx`, `InventoryView.jsx`, `ExpenseTracker.jsx`, `PurchaseBills.jsx`, `ReceiptVoucher.jsx`, `RecurringInvoices.jsx`, `SettingsView.jsx`.
   - *Risk*: Houses all data fetching functions. If function signatures change, data access will fail silently.

3. **`src/utils/printSettings.js` (Fan-in: 7 files)**
   - Consumers: `InvoicePreview.jsx`, `PrintSettings.jsx`, `PrintPreviewModal.jsx`, `InvoiceGenerator.jsx`, `Dashboard.jsx`, `SettingsView.jsx`.

---

## 3. High Fan-Out Modules (Heavy Consumers)

These files import dozens of other modules, making them brittle and difficult to isolate:

1. **`src/components/InvoiceGenerator.jsx` (Fan-out: 18 files)**
   - Imports from: `src/store.js`, `src/utils.js`, `src/utils/printSettings.js`, `src/utils/hsnRates.js`, `src/utils/clientCredit.js`, `src/components/ClientModal.jsx`, `src/components/InvoicePreview.jsx`, `src/components/BillOCR.jsx`, `src/components/ConfirmModal.jsx`, `lucide-react`, `qrcode`, `jspdf`, `html2canvas`.
2. **`src/components/SettingsView.jsx` (Fan-out: 14 files)**
   - Imports from: `src/store.js`, `src/utils.js`, `src/utils/printSettings.js`, `src/services/googleDrive.js`, `src/components/ConfirmModal.jsx`, `lucide-react`, `qrcode`.
3. **`src/components/Dashboard.jsx` (Fan-out: 12 files)**
   - Dynamically imports `react-dom/client`, `InvoicePreview.jsx`, `store.js`, `utils.js`.

---

## 4. Problematic Circular & Quasi-Circular Coupling

```
[InvoiceGenerator.jsx] ──(static import)──> [InvoicePreview.jsx]
        ▲                                          │
        └───────(dynamic render via DOM ref)───────┘
```
- `InvoiceGenerator.jsx` renders `<InvoicePreview ref={previewRef} ... />` to perform hidden off-screen PDF printing and canvas rendering.
- `InvoicePreview.jsx` in turn expects form state and print configuration structures that are shaped directly by `InvoiceGenerator.jsx`'s internal state.
- **Remedy**: Decouple invoice rendering data into a strict immutable `InvoiceDocument` contract, isolating the PDF generator service from the interactive UI generator.

---

## 5. Cross-Feature Entanglements

1. **`InvoiceGenerator` directly instantiating `ClientModal` and `BillOCR`**:
   - Instead of receiving client creation events via a standardized callback or modal provider, `InvoiceGenerator` directly renders the client modal and handles state synchronization.
2. **`SettingsView` directly manipulating raw invoice data**:
   - `SettingsView` imports data files and performs batch reconciliation on bills during data restore, rather than delegating to an invoice service.
3. **`Dashboard` performing ad-hoc PDF trashing**:
   - Direct HTTP call to `fetch('/api/trash-pdf')` embedded inside a button click handler in `Dashboard.jsx`.

---

## 6. Pre-Refactoring Dependency Fixes

Before moving any major feature files, the following foundational dependencies must be established:
1. **Path Alias Registration**: Configure `@/` pointing to `src/` in both `tsconfig.json` and `vite.config.js`.
2. **Facade Re-exports**: Keep `src/utils.js` and `src/store.js` as delegating facade files during early phases so unmigrated views continue functioning without immediate import rewriting.
3. **Break Cyclic Dynamic Imports**: Eliminate dynamic imports of `react-dom/client` in `Dashboard.jsx` by establishing a dedicated headless print queue service.
