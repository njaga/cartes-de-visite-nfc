CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  nfc_token TEXT NOT NULL UNIQUE,
  nfc_mode TEXT NOT NULL DEFAULT 'profile' CHECK (nfc_mode IN ('profile', 'vcard')),
  nfc_status TEXT NOT NULL DEFAULT 'new' CHECK (nfc_status IN ('new', 'programmed', 'tested')),
  programmed_at TIMESTAMPTZ,
  tested_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  subsidiary TEXT NOT NULL,
  company TEXT NOT NULL,
  mobile TEXT,
  whatsapp TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  website TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  presentation TEXT,
  photo_url TEXT,
  social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scans (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'nfc' CHECK (source IN ('nfc', 'qr')),
  user_agent TEXT,
  referer TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_configs (
  subsidiary TEXT PRIMARY KEY,
  primary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  logo_url TEXT
);

CREATE TABLE IF NOT EXISTS media_assets (
  filename TEXT PRIMARY KEY,
  mime_type TEXT NOT NULL,
  data_base64 TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scans_card_id ON scans(card_id);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cards_email_unique ON cards(lower(email));
