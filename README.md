# Alvi Studio website, version 2

This folder (`site-v2`) is the second, more premium version of the site. It is a copy of `../site` with a new
look and a new home page; the admin panel, the database (`alvi_studio`) and the enquiry form are shared and
unchanged. The current site in `../site` is untouched.

What is new in v2:

- Home page opens with **"From plot to home"**: a house is surveyed, planned, framed, clad and furnished in 3D as
  the visitor scrolls (`components/home/PlotToHome.tsx`, scene in `components/three/story/`, timing in
  `lib/story.ts`). Under reduced motion, without WebGL or on very weak devices a still drawing shows instead.
- Informative home sections: studio, services, project types, process, deliverables, guides, FAQs, start a project.
- Optional ambient sound made in code (`lib/ambient.ts`, `components/SoundToggle.tsx`), off by default.
- Serif display type (Cormorant Garamond) with Manrope, smooth wheel scrolling on desktop (Lenis).

Run it on **port 3200** (3000 is Pulse Pharma, 3100 is v1):

```bash
npm run dev -- -p 3200
BASE_URL=http://localhost:3200 npm run check:mobile
```

Design and plan: `../docs/superpowers/specs/2026-10-30-alvi-studio-v2-design.md`,
`../docs/superpowers/plans/2026-10-30-alvi-studio-v2.md`.

---

# Alvi Studio website

Next.js site for Alvi Studio by Fatma & Aqib (Himatnagar). Plan: `../docs/superpowers/plans/2026-10-29-alvi-studio-site.md`. Design: `../docs/superpowers/specs/2026-10-29-alvi-studio-design.md`.

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000
npm test           # enquiry rules, rate limit, admin login
npm run build && npm run start
npm run check:mobile   # needs the app running and Chrome; set BASE_URL if not port 3000
```

## Environment (`.env`, never committed; see `.env.example`)
- `DATABASE_URL` MySQL connection string. The password must be URL-encoded (`@` becomes `%40`). Run `db/schema.sql` once.
- `ADMIN_SESSION_SECRET` for `/admin` (admin is disabled if it is missing). Admin users are stored in the database: create the first one with `npm run create-admin` (or non-interactively with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` set in the environment). More admins are added from `/admin/account`.
- `UPLOAD_DIR` folder for uploaded photos, outside `public/`. Default `<project>/uploads`; on Hostinger use a folder that survives redeploys.
- `NEXT_PUBLIC_SITE_URL` the real domain (used by the sitemap and canonical links).
- `NEXT_PUBLIC_CONTACT_EMAIL` the business email, once it exists.

Without `DATABASE_URL` the public pages still render; enquiries answer 503 and tell the visitor to call or WhatsApp.

## Admin (`/admin`)
Sign in at `/admin/login`. The sidebar has: Dashboard (new enquiries and a before-launch checklist), Enquiries (search, filters, one page per enquiry with call / WhatsApp, status history, notes, CSV export), Gallery (up to 6 photos at once), Page images, Testimonials, Fatma and Aqib (About page), Blog posts, FAQs, SEO, Company details (phone, WhatsApp, email, address, hours, map, social links) and Account (password, other admins, sign-in history).
**Local demo account:** the local database has a demo admin with username `admin` (weak password, for local testing only). Before launch, switch it off in `/admin/account` and never copy it to the live database.
`proxy.ts` blocks every `/admin` page and `/api/admin` call without a valid session; each page and action also checks the user is still active.

## Where to edit things in code
- Built-in defaults for company details: `lib/site.ts` (the admin's Company details override them).
- Service page copy and process steps (drafts to confirm): `content/services.ts`.
- Materials guides (drafts to confirm): `content/guides.ts`.

## Deploying to Hostinger Business
1. In hPanel confirm the Node.js web app option exists. If not, this stack needs a different host or a PHP rewrite.
2. Create the MySQL database in hPanel, run `db/schema.sql`, set the environment variables above.
3. `npm ci && npm run build`, start with `npm run start`. Run `npm audit` before every deploy.

## Known gaps
- No email is sent for new enquiries yet (no business email or mail server). They appear in `/admin/enquiries` and the menu shows how many are new.
- 3D has been checked in one desktop browser pane only, not on a real phone.
