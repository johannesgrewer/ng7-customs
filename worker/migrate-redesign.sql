-- Modal-Redesign: beschreibung + Cover in werk_bilder migrieren
-- Run: npx wrangler d1 execute ng7-contacts --file=worker/migrate-redesign.sql --remote

-- 1. Beschreibung pro Werk (erscheint im Lightbox)
ALTER TABLE werke ADD COLUMN beschreibung TEXT DEFAULT NULL;

-- 2. Bestehende Galerie-Bilder um 1 aufrücken lassen (Platz für Cover an Position 0)
UPDATE werk_bilder SET reihenfolge = reihenfolge + 1
WHERE werk_id IN (SELECT id FROM werke WHERE bild_key IS NOT NULL);

-- 3. Cover-Bild als Position 0 in werk_bilder eintragen
INSERT INTO werk_bilder (id, werk_id, bild_key, reihenfolge)
SELECT lower(hex(randomblob(16))), id, bild_key, 0
FROM werke WHERE bild_key IS NOT NULL;
