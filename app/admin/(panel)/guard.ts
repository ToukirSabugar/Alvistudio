import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, adminEnabled, readSession } from "@/lib/auth";
import { findAdminById, type AdminUser } from "@/lib/auth-store";

/**
 * Call at the top of every admin page and every admin server action.
 * Checks the signed cookie, then that the user still exists and is active (fails closed if the database is down).
 * Returns the signed-in user.
 */
export async function requireAdmin(): Promise<AdminUser> {
  if (!adminEnabled()) redirect("/admin/login");
  const jar = await cookies();
  const session = readSession(jar.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");
  const user = await findAdminById(session.userId);
  if (!user || !user.isActive) redirect("/admin/login");
  return user;
}
