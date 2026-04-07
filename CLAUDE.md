# NG7 Customs — Website

## Status
Redesign strukturell aufgeräumt. Alle Seiten im dunklen Handwerk-Look, Komponenten extrahiert, DSGVO-konform (Self-hosted Fonts), Kontaktformular mit D1-Backend vorbereitet. Responsive-Check steht noch aus.

## Tech Stack
- **Framework:** Astro 6
- **Styling:** Tailwind CSS 4 + CSS Custom Properties (globals.css)
- **Fonts:** Bitter (Display, serif) + Work Sans (Body, sans-serif) — self-hosted, public/fonts/
- **Page Transitions:** Astro View Transitions (ClientRouter)
- **Backend:** Cloudflare Worker + D1 (worker/ Subfolder)
- **E-Mail:** Resend API (transaktional)
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
- `src/styles/global.css` — Design-Tokens, @font-face, Buttons, prefers-reduced-motion
- `src/layouts/Layout.astro` — Head (OG, JSON-LD, Preloads), Header, Footer, Skip-to-Content
- `src/pages/index.astro` — Homepage (importiert alle Sektions-Komponenten)
- `src/components/` — Hero, Kategorien, AboutPreview, NeueWerke, WerkstattDivider, WarumNG7, Galerie, CtaBanner, ShopGrid
- `src/pages/ueber-mich.astro` — Über Mich (eigene Scroll-Animationen + Parallax)
- `src/pages/kontakt.astro` — Kontaktformular mit Spam-Schutz
- `worker/` — Cloudflare Worker Backend (D1 + Resend)
- `vercel.json` — Security Headers + API Rewrite
- `astro.config.mjs` — Site-URL, Sitemap, Tailwind

## Design-Patterns
- **Fonts:** Immer `var(--font-display)` / `var(--font-body)` — nie hardcoded
- **Farben:** Immer CSS Custom Properties — nie hardcoded Hex (außer in globals.css)
- **Hover:** Nur in `@media (hover: hover)` für Desktop-only Effekte
- **Animationen:** CSS transitions, IntersectionObserver für Scroll-Reveals
- **Buttons:** `.btn-primary`, `.btn-outline`, `.btn-outline-white` aus globals.css
- **SVG-Icons:** Immer `aria-hidden="true"` auf dekorative SVGs

## Kontaktformular — Spam-Schutz (4 Stufen)
1. Honeypot-Feld (unsichtbar)
2. Zeitprüfung (< 3s = Bot)
3. Rate-Limiting (3/IP/10min, im Worker)
4. Link-Filter (URLs in Nachricht = Block)

## Bekannte Platzhalter (vor Launch klären)
- Impressum: Straße, PLZ fehlen → `[NACHTRAGEN]` Marker
- Datenschutz: Straße, PLZ fehlen → `[NACHTRAGEN]` Marker
- Produkte: Preise sind Platzhalter (alle 3.000€)
- Worker: D1 database_id + Resend API Key + Domain fehlen
- OG-Image: `/og-image.jpg` noch nicht erstellt
- Apple Touch Icon: `/apple-touch-icon.png` noch nicht erstellt
- Favicon: vorhanden, aber nicht geprüft

## Letzte Session
**Datum:** 2026-04-07
**Schwerpunkt:** Kickstart-Audit + strukturelle Überarbeitung
**Erreicht:**
- Google Fonts CDN entfernt → Self-hosted (DSGVO-Fix)
- globals.css komplett neu mit dunklem Design-System
- Layout.astro: OG-Tags, JSON-LD, Skip-to-Content, aria-labels, Footer dunkel
- Lenis entfernt (nicht nötig)
- 8 Sektions-Komponenten extrahiert (index.astro: 371→30 Zeilen)
- Kontakt-Seite: dunkles Design + Formular mit Spam-Schutz
- Legal-Seiten: dunkles Design, erweiterte Datenschutzerklärung
- 404-Seite erstellt
- vercel.json mit Security Headers + API Rewrite
- robots.txt + @astrojs/sitemap
- Cloudflare Worker + D1 Backend-Struktur
- playwright + lenis aus Dependencies entfernt
- shop.astro + fonts.astro gelöscht (nicht benötigt)
- Bild-Duplikate gelöscht

**Offen:**
1. Responsive-Check (alle Breakpoints)
2. Bilder optimieren (WebP-Konvertierung, evtl. astro:assets Migration)
3. Worker deployen (D1 erstellen, Resend Key, Domain verifizieren)
4. Kundendaten für Impressum einholen (Adresse, Tel, USt)
5. OG-Image + Apple Touch Icon erstellen
6. Umami Analytics einrichten
