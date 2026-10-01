import { neon } from "@neondatabase/serverless";
import type { DigitalCard, NfcProvisioningStatus, ServiceImage, SocialLink } from "@/lib/profiles";
import { seedProfiles } from "@/lib/profiles";
import type { BrandConfig } from "@/lib/brands";
import { defaultBrandConfigs, defaultBrandFor } from "@/lib/brands";

type CardRow = {
  id: number;
  slug: string;
  nfc_token: string;
  nfc_mode: "profile" | "vcard";
  nfc_status: NfcProvisioningStatus;
  programmed_at: string | Date | null;
  tested_at: string | Date | null;
  active: boolean;
  first_name: string;
  last_name: string;
  job_title: string;
  subsidiary: string;
  company: string;
  mobile: string | null;
  whatsapp: string | null;
  whatsapp_message: string | null;
  phone: string | null;
  email: string;
  website: string;
  address: string;
  city: string;
  country: string;
  presentation: string | null;
  photo_url: string | null;
  cover_url: string | null;
  company_presentation: string | null;
  appointment_url: string | null;
  social_links: SocialLink[] | string | null;
  services: string[] | string | null;
  service_images: ServiceImage[] | string | null;
  commercial_cta_label: string | null;
  commercial_cta_url: string | null;
  offer_title: string | null;
  offer_text: string | null;
  offer_url: string | null;
  offer_start_date: string | Date | null;
  offer_end_date: string | Date | null;
  brochure_label: string | null;
  brochure_url: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

type BrandRow = {
  subsidiary: string;
  primary_color: string;
  accent_color: string;
  logo_url: string | null;
  social_links: SocialLink[] | string | null;
};

export type MediaAsset = {
  filename: string;
  mimeType: string;
  dataBase64: string;
};

const globalForDb = globalThis as unknown as {
  vigilusSql?: ReturnType<typeof neon>;
  vigilusSchemaPromise?: Promise<void>;
};

function connectionString() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new Error(
      "DATABASE_URL est absente. Connectez une base Neon PostgreSQL au projet Vercel."
    );
  }
  return value;
}

function sql() {
  if (!globalForDb.vigilusSql) {
    globalForDb.vigilusSql = neon(connectionString());
  }
  return globalForDb.vigilusSql;
}

async function query<T>(text: string, params: unknown[] = []) {
  const rows = await sql().query(text, params);
  return rows as unknown as T[];
}

