-- NG7 Customs — Datenbankschema
-- Run: npx wrangler d1 execute ng7-contacts --file=schema.sql --remote

CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  kategorie TEXT DEFAULT '',
  nachricht TEXT NOT NULL,
  ip TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS werke (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  kategorie TEXT NOT NULL CHECK(kategorie IN ('einzelstuecke', 'entwicklung', 'custom', 'neue_werke')),
  bild_key TEXT DEFAULT NULL,
  aktiv INTEGER NOT NULL DEFAULT 1,
  reihenfolge INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_werke_kategorie ON werke(kategorie);
CREATE INDEX IF NOT EXISTS idx_werke_aktiv ON werke(aktiv);
CREATE INDEX IF NOT EXISTS idx_werke_reihenfolge ON werke(reihenfolge);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  bild_key TEXT DEFAULT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (key, bild_key) VALUES
  ('kat_einzelstuecke', NULL),
  ('kat_entwicklung', NULL),
  ('kat_custom', NULL);
