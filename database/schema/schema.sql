-- database/schema/schema.sql
-- Relational Schema DDL for Local SQLite Database (WAL Mode)
-- Monetary values stored in exact integer Paisa (1 INR = 100 Paisa)

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- ============================================================================
-- 0. SCHEMA MIGRATIONS TRACKER
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at INTEGER NOT NULL
);

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
    raw_json TEXT,
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
    raw_json TEXT,
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
    raw_json TEXT,
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
    raw_json TEXT,
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
    raw_json TEXT,
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
    raw_json TEXT,
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
    raw_json TEXT,
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

-- ============================================================================
-- 7. GENERIC / AUXILIARY DOCUMENTS (FOR TRASH, BACKUPS, ETC.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    raw_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (collection, id)
);
CREATE INDEX IF NOT EXISTS idx_documents_col ON documents(collection);
