# NG7 Customs — Project Requirements Brief

## Kunde
- **Name:** Nicolas Meriaux
- **Firma:** NG7 Customs (Einzelunternehmen / Nebengewerbe)
- **Branche:** Custom-Handwerk — Maßanfertigungen, Einzelstücke, Individualisierung
- **Hauptberuf:** Mechatroniker
- **Standort:** Trier
- **E-Mail:** nicolas.mrx@googlemail.com
- **Instagram:** @ng7_customs
- **Bestehende Website:** https://ng7customs.wixstudio.com/ng7-customs (Wix Studio)

## Projekttyp
Redesign — bestehende Wix-Website wird durch professionelle Astro-Website ersetzt.

## Markenidentität

### Name & Bedeutung
**NG7** = NEXUS GRATIA SEPTEM — "Verbindung der sieben Tugenden"
- Liebe (zum Detail, Präzision)
- Weisheit (Materialauswahl, Arbeitsprozesse)
- Mut
- Gerechtigkeit
- Mäßigung
- Ehrlichkeit (direkte Zusammenarbeit)
- Hoffnung

### Ton & Sprache
- Du-Form
- Handwerker-Sprache, authentisch, nicht übertrieben
- Kein Agentur-Blabla, keine leeren Marketing-Phrasen
- Deutsch

### Visuelles Profil
- **Stil:** Dunkel, maskulin, handwerklich, premium
- **Bildsprache:** Echte Werkstattfotos, Close-ups von Handarbeit, Materialdetails
- **Haptik:** Metall, Leder, Holz, Stahl — rohe Materialien
- **Referenz:** Die bestehenden Fotos sind stark und authentisch

## Leistungen / Kategorien
1. **Einzelstücke** — Handgefertigte Unikate (Messer, Kunstobjekte)
2. **Auf-/Nach Maß** — Maßanfertigungen nach Kundenwunsch
3. **Finishes / Custom** — Individualisierung bestehender Gegenstände

## Seitenstruktur (geplant)
1. **Hero** — Vollbild-Video/Bild, Claim, CTA
2. **Kategorien** — 3er-Grid (Einzelstücke, Nach Maß, Custom)
3. **Über mich** — Nicolas, Story, Werkstatt
4. **Galerie / Werke** — Portfolio mit Detailansicht
5. **Warum NG7** — Werte, Qualitätsversprechen
6. **Kontakt** — Formular oder direkte Kontaktmöglichkeit
7. **Footer** — Links, Legal, Social

## Seiten
- `/` — Landingpage (Single Page)
- `/impressum` — Impressum (§5 TMG)
- `/datenschutz` — Datenschutzerklärung (DSGVO)

## Technische Anforderungen
- **Keine Shop-Funktion** — Anfragen per Kontaktformular/WhatsApp/E-Mail
- **DSGVO-konform** — Kein Cookie-Banner nötig (keine Third-Party-Tracker)
- **Lighthouse 95+** — Performance, Accessibility, SEO, Best Practices
- **Mobile-first** — Responsive, Touch-optimiert
- **Schnelle Ladezeiten** — Statischer Output, optimierte Bilder

## Probleme der aktuellen Wix-Seite
- Wix Studio: langsam, aufgebläht, kein SEO
- Platzhalter-Telefonnummer (123-456-7890)
- Produktnamen: "Kopie von Kopie von Kopie von Messerkordel"
- Keine echten Produktbeschreibungen
- WhatsApp-Dateinamen als Bildnamen
- "Erstellt mit Wix Studio" Banner
- Große weiße Lücken im Layout
- CTA-Buttons verlinken auf Startseite (tun nichts)
- Falsche Unterschrift (Martin Schulz statt Nicolas Meriaux)
- Kein gültiges Impressum/Datenschutz

## Design Tokens (Vorschlag)

### Farben
- **Primary Dark:** `#0A0A0A` (Fast-Schwarz)
- **Surface Dark:** `#141414` (Karten, Sektionen)
- **Border Dark:** `#262626` (Subtle Borders)
- **Accent:** `#C4A55A` (Messing/Gold — Handwerk, Wertigkeit)
- **Accent Glow:** `rgba(196, 165, 90, 0.15)`
- **Text Light:** `#F5F5F0` (Warm-Weiß)
- **Text Dim:** `#8A8A80` (Muted Text)
- **Surface Light:** `#1A1A18` (Leicht wärmer)
- **White:** `#FAFAF5` (Warm White für Kontraste)

### Fonts
- **Display:** Zu definieren (markant, handwerklich aber modern)
- **Body:** Zu definieren (lesbar, clean)

## Tech Stack
- **Framework:** Astro 5 (statischer Output)
- **CSS:** Tailwind CSS 4 + CSS Custom Properties
- **Hosting:** Vercel
- **Formulare:** Resend oder Supabase
- **Analytics:** Umami (DSGVO-konform)

## Offene Fragen an den Kunden
- [ ] Echte Telefonnummer?
- [ ] Gewerbeanmeldung / Rechtsform für Impressum?
- [ ] Eigene Domain gewünscht? (z.B. ng7-customs.de)
- [ ] Welche Produkte sollen gezeigt werden? (Fotos + Namen + Beschreibungen)
- [ ] Preise öffentlich zeigen oder nur auf Anfrage?
- [ ] WhatsApp als Kontaktkanal?
- [ ] Budget / PortaWerk-Paket?
