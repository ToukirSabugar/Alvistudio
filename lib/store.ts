// Data access (mysql2, parameterised queries only).
// Contract: every public read returns an empty value if the database is unreachable.
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { getPool } from "@/lib/db";
import type { EnquiryData } from "@/lib/enquiry-schema";
import type { GalleryCategoryId, ProjectTypeId } from "@/lib/site";
import { ENQUIRY_STATUSES, isEnquiryStatus, type EnquiryStatus } from "@/lib/enquiry-status";
import { enquiryWhereSql, type EnquiryFilter } from "@/lib/enquiry-filters";
import { istDayStart, rangeStart } from "@/lib/ist";

export type Testimonial = {
  id: string;
  name: string;
  projectType: ProjectTypeId;
  quote: string;
  createdAt: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  altText: string;
  category: GalleryCategoryId;
  imageUrl: string;
  isSample: boolean;
};

export type MediaRow = {
  id: number;
  slot: string;
  title: string;
  altText: string;
  category: string | null;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  isSample: boolean;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string | null;
  coverAlt?: string;
  metaDescription?: string;
  publishedAt: string;
};


export { ENQUIRY_STATUSES, isEnquiryStatus, type EnquiryStatus };

export type EnquiryEvent = { from: string | null; to: string; note: string; createdAt: string };

export type EnquiryRow = {
  id: number;
  ref: string;
  type: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  details: Record<string, string>;
  status: EnquiryStatus;
  notes: string;
  statusChangedAt: string | null;
  events: EnquiryEvent[];
  createdAt: string;
};

function iso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v ?? "");
}

async function safe<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn(`[store] ${label} failed: ${e instanceof Error ? e.message : "unknown error"}`);
    return fallback;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return safe("getTestimonials", [], async () => {
    const [rows] = await getPool().query<RowDataPacket[]>(
      "SELECT id, name, project_type, quote, created_at FROM testimonials WHERE is_visible = 1 ORDER BY sort_order ASC, created_at DESC, id DESC",
    );
    return rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      projectType: r.project_type,
      quote: r.quote,
      createdAt: iso(r.created_at),
    }));
  });
}

/** All testimonials including hidden ones, for the admin list. */
export async function listAllTestimonials(): Promise<(Testimonial & { isVisible: boolean })[]> {
  return safe("listAllTestimonials", [], async () => {
    const [rows] = await getPool().query<RowDataPacket[]>(
      "SELECT id, name, project_type, quote, is_visible, created_at FROM testimonials ORDER BY sort_order ASC, created_at DESC, id DESC",
    );
    return rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      projectType: r.project_type,
      quote: r.quote,
      isVisible: Boolean(r.is_visible),
      createdAt: iso(r.created_at),
    }));
  });
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  return safe("getGalleryItems", [], async () => {
    const [rows] = await getPool().query<RowDataPacket[]>(
      "SELECT id, title, alt_text, category, file_url, is_sample FROM media_assets WHERE slot = 'gallery' AND is_visible = 1 ORDER BY sort_order ASC, created_at DESC, id DESC",
    );
    return rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      altText: r.alt_text ?? "",
      category: r.category,
      imageUrl: r.file_url,
      isSample: Boolean(r.is_sample),
    }));
  });
}

const MEDIA_COLUMNS =
  "id, slot, title, alt_text, category, file_url, file_name, mime_type, size_bytes, width, height, is_sample, is_visible, sort_order, created_at";

/** All media rows including hidden ones, for admin lists and pickers. Optional slot filter. */
export async function listMedia(slot?: string): Promise<MediaRow[]> {
  return safe("listMedia", [], async () => {
    const [rows] = slot
      ? await getPool().execute<RowDataPacket[]>(
          `SELECT ${MEDIA_COLUMNS} FROM media_assets WHERE slot = ? ORDER BY sort_order ASC, created_at DESC, id DESC`,
          [slot],
        )
      : await getPool().query<RowDataPacket[]>(
          `SELECT ${MEDIA_COLUMNS} FROM media_assets ORDER BY slot ASC, sort_order ASC, created_at DESC, id DESC`,
        );
    return rows.map((r) => ({
      id: Number(r.id),
      slot: r.slot,
      title: r.title,
      altText: r.alt_text ?? "",
      category: r.category ?? null,
      fileUrl: r.file_url,
      fileName: r.file_name ?? "",
      mimeType: r.mime_type ?? "",
      sizeBytes: Number(r.size_bytes ?? 0),
      width: r.width == null ? null : Number(r.width),
      height: r.height == null ? null : Number(r.height),
      isSample: Boolean(r.is_sample),
      isVisible: Boolean(r.is_visible),
      sortOrder: Number(r.sort_order ?? 0),
      createdAt: iso(r.created_at),
    }));
  });
}

