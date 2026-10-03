# 15 — Phased Migration Plan (Phases 01 to 45)

This document details the 45 sequential, independently verifiable implementation phases. Each phase is sized between 3 and 15 files and is designed to maintain 100% application functionality and pass all build/test gates.

---

## Phase 01 — Baseline Verification & Safety Checkpoint

### Goal
Establish an immutable baseline, verify current production build, and confirm passing status of the 79 mathematical regression tests.

### Why now
Before changing any code or paths, we must verify that the existing codebase builds and passes all tests in its current state.

### Scope
Run automated build and regression suites; inspect git status.

### Files affected
- `package.json`, `vite.config.js`, `scripts/tax-test.mjs`, `scripts/discount-modes-test.mjs`

### Files created
- None

### Files moved
- None

### Files modified
- None

### Dependencies
- None

### Actions
1. Run `npm run build` and confirm exit code 0.
2. Run `node scripts/tax-test.mjs` and verify all 70 statutory tax tests pass.
3. Run `node scripts/discount-modes-test.mjs` and verify all 9 discount tests pass.
4. Record build asset sizes for post-refactor comparison.

### Import updates
- None

### Behavioral constraints
- Zero code modifications.

### Verification
- `npm run build && node scripts/tax-test.mjs && node scripts/discount-modes-test.mjs`

### Success criteria
- All commands exit with code 0. No build errors or test failures.

### Risks
- None.

### Rollback
- Not applicable.

### Do not do
- Do not edit or move any files.

---

## Phase 02 — Test Harness Normalization (Native Smoke Runner)

### Goal
Fix `tests/smoke.mjs` by eliminating broken uninstalled Playwright dependency and establishing a native Node.js HTTP smoke test.

### Why now
Subsequent phases need a fast automated smoke test against the live backend API and frontend index to run in CI/container environments without heavy browser binaries.

### Scope
Update `tests/smoke.mjs` to test `/api/health`, `/api/bills`, and `/` via native `fetch`.

### Files affected
- `tests/smoke.mjs`

### Files created
- None

### Files moved
- None

### Files modified
- `tests/smoke.mjs`

### Dependencies
- Phase 01

### Actions
1. Rewrite `tests/smoke.mjs` using Node.js native `test` and global `fetch`.
2. Add health check assertion (`GET /api/health` returns `200` and `{ ok: true }`).
3. Add bills list assertion (`GET /api/bills` returns `200` array).
4. Add frontend static serving assertion (`GET /` returns `200` and contains `<div id="root">`).

### Import updates
- Remove `import { chromium } from 'playwright'`.

### Behavioral constraints
- Backend endpoints and responses remain untouched.

### Verification
- `node tests/smoke.mjs`

### Success criteria
- Smoke test completes with 3/3 passed tests in <1 second.

### Risks
- False positive test assertions.

### Rollback
- Revert `tests/smoke.mjs`.

### Do not do
- Do not install heavy external test frameworks.

---

## Phase 03 — Path Alias Registration (`@/*`)

### Goal
Configure the standard `@/` path alias pointing to `src/` in TypeScript and Vite build configurations.

### Why now
Enables clean, non-relative imports (`@/shared/...`, `@/features/...`) across all subsequent file moves without brittle `../../..` chains.

### Scope
Update `tsconfig.json` and `vite.config.js`.

### Files affected
- `tsconfig.json`, `vite.config.js`

### Files created
- None

### Files moved
- None

### Files modified
- `tsconfig.json`, `vite.config.js`

### Dependencies
- Phase 02

### Actions
1. Add `compilerOptions.baseUrl = "."` and `compilerOptions.paths = { "@/*": ["src/*"] }` to `tsconfig.json`.
2. Add `resolve.alias: { '@': path.resolve(__dirname, './src') }` to `vite.config.js`.
3. Test alias by creating a small test import.

### Import updates
- None in application code yet.

### Behavioral constraints
- Existing relative imports must continue to resolve without issue.

### Verification
- `npm run build`

### Success criteria
- Production build succeeds with zero alias resolution errors.

### Risks
- Path resolution conflicts in SSR or tooling if misconfigured.

### Rollback
- Revert `tsconfig.json` and `vite.config.js`.

### Do not do
- Do not mass-replace existing imports yet.

---

## Phase 04 — Target Directory Structure Initialization

### Goal
Create target directories for `src/app/`, `src/pages/`, `src/features/`, `src/shared/`, `src/services/`, `src/store/`, `src/styles/`, and `server/`.

### Why now
Prepares canonical folder locations before moving any files.

### Scope
Create empty directory scaffolding with `.gitkeep` files where needed.

### Files affected
- Directory tree

### Files created
- `src/app/.gitkeep`, `src/pages/.gitkeep`, `src/features/.gitkeep`, `src/shared/.gitkeep`, `src/services/.gitkeep`, `src/styles/.gitkeep`, `server/.gitkeep`

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 03

### Actions
1. Create directories as specified in target architecture.

### Import updates
- None

### Behavioral constraints
- No runtime impact.

### Verification
- `git status`

### Success criteria
- Directory structure exists.

### Risks
- None.

### Rollback
- Delete created folders.

### Do not do
- Do not delete existing folders (`src/components/`, `src/utils/`).

---

## Phase 05 — Global Shared Types Foundation

### Goal
Extract and declare shared TypeScript interfaces and models for core financial concepts (Currency, Address, StateCode, TaxRate).

### Why now
Provides typed contracts for utilities and UI components extracted in later phases.

### Scope
Create `src/shared/types/` declaration files.

### Files affected
- None (new files)

### Files created
- `src/shared/types/currency.ts`
- `src/shared/types/tax.ts`
- `src/shared/types/common.ts`
- `src/shared/types/index.ts`

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 04

### Actions
1. Define `CurrencyCode`, `CurrencyInfo` in `currency.ts`.
2. Define `TaxRate`, `GSTBucket`, `PlaceOfSupply` in `tax.ts`.
3. Export all types from `src/shared/types/index.ts`.

### Import updates
- None

### Behavioral constraints
- Zero runtime code impact (type declarations only).

### Verification
- `npm run build`

### Success criteria
- Types compile cleanly.

### Risks
- None.

### Rollback
- Remove `src/shared/types/`.

### Do not do
- Do not declare business-specific invoice/bill types here (those belong in `features/invoices/types`).

---

## Phase 06 — Shared System Constants Extraction

### Goal
Extract global static constants (Indian state codes, default tax rates, supported currencies) from `src/utils.js` into `src/shared/constants/`.

### Why now
De-duplicates hardcoded state code arrays and currencies scattered across `src/utils.js`, `src/App.jsx`, and `src/components/InvoiceGenerator.jsx`.

### Scope
Create `src/shared/constants/` and re-export from `src/utils.js`.

### Files affected
- `src/utils.js`

### Files created
- `src/shared/constants/indianStates.ts`
- `src/shared/constants/currencies.ts`
- `src/shared/constants/taxRates.ts`
- `src/shared/constants/index.ts`

### Files moved
- None

### Files modified
- `src/utils.js` (delegates constants to `src/shared/constants/`)

### Dependencies
- Phase 05

### Actions
1. Move `INDIAN_STATES` array and state codes map to `indianStates.ts`.
2. Move supported currency map to `currencies.ts`.
3. Re-export these in `src/utils.js` for backward compatibility.
4. Run statutory tax tests.

### Import updates
- `src/utils.js` imports constants from `@/shared/constants`.

### Behavioral constraints
- Values of all constants must remain identical.

### Verification
- `node scripts/tax-test.mjs && npm run build`

### Success criteria
- 70/70 tax tests pass. Build succeeds.

