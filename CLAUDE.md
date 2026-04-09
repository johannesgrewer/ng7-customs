# NG7 Customs — Website

## Status
CMS + Galerie vollständig implementiert und live. Admin-Panel mit Image Manager (Drag-Drop, Cover-Sync, automatische WebP-Optimierung bei Upload). Lightbox auf allen Produktseiten. Domain `ng7-customs.com` live (SSL aktiv). E-Mail UTF-8 korrekt. Mobile vollständig optimiert (Fullscreen-Nav, zentrierte Layouts, Kategorie-Karten Stack, Bild-Optimierung). R2-Bilder migriert (WebP). **Launch-ready** — ausstehend: E-Mail-Bestätigung durch Nicolas.

## Tech Stack
- **Framework:** Astro 6 (SSG, static output)
- **Styling:** Tailwind CSS 4 + CSS Custom Properties (globals.css)
- **Fonts:** Bitter (Display, serif) + Work Sans (Body, sans-serif) — self-hosted, public/fonts/
- **Page Transitions:** Astro View Transitions (ClientRouter)
- **Backend:** Cloudflare Worker (`worker/`) + D1 (SQLite) + R2 (Bilder)
- **Auth:** HMAC-SHA256 stateless Token (kein Session-Storage nötig)
- **E-Mail:** Resend API (noch nicht konfiguriert)
- **Hosting Frontend:** Vercel (GitHub-Integration, auto-deploy bei Push)
- **Sitemap:** @astrojs/sitemap (automatisch)
- **Dev Server:** `npm run dev` → localhost:4321