function dateValue(value: string | Date | null | undefined) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function parseSocialLinks(value: SocialLink[] | string | null): SocialLink[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseStringArray(value: string[] | string | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function parseServiceImages(value: ServiceImage[] | string | null): ServiceImage[] {
  try {
    const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ServiceImage =>
      Boolean(item) && typeof item.name === "string" && typeof item.imageUrl === "string"
    );
  } catch {
    return [];
  }
}

function dateOnlyValue(value: string | Date | null | undefined) {
  const normalized = dateValue(value);
  return normalized ? normalized.slice(0, 10) : undefined;
}

function rowToCard(row: CardRow | undefined): DigitalCard | undefined {
  if (!row) return undefined;
  return {
    id: Number(row.id),
    slug: row.slug,
    nfcToken: row.nfc_token,
    nfcMode: row.nfc_mode,
    nfcStatus: row.nfc_status || "new",
    programmedAt: dateValue(row.programmed_at),
    testedAt: dateValue(row.tested_at),
    active: Boolean(row.active),
    firstName: row.first_name,
    lastName: row.last_name,
    jobTitle: row.job_title,
    subsidiary: row.subsidiary,
    company: row.company,
    mobile: row.mobile ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    whatsappMessage: row.whatsapp_message ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email,
    website: row.website,
    address: row.address,
    city: row.city,
    country: row.country,
    presentation: row.presentation ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    companyPresentation: row.company_presentation ?? undefined,
    appointmentUrl: row.appointment_url ?? undefined,
    socialLinks: parseSocialLinks(row.social_links),
    services: parseStringArray(row.services),
    serviceImages: parseServiceImages(row.service_images),
    commercialCtaLabel: row.commercial_cta_label ?? undefined,
    commercialCtaUrl: row.commercial_cta_url ?? undefined,
    offerTitle: row.offer_title ?? undefined,
    offerText: row.offer_text ?? undefined,
    offerUrl: row.offer_url ?? undefined,
    offerStartDate: dateOnlyValue(row.offer_start_date),
    offerEndDate: dateOnlyValue(row.offer_end_date),
    brochureLabel: row.brochure_label ?? undefined,
    brochureUrl: row.brochure_url ?? undefined,
    createdAt: dateValue(row.created_at),
    updatedAt: dateValue(row.updated_at)
  };
}

function rowToBrand(row: BrandRow | undefined): BrandConfig | undefined {
  if (!row) return undefined;
  return {
    subsidiary: row.subsidiary,
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
    logoUrl: row.logo_url || defaultBrandFor(row.subsidiary).logoUrl,
    // NULL inherits group links for older records; [] deliberately hides them.
    socialLinks: row.social_links == null
      ? defaultBrandFor(row.subsidiary).socialLinks
      : parseSocialLinks(row.social_links)
  };
}

async function initializeDatabase() {
  await query(
    "CREATE TABLE IF NOT EXISTS cards (" +
      "id SERIAL PRIMARY KEY," +
      "slug TEXT NOT NULL UNIQUE," +
      "nfc_token TEXT NOT NULL UNIQUE," +
      "nfc_mode TEXT NOT NULL DEFAULT 'profile' CHECK (nfc_mode IN ('profile','vcard'))," +
      "nfc_status TEXT NOT NULL DEFAULT 'new' CHECK (nfc_status IN ('new','programmed','tested'))," +
      "programmed_at TIMESTAMPTZ," +
      "tested_at TIMESTAMPTZ," +
      "active BOOLEAN NOT NULL DEFAULT TRUE," +
      "first_name TEXT NOT NULL," +
      "last_name TEXT NOT NULL," +
      "job_title TEXT NOT NULL," +
      "subsidiary TEXT NOT NULL," +
      "company TEXT NOT NULL," +
      "mobile TEXT," +
      "whatsapp TEXT," +
      "phone TEXT," +
      "email TEXT NOT NULL," +
      "website TEXT NOT NULL," +
      "address TEXT NOT NULL," +
      "city TEXT NOT NULL," +
      "country TEXT NOT NULL," +
      "presentation TEXT," +
      "photo_url TEXT," +
      "social_links JSONB NOT NULL DEFAULT '[]'::jsonb," +
      "created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()," +
      "updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()" +
    ")"
  );

  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS whatsapp_message TEXT");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS services JSONB NOT NULL DEFAULT '[]'::jsonb");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS cover_url TEXT");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS company_presentation TEXT");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS appointment_url TEXT");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS service_images JSONB NOT NULL DEFAULT '[]'::jsonb");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS commercial_cta_label TEXT");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS commercial_cta_url TEXT");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS offer_title TEXT");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS offer_text TEXT");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS offer_url TEXT");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS offer_start_date DATE");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS offer_end_date DATE");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS brochure_label TEXT");
  await query("ALTER TABLE cards ADD COLUMN IF NOT EXISTS brochure_url TEXT");

  await query(
    "UPDATE cards SET " +
    "services = CASE WHEN services = '[]'::jsonb THEN $1::jsonb ELSE services END," +
    "commercial_cta_label = COALESCE(commercial_cta_label, $2)," +
    "commercial_cta_url = COALESCE(commercial_cta_url, $3)," +
    "whatsapp_message = COALESCE(whatsapp_message, $4) " +
    "WHERE slug = 'demo-vigilus'",
    [
      JSON.stringify(["Sécurité humaine","Sécurité électronique","Facility Management","Mobilité professionnelle"]),
      "Découvrir nos solutions",
      "https://www.groupevigilus.com",
      "Bonjour Awa, je viens de consulter votre carte Vigilus et je souhaite échanger au sujet de nos besoins."
    ]
  );

  await query(
    "CREATE TABLE IF NOT EXISTS scans (" +
      "id SERIAL PRIMARY KEY," +
      "card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE," +
      "source TEXT NOT NULL DEFAULT 'nfc' CHECK (source IN ('nfc','qr'))," +
      "user_agent TEXT," +
      "referer TEXT," +
      "scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()" +
    ")"
  );

  await query(
    "CREATE TABLE IF NOT EXISTS brand_configs (" +
      "subsidiary TEXT PRIMARY KEY," +
      "primary_color TEXT NOT NULL," +
      "accent_color TEXT NOT NULL," +
      "logo_url TEXT," +
      "social_links JSONB" +
    ")"
  );

  await query("ALTER TABLE brand_configs ADD COLUMN IF NOT EXISTS social_links JSONB");

  await query(
    "CREATE TABLE IF NOT EXISTS media_assets (" +
      "filename TEXT PRIMARY KEY," +
      "mime_type TEXT NOT NULL," +
      "data_base64 TEXT NOT NULL," +
      "created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()" +
    ")"
  );

  await query("CREATE INDEX IF NOT EXISTS idx_scans_card_id ON scans(card_id)");
  await query("CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at)");
  await query("CREATE UNIQUE INDEX IF NOT EXISTS idx_cards_email_unique ON cards(lower(email))");

  for (const brand of defaultBrandConfigs) {
    await query(
      "INSERT INTO brand_configs (subsidiary,primary_color,accent_color,logo_url) " +
      "VALUES ($1,$2,$3,$4) ON CONFLICT (subsidiary) DO NOTHING",
      [brand.subsidiary, brand.primaryColor, brand.accentColor, brand.logoUrl ?? null]
    );

    await query(
      "UPDATE brand_configs SET logo_url=$1 WHERE subsidiary=$2 " +
      "AND (logo_url IS NULL OR logo_url='' OR logo_url='/branding/vigilus-logo.png')",
      [brand.logoUrl ?? null, brand.subsidiary]
    );
  }

  const countRows = await query<{ count: number }>("SELECT COUNT(*)::int AS count FROM cards");
  if (Number(countRows[0]?.count ?? 0) === 0) {
    for (const profile of seedProfiles) {
      const insertedRows = await query<{ id: number }>(
        "INSERT INTO cards (" +
          "slug,nfc_token,nfc_mode,nfc_status,active,first_name,last_name,job_title," +
          "subsidiary,company,mobile,whatsapp,phone,email,website,address,city,country," +
          "presentation,photo_url,social_links" +
        ") VALUES (" +
          "$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21::jsonb" +
        ") ON CONFLICT (slug) DO NOTHING RETURNING id",
        [
          profile.slug,
          profile.nfcToken,
          profile.nfcMode,
          profile.nfcStatus ?? "new",
          profile.active,
          profile.firstName,
          profile.lastName,
          profile.jobTitle,
          profile.subsidiary,
          profile.company,
          profile.mobile ?? null,
          profile.whatsapp ?? null,
          profile.phone ?? null,
          profile.email,
          profile.website,
          profile.address,
          profile.city,
          profile.country,
          profile.presentation ?? null,
          profile.photoUrl ?? null,
          JSON.stringify(profile.socialLinks ?? [])
        ]
      );
      if (insertedRows[0]) await saveCommercialFields(Number(insertedRows[0].id), profile);
    }
  }
}

