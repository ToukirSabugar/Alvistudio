// Page hero images and team members (tables page_heroes, team_members, media_assets). Parameterised queries only.
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export type PageHero = { url: string; alt: string };
export type PageHeroAdmin = { path: string; mediaId: number | null; url: string | null; alt: string };
export type TeamMember = { id: number; name: string; role: string; bio: string; photoUrl: string | null; photoAlt: string };
export type TeamMemberAdmin = TeamMember & { photoMediaId: number | null; isVisible: boolean; sortOrder: number };

function warn(fn: string, e: unknown) {
  console.warn(`[site-content-store] ${fn} failed: ${e instanceof Error ? e.message : "unknown error"}`);
}

/** Pages that can have a hero image. */
export const heroPages = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/architecture", label: "Architecture" },
  { path: "/interior", label: "Interior" },
  { path: "/civil", label: "Civil" },
  { path: "/gallery", label: "Gallery" },
  { path: "/blog", label: "Blog" },
  { path: "/contact", label: "Contact" },
] as const;

export function isHeroPath(p: string): boolean {
  return heroPages.some((h) => h.path === p);
}

/** Only same-site paths or https links are used as image sources. */
function safeUrl(u: unknown): string | null {
  return typeof u === "string" && /^(\/(?!\/)|https:\/\/)[^\s<>"']+$/.test(u) ? u : null;
}

export async function getPageHero(path: string): Promise<PageHero | null> {
  try {
    const [rows] = await getPool().execute<RowDataPacket[]>(
      `SELECT m.file_url, h.alt_text, m.alt_text AS media_alt
         FROM page_heroes h JOIN media_assets m ON m.id = h.media_id
        WHERE h.page_path = ? AND m.is_visible = 1 LIMIT 1`,
      [path],
    );
    const r = rows[0];
    const url = safeUrl(r?.file_url);
    if (!r || !url) return null;
    return { url, alt: String(r.alt_text || r.media_alt || "") };
  } catch (e) {
    warn("getPageHero", e);
    return null;
  }
}

export async function listPageHeroes(): Promise<PageHeroAdmin[]> {
  const out = new Map<string, PageHeroAdmin>(
    heroPages.map((p) => [p.path, { path: p.path, mediaId: null, url: null, alt: "" }]),
  );
  try {
    const [rows] = await getPool().query<RowDataPacket[]>(
      `SELECT h.page_path, h.media_id, h.alt_text, m.file_url
         FROM page_heroes h LEFT JOIN media_assets m ON m.id = h.media_id`,
    );
    for (const r of rows) {
      if (!out.has(r.page_path)) continue;
      out.set(r.page_path, {
        path: r.page_path,
        mediaId: r.media_id === null ? null : Number(r.media_id),
        url: safeUrl(r.file_url),
        alt: r.alt_text ?? "",
      });
    }
  } catch (e) {
    warn("listPageHeroes", e);
  }
  return [...out.values()];
}

/** mediaId null clears the image (the row is removed). Returns false on any error. */
export async function setPageHero(path: string, mediaId: number | null, alt: string): Promise<boolean> {
  if (!isHeroPath(path)) return false;
  try {
    if (mediaId === null) {
      await getPool().execute("DELETE FROM page_heroes WHERE page_path = ?", [path]);
    } else {
      await getPool().execute(
        `INSERT INTO page_heroes (page_path, media_id, alt_text) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE media_id = VALUES(media_id), alt_text = VALUES(alt_text)`,
        [path, mediaId, alt.slice(0, 250)],
      );
    }
    return true;
  } catch (e) {
    warn("setPageHero", e);
    return false;
  }
}

const TEAM_SELECT = `SELECT t.id, t.name, t.role, t.bio, t.photo_media_id, t.is_visible, t.sort_order, m.file_url, m.alt_text
  FROM team_members t LEFT JOIN media_assets m ON m.id = t.photo_media_id`;

function toMember(r: RowDataPacket): TeamMemberAdmin {
  return {
    id: Number(r.id),
    name: r.name,
    role: r.role ?? "",
    bio: r.bio ?? "",
    photoUrl: safeUrl(r.file_url),
    photoAlt: r.alt_text || `Photo of ${r.name}`,
    photoMediaId: r.photo_media_id === null ? null : Number(r.photo_media_id),
    isVisible: Number(r.is_visible) === 1,
    sortOrder: Number(r.sort_order),
  };
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const [rows] = await getPool().query<RowDataPacket[]>(`${TEAM_SELECT} WHERE t.is_visible = 1 ORDER BY t.sort_order, t.id`);
    return rows.map((r) => {
      const { id, name, role, bio, photoUrl, photoAlt } = toMember(r);
      return { id, name, role, bio, photoUrl, photoAlt };
    });
  } catch (e) {
    warn("getTeamMembers", e);
    return [];
  }
}

export async function listTeamMembersAdmin(): Promise<TeamMemberAdmin[]> {
  try {
    const [rows] = await getPool().query<RowDataPacket[]>(`${TEAM_SELECT} ORDER BY t.sort_order, t.id`);
    return rows.map(toMember);
  } catch (e) {
    warn("listTeamMembersAdmin", e);
    return [];
  }
}

export type TeamMemberInput = { id?: number; name: string; role: string; bio: string; photoMediaId: number | null; sortOrder: number };

export async function saveTeamMember(m: TeamMemberInput): Promise<boolean> {
  try {
    if (m.id) {
      const [res] = await getPool().execute<ResultSetHeader>(
        "UPDATE team_members SET name = ?, role = ?, bio = ?, photo_media_id = ?, sort_order = ? WHERE id = ?",
        [m.name, m.role, m.bio, m.photoMediaId, m.sortOrder, m.id],
      );
      return res.affectedRows > 0;
    }
    await getPool().execute(
      "INSERT INTO team_members (name, role, bio, photo_media_id, sort_order) VALUES (?, ?, ?, ?, ?)",
      [m.name, m.role, m.bio, m.photoMediaId, m.sortOrder],
    );
    return true;
  } catch (e) {
    warn("saveTeamMember", e);
    return false;
  }
}

export async function deleteTeamMember(id: number): Promise<boolean> {
  try {
    const [res] = await getPool().execute<ResultSetHeader>("DELETE FROM team_members WHERE id = ?", [id]);
    return res.affectedRows > 0;
  } catch (e) {
    warn("deleteTeamMember", e);
    return false;
  }
}

export async function setTeamMemberVisible(id: number, visible: boolean): Promise<boolean> {
  try {
    await getPool().execute("UPDATE team_members SET is_visible = ? WHERE id = ?", [visible ? 1 : 0, id]);
    return true;
  } catch (e) {
    warn("setTeamMemberVisible", e);
    return false;
  }
}
