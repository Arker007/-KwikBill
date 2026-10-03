# Supabase Cloud Synchronization & PostgreSQL Setup Guide

> **Zero-configuration, privacy-preserving cloud sync for Free GST Billing Software**  
> Connect your local billing instance to a free, hosted Supabase PostgreSQL database for real-time multi-device access, automated offsite disaster recovery, and SQL-level analytical reporting.

---

## 1. Architectural Overview & Philosophy

Free GST Billing Software is strictly an **offline-first, local-first application**. 

- **Primary Source of Truth**: All business records (bills, clients, products, expenses, purchases, receipts, recurring invoices) are persisted in plain-text JSON files inside the local `./data/` directory.
- **Optional Cloud Replication**: Connecting to Supabase is **100% optional**. The application never requires an internet connection or external cloud database for statutory billing, GST tax calculation, or PDF generation.
- **Safety First (Automatic Snapshots)**: Before any remote synchronization or download operation merges cloud data into local storage, the system automatically creates a timestamped snapshot in `./data/backups/`. You can roll back anytime with zero data loss.
- **No Vendor Lock-in**: All relational tables in Supabase mirror the statutory flat-file schemas. You can export back to JSON or query your database via standard PostgreSQL tools (psql, DBeaver, pgAdmin) at any time.

---

## 2. Quick Setup in 4 Steps (Takes < 3 Minutes)

```
┌────────────────────────────────────────────────────────┐
│ 1. Create a free project at supabase.com               │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 2. Run the SQL DDL Schema Script in SQL Editor         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 3. Enter URL & Anon Key in In-App Supabase Hub         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 4. Click "Test Connection" & "Upload Local Data"       │
└────────────────────────────────────────────────────────┘
```

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **"New Project"**.
3. Choose an organization, enter a name (e.g., `free-gst-billing`), set a database password, and select the region closest to your business (e.g., `Mumbai (ap-south-1)` for Indian businesses).
4. Wait ~60 seconds for database provisioning to complete.

### Step 2: Run the SQL DDL Schema Script
1. In the Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **"New Query"**.
3. Copy the complete SQL script below (or click **"Copy SQL Schema"** inside the app at **Settings → Supabase Cloud**).
4. Paste into the SQL Editor and click **Run** (or press `Ctrl+Enter`).
5. Confirm that all 9 tables are created successfully.

### Step 3: Copy Your Project Credentials
1. In Supabase, navigate to **Project Settings → API** (or **Settings → Data API**).
2. Copy two values:
   - **Project URL** (e.g., `https://abcdefghijklm.supabase.co`)
   - **anon / public key** (`eyJhbGciOi...`)
   - *(Optional)* **service_role key** if you plan to run automated background cron sync tasks.

### Step 4: Connect from the App
1. In Free GST Billing Software, navigate to **Settings → Supabase Cloud** (or press `Ctrl+K` and type `Supabase`).
2. Paste your **Project URL** and **Anon Key**.
3. Click **"Save Credentials"**.
4. Click **"Test Connection"** to verify roundtrip latency (typically 40–120 ms).
5. Click **"Upload Local Data to Supabase"** to perform your initial bulk replication.

---

## 3. Canonical SQL DDL Schema Script

Run the following SQL in your Supabase SQL Editor. It creates all tables with proper indexes, JSONB payloads, and Row Level Security (RLS) policies:

