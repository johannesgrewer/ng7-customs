import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

const PAGES = [
  { name: 'home', url: 'https://ng7customs.wixstudio.com/ng7-customs' },
  { name: 'nach-mass', url: 'https://ng7customs.wixstudio.com/ng7-customs/category/hoodies-page' },
  { name: 'entwicklung', url: 'https://ng7customs.wixstudio.com/ng7-customs/category/sweatshirt-page' },
  { name: 'custom', url: 'https://ng7customs.wixstudio.com/ng7-customs/category/category2' },
  { name: 'ueber-mich', url: 'https://ng7customs.wixstudio.com/ng7-customs/hoodies-1-3' },
];

const OUT = './scrape-output';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const page of PAGES) {
  console.log(`\n=== Scraping: ${page.name} (${page.url}) ===`);
  const p = await context.newPage();

  try {
    await p.goto(page.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Extra wait for Wix dynamic content
    await p.waitForTimeout(8000);

    // 1. Full-page screenshot
    await p.screenshot({
      path: `${OUT}/${page.name}.jpeg`,
      fullPage: true,
      quality: 90,
      type: 'jpeg'
    });
    console.log(`  ✓ Screenshot saved`);

    // 2. Extract all content
    const data = await p.evaluate(() => {
      // All text content by section
      const sections = [];
      const mainContent = document.querySelector('main') || document.body;

      // Walk through all major elements
      const els = mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, span, a, button');
      const seen = new Set();
      els.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 1 && !seen.has(text) && !text.includes('{') && !text.includes('function')) {
          seen.add(text);
          sections.push({
            tag: el.tagName.toLowerCase(),
            text: text.slice(0, 500),
            href: el.href || '',
            classes: el.className?.toString().slice(0, 100) || '',
          });
        }
      });

      // All images
      const images = [...document.querySelectorAll('img')].map(img => ({
        alt: img.alt || '',
        src: img.src || img.currentSrc || '',
        width: img.naturalWidth,
        height: img.naturalHeight,
      })).filter(i => i.src && !i.src.includes('data:'));

      // All videos
      const videos = [...document.querySelectorAll('video')].map(v => ({
        src: v.src || '',
        sources: [...v.querySelectorAll('source')].map(s => s.src),
      }));

      // Background colors of major divs
      const bgColors = new Set();
      document.querySelectorAll('div, section, header, footer, main').forEach(el => {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)') bgColors.add(bg);
      });

      // Font families used
      const fonts = new Set();
      document.querySelectorAll('h1,h2,h3,h4,p,span,a,li').forEach(el => {
        const f = getComputedStyle(el).fontFamily;
        if (f) fonts.add(f.split(',')[0].trim().replace(/['"]/g, ''));
      });

      // Page title
      const title = document.title;

      return { title, sections, images, videos, bgColors: [...bgColors], fonts: [...fonts] };
    });

    // 3. Save structured data
    writeFileSync(`${OUT}/${page.name}.json`, JSON.stringify(data, null, 2));
    console.log(`  ✓ Data extracted: ${data.sections.length} elements, ${data.images.length} images`);

    // 4. Save readable text summary
    let md = `# ${page.name} — ${data.title}\n\n`;
    md += `## Texte & Struktur\n\n`;
    data.sections.forEach(s => {
      const prefix = s.tag.startsWith('h') ? '#'.repeat(parseInt(s.tag[1])) + ' ' : '- ';
      md += `${prefix}${s.text}\n`;
      if (s.href && !s.href.includes('javascript')) md += `  → ${s.href}\n`;
    });
    md += `\n## Bilder (${data.images.length})\n\n`;
    data.images.forEach(img => {
      md += `- ${img.alt || '(kein alt)'}: ${img.src.slice(0, 120)}...\n`;
    });
    md += `\n## Farben\n${data.bgColors.join('\n')}\n`;
    md += `\n## Fonts\n${data.fonts.join('\n')}\n`;

    writeFileSync(`${OUT}/${page.name}.md`, md);
    console.log(`  ✓ Markdown summary saved`);

  } catch (err) {
    console.error(`  ✗ Error on ${page.name}: ${err.message}`);
  }

  await p.close();
}

await browser.close();
console.log(`\n=== Done! All output in ${OUT}/ ===`);