### Risks
- Typo in state codes breaking UTGST or place of supply logic.

### Rollback
- Revert changes to `src/utils.js` and delete `src/shared/constants/`.

### Do not do
- Do not alter any state codes or names.

---

## Phase 07 — Shared Number & Currency Formatters Extraction

### Goal
Extract number-to-words, Indian rupee formatters, and international currency formatters into `src/shared/utils/formatters.ts`.

### Why now
Isolates pure formatting logic from `src/utils.js` before addressing the statutory tax engine.

### Scope
Extract `numberToWords`, `formatCurrency`, `formatINR`, `parseFormattedNumber` into dedicated module.

### Files affected
- `src/utils.js`

### Files created
- `src/shared/utils/formatters.ts`

### Files moved
- None

### Files modified
- `src/utils.js` (re-exports formatters from `@/shared/utils/formatters`)

### Dependencies
- Phase 06

### Actions
1. Extract currency and number formatting functions into `src/shared/utils/formatters.ts`.
2. Add comprehensive JSDoc and TypeScript signatures.
3. Re-export in `src/utils.js`.
4. Run statutory tax tests.

### Import updates
- `src/utils.js` re-exports from `@/shared/utils/formatters`.

### Behavioral constraints
- Formatting output strings (e.g. "Rupees One Hundred Only") must remain unchanged.

### Verification
- `node scripts/tax-test.mjs && npm run build`

### Success criteria
- All tests pass. No regressions in printed invoice totals.

### Risks
- Minor rounding discrepancies if math is altered.

### Rollback
- Revert `src/utils.js` and delete `formatters.ts`.

### Do not do
- Do not rewrite number-to-words algorithm.

---

## Phase 08 — Shared Date & Fiscal Year Utilities Extraction

### Goal
Extract date formatters, financial year calculators, and due-date helpers into `src/shared/utils/dateUtils.ts`.

### Why now
Fiscal year and date parsing are used across invoices, expenses, recurring bills, and GST returns.

### Scope
Create `src/shared/utils/dateUtils.ts` and delegate from `src/utils.js`.

### Files affected
- `src/utils.js`

### Files created
- `src/shared/utils/dateUtils.ts`

### Files moved
- None

### Files modified
- `src/utils.js`

### Dependencies
- Phase 07

### Actions
1. Extract `getFinancialYear`, `formatDisplayDate`, `isOverdue`, `getQuarterDates` into `dateUtils.ts`.
2. Re-export in `src/utils.js`.

### Import updates
- `src/utils.js` re-exports from `@/shared/utils/dateUtils`.

### Behavioral constraints
- Financial year boundaries (April 1 to March 31) must remain strictly preserved.

### Verification
- `node scripts/tax-test.mjs && npm run build`

### Success criteria
- Tests pass; FY calculation unchanged.

### Risks
- Timezone offset bugs if Date objects are altered.

### Rollback
- Revert `src/utils.js`.

### Do not do
- Do not introduce external date libraries like moment or date-fns.

---

## Phase 09 — GSTIN & PAN Validator Utilities Extraction

### Goal
Extract GSTIN regex, checksum validation, and PAN extraction into `src/shared/utils/validators.ts`.

### Why now
GSTIN validation is required in `ClientsView`, `InvoiceGenerator`, and `SettingsView`.

### Scope
Create `src/shared/utils/validators.ts`.

### Files affected
- `src/utils.js`

### Files created
- `src/shared/utils/validators.ts`

### Files moved
- None

### Files modified
- `src/utils.js`

### Dependencies
- Phase 08

### Actions
1. Extract `validateGSTIN`, `extractStateFromGSTIN`, `validatePAN`, `validateIFSC` into `validators.ts`.
2. Re-export in `src/utils.js`.

### Import updates
- `src/utils.js` re-exports from `@/shared/utils/validators`.

### Behavioral constraints
- Statutory checksum algorithm must remain exact.

### Verification
- `node scripts/tax-test.mjs && npm run build`

### Success criteria
- Tests pass.

### Risks
- Flawed regex rejecting valid GSTINs.

### Rollback
- Revert `src/utils.js`.

### Do not do
- Do not modify existing validation regex patterns.

---

## Phase 10 — Generic UI Hooks Extraction

### Goal
Extract reusable, non-domain hooks (`useDebounce`, `useLocalStorage`, `useHotkeys`, `useMediaQuery`) into `src/shared/hooks/`.

### Why now
Prepares keyboard shortcut and search input debounce hooks for subsequent component extractions.

### Scope
Create `src/shared/hooks/`.

### Files affected
- None

### Files created
- `src/shared/hooks/useDebounce.ts`
- `src/shared/hooks/useLocalStorage.ts`
- `src/shared/hooks/useHotkeys.ts`
- `src/shared/hooks/useMediaQuery.ts`
- `src/shared/hooks/index.ts`

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 09

### Actions
1. Implement generic hooks with strict types and cleanup callbacks.

### Import updates
- None

### Behavioral constraints
- Pure utility hooks with zero domain state.

### Verification
- `npm run build`

### Success criteria
- Compiles cleanly.

### Risks
- Memory leaks if event listeners lack unbind cleanup.

### Rollback
- Remove `src/shared/hooks/`.

### Do not do
- Do not put billing or invoice logic in shared hooks.

---

## Phase 11 — Design Tokens & Base Styles Split

### Goal
Split monolithic `src/index.css` into modular CSS layers (`tokens.css`, `themes.css`, `reset.css`, `utilities.css`, `print.css`).

### Why now
Provides tokenized CSS variables for buttons, inputs, and modals in Phase 12.

### Scope
Create `src/styles/` files and import them sequentially in `src/styles/index.css`.

### Files affected
- `src/index.css`

### Files created
- `src/styles/tokens.css`
- `src/styles/themes.css`
- `src/styles/reset.css`
- `src/styles/utilities.css`
- `src/styles/print.css`
- `src/styles/index.css`

### Files moved
- None

### Files modified
- `src/index.css` (replaces monolithic content with `@import './styles/index.css'`)

### Dependencies
- Phase 10

### Actions
1. Extract CSS variable definitions into `tokens.css` and `themes.css`.
2. Extract print `@media print` rules into `print.css`.
3. Extract reset and typography into `reset.css`.
4. Import all from `src/styles/index.css`.

### Import updates
- `src/main.jsx` continues to import `./index.css` seamlessly.

### Behavioral constraints
- Visual layout, colors, and print appearances must remain pixel-identical.

### Verification
- `npm run build` and visual inspection in browser.

### Success criteria
- Production build succeeds; zero styling breakage.

### Risks
- CSS selector cascade order shifts.

### Rollback
- Revert `src/index.css` and delete `src/styles/`.

### Do not do
- Do not redesign or change color values in this phase.

---

## Phase 12 — Shared Base UI Components (Button, Input, Badge, Card)

### Goal
Create standardized, typed UI primitives in `src/shared/components/ui/` based on design tokens.

### Why now
Enables consistent UI extraction across all feature views without duplicate button or input CSS classes.

### Scope
Create `Button.tsx`, `Input.tsx`, `Select.tsx`, `Badge.tsx`, `Card.tsx`.

### Files affected
- None

### Files created
- `src/shared/components/ui/Button.tsx`
- `src/shared/components/ui/Input.tsx`
- `src/shared/components/ui/Select.tsx`
- `src/shared/components/ui/Badge.tsx`
- `src/shared/components/ui/Card.tsx`
- `src/shared/components/ui/index.ts`

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 11

### Actions
1. Implement primitives matching existing `.btn`, `.form-input`, `.badge` classes.
2. Support `variant`, `size`, `hasError`, and `disabled` props.

