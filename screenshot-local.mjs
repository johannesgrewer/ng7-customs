import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);

await page.screenshot({ path: './scrape-output/redesign-home.jpeg', fullPage: true, quality: 90, type: 'jpeg' });
console.log('✓ Home screenshot saved');

await browser.close();
