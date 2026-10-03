# Local SQL Database Migration Plan (Flat-File JSON to Local SQLite)

> **Document Type:** Architectural Strategy & Technical Migration Specification  
> **Status:** Proposal / Ready for Review  
> **Target Engine:** Local Embedded SQLite (WAL Mode) — Zero External Services / 100% Offline  
> **Target Database File:** `./data/accounting.db`

---

## 1. Executive Summary & Context

Free GST Billing Software currently persists business records as flat JSON files in `./data/`:
- `data/bills/[id].json`
- `data/clients/[id].json`
- `data/products/[id].json`
- `data/expenses/[id].json`
- `data/purchases/[id].json`
- `data/receipts/[id].json`
- `data/recurring/[id].json`
- `data/profiles/[id].json`
- `data/templates/[id].json`
- `data/meta.json`, `data/profile.json`, `data/settings.json`

### Strengths of Current Model
1. **Zero Configuration**: Runs anywhere Node.js runs without external database installation or setup.
2. **File Portability**: Users can inspect, copy, or zip their `./data` directory to move records between computers.
3. **Atomic Writes**: `server/shared/utils/atomicFs.js` writes to a temporary file before renaming, preventing 0-byte file corruption during power failures.

### Limitations of Current Model at Scale
1. **No Referential Integrity**: If a client is deleted, associated invoices retain orphaned `clientId` references without foreign key constraints.
2. **Disk I/O Scans**: Fetching all bills requires reading hundreds or thousands of files individually if memory caches are invalidated.
3. **Aggregation Overhead**: Financial summaries (GSTR-1, P&L, quarterly reports) require deserializing every record into Node.js memory.
4. **Concurrency Bottlenecks**: Multi-tab operations writing to `data/meta.json` risk last-write-wins collisions on invoice numbering sequences.

---

## 2. Core Non-Negotiables & Engineering Guardrails

Any migration to a local SQL engine must strictly honor the architectural guardrails defined in `AGENTS.md` and `RULES.md`:

1. **NEVER Alter Statutory Tax Math**:
   - The tax algorithms in `src/features/invoices/utils/taxCalculation.ts` and `src/features/income-tax/utils/itrCalculation.ts` are legally binding under Indian GST and Income Tax acts.
   - All 70 tax tests (`scripts/tax-test.mjs`) and 9 discount tests (`scripts/discount-modes-test.mjs`) must pass with zero errors at all times.
2. **Zero External Database Services**:
   - No standalone database daemons (PostgreSQL, MySQL) requiring background service management or separate port configurations.
   - The database must be an embedded, in-process engine (SQLite) contained in `./data/accounting.db`.
3. **100% Offline & Zero Cloud Dependency**:
   - The app must function fully without an internet connection.
4. **Preserve Human-Readable Portability**:
   - A built-in 1-click JSON export feature (`/api/system/export-json`) must remain available so users can extract standard JSON files on demand.
5. **Exact Financial Precision**:
   - All financial amounts in the SQL schema are stored as **exact integers in Paisa** (1 INR = 100 Paisa) to prevent floating-point rounding discrepancies.

---

## 3. Local SQL Engine Evaluation

| Criteria | Embedded SQLite (C/WAL) | Embedded SQLite (WASM / `@libsql/client`) | DuckDB | Local PostgreSQL / MySQL |
|---|---|---|---|---|
| **Architecture** | Single-file embedded | Single-file embedded | Single-file embedded | Client-Server daemon |
| **Install Overhead** | Requires C++ build tools on install | Zero native build tools (pure JS/WASM) | Native build tools | External installer & service daemon |
| **Portability** | High (`accounting.db`) | High (`accounting.db`) | High (`accounting.db`) | Low (requires DB dumps & role setup) |
| **Concurrency** | WAL mode (concurrent reads) | WAL mode (concurrent reads) | Single-writer | Multi-client connection pool |
| **Verdict** | Preferred for max speed | **Recommended** (zero install friction) | Overkill (OLAP focused) | **Rejected** (violates zero-daemon rule) |

