/**
 * Optimiert alle vorhandenen Bilder in R2:
 * - Resize auf max. 1500px Breite
 * - Konvertierung zu WebP (Qualität 82)
 * - Gleicher Key, WebP Content-Type → DB bleibt unverändert
 *
 * Ausführen aus dem worker/-Ordner:
 *   npm install sharp
 *   node migrate-optimize-images.mjs
 */

import sharp from 'sharp';
import { execFileSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';

const WORKER_URL = 'https://ng7-contact.contact-1f9.workers.dev';
const BUCKET = 'ng7-images';
const TEMP_DIR = './tmp-optimize';
const DB = 'ng7-contacts';

if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR);

function wrangler(...args) {
  return execFileSync('npx', ['wrangler', ...args], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

// Alle bild_keys aus der DB holen
console.log('Lade Image-Keys aus D1...');
const raw = wrangler(
  'd1', 'execute', DB, '--remote', '--json',
  '--command', 'SELECT bild_key FROM werke WHERE bild_key IS NOT NULL UNION SELECT bild_key FROM werk_bilder WHERE bild_key IS NOT NULL UNION SELECT bild_key FROM settings WHERE bild_key IS NOT NULL'
);

const keys = JSON.parse(raw)[0].results.map(r => r.bild_key);
console.log(`${keys.length} Bilder gefunden.\n`);

let optimized = 0, skipped = 0, failed = 0;

for (const key of keys) {
  try {
    process.stdout.write(`[${key}] `);

    const res = await fetch(`${WORKER_URL}/images/${key}`);
    if (!res.ok) { console.log(`✗ nicht gefunden`); skipped++; continue; }

    const buffer = Buffer.from(await res.arrayBuffer());
    const tempIn = `${TEMP_DIR}/input`;
    const tempOut = `${TEMP_DIR}/output.webp`;
    writeFileSync(tempIn, buffer);

    const info = await sharp(tempIn)
      .resize(2000, null, { withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(tempOut);

    const saving = Math.round((1 - info.size / buffer.length) * 100);

    wrangler('r2', 'object', 'put', `${BUCKET}/${key}`, '--file', tempOut, '--content-type', 'image/webp', '--remote');

    console.log(`✓  ${(buffer.length / 1024).toFixed(0)} KB → ${(info.size / 1024).toFixed(0)} KB  (-${saving}%)`);
    optimized++;

    unlinkSync(tempIn);
    unlinkSync(tempOut);
  } catch (err) {
    console.log(`✗ Fehler: ${err.message}`);
    failed++;
  }
}

console.log(`\nFertig: ${optimized} optimiert, ${skipped} übersprungen, ${failed} Fehler.`);
