CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  bild_key TEXT DEFAULT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (key, bild_key) VALUES
  ('kat_einzelstuecke', NULL),
  ('kat_entwicklung', NULL),
  ('kat_custom', NULL);