### Import updates
- None

### Behavioral constraints
- Components must render identical HTML attributes and styles.

### Verification
- `npm run build`

### Success criteria
- Primitives compile with zero errors.

### Risks
- None.

### Rollback
- Delete `src/shared/components/ui/`.

### Do not do
- Do not force refactoring of existing views to use these primitives yet.

---

## Phase 13 — Leaf Domain Utilities Relocation

### Goal
Move isolated leaf utilities (`hsnRates.js`, `clientCredit.js`, `itr.js`) to their respective feature directories.

### Why now
These modules have zero dependencies on other utilities and belong strictly to specific business domains.

### Scope
Relocate leaf utils and add backward-compatibility re-exports in `src/utils/`.

### Files affected
- `src/utils/hsnRates.js`, `src/utils/clientCredit.js`, `src/utils/itr.js`

### Files created
- `src/features/inventory/data/hsnRates.ts`
- `src/features/clients/utils/clientCredit.ts`
- `src/features/income-tax/utils/itrCalculation.ts`

### Files moved
- Content moved from `src/utils/*` to feature paths.

### Files modified
- `src/utils/hsnRates.js`, `src/utils/clientCredit.js`, `src/utils/itr.js` (re-export from new feature paths)

### Dependencies
- Phase 12

### Actions
1. Create target feature folders.
2. Copy files to new target locations and convert to TypeScript declarations.
3. Update original files in `src/utils/` to re-export everything from new locations.
4. Run all regression suites.

### Import updates
- Existing consumers continue to import from `src/utils/*` through the re-export facade.

### Behavioral constraints
- All calculation rules in `itr.js` must remain 100% identical.

### Verification
- `node scripts/tax-test.mjs && node scripts/discount-modes-test.mjs && npm run build`

### Success criteria
- 79/79 statutory tests pass.

### Risks
- Disrupted imports in test runner.

### Rollback
- Restore original `src/utils/*` files.

### Do not do
- Do not modify any tax slab or deduction logic in `itrCalculation.ts`.

---

## Phase 14 — Secondary Leaf Services & Print Helpers Relocation

### Goal
Relocate `printSettings.js`, `share.js`, and `googleDrive.js` into feature and shared service locations.

### Why now
Completes the migration of all satellite utilities out of `src/utils/` and `src/services/`.

### Scope
Relocate files and maintain facade re-exports.

### Files affected
- `src/utils/printSettings.js`, `src/utils/share.js`, `src/services/googleDrive.js`

### Files created
- `src/features/invoices/utils/printSettings.ts`
- `src/shared/utils/share.ts`
- `src/features/settings/services/googleDrive.ts`

### Files moved
- Relocated logic.

### Files modified
- `src/utils/printSettings.js`, `src/utils/share.js`, `src/services/googleDrive.js` (re-exports)

### Dependencies
- Phase 13

### Actions
1. Move files to target destinations.
2. Provide facade re-exports.
3. Run production build.

### Import updates
- Facades preserve all existing import paths.

### Behavioral constraints
- Google Drive OAuth and print margins remain unchanged.

### Verification
- `npm run build`

### Success criteria
- Production build succeeds.

### Risks
- None.

### Rollback
- Revert files.

### Do not do
- Do not alter print margin default values.

---

## Phase 15 — Shared Feedback Components Relocation (`ConfirmModal`, `Toast`)

### Goal
Move `ConfirmModal.jsx` and `Toast.jsx` into `src/shared/components/feedback/`.

### Why now
These are domain-agnostic UI feedback components used universally across all views.

### Scope
Relocate components and provide facade re-exports in `src/components/`.

### Files affected
- `src/components/ConfirmModal.jsx`, `src/components/Toast.jsx`

### Files created
- `src/shared/components/feedback/ConfirmModal.tsx`
- `src/shared/components/feedback/Toast.tsx`
- `src/shared/components/feedback/index.ts`

### Files moved
- Components relocated.

### Files modified
- `src/components/ConfirmModal.jsx`, `src/components/Toast.jsx` (facades)

### Dependencies
- Phase 14

### Actions
1. Re-implement in `src/shared/components/feedback/` with strict TypeScript props.
2. Re-export in original `src/components/` paths.
3. Verify all consumers render modals and toasts properly.

### Import updates
- Backward-compatible facades.

### Behavioral constraints
- Confirmation triggers, backdrop clicks, and auto-dismiss timeouts remain identical.

### Verification
- `npm run build`

### Success criteria
- Build succeeds with zero errors.

### Risks
- None.

### Rollback
- Restore `src/components/ConfirmModal.jsx` and `Toast.jsx`.

### Do not do
- Do not change modal animations or button labels.

---

## Phase 16 — Shared Layout Components Relocation (`PageHeader`, `HelpButton`)

### Goal
Move `PageHeader.jsx` and `HelpButton.jsx` into `src/shared/components/layout/` and `feedback/`.

### Why now
Standardizes title bars and help triggers across all views before decomposing the views themselves.

### Scope
Relocate components and maintain facade re-exports.

### Files affected
- `src/components/PageHeader.jsx`, `src/components/HelpButton.jsx`

### Files created
- `src/shared/components/layout/PageHeader.tsx`
- `src/shared/components/feedback/HelpButton.tsx`

### Files moved
- Components relocated.

### Files modified
- `src/components/PageHeader.jsx`, `src/components/HelpButton.jsx` (facades)

### Dependencies
- Phase 15

### Actions
1. Move components and type props.
2. Provide facade re-exports.

### Import updates
- Facades preserve existing imports.

### Behavioral constraints
- Visual layout and button placements remain identical.

### Verification
- `npm run build`

### Success criteria
- Build succeeds.

### Risks
- None.

### Rollback
- Revert files.

### Do not do
- Do not alter page header action slots.

---

## Phase 17 — Statutory Tax Calculation Engine Extraction

### Goal
Extract `computeInvoiceTotals` and statutory tax math from `src/utils.js` into `src/features/invoices/utils/taxCalculation.ts`.

### Why now
This is the core financial engine of the entire application. It must be cleanly isolated and verified against the 79 test cases before decomposing `InvoiceGenerator.jsx`.

### Scope
Create `src/features/invoices/utils/taxCalculation.ts` and delegate from `src/utils.js`.

### Files affected
- `src/utils.js`, `scripts/tax-test.mjs`, `scripts/discount-modes-test.mjs`

### Files created
- `src/features/invoices/utils/taxCalculation.ts`

### Files moved
- None

### Files modified
- `src/utils.js` (delegates `computeInvoiceTotals` to `taxCalculation.ts`)

### Dependencies
- Phase 16

### Actions
1. Copy `computeInvoiceTotals` into `taxCalculation.ts`.
2. Ensure zero DOM or browser dependencies in `taxCalculation.ts` (pure function).
3. Re-export in `src/utils.js`.
4. Run statutory regression suites.

### Import updates
- `src/utils.js` re-exports from `@/features/invoices/utils/taxCalculation`.

### Behavioral constraints
- Every calculation (subtotal, CGST, SGST, IGST, UTGST, cess, RCM, discounts, TCS/TDS, round-off) must match the test suite down to the exact paisa.

### Verification
- `node scripts/tax-test.mjs && node scripts/discount-modes-test.mjs`

### Success criteria
- 79/79 statutory tests pass.

### Risks
- Minor rounding variation causing tax discrepancies.

### Rollback
- Revert `src/utils.js`.

### Do not do
- Do not change any mathematical formulas or rounding steps.

---

## Phase 18 — Invoice Types & Domain Contracts Declaration

