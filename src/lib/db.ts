import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { DigitalCard, SocialLink } from "@/lib/profiles";
import { seedProfiles } from "@/lib/profiles";

type CardRow = {
  id: number;
  slug: string;
  nfc_token: string;
  nfc_mode: "profile" | "vcard";
  active: number;
  first_name: string;
  last_name: string;
  job_title: string;
  subsidiary: string;
  company: string;
  mobile: string | null;
  phone: string | null;
  email: string;
  website: string;
  address: string;
  city: string;
  country: string;
  presentation: string | null;
  photo_url: string | null;
  social_links: string | null;
  created_at: string;
  updated_at: string;
};

const globalForDb = globalThis as unknown as {
  vigilusCardsDb?: Database.Database;
};

function databasePath() {
  const customPath = process.env.DB_PATH?.trim();
  if (customPath) return path.resolve(customPath);
  return path.join(process.cwd(), "data", "vigilus-cards.db");
}

function initializeDatabase() {
  const filePath = databasePath();
  mkdirSync(path.dirname(filePath), { recursive: true });

  const database = new Database(filePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");

  database.exec([
    "CREATE TABLE IF NOT EXISTS cards (",
    "id INTEGER PRIMARY KEY AUTOINCREMENT,",
    "slug TEXT NOT NULL UNIQUE,",
    "nfc_token TEXT NOT NULL UNIQUE,",
    "nfc_mode TEXT NOT NULL DEFAULT 'profile' CHECK (nfc_mode IN ('profile', 'vcard')),",
    "active INTEGER NOT NULL DEFAULT 1,",
    "first_name TEXT NOT NULL, last_name TEXT NOT NULL, job_title TEXT NOT NULL,",
    "subsidiary TEXT NOT NULL, company TEXT NOT NULL, mobile TEXT, phone TEXT,",
    "email TEXT NOT NULL, website TEXT NOT NULL, address TEXT NOT NULL,",
    "city TEXT NOT NULL, country TEXT NOT NULL, presentation TEXT, photo_url TEXT,",
    "social_links TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,",
    "updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
    ");",
    "CREATE TABLE IF NOT EXISTS scans (",
    "id INTEGER PRIMARY KEY AUTOINCREMENT, card_id INTEGER NOT NULL,",
    "source TEXT NOT NULL DEFAULT 'nfc', user_agent TEXT, referer TEXT,",
    "scanned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,",
    "FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE",
    ");",
    "CREATE INDEX IF NOT EXISTS idx_scans_card_id ON scans(card_id);",
    "CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at);"
  ].join("\n"));

  const count = database.prepare("SELECT COUNT(*) AS count FROM cards").get() as { count: number };
  if (count.count === 0) {
    const insert = database.prepare([
      "INSERT INTO cards (slug,nfc_token,nfc_mode,active,first_name,last_name,job_title,",
      "subsidiary,company,mobile,phone,email,website,address,city,country,presentation,photo_url,social_links)",
      "VALUES (@slug,@nfcToken,@nfcMode,@active,@firstName,@lastName,@jobTitle,@subsidiary,@company,",
      "@mobile,@phone,@email,@website,@address,@city,@country,@presentation,@photoUrl,@socialLinks)"
    ].join(" "));

    const seed = database.transaction((profiles: DigitalCard[]) => {
      for (const profile of profiles) {
        insert.run({
          ...profile,
          active: profile.active ? 1 : 0,
          mobile: profile.mobile ?? null,
          phone: profile.phone ?? null,
          presentation: profile.presentation ?? null,
          photoUrl: profile.photoUrl ?? null,
          socialLinks: JSON.stringify(profile.socialLinks ?? [])
        });
      }
    });

    seed(seedProfiles);
  }

  return database;
}

function db() {
  if (!globalForDb.vigilusCardsDb) {
    globalForDb.vigilusCardsDb = initializeDatabase();
  }
  return globalForDb.vigilusCardsDb;
}

function parseSocialLinks(value: string | null): SocialLink[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rowToCard(row: CardRow | undefined): DigitalCard | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    slug: row.slug,
    nfcToken: row.nfc_token,
    nfcMode: row.nfc_mode,
    active: Boolean(row.active),
    firstName: row.first_name,
    lastName: row.last_name,
    jobTitle: row.job_title,
    subsidiary: row.subsidiary,
    company: row.company,
    mobile: row.mobile ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email,
    website: row.website,
    address: row.address,
    city: row.city,
    country: row.country,
    presentation: row.presentation ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    socialLinks: parseSocialLinks(row.social_links),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function getAllProfiles(options?: { includeInactive?: boolean }) {
  const where = options?.includeInactive ? "" : "WHERE active = 1";
  const rows = db().prepare("SELECT * FROM cards " + where + " ORDER BY first_name,last_name").all() as CardRow[];
  return rows.map((row) => rowToCard(row)!);
}

export function getProfileBySlug(slug: string, options?: { includeInactive?: boolean }) {
  const sql = options?.includeInactive
    ? "SELECT * FROM cards WHERE slug = ? LIMIT 1"
    : "SELECT * FROM cards WHERE slug = ? AND active = 1 LIMIT 1";
  return rowToCard(db().prepare(sql).get(slug) as CardRow | undefined);
}

export function getProfileByNfcToken(token: string, options?: { includeInactive?: boolean }) {
  const sql = options?.includeInactive
    ? "SELECT * FROM cards WHERE nfc_token = ? LIMIT 1"
    : "SELECT * FROM cards WHERE nfc_token = ? AND active = 1 LIMIT 1";
  return rowToCard(db().prepare(sql).get(token) as CardRow | undefined);
}

export function getCardById(id: number) {
  return rowToCard(db().prepare("SELECT * FROM cards WHERE id = ? LIMIT 1").get(id) as CardRow | undefined);
}

export function saveCard(card: DigitalCard) {
  const values = {
    id: card.id ?? null,
    slug: card.slug,
    nfcToken: card.nfcToken,
    nfcMode: card.nfcMode,
    active: card.active ? 1 : 0,
    firstName: card.firstName,
    lastName: card.lastName,
    jobTitle: card.jobTitle,
    subsidiary: card.subsidiary,
    company: card.company,
    mobile: card.mobile || null,
    phone: card.phone || null,
    email: card.email,
    website: card.website,
    address: card.address,
    city: card.city,
    country: card.country,
    presentation: card.presentation || null,
    photoUrl: card.photoUrl || null,
    socialLinks: JSON.stringify(card.socialLinks ?? [])
  };

  if (card.id) {
    db().prepare([
      "UPDATE cards SET slug=@slug,nfc_token=@nfcToken,nfc_mode=@nfcMode,active=@active,",
      "first_name=@firstName,last_name=@lastName,job_title=@jobTitle,subsidiary=@subsidiary,",
      "company=@company,mobile=@mobile,phone=@phone,email=@email,website=@website,address=@address,",
      "city=@city,country=@country,presentation=@presentation,photo_url=@photoUrl,social_links=@socialLinks,",
      "updated_at=CURRENT_TIMESTAMP WHERE id=@id"
    ].join(" ")).run(values);
    return card.id;
  }

  const result = db().prepare([
    "INSERT INTO cards (slug,nfc_token,nfc_mode,active,first_name,last_name,job_title,subsidiary,company,",
    "mobile,phone,email,website,address,city,country,presentation,photo_url,social_links)",
    "VALUES (@slug,@nfcToken,@nfcMode,@active,@firstName,@lastName,@jobTitle,@subsidiary,@company,",
    "@mobile,@phone,@email,@website,@address,@city,@country,@presentation,@photoUrl,@socialLinks)"
  ].join(" ")).run(values);

  return Number(result.lastInsertRowid);
}

export function setCardActive(id: number, active: boolean) {
  db().prepare("UPDATE cards SET active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(active ? 1 : 0, id);
}

export function recordScan(
  token: string,
  source: "nfc" | "qr",
  metadata?: { userAgent?: string | null; referer?: string | null }
) {
  const card = getProfileByNfcToken(token, { includeInactive: true });
  if (!card?.id || !card.active) return;

  db().prepare(
    "INSERT INTO scans (card_id,source,user_agent,referer) VALUES (?,?,?,?)"
  ).run(
    card.id,
    source,
    metadata?.userAgent?.slice(0, 500) ?? null,
    metadata?.referer?.slice(0, 500) ?? null
  );
}

export function getDashboardStats() {
  const totalCards = (db().prepare("SELECT COUNT(*) AS count FROM cards").get() as { count: number }).count;
  const activeCards = (db().prepare("SELECT COUNT(*) AS count FROM cards WHERE active=1").get() as { count: number }).count;
  const scansToday = (db().prepare("SELECT COUNT(*) AS count FROM scans WHERE date(scanned_at)=date('now')").get() as { count: number }).count;
  const scans7Days = (db().prepare("SELECT COUNT(*) AS count FROM scans WHERE scanned_at>=datetime('now','-7 days')").get() as { count: number }).count;
  return { totalCards, activeCards, scansToday, scans7Days };
}

export function getRecentScans(limit = 12) {
  return db().prepare([
    "SELECT scans.id AS id,scans.source AS source,scans.scanned_at AS scannedAt,",
    "cards.first_name AS firstName,cards.last_name AS lastName,cards.subsidiary AS subsidiary",
    "FROM scans JOIN cards ON cards.id=scans.card_id",
    "ORDER BY scans.scanned_at DESC LIMIT ?"
  ].join(" ")).all(limit) as Array<{
    id: number;
    source: string;
    scannedAt: string;
    firstName: string;
    lastName: string;
    subsidiary: string;
  }>;
}

export function getTopCards(limit = 5) {
  return db().prepare([
    "SELECT cards.id AS id,cards.first_name AS firstName,cards.last_name AS lastName,",
    "cards.subsidiary AS subsidiary,COUNT(scans.id) AS scans",
    "FROM cards LEFT JOIN scans ON scans.card_id=cards.id",
    "GROUP BY cards.id ORDER BY scans DESC,cards.first_name ASC LIMIT ?"
  ].join(" ")).all(limit) as Array<{
    id: number;
    firstName: string;
    lastName: string;
    subsidiary: string;
    scans: number;
  }>;
}
