import { createHmac, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

export const SESSION_MS = 8 * 60 * 60 * 1000;
export const SESSION_COOKIE = "alvi_admin";

/** Admin works only when the cookie-signing secret is set. Users live in the database (admin_users). */
export function adminEnabled(): boolean {
  return Boolean(process.env.ADMIN_SESSION_SECRET);
}

// ---- Password hashing (scrypt, no extra dependency) ----

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAX_N = 1 << 17; // refuse stored costs above this so a corrupted row cannot burn CPU/memory

function scryptAsync(password: string, salt: Buffer, keylen: number, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

/** Returns `scrypt$N$r$p$saltB64$hashB64`. */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(plain, salt, KEYLEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

/** Constant-time check. Any malformed stored string returns false. */
export async function verifyPasswordHash(plain: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const [n, r, p] = [parts[1], parts[2], parts[3]].map((v) => (/^\d{1,9}$/.test(v) ? Number(v) : NaN));
    if (![n, r, p].every(Number.isInteger) || n < 2 || n > MAX_N || (n & (n - 1)) !== 0 || r < 1 || r > 32 || p < 1 || p > 16) {
      return false;
    }
    const salt = Buffer.from(parts[4], "base64");
    const expected = Buffer.from(parts[5], "base64");
    if (salt.length < 8 || expected.length < 16 || expected.length > 128) return false;
    const actual = await scryptAsync(plain, salt, expected.length, { N: n, r, p, maxmem: 64 * 1024 * 1024 });
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// ---- Sessions: `userId.expiryMs.signature` ----

function digest(value: string, key: string): Buffer {
  return createHmac("sha256", key).update(value).digest();
}

/** Constant-time compare (both sides hashed so lengths match). */
function safeEqual(a: string, b: string): boolean {
  const k = "alvi-compare";
  return timingSafeEqual(digest(a, k), digest(b, k));
}

function sign(uid: string, exp: string, secret: string): string {
  return createHmac("sha256", secret).update(`alvi-admin:${uid}:${exp}`).digest("hex");
}

export function signSession(userId: number, now: number = Date.now()): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid admin user id");
  const uid = String(userId);
  const exp = String(now + SESSION_MS);
  return `${uid}.${exp}.${sign(uid, exp, secret)}`;
}

export function readSession(token: string | undefined, now: number = Date.now()): { userId: number } | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [uid, exp, sig] = parts;
  if (!/^\d{1,10}$/.test(uid) || !/^\d+$/.test(exp)) return null;
  if (!safeEqual(sig, sign(uid, exp, secret))) return null;
  if (Number(exp) <= now) return null;
  const userId = Number(uid);
  return userId > 0 ? { userId } : null;
}

export function verifySession(token: string | undefined, now: number = Date.now()): boolean {
  return readSession(token, now) !== null;
}
