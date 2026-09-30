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
  whatsapp_message TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  website TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  presentation TEXT,
  photo_url TEXT,
  social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  commercial_cta_label TEXT,
  commercial_cta_url TEXT,
  offer_title TEXT,
  offer_text TEXT,
  offer_url TEXT,
  offer_start_date DATE,
  offer_end_date DATE,
  brochure_label TEXT,
  brochure_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image_url TEXT,
  hero_badge TEXT,
  about_text TEXT,
  languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_cta_label TEXT,
  primary_cta_url TEXT,
  booking_url TEXT,
  lead_form_enabled BOOLEAN NOT NULL DEFAULT FALSE,
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

CREATE TABLE IF NOT EXISTS card_services (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS card_resources (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL DEFAULT 'link',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS card_gallery (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS card_highlights (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  value TEXT,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS card_campaigns (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_label TEXT,
  cta_url TEXT,
  starts_at DATE,
  ends_at DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('nfc', 'qr', 'web')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

CREATE INDEX IF NOT EXISTS idx_card_services_card ON card_services(card_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_card_resources_card ON card_resources(card_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_card_gallery_card ON card_gallery(card_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_card_highlights_card ON card_highlights(card_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_card_campaigns_card ON card_campaigns(card_id);
CREATE INDEX IF NOT EXISTS idx_leads_card_created ON leads(card_id, created_at DESC);
