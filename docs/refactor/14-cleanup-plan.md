# 14 — Cleanup & Decommissioning Plan

## 1. Safety Principle for Code Deletion

**Critical Rule**: Dead code deletion, file removal, and dependency pruning must NEVER occur during early or middle migration phases.
- Deleting files prematurely breaks unmigrated features, invalidates relative imports, and causes cascading build failures.
- All original monolithic files must first be hollowed out into thin delegating facades.
- Actual file deletion is strictly quarantined to **Phase 45 (Dead-Code Cleanup)** and **Phase 46 (Dependency Cleanup)** after 100% of functional verification gates pass.

---

## 2. Target Files for Eventual Decommissioning

Once all modular extractions and import updates are complete, the following legacy files will be safely removed:

| Legacy File Path | Reason for Removal | Replaced By | Decommission Phase |
|---|---|---|---|
| `src/components/InvoiceGenerator.jsx` | Monolithic God Component | `src/pages/InvoiceEditorPage.tsx` & `src/features/invoices/components/InvoiceEditor/*` | Phase 45 |
| `src/components/GSTReturns.jsx` | Monolithic filing view | `src/pages/GSTReturnsPage.tsx` & `src/features/gst-returns/*` | Phase 45 |
| `src/components/SettingsView.jsx` | Monolithic settings view | `src/pages/SettingsPage.tsx` & `src/features/settings/*` | Phase 45 |
| `src/components/Dashboard.jsx` | Monolithic dashboard | `src/pages/DashboardPage.tsx` & `src/features/invoices/components/Dashboard/*` | Phase 45 |
| `src/components/PurchaseBills.jsx` | Monolithic purchases | `src/pages/PurchasesPage.tsx` & `src/features/purchases/*` | Phase 45 |
| `src/components/ClientsView.jsx` | Monolithic client ledger | `src/pages/ClientsPage.tsx` & `src/features/clients/*` | Phase 45 |
| `src/components/InventoryView.jsx` | Monolithic inventory | `src/pages/InventoryPage.tsx` & `src/features/inventory/*` | Phase 45 |
| `src/components/ExpenseTracker.jsx` | Monolithic expenses | `src/pages/ExpensesPage.tsx` & `src/features/expenses/*` | Phase 45 |
| `src/components/ReceiptVoucher.jsx` | Monolithic receipts | `src/pages/ReceiptsPage.tsx` & `src/features/receipts/*` | Phase 45 |
| `src/components/RecurringInvoices.jsx`| Monolithic recurring | `src/pages/RecurringPage.tsx` & `src/features/recurring/*` | Phase 45 |
| `src/components/IncomeTax.jsx` | Monolithic income tax view | `src/pages/IncomeTaxPage.tsx` & `src/features/income-tax/*` | Phase 45 |
| `src/components/ReportsView.jsx` | Monolithic reports | `src/pages/ReportsPage.tsx` & `src/features/reports/*` | Phase 45 |
| `src/components/ControlPanel.jsx` | Monolithic diagnostics | `src/pages/ControlPanelPage.tsx` & `src/features/system/*` | Phase 45 |
| `src/components/UserGuideView.jsx` | Monolithic guide | `src/pages/UserGuidePage.tsx` & `src/features/guide/*` | Phase 45 |
| `src/components/PrintSettings.jsx` | Duplicate print view | `src/features/invoices/components/PrintSettings.tsx` | Phase 45 |
| `src/components/BillOCR.jsx` | Legacy modal location | `src/features/invoices/components/BillOCR/BillOCRModal.tsx` | Phase 45 |
| `src/utils.js` (legacy facade) | Monolithic util kitchen sink | `src/shared/utils/*` & `src/features/invoices/utils/*` | Phase 45 |
| `src/store.js` (legacy facade) | Monolithic God store | `src/services/api/*` & feature stores | Phase 45 |
| `server.js` (legacy root server) | Monolithic backend script | `server/index.js`, `server/app.js`, `server/modules/*` | Phase 45 |

---

## 3. Unused Dependency Pruning

In Phase 46:
- Audit root `package.json` for unused packages or mismatched peer dependencies.
- Remove redundant dev scripts or obsolete build artifacts.
- Verify `npm run build` generates clean output with zero warnings about unresolved chunks.
