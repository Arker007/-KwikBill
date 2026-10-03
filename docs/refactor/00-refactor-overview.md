# 00 — Refactoring Overview & Architectural Assessment

## 1. Executive Summary

This document presents a comprehensive, production-grade refactoring blueprint for **Free GST Billing Software**, an open-source, local-first web application designed for Indian GST invoicing, multi-currency billing, GSTR-1/3B/2B reconciliation, and financial tracking.

The application is built as a single-repository full-stack system comprising:
- A client-side React 19 SPA powered by Vite
- A Node.js Express backend serving REST APIs and managing local JSON flat-file storage
- Offline capabilities supported by a custom Progressive Web App (PWA) service worker
- Client-side OCR via bundled WebAssembly Tesseract.js
- Local client-side and server-side PDF generation via jsPDF and html2canvas

While functionally rich and legally compliant with Indian Tax regulations (including Budget 2025 slabs, e-Way bill rules, and UTGST allocations), the codebase suffers from severe architectural erosion typical of rapid organic feature development.

---

## 2. Current Architectural Style

- **Frontend Pattern**: Monolithic Component Architecture (MCA) paired with an unbundled "God Store" pattern (`src/store.js`) and heavy imperative DOM manipulation.
- **Backend Pattern**: Monolithic Script Architecture (single `server.js` file spanning ~1,600 lines containing routing, validation, transaction handling, filesystem I/O, background recurring workers, and static serving).
- **Persistence Pattern**: Flat-file JSON store inside `./data/` using synchronous read/atomic write techniques with ad-hoc in-memory mutations.
- **State Management Pattern**: Fragmented across `localStorage`, custom DOM events (`window.dispatchEvent(new CustomEvent(...))`), component-local useState, and unmemoized prop drilling (up to 7 levels deep).

---

## 3. Major Architectural Deficiencies

1. **Massive God Files**:
   - `src/components/InvoiceGenerator.jsx` (4,146 lines): Bundles UI form rendering, item line calculations, barcode scanning, client modal logic, payment allocations, e-Way JSON generation, thermal printing, and PDF composition.
   - `src/components/GSTReturns.jsx` (2,283 lines): Bundles GSTR-1, GSTR-3B, GSTR-2B JSON reconciliation, CSV parsing, filing diff algorithms, and multi-tab rendering.
   - `src/components/SettingsView.jsx` (2,068 lines): Mixes profile configuration, bank account settings, multi-currency preferences, thermal printer margins, data import/export, cloud backup credentials, and software update checks.
   - `src/utils.js` (1,727 lines): Blends tax calculation engines, currency words converters, date manipulation, GSTIN checksum validators, and canvas-to-PDF drivers.
   - `server.js` (1,589 lines): A single file housing 44 API routes, recursive directory synchronization, daily backup routines, trash lifecycles, and a scheduled recurring invoice processor.

2. **Hidden Circular & Bidirectional Coupling**:
   - `InvoiceGenerator.jsx` statically imports `InvoicePreview.jsx`, while `InvoicePreview.jsx` dynamically pulls formatting routines and print settings defined inside generator subtrees.
   - `Dashboard.jsx` dynamically imports `react-dom/client` and `InvoicePreview.jsx` directly to render hidden iframe print jobs, triggering Vite bundle warnings.

3. **Inconsistent State & API Layer**:
   - No structured API client abstraction. Components alternate between `apiFetch` in `src/store.js`, raw `fetch('/api/...')` with unstandardized error handling, and silent `.catch(err => console.warn(err))` suppressions.
   - State synchronization between views relies on manual event buses (`window.addEventListener('bill-saved')`), resulting in memory leak risks and missed updates.

4. **Monolithic Styling Without Tokenization**:
   - `src/index.css` is a 1,000+ line stylesheet that blends modern CSS custom properties with legacy overrides, hardcoded pixel breakpoints, duplicated `.btn` declarations, and fragile print media overrides.

5. **Lack of Automated Test Coverage for UI and API**:
   - While mathematical regression scripts exist in `scripts/tax-test.mjs` and `scripts/discount-modes-test.mjs` (passing 79 tests), there are zero automated integration tests for Express routes, zero React component unit tests, and the existing `tests/smoke.mjs` is broken due to an uninstalled Playwright dependency.

---

## 4. Target Architectural Style

The target architecture is a **Modular Feature-Sliced Architecture (FSA)** for the frontend coupled with a **Layered Domain-Driven Modular Monolith** for the Express backend.

