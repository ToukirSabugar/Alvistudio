"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MS, adminEnabled, hashPassword, signSession, verifyPasswordHash } from "@/lib/auth";
import { findAdminByEmail, recordLogin } from "@/lib/auth-store";
import { rateLimit } from "@/lib/rate-limit";

let dummy: Promise<string> | null = null;
/** A throwaway hash used to equalise timing when the email is unknown. */
function dummyHash(): Promise<string> {
  dummy ??= hashPassword("not-a-real-password");
  return dummy;
}

export async function login(formData: FormData) {
  if (!adminEnabled()) redirect("/admin/login");
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  if (!rateLimit(`admin-login:${ip}`, 5, 10 * 60 * 1000)) redirect("/admin/login?e=rate");
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase().slice(0, 190) : "";
  const password = typeof rawPassword === "string" ? rawPassword.slice(0, 200) : "";
  if (!email || !password) redirect("/admin/login?e=bad");
  const userAgent = h.get("user-agent") ?? "";

  let user;
  try {
    user = await findAdminByEmail(email);
  } catch {
    // Database unreachable: fail closed, never let anyone in.
    redirect("/admin/login?e=db");
  }
  // Always run one scrypt, so a wrong email costs the same time as a wrong password.
  const ok = await verifyPasswordHash(password, user?.passwordHash ?? (await dummyHash()));
  if (!user || !ok || !user.isActive || user.isLocked) {
    await recordLogin({ adminUserId: user?.id ?? null, email, success: false, ip, userAgent });
    redirect("/admin/login?e=bad");
  }
  await recordLogin({ adminUserId: user.id, email, success: true, ip, userAgent });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(user.id), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_MS / 1000),
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