### Goal
Declare comprehensive TypeScript interfaces for Invoices, Line Items, Discounts, and Payments in `src/features/invoices/types/`.

### Why now
Provides strict typing for `InvoiceEditor`, `InvoicePreview`, and the PDF generator.

### Scope
Create `src/features/invoices/types/index.ts`.

### Files affected
- None

### Files created
- `src/features/invoices/types/invoice.ts`
- `src/features/invoices/types/items.ts`
- `src/features/invoices/types/print.ts`
- `src/features/invoices/types/index.ts`

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 17

### Actions
1. Define `InvoiceDocument`, `InvoiceItem`, `DiscountMode`, `PaymentDetail`.

### Import updates
- None

### Behavioral constraints
- Types only; zero runtime code.

### Verification
- `npm run build`

### Success criteria
- Compiles cleanly.

### Risks
- None.

### Rollback
- Delete `src/features/invoices/types/`.

### Do not do
- Do not introduce breaking field name changes.

---

## Phase 19 — Standardized API Client Implementation

### Goal
Implement the centralized HTTP client with timeout, error handling, and JSON serialization in `src/services/api/client.ts`.

### Why now
Equips feature services with a reliable HTTP client before extracting feature data layers.

### Scope
Create `src/services/api/`.

### Files affected
- None

### Files created
- `src/services/api/client.ts`
- `src/services/api/errors.ts`
- `src/services/api/endpoints.ts`
- `src/services/api/index.ts`

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 18

### Actions
1. Implement `apiClient.get()`, `post()`, `put()`, `delete()`.
2. Support configurable timeout and abort signal.
3. Standardize `ApiError` hierarchy.

### Import updates
- None yet.

### Behavioral constraints
- Uses standard native `fetch`.

### Verification
- `npm run build`

### Success criteria
- Compiles cleanly.

### Risks
- None.

### Rollback
- Remove `src/services/api/`.

### Do not do
- Do not replace `store.js` calls yet.

---

## Phase 20 — Global Context Providers Architecture

### Goal
Implement global providers (`ThemeProvider`, `ProfileProvider`, `CurrencyProvider`, `NotificationProvider`) in `src/app/providers/`.

### Why now
Eliminates 20+ prop drilling parameters in `src/App.jsx`.

### Scope
Create `src/app/providers/`.

### Files affected
- None

### Files created
- `src/app/providers/ThemeProvider.tsx`
- `src/app/providers/ProfileProvider.tsx`
- `src/app/providers/CurrencyProvider.tsx`
- `src/app/providers/NotificationProvider.tsx`
- `src/app/providers/AppProviders.tsx`
- `src/app/providers/index.ts`

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 19

### Actions
1. Implement providers reading from `localStorage` and syncing with backend.
2. Create composition wrapper `AppProviders`.

### Import updates
- None yet.

### Behavioral constraints
- Existing `localStorage` keys (`theme`, `selected_currency`, `enabled_modules`) must be honored.

### Verification
- `npm run build`

### Success criteria
- Providers compile cleanly.

### Risks
- None.

### Rollback
- Delete `src/app/providers/`.

### Do not do
- Do not mount in `App.jsx` until pages are mapped.

---

## Phase 21 — Application Shell & Navigation Layout Extraction

### Goal
Extract `AppShell.tsx`, `TopNavBar.tsx`, and `NavigationTabs.tsx` from `src/App.jsx` into `src/app/layout/`.

### Why now
Reduces `src/App.jsx` from 1,138 lines to a clean orchestrator.

### Scope
Create `src/app/layout/` components.

### Files affected
- None

### Files created
- `src/app/layout/AppShell.tsx`
- `src/app/layout/TopNavBar.tsx`
- `src/app/layout/NavigationTabs.tsx`
- `src/app/layout/BannerHost.tsx`
- `src/app/layout/index.ts`

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 20

### Actions
1. Extract top bar, currency dropdown, profile switcher, and view tabs into modular layout components.

### Import updates
- None yet.

### Behavioral constraints
- Visual header and navigation tabs must look and behave identically.

### Verification
- `npm run build`

### Success criteria
- Layout components compile cleanly.

### Risks
- None.

### Rollback
- Delete `src/app/layout/`.

### Do not do
- Do not modify `src/App.jsx` in this phase.

---

## Phase 22 — Client Feature & Page Extraction (`ClientsPage`)

### Goal
Extract `ClientModal.jsx` and `ClientsView.jsx` into `src/features/clients/` and `src/pages/ClientsPage.tsx`.

### Why now
First complete feature migration. Clients is a self-contained domain with medium complexity.

### Scope
Create `src/features/clients/` and `src/pages/ClientsPage.tsx`.

### Files affected
- `src/components/ClientModal.jsx`, `src/components/ClientsView.jsx`

### Files created
- `src/features/clients/components/ClientModal.tsx`
- `src/features/clients/components/ClientLedger.tsx`
- `src/features/clients/services/clientService.ts`
- `src/features/clients/hooks/useClients.ts`
- `src/features/clients/types/index.ts`
- `src/features/clients/index.ts`
- `src/pages/ClientsPage.tsx`

### Files moved
- Components relocated.

### Files modified
- `src/components/ClientModal.jsx`, `src/components/ClientsView.jsx` (facades)

### Dependencies
- Phase 21

### Actions
1. Extract client service and data hook.
2. Relocate UI components.
3. Provide facade re-exports in `src/components/`.

### Import updates
- Facades protect existing consumers.

### Behavioral constraints
- Client CRUD, search, ledger, and outstanding balance calculations remain identical.

### Verification
- `npm run build && node tests/smoke.mjs`

### Success criteria
- Build succeeds; smoke test passes.

### Risks
- Breaking client autocomplete in `InvoiceGenerator.jsx`.

### Rollback
- Revert facades and restore original files.

### Do not do
- Do not change client JSON storage schema.

---

## Phase 23 — Inventory & Expense Feature Extraction (`InventoryPage`, `ExpensesPage`)

### Goal
Extract `InventoryView.jsx` and `ExpenseTracker.jsx` into `src/features/inventory/`, `src/features/expenses/`, and their respective pages.

### Why now
Both are isolated satellite features with low inter-dependency.

### Scope
Create feature modules and page wrappers; maintain legacy facades.

### Files affected
- `src/components/InventoryView.jsx`, `src/components/ExpenseTracker.jsx`

### Files created
- `src/features/inventory/components/ProductModal.tsx`
- `src/features/inventory/services/inventoryService.ts`
- `src/pages/InventoryPage.tsx`
- `src/features/expenses/components/ExpenseModal.tsx`
- `src/features/expenses/services/expenseService.ts`
- `src/pages/ExpensesPage.tsx`

### Files moved
- Content relocated.

### Files modified
- `src/components/InventoryView.jsx`, `src/components/ExpenseTracker.jsx` (facades)

### Dependencies
- Phase 22

### Actions
1. Create inventory and expense services/hooks.
2. Relocate components and create pages.
3. Re-export from `src/components/`.

### Import updates
- Facades preserve backward compatibility.

### Behavioral constraints
- Stock warning alerts and category expense totals remain identical.

### Verification
- `npm run build`

### Success criteria
- Production build succeeds.

### Risks
- None.

### Rollback
- Revert facades.

### Do not do
- Do not alter HSN code lookup.

---

## Phase 24 — Purchases, Recurring & Receipts Feature Extraction

### Goal
Extract `PurchaseBills.jsx`, `RecurringInvoices.jsx`, and `ReceiptVoucher.jsx` into dedicated feature modules and pages.

### Why now
Completes secondary transactional feature extraction.

### Scope
Create feature directories for purchases, recurring, and receipts; maintain facades.

