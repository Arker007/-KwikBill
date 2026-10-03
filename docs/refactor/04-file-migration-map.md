# 04 — File Migration Map

This table defines the precise relocation path, rationale, dependency impact, and implementation phase for all primary files slated for structural restructuring.

| Current Path | Target Path | Reason | Dependencies Affected | Imports Affected | Risk | Phase |
|---|---|---|---|---|---|---|
| `src/utils/hsnRates.js` | `src/features/inventory/data/hsnRates.ts` | Domain catalog data belonging strictly to product/HSN inventory | None (leaf file) | `InvoiceGenerator`, `InventoryView` | LOW | Phase 13 |
| `src/utils/clientCredit.js` | `src/features/clients/utils/clientCredit.ts` | Domain logic calculating client credit balance and limits | None (leaf file) | `InvoiceGenerator`, `ClientsView` | LOW | Phase 13 |
| `src/utils/itr.js` | `src/features/income-tax/utils/itrCalculation.ts` | Domain calculation engine for AY 2025-26 Income Tax & TDS | None (leaf file) | `IncomeTax.jsx`, `scripts/tax-test.mjs` | LOW | Phase 13 |
| `src/utils/printSettings.js` | `src/features/invoices/utils/printSettings.ts` | Print configuration models, margins, and thermal layouts | None | `PrintSettings`, `InvoicePreview`, `InvoiceGenerator` | LOW | Phase 14 |
| `src/utils/share.js` | `src/shared/utils/share.ts` | Generic Web Share API utility | None | `InvoicePreview`, `InvoiceGenerator` | LOW | Phase 14 |
| `src/services/googleDrive.js` | `src/features/settings/services/googleDrive.ts` | Feature service for Google Drive cloud sync | OAuth GSI client | `SettingsView.jsx` | LOW | Phase 14 |
| `src/components/ConfirmModal.jsx` | `src/shared/components/feedback/ConfirmModal.tsx` | Reusable presentational confirmation dialog | None | 6 components across features | LOW | Phase 15 |
| `src/components/Toast.jsx` | `src/shared/components/feedback/Toast.tsx` | Universal notification toast primitive | None | `App.jsx`, `store.js` | LOW | Phase 15 |
| `src/components/PageHeader.jsx` | `src/shared/components/layout/PageHeader.tsx` | Standard layout header bar with action slots | None | 10 feature views | LOW | Phase 16 |
| `src/components/HelpButton.jsx` | `src/shared/components/feedback/HelpButton.tsx` | Reusable contextual help trigger | None | 12 feature views | LOW | Phase 16 |
| `src/components/UnassignedBanner.jsx` | `src/features/invoices/components/UnassignedBanner.tsx` | Invoice-specific migration banner for legacy unassigned bills | None | `Dashboard.jsx`, `InvoiceGenerator.jsx` | LOW | Phase 16 |
| `src/components/ClientModal.jsx` | `src/features/clients/components/ClientModal.tsx` | Client creation/editing dialog | `src/store.js` | `ClientsView.jsx`, `InvoiceGenerator.jsx` | MED | Phase 22 |
| `src/components/ClientsView.jsx` | `src/pages/ClientsPage.tsx` | Page composition for Client master list and ledger | `ClientModal`, `clientCredit` | `App.jsx` (router) | MED | Phase 22 |
| `src/components/InventoryView.jsx` | `src/pages/InventoryPage.tsx` | Page composition for Product catalog & stock alerts | `hsnRates.js`, `store.js` | `App.jsx` (router) | MED | Phase 23 |
| `src/components/ExpenseTracker.jsx` | `src/pages/ExpensesPage.tsx` | Page composition for Business expense tracking | `store.js`, `utils.js` | `App.jsx` (router) | MED | Phase 23 |
| `src/components/ReceiptVoucher.jsx` | `src/pages/ReceiptsPage.tsx` | Page composition for Payment receipt vouchers | `store.js`, `utils.js` | `App.jsx` (router) | MED | Phase 24 (DONE) |
| `src/components/PurchaseBills.jsx` | `src/pages/PurchasesPage.tsx` | Page composition for Vendor purchase invoices | `store.js`, `utils.js` | `App.jsx` (router) | MED | Phase 24 (DONE) |
| `src/components/RecurringInvoices.jsx` | `src/pages/RecurringPage.tsx` | Page composition for Repeating invoice contracts | `store.js`, `utils.js` | `App.jsx` (router) | MED | Phase 24 (DONE) |
| `src/components/ReportsView.jsx` | `src/pages/ReportsPage.tsx` | Page composition for Sales register & GST analytics | `store.js`, `utils.js` | `App.jsx` (router) | MED | Phase 30 (DONE) |
| `src/components/BillOCR.jsx` | `src/features/invoices/components/BillOCR/BillOCRModal.tsx` | OCR bill scanner using Tesseract WASM | Tesseract assets | `InvoiceGenerator.jsx` | MED | Phase 25 (DONE) |
| `src/components/PrintPreviewModal.jsx` | `src/features/invoices/components/PrintPreviewModal.tsx` | Modal wrapper for invoice print previews | `InvoicePreview` | `Dashboard.jsx`, `InvoiceGenerator.jsx` | MED | Phase 25 (DONE) |
| `src/components/PrintSettings.jsx` | `src/features/invoices/components/PrintSettings.tsx` | Print format selector and paper margin configuration | `printSettings.js` | `SettingsView.jsx`, `PrintPreviewModal` | MED | Phase 25 (DONE) |
| `src/components/InvoicePreview.jsx` | `src/features/invoices/components/InvoicePreview/InvoicePreview.tsx` | Rendered invoice document for screen and paper | `utils.js`, `qrcode`, `dompurify` | `InvoiceGenerator.jsx`, `Dashboard.jsx` | HIGH | Phase 26 (DONE) |
| `src/components/InvoiceGenerator.jsx` | `src/pages/InvoiceEditorPage.tsx` | Main invoice creation/editing workspace | Multiple features | `App.jsx` (router) | HIGH | Phase 27 (DONE) |
| `src/components/Dashboard.jsx` | `src/pages/DashboardPage.tsx` | Primary business dashboard and invoice register | Invoices, store | `App.jsx` (router) | HIGH | Phase 28 (DONE) |
| `src/components/GSTReturns.jsx` | `src/pages/GSTReturnsPage.tsx` | Statutory filing reports and reconciliation workspace | Invoices, Purchases | `App.jsx` (router) | HIGH | Phase 29 (DONE) |
| `src/components/IncomeTax.jsx` | `src/pages/IncomeTaxPage.tsx` | AY 2025-26 Tax calculator & filing assistant | `itr.js`, `utils.js` | `App.jsx` (router) | MED | Phase 30 (DONE) |
| `src/components/SettingsView.jsx` | `src/pages/SettingsPage.tsx` | Application preferences and business profiles | Profile, Backups | `App.jsx` (router) | HIGH | Phase 31 (DONE) |
| `src/components/ControlPanel.jsx` | `src/pages/ControlPanelPage.tsx` | Diagnostics and administrative system controls | Server health API | `App.jsx` (router) | LOW | Phase 32 (DONE) |
| `src/components/UserGuideView.jsx` | `src/pages/UserGuidePage.tsx` | Offline user documentation and guide | `userGuideContent` | `App.jsx` (router) | LOW | Phase 32 (DONE) |
| `src/components/SetupWizard.jsx` | `src/features/settings/components/SetupWizard.tsx` | First-time business onboarding wizard | Store, Profile | `App.jsx` | LOW | Phase 32 (DONE) |
| `src/components/WelcomeGuide.jsx` | `src/features/settings/components/WelcomeGuide.tsx` | Feature walkthrough modal | None | `App.jsx` | LOW | Phase 32 (DONE) |
| `src/App.jsx` | `src/app/App.tsx` | Core application layout and provider orchestrator | All pages | `src/main.jsx` | HIGH | Phase 33 (DONE) |
| `server.js` (modularized) | `server/index.js` & `server/modules/*` | Backend server, REST routes, and persistence engine | File storage | `package.json` | CRITICAL | Phases 33–40 |
| New test helper | `tests/helpers/isolatedDataDir.mjs` | Prevent automated HTTP tests from reading or mutating live user data | Server path configuration | E2E, contract, security suites | LOW | Remediation (DONE) |

> **Note**: During migration, source files that serve as high fan-in hubs (`src/utils.js`, `src/store.js`) will initially be maintained as re-export facades pointing to new target locations, guaranteeing zero disruption to unmigrated modules.
