/**
 * Optimiert alle vorhandenen Bilder in R2:
 * - Resize auf max. 2000px Breite
 * - Konvertierung zu WebP (Qualität 82)
 * - Gleicher Key, WebP Content-Type → DB bleibt unverändert
 *
 * Ausführen aus dem worker/-Ordner:
 *   node migrate-optimize-images.mjs
 *
 * Admin-Passwort als Env-Variable übergeben:
 *   ADMIN_PW=ng7admin2025 node migrate-optimize-images.mjs
 */

import sharp from 'sharp';
import { spawnSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';

const WORKER_URL = 'https://ng7-contact.contact-1f9.workers.dev';
const BUCKET = 'ng7-images';
const TEMP_DIR = './tmp-optimize';
const ADMIN_PW = process.env.ADMIN_PW;

if (!ADMIN_PW) {
  console.error('Fehler: ADMIN_PW Env-Variable fehlt.');
  console.error('Aufruf: ADMIN_PW=<passwort> node migrate-optimize-images.mjs');
  process.exit(1);
}

if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR);

// 1. Auth-Token holen
console.log('Authentifiziere...');
const loginRes = await fetch(`${WORKER_URL}/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: ADMIN_PW }),
});
if (!loginRes.ok) { console.error('Login fehlgeschlagen'); process.exit(1); }
const { token } = await loginRes.json();

// 2. Alle bild_keys sammeln
console.log('Lade Image-Keys...');
const headers = { Authorization: `Bearer ${token}` };

const [werkeRes, settingsRes] = await Promise.all([
  fetch(`${WORKER_URL}/api/werke/all`, { headers }),
  fetch(`${WORKER_URL}/api/settings`),
]);
const werke = await werkeRes.json();
const settings = await settingsRes.json();

const keySet = new Set();
for (const w of werke) {
  if (w.bild_key) keySet.add(w.bild_key);
}
for (const val of Object.values(settings)) {
  // settings values are like "/images/key" — strip prefix
  if (val && typeof val === 'string') {
    const k = val.replace(/^\/images\//, '');
    if (k) keySet.add(k);
  }
}

// werk_bilder holen
const bilderRes = await fetch(`${WORKER_URL}/api/werke?with_bilder=1`);
const werkeWithBilder = await bilderRes.json();
for (const w of werkeWithBilder) {
  for (const b of (w.bilder || [])) {
    if (b.bild_url) keySet.add(b.bild_url.replace(/^\/images\//, ''));
  }
}

const keys = [...keySet];
console.log(`${keys.length} Bilder gefunden.\n`);

// 3. Wrangler r2 object put helper
function r2put(key, filePath) {
  const result = spawnSync(
    'npx', ['wrangler', 'r2', 'object', 'put', `${BUCKET}/${key}`, '--file', filePath, '--content-type', 'image/webp', '--remote'],
    { encoding: 'utf8', shell: true }
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || 'r2 put fehlgeschlagen');
}

// 4. Jedes Bild optimieren
let optimized = 0, skipped = 0, failed = 0;

for (const key of keys) {
  try {
    process.stdout.write(`[${key}] `);

    const res = await fetch(`${WORKER_URL}/images/${key}`);
    if (!res.ok) { console.log(`✗ nicht gefunden`); skipped++; continue; }

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || '';

    // Bereits WebP und klein genug? Überspringen
    if (contentType === 'image/webp' && buffer.length < 300 * 1024) {
      console.log(`↷ bereits optimiert (${(buffer.length / 1024).toFixed(0)} KB)`);
      skipped++;
      continue;
    }

    const tempIn = `${TEMP_DIR}/input`;
    const tempOut = `${TEMP_DIR}/output.webp`;
    writeFileSync(tempIn, buffer);

    const info = await sharp(tempIn)
      .resize(2000, null, { withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(tempOut);

    const saving = Math.round((1 - info.size / buffer.length) * 100);
    r2put(key, tempOut);

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
