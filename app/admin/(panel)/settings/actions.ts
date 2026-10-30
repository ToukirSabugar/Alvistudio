"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveSettings } from "@/lib/store";
import { clearSettings } from "@/lib/admin-store";
import { requireAdmin } from "../guard";

function text(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max + 1) : "";
}

const SETTING_FIELDS: { key: string; max: number; kind: "text" | "digits" | "url" | "email" }[] = [
  { key: "phone", max: 20, kind: "digits" },
  { key: "whatsapp", max: 20, kind: "digits" },
  { key: "email", max: 190, kind: "email" },
  { key: "address", max: 300, kind: "text" },
  { key: "hours", max: 100, kind: "text" },
  { key: "mapUrl", max: 500, kind: "url" },
  { key: "ratingUrl", max: 500, kind: "url" },
  { key: "instagram", max: 500, kind: "url" },
  { key: "facebook", max: 500, kind: "url" },
  { key: "youtube", max: 500, kind: "url" },
];

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const out: Record<string, string> = {};
  const blank: string[] = [];
  for (const f of SETTING_FIELDS) {
    let v = text(formData, f.key, f.max);
    if (v.length > f.max) redirect("/admin/settings?e=invalid");
    if (f.kind === "digits") {
      if (v && !/^[+\d][\d\s-]{4,18}$/.test(v)) redirect("/admin/settings?e=invalid");
      v = v.replace(/[\s-]/g, "");
    }
    if (f.kind === "url" && v && !/^https:\/\/[^\s<>"']+$/.test(v)) redirect("/admin/settings?e=invalid");
    if (f.kind === "email" && v && !/^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(v)) redirect("/admin/settings?e=invalid");
    if (v) out[f.key] = v;
    else blank.push(f.key); // blank means "use the built-in default" (or "not shown" for social links)
  }
  const ok = (await saveSettings(out)) && (await clearSettings(blank));
  revalidatePath("/", "layout");
  redirect(ok ? "/admin/settings?ok=1" : "/admin/settings?e=db");
}
