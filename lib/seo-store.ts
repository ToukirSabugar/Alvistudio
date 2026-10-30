// SEO keywords, per-page SEO overrides and FAQs (parameterised mysql2 queries only).
// Reads return empty/null on any database error so public pages never break.
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export const SEO_PATHS = [
  "/",
  "/about",
  "/architecture",
  "/interior",
  "/civil",
  "/gallery",
  "/testimonials",
  "/blog",
  "/contact",
] as const;
export type SeoPath = (typeof SEO_PATHS)[number];

export const PATH_LABELS: Record<SeoPath, string> = {
  "/": "Home",
  "/about": "About",
  "/architecture": "Architecture",
  "/interior": "Interior",
  "/civil": "Civil",
  "/gallery": "Gallery",
  "/testimonials": "Testimonials",
  "/blog": "Blog and Guides",
  "/contact": "Contact",
};

export const INTENTS = ["primary", "secondary", "long_tail", "brand"] as const;
export type Intent = (typeof INTENTS)[number];

export function isSeoPath(v: unknown): v is SeoPath {
  return typeof v === "string" && (SEO_PATHS as readonly string[]).includes(v);
}

function warn(fn: string, e: unknown) {
  console.warn(`[seo-store] ${fn} failed: ${e instanceof Error ? e.message : "unknown error"}`);
}

// ---------------------------------------------------------------- validation (pure)

export type KeywordInput = {
  keyword: string;
  pagePath: string;
  intent: string;
  priority: number | string;
  targetCity?: string;
  notes?: string;
};
export type CleanKeyword = {
  keyword: string;
  pagePath: SeoPath;
  intent: Intent;
  priority: 1 | 2 | 3;
  targetCity: string;
  notes: string | null;
};

export function cleanKeyword(input: KeywordInput): CleanKeyword | null {
  const keyword = (input.keyword ?? "").replace(/\s+/g, " ").trim();
  if (keyword.length < 2 || keyword.length > 150) return null;
  if (!isSeoPath(input.pagePath)) return null;
  if (!(INTENTS as readonly string[]).includes(input.intent)) return null;
  const priority = Number(input.priority);
  if (!Number.isInteger(priority) || priority < 1 || priority > 3) return null;
  const targetCity = (input.targetCity ?? "").trim() || "Himatnagar";
  if (targetCity.length > 60) return null;
  const notes = (input.notes ?? "").trim();
  if (notes.length > 300) return null;
  return {
    keyword,
    pagePath: input.pagePath,
    intent: input.intent as Intent,
    priority: priority as 1 | 2 | 3,
    targetCity,
    notes: notes || null,
  };
}

export type PageSeoInput = {
  path: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  noindex?: boolean;
};
export type CleanPageSeo = {
  path: SeoPath;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  noindex: boolean;
};

export function cleanPageSeo(input: PageSeoInput): CleanPageSeo | null {
  if (!isSeoPath(input.path)) return null;
  const metaTitle = (input.metaTitle ?? "").trim();
  const metaDescription = (input.metaDescription ?? "").trim();
  const ogImageUrl = (input.ogImageUrl ?? "").trim();
  if (metaTitle.length > 120 || metaDescription.length > 300 || ogImageUrl.length > 500) return null;
  if (ogImageUrl && !/^(https?:\/\/|\/)\S+$/i.test(ogImageUrl)) return null;
  return {
    path: input.path,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
    ogImageUrl: ogImageUrl || null,
    noindex: !!input.noindex,
  };
}

export type FaqInput = { id?: number; pagePath: string; question: string; answer: string };
export type CleanFaq = { id?: number; pagePath: SeoPath; question: string; answer: string };

export function cleanFaq(input: FaqInput): CleanFaq | null {
  const question = (input.question ?? "").replace(/\s+/g, " ").trim();
  const answer = (input.answer ?? "").trim();
  if (question.length < 5 || question.length > 250) return null;
  if (answer.length < 5 || answer.length > 3000) return null;
  if (!isSeoPath(input.pagePath)) return null;
  if (input.id !== undefined && (!Number.isInteger(input.id) || input.id < 1)) return null;
  return { id: input.id, pagePath: input.pagePath, question, answer };
}