### Files affected
- `src/components/PurchaseBills.jsx`, `src/components/RecurringInvoices.jsx`, `src/components/ReceiptVoucher.jsx`

### Files created
- `src/features/purchases/services/purchaseService.ts`
- `src/pages/PurchasesPage.tsx`
- `src/features/recurring/services/recurringService.ts`
- `src/pages/RecurringPage.tsx`
- `src/features/receipts/services/receiptService.ts`
- `src/pages/ReceiptsPage.tsx`

### Files moved
- Relocated logic.

### Files modified
- `src/components/PurchaseBills.jsx`, `RecurringInvoices.jsx`, `ReceiptVoucher.jsx` (facades)

### Dependencies
- Phase 23

### Actions
1. Build services and feature hooks.
2. Relocate components into feature folders.
3. Provide facade re-exports.

### Import updates
- Facades protect existing callers.

### Behavioral constraints
- Recurring schedule calculations (monthly, quarterly) remain unchanged.

### Verification
- `npm run build`

### Success criteria
- Build succeeds.

### Risks
- None.

### Rollback
- Revert facades.

### Do not do
- Do not modify recurring auto-fire logic.

---

## Phase 25 — Invoice Satellite Components Extraction (OCR, Print Settings, Preview Modal)

### Goal
Extract `BillOCR.jsx`, `PrintSettings.jsx`, and `PrintPreviewModal.jsx` into `src/features/invoices/components/`.

### Why now
Prepares all supporting modal and scanner components before tackling the core `InvoiceGenerator.jsx` monolith.

### Scope
Relocate supporting invoice components and maintain facades.

### Files affected
- `src/components/BillOCR.jsx`, `src/components/PrintSettings.jsx`, `src/components/PrintPreviewModal.jsx`

### Files created
- `src/features/invoices/components/BillOCR/BillOCRModal.tsx`
- `src/features/invoices/components/Print/PrintSettings.tsx`
- `src/features/invoices/components/Print/PrintPreviewModal.tsx`

### Files moved
- Components relocated.

### Files modified
- `src/components/BillOCR.jsx`, `PrintSettings.jsx`, `PrintPreviewModal.jsx` (facades)

### Dependencies
- Phase 24

### Actions
1. Relocate components into `src/features/invoices/components/`.
2. Connect to `@/features/invoices/utils/printSettings`.
3. Provide facade re-exports in `src/components/`.

### Import updates
- Facades protect callers.

### Behavioral constraints
- Tesseract OCR scanning and print margin overrides work identically.

### Verification
- `npm run build`

### Success criteria
- Build succeeds; OCR worker loads without errors.

### Risks
- Missing Tesseract asset paths.

### Rollback
- Revert facades.

### Do not do
- Do not modify worker paths in `BillOCR`.

---

## Phase 26 — Invoice Document Renderer & PDF Service Extraction

### Goal
Extract `InvoicePreview.jsx` and PDF generation routines into `src/features/invoices/components/InvoicePreview/` and `src/features/invoices/services/pdfService.ts`.

### Why now
Decouples invoice document visual rendering and PDF binary generation from form state before decomposing the generator.

### Scope
Relocate `InvoicePreview.jsx`, extract `pdfService.ts`, and maintain facades.

### Files affected
- `src/components/InvoicePreview.jsx`

### Files created
- `src/features/invoices/components/InvoicePreview/InvoicePreview.tsx`
- `src/features/invoices/components/InvoicePreview/ThermalReceipt.tsx`
- `src/features/invoices/services/pdfService.ts`

### Files moved
- Component relocated.

### Files modified
- `src/components/InvoicePreview.jsx` (facade)

### Dependencies
- Phase 25

### Actions
1. Relocate `InvoicePreview.jsx` into feature folder.
2. Extract jsPDF and html2canvas calls into `pdfService.ts`.
3. Provide facade re-export.

### Import updates
- Facade preserves compatibility.

### Behavioral constraints
- Rendered invoice appearance, UPI QR code, and PDF page breaks must remain identical.

### Verification
- `npm run build`

### Success criteria
- Build succeeds.

### Risks
- html2canvas styling clipping.

### Rollback
- Revert facade.

### Do not do
- Do not alter invoice print template layout or font sizes.

---

## Phase 27 — Invoice Editor Monolith Decomposition (`InvoiceEditorPage`)

### Goal
Decompose `src/components/InvoiceGenerator.jsx` (4,146 lines) into modular sub-components under `src/features/invoices/components/InvoiceEditor/` and create `src/pages/InvoiceEditorPage.tsx`.

### Why now
The highest complexity frontend refactor. All prerequisite types, utilities, and satellite components are now in place.

### Scope
Break `InvoiceGenerator.jsx` into 6 sub-components and a master page orchestrator.

### Files affected
- `src/components/InvoiceGenerator.jsx`

### Files created
- `src/features/invoices/components/InvoiceEditor/InvoiceEditorHeader.tsx`
- `src/features/invoices/components/InvoiceEditor/ClientSelectSection.tsx`
- `src/features/invoices/components/InvoiceEditor/InvoiceItemsTable.tsx`
- `src/features/invoices/components/InvoiceEditor/InvoiceTotalsSection.tsx`
- `src/features/invoices/components/InvoiceEditor/PaymentTermsSection.tsx`
- `src/features/invoices/hooks/useInvoiceForm.ts`
- `src/pages/InvoiceEditorPage.tsx`

### Files moved
- Content modularized.

### Files modified
- `src/components/InvoiceGenerator.jsx` (facade delegating to `InvoiceEditorPage`)

### Dependencies
- Phase 26

### Actions
1. Extract line item table and autocomplete logic into `InvoiceItemsTable.tsx`.
2. Extract client select into `ClientSelectSection.tsx`.
3. Extract tax calculation and totals into `InvoiceTotalsSection.tsx`.
4. Wrap state in `useInvoiceForm.ts`.
5. Maintain `src/components/InvoiceGenerator.jsx` as a delegating facade.
6. Run statutory regression tests.

### Import updates
- Facade protects `App.jsx`.

### Behavioral constraints
- Barcode scanner, hotkeys (`Ctrl+S`, `Ctrl+P`), and line item calculations work identically.

### Verification
- `node scripts/tax-test.mjs && node scripts/discount-modes-test.mjs && npm run build`

### Success criteria
- 79/79 tests pass; build succeeds.

### Risks
- State desynchronization between item row and totals summary.

### Rollback
- Restore original `src/components/InvoiceGenerator.jsx`.

### Do not do
- Do not remove any existing invoice form fields or options.

---

## Phase 28 — Dashboard Monolith Modularization (`DashboardPage`)

### Goal
Modularize `src/components/Dashboard.jsx` (1,591 lines) into `src/pages/DashboardPage.tsx` and feature register components.

### Why now
The primary landing view. Relies on the invoices feature extractions from Phase 27.

### Scope
Extract metrics cards, invoice register table, and filter bars; maintain facade.

### Files affected
- `src/components/Dashboard.jsx`

### Files created
- `src/features/invoices/components/Dashboard/MetricCards.tsx`
- `src/features/invoices/components/Dashboard/BillsRegisterTable.tsx`
- `src/features/invoices/components/Dashboard/RegisterFilters.tsx`
- `src/pages/DashboardPage.tsx`

### Files moved
- Content modularized.

### Files modified
- `src/components/Dashboard.jsx` (facade)

### Dependencies
- Phase 27

### Actions
1. Extract metric cards (total sales, unpaid, overdue, tax collected).
2. Extract bill list table and search/date filters.
3. Provide facade re-export in `src/components/Dashboard.jsx`.

### Import updates
- Facade protects `App.jsx`.

