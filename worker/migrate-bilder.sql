-- Galerie-Bilder pro Werk
-- Run: npx wrangler d1 execute ng7-contacts --file=worker/migrate-bilder.sql --remote

CREATE TABLE IF NOT EXISTS werk_bilder (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  werk_id TEXT NOT NULL,
  bild_key TEXT NOT NULL,
  beschreibung TEXT DEFAULT NULL,
  reihenfolge INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_werk_bilder_werk_id ON werk_bilder(werk_id);
