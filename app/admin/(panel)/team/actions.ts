"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteTeamMember, saveTeamMember, setTeamMemberVisible } from "@/lib/site-content-store";
import { filesFrom, uploadPhoto } from "@/lib/media-upload";
import { requireAdmin } from "../guard";

function str(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max + 1) : "";
}

function posInt(v: string): number | null {
  return /^\d{1,10}$/.test(v) && Number(v) > 0 ? Number(v) : null;
}

export async function saveMember(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name", 100);
  const role = str(formData, "role", 100);
  const bio = str(formData, "bio", 3000);
  const photoRaw = str(formData, "photoMediaId", 12);
  const sortRaw = str(formData, "sortOrder", 6);
  const idRaw = str(formData, "id", 12);
  const id = idRaw ? posInt(idRaw) : undefined;
  let photoMediaId = photoRaw ? posInt(photoRaw) : null;
  const sortOrder = sortRaw === "" ? 0 : Number(sortRaw);
  if (
    !name || name.length > 100 || role.length > 100 || bio.length > 3000 ||
    id === null || (photoRaw && photoMediaId === null) || !Number.isInteger(sortOrder) || Math.abs(sortOrder) > 99999
  ) {
    redirect("/admin/team?e=invalid");
  }
  const [file] = filesFrom(formData, "photo", 1);
  if (file) {
    // A new upload wins over the picked image. Kept out of the public gallery (slot "team").
    const r = await uploadPhoto(file, { slot: "team", title: `Photo of ${name}`, altText: `Photo of ${name}${role ? `, ${role}` : ""}` });
    if ("error" in r) redirect(`/admin/team?e=${r.error}`);
    photoMediaId = r.id;
  }
  const ok = await saveTeamMember({ id, name, role, bio, photoMediaId, sortOrder });
  revalidatePath("/about");
  redirect(ok ? "/admin/team?ok=1" : "/admin/team?e=db");
}

export async function toggleMember(formData: FormData) {
  await requireAdmin();
  const id = posInt(str(formData, "id", 12));
  if (id) await setTeamMemberVisible(id, str(formData, "visible", 1) === "1");
  revalidatePath("/about");
  redirect("/admin/team");
}

export async function removeMember(formData: FormData) {
  await requireAdmin();
  const id = posInt(str(formData, "id", 12));
  if (id) await deleteTeamMember(id);
  revalidatePath("/about");
  redirect("/admin/team");
}