### Behavioral constraints
- Financial metrics calculations and bill status badges remain identical.

### Verification
- `npm run build && node tests/smoke.mjs`

### Success criteria
- Build succeeds; smoke tests pass.

### Risks
- Broken table sorting or pagination.

### Rollback
- Restore original `src/components/Dashboard.jsx`.

### Do not do
- Do not alter KPI metric formulas.

---

## Phase 29 — GST Returns Monolith Modularization (`GSTReturnsPage`)

### Goal
Modularize `src/components/GSTReturns.jsx` (2,283 lines) into `src/pages/GSTReturnsPage.tsx` and tab components (`GSTR1Tab`, `GSTR3BTab`, `GSTR2BReconciliation`).

### Why now
Second largest component. Purely analytical view consuming invoices and purchases.

### Scope
Decompose `GSTReturns.jsx` into tab modules; maintain facade.

### Files affected
- `src/components/GSTReturns.jsx`

### Files created
- `src/features/gst-returns/components/GSTR1Tab.tsx`
- `src/features/gst-returns/components/GSTR3BTab.tsx`
- `src/features/gst-returns/components/GSTR2BTab.tsx`
- `src/features/gst-returns/services/gstExportService.ts`
- `src/pages/GSTReturnsPage.tsx`

### Files moved
- Modularized content.

### Files modified
- `src/components/GSTReturns.jsx` (facade)

### Dependencies
- Phase 28

### Actions
1. Split into GSTR-1, GSTR-3B, and GSTR-2B tabs.
2. Isolate government portal JSON export builder.
3. Provide facade re-export in `src/components/GSTReturns.jsx`.

### Import updates
- Facade protects `App.jsx`.

### Behavioral constraints
- Table 4 B2B, Table 7 B2CS, and 3.1 tax amounts must remain exact.

### Verification
- `npm run build`

### Success criteria
- Build succeeds.

### Risks
- JSON schema mismatch with official GST portal.

### Rollback
- Restore `src/components/GSTReturns.jsx`.

### Do not do
- Do not alter JSON schema formatting for GST portal uploads.

---

## Phase 30 — Income Tax & Reports Feature Modularization

### Goal
Modularize `src/components/IncomeTax.jsx` (1,110 lines) and `src/components/ReportsView.jsx` into dedicated feature pages.

### Why now
Completes modularization of all calculation-heavy financial views.

### Scope
Decompose Income Tax and Reports views; maintain facades.

### Files affected
- `src/components/IncomeTax.jsx`, `src/components/ReportsView.jsx`

### Files created
- `src/features/income-tax/components/TaxCalculatorCard.tsx`
- `src/pages/IncomeTaxPage.tsx`
- `src/features/reports/components/SalesReportTable.tsx`
- `src/pages/ReportsPage.tsx`

### Files moved
- Content modularized.

### Files modified
- `src/components/IncomeTax.jsx`, `src/components/ReportsView.jsx` (facades)

### Dependencies
- Phase 29

### Actions
1. Move components into feature directories.
2. Create page wrappers.
3. Maintain facades.
4. Run statutory tax tests.

### Import updates
- Facades protect callers.

### Behavioral constraints
- New vs Old regime comparisons and Section 87A rebate rules remain unchanged.

### Verification
- `node scripts/tax-test.mjs && npm run build`

### Success criteria
- 70/70 tax tests pass; build succeeds.

### Risks
- None.

### Rollback
- Revert facades.

### Do not do
- Do not alter tax slab computation.

---

## Phase 31 — Settings View Monolith Modularization (`SettingsPage`)

### Goal
Modularize `src/components/SettingsView.jsx` (2,068 lines) into `src/pages/SettingsPage.tsx` and 6 tab sub-components.

### Why now
The final monolithic view. Covers configuration, multi-business profiles, and backups.

### Scope
Decompose `SettingsView.jsx` into tab components; maintain facade.

### Files affected
- `src/components/SettingsView.jsx`

### Files created
- `src/features/settings/components/ProfileSettingsTab.tsx`
- `src/features/settings/components/NumberingSettingsTab.tsx`
- `src/features/settings/components/DataBackupTab.tsx`
- `src/features/settings/components/PrintConfigTab.tsx`
- `src/pages/SettingsPage.tsx`

### Files moved
- Content modularized.

### Files modified
- `src/components/SettingsView.jsx` (facade)

### Dependencies
- Phase 30

### Actions
1. Decompose into tabs.
2. Connect data export/import to backup services.
3. Provide facade re-export.

### Import updates
- Facade protects `App.jsx`.

### Behavioral constraints
- Backup generation, JSON file import, and business profile switching remain identical.

### Verification
- `npm run build && node tests/smoke.mjs`

### Success criteria
- Build succeeds; smoke tests pass.

### Risks
- Corrupted export file format.

### Rollback
- Restore `src/components/SettingsView.jsx`.

### Do not do
- Do not change JSON backup archive format.

---

## Phase 32 — Secondary System Views Modularization (`ControlPanel`, `UserGuide`, `Wizards`)

### Goal
Modularize `ControlPanel.jsx`, `UserGuideView.jsx`, `SetupWizard.jsx`, and `WelcomeGuide.jsx`.

### Why now
Clears the last remaining components from `src/components/`.

### Scope
Relocate system views and guides; maintain facades.

### Files affected
- `src/components/ControlPanel.jsx`, `UserGuideView.jsx`, `SetupWizard.jsx`, `WelcomeGuide.jsx`

### Files created
- `src/pages/ControlPanelPage.tsx`
- `src/pages/UserGuidePage.tsx`
- `src/features/settings/components/SetupWizard.tsx`
- `src/features/settings/components/WelcomeGuide.tsx`

### Files moved
- Content relocated.

### Files modified
- Legacy files in `src/components/` (facades)

### Dependencies
- Phase 31

### Actions
1. Relocate components and create page wrappers.
2. Provide facade re-exports.

### Import updates
- Facades protect callers.

### Behavioral constraints
- Onboarding wizard triggers and control panel script launchers work identically.

### Verification
- `npm run build`

### Success criteria
- Build succeeds.

### Risks
- None.

### Rollback
- Revert facades.

### Do not do
- Do not modify script names in control panel.

---

## Phase 33 — Declarative Router & App Shell Integration (`src/app/App.tsx`)

### Goal
Replace the monolithic `src/App.jsx` with a clean, declarative orchestrator in `src/app/App.tsx` utilizing `AppProviders`, `AppShell`, and the lazy route registry.

### Why now
All 14 views now exist as standardized pages under `src/pages/`.

### Scope
Create `src/app/App.tsx` and update `src/App.jsx` to delegate to it.

### Files affected
- `src/App.jsx`

### Files created
- `src/app/router/routes.ts`
- `src/app/router/useAppRouter.ts`
- `src/app/App.tsx`

### Files moved
- None

### Files modified
- `src/App.jsx` (hollowed out to render `<App />` from `src/app/App`)

### Dependencies
- Phase 32

### Actions
1. Define route table in `routes.ts` mapping view IDs to lazy-loaded page components.
2. Implement `useAppRouter` to handle `?view=...` query parameter and hotkeys.
3. Assemble `AppProviders`, `AppShell`, and lazy Suspense routes in `src/app/App.tsx`.
4. Delegate from `src/App.jsx`.

### Import updates
- `src/main.jsx` continues to mount `src/App.jsx`.

### Behavioral constraints
- URL deep-linking (`?view=new`, `?view=clients`), hotkey switches, and PWA launch behavior remain identical.

### Verification
- `npm run build && node tests/smoke.mjs`

### Success criteria
- 100% build pass; all navigation routes verified.

