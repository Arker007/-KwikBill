# RULES.md — Binding Engineering Rules & Constraints

> **CRITICAL: THESE RULES ARE BINDING ON EVERY TURN AND PROMPT.**  
> Any violation of these rules (especially altering statutory tax math, introducing external databases, or skipping verification gates) is considered a critical architectural failure.

---

## RULE 1: Statutory Financial & Tax Integrity (ZERO TOLERANCE)

1. **Strict Math Quarantine**:
   - Algorithms for statutory tax calculation (GSTIN parsing, state code resolution, intra-UT UTGST routing, RCM back-out, Section 206C(1H) TCS, Section 194Q/51 TDS, 4 discount modes, Budget 2025 income tax slabs, Section 234A/B/C interest, Rule 119A ₹100 rounding) must **NEVER be altered or simplified**.
   - Code must be extracted verbatim into pure typed modules (`taxCalculation.ts`, `itrCalculation.ts`).
2. **Mandatory Test Verification**:
   - Any modification affecting tax, billing, totals, discounts, or financial data MUST immediately run:
     ```bash
     node scripts/tax-test.mjs
     node scripts/discount-modes-test.mjs
     ```
   - **Requirement**: 70/70 tax tests and 9/9 discount tests must PASS. If even 1 test fails, code MUST be reverted or corrected immediately.
3. **Paisa Precision**:
   - Currency math must preserve exact paisa precision (2 decimal places) using `roundCurrency` / `Math.round((val + Number.EPSILON) * 100) / 100`.
   - Never use floating point division without rounding.

---

## RULE 2: Data Persistence & Storage Architecture (ADR-001 & ADR-007)

1. **Local-First Flat-File JSON Storage**:
   - The application relies 100% on flat JSON files in `./data/`.
   - **PROHIBITED**: Do NOT introduce SQLite, PostgreSQL, MySQL, Cloud SQL, Firebase Firestore, MongoDB, or any external database.
2. **Mandatory Atomic Writes (`atomicFs`)**:
   - Every file write to `./data/` must write to a unique temporary file (`.tmp.[random].[pid]`) in the same directory, flush to disk, and atomically rename over the target file.
   - Never use raw `fs.writeFileSync` directly on primary data records.
3. **Safe Parsing & Resilience**:
   - All JSON reads must wrap `JSON.parse` in a `try/catch` block with fallback handling. Corrupt single files must never crash the entire API or list endpoints.
4. **Data Isolation & Backups**:
   - Never delete or truncate user data in `./data/bills/`, `./data/clients/`, etc.
   - Retain daily rolling backups in `./data/backups/`.

---

## RULE 3: Network, Host & Port 3000 Constraints

1. **Port 3000 Exclusivity**:
   - The platform reverse proxy routes external traffic exclusively to **port 3000**.
   - Dev server and production server MUST bind to `0.0.0.0:3000`.
   - Never attempt to read or set alternate ports (3001, 5173, etc.).
2. **Full-Stack Vite Integration**:
   - In development: Express mounts Vite in middleware mode (`vite.middlewares`).
   - In production: Express serves pre-built static assets from `dist/` with SPA fallback.

---

## RULE 4: Feature-Sliced Architecture & Import Rules (ADR-002 & ADR-004)

1. **Downward Dependency Flow**:
   - Allowed: `app → pages → features → shared`.
   - Strictly forbidden: Importing upwards (e.g., `shared` importing from `features` or `pages`).
2. **No Cross-Feature Imports**:
   - `features/invoices` CANNOT import directly from `features/clients` or `features/inventory`.
   - Shared data contracts and utilities belong in `src/shared/`.
   - Cross-feature orchestration is performed by `pages/` or custom hooks.
3. **Domain-Agnostic Shared Layer**:
   - `src/shared/` must be 100% domain-agnostic: no GSTIN validation, no invoice types, no tax rates.
4. **Standard Path Alias**:
   - All imports must use the `@/*` alias pointing to `src/*`. No long relative chains (`../../../../`).

---

## RULE 5: Facade Safety Net During Refactoring (ADR-002)

1. **Zero-Breakage Migrations**:
   - When moving components or utilities out of `src/components/`, `src/utils.js`, or `src/store.js`, the original file MUST remain as a re-export facade:
     ```javascript
     // src/components/Clients.jsx (Facade)
     export { ClientsView as default } from '@/features/clients/components/ClientsView';
     ```
2. **Backward Compatibility**:
   - Unmigrated views and automated scripts must continue functioning seamlessly at every commit.
   - Decommissioning legacy facades is strictly reserved for Phase 45.

---

## RULE 6: Backend 4-Layer Separation & Security (ADR-006)

1. **Four Architectural Layers**:
   - `Route`: HTTP method, path declaration, parameter validation middleware.
   - `Controller`: Request extraction, calling service, HTTP status response.
   - `Service`: Business logic, validation, orchestration.
   - `Repository`: Collection read/write operations via Storage Engine.