async function ensureSchema() {
  if (!globalForDb.vigilusSchemaPromise) {
    globalForDb.vigilusSchemaPromise = initializeDatabase().catch((error) => {
      globalForDb.vigilusSchemaPromise = undefined;
      throw error;
    });
  }
  await globalForDb.vigilusSchemaPromise;
}

export async function getAllProfiles(options?: { includeInactive?: boolean }) {
  await ensureSchema();
  const rows = options?.includeInactive
    ? await query<CardRow>("SELECT * FROM cards ORDER BY first_name,last_name")
    : await query<CardRow>("SELECT * FROM cards WHERE active=TRUE ORDER BY first_name,last_name");
  return rows.map((row) => rowToCard(row)!);
}

export async function getProfileBySlug(slug: string, options?: { includeInactive?: boolean }) {
  if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL?.trim() && !options?.includeInactive) {
    return seedProfiles.find((profile) => profile.active && profile.slug === slug);
  }
  await ensureSchema();
  const rows = options?.includeInactive
    ? await query<CardRow>("SELECT * FROM cards WHERE slug=$1 LIMIT 1", [slug])
    : await query<CardRow>("SELECT * FROM cards WHERE slug=$1 AND active=TRUE LIMIT 1", [slug]);
  return rowToCard(rows[0]);
}

