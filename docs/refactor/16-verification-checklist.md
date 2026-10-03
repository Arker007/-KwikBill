# 16 — Verification Checklist & Quality Gates

This checklist defines the mandatory verification gates that must be satisfied before completing any implementation phase and advancing to the next.

---

## 1. Architecture Gates

- [ ] **Dependency Direction Valid**: Imports flow strictly downward (`app → pages → features → shared`). No upward imports detected.
- [ ] **No Cross-Feature Coupling**: Feature A does not import directly from Feature B. Shared concepts are accessed via `@/shared` or page orchestrators.
- [ ] **No Circular Dependencies**: Verified with tool analysis; zero circular dependency cycles detected.
- [ ] **Zero Domain Logic in Shared**: All modules in `src/shared/` are strictly domain-agnostic (no GSTIN regex, no invoice structures, no tax rates).

---

## 2. Statutory Financial Calculation Gates

- [ ] **All Statutory Tax Tests Pass**: Run `node scripts/tax-test.mjs` and confirm 70/70 passed.
- [ ] **All Discount Mode Tests Pass**: Run `node scripts/discount-modes-test.mjs` and confirm 9/9 passed.
- [ ] **Exact Paisa Precision**: Invoices with IGST, CGST, SGST, UTGST, and cess produce identical totals before and after refactoring.
- [ ] **Rule 119A Rounding Intact**: Interest calculations under Section 234A/B/C correctly round down to nearest ₹100.
- [ ] **TCS/TDS Thresholds Preserved**: Section 206C(1H) TCS ₹50 Lakh cumulative turnover threshold triggers accurately.

---

## 3. Frontend & UI Gates

- [ ] **All 14 Navigation Views Render**:
  - [ ] Dashboard (`?view=dashboard`)
  - [ ] New Invoice (`?view=new`)
  - [ ] Clients (`?view=clients`)
  - [ ] Inventory (`?view=inventory`)
  - [ ] Expenses (`?view=expenses`)
  - [ ] Purchases (`?view=purchases`)
  - [ ] Recurring (`?view=recurring`)
  - [ ] Receipts (`?view=receipts`)
  - [ ] Reports (`?view=reports`)
  - [ ] GST Returns (`?view=filing`)
  - [ ] Income Tax (`?view=incometax`)
  - [ ] User Guide (`?view=guide`)
  - [ ] Settings (`?view=settings`)
  - [ ] Control Panel (`?view=controlpanel`)
- [ ] **Keyboard Shortcuts Responsive**: `Alt+D`, `Alt+N`, `Alt+S`, `Ctrl+S`, `Ctrl+P` fire expected actions.
- [ ] **Theme Toggling**: Switching between Light and Dark mode updates `[data-theme]` on `<html>` and persists across reload.
- [ ] **Currency Switching**: Changing active currency updates currency symbols and conversion across all views.
- [ ] **Print & PDF Generation**:
  - [ ] A4 print layout renders with crisp borders and no unwanted page overflows.
  - [ ] Thermal POS preview (58mm / 80mm) renders valid monospace receipts.
  - [ ] Download PDF produces valid binary PDF with embedded UPI QR code.

---

## 4. Backend & API Gates

- [ ] **HTTP Smoke Coverage Passes**: `node tests/e2e/smoke.test.mjs` passes in an isolated temporary data directory.
- [ ] **Contract and Security Coverage Passes**: Run `npm run test:contract` and `npm run test:security`; both must use isolated temporary data.
- [ ] **Safe File Persistence**: Saving, updating, and deleting bills, clients, products, and expenses safely writes valid JSON to disk.
- [ ] **Atomic Writes Active**: File writes use temporary files and atomic renames, preventing corrupt partial JSON files.
- [ ] **Path Traversal Defended**: Endpoints reject filenames containing `..`, `/`, or illegal path characters with HTTP 400.
- [ ] **Static Serving in Production**: Express server correctly serves static files from `dist/` with client-side SPA fallback.
- [ ] **Vite Middleware in Development**: In dev mode, Express mounts Vite middleware without socket or port conflicts.

---

## 5. Build & Code Quality Gates

- [ ] **TypeScript Check Passes**: `npm run typecheck` exits with code 0.
- [ ] **Production Build Passes**: `npm run build` exits with code 0.
- [ ] **No Fatal Console Errors**: Browser DevTools console displays zero uncaught runtime exceptions.
- [ ] **Bundle Budget Respected**: Initial JavaScript bundle payload remains under 350KB gzip.
- [ ] **Zero Stale Dependencies**: No unresolved imports or dangling package references.
