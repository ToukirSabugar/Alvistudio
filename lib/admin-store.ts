// Small admin-only helpers missing from lib/store.ts (parameterised queries only).
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

function warn(label: string, e: unknown) {
  console.warn(`[admin-store] ${label} failed: ${e instanceof Error ? e.message : "unknown error"}`);
}

/**
 * Deletes a media row. Pages that use it (page_heroes, team_members) keep working because the schema
 * sets their reference to NULL. Returns the deleted row's file_url, or null when nothing was deleted.
 */
export async function deleteMedia(id: number): Promise<string | null> {
  try {
    const [rows] = await getPool().execute<RowDataPacket[]>("SELECT file_url FROM media_assets WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const [res] = await getPool().execute<ResultSetHeader>("DELETE FROM media_assets WHERE id = ?", [id]);
    return res.affectedRows > 0 ? String(rows[0].file_url) : null;
  } catch (e) {
    warn("deleteMedia", e);
    return null;
  }
}

export async function setMediaVisible(id: number, visible: boolean): Promise<boolean> {
  try {
    const [res] = await getPool().execute<ResultSetHeader>("UPDATE media_assets SET is_visible = ? WHERE id = ?", [
      visible ? 1 : 0,
      id,
    ]);
    return res.affectedRows > 0;
  } catch (e) {
    warn("setMediaVisible", e);
    return false;
  }
}

/**
 * Moves one image up or down within its slot (or only among the images of one gallery category, when given).
 * Renumbers that list 0..n-1 so ties cannot block a move.
 */
export async function moveMedia(id: number, direction: "up" | "down", category?: string): Promise<boolean> {
  let conn;
  try {
    conn = await getPool().getConnection();
  } catch (e) {
    warn("moveMedia", e);
    return false;
  }
  try {
    await conn.beginTransaction();
    const [own] = await conn.execute<RowDataPacket[]>("SELECT slot FROM media_assets WHERE id = ? FOR UPDATE", [id]);
    if (own.length === 0) {
      await conn.rollback();
      return false;
    }
    const [rows] = category
      ? await conn.execute<RowDataPacket[]>(
          "SELECT id FROM media_assets WHERE slot = ? AND category = ? ORDER BY sort_order ASC, created_at DESC, id DESC",
          [own[0].slot, category],
        )
      : await conn.execute<RowDataPacket[]>(
          "SELECT id FROM media_assets WHERE slot = ? ORDER BY sort_order ASC, created_at DESC, id DESC",
          [own[0].slot],
        );
    const ids = rows.map((r) => Number(r.id));
    const i = ids.indexOf(id);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= ids.length) {
      await conn.rollback();
      return true; // already at the edge: nothing to do
    }
    [ids[i], ids[j]] = [ids[j], ids[i]];
    for (let k = 0; k < ids.length; k++) {
      await conn.execute("UPDATE media_assets SET sort_order = ? WHERE id = ?", [k, ids[k]]);
    }
    await conn.commit();
    return true;
  } catch (e) {
    try {
      await conn.rollback();
    } catch {
      /* ignore */
    }
    warn("moveMedia", e);
    return false;
  } finally {
    conn.release();
  }
}

/** Removes saved overrides so the siteConfig default applies again. */
export async function clearSettings(keys: string[]): Promise<boolean> {
  if (keys.length === 0) return true;
  try {
    await getPool().query("DELETE FROM settings WHERE `key` IN (?)", [keys]);
    return true;
  } catch (e) {
    console.warn(`[admin-store] clearSettings failed: ${e instanceof Error ? e.message : "unknown error"}`);
    return false;
  }
}

/** Edits the describing fields of one uploaded image (the file itself never changes). */
export async function updateMedia(
  id: number,
  input: { title: string; altText: string; category: string | null; isSample: boolean },
): Promise<boolean> {
  try {
    const [res] = await getPool().execute<ResultSetHeader>(
      "UPDATE media_assets SET title = ?, alt_text = ?, category = ?, is_sample = ? WHERE id = ?",
      [input.title, input.altText, input.category, input.isSample ? 1 : 0, id],
    );
    return res.affectedRows > 0;
  } catch (e) {
    warn("updateMedia", e);
    return false;
  }
}

/** The file URL of one uploaded image, or null. */
export async function mediaUrl(id: number): Promise<string | null> {
  try {
    const [rows] = await getPool().execute<RowDataPacket[]>("SELECT file_url FROM media_assets WHERE id = ?", [id]);
    return rows[0] ? String(rows[0].file_url) : null;
  } catch (e) {
    warn("mediaUrl", e);
    return null;
  }
}
