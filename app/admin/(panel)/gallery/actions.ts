"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { galleryCategories, type GalleryCategoryId } from "@/lib/site";
import { addMedia } from "@/lib/store";
import { deleteMedia, moveMedia, setMediaVisible, updateMedia } from "@/lib/admin-store";
import { filesFrom, uploadPhoto } from "@/lib/media-upload";
import { deleteUploadByUrl } from "@/lib/uploads";
import { requireAdmin } from "../guard";

const MAX_BATCH = 6;

function text(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max + 1) : "";
}

function knownType(v: string): v is GalleryCategoryId {
  return galleryCategories.some((c) => c.id === v);
}

function mediaId(fd: FormData): number | null {
  const id = text(fd, "id", 20);
  return /^\d+$/.test(id) && Number(id) > 0 ? Number(id) : null;
}

/** Back to the list, keeping the category filter the owner was looking at. */
function back(fd: FormData, flag: Record<string, string> = {}): string {
  const q = new URLSearchParams(flag);
  const cat = text(fd, "filter", 40);
  if (knownType(cat)) q.set("cat", cat);
  const s = q.toString();
  return s ? `/admin/gallery?${s}` : "/admin/gallery";
}

/** Adds up to 6 photos to one category. With more than one photo the titles are numbered: "Kitchen", "Kitchen 2"... */
export async function addGalleryPhotos(formData: FormData) {
  await requireAdmin();
  const title = text(formData, "title", 120);
  const altText = text(formData, "altText", 250);
  const category = text(formData, "category", 40);
  const isSample = formData.get("isSample") === "on";
  if (!title || title.length > 120 || !altText || altText.length > 250 || !knownType(category)) {
    redirect(back(formData, { e: "invalid" }));
  }
  const files = filesFrom(formData, "photos", MAX_BATCH);

  if (files.length === 0) {
    // Advanced fallback: a typed site path or https link instead of an upload.
    const fileUrl = text(formData, "imageUrl", 500);
    if (!/^(\/(?!\/)|https:\/\/)[^\s<>"']+$/.test(fileUrl) || fileUrl.length > 500) redirect(back(formData, { e: "invalid" }));
    const id = await addMedia({
      slot: "gallery",
      title,
      altText,
      category,
      isSample,
      fileUrl,
      fileName: "",
      mimeType: "",
      sizeBytes: 0,
      width: null,
      height: null,
    });
    revalidatePath("/gallery");
    redirect(back(formData, id ? { ok: "1" } : { e: "db" }));
  }

  let failed: "upload" | "db" | null = null;
  // Saved one by one in reverse, so the first chosen photo ends up first in the list (new photos go to the top).
  for (let i = files.length - 1; i >= 0; i--) {
    const r = await uploadPhoto(files[i], {
      slot: "gallery",
      title: files.length > 1 && i > 0 ? `${title} ${i + 1}`.slice(0, 120) : title,
      altText,
      category,
      isSample,
    });
    if ("error" in r) failed ??= r.error;
  }
  revalidatePath("/gallery");
  redirect(back(formData, failed ? { e: failed } : { ok: String(files.length) }));
}

export async function editGalleryPhoto(formData: FormData) {
  await requireAdmin();
  const id = mediaId(formData);
  const title = text(formData, "title", 120);
  const altText = text(formData, "altText", 250);
  const category = text(formData, "category", 40);
  if (!id || !title || title.length > 120 || !altText || altText.length > 250 || !knownType(category)) {
    redirect(back(formData, { e: "invalid" }));
  }
  const ok = await updateMedia(id, { title, altText, category, isSample: formData.get("isSample") === "on" });
  revalidatePath("/gallery");
  redirect(back(formData, ok ? { ok: "1" } : { e: "db" }));
}

export async function removeGalleryItem(formData: FormData) {
  await requireAdmin();
  const id = mediaId(formData);
  if (id) {
    // The row is deleted first; a missing file must never block that. Pages that used the image
    // (page_heroes, team_members) fall back to their built-in design because the schema sets NULL.
    const url = await deleteMedia(id);
    if (url) await deleteUploadByUrl(url);
  }
  revalidatePath("/", "layout");
  redirect(back(formData, { ok: "1" }));
}

export async function toggleGalleryItem(formData: FormData) {
  await requireAdmin();
  const id = mediaId(formData);
  if (!id) redirect(back(formData, { e: "invalid" }));
  const ok = await setMediaVisible(id, formData.get("visible") === "1");
  revalidatePath("/", "layout");
  redirect(back(formData, ok ? { ok: "1" } : { e: "db" }));
}

export async function moveGalleryItem(formData: FormData) {
  await requireAdmin();
  const id = mediaId(formData);
  const dir = text(formData, "dir", 4);
  if (!id || (dir !== "up" && dir !== "down")) redirect(back(formData, { e: "invalid" }));
  const cat = text(formData, "filter", 40);
  const ok = await moveMedia(id, dir, knownType(cat) ? cat : undefined);
  revalidatePath("/gallery");
  redirect(back(formData, ok ? {} : { e: "db" }));
}