const POST_COLUMNS = "slug, title, excerpt, body, cover_url, cover_alt, meta_description, published_at";

function toPost(r: RowDataPacket): Post {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    coverUrl: r.cover_url ?? null,
    ...(r.cover_alt ? { coverAlt: r.cover_alt as string } : {}),
    ...(r.meta_description ? { metaDescription: r.meta_description as string } : {}),
    publishedAt: iso(r.published_at),
  };
}

export async function getPosts(): Promise<Post[]> {
  return safe("getPosts", [], async () => {
    const [rows] = await getPool().query<RowDataPacket[]>(
      `SELECT ${POST_COLUMNS} FROM posts WHERE is_published = 1 AND published_at IS NOT NULL ORDER BY published_at DESC`,
    );
    return rows.map(toPost);
  });
}

export async function getPost(slug: string): Promise<Post | null> {
  return safe<Post | null>("getPost", null, async () => {
    const [rows] = await getPool().execute<RowDataPacket[]>(
      `SELECT ${POST_COLUMNS} FROM posts WHERE slug = ? AND is_published = 1 AND published_at IS NOT NULL LIMIT 1`,
      [slug],
    );
    return rows[0] ? toPost(rows[0]) : null;
  });
}

// ---- Enquiries (these throw on DB error so the API can answer 503) ----

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeRef(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  let tail = "";
  for (let i = 0; i < 4; i++) tail += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  return `AS-${yy}${mm}${dd}-${tail}`;
}

const BASE_KEYS = new Set(["type", "name", "phone", "email", "message", "website"]);

export async function saveEnquiry(data: EnquiryData): Promise<{ ref: string }> {
  const details: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (!BASE_KEYS.has(k) && typeof v === "string" && v !== "") details[k] = v;
  }
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = makeRef();
    const conn = await getPool().getConnection();
    try {
      await conn.beginTransaction();
      const [res] = await conn.execute<ResultSetHeader>(
        "INSERT INTO enquiries (ref, type, name, phone, email, message, details, status, status_changed_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', CURRENT_TIMESTAMP)",
        [ref, data.type, data.name, data.phone, data.email ?? "", data.message ?? "", JSON.stringify(details)],
      );
      await conn.execute(
        "INSERT INTO enquiry_events (enquiry_id, from_status, to_status, note) VALUES (?, NULL, 'new', NULL)",
        [res.insertId],
      );
      await conn.commit();
      return { ref };
    } catch (e) {
      lastError = e;
      try {
        await conn.rollback();
      } catch {
        /* connection already broken */
      }
      if ((e as { code?: string }).code !== "ER_DUP_ENTRY") throw e;
    } finally {
      conn.release();
    }
  }
  throw lastError;
}

const ENQUIRY_COLS = "id, ref, type, name, phone, email, message, details, status, notes, status_changed_at, created_at";

function toEnquiry(r: RowDataPacket, events: EnquiryEvent[]): EnquiryRow {
  let details: Record<string, string> = {};
  try {
    details = typeof r.details === "string" ? JSON.parse(r.details) : (r.details ?? {});
  } catch {
    /* a damaged details column must not hide the enquiry */
  }
  return {
    id: Number(r.id),
    ref: r.ref,
    type: r.type,
    name: r.name,
    phone: r.phone,
    email: r.email ?? "",
    message: r.message ?? "",
    details,
    status: r.status,
    notes: r.notes ?? "",
    statusChangedAt: r.status_changed_at ? iso(r.status_changed_at) : null,
    events,
    createdAt: iso(r.created_at),
  };
}

async function eventsFor(ids: number[]): Promise<Map<number, EnquiryEvent[]>> {
  const events = new Map<number, EnquiryEvent[]>();
  if (ids.length === 0) return events;
  const [evRows] = await getPool().query<RowDataPacket[]>(
    "SELECT enquiry_id, from_status, to_status, note, created_at FROM enquiry_events WHERE enquiry_id IN (?) ORDER BY created_at ASC, id ASC",
    [ids],
  );
  for (const e of evRows) {
    const list = events.get(e.enquiry_id) ?? [];
    list.push({ from: e.from_status ?? null, to: e.to_status, note: e.note ?? "", createdAt: iso(e.created_at) });
    events.set(e.enquiry_id, list);
  }
  return events;
}