---

## 4. Normalized Relational Target Schema (DDL)

```sql
-- PRAGMAS (Executed on connection startup)
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- ============================================================================
-- 1. BUSINESS PROFILES & NUMBERING COUNTERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    is_default INTEGER NOT NULL DEFAULT 0,
    company_name TEXT NOT NULL,
    trade_name TEXT,
    gstin TEXT,
    pan TEXT,
    state_code TEXT NOT NULL,
    state_name TEXT NOT NULL,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    pincode TEXT,
    phone TEXT,
    email TEXT,
    bank_details_json TEXT, -- Accounts, IFSC, branch
    upi_id TEXT,
    signature_data_url TEXT,
    logo_data_url TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS meta_counters (
    prefix TEXT NOT NULL,
    financial_year TEXT NOT NULL,
    last_sequence INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (prefix, financial_year)
);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

-- ============================================================================
-- 2. PARTIES & INVENTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    name TEXT NOT NULL,
    trade_name TEXT,
    gstin TEXT,
    pan TEXT,
    state_code TEXT NOT NULL,
    state_name TEXT NOT NULL,
    billing_address_json TEXT,
    shipping_address_json TEXT,
    is_sez INTEGER NOT NULL DEFAULT 0,
    credit_limit_paisa INTEGER DEFAULT 0,
    opening_balance_paisa INTEGER DEFAULT 0,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_gstin ON clients(gstin);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    item_type TEXT NOT NULL DEFAULT 'goods', -- 'goods' | 'service'
    name TEXT NOT NULL,
    sku TEXT,
    hsn_sac TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'PCS',
    purchase_price_paisa INTEGER DEFAULT 0,
    selling_price_paisa INTEGER NOT NULL,
    gst_rate_percent REAL NOT NULL DEFAULT 18.0,
    cess_percent REAL DEFAULT 0.0,
    stock_quantity REAL DEFAULT 0.0,
    min_stock_alert REAL DEFAULT 0.0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_hsn ON products(hsn_sac);

-- ============================================================================
-- 3. INVOICES & LINE ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    invoice_type TEXT NOT NULL DEFAULT 'tax_invoice',
    date TEXT NOT NULL,           -- YYYY-MM-DD
    due_date TEXT,               -- YYYY-MM-DD
    financial_year TEXT NOT NULL,  -- e.g. '2025-26'
    place_of_supply TEXT NOT NULL,
    is_interstate INTEGER NOT NULL DEFAULT 0,
    is_reverse_charge INTEGER NOT NULL DEFAULT 0,
    discount_mode TEXT NOT NULL DEFAULT 'fixed_net',
    tax_inclusive INTEGER NOT NULL DEFAULT 0,
    
    -- Monetary Totals (Stored in Exact Paisa)
    taxable_amount_paisa INTEGER NOT NULL DEFAULT 0,
    cgst_amount_paisa INTEGER NOT NULL DEFAULT 0,
    sgst_amount_paisa INTEGER NOT NULL DEFAULT 0,
    igst_amount_paisa INTEGER NOT NULL DEFAULT 0,
    utgst_amount_paisa INTEGER NOT NULL DEFAULT 0,
    cess_amount_paisa INTEGER NOT NULL DEFAULT 0,
    total_tax_paisa INTEGER NOT NULL DEFAULT 0,
    tcs_amount_paisa INTEGER NOT NULL DEFAULT 0,
    tds_amount_paisa INTEGER NOT NULL DEFAULT 0,
    round_off_paisa INTEGER NOT NULL DEFAULT 0,
    grand_total_paisa INTEGER NOT NULL DEFAULT 0,
    balance_due_paisa INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'unpaid', -- 'draft', 'unpaid', 'partial', 'paid', 'cancelled'
    
    -- Statutory E-Way & E-Invoice Fields
    eway_bill_no TEXT,
    irn TEXT,
    qr_code_text TEXT,
    notes TEXT,
    terms TEXT,
    print_settings_json TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bills_number_profile ON bills(profile_id, invoice_number) WHERE is_deleted = 0;
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_client ON bills(client_id);
CREATE INDEX IF NOT EXISTS idx_bills_fy ON bills(financial_year);

CREATE TABLE IF NOT EXISTS bill_items (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,
    product_id TEXT,
    item_order INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    hsn_sac TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    unit_price_paisa INTEGER NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'fixed',
    discount_base TEXT NOT NULL DEFAULT 'net',
    discount_value REAL NOT NULL DEFAULT 0.0,
    gst_rate_percent REAL NOT NULL DEFAULT 18.0,
    cess_percent REAL DEFAULT 0.0,
    taxable_amount_paisa INTEGER NOT NULL,
    cgst_amount_paisa INTEGER NOT NULL DEFAULT 0,
    sgst_amount_paisa INTEGER NOT NULL DEFAULT 0,
    igst_amount_paisa INTEGER NOT NULL DEFAULT 0,
    utgst_amount_paisa INTEGER NOT NULL DEFAULT 0,
    cess_amount_paisa INTEGER NOT NULL DEFAULT 0,
    total_tax_paisa INTEGER NOT NULL DEFAULT 0,
    line_total_paisa INTEGER NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);

-- ============================================================================
-- 4. RECEIPTS & PAYMENT ALLOCATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    receipt_number TEXT NOT NULL,
    date TEXT NOT NULL,
    amount_paisa INTEGER NOT NULL,
    payment_mode TEXT NOT NULL,
    reference_number TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS receipt_allocations (
    id TEXT PRIMARY KEY,
    receipt_id TEXT NOT NULL,
    bill_id TEXT NOT NULL,
    allocated_amount_paisa INTEGER NOT NULL,
    FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE RESTRICT
);

-- ============================================================================
-- 5. PURCHASES & EXPENSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    category TEXT NOT NULL,
    vendor_name TEXT,
    vendor_gstin TEXT,
    date TEXT NOT NULL,
    financial_year TEXT NOT NULL,
    amount_paisa INTEGER NOT NULL,
    gst_rate_percent REAL NOT NULL DEFAULT 0.0,
    itc_eligible INTEGER NOT NULL DEFAULT 1,
    itc_igst_paisa INTEGER DEFAULT 0,
    itc_cgst_paisa INTEGER DEFAULT 0,
    itc_sgst_paisa INTEGER DEFAULT 0,
    receipt_url TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_fy ON expenses(financial_year);

CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    supplier_gstin TEXT,
    bill_number TEXT NOT NULL,
    date TEXT NOT NULL,
    financial_year TEXT NOT NULL,
    subtotal_paisa INTEGER NOT NULL,
    tax_total_paisa INTEGER NOT NULL,
    grand_total_paisa INTEGER NOT NULL,
    itc_eligible INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id TEXT PRIMARY KEY,
    purchase_id TEXT NOT NULL,
    name TEXT NOT NULL,
    hsn_sac TEXT,
    quantity REAL NOT NULL,
    unit TEXT,
    unit_price_paisa INTEGER NOT NULL,
    gst_rate_percent REAL NOT NULL,
    taxable_amount_paisa INTEGER NOT NULL,
    tax_amount_paisa INTEGER NOT NULL,
    line_total_paisa INTEGER NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
);

-- ============================================================================
-- 6. RECURRING INVOICES & TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS recurring_templates (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    frequency TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly'
    next_issue_date TEXT NOT NULL,
    auto_generate INTEGER NOT NULL DEFAULT 0,
    template_json TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS terms_templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
```

