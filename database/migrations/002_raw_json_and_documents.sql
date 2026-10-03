-- database/migrations/002_raw_json_and_documents.sql
-- Migration Version 2: Raw JSON and Generic Documents

ALTER TABLE profiles ADD COLUMN raw_json TEXT;
ALTER TABLE clients ADD COLUMN raw_json TEXT;
ALTER TABLE products ADD COLUMN raw_json TEXT;
ALTER TABLE bills ADD COLUMN raw_json TEXT;
ALTER TABLE receipts ADD COLUMN raw_json TEXT;
ALTER TABLE expenses ADD COLUMN raw_json TEXT;
ALTER TABLE purchases ADD COLUMN raw_json TEXT;

CREATE TABLE IF NOT EXISTS documents (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    raw_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (collection, id)
);
CREATE INDEX IF NOT EXISTS idx_documents_col ON documents(collection);
