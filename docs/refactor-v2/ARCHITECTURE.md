# Target Architecture Specification

> **Superseded storage note (2026-09-30):** The SQLite-primary portions of this V2 proposal are historical. The binding project rules and ADR-086 keep flat-file JSON as the canonical runtime persistence format. SQLite adapters remain disabled compatibility tooling only.

## 1. Directory Boundaries & Monorepo Topology
```
apps/
  web/                  # React 19 + Vite frontend application
  api/                  # Express HTTP backend service (binds 0.0.0.0:3000)
packages/
  financial-core/       # Pure statutory tax, income-tax & rounding math
  api-contracts/        # Canonical DTOs, endpoint schemas & TypeScript types
  api-client/           # Strongly-typed HTTP client SDK
  ui/                   # Tailwind design tokens, Ant Design wrappers & UI primitives
  document-renderer/    # PDF generator, thermal POS engine & print templates
  config/               # Shared ESLint, TypeScript & Tailwind configurations
database/
  schema/               # Canonical SQLite DDL schemas (WAL mode)
  migrations/           # Versioned SQLite schema migrations
  seeds/                # Default master data & test profiles
  fixtures/             # Fixed datasets for test reproducibility
data/
  bills/                # Primary JSON invoice records
  clients/              # Primary JSON client records
  backups/              # Rolling snapshots and pre-migration backups
  uploads/              # User logos and signature assets
  exports/              # Generated reports and data exports
tests/
  e2e/                  # End-to-end smoke and UI tests
  contract/             # API payload and contract validation
  migration/            # JSON-to-SQLite parity verification
  security/             # Path traversal and input sanitization tests
  performance/          # Storage latency and query benchmarks
```

## 2. Domain Ownership & Boundaries
- **identity**: User profiles, credentials, RBAC permissions, session state.
- **organization**: Business entities, GSTIN, PAN, addresses, bank accounts, UPI.
- **customers**: Client directory, customer master, credit ledgers, statement generation.
- **catalog**: Master product catalog, HSN/SAC classifications, default tax rates.
- **inventory**: Real-time stock levels, stock movement transactions, low-stock alerts.
- **invoicing**: Tax invoices, delivery challans, credit/debit notes, atomic invoice counters.
- **recurring-billing**: Automated subscription schedules, recurring templates, cron runner.
- **purchasing**: Vendor bills, purchase orders, client-side Tesseract OCR bill parsing.
- **expenses**: Operational expense tracking, category taxonomy, statutory ITC tax routing.
- **payments**: Receipts, payment allocations, cash/bank vouchers, payment gateway links.
- **taxation**: GSTR-1, GSTR-3B, GSTR-2B reconciliation, Section 51/194Q TDS, Section 206C(1H) TCS, Budget 2025 Income Tax calculations (§111A/§112A, §44AD/ADA/AE, §234A/B/C).
- **reporting**: P&L, balance sheets, sales analytics, aging reports, product performance.
- **documents**: Print templates, custom terms, authorized signatures, letterheads.
- **integrations**: Optional Supabase cloud synchronization, Google Drive backup, Tally export.
- **data-management**: Backup snapshots, JSON export/import, data cleanup.
- **help**: Local user guide, interactive setup wizard, keyboard shortcut guide.

## 3. Layering & Allowed Import Directions
```
apps/web (UI Layer)
  ↓ imports from
packages/ui, packages/financial-core, packages/api-client, packages/api-contracts, packages/document-renderer

apps/api (Backend API Layer)
  ↓ imports from
packages/financial-core, packages/api-contracts

Domain Rules:
- Downward dependency only: apps → packages. Packages never import from apps.
- No cross-domain private imports: domains expose an explicit public `index.ts` barrel.
- Domain business logic MUST NOT import Express, SQLite, DOM APIs, or filesystem primitives.
- Backend modules follow 4-layer separation: Route → Controller → Service → Repository.
```

## 4. Non-Negotiable Invariants
1. **Statutory Tax Math Quarantine**: Tax algorithms in `packages/financial-core` must NEVER be altered. All 70 tax tests and 9 discount tests must pass with zero failures at all times.
2. **Offline-First Zero-Configuration Storage**: Persistent storage uses portable flat-file JSON records under `./data/`; no database server or embedded database is required.
3. **Port 3000 Exclusivity**: All external routing targets `0.0.0.0:3000`. In development, Express mounts Vite middleware. In production, Express serves static assets with SPA fallback.
4. **Paisa Precision**: Monetary figures are computed and stored as integer Paisa (`1 INR = 100 Paisa`) to prevent floating-point drift.
5. **Path Traversal Security**: All filesystem and ID access parameters must pass strict basename sanitization rejecting `..`, `/`, `\`, and null bytes.