// ---------------------------------------------------------------- keywords

export type SeoKeyword = {
  id: number;
  keyword: string;
  pagePath: string;
  intent: Intent;
  priority: number;
  targetCity: string;
  notes: string;
  isActive: boolean;
};

type KeywordRow = RowDataPacket & {
  id: number;
  keyword: string;
  page_path: string;
  intent: Intent;
  priority: number;
  target_city: string;
  notes: string | null;
  is_active: number;
};

const toKeyword = (r: KeywordRow): SeoKeyword => ({
  id: r.id,
  keyword: r.keyword,
  pagePath: r.page_path,
  intent: r.intent,
  priority: r.priority,
  targetCity: r.target_city,
  notes: r.notes ?? "",
  isActive: !!r.is_active,
});

export async function listSeoKeywords(pagePath?: string): Promise<SeoKeyword[]> {
  try {
    const sql =
      "SELECT id, keyword, page_path, intent, priority, target_city, notes, is_active FROM seo_keywords" +
      (pagePath ? " WHERE page_path = ?" : "") +
      " ORDER BY page_path, priority, FIELD(intent,'primary','secondary','long_tail','brand'), keyword";
    const [rows] = await getPool().execute<KeywordRow[]>(sql, pagePath ? [pagePath] : []);
    return rows.map(toKeyword);
  } catch (e) {
    warn("listSeoKeywords", e);
    return [];
  }
}

/** "exists" means the same keyword is already on that page (unique key). */
export async function addSeoKeyword(input: KeywordInput): Promise<"added" | "exists" | "invalid" | "error"> {
  const c = cleanKeyword(input);
  if (!c) return "invalid";
  try {
    const [res] = await getPool().execute<ResultSetHeader>(
      "INSERT IGNORE INTO seo_keywords (keyword, page_path, intent, priority, target_city, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [c.keyword, c.pagePath, c.intent, c.priority, c.targetCity, c.notes],
    );
    return res.affectedRows > 0 ? "added" : "exists";
  } catch (e) {
    warn("addSeoKeyword", e);
    return "error";
  }
}

export async function setSeoKeywordActive(id: number, active: boolean): Promise<boolean> {
  if (!Number.isInteger(id) || id < 1) return false;
  try {
    await getPool().execute("UPDATE seo_keywords SET is_active = ? WHERE id = ?", [active ? 1 : 0, id]);
    return true;
  } catch (e) {
    warn("setSeoKeywordActive", e);
    return false;
  }
}

export async function deleteSeoKeyword(id: number): Promise<boolean> {
  if (!Number.isInteger(id) || id < 1) return false;
  try {
    const [res] = await getPool().execute<ResultSetHeader>("DELETE FROM seo_keywords WHERE id = ?", [id]);
    return res.affectedRows > 0;
  } catch (e) {
    warn("deleteSeoKeyword", e);
    return false;
  }
}

// ---------------------------------------------------------------- page SEO

export type PageSeo = {
  path: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  noindex: boolean;
};

type PageSeoRow = RowDataPacket & {
  path: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  noindex: number;
};

const toPageSeo = (r: PageSeoRow): PageSeo => ({
  path: r.path,
  metaTitle: r.meta_title ?? "",
  metaDescription: r.meta_description ?? "",
  ogImageUrl: r.og_image_url ?? "",
  noindex: !!r.noindex,
});

export async function getPageSeo(path: string): Promise<PageSeo | null> {
  try {
    const [rows] = await getPool().execute<PageSeoRow[]>(
      "SELECT path, meta_title, meta_description, og_image_url, noindex FROM page_seo WHERE path = ?",
      [path],
    );
    return rows[0] ? toPageSeo(rows[0]) : null;
  } catch (e) {
    warn("getPageSeo", e);
    return null;
  }
}

export async function listPageSeo(): Promise<PageSeo[]> {
  try {
    const [rows] = await getPool().execute<PageSeoRow[]>(
      "SELECT path, meta_title, meta_description, og_image_url, noindex FROM page_seo",
    );
    return rows.map(toPageSeo);
  } catch (e) {
    warn("listPageSeo", e);
    return [];
  }
}