## Farbschema
Alle Farben in `src/styles/global.css` als CSS Custom Properties:
- Hintergrund: `--ng7-bg` (#1A1917)
- Hintergrund mittel: `--ng7-bg-mid` (#4A4639)
- Hintergrund olive: `--ng7-bg-olive` (#656350)
- Surface: `--ng7-surface` (#2A2723)
- Akzent (Gold): `--ng7-accent` (#A0977D), Hover: `--ng7-accent-hover` (#C4B68A)
- Text: `--ng7-text` (#F5F0E8), `--ng7-text-mid` (#B5AFA3), `--ng7-text-muted` (#8A8070)

## Fonts
- Display: `var(--font-display)` = Bitter, Georgia, serif
- Body: `var(--font-body)` = Work Sans, system-ui, sans-serif
- NIEMALS Google Fonts CDN — immer lokal aus public/fonts/

## Key Files
- `src/styles/global.css` — Design-Tokens, @font-face, Buttons
- `src/layouts/Layout.astro` — Head, Header (mit Instagram-Icon), Footer (mit PortaWerk-Credit)
- `src/pages/index.astro` — Homepage, fetcht `neue_werke` aus CMS (max 4)
- `src/pages/einzelstuecke.astro` / `entwicklung.astro` / `custom.astro` — fetchen aus CMS
- `src/components/Kategorien.astro` — fetcht Kategorie-Bilder aus `/api/settings`
- `src/components/LegalPage.astro` — Shared wrapper für Impressum/Datenschutz/AGB
- `worker/src/index.ts` — Cloudflare Worker (alle API-Routen)
- `worker/src/admin-html.ts` — Admin-Panel HTML (Single-Page-App)
- `worker/wrangler.toml` — Worker-Konfiguration (D1, R2, Vars)
- `worker/schema.sql` — DB-Schema (werke + settings + contact_submissions)
- `worker/seed.sql` — 13 Platzhalter-Werke
- `vercel.json` — Security Headers + Rewrites zu Worker

## CMS-Architektur
```
Vercel (Frontend, SSG)
  └── /admin → Cloudflare Worker → Admin-HTML
  └── /api/* → Cloudflare Worker → D1 (SQLite)
  └── /images/* → Cloudflare Worker → R2 (Bilder)
```

**D1 Tabellen:**
- `werke` — id, name, kategorie, bild_key, aktiv, reihenfolge, beschreibung
- `werk_bilder` — id, werk_id, bild_key, beschreibung, reihenfolge (Cover = Index 0, bild_key in werke immer in Sync)
- `settings` — key, bild_key (kat_einzelstuecke, kat_entwicklung, kat_custom)
- `contact_submissions` — Kontaktformular-Einträge

**Worker deployen:**
```bash
cd worker && npx wrangler deploy
```

**D1 Migration:**
```bash
npx wrangler d1 execute ng7-contacts --file=worker/schema.sql --remote
# Galerie-Migration (bereits gelaufen):
npx wrangler d1 execute ng7-contacts --file=worker/migrate-bilder.sql --remote
npx wrangler d1 execute ng7-contacts --file=worker/migrate-redesign.sql --remote
```

**Worker-Secrets:**
```
ADMIN_PASSWORD   → gesetzt (ng7admin2025)
RESEND_API_KEY   → noch nicht gesetzt
VERCEL_DEPLOY_HOOK → noch nicht gesetzt
```

## Admin-Panel
- URL: `https://[domain]/admin`
- Login mit ADMIN_PASSWORD
- Tabs: Alle / Einzelstücke / Entwicklung / Individualisierung / Neue Werke / ⚙ Einstellungen
- "Veröffentlichen"-Button triggert Vercel Deploy Hook
- Neue Werke: max. 4 werden auf Startseite angezeigt (Warnung im Admin)
- Einstellungen-Tab: Kategorie-Bilder hochladen (Einzelstücke, Entwicklung, Individualisierung)
- **Image Manager im Modal:** großes Hauptbild-Preview + horizontaler Drag-Drop Thumb-Strip, Cover-Badge auf erstem Bild, "+" Button zum Hochladen
- Neues Werk: zuerst Name/Kat speichern → Modal bleibt offen im Edit-Mode → dann Bilder hochladen

## API-Routen (alle über Vercel-Rewrite)
- `GET /api/werke?kategorie=X&with_bilder=1` — öffentlich, für Astro-Build (inkl. Galerie-Bilder)
- `GET /api/werke/all` — auth, Admin
- `POST/PUT/DELETE /api/werke/:id` — auth
- `GET /api/werke/:id/bilder` — öffentlich, Galerie für ein Werk
- `POST /api/werke/:id/bilder` — auth, Bild hinzufügen (auto-setzt Cover wenn erstes)
- `PUT /api/werke/:id/bilder/reorder` — auth, Reihenfolge ändern (synct Cover)
- `PUT /api/werke/bilder/:bildId` — auth, Bild-Metadaten
- `DELETE /api/werke/bilder/:bildId` — auth, Bild löschen (synct Cover)
- `POST /api/upload` — auth, Bild zu R2
- `GET /images/:path*` — öffentlich, R2 serve
- `GET /api/settings` — öffentlich
- `PUT /api/settings/:key` — auth
- `POST /api/deploy` — auth, Vercel Hook
- `POST /api/contact` — öffentlich, Kontaktformular

**Wichtig Vercel-Rewrite-Reihenfolge:** Exakter Pfad `/api/werke` MUSS vor Wildcard `/api/werke/:path*` stehen — sonst matcht Wildcard mit Trailing Slash.

## Kontaktformular — Spam-Schutz (4 Stufen)
1. Honeypot-Feld (unsichtbar)
2. Zeitprüfung (< 3s = Bot)
3. Rate-Limiting (3/IP/10min, im Worker)
4. Link-Filter (URLs in Nachricht = Block)

## Bekannte Platzhalter (vor Launch klären)
- `impressum.astro` + `datenschutz.astro`: Straße + PLZ fehlen → `[NACHTRAGEN]`
- `RESEND_API_KEY` nicht gesetzt → Kontaktformular sendet keine E-Mails
- `VERCEL_DEPLOY_HOOK` nicht gesetzt → "Veröffentlichen" im Admin funktioniert nicht
- OG-Image: `/og-image.jpg` noch nicht erstellt (1200×630)
- Apple Touch Icon: `/apple-touch-icon.png` noch nicht erstellt (180×180)
- Echte Domain `ng7-customs.de` noch nicht in Vercel eingetragen

## Design-Patterns
- **Fonts:** Immer `var(--font-display)` / `var(--font-body)` — nie hardcoded
- **Farben:** Immer CSS Custom Properties — nie hardcoded Hex (außer globals.css)
- **Hover:** Nur in `@media (hover: hover)` für Desktop-only Effekte
- **Animationen:** CSS transitions, IntersectionObserver für Scroll-Reveals
- **Buttons:** `.btn-primary`, `.btn-outline`, `.btn-outline-white` aus globals.css
- **Bilder aus CMS:** Immer `/images/${bild_key}` — NICHT die volle Worker-URL (CSP!)

## Letzte Session
**Datum:** 2026-04-08
**Schwerpunkt:** Mobile UX Improvements + automatische Bild-Optimierung

**Erreicht:**
- Divider über-mich → echtes Client-Foto (`public/fotos/divider-client.webp`, aus clientimages/43742.jpg via sharp)
- Tugenden in über-mich: Beschreibungstext auf Mobile direkt unter Name (kein Hover nötig)
- Fullscreen Mobile-Menü: fixed overlay (`z-[60]`), große Klickziele, Hamburger/X-Icon
- Kategorie-Karten Mobile: Bild ohne Overlay + `bg: #2A2723` Textkasten darunter (Desktop bleibt unverändert)
- NeueWerke: `grid-cols-1` auf Mobile (4 Karten untereinander)
- WarumNG7: Emblem-Bild wieder oben, CTA-Button als `lg:hidden` direkt unter Tugend-Karte auf Mobile
- Zentrierungen Mobile: AboutPreview, NeueWerke, Galerie, Kategorien, über-mich Headings + Body-Text
- Stagger-Animation auf Kategorie-Karten (IntersectionObserver, translateY)
- Canvas-basierte WebP-Optimierung bei Admin-Upload (max 2000px, 82% Qualität) — kein WASM, kein paid CF
- `worker/migrate-optimize-images.mjs` erstellt: alle 17 R2-Bilder geprüft, 8 optimiert (-90–97%), 9 schon WebP

**Erkenntnisse:**
- `/images/*` Vercel-Rewrite fängt auch `public/images/` ab → SSG-Bilder nach `public/fotos/` (nicht `public/images/`)
- Wrangler v4: kein `r2 object list`, D1 `--command` hat Windows-Quoting-Probleme → Worker HTTP API für Daten-Abruf nutzen
- 375px Mindest-Breakpoint (iPhone SE, kleinste relevante Größe), 320px ignorieren

**Offen:**
1. Nicolas' Bestätigung zur E-Mail (Umlaute + Logo nach letztem Fix)
2. favicon.ico noch Astro-Default (nur SVG aktualisiert — Browser nehmen SVG bevorzugt)
3. `ng7-customs.de` noch nicht in Vercel (falls gewünscht)

## Nächste Schritte (priorisiert)
1. E-Mail-Test mit Nicolas final abschließen → dann Launch
2. favicon.ico updaten (optional — Browser nehmen SVG bevorzugt)
3. `ng7-customs.de` in Vercel eintragen (falls Nicolas die .de-Domain auch will)