export async function getProfileByEmail(email: string) {
  await ensureSchema();
  const rows = await query<CardRow>(
    "SELECT * FROM cards WHERE lower(email)=lower($1) LIMIT 1",
    [email]
  );
  return rowToCard(rows[0]);
}

export async function getProfileByNfcToken(
  token: string,
  options?: { includeInactive?: boolean }
) {
  await ensureSchema();
  const rows = options?.includeInactive
    ? await query<CardRow>("SELECT * FROM cards WHERE nfc_token=$1 LIMIT 1", [token])
    : await query<CardRow>(
        "SELECT * FROM cards WHERE nfc_token=$1 AND active=TRUE LIMIT 1",
        [token]
      );
  return rowToCard(rows[0]);
}

export async function getCardById(id: number) {
  await ensureSchema();
  const rows = await query<CardRow>("SELECT * FROM cards WHERE id=$1 LIMIT 1", [id]);
  return rowToCard(rows[0]);
}

async function saveCommercialFields(id: number, card: DigitalCard) {
  await query(
    "UPDATE cards SET " +
      "whatsapp_message=$1,services=$2::jsonb,commercial_cta_label=$3,commercial_cta_url=$4," +
      "offer_title=$5,offer_text=$6,offer_url=$7,offer_start_date=$8,offer_end_date=$9," +
      "brochure_label=$10,brochure_url=$11,cover_url=$12,company_presentation=$13," +
      "appointment_url=$14,service_images=$15::jsonb,updated_at=NOW() WHERE id=$16",
    [
      card.whatsappMessage ?? null,
      JSON.stringify(card.services ?? []),
      card.commercialCtaLabel ?? null,
      card.commercialCtaUrl ?? null,
      card.offerTitle ?? null,
      card.offerText ?? null,
      card.offerUrl ?? null,
      card.offerStartDate || null,
      card.offerEndDate || null,
      card.brochureLabel ?? null,
      card.brochureUrl ?? null,
      card.coverUrl ?? null,
      card.companyPresentation ?? null,
      card.appointmentUrl ?? null,
      JSON.stringify(card.serviceImages ?? []),
      id
    ]
  );
}

