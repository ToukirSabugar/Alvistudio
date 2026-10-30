// One photo from an admin form into the media library: checks the real bytes, saves the file, adds the row.
// Server only (imports node:fs through lib/uploads).
import { addMedia } from "@/lib/store";
import { deleteUploadByUrl, saveUpload } from "@/lib/uploads";
import type { GalleryCategoryId } from "@/lib/site";

export type UploadResult = { id: number } | { error: "upload" | "db" };

/** The non-empty files a form sent under `name`, at most `max`. */
export function filesFrom(fd: FormData, name: string, max: number): File[] {
  return fd
    .getAll(name)
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, max);
}

export async function uploadPhoto(
  file: File,
  meta: { slot: string; title: string; altText: string; category?: GalleryCategoryId | null; isSample?: boolean },
): Promise<UploadResult> {
  const saved = await saveUpload(file);
  if ("error" in saved) return { error: "upload" };
  const id = await addMedia({
    slot: meta.slot,
    title: meta.title,
    altText: meta.altText,
    category: meta.category ?? null,
    isSample: meta.isSample ?? false,
    fileUrl: saved.url,
    fileName: saved.fileName,
    mimeType: saved.mimeType,
    sizeBytes: saved.sizeBytes,
    width: saved.width,
    height: saved.height,
  });
  if (id === null) {
    await deleteUploadByUrl(saved.url); // no row, so no orphan file either
    return { error: "db" };
  }
  return { id };
}