2. **Path Traversal Defense (MANDATORY)**:
   - All filename and ID parameters (`req.params.id`, `req.query.file`, etc.) MUST be strictly sanitized:
     - Apply `path.basename()`.
     - Reject strings containing `..`, `/`, `\`, null bytes, or characters outside `[a-zA-Z0-9_-]`.
     - Return HTTP 400 immediately on malformed identifiers.

---

## RULE 7: State Management & React Lifecycle (ADR-005)

1. **Eliminate DOM Event Bus**:
   - Untyped `window.dispatchEvent(new CustomEvent(...))` and `window.addEventListener(...)` must be systematically replaced by typed custom hooks (`useBills()`, `useClients()`, etc.).
2. **No Infinite Re-renders**:
   - Never update state directly in the component body.
   - Never place unmemoized objects, arrays, or functions in `useEffect` dependency arrays.
   - Prefer primitive strings, numbers, and booleans in dependency arrays.
3. **Component File Size Limit**:
   - No single file should exceed **300 lines of code**. Split large forms, tables, and dialogs into dedicated sub-components.

---

## RULE 8: UI, Design System & Accessibility Rules

1. **Anti-Slop Visual Quality**:
   - NO purple-to-blue gradients.
   - NO cyan-on-dark text or neon glow drop-shadows.
   - NO generic 3-column marketing feature cards.
   - Card border-radius capped at 12–16px (pills reserved for badges/buttons).
2. **Theme Parity**:
   - Every view must support both Light and Dark themes via `[data-theme]` on `<html>`.
   - Never use hardcoded colors that become invisible in dark mode.
3. **Print & Thermal POS Fidelity**:
   - A4 print styles must produce crisp vector borders without extra blank pages or clipped margins.
   - Thermal POS receipts (58mm / 80mm) must use valid monospace alignment.
4. **Unique HTML ID Attributes**:
   - All meaningful interactive elements (buttons, inputs, select dropdowns, modals) must possess a unique `id` attribute.
5. **Touch & Click Standards**:
   - Minimum 44px touch targets on mobile viewports.
   - Hover states for all clickable controls on desktop.
   - File uploads must support both drag-and-drop and click-to-browse.

---

## RULE 9: Verification Gates (MANDATORY AFTER EVERY CODE EDIT)

Before concluding any turn or declaring a task complete, you MUST execute and confirm:

1. **Statutory Tax Suite**:
   ```bash
   node scripts/tax-test.mjs
   # Result must be: Passed: 70, Failed: 0
   ```
2. **Discount Calculation Suite**:
   ```bash
   node scripts/discount-modes-test.mjs
   # Result must be: Passed: 9, Failed: 0
   ```
3. **Application Build Compilation**:
   - Must run `compile_applet` tool and confirm `Build succeeded`.
4. **Progress Tracker Alignment**:
   - `docs/refactor/19-refactor-progress.md` must be kept in sync with actual phase states.

---

## RULE 10: Mandatory Automatic Documentation Synchronization (.md Files)

Every prompt that modifies code, file paths, endpoints, architecture, or schemas **MUST** automatically update all relevant markdown (`.md`) documentation files before concluding the turn:

1. **Phase Progress (`docs/refactor/19-refactor-progress.md`)**:
   - Must be updated on any phase transition (`NOT STARTED` → `IN PROGRESS` → `COMPLETED`).
   - Must log the completion timestamp and the exact verification commands executed.
2. **Project File Tree (`docs/refactor/18-final-target-tree.md`)**:
   - Whenever any new file or directory is created, moved, or deleted, the canonical tree in `18-final-target-tree.md` must be updated immediately.
3. **Architecture Decisions (`docs/refactor/20-decisions-log.md`)**:
   - Any architectural decision, structural pivot, or library addition must be recorded as an Architecture Decision Record (`ADR-00X`) with Context, Decision, Reason, Alternatives, and Tradeoffs.
4. **File Migration Map (`docs/refactor/04-file-migration-map.md`)**:
   - Mark legacy source files as `MIGRATED` or `FACADE CREATED` when extractions take place.
5. **Domain Plan Documents (`docs/refactor/05` through `14-*.md`)**:
   - If an implementation refines an API route, storage schema, design token, or security boundary, the corresponding domain plan document must reflect the latest reality.
6. **Project Changelog (`CHANGELOG.md`)**:
   - Record newly implemented features, bug fixes, or refactoring milestones under the `[Unreleased]` section.
7. **User-Facing Documentation (`README.md`)**:
   - Keep installation commands, feature lists, and environment configuration aligned with codebase changes.

---

## RULE 11: Mandatory Post-Prompt Checklist

After EVERY prompt, the assistant must mentally audit:

- [ ] Did any statutory tax or financial calculation change? (If yes, verify it matches tests 100%).
- [ ] Did `scripts/tax-test.mjs` pass (70/70)?
- [ ] Did `scripts/discount-modes-test.mjs` pass (9/9)?
- [ ] Did `compile_applet` build successfully with zero errors?
- [ ] Are all new imports using `@/*` path alias?
- [ ] Were existing legacy files preserved as facades rather than abruptly deleted?
- [ ] Is data in `./data/` completely intact with no corrupted records?
- [ ] Does Express still bind to `0.0.0.0:3000`?
- [ ] Are all relevant `.md` documentation files (`docs/refactor/19-refactor-progress.md`, `18-final-target-tree.md`, `20-decisions-log.md`, `CHANGELOG.md`) fully updated?
