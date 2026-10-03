-- database/seeds/default_profile.sql
-- Seed default business profile and initial numbering settings

INSERT OR IGNORE INTO profiles (
    id,
    is_default,
    company_name,
    trade_name,
    gstin,
    pan,
    state_code,
    state_name,
    address_line1,
    address_line2,
    city,
    pincode,
    phone,
    email,
    created_at,
    updated_at
) VALUES (
    'default',
    1,
    'My Demo Business',
    'Demo Retail',
    '27AAAAA1111A1Z1',
    'AAAAA1111A',
    '27',
    'Maharashtra',
    '123, Main Street',
    'Near Metro Station',
    'Mumbai',
    '400001',
    '9876543210',
    'contact@demoretail.com',
    1710000000000,
    1710000000000
);

INSERT OR IGNORE INTO meta_counters (
    prefix,
    financial_year,
    last_sequence,
    updated_at
) VALUES (
    'INV',
    '2025-26',
    0,
    1710000000000
);