### Risks
- Route ID mismatch preventing a view from loading.

### Rollback
- Restore original `src/App.jsx`.

### Do not do
- Do not change any view ID strings (`'dashboard'`, `'new'`, `'clients'`, etc.).

---

## Phase 34 — Backend Shared Infrastructure (Errors, Logger, Atomic FS)

### Goal
Create reusable backend infrastructure modules in `server/shared/` and `server/config/`.

### Why now
First step in decomposing `server.js` (1,589 lines). Establishes foundational utilities before touching route handlers.

### Scope
Create `server/config/` and `server/shared/`.

### Files affected
- None

### Files created
- `server/config/env.js`
- `server/config/paths.js`
- `server/shared/errors/AppError.js`
- `server/shared/utils/atomicFs.js`
- `server/shared/utils/pathUtils.js`
- `server/shared/middleware/errorHandler.js`
- `server/shared/middleware/requestLogger.js`

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 33

### Actions
1. Declare path constants (`DATA_DIR`, `BILLS_DIR`, etc.) in `paths.js`.
2. Implement `atomicWriteJson` and `sanitizeFilename` in shared utils.
3. Implement centralized `errorHandler` middleware.

### Import updates
- None yet.

### Behavioral constraints
- Path constants must match existing `./data/` directories exactly.

### Verification
- Node syntax check: `node --check server/shared/utils/atomicFs.js`

### Success criteria
- Infrastructure files pass syntax check.

### Risks
- Path resolution errors across OS platforms.

### Rollback
- Delete `server/shared/` and `server/config/`.

### Do not do
- Do not modify `server.js` yet.

---

## Phase 35 — Backend Storage Engine & Data Repositories

### Goal
Implement generic file-store repository classes in `server/infrastructure/storage/`.

### Why now
Provides CRUD data access abstractions for backend domain modules.

### Scope
Create `server/infrastructure/storage/`.

### Files affected
- None

### Files created
- `server/infrastructure/storage/CollectionRepository.js`
- `server/infrastructure/storage/SingleFileRepository.js`
- `server/infrastructure/storage/index.js`

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 34

### Actions
1. Implement `findAll()`, `findById()`, `create()`, `update()`, `delete()`, and `moveToTrash()` using `atomicFs`.
2. Add safe JSON parsing with corrupted file recovery.

### Import updates
- None yet.

### Behavioral constraints
- JSON files on disk must remain in identical format.

### Verification
- Node syntax check: `node --check server/infrastructure/storage/CollectionRepository.js`

### Success criteria
- Syntax check passes.

### Risks
- None.

### Rollback
- Delete `server/infrastructure/storage/`.

### Do not do
- Do not alter existing data file paths.

---

## Phase 36 — Backend Bills & Invoices Module Extraction

### Goal
Extract Bills API routes (`/api/bills`, `/api/bills/:id`) into `server/modules/bills/`.

### Why now
Bills is the core business entity. Decomposing it relieves ~350 lines from `server.js`.

### Scope
Create `server/modules/bills/` and mount router in `server.js`.

### Files affected
- `server.js`

### Files created
- `server/modules/bills/bills.routes.js`
- `server/modules/bills/bills.controller.js`
- `server/modules/bills/bills.service.js`
- `server/modules/bills/bills.repository.js`

### Files moved
- Logic extracted from `server.js`.

### Files modified
- `server.js` (mounts `billsRouter`)

### Dependencies
- Phase 35

### Actions
1. Move bills CRUD handlers into controller and service.
2. Wire routes into `bills.routes.js`.
3. Mount `app.use('/api/bills', billsRouter)` in `server.js`.
4. Run smoke test.

### Import updates
- `server.js` imports `billsRouter`.

### Behavioral constraints
- Request bodies, query params, and responses for `/api/bills` must remain 100% identical.

### Verification
- `node tests/smoke.mjs`

### Success criteria
- Smoke test passes; bill listing and creation work.

### Risks
- Missing request parameters.

### Rollback
- Revert `server.js` and delete `server/modules/bills/`.

### Do not do
- Do not change bill JSON structure.

---

## Phase 37 — Backend Clients & Products Module Extraction

### Goal
Extract Clients and Products APIs (`/api/clients`, `/api/products`) into `server/modules/clients/` and `server/modules/products/`.

### Why now
Continues systematic modularization of core master data entities.

### Scope
Create client and product modules; mount in `server.js`.

### Files affected
- `server.js`

### Files created
- `server/modules/clients/clients.routes.js`
- `server/modules/clients/clients.controller.js`
- `server/modules/products/products.routes.js`
- `server/modules/products/products.controller.js`

### Files moved
- Extracted logic.

### Files modified
- `server.js`

### Dependencies
- Phase 36

### Actions
1. Move client and product CRUD into dedicated controllers.
2. Mount routers in `server.js`.
3. Verify with smoke test.

### Import updates
- `server.js` imports `clientsRouter` and `productsRouter`.

### Behavioral constraints
- API responses remain identical.

### Verification
- `node tests/smoke.mjs`

### Success criteria
- Smoke test passes.

### Risks
- None.

### Rollback
- Revert `server.js`.

### Do not do
- Do not alter client or product ID generation logic.

---

## Phase 38 — Backend Expenses, Purchases & Receipts Module Extraction

### Goal
Extract Expenses, Purchases, and Receipts APIs into `server/modules/expenses/`, `server/modules/purchases/`, and `server/modules/receipts/`.

### Why now
Relieves another ~400 lines from `server.js`.

### Scope
Create modules and mount in `server.js`.

### Files affected
- `server.js`

### Files created
- `server/modules/expenses/expenses.routes.js`
- `server/modules/purchases/purchases.routes.js`
- `server/modules/receipts/receipts.routes.js`

### Files moved
- Extracted logic.

### Files modified
- `server.js`

### Dependencies
- Phase 37

### Actions
1. Move routes and controllers.
2. Mount in `server.js`.

### Import updates
- `server.js` imports new routers.

### Behavioral constraints
- Contract preservation.

### Verification
- `node tests/smoke.mjs`

### Success criteria
- Smoke tests pass.

### Risks
- None.

### Rollback
- Revert `server.js`.

### Do not do
- Do not modify purchase tax calculation.

---

## Phase 39 — Backend Recurring, Profiles & Meta Counters Module Extraction

### Goal
Extract Recurring templates, Profiles, and Meta counter APIs into modular routes.

### Why now
Isolates the background recurring engine and atomic invoice numbering counters.

### Scope
Create modules; move background recurring cron into `server/infrastructure/cron/`.

### Files affected
- `server.js`

### Files created
- `server/modules/recurring/recurring.routes.js`
- `server/modules/profiles/profiles.routes.js`
- `server/modules/meta/meta.routes.js`
- `server/infrastructure/cron/recurringEngine.js`

### Files moved
- Extracted logic.

### Files modified
- `server.js`

### Dependencies
- Phase 38

### Actions
1. Move recurring, profiles, and meta route handlers.
2. Extract recurring interval scheduler into `recurringEngine.js`.
3. Mount routers in `server.js`.

### Import updates
- `server.js` imports new routers.

### Behavioral constraints
- Sequential invoice counter increment must remain atomic and thread-safe.

### Verification
- `node tests/smoke.mjs`

### Success criteria
- Smoke tests pass; invoice counter increments correctly.

### Risks
- Race condition in invoice counter if locking is broken.

### Rollback
- Revert `server.js`.

### Do not do
- Do not change counter key names in `meta.json`.

---

## Phase 40 — Backend Backups, Trash & System Module Extraction (`server/app.js`)

### Goal
Extract Backups, Trash, and System APIs into `server/modules/` and assemble the complete Express app in `server/app.js`.

