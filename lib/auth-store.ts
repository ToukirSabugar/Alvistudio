// Admin users and the sign-in log (tables admin_users, admin_login_log). Parameterised queries only.
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

export type AdminUser = {
  id: number;
  email: string;
  displayName: string;
  passwordHash: string;
  isActive: boolean;
  isLocked: boolean;
};

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  display_name: string;
  password_hash: string;
  is_active: number;
  is_locked: number;
};

const SELECT_USER =
  "SELECT id, email, display_name, password_hash, is_active, (locked_until IS NOT NULL AND locked_until > NOW()) AS is_locked FROM admin_users";

function toUser(r: UserRow): AdminUser {
  return {
    id: Number(r.id),
    email: r.email,
    displayName: r.display_name,
    passwordHash: r.password_hash,
    isActive: Number(r.is_active) === 1,
    isLocked: Number(r.is_locked) === 1,
  };
}

function warn(fn: string, e: unknown) {
  console.warn(`[auth-store] ${fn} failed: ${e instanceof Error ? e.message : "unknown error"}`);
}

/**
 * Looks a user up by email. THROWS when the database cannot be reached, so the login can fail closed
 * with a clear message (a missing user is `null`, a down database is an error).
 */
export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const [rows] = await getPool().execute<UserRow[]>(`${SELECT_USER} WHERE email = ? LIMIT 1`, [email.trim().toLowerCase()]);
  return rows[0] ? toUser(rows[0]) : null;
}

/** Used on every admin request to confirm the session's user is still active. Returns null on any error. */
export async function findAdminById(id: number): Promise<AdminUser | null> {
  try {
    const [rows] = await getPool().execute<UserRow[]>(`${SELECT_USER} WHERE id = ? LIMIT 1`, [id]);
    return rows[0] ? toUser(rows[0]) : null;
  } catch (e) {
    warn("findAdminById", e);
    return null;
  }
}

/** True only when the table was read and has no rows (an unreadable table returns false). */
export async function adminTableEmpty(): Promise<boolean> {
  try {
    const [rows] = await getPool().query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM admin_users");
    return Number(rows[0]?.n ?? 0) === 0;
  } catch (e) {
    warn("adminTableEmpty", e);
    return false;
  }
}

export async function recordLogin(input: {
  adminUserId: number | null;
  email: string;
  success: boolean;
  ip: string;
  userAgent: string;
}): Promise<void> {
  try {
    const pool = getPool();
    await pool.execute<ResultSetHeader>(
      "INSERT INTO admin_login_log (admin_user_id, email, success, ip, user_agent) VALUES (?, ?, ?, ?, ?)",
      [input.adminUserId, input.email.slice(0, 190), input.success ? 1 : 0, input.ip.slice(0, 45), input.userAgent.slice(0, 255)],
    );
    if (input.adminUserId === null) return;
    if (input.success) {
      await pool.execute(
        "UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?",
        [input.adminUserId],
      );
    } else {
      // locked_until is assigned first so it sees the count before this failure is added (MySQL and MariaDB agree).
      await pool.execute(
        `UPDATE admin_users
           SET locked_until = IF(failed_attempts + 1 >= ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), locked_until),
               failed_attempts = LEAST(failed_attempts + 1, 250)
         WHERE id = ?`,
        [MAX_FAILED_ATTEMPTS, LOCK_MINUTES, input.adminUserId],
      );
    }
  } catch (e) {
    warn("recordLogin", e);
  }
}

/** Throws on failure (duplicate email, database down) so the create-admin script can report it. */
export async function createAdminUser(email: string, displayName: string, passwordHash: string): Promise<number> {
  const [res] = await getPool().execute<ResultSetHeader>(
    "INSERT INTO admin_users (email, display_name, password_hash) VALUES (?, ?, ?)",
    [email.trim().toLowerCase().slice(0, 190), displayName.trim().slice(0, 100), passwordHash],
  );
  return res.insertId;
}

export type AdminListRow = { id: number; email: string; displayName: string; isActive: boolean; lastLoginAt: string | null };

export async function listAdmins(): Promise<AdminListRow[]> {
  try {
    const [rows] = await getPool().query<RowDataPacket[]>(
      "SELECT id, email, display_name, is_active, last_login_at FROM admin_users ORDER BY id",
    );
    return rows.map((r) => ({
      id: Number(r.id),
      email: r.email,
      displayName: r.display_name ?? "",
      isActive: Number(r.is_active) === 1,
      lastLoginAt: r.last_login_at instanceof Date ? r.last_login_at.toISOString() : null,
    }));
  } catch (e) {
    warn("listAdmins", e);
    return [];
  }
}

/** Throws when the database cannot be read, so a deactivate never runs on a guess. */
export async function countActiveAdmins(): Promise<number> {
  const [rows] = await getPool().query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM admin_users WHERE is_active = 1");
  return Number(rows[0]?.n ?? 0);
}

export async function setAdminActive(id: number, active: boolean): Promise<boolean> {
  try {
    const [res] = await getPool().execute<ResultSetHeader>(
      "UPDATE admin_users SET is_active = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?",
      [active ? 1 : 0, id],
    );
    return res.affectedRows > 0;
  } catch (e) {
    warn("setAdminActive", e);
    return false;
  }
}

export async function updatePasswordHash(id: number, passwordHash: string): Promise<boolean> {
  try {
    const [res] = await getPool().execute<ResultSetHeader>("UPDATE admin_users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
    return res.affectedRows > 0;
  } catch (e) {
    warn("updatePasswordHash", e);
    return false;
  }
}

export type LoginLogRow = { email: string; success: boolean; ip: string; createdAt: string };

export async function recentLogins(limit = 20): Promise<LoginLogRow[]> {
  try {
    const [rows] = await getPool().query<RowDataPacket[]>(
      "SELECT email, success, ip, created_at FROM admin_login_log ORDER BY created_at DESC, id DESC LIMIT ?",
      [limit],
    );
    return rows.map((r) => ({
      email: r.email,
      success: Number(r.success) === 1,
      ip: r.ip ?? "",
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }));
  } catch (e) {
    warn("recentLogins", e);
    return [];
  }
}
