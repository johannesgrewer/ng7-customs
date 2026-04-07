import { chromium } from 'playwright';

const pages = [
  { name: 'redesign-home', url: 'http://localhost:4321/' },
  { name: 'redesign-nach-mass', url: 'http://localhost:4321/einzelstuecke' },
  { name: 'redesign-entwicklung', url: 'http://localhost:4321/entwicklung' },
  { name: 'redesign-custom', url: 'http://localhost:4321/custom' },
  { name: 'redesign-ueber-mich', url: 'http://localhost:4321/ueber-mich' },
];

const browser = await chromium.launch({ headless: true });

for (const p of pages) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(p.url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `./scrape-output/${p.name}.jpeg`, fullPage: true, quality: 90, type: 'jpeg' });
  console.log(`✓ ${p.name}`);
  await page.close();
}

await browser.close();
console.log('Done!');
