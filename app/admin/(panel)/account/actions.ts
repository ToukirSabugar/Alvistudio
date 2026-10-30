"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hashPassword, verifyPasswordHash } from "@/lib/auth";
import { countActiveAdmins, createAdminUser, setAdminActive, updatePasswordHash } from "@/lib/auth-store";
import { canDeactivate, cleanNewAdmin, passwordProblem } from "@/lib/admin-rules";
import { rateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "../guard";

function raw(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.slice(0, max) : "";
}

function go(code: string): never {
  redirect(`/admin/account?m=${code}`);
}

export async function changePassword(fd: FormData) {
  const user = await requireAdmin();
  if (!rateLimit(`pw-change:${user.id}`, 5, 10 * 60 * 1000)) go("rate");
  const current = raw(fd, "current", 200);
  const next = raw(fd, "newPassword", 201);
  const confirm = raw(fd, "confirm", 201);
  if (!(await verifyPasswordHash(current, user.passwordHash))) go("wrong-current");
  if (passwordProblem(next, confirm)) go("weak");
  const ok = await updatePasswordHash(user.id, await hashPassword(next));
  go(ok ? "pw-ok" : "db");
}

export async function addAdmin(fd: FormData) {
  await requireAdmin();
  const r = cleanNewAdmin({
    email: raw(fd, "email", 200),
    name: raw(fd, "name", 120),
    password: raw(fd, "password", 201),
    confirm: raw(fd, "confirm", 201),
  });
  if (!r.ok) go("add-invalid");
  try {
    await createAdminUser(r.value.email, r.value.name, await hashPassword(r.value.password));
  } catch (e) {
    go((e as { code?: string }).code === "ER_DUP_ENTRY" ? "add-exists" : "db");
  }
  revalidatePath("/admin/account");
  go("add-ok");
}

export async function toggleAdmin(fd: FormData) {
  const user = await requireAdmin();
  const idRaw = raw(fd, "id", 12);
  const id = /^\d{1,10}$/.test(idRaw) ? Number(idRaw) : 0;
  const activate = raw(fd, "active", 1) === "1";
  if (!id) go("db");
  if (!activate) {
    const active = await countActiveAdmins().catch(() => null);
    if (active === null) go("db");
    if (!canDeactivate(user.id, id, active)) go("cannot-off");
  }
  const ok = await setAdminActive(id, activate);
  revalidatePath("/admin/account");
  go(ok ? "toggle-ok" : "db");
}