### Why now
Completes the backend modularization. Reduces root `server.js` to a thin 40-line bootstrapper.

### Scope
Create backup/trash/system modules; create `server/app.js`.

### Files affected
- `server.js`

### Files created
- `server/modules/backups/backups.routes.js`
- `server/modules/trash/trash.routes.js`
- `server/modules/system/system.routes.js`
- `server/infrastructure/backup/backupEngine.js`
- `server/app.js`
- `server/index.js`

### Files moved
- Final logic extracted.

### Files modified
- `server.js` (delegates directly to `server/index.js`)

### Dependencies
- Phase 39

### Actions
1. Extract backup snapshot engine and trash lifecycle routes.
2. Create `server/app.js` assembling all routers and middleware.
3. Create `server/index.js` handling port resolution (`0.0.0.0:3000`) and graceful shutdown.
4. Update `server.js` to import and run `server/index.js`.
5. Run full test suite and smoke runner.

### Import updates
- `server.js` delegates to `server/index.js`.

### Behavioral constraints
- Port negotiation via `data/port.txt` and Vite middleware in development must continue operating without interruption.

### Verification
- `node tests/smoke.mjs && npm run build`

### Success criteria
- App builds; server starts and passes all smoke endpoints.

### Risks
- Port binding conflict or static asset serving mismatch.

### Rollback
- Restore original `server.js`.

### Do not do
- Do not change port binding host (`0.0.0.0`) or default port (`3000`).

---

## Phase 41 — Cross-Stack Integration & API Contract Verification

### Goal
Verify all 44 API endpoints against the centralized frontend API client and confirm full end-to-end data persistence.

### Why now
Both frontend and backend are now modularized. We must verify that all cross-stack communication channels operate flawlessly.

### Scope
Full integration testing across all 11 business entities.

### Files affected
- None

### Files created
- `tests/integration/apiContract.test.mjs`

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 40

### Actions
1. Run automated test asserting each of the 44 endpoints.
2. Test invoice creation, PDF generation, backup generation, and trash restoration.
3. Run statutory tax regression tests.

### Import updates
- None

### Behavioral constraints
- Zero regressions in data persistence or business logic.

### Verification
- `node tests/integration/apiContract.test.mjs && node scripts/tax-test.mjs`

### Success criteria
- All 44 endpoints return valid contracts; 79/79 tax tests pass.

### Risks
- Uncaught 404 on unmounted sub-route.

### Rollback
- Address identified route mismatches.

### Do not do
- Do not skip testing any endpoint.

---

## Phase 42 — Performance Optimization & In-Memory Index Activation

### Goal
Activate in-memory bill index on the backend and optimize client-side bundle splitting for heavy PDF/OCR libraries.

### Why now
Architecture is stable; safe to apply targeted performance optimizations.

### Scope
Update `server/modules/bills/bills.service.js` and `vite.config.js`.

### Files affected
- `server/modules/bills/bills.service.js`, `vite.config.js`

### Files created
- None

### Files moved
- None

### Files modified
- `server/modules/bills/bills.service.js`, `vite.config.js`

### Dependencies
- Phase 41

### Actions
1. Enable `BillIndex` cache in bills service for instant `GET /api/bills` responses.
2. Verify manual chunks in `vite.config.js` (`vendor-react`, `vendor-pdf`, `vendor-icons`).
3. Run build and measure asset sizes.

### Import updates
- None

### Behavioral constraints
- Data consistency guaranteed by invalidating in-memory cache on bill create/update/delete.

### Verification
- `npm run build && node tests/smoke.mjs`

### Success criteria
- `GET /api/bills` response time <10ms; initial bundle size under 350KB.

### Risks
- Cache desynchronization if mutations bypass service.

### Rollback
- Disable cache in bills service.

### Do not do
- Do not apply premature caching to small collections (e.g. templates).

---

## Phase 43 — Security Hardening & Path Traversal Lockdown

### Goal
Apply path sanitization middleware across all file write/delete operations and enforce strict CORS policies.

### Why now
Protects the newly structured storage engine from path traversal attacks.

### Scope
Apply `sanitizeFilename` in controllers and verify CORS whitelist.

### Files affected
- `server/modules/*/*.controller.js`, `server/shared/middleware/cors.js`

### Files created
- None

### Files moved
- None

### Files modified
- Controller files across backend modules.

### Dependencies
- Phase 42

### Actions
1. Wrap all file ID parameters with `sanitizeFilename()`.
2. Reject any ID containing `/`, `\`, or `..`.
3. Test path traversal rejection with negative test cases.

### Import updates
- Controllers import `sanitizeFilename` from `@/server/shared/utils/pathUtils`.

### Behavioral constraints
- Valid alphanumeric IDs with hyphens and underscores must pass without issue.

### Verification
- `node tests/smoke.mjs`

### Success criteria
- All standard operations succeed; malicious path traversal payloads return 400 Bad Request.

### Risks
- Overly strict sanitization rejecting valid invoice serials.

### Rollback
- Adjust regex in `sanitizeFilename`.

### Do not do
- Do not alter existing valid invoice ID formats.

---

## Phase 44 — Direct Import Migration & Facade Deprecation

### Goal
Update all page and feature components to import directly from new target paths, eliminating reliance on legacy facade files.

### Why now
Both sides of the architecture are stable. All facades can now be safely bypassed.

### Scope
Update import statements across `src/pages/` and `src/features/`.

### Files affected
- Files in `src/pages/` and `src/features/`

### Files created
- None

### Files moved
- None

### Files modified
- Multiple components and pages.

### Dependencies
- Phase 43

### Actions
1. Update imports from `src/utils.js` to specific `@/shared/utils/*` or `@/features/invoices/utils/*`.
2. Update imports from `src/store.js` to feature services or `@/services/api`.
3. Update imports from `src/components/*` to `@/shared/components/*` or feature components.
4. Run full production build and test suites.

### Import updates
- Direct imports across all modules.

### Behavioral constraints
- Zero behavioral changes.

### Verification
- `npm run build && node scripts/tax-test.mjs && node scripts/discount-modes-test.mjs && node tests/smoke.mjs`

### Success criteria
- Production build succeeds with zero circular dependency warnings; all tests pass.

### Risks
- Missed import path causing `module not found` at runtime.

### Rollback
- Revert import rewrites.

### Do not do
- Do not delete facade files in this phase yet.

---

## Phase 45 — Legacy Codebase Cleanup & Decommissioning

### Goal
Safely decommission and remove the empty legacy facade files and obsolete scripts.

### Why now
The final phase of refactoring. All consumers import directly from target locations.

### Scope
Delete obsolete legacy facade files listed in `docs/refactor/14-cleanup-plan.md`.

### Files affected
- Legacy files in `src/components/`, `src/utils.js`, `src/store.js`

### Files created
- None

### Files moved
- None

### Files modified
- None

### Dependencies
- Phase 44

### Actions
1. Verify that no files in `src/` or `server/` import from legacy facades.
2. Remove obsolete facade files in `src/components/`.
3. Remove legacy `src/utils.js` and `src/store.js`.
4. Run full production build and test suites.

### Import updates
- None

### Behavioral constraints
- Zero impact on runtime behavior.

### Verification
- `npm run build && node scripts/tax-test.mjs && node scripts/discount-modes-test.mjs && node tests/smoke.mjs`

### Success criteria
- Clean build; zero missing module errors; all 79 tax tests pass.

### Risks
- Undeclared dynamic import of a legacy file.

### Rollback
- Restore deleted facade files.

### Do not do
- Do not delete any files until Phase 44 verification has passed with 100% success.