export async function saveCard(card: DigitalCard) {
  await ensureSchema();
  const socialLinks = JSON.stringify(card.socialLinks ?? []);

  if (card.id) {
    await query(
      "UPDATE cards SET " +
        "slug=$1,nfc_token=$2,nfc_mode=$3,nfc_status=$4,active=$5," +
        "first_name=$6,last_name=$7,job_title=$8,subsidiary=$9,company=$10," +
        "mobile=$11,whatsapp=$12,phone=$13,email=$14,website=$15,address=$16," +
        "city=$17,country=$18,presentation=$19,photo_url=$20,social_links=$21::jsonb," +
        "updated_at=NOW() WHERE id=$22",
      [
        card.slug,
        card.nfcToken,
        card.nfcMode,
        card.nfcStatus ?? "new",
        card.active,
        card.firstName,
        card.lastName,
        card.jobTitle,
        card.subsidiary,
        card.company,
        card.mobile ?? null,
        card.whatsapp ?? null,
        card.phone ?? null,
        card.email,
        card.website,
        card.address,
        card.city,
        card.country,
        card.presentation ?? null,
        card.photoUrl ?? null,
        socialLinks,
        card.id
      ]
    );
    await saveCommercialFields(card.id, card);
    return card.id;
  }

  const rows = await query<{ id: number }>(
    "INSERT INTO cards (" +
      "slug,nfc_token,nfc_mode,nfc_status,active,first_name,last_name,job_title," +
      "subsidiary,company,mobile,whatsapp,phone,email,website,address,city,country," +
      "presentation,photo_url,social_links" +
    ") VALUES (" +
      "$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21::jsonb" +
    ") RETURNING id",
    [
      card.slug,
      card.nfcToken,
      card.nfcMode,
      card.nfcStatus ?? "new",
      card.active,
      card.firstName,
      card.lastName,
      card.jobTitle,
      card.subsidiary,
      card.company,
      card.mobile ?? null,
      card.whatsapp ?? null,
      card.phone ?? null,
      card.email,
      card.website,
      card.address,
      card.city,
      card.country,
      card.presentation ?? null,
      card.photoUrl ?? null,
      socialLinks
    ]
  );

  const newId = Number(rows[0].id);
  await saveCommercialFields(newId, card);
  return newId;
}

export async function setCardActive(id: number, active: boolean) {
  await ensureSchema();
  await query("UPDATE cards SET active=$1,updated_at=NOW() WHERE id=$2", [active, id]);
}

export async function setCardProvisioningStatus(
  id: number,
  status: NfcProvisioningStatus
) {
  await ensureSchema();

  if (status === "new") {
    await query(
      "UPDATE cards SET nfc_status='new',programmed_at=NULL,tested_at=NULL,updated_at=NOW() WHERE id=$1",
      [id]
    );
    return;
  }

  if (status === "programmed") {
    await query(
      "UPDATE cards SET nfc_status='programmed'," +
      "programmed_at=COALESCE(programmed_at,NOW()),tested_at=NULL,updated_at=NOW() WHERE id=$1",
      [id]
    );
    return;
  }

  await query(
    "UPDATE cards SET nfc_status='tested'," +
    "programmed_at=COALESCE(programmed_at,NOW()),tested_at=NOW(),updated_at=NOW() WHERE id=$1",
    [id]
  );
}

export async function getBrandConfig(subsidiary: string) {
  if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL?.trim()) {
    return defaultBrandFor(subsidiary);
  }
  await ensureSchema();
  const rows = await query<BrandRow>(
    "SELECT * FROM brand_configs WHERE subsidiary=$1 LIMIT 1",
    [subsidiary]
  );
  return rowToBrand(rows[0]) ?? defaultBrandFor(subsidiary);
}

export async function getAllBrandConfigs() {
  await ensureSchema();
  const rows = await query<BrandRow>("SELECT * FROM brand_configs ORDER BY subsidiary");
  return rows.map((row) => rowToBrand(row)!);
}

export async function saveBrandConfig(config: BrandConfig) {
  await ensureSchema();
  await query(
    "INSERT INTO brand_configs (subsidiary,primary_color,accent_color,logo_url,social_links) " +
    "VALUES ($1,$2,$3,$4,$5::jsonb) ON CONFLICT (subsidiary) DO UPDATE SET " +
    "primary_color=EXCLUDED.primary_color,accent_color=EXCLUDED.accent_color," +
    "logo_url=EXCLUDED.logo_url,social_links=EXCLUDED.social_links",
    [config.subsidiary, config.primaryColor, config.accentColor, config.logoUrl ?? null,
      config.socialLinks === undefined ? null : JSON.stringify(config.socialLinks)]
  );
}

