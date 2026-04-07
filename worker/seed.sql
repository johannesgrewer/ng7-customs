-- Seed: NG7 Customs Werke (Platzhalter-Daten)
-- Run: npx wrangler d1 execute ng7-contacts --file=worker/seed.sql --remote

-- Einzelstücke
INSERT OR IGNORE INTO werke (id, name, kategorie, bild_key, aktiv, reihenfolge) VALUES
  ('a1000000000000000000000000000001', 'Messerkordel I',   'einzelstuecke', 'werke/produkt-01.webp', 1, 1),
  ('a1000000000000000000000000000002', 'Messerkordel II',  'einzelstuecke', 'werke/produkt-02.webp', 1, 2),
  ('a1000000000000000000000000000003', 'Messerkordel III', 'einzelstuecke', 'werke/produkt-03.webp', 1, 3),
  ('a1000000000000000000000000000004', 'Messerkordel IV',  'einzelstuecke', 'werke/produkt-04.webp', 1, 4),
  ('a1000000000000000000000000000005', 'Phone Stand',      'einzelstuecke', 'werke/produkt-phone-stand.webp', 1, 5);

-- Entwicklung
INSERT OR IGNORE INTO werke (id, name, kategorie, bild_key, aktiv, reihenfolge) VALUES
  ('b1000000000000000000000000000001', 'Messerkordel V',    'entwicklung', 'werke/produkt-05.webp', 1, 1),
  ('b1000000000000000000000000000002', 'Messerkordel Orig', 'entwicklung', 'werke/produkt-messerkordel-orig.webp', 1, 2);

-- Custom
INSERT OR IGNORE INTO werke (id, name, kategorie, bild_key, aktiv, reihenfolge) VALUES
  ('c1000000000000000000000000000001', 'Kitchen Knife', 'custom', 'werke/produkt-kitchen-knife.webp', 1, 1),
  ('c1000000000000000000000000000002', 'Laserschwert',  'custom', 'werke/produkt-laserschwert.webp',  1, 2);

-- Neue Werke (Startseite)
INSERT OR IGNORE INTO werke (id, name, kategorie, bild_key, aktiv, reihenfolge) VALUES
  ('d1000000000000000000000000000001', 'Messerkordel I',   'neue_werke', 'werke/produkt-01.webp', 1, 1),
  ('d1000000000000000000000000000002', 'Messerkordel II',  'neue_werke', 'werke/produkt-02.webp', 1, 2),
  ('d1000000000000000000000000000003', 'Messerkordel III', 'neue_werke', 'werke/produkt-03.webp', 1, 3),
  ('d1000000000000000000000000000004', 'Messerkordel IV',  'neue_werke', 'werke/produkt-04.webp', 1, 4);
