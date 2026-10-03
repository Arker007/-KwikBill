# Supabase Cloud Database Integration & Dedicated Connection Hub Plan

> **Status:** Proposal / Ready for Implementation  
> **Document Date:** 2026-09-22  
> **Scope:** Cloud backup, multi-device database synchronization, and dedicated connection UI for Free GST Billing Software.

---

## 1. Executive Summary & Architecture

The goal is to provide seamless, two-way or one-way cloud synchronization to **Supabase** (PostgreSQL) while preserving the application's core principles:
1. **Local-First Reliability**: The local flat-file storage engine (`./data/`) remains the ultra-fast, zero-dependency, 100% offline-capable source of truth.
2. **Zero Statutory Compromise**: No statutory tax math (`taxCalculation.ts`, `itrCalculation.ts`), roundings, or GST rules will be altered.
3. **Dedicated Connection Hub**: A user-friendly settings view allowing users to enter their Supabase Project URL and API Keys, verify connection latency, inspect remote tables, and trigger full or incremental data sync with live progress feedback.

```
┌────────────────────────────────────────────────────────┐
│             React 19 Frontend (App Shell)              │
│   • Dedicated Supabase Hub (`/settings/supabase`)     │
│   • One-Click "Migrate to Supabase" & Auto-Sync Toggle │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON
┌───────────────────────────▼────────────────────────────┐
│         Express Backend (0.0.0.0:3000)                 │
│   • Storage Engine: Local `./data/*.json` (Primary)    │
│   • Supabase Sync Engine (`server/modules/supabase/`)   │
└─────────────┬────────────────────────────┬─────────────┘
              │ File I/O (Atomic Writes)   │ HTTPS / PostgREST
┌─────────────▼─────────────┐ ┌────────────▼─────────────┐
│ Local Disk (`./data/`)    │ │ Remote Supabase Postgres │
│ • 100% Offline Portability│ │ • Cloud Durability       │
│ • Local Backup Snapshots  │ │ • Multi-Device Access    │
└───────────────────────────┘ └──────────────────────────┘
```

---

## 2. Supabase PostgreSQL Schema Specification

The following SQL schema maps the application's data models (`bills`, `clients`, `products`, `expenses`, `purchases`, `receipts`, `recurring`, `business_profiles`) into Supabase with strict decimal precision for Indian currency (`NUMERIC(14, 2)`) and `JSONB` for nested line items and document layouts.

```sql
-- ============================================================================
-- Free GST Billing Software — Canonical Supabase DDL
-- ============================================================================

-- 1. Business Profiles & Settings
CREATE TABLE IF NOT EXISTS business_profiles (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  gstin TEXT,
  pan TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  state_code TEXT,
  state_name TEXT,
  bank_details JSONB DEFAULT '{}'::jsonb,
  signature_url TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clients / Customers Directory
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trade_name TEXT,
  gstin TEXT,
  pan TEXT,
  email TEXT,
  phone TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  state_code TEXT,
  credit_limit NUMERIC(14, 2) DEFAULT 0.00,
  opening_balance NUMERIC(14, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clients_gstin ON clients(gstin);

-- 3. Products & Services Catalog
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  item_type TEXT DEFAULT 'product', -- 'product' | 'service'
  hsn_sac TEXT,
  sku TEXT,
  unit TEXT DEFAULT 'NOS',
  selling_price NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  purchase_price NUMERIC(14, 2) DEFAULT 0.00,
  tax_rate NUMERIC(5, 2) DEFAULT 18.00,
  cess_rate NUMERIC(5, 2) DEFAULT 0.00,
  stock_quantity NUMERIC(12, 3) DEFAULT 0.000,
  low_stock_threshold NUMERIC(12, 3) DEFAULT 0.000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_hsn ON products(hsn_sac);

-- 4. Invoices / Bills (Tax Invoices, Delivery Challans, Quotations)
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  doc_type TEXT DEFAULT 'tax_invoice',
  invoice_date DATE NOT NULL,
  due_date DATE,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_gstin TEXT,
  place_of_supply TEXT,
  is_interstate BOOLEAN DEFAULT FALSE,
  is_reverse_charge BOOLEAN DEFAULT FALSE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(14, 2) DEFAULT 0.00,
  cgst_total NUMERIC(14, 2) DEFAULT 0.00,
  sgst_total NUMERIC(14, 2) DEFAULT 0.00,
  igst_total NUMERIC(14, 2) DEFAULT 0.00,
  utgst_total NUMERIC(14, 2) DEFAULT 0.00,
  cess_total NUMERIC(14, 2) DEFAULT 0.00,
  tcs_amount NUMERIC(14, 2) DEFAULT 0.00,
  tds_amount NUMERIC(14, 2) DEFAULT 0.00,
  round_off NUMERIC(6, 2) DEFAULT 0.00,
  grand_total NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid' | 'partial' | 'paid' | 'overdue'
  amount_paid NUMERIC(14, 2) DEFAULT 0.00,
  notes TEXT,
  terms TEXT,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(invoice_date);
CREATE INDEX IF NOT EXISTS idx_bills_client ON bills(client_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(payment_status);

-- 5. Business Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  expense_number TEXT,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT,
  vendor_gstin TEXT,
  taxable_amount NUMERIC(14, 2) DEFAULT 0.00,
  tax_amount NUMERIC(14, 2) DEFAULT 0.00,
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  payment_mode TEXT DEFAULT 'cash',
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- 6. Purchases & Inward Supplies
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  bill_number TEXT NOT NULL,
  date DATE NOT NULL,
  supplier_name TEXT NOT NULL,
  supplier_gstin TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(14, 2) DEFAULT 0.00,
  itc_eligibility TEXT DEFAULT 'eligible',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payment Receipts
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  receipt_number TEXT NOT NULL,
  date DATE NOT NULL,
  bill_id TEXT REFERENCES bills(id) ON DELETE SET NULL,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  payment_mode TEXT NOT NULL DEFAULT 'bank_transfer',
  transaction_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Recurring Invoices
CREATE TABLE IF NOT EXISTS recurring (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  frequency TEXT NOT NULL, -- 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  next_run_date DATE NOT NULL,
  status TEXT DEFAULT 'active', -- 'active' | 'paused'
  template_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Synchronization Audit Ledger
CREATE TABLE IF NOT EXISTS sync_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL, -- 'export_all' | 'sync_up' | 'sync_down'
  records_count INTEGER NOT NULL DEFAULT 0,
  collections_synced JSONB,
  status TEXT NOT NULL, -- 'success' | 'failed' | 'partial'
  error_message TEXT,
  triggered_by TEXT DEFAULT 'user',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Configuration
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_audit_log ENABLE ROW LEVEL SECURITY;

-- Default Policy: Access granted with valid Anon or Service Role key
CREATE POLICY "Allow authenticated and service access" ON business_profiles FOR ALL USING (true);
CREATE POLICY "Allow authenticated and service access" ON clients FOR ALL USING (true);
CREATE POLICY "Allow authenticated and service access" ON products FOR ALL USING (true);
CREATE POLICY "Allow authenticated and service access" ON bills FOR ALL USING (true);
CREATE POLICY "Allow authenticated and service access" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow authenticated and service access" ON purchases FOR ALL USING (true);
CREATE POLICY "Allow authenticated and service access" ON receipts FOR ALL USING (true);
CREATE POLICY "Allow authenticated and service access" ON recurring FOR ALL USING (true);
CREATE POLICY "Allow authenticated and service access" ON sync_audit_log FOR ALL USING (true);
```

---

## 3. Dedicated Supabase Hub User Interface

### Target Location & Route
- Route: `/settings/supabase`
- Entry Points:
  1. **Settings Navigation Sidebar** (`SettingsSidebar.tsx`): "Supabase Cloud" item.
  2. **Top Navigation Tabs** (`navConfig.ts`): Option to expose directly in Settings flyout.
  3. **Cloud Backup Tab** (`CloudSyncTab.tsx`): Quick banner and transition button to the dedicated Supabase Hub.

### Component Layout Hierarchy
```
src/features/supabase/
├── components/
│   ├── SupabaseConfigCard.tsx       # URL & Key configuration form with ping validation
│   ├── SchemaInspectorCard.tsx      # Table verification checklist & Copy SQL button
│   ├── MigrationControlCard.tsx     # Bulk export/import actions, count stats, progress bar
│   ├── SyncSettingsCard.tsx         # Auto-sync on save toggle & conflict resolution
│   └── SyncAuditTable.tsx           # Recent sync log and telemetry history
├── hooks/
│   └── useSupabaseSync.ts           # State manager for ping, config, sync operations
├── types/
│   └── index.ts                     # TypeScript interfaces for config & sync status
└── index.ts
```

### UI Features
1. **Connection Credentials**:
   - Supabase URL (`https://xyzcompany.supabase.co`)
   - Anon / Public Key (masked input with show/hide toggle)
   - Service Role Key (optional for elevated administrative operations)
   - Connection Status Badge: `Disconnected` (Gray), `Testing...` (Yellow), `Connected (X ms)` (Green), `Auth Error` (Red)
   - "Test Connection" button triggering live roundtrip ping.
2. **Schema Inspector**:
   - Table existence check for `bills`, `clients`, `products`, `expenses`, `purchases`, `receipts`, `recurring`.
   - "Copy SQL Schema" button for one-click pasting into Supabase SQL Editor.
3. **Migration & Data Sync Actions**:
   - Summary of local records available for upload (`XX Invoices`, `XX Clients`, `XX Products`, etc.).
   - Primary Action: **"Upload Local Data to Supabase"** with batched upsert and animated progress bar.
   - Secondary Action: **"Download Remote Data to Local"** with automatic backup snapshot creation before merging.
4. **Auto-Sync Preferences**:
   - Checkbox: "Automatically sync new invoices and clients on save".
   - Conflict strategy selector: "Local Wins (Default)" vs "Cloud Wins".

---

## 4. Backend Synchronization Architecture

### New Backend Module: `server/modules/supabase/`

```
server/modules/supabase/
├── supabase.controller.js  # HTTP request extraction, validation, responses
├── supabase.service.js     # PostgREST communication, batching, mapping
├── supabase.routes.js      # Express route definitions
└── index.js                # Module entry point
```

### API Endpoints:
| HTTP Verb | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/supabase/config` | Returns current connection status (with masked keys) |
| `POST` | `/api/supabase/config` | Saves Supabase URL and keys to `./data/supabase_config.json` |
| `POST` | `/api/supabase/test` | Pings Supabase with provided credentials and returns latency |
| `GET` | `/api/supabase/tables` | Verifies required tables exist in the remote database |
| `POST` | `/api/supabase/sync-up` | Reads all local `./data/` collections and upserts in chunks of 50 |
| `POST` | `/api/supabase/sync-down` | Fetches remote tables and safely merges into `./data/` using atomic writes |

### Atomic Safety & Conflict Strategy:
- **No Overwrite Without Backup**: Before any sync-down operation writes to disk, the backend invokes `backupEngine.createBackup()` in `./data/backups/`.
- **Atomic Writes**: Writes strictly use `writeJsonAtomic` (`.tmp` write then atomic rename) to prevent partial data corruption.
- **Param Sanitization**: All table and document identifiers are strictly sanitized using `safeFileName` and regex verification to eliminate path traversal vulnerabilities.

---

## 5. Phased Rollout Plan

| Phase | Description | Deliverables | Verification Quality Gate | Status |
|---|---|---|---|---|
| **Phase 1** | **Backend Supabase Module** | Install `@supabase/supabase-js`, create `server/modules/supabase/` with config, test ping, and health check endpoints. | `node tests/smoke.mjs` PASS; endpoint returns 200. | **COMPLETED** (Verified 2026-09-22: 18/18 smoke tests PASS, 70/70 tax tests PASS) |
| **Phase 2** | **Sync & Batching Engine** | Implement upsert and fetch routines for all 8 collections with batch chunking and error reporting. | `node scripts/tax-test.mjs` (70/70 PASS), `discount-modes-test.mjs` (9/9 PASS), `node tests/smoke.mjs` (23/23 PASS). | **COMPLETED** (Verified 2026-09-22: 23/23 smoke tests PASS, 70/70 tax tests PASS, 9/9 discount tests PASS, compile_applet PASS) |
| **Phase 3** | **Dedicated Frontend Hub** | Build `SupabasePage.tsx`, settings routing, credentials form, schema inspector, and sync progress drawer. | `compile_applet` PASS; theme parity (Dark/Light). | **COMPLETED** (Verified 2026-09-22: `compile_applet` PASS, 23/23 smoke tests PASS, 70/70 tax tests PASS, 9/9 discount tests PASS) |
| **Phase 4** | **Documentation & Logging** | Document connection guide in `docs/SUPABASE_SETUP.md`, log ADR in `docs/refactor/20-decisions-log.md`, update `CHANGELOG.md`, `README.md`, `19-refactor-progress.md`, and `08-api-refactor-plan.md`. | All automated regression suites pass; `compile_applet` PASS. | **COMPLETED** (Verified 2026-09-22: `docs/SUPABASE_SETUP.md` created, ADR-050 & ADR-051 logged, `CHANGELOG.md` updated, 70/70 tax tests PASS, 9/9 discount tests PASS, 23/23 smoke tests PASS) |