export async function recordScan(
  token: string,
  source: "nfc" | "qr",
  metadata?: { userAgent?: string | null; referer?: string | null }
) {
  const card = await getProfileByNfcToken(token, { includeInactive: true });
  if (!card?.id || !card.active) return;

  await query(
    "INSERT INTO scans (card_id,source,user_agent,referer) VALUES ($1,$2,$3,$4)",
    [
      card.id,
      source,
      metadata?.userAgent?.slice(0, 500) ?? null,
      metadata?.referer?.slice(0, 500) ?? null
    ]
  );
}

export async function getDashboardStats() {
  await ensureSchema();
  const [total, active, ready, today, sevenDays] = await Promise.all([
    query<{ count: number }>("SELECT COUNT(*)::int AS count FROM cards"),
    query<{ count: number }>("SELECT COUNT(*)::int AS count FROM cards WHERE active=TRUE"),
    query<{ count: number }>("SELECT COUNT(*)::int AS count FROM cards WHERE nfc_status='tested'"),
    query<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM scans WHERE scanned_at>=CURRENT_DATE"
    ),
    query<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM scans WHERE scanned_at>=NOW()-INTERVAL '7 days'"
    )
  ]);

  return {
    totalCards: Number(total[0]?.count ?? 0),
    activeCards: Number(active[0]?.count ?? 0),
    readyCards: Number(ready[0]?.count ?? 0),
    scansToday: Number(today[0]?.count ?? 0),
    scans7Days: Number(sevenDays[0]?.count ?? 0)
  };
}

export async function getRecentScans(limit = 12) {
  await ensureSchema();
  return query<{
    id: number;
    source: string;
    scannedAt: string;
    firstName: string;
    lastName: string;
    subsidiary: string;
  }>(
    "SELECT scans.id AS id,scans.source AS source,scans.scanned_at AS \"scannedAt\"," +
    "cards.first_name AS \"firstName\",cards.last_name AS \"lastName\",cards.subsidiary AS subsidiary " +
    "FROM scans JOIN cards ON cards.id=scans.card_id " +
    "ORDER BY scans.scanned_at DESC LIMIT $1",
    [limit]
  );
}

export async function getTopCards(limit = 5) {
  await ensureSchema();
  return query<{
    id: number;
    firstName: string;
    lastName: string;
    subsidiary: string;
    scans: number;
  }>(
    "SELECT cards.id AS id,cards.first_name AS \"firstName\",cards.last_name AS \"lastName\"," +
    "cards.subsidiary AS subsidiary,COUNT(scans.id)::int AS scans " +
    "FROM cards LEFT JOIN scans ON scans.card_id=cards.id " +
    "GROUP BY cards.id ORDER BY scans DESC,cards.first_name ASC LIMIT $1",
    [limit]
  );
}

export async function saveMediaAsset(
  filename: string,
  mimeType: string,
  dataBase64: string
) {
  await ensureSchema();
  await query(
    "INSERT INTO media_assets (filename,mime_type,data_base64) VALUES ($1,$2,$3) " +
    "ON CONFLICT (filename) DO UPDATE SET mime_type=EXCLUDED.mime_type,data_base64=EXCLUDED.data_base64",
    [filename, mimeType, dataBase64]
  );
}

export async function getMediaAsset(filename: string): Promise<MediaAsset | undefined> {
  await ensureSchema();
  const rows = await query<MediaAsset>(
    "SELECT filename,mime_type AS \"mimeType\",data_base64 AS \"dataBase64\" " +
    "FROM media_assets WHERE filename=$1 LIMIT 1",
    [filename]
  );
  return rows[0];
}