---

## 5. Storage Engine Architecture (Zero Breaking Changes)

The existing backend is built with a 4-layer architecture:
`Route -> Controller -> Service -> Repository -> Storage Engine`

To migrate without modifying business logic in services or controllers:
1. Provide a `SqliteCollectionRepository` implementing the existing `ICollectionRepository` interface:
   - `findAll(filter)`
   - `findById(id)`
   - `create(id, data)`
   - `update(id, partial)`
   - `delete(id)`
2. Provide transparent serialization adapters:
   - Converts Rupee floats (`1250.50`) to Paisa integers (`125050`) on write.
   - Converts Paisa integers back to Rupee floats on read.
   - Reconstructs nested items and addresses for seamless API compatibility.

---

## 6. Phased Implementation Roadmap

```
Phase 1: Pre-Migration Validation & Backup [COMPLETED]
├── Run scripts/tax-test.mjs & scripts/discount-modes-test.mjs (Assert 70/70 and 9/9 PASS) [VERIFIED: 70/70 PASS, 9/9 PASS]
├── Create full snapshot in data/backups/pre-sql-migration-[timestamp]/ [VERIFIED: Created pre-sql-migration-2026-09-23T08-52-37-610Z]
└── Validate all existing JSON files for schema consistency [VERIFIED: scripts/validate-json-data.mjs, 0 corruptions]

Phase 2: Database Initialization & Schema Setup [COMPLETED]
├── Create server/infrastructure/db/sqlite.js [VERIFIED: Node.js node:sqlite native singleton]
├── Create server/infrastructure/db/schema.sql [VERIFIED: 15 tables, 12 indexes, WAL mode]
└── Initialize ./data/accounting.db in WAL mode [VERIFIED: node scripts/init-sqlite-db.mjs, WAL + foreign_keys=1]

Phase 3: Data Migration Script (ETL) [COMPLETED]
├── Implement scripts/migrate-json-to-sql.mjs [VERIFIED: Supports --dry-run and --force]
├── Load profiles, clients, products, bills, expenses, purchases, receipts [VERIFIED: 100% entities mapped]
└── Execute inside a single ACID transaction (BEGIN IMMEDIATE / COMMIT) [VERIFIED: Committed cleanly to accounting.db]

Phase 4: Parity & Verification Suite [COMPLETED]
├── Run scripts/verify-migration-parity.mjs [VERIFIED: 20/20 checks PASS]
│   ├── Assert row counts match file counts [VERIFIED: 100% parity across 8 collections]
│   ├── Assert SUM(grand_total) matches exact paisa [VERIFIED: Δ = 0 Paisa]
│   └── Assert foreign keys and relations are intact [VERIFIED: PRAGMA foreign_key_check clean]
└── Run regression tests: scripts/tax-test.mjs & scripts/discount-modes-test.mjs [VERIFIED: 70/70 PASS, 9/9 PASS]

Phase 5: Repository Adapter Switch & Shadow Mode [COMPLETED]
├── Implement server/infrastructure/storage/SqliteCollectionRepository.js [VERIFIED: Full ICollectionRepository parity]
├── Route queries through SQLite repository [VERIFIED: CollectionRepository delegates to SqliteCollectionRepository]
├── Retain atomicFs as emergency dual-write or backup engine [VERIFIED: Shadow dual-write verified via scripts/test-sqlite-repository.mjs]
└── 12/12 Repository Adapter tests passing & 23/23 smoke tests passing [VERIFIED: node scripts/test-sqlite-repository.mjs]

Phase 6: 1-Click JSON Backup & Full Verification [PENDING]
├── Add /api/system/export-json endpoint for portable data export
├── Verify compile_applet and tests/smoke.mjs
└── Update documentation in docs/refactor/
```

---

## 7. Disaster Recovery & Emergency Rollback Strategy

1. **Pre-Migration Safety Snapshot**:
   Before running any migration script, the entire `./data/` folder is copied to `data/backups/pre-sql-migration-[date]/`.
2. **Side-by-Side Ingestion**:
   The migration creates `data/accounting.db` alongside the `.json` files without deleting or renaming original JSON files.
3. **Instant Rollback**:
   If any parity test fails, switching the repository import in `server/infrastructure/storage/index.js` back to `CollectionRepository.js` restores 100% of previous functionality in seconds.
4. **Data Portability Guarantee**:
   The built-in export endpoint (`/api/system/export-json`) dumps `accounting.db` back into the standard `./data/[collection]/[id].json` layout on demand.