/** Blank fields clear the override. A row with nothing set is removed. */
export async function savePageSeo(input: PageSeoInput): Promise<"saved" | "invalid" | "error"> {
  const c = cleanPageSeo(input);
  if (!c) return "invalid";
  try {
    if (!c.metaTitle && !c.metaDescription && !c.ogImageUrl && !c.noindex) {
      await getPool().execute("DELETE FROM page_seo WHERE path = ?", [c.path]);
      return "saved";
    }
    await getPool().execute(
      `INSERT INTO page_seo (path, meta_title, meta_description, og_image_url, noindex) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE meta_title = VALUES(meta_title), meta_description = VALUES(meta_description),
       og_image_url = VALUES(og_image_url), noindex = VALUES(noindex)`,
      [c.path, c.metaTitle, c.metaDescription, c.ogImageUrl, c.noindex ? 1 : 0],
    );
    return "saved";
  } catch (e) {
    warn("savePageSeo", e);
    return "error";
  }
}

// ---------------------------------------------------------------- FAQs

export type Faq = {
  id: number;
  pagePath: string;
  question: string;
  answer: string;
  isVisible: boolean;
  sortOrder: number;
};

type FaqRow = RowDataPacket & {
  id: number;
  page_path: string;
  question: string;
  answer: string;
  is_visible: number;
  sort_order: number;
};

const toFaq = (r: FaqRow): Faq => ({
  id: r.id,
  pagePath: r.page_path,
  question: r.question,
  answer: r.answer,
  isVisible: !!r.is_visible,
  sortOrder: r.sort_order,
});

export async function listFaqs(pagePath: string): Promise<Faq[]> {
  try {
    const [rows] = await getPool().execute<FaqRow[]>(
      "SELECT id, page_path, question, answer, is_visible, sort_order FROM faqs WHERE page_path = ? AND is_visible = 1 ORDER BY sort_order, id",
      [pagePath],
    );
    return rows.map(toFaq);
  } catch (e) {
    warn("listFaqs", e);
    return [];
  }
}

export async function listFaqsAdmin(): Promise<Faq[]> {
  try {
    const [rows] = await getPool().execute<FaqRow[]>(
      "SELECT id, page_path, question, answer, is_visible, sort_order FROM faqs ORDER BY page_path, sort_order, id",
    );
    return rows.map(toFaq);
  } catch (e) {
    warn("listFaqsAdmin", e);
    return [];
  }
}

/** Insert (no id) or update (id). New questions go to the end of their page. */
export async function saveFaq(input: FaqInput): Promise<"saved" | "invalid" | "error"> {
  const c = cleanFaq(input);
  if (!c) return "invalid";
  try {
    if (c.id) {
      await getPool().execute("UPDATE faqs SET page_path = ?, question = ?, answer = ? WHERE id = ?", [
        c.pagePath,
        c.question,
        c.answer,
        c.id,
      ]);
    } else {
      const [rows] = await getPool().execute<RowDataPacket[]>(
        "SELECT COALESCE(MAX(sort_order), 0) + 10 AS next FROM faqs WHERE page_path = ?",
        [c.pagePath],
      );
      await getPool().execute("INSERT INTO faqs (page_path, question, answer, sort_order) VALUES (?, ?, ?, ?)", [
        c.pagePath,
        c.question,
        c.answer,
        Number(rows[0]?.next ?? 10),
      ]);
    }
    return "saved";
  } catch (e) {
    warn("saveFaq", e);
    return "error";
  }
}

export async function setFaqVisible(id: number, visible: boolean): Promise<boolean> {
  if (!Number.isInteger(id) || id < 1) return false;
  try {
    await getPool().execute("UPDATE faqs SET is_visible = ? WHERE id = ?", [visible ? 1 : 0, id]);
    return true;
  } catch (e) {
    warn("setFaqVisible", e);
    return false;
  }
}

export async function deleteFaq(id: number): Promise<boolean> {
  if (!Number.isInteger(id) || id < 1) return false;
  try {
    const [res] = await getPool().execute<ResultSetHeader>("DELETE FROM faqs WHERE id = ?", [id]);
    return res.affectedRows > 0;
  } catch (e) {
    warn("deleteFaq", e);
    return false;
  }
}
