// Signs in to the admin in a real Chrome and checks every admin page at phone and desktop width:
// status 200, exactly one H1, the controls the owners need are there, no console errors, no sideways scroll.
// Usage: start the app, then
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run check:admin
// Env: BASE_URL (default http://localhost:3000), CHROME_PATH (default: the usual Windows Chrome).
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.");
  process.exit(1);
}

// path -> CSS selectors that must exist (the controls an owner looks for on that page)
const PAGES = {
  "/admin": ["a[href='/admin/enquiries?status=new']", "nav[aria-label='Admin']"],
  "/admin/enquiries": ["input[name='q']", "select[name='type']", "input[name='from']", "a[href^='/api/admin/enquiries/export']"],
  "/admin/gallery": ["input[type='file'][name='photos']", "select[name='category']", "input[name='altText']"],
  "/admin/heroes": ["form button[type='submit']"],
  "/admin/testimonials": ["textarea[name='quote']", "input[name='name']"],
  "/admin/team": ["input[name='name']", "input[type='file']"],
  "/admin/blog": ["a[href='/admin/blog/new']"],
  "/admin/blog/new": ["input[name='title']", "input[name='slug']", "textarea[name='body']", "input[name='publish']"],
  "/admin/faqs": ["textarea[name='answer']"],
  "/admin/seo": ["input[name='keyword']"],
  "/admin/settings": ["input[name='phone']", "input[name='email']", "input[name='instagram']"],
  "/admin/account": ["input[name='current']", "input[name='newPassword']", "input[name='email']"],
};
const WIDTHS = [375, 1440];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`FAIL ${msg}`);
};

const page = await browser.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle2", timeout: 90000 });
await page.type("#email", ADMIN_EMAIL);
await page.type("#password", ADMIN_PASSWORD);
await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2", timeout: 90000 }), page.click("form button[type='submit']")]);
if (!new URL(page.url()).pathname.startsWith("/admin") || page.url().includes("/admin/login")) {
  fail(`sign-in did not reach the dashboard (now at ${page.url()})`);
  await browser.close();
  process.exit(1);
}

// Opens a detail page too, when there is at least one enquiry.
const firstEnquiry = await page.$eval("a[href^='/admin/enquiries/']", (a) => a.getAttribute("href")).catch(() => null);
const paths = { ...PAGES, ...(firstEnquiry ? { [firstEnquiry]: ["select[name='status']", "textarea[name='notes']", "a[href^='tel:']"] } : {}) };

for (const [path, selectors] of Object.entries(paths)) {
  for (const width of WIDTHS) {
    errors.length = 0;
    await page.setViewport({ width, height: 900, isMobile: width < 768, hasTouch: width < 768 });
    const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 90000 });
    const where = `${path} at ${width}px`;
    if (!res || res.status() !== 200) fail(`${where}: status ${res?.status()}`);
    if (new URL(page.url()).pathname !== path) fail(`${where}: ended at ${page.url()}`);
    const r = await page.evaluate(
      (sels) => ({
        h1: document.querySelectorAll("h1").length,
        wide: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > window.innerWidth + 1,
        missing: sels.filter((s) => !document.querySelector(s)),
        publicHeader: Boolean(document.querySelector("header nav[aria-label='Main']")),
      }),
      selectors,
    );
    if (r.h1 !== 1) fail(`${where}: ${r.h1} H1 elements`);
    if (r.wide) fail(`${where}: page scrolls sideways`);
    if (r.publicHeader) fail(`${where}: public site header is showing`);
    for (const s of r.missing) fail(`${where}: missing control ${s}`);
    for (const e of errors) fail(`${where}: console error ${e.slice(0, 160)}`);
  }
}

// Signed out, the admin must send you to the sign-in page and the export must refuse.
const anon = await browser.createBrowserContext();
const p2 = await anon.newPage();
await p2.goto(`${BASE}/admin/enquiries`, { waitUntil: "load" });
if (!p2.url().includes("/admin/login")) fail(`signed out: /admin/enquiries did not redirect (at ${p2.url()})`);
const exp = await p2.goto(`${BASE}/api/admin/enquiries/export`);
if (exp?.status() !== 401) fail(`signed out: export answered ${exp?.status()}`);

await browser.close();
const n = Object.keys(paths).length;
console.log(failures === 0 ? `PASS: ${n} admin pages x ${WIDTHS.length} widths, signed-out checks` : `FAILED: ${failures} problem(s)`);
process.exit(failures === 0 ? 0 : 1);