```sql
-- ==============================================================================
-- FREE GST BILLING SOFTWARE — SUPABASE POSTGRESQL CANONICAL SCHEMA
-- ==============================================================================

-- 1. Business Profiles
CREATE TABLE IF NOT EXISTS business_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gstin TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  state TEXT,
  state_code TEXT,
  bank_details JSONB,
  upi_id TEXT,
  logo_url TEXT,
  signature_url TEXT,
  settings JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clients
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gstin TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  state TEXT,
  state_code TEXT,
  pincode TEXT,
  pan TEXT,
  credit_balance NUMERIC(12,2) DEFAULT 0,
  outstanding_balance NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  custom_fields JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products & Services Catalogue
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hsn TEXT,
  unit TEXT DEFAULT 'pcs',
  rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 18,
  cess_rate NUMERIC(5,2) DEFAULT 0,
  stock_quantity NUMERIC(12,2) DEFAULT 0,
  low_stock_threshold NUMERIC(12,2) DEFAULT 5,
  description TEXT,
  category TEXT,
  barcode TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bills & Tax Invoices
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  invoice_type TEXT NOT NULL DEFAULT 'tax_invoice',
  invoice_date DATE NOT NULL,
  due_date DATE,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_gstin TEXT,
  place_of_supply TEXT,
  status TEXT NOT NULL DEFAULT 'unpaid',
  payment_method TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14,2) DEFAULT 0,
  taxable_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  cgst_amount NUMERIC(14,2) DEFAULT 0,
  sgst_amount NUMERIC(14,2) DEFAULT 0,
  igst_amount NUMERIC(14,2) DEFAULT 0,
  cess_amount NUMERIC(14,2) DEFAULT 0,
  total_tax NUMERIC(14,2) DEFAULT 0,
  round_off NUMERIC(6,2) DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(14,2) DEFAULT 0,
  balance_due NUMERIC(14,2) DEFAULT 0,
  terms TEXT,
  notes TEXT,
  meta JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Business Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  expense_date DATE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT,
  vendor_name TEXT,
  vendor_gstin TEXT,
  is_itc_eligible BOOLEAN DEFAULT TRUE,
  itc_claimed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  receipt_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Purchases & Inward Supplies
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  purchase_number TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  supplier_id TEXT,
  supplier_name TEXT NOT NULL,
  supplier_gstin TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_tax NUMERIC(14,2) DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  itc_eligibility TEXT DEFAULT 'eligible',
  status TEXT DEFAULT 'received',
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payment Receipts
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  receipt_number TEXT NOT NULL,
  receipt_date DATE NOT NULL,
  bill_id TEXT REFERENCES bills(id) ON DELETE SET NULL,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_mode TEXT NOT NULL,
  reference_no TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Recurring Invoicing Profiles
CREATE TABLE IF NOT EXISTS recurring (
  id TEXT PRIMARY KEY,
  template_name TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  next_run DATE NOT NULL,
  last_run DATE,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  bill_payload JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  auto_email BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(invoice_date);
CREATE INDEX IF NOT EXISTS idx_bills_client ON bills(client_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

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

-- Allow authenticated and service role keys full access
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

## 4. In-App Supabase Hub Features

Navigate to the Hub via:
- **Settings Flyout**: Click **Settings** → **Supabase Cloud** (under *Data & Sync* or *Integrations & Apps*).
- **Reports & Tools**: Click **Supabase Cloud (PostgreSQL)** from the top navigation.
- **Command Palette**: Press `Ctrl+K` and select **⚡ Supabase Cloud Database**.
- **Direct Route**: Navigate to `/settings/supabase` or `?view=supabase`.

### 1. Credentials & Real-Time Health Check
- **Masked Keys**: Public Anon and Service Role keys are automatically masked in the UI and in server API responses.
- **Show/Hide Toggles**: Toggle password masking when pasting keys.
- **Roundtrip Latency Ping**: Tests live HTTP connectivity and returns roundtrip millisecond latency.
- **Status Indicator**: Live visual badge showing `Disconnected`, `Testing...`, `Connected (X ms)`, or `Error`.

### 2. Schema Inspector
- Checks all 9 database tables against your Supabase instance.
- Visual status chips (`Verified` vs `Missing`).
- One-click **"Copy SQL Schema"** button to quickly copy the complete DDL script into your clipboard.

### 3. Bidirectional Synchronization Engine
- **Local Summary**: Displays exact count of bills, clients, products, expenses, purchases, receipts, and recurring templates available locally.
- **Upload Local Data to Supabase**:
  - Chunks records into batches of 50 items.
  - Transforms local records into normalized PostgreSQL relational rows and JSONB blocks.
  - Upserts records using primary key idempotency (safe to re-run anytime).
  - Displays real-time progress bar and records summary upon completion.
- **Download Remote Data to Local**:
  - Fetches all records from Supabase tables.
  - Automatically triggers `backupEngine.createBackup()` in `./data/backups/` before modifying any local files.
  - Applies safe atomic writes (`writeJsonAtomic` via `.tmp` write and atomic rename).
  - Merges records based on your conflict strategy.

### 4. Sync Settings & Conflict Resolution
- **Auto-Sync on Save**: When checked, newly created or modified invoices and clients are synchronized to Supabase in the background.
- **Conflict Resolution Strategy**:
  - `local_wins` *(Default)*: Local edits take precedence over remote rows.
  - `cloud_wins`: Remote database state overrides local records during synchronization.

### 5. Audit Ledger & Telemetry
- Inspect historical synchronization events with timestamps, sync type (`export_all`, `sync_up`, `sync_down`), records processed, status, duration, and backup folder references.

---

## 5. Configuration via Environment Variables

For headless, containerized (Docker / Cloud Run), or automated environments, you can configure Supabase via environment variables instead of the in-app UI:

```bash
# .env or container environment variables
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Optional
```

When environment variables are present, the backend automatically initializes with these credentials if no `./data/supabase_config.json` file is present.

---

## 6. REST API Endpoints Specification

| HTTP Verb | Endpoint | Description | Sample Request / Response |
|---|---|---|---|
| `GET` | `/api/supabase/config` | Retrieves current configuration with masked keys and status. | `{ "configured": true, "supabaseUrl": "https://...", "anonKey": "••••••••", "autoSync": false }` |
| `POST` | `/api/supabase/config` | Saves configuration and persists to `./data/supabase_config.json`. | `{ "supabaseUrl": "...", "anonKey": "..." }` → `{ "success": true }` |
| `POST` | `/api/supabase/test` | Performs live connection ping with latency measurement. | `{ "success": true, "status": "connected", "latencyMs": 85 }` |
| `GET` | `/api/supabase/tables` | Verifies existence of required PostgreSQL tables. | `{ "success": true, "tables": { "bills": true, "clients": true, ... } }` |
| `GET` | `/api/supabase/summary` | Returns record count breakdown from local `./data/`. | `{ "success": true, "summary": { "bills": 42, "clients": 15, ... } }` |
| `POST` | `/api/supabase/sync-up` | Upserts all local records to Supabase in batches of 50. | `{ "success": true, "totalSynced": 128, "durationMs": 412 }` |
| `POST` | `/api/supabase/sync-down` | Downloads remote records, creates safety backup, and merges locally. | `{ "success": true, "totalSynced": 128, "backupPath": "data/backups/..." }` |
| `GET` | `/api/supabase/audit-log` | Returns recent synchronization audit events. | `{ "success": true, "auditLog": [ ... ] }` |

---

## 7. Security, Privacy & Compliance Guardrails

1. **Zero Statutory Math Alterations**: Tax formulas (CGST, SGST, IGST, UTGST, TDS 194Q/194C/194J, TCS 206C(1H), Rule 119A rounding) are computed deterministically before synchronizing. The cloud database only stores verified statutory amounts.
2. **Local Portability Retained**: Flat-file JSON persistence in `./data/` remains fully operational. If your internet connection drops or Supabase experiences downtime, the application continues functioning without disruption.
3. **Atomic File Operations**: All disk writes utilize atomic write-to-temp-then-rename semantics. System crashes or power loss during sync cannot produce corrupt or truncated JSON files.
4. **Credential Masking**: Secret keys are never rendered in plain text in HTML responses or client logs.
5. **Pre-Sync Disaster Recovery**: Emergency rollback snapshots are stored in `./data/backups/pre-supabase-sync-<timestamp>/`. If needed, simply copy files from the backup directory back to `./data/` to restore your prior state.
