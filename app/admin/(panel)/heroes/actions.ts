"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { heroPages, isHeroPath, setPageHero } from "@/lib/site-content-store";
import { filesFrom, uploadPhoto } from "@/lib/media-upload";
import { requireAdmin } from "../guard";

function str(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max + 1) : "";
}

export async function savePageHero(formData: FormData) {
  await requireAdmin();
  const path = str(formData, "path", 120);
  if (!isHeroPath(path)) redirect("/admin/heroes?e=invalid");
  const clear = str(formData, "intent", 10) === "clear";
  const mediaRaw = str(formData, "mediaId", 12);
  const alt = str(formData, "alt", 250);
  if (alt.length > 250) redirect("/admin/heroes?e=invalid");
  let mediaId: number | null = null;
  const [file] = clear ? [] : filesFrom(formData, "photo", 1);
  if (file) {
    // A new upload wins over the picked image.
    const label = heroPages.find((h) => h.path === path)?.label ?? path;
    const r = await uploadPhoto(file, { slot: "hero", title: `${label} page image`, altText: alt || `${label} page image` });
    if ("error" in r) redirect(`/admin/heroes?e=${r.error}`);
    mediaId = r.id;
  } else if (!clear) {
    if (!/^\d{1,10}$/.test(mediaRaw) || Number(mediaRaw) <= 0) redirect("/admin/heroes?e=invalid");
    mediaId = Number(mediaRaw);
  }
  const ok = await setPageHero(path, mediaId, alt);
  revalidatePath("/", "layout");
  redirect(ok ? "/admin/heroes?ok=1" : "/admin/heroes?e=db");
}
