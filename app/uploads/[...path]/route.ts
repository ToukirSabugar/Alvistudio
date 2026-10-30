import fs from "node:fs/promises";
import { CONTENT_TYPES, detectImageType, resolveUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;
  const full = resolveUploadPath((segments ?? []).join("/"));
  if (!full) return new Response("Not found", { status: 404 });
  let data: Buffer;
  try {
    data = await fs.readFile(full);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const type = detectImageType(data);
  if (!type) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": CONTENT_TYPES[type],
      "Content-Length": String(data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