/** One page of the inbox for a filter, newest first, plus the total that matches. */
export async function searchEnquiries(
  f: EnquiryFilter,
  limit: number,
  offset: number,
): Promise<{ rows: EnquiryRow[]; total: number }> {
  return safe("searchEnquiries", { rows: [], total: 0 }, async () => {
    const { sql, params } = enquiryWhereSql(f);
    const [countRows] = await getPool().execute<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM enquiries ${sql}`, params);
    const [rows] = await getPool().query<RowDataPacket[]>(
      `SELECT ${ENQUIRY_COLS} FROM enquiries ${sql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, Math.max(1, Math.min(limit, 5000)), Math.max(0, offset)],
    );
    return { rows: rows.map((r) => toEnquiry(r, [])), total: Number(countRows[0]?.n ?? 0) };
  });
}

export async function getEnquiry(id: number): Promise<EnquiryRow | null> {
  return safe<EnquiryRow | null>("getEnquiry", null, async () => {
    const [rows] = await getPool().execute<RowDataPacket[]>(`SELECT ${ENQUIRY_COLS} FROM enquiries WHERE id = ? LIMIT 1`, [id]);
    if (!rows[0]) return null;
    const events = await eventsFor([Number(rows[0].id)]);
    return toEnquiry(rows[0], events.get(Number(rows[0].id)) ?? []);
  });
}

/** Removes the enquiry and its history (cascade). Only for a visitor's request to erase their data. */
export async function deleteEnquiry(id: number): Promise<boolean> {
  return safe("deleteEnquiry", false, async () => {
    const [res] = await getPool().execute<ResultSetHeader>("DELETE FROM enquiries WHERE id = ?", [id]);
    return res.affectedRows > 0;
  });
}

/** New -> Seen the first time someone opens the enquiry. Does nothing for any other status. */
export async function markEnquirySeen(id: number): Promise<boolean> {
  return safe("markEnquirySeen", false, async () => {
    const [found] = await getPool().execute<RowDataPacket[]>("SELECT status FROM enquiries WHERE id = ?", [id]);
    if (found[0]?.status !== "new") return false;
    return setEnquiryStatus(id, "seen", "Opened in the admin");
  });
}

export type DashboardCounts = {
  enquiriesToday: number;
  enquiriesWeek: number;
  galleryOwn: number;
  gallerySamples: number;
  testimonialsShown: number;
  postsPublished: number;
  faqsShown: number;
  teamShown: number;
  seoPagesWithKeyword: string[];
};

export async function dashboardCounts(now: Date = new Date()): Promise<DashboardCounts> {
  const empty: DashboardCounts = {
    enquiriesToday: 0,
    enquiriesWeek: 0,
    galleryOwn: 0,
    gallerySamples: 0,
    testimonialsShown: 0,
    postsPublished: 0,
    faqsShown: 0,
    teamShown: 0,
    seoPagesWithKeyword: [],
  };
  return safe("dashboardCounts", empty, async () => {
    const pool = getPool();
    const [[e], [g], [t], [p], [fq], [tm], kw] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        "SELECT SUM(created_at >= ?) AS today, SUM(created_at >= ?) AS week FROM enquiries",
        [istDayStart(now), rangeStart("week", now)],
      ),
      pool.query<RowDataPacket[]>(
        "SELECT SUM(is_sample = 0) AS own, SUM(is_sample = 1) AS samples FROM media_assets WHERE slot = 'gallery' AND is_visible = 1",
      ),
      pool.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM testimonials WHERE is_visible = 1"),
      pool.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM posts WHERE is_published = 1"),
      pool.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM faqs WHERE is_visible = 1"),
      pool.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM team_members WHERE is_visible = 1"),
      pool.query<RowDataPacket[]>("SELECT DISTINCT page_path FROM seo_keywords WHERE is_active = 1"),
    ]);
    return {
      enquiriesToday: Number(e[0]?.today ?? 0),
      enquiriesWeek: Number(e[0]?.week ?? 0),
      galleryOwn: Number(g[0]?.own ?? 0),
      gallerySamples: Number(g[0]?.samples ?? 0),
      testimonialsShown: Number(t[0]?.n ?? 0),
      postsPublished: Number(p[0]?.n ?? 0),
      faqsShown: Number(fq[0]?.n ?? 0),
      teamShown: Number(tm[0]?.n ?? 0),
      seoPagesWithKeyword: kw[0].map((r) => String(r.page_path)),
    };
  });
}

/** Number of enquiries per status (all statuses present, zero when none). */
export async function countEnquiriesByStatus(): Promise<Record<EnquiryStatus, number>> {
  const out: Record<EnquiryStatus, number> = { new: 0, seen: 0, contacted: 0, quoted: 0, closed: 0 };
  return safe("countEnquiriesByStatus", out, async () => {
    const [rows] = await getPool().query<RowDataPacket[]>("SELECT status, COUNT(*) AS n FROM enquiries GROUP BY status");
    for (const r of rows) if (isEnquiryStatus(r.status)) out[r.status] = Number(r.n);
    return out;
  });
}

