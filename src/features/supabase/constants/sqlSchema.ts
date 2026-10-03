/**
 * Canonical Supabase PostgreSQL Schema for Free GST Billing Software
 * Ready to run directly in the Supabase SQL Editor.
 */
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- FREE GST BILLING SOFTWARE — CANONICAL POSTGRESQL SUPABASE SCHEMA
-- Run this script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Multi-Business Profiles
CREATE TABLE IF NOT EXISTS business_profiles (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  name TEXT,
  brand_name TEXT,
  gstin TEXT,
  pan TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  state TEXT,
  state_code TEXT,
  state_name TEXT,
  pincode TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc TEXT,
  upi_id TEXT,
  bank_details JSONB,
  logo_url TEXT,
  signature_url TEXT,
  lut_number TEXT,
  settings JSONB,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Client & Customer Master
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trade_name TEXT,
  gstin TEXT,
  pan TEXT,
  phone TEXT,
  email TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  address TEXT,
  state TEXT,
  state_code TEXT,
  pincode TEXT,
  credit_limit NUMERIC(14, 2) DEFAULT 0.00,
  credit_balance NUMERIC(14, 2) DEFAULT 0.00,
  outstanding_balance NUMERIC(14, 2) DEFAULT 0.00,
  opening_balance NUMERIC(14, 2) DEFAULT 0.00,
  notes TEXT,
  custom_fields JSONB,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product & Inventory Master
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT,
  hsn_code TEXT,
  hsn_sac TEXT,
  hsn TEXT,
  item_type TEXT DEFAULT 'product',
  unit TEXT DEFAULT 'NOS',
  selling_price NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  purchase_price NUMERIC(14, 2) DEFAULT 0.00,
  rate NUMERIC(14, 2) DEFAULT 0.00,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  cess_rate NUMERIC(5, 2) DEFAULT 0.00,
  current_stock NUMERIC(12, 3) DEFAULT 0.000,
  stock_quantity NUMERIC(12, 3) DEFAULT 0.000,
  low_stock_alert INTEGER DEFAULT 5,
  low_stock_threshold INTEGER DEFAULT 5,
  description TEXT,
  category TEXT,
  barcode TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Sales Invoices & Bills
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  invoice_type TEXT NOT NULL DEFAULT 'tax-invoice',
  doc_type TEXT DEFAULT 'tax_invoice',
  invoice_date DATE NOT NULL,
  due_date DATE,
  client_id TEXT,
  client_name TEXT NOT NULL,
  client_gstin TEXT,
  place_of_supply TEXT,
  is_interstate BOOLEAN DEFAULT FALSE,
  is_reverse_charge BOOLEAN DEFAULT FALSE,
  tax_mode TEXT DEFAULT 'exclusive',
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(14, 2) DEFAULT 0.00,
  taxable_amount NUMERIC(14, 2) DEFAULT 0.00,
  cgst_total NUMERIC(14, 2) DEFAULT 0.00,
  sgst_total NUMERIC(14, 2) DEFAULT 0.00,
  igst_total NUMERIC(14, 2) DEFAULT 0.00,
  utgst_total NUMERIC(14, 2) DEFAULT 0.00,
  cess_total NUMERIC(14, 2) DEFAULT 0.00,
  tcs_amount NUMERIC(14, 2) DEFAULT 0.00,
  tds_amount NUMERIC(14, 2) DEFAULT 0.00,
  round_off NUMERIC(6, 2) DEFAULT 0.00,
  grand_total NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(14, 2) DEFAULT 0.00,
  paid_amount NUMERIC(14, 2) DEFAULT 0.00,
  amount_paid NUMERIC(14, 2) DEFAULT 0.00,
  balance_due NUMERIC(14, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  terms TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(invoice_date);
CREATE INDEX IF NOT EXISTS idx_bills_number ON bills(invoice_number);

-- 5. Operating Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  expense_number TEXT,
  expense_date DATE,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT,
  vendor_name TEXT,
  payee TEXT,
  vendor_gstin TEXT,
  tax_mode TEXT DEFAULT 'exempt',
  taxable_amount NUMERIC(14, 2) DEFAULT 0.00,
  tax_amount NUMERIC(14, 2) DEFAULT 0.00,
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  amount NUMERIC(14, 2) DEFAULT 0.00,
  payment_mode TEXT DEFAULT 'cash',
  payment_method TEXT DEFAULT 'cash',
  is_itc_eligible BOOLEAN DEFAULT TRUE,
  receipt_url TEXT,
  notes TEXT,
  raw_payload JSONB,
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
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payment Receipts
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  receipt_number TEXT NOT NULL,
  date DATE NOT NULL,
  bill_id TEXT,
  client_id TEXT,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  payment_mode TEXT NOT NULL DEFAULT 'bank_transfer',
  transaction_ref TEXT,
  notes TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Recurring Invoices
CREATE TABLE IF NOT EXISTS recurring (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  frequency TEXT NOT NULL,
  next_run_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  template_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Synchronization Audit Ledger
CREATE TABLE IF NOT EXISTS sync_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL,
  records_count INTEGER NOT NULL DEFAULT 0,
  collections_synced JSONB,
  status TEXT NOT NULL,
  error_message TEXT,
  triggered_by TEXT DEFAULT 'user',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_audit_log ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies for Anon and Service Role
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'business_profiles' AND policyname = 'Allow public access') THEN
    CREATE POLICY "Allow public access" ON business_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Allow public access') THEN
    CREATE POLICY "Allow public access" ON clients FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public access') THEN
    CREATE POLICY "Allow public access" ON products FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bills' AND policyname = 'Allow public access') THEN
    CREATE POLICY "Allow public access" ON bills FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Allow public access') THEN
    CREATE POLICY "Allow public access" ON expenses FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchases' AND policyname = 'Allow public access') THEN
    CREATE POLICY "Allow public access" ON purchases FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'receipts' AND policyname = 'Allow public access') THEN
    CREATE POLICY "Allow public access" ON receipts FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recurring' AND policyname = 'Allow public access') THEN
    CREATE POLICY "Allow public access" ON recurring FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sync_audit_log' AND policyname = 'Allow public access') THEN
    CREATE POLICY "Allow public access" ON sync_audit_log FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

