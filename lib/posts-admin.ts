// Blog posts for the admin (table posts). Parameterised queries only. Public reads stay in lib/store.ts.
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import type { CleanPost } from "@/lib/post-input";

export type PostAdmin = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  coverAlt: string;
  metaDescription: string;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

function warn(fn: string, e: unknown) {
  console.warn(`[posts-admin] ${fn} failed: ${e instanceof Error ? e.message : "unknown error"}`);
}

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v ? String(v) : null);

function toPost(r: RowDataPacket): PostAdmin {
  return {
    id: Number(r.id),
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    body: r.body ?? "",
    coverUrl: r.cover_url ?? "",
    coverAlt: r.cover_alt ?? "",
    metaDescription: r.meta_description ?? "",
    isPublished: Number(r.is_published) === 1,
    publishedAt: iso(r.published_at),
    updatedAt: iso(r.updated_at) ?? "",
  };
}

const COLS = "id, slug, title, excerpt, body, cover_url, cover_alt, meta_description, is_published, published_at, updated_at";

export async function listPostsAdmin(): Promise<PostAdmin[]> {
  try {
    const [rows] = await getPool().query<RowDataPacket[]>(`SELECT ${COLS} FROM posts ORDER BY updated_at DESC, id DESC`);
    return rows.map(toPost);
  } catch (e) {
    warn("listPostsAdmin", e);
    return [];
  }
}

export async function getPostAdmin(id: number): Promise<PostAdmin | null> {
  try {
    const [rows] = await getPool().execute<RowDataPacket[]>(`SELECT ${COLS} FROM posts WHERE id = ? LIMIT 1`, [id]);
    return rows[0] ? toPost(rows[0]) : null;
  } catch (e) {
    warn("getPostAdmin", e);
    return null;
  }
}

/** Slugs of every post except `exceptId`, so a post can keep its own address when edited. Throws if the DB is down. */
export async function otherPostSlugs(exceptId?: number): Promise<string[]> {
  const [rows] = await getPool().execute<RowDataPacket[]>("SELECT slug FROM posts WHERE id <> ?", [exceptId ?? 0]);
  return rows.map((r) => String(r.slug));
}

/**
 * Inserts (no id) or updates a post. published_at is set the first time the post is published and kept after,
 * so un-publishing and re-publishing does not move it to the top. Returns the id, "taken" for a duplicate slug,
 * or null on a database error.
 */
export async function savePost(p: CleanPost, id?: number): Promise<number | "taken" | null> {
  const values = [p.slug, p.title, p.excerpt, p.body, p.coverUrl, p.coverAlt, p.metaDescription, p.publish ? 1 : 0];
  try {
    if (id) {
      const [res] = await getPool().execute<ResultSetHeader>(
        `UPDATE posts SET slug = ?, title = ?, excerpt = ?, body = ?, cover_url = ?, cover_alt = ?, meta_description = ?,
           is_published = ?, published_at = IF(? = 1, COALESCE(published_at, UTC_TIMESTAMP()), published_at)
         WHERE id = ?`,
        [...values, p.publish ? 1 : 0, id],
      );
      return res.affectedRows > 0 ? id : null;
    }
    const [res] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO posts (slug, title, excerpt, body, cover_url, cover_alt, meta_description, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, IF(? = 1, UTC_TIMESTAMP(), NULL))`,
      [...values, p.publish ? 1 : 0],
    );
    return res.insertId;
  } catch (e) {
    if ((e as { code?: string }).code === "ER_DUP_ENTRY") return "taken";
    warn("savePost", e);
    return null;
  }
}

export async function deletePost(id: number): Promise<string | null> {
  try {
    const [rows] = await getPool().execute<RowDataPacket[]>("SELECT slug FROM posts WHERE id = ?", [id]);
    if (!rows[0]) return null;
    await getPool().execute("DELETE FROM posts WHERE id = ?", [id]);
    return String(rows[0].slug);
  } catch (e) {
    warn("deletePost", e);
    return null;
  }
}
