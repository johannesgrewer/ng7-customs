# NG7 Customs — Website

## Status
CMS + Galerie vollständig implementiert und live. Admin-Panel mit Image Manager (Drag-Drop, Cover-Sync, automatische WebP-Optimierung bei Upload). Lightbox auf allen Produktseiten. Domain `ng7-customs.com` live (SSL aktiv). E-Mail bestätigt durch Nicolas (UTF-8 korrekt). Mobile vollständig optimiert. R2-Bilder migriert (WebP). **Launch-ready** — ausstehend: Launch-Freigabe durch Nicolas.

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
RESEND_API_KEY   → gesetzt (Cloudflare Email Routing)
VERCEL_DEPLOY_HOOK → gesetzt
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
- Keine — alles erledigt. Domain .de nicht verfügbar, nur .com aktiv.

## Design-Patterns
- **Fonts:** Immer `var(--font-display)` / `var(--font-body)` — nie hardcoded
- **Farben:** Immer CSS Custom Properties — nie hardcoded Hex (außer globals.css)
- **Hover:** Nur in `@media (hover: hover)` für Desktop-only Effekte
- **Animationen:** CSS transitions, IntersectionObserver für Scroll-Reveals
- **Buttons:** `.btn-primary`, `.btn-outline`, `.btn-outline-white` aus globals.css
- **Bilder aus CMS:** Immer `/images/${bild_key}` — NICHT die volle Worker-URL (CSP!)

## Letzte Session
**Datum:** 2026-04-09
**Schwerpunkt:** Home-Redesign (Hero, Navbar, Kategorien, Divider, CTA)

**Erreicht:**
- Hero-Video: `min-h-[100svh]` → `h-[80vh]` (dezenter, flacher)
- Navbar 20% dicker (`py-4` → `py-5`) + "NG7 Customs" Text rechts neben Logo
- Kategorien-Namen auf Main Page an Navbar angeglichen (Entwicklung, Individualisierung)
- Kategorien-Karten: smoother Hover (cubic-bezier), Plus-Icon oben rechts, größerer Gap auf Mobile
- CTA-Banner: KI-Bild → echtes Client-Foto (`cta.png` → `public/fotos/cta-werkzeuge.webp`)
- Divider Home: `divider.png` → `public/fotos/divider-werkstatt.webp`
- Divider Über Mich: `divider02.png` → `public/fotos/divider-uebermich.webp`
- E-Mail von Nicolas bestätigt — Mail sieht gut aus
- favicon.ico generiert (N7 Gold auf Dunkel, 32×32)
- Domain .de nicht verfügbar — entfällt, nur .com

**Offen:**
1. Launch-Freigabe von Nicolas

## Nächste Schritte (priorisiert)
1. Launch-Freigabe von Nicolas einholen → dann ist das Projekt abgeschlossen