/** Updates the status and records the change in enquiry_events, in one transaction. */
export async function setEnquiryStatus(id: number, status: EnquiryStatus, note?: string): Promise<boolean> {
  if (!isEnquiryStatus(status)) return false;
  const cleanNote = note ? note.trim().slice(0, 500) : "";
  let conn;
  try {
    conn = await getPool().getConnection();
  } catch (e) {
    console.warn(`[store] setEnquiryStatus failed: ${e instanceof Error ? e.message : "unknown error"}`);
    return false;
  }
  try {
    await conn.beginTransaction();
    const [found] = await conn.execute<RowDataPacket[]>("SELECT status FROM enquiries WHERE id = ? FOR UPDATE", [id]);
    if (found.length === 0) {
      await conn.rollback();
      return false;
    }
    const from = found[0].status as string;
    await conn.execute("UPDATE enquiries SET status = ?, status_changed_at = CURRENT_TIMESTAMP WHERE id = ?", [
      status,
      id,
    ]);
    await conn.execute("INSERT INTO enquiry_events (enquiry_id, from_status, to_status, note) VALUES (?, ?, ?, ?)", [
      id,
      from,
      status,
      cleanNote || null,
    ]);
    await conn.commit();
    return true;
  } catch (e) {
    try {
      await conn.rollback();
    } catch {
      /* ignore */
    }
    console.warn(`[store] setEnquiryStatus failed: ${e instanceof Error ? e.message : "unknown error"}`);
    return false;
  } finally {
    conn.release();
  }
}

export async function saveEnquiryNotes(id: number, notes: string): Promise<boolean> {
  return safe("saveEnquiryNotes", false, async () => {
    const [res] = await getPool().execute<ResultSetHeader>("UPDATE enquiries SET notes = ? WHERE id = ?", [
      notes.trim().slice(0, 5000) || null,
      id,
    ]);
    return res.affectedRows > 0;
  });
}

// ---- Owner-managed content (admin only; never seeded) ----

export async function addTestimonial(input: {
  name: string;
  projectType: ProjectTypeId;
  quote: string;
}): Promise<boolean> {
  return safe("addTestimonial", false, async () => {
    await getPool().execute("INSERT INTO testimonials (name, project_type, quote) VALUES (?, ?, ?)", [
      input.name,
      input.projectType,
      input.quote,
    ]);
    return true;
  });
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  return safe("deleteTestimonial", false, async () => {
    const [res] = await getPool().execute<ResultSetHeader>("DELETE FROM testimonials WHERE id = ?", [Number(id)]);
    return res.affectedRows > 0;
  });
}

/** Saves a media row and returns its id (null when the database is down). */
export async function addMedia(input: {
  slot?: string;
  title: string;
  altText: string;
  category: GalleryCategoryId | null;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  isSample?: boolean;
}): Promise<number | null> {
  return safe<number | null>("addMedia", null, async () => {
    const slot = input.slot ?? "gallery";
    // New items go to the top: sort_order one below the current smallest in the slot.
    const [res] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO media_assets (slot, title, alt_text, category, file_url, file_name, mime_type, size_bytes, width, height, is_sample, sort_order)
       SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(MIN(sort_order), 0) - 1 FROM media_assets WHERE slot = ?`,
      [
        slot,
        input.title,
        input.altText,
        input.category,
        input.fileUrl,
        input.fileName,
        input.mimeType,
        input.sizeBytes,
        input.width,
        input.height,
        input.isSample ? 1 : 0,
        slot,
      ],
    );
    return res.insertId;
  });
}

export async function setTestimonialVisible(id: string, visible: boolean): Promise<boolean> {
  return safe("setTestimonialVisible", false, async () => {
    const [res] = await getPool().execute<ResultSetHeader>("UPDATE testimonials SET is_visible = ? WHERE id = ?", [
      visible ? 1 : 0,
      Number(id),
    ]);
    return res.affectedRows > 0;
  });
}

// ---- Settings (key/value overrides of siteConfig) ----

export async function getSettings(): Promise<Record<string, string>> {
  return safe<Record<string, string>>("getSettings", {}, async () => {
    const [rows] = await getPool().query<RowDataPacket[]>("SELECT `key`, `value` FROM settings");
    return Object.fromEntries(rows.map((r) => [r.key as string, r.value as string]));
  });
}

export async function saveSettings(partial: Record<string, string>): Promise<boolean> {
  return safe("saveSettings", false, async () => {
    for (const [k, v] of Object.entries(partial)) {
      await getPool().execute(
        "INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
        [k, v],
      );
    }
    return true;
  });
}
