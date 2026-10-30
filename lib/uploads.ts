// Runtime photo uploads. Files live outside public/ and are served by app/uploads/[...path]/route.ts.
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export type ImageType = "jpeg" | "png" | "webp";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const EXT: Record<ImageType, string> = { jpeg: "jpg", png: "png", webp: "webp" };
export const CONTENT_TYPES: Record<ImageType, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
const ALLOWED_EXT = new Set(["jpg", "png", "webp"]);

export function uploadDir(): string {
  const dir = process.env.UPLOAD_DIR?.trim();
  return path.resolve(dir ? dir : path.join(process.cwd(), "uploads"));
}

/** Checks real magic bytes. SVG and everything else return null. */
export function detectImageType(b: Uint8Array): ImageType | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (b.length >= 8 && png.every((v, i) => b[i] === v)) return "png";
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  )
    return "webp";
  return null;
}

export function safeUploadName(type: ImageType): string {
  return `${randomBytes(12).toString("hex")}.${EXT[type]}`;
}

/** Maps a URL-relative path to a file inside the upload folder, or null if it is not safe. */
export function resolveUploadPath(rel: string): string | null {
  if (typeof rel !== "string" || rel.length === 0 || rel.length > 200) return null;
  if (rel.includes("\0") || rel.includes("\\") || rel.includes("%")) return null;
  if (rel.startsWith("/") || path.isAbsolute(rel) || /^[a-zA-Z]:/.test(rel)) return null;
  const parts = rel.split("/");
  if (parts.some((p) => p === "" || p === "." || p === "..")) return null;
  const ext = path.extname(rel).slice(1).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return null;
  const root = uploadDir();
  const full = path.resolve(root, ...parts);
  if (path.dirname(full) !== root && !full.startsWith(root + path.sep)) return null;
  return full;
}

/** Reads width and height from the PNG, JPEG or WebP header bytes. Returns null when unknown. */
export function imageSize(b: Uint8Array): { width: number; height: number } | null {
  const type = detectImageType(b);
  const ok = (w: number, h: number) => (w > 0 && h > 0 && w <= 65535 && h <= 65535 ? { width: w, height: h } : null);
  if (type === "png") {
    if (b.length < 24) return null;
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    return ok(dv.getUint32(16), dv.getUint32(20));
  }
  if (type === "jpeg") {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) {
        i++;
        continue;
      }
      const m = b[i + 1];
      if (m === 0xff) {
        i++;
        continue;
      }
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) {
        i += 2;
        continue;
      }
      const len = (b[i + 2] << 8) | b[i + 3];
      const isSof = m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc;
      if (isSof) return ok((b[i + 7] << 8) | b[i + 8], (b[i + 5] << 8) | b[i + 6]);
      if (len < 2) return null;
      i += 2 + len;
    }
    return null;
  }
  if (type === "webp") {
    if (b.length < 30) return null;
    const tag = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (tag === "VP8X") {
      return ok((b[24] | (b[25] << 8) | (b[26] << 16)) + 1, (b[27] | (b[28] << 8) | (b[29] << 16)) + 1);
    }
    if (tag === "VP8L") {
      if (b[20] !== 0x2f) return null;
      const w = 1 + (b[21] | ((b[22] & 0x3f) << 8));
      const h = 1 + ((b[22] >> 6) | (b[23] << 2) | ((b[24] & 0x0f) << 10));
      return ok(w, h);
    }
    if (tag === "VP8 ") {
      if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
      return ok((b[26] | (b[27] << 8)) & 0x3fff, (b[28] | (b[29] << 8)) & 0x3fff);
    }
  }
  return null;
}

/** Original file name reduced to a-z 0-9 . _ - and at most 120 characters. */
export function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 120);
  return cleaned.toLowerCase();
}

export type SavedUpload = {
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
};

export async function saveUpload(file: File): Promise<SavedUpload | { error: string }> {
  if (file.size <= 0) return { error: "empty" };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "too-large" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length > MAX_UPLOAD_BYTES) return { error: "too-large" };
  const type = detectImageType(bytes);
  if (!type) return { error: "type" };
  try {
    const root = uploadDir();
    await fs.mkdir(root, { recursive: true });
    const name = safeUploadName(type);
    await fs.writeFile(path.join(/* turbopackIgnore: true */ root, name), bytes, { flag: "wx" });
    const size = imageSize(bytes);
    return {
      url: `/uploads/${name}`,
      fileName: sanitizeFileName(file.name || "") || name,
      mimeType: CONTENT_TYPES[type],
      sizeBytes: bytes.length,
      width: size?.width ?? null,
      height: size?.height ?? null,
    };
  } catch (e) {
    console.warn(`[uploads] write failed: ${e instanceof Error ? e.message : "unknown error"}`);
    return { error: "write" };
  }
}

/** Deletes a file previously saved by saveUpload. Missing files and non-upload URLs are ignored. */
export async function deleteUploadByUrl(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  const full = resolveUploadPath(url.slice("/uploads/".length));
  if (!full) return;
  try {
    await fs.unlink(full);
  } catch {
    /* already gone */
  }
}