### Target Frontend Structure:
```
src/
├── app/                  # Application bootstrap, routing, providers, layouts
├── pages/                # Route/view level composition
├── features/             # Business domain modules (invoices, clients, products, etc.)
│   └── [feature-name]/
│       ├── components/   # Feature-specific UI
│       ├── hooks/        # Feature-specific hooks
│       ├── services/     # Feature API calls
│       ├── store/        # Feature state
│       ├── types/        # TypeScript declarations
│       └── utils/        # Feature-pure helpers
├── shared/               # Reusable UI primitives, hooks, utilities (domain-agnostic)
│   ├── components/       # Design system primitives (Button, Modal, Input, Table)
│   ├── hooks/            # Generic hooks (useDebounce, useLocalStorage, useHotkeys)
│   ├── utils/            # General helpers (formatters, validators)
│   └── types/            # Global/base types
├── services/             # Core HTTP client, offline sync, PWA service
├── store/                # Truly global cross-feature state (profiles, currency, theme)
└── styles/               # Design tokens, themes, reset, utilities
```

### Target Backend Structure:
```
server/
├── app.js                # Express app configuration and middleware assembly
├── index.js              # Server entry point, port binding, graceful shutdown
├── config/               # Environment, directory paths, limits, constants
├── modules/              # Domain modules
│   └── [module-name]/
│       ├── [name].routes.js
│       ├── [name].controller.js
│       ├── [name].service.js
│       ├── [name].repository.js
│       └── [name].schema.js
├── shared/               # Middleware, error handlers, logger, file utils
└── infrastructure/       # Filesystem storage engine, backup scheduler, lock manager
```

---

## 5. Migration Strategy & Principles

1. **Zero Downtime & Behavior Preservation**: The application must remain executable, buildable, and test-passing at every single phase.
2. **Move → Retarget → Verify → Commit**: Never rewrite and relocate simultaneously. First move modules into target boundaries, update relative import paths, verify with `compile_applet` and test runners, and only then refactor internal logic.
3. **Outside-In Decoupling**: Extract pure utility leaves (`utils/hsnRates.js`, math engines) first, establish shared design primitives second, extract domain features third, isolate the API layer fourth, and split the backend server last.
4. **Preserve Mathematical Regression Baseline**: All 79 test cases in `scripts/tax-test.mjs` and `scripts/discount-modes-test.mjs` must run and pass green at every phase involving calculation logic.

---

## 6. Architectural Complexity & Risk Classification

- **Overall Complexity**: **High** (~28,700 lines of functional JavaScript/JSX with dense business logic).
- **Highest-Risk Areas**:
  1. `src/utils.js` (`computeInvoiceTotals`): Changes here can invalidate statutory GST, cess, reverse charge (RCM), and discount calculations across all saved bills.
  2. `server.js` File I/O & Backup Engines: Risk of data loss or file corruption in `./data/bills/*.json` if atomic write semantics (`safeWriteFile`) are disrupted.
  3. `InvoiceGenerator.jsx` Decomposition: High risk of subtle state desynchronization between item tables, tax summary cards, and live print preview.
  4. PWA Service Worker & Cache Invalidation: Stale client-side caches can lead to asset hash mismatches and blank screens on redeploy.

---

## 7. Areas That Should NOT Be Changed Initially

1. **Flat-File JSON Storage Format**: Do NOT migrate from JSON files to SQLite, PostgreSQL, or MongoDB in early phases. The directory structure (`data/bills`, `data/clients`, etc.) and payload schemas must remain 100% backward-compatible.
2. **Statutory Tax Algorithms**: Mathematical code in `computeInvoiceTotals` and `src/utils/itr.js` must not be rewritten for style; only modularized and wrapped in strict TypeScript interfaces.
3. **Native Desktop / PWA Launch Scripts**: The root `.bat` scripts, `data/port.txt` negotiation mechanism, and local launcher must be preserved as-is.

---

## 8. Recommended Execution Flow

The migration is partitioned into **45 sequential phases** across 7 macro-stages:
1. **Phases 01–06**: Foundations, Aliases, Build Verification, and Shared Base Types
2. **Phases 07–12**: Shared Design System Primitives & Global Styles Tokenization
3. **Phases 13–18**: Core Domain Logic Isolation (Tax, Formatting, Validation, Print)
4. **Phases 19–27**: Frontend Feature Extraction (Invoices, Clients, GST Returns, Settings, etc.)
5. **Phases 28–32**: State Management & API Client Centralization
6. **Phases 33–40**: Backend Layering (Config, Infrastructure, Controllers, Services, Repositories)
7. **Phases 41–45**: Verification, Performance Optimization, Dead Code Removal, and Final Audit
