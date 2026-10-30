// Opens every page in a real Chrome at narrow widths and fails if the page scrolls sideways.
// Usage: start the app (`npm run start` or `npm run dev`), then `npm run check:mobile`.
// Env: BASE_URL (default http://localhost:3000), CHROME_PATH (default: the usual Windows Chrome).
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CHROME =
  process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const WIDTHS = [280, 320, 375, 414, 768];

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (paths.length === 0) throw new Error("No pages found in sitemap.xml");

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
let failures = 0;
for (const path of paths) {
  for (const width of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 800, isMobile: true, hasTouch: true });
    await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1200));
    const result = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      bodyScroll: document.body.scrollWidth,
      inner: window.innerWidth,
    }));
    const wide = Math.max(result.scrollWidth, result.bodyScroll) > result.inner + 1;
    if (wide) {
      failures++;
      console.log(`FAIL ${path} at ${width}px: content ${result.scrollWidth}px wide`);
    }
    await page.close();
  }
}
await browser.close();
console.log(failures === 0 ? `PASS: ${paths.length} pages x ${WIDTHS.length} widths, no sideways scroll` : `FAILED: ${failures} problem(s)`);
process.exit(failures === 0 ? 0 : 1);
