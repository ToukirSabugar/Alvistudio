import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "alvi-up-"));
process.env.UPLOAD_DIR = dir;

import {
  MAX_UPLOAD_BYTES,
  detectImageType,
  imageSize,
  sanitizeFileName,
  resolveUploadPath,
  safeUploadName,
  saveUpload,
} from "@/lib/uploads";

const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]);
const webp = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]);
const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

describe("detectImageType", () => {
  it("recognises real headers", () => {
    expect(detectImageType(png)).toBe("png");
    expect(detectImageType(jpeg)).toBe("jpeg");
    expect(detectImageType(webp)).toBe("webp");
  });
  it("refuses SVG, empty and RIFF non-webp", () => {
    expect(detectImageType(svg)).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
    const wav = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45]);
    expect(detectImageType(wav)).toBeNull();
  });
});

describe("safeUploadName", () => {
  it("is 24 hex chars plus extension and random", () => {
    const a = safeUploadName("png");
    expect(a).toMatch(/^[0-9a-f]{24}\.png$/);
    expect(safeUploadName("jpeg")).toMatch(/\.jpg$/);
    expect(safeUploadName("webp")).toMatch(/\.webp$/);
    expect(safeUploadName("png")).not.toBe(a);
  });
});

describe("resolveUploadPath", () => {
  it("accepts a plain generated name inside the folder", () => {
    const p = resolveUploadPath("abc123.png");
    expect(p).not.toBeNull();
    expect(path.dirname(p as string)).toBe(path.resolve(dir));
  });
  it.each(["../etc/passwd", "..%2f", "..%2fx.png", "a\\b.png", "/abs.png", "x.svg", "a/../../b.png", "a\0.png", "noext", ""])(
    "refuses %j",
    (rel) => {
      expect(resolveUploadPath(rel)).toBeNull();
    },
  );
});

describe("saveUpload", () => {
  it("saves a real PNG and returns a url", async () => {
    const r = await saveUpload(new File([png], "photo.png", { type: "image/png" }));
    expect("url" in r).toBe(true);
    if ("url" in r) {
      expect(r.url).toMatch(/^\/uploads\/[0-9a-f]{24}\.png$/);
      const full = resolveUploadPath(r.url.replace("/uploads/", ""));
      expect(fs.existsSync(full as string)).toBe(true);
    }
  });
  it("saves jpeg and webp with the right extension", async () => {
    const j = await saveUpload(new File([jpeg], "a.jpg"));
    const w = await saveUpload(new File([webp], "a.webp"));
    expect("url" in j && j.url.endsWith(".jpg")).toBe(true);
    expect("url" in w && w.url.endsWith(".webp")).toBe(true);
  });
  it("refuses SVG even with an image extension", async () => {
    const r = await saveUpload(new File([svg], "evil.png", { type: "image/png" }));
    expect("error" in r).toBe(true);
  });
  it("refuses files over the cap and empty files", async () => {
    const big = new Uint8Array(MAX_UPLOAD_BYTES + 1);
    big.set(png);
    expect("error" in (await saveUpload(new File([big], "big.png")))).toBe(true);
    expect("error" in (await saveUpload(new File([], "e.png")))).toBe(true);
  });
});

describe("imageSize", () => {
  const be32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  it("reads a PNG IHDR", () => {
    const b = Uint8Array.from([...pngSig, ...be32(13), 0x49, 0x48, 0x44, 0x52, ...be32(640), ...be32(480), 8, 6, 0, 0, 0]);
    expect(imageSize(b)).toEqual({ width: 640, height: 480 });
  });
  it("reads a JPEG SOF0 after an APP0 segment", () => {
    const app0 = [0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0];
    const sof = [0xff, 0xc0, 0x00, 0x11, 8, 0x03, 0x00, 0x04, 0x00, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1];
    expect(imageSize(Uint8Array.from([0xff, 0xd8, ...app0, ...sof]))).toEqual({ width: 1024, height: 768 });
  });
  it("reads WebP VP8X, VP8L and VP8", () => {
    const riff = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];
    const le24 = (n: number) => [n & 255, (n >> 8) & 255, (n >> 16) & 255];
    const vp8x = Uint8Array.from([...riff, 0x56, 0x50, 0x38, 0x58, 10, 0, 0, 0, 0, 0, 0, 0, ...le24(799), ...le24(599)]);
    expect(imageSize(vp8x)).toEqual({ width: 800, height: 600 });
    // VP8L: width-1 = 299 (14 bits), height-1 = 199 (14 bits)
    const w = 299;
    const h = 199;
    const bits = w | (h << 14);
    const vp8l = Uint8Array.from([
      ...riff, 0x56, 0x50, 0x38, 0x4c, 5, 0, 0, 0, 0x2f,
      bits & 255, (bits >> 8) & 255, (bits >> 16) & 255, (bits >>> 24) & 255, 0, 0, 0, 0, 0, 0,
    ]);
    expect(imageSize(vp8l)).toEqual({ width: 300, height: 200 });
    const vp8 = Uint8Array.from([
      ...riff, 0x56, 0x50, 0x38, 0x20, 10, 0, 0, 0, 0, 0, 0, 0x9d, 0x01, 0x2a, 0xe8, 0x03, 0xd0, 0x02, 0, 0,
    ]);
    expect(imageSize(vp8)).toEqual({ width: 1000, height: 720 });
  });
  it("returns null for truncated, unknown and SVG data", () => {
    expect(imageSize(png)).toBeNull();
    expect(imageSize(jpeg)).toBeNull();
    expect(imageSize(webp)).toBeNull();
    expect(imageSize(svg)).toBeNull();
    expect(imageSize(new Uint8Array())).toBeNull();
  });
});

describe("sanitizeFileName", () => {
  it("keeps only a-z 0-9 . _ - and caps at 120", () => {
    expect(sanitizeFileName("My Photo (1) é.JPG")).toMatch(/^[a-z0-9._-]+$/);
    expect(sanitizeFileName("../../etc/passwd")).not.toContain("/");
    expect(sanitizeFileName("a".repeat(300)).length).toBe(120);
  });
});

describe("saveUpload metadata", () => {
  it("returns name, mime, size and dimensions", async () => {
    const be32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
    const b = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...be32(13), 0x49, 0x48, 0x44, 0x52, ...be32(20), ...be32(10), 8, 6, 0, 0, 0]);
    const r = await saveUpload(new File([b], "Front View.PNG", { type: "image/png" }));
    expect("url" in r).toBe(true);
    if ("url" in r) {
      expect(r.fileName).toBe("front-view.png");
      expect(r.mimeType).toBe("image/png");
      expect(r.sizeBytes).toBe(b.length);
      expect(r.width).toBe(20);
      expect(r.height).toBe(10);
    }
  });
});

beforeAll(() => undefined);
