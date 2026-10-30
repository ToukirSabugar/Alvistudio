"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteFaq, saveFaq, setFaqVisible } from "@/lib/seo-store";
import { requireAdmin } from "../guard";

function text(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max + 1) : "";
}

function done(ok: boolean, error: "invalid" | "db" = "db"): never {
  revalidatePath("/", "layout");
  redirect(ok ? "/admin/faqs?ok=1" : `/admin/faqs?e=${error}`);
}

export async function addFaqAction(fd: FormData) {
  await requireAdmin();
  const r = await saveFaq({
    pagePath: text(fd, "pagePath", 120),
    question: text(fd, "question", 250),
    answer: text(fd, "answer", 3000),
  });
  if (r === "invalid") done(false, "invalid");
  done(r === "saved");
}

export async function toggleFaqAction(fd: FormData) {
  await requireAdmin();
  done(await setFaqVisible(Number(text(fd, "id", 10)), text(fd, "visible", 1) === "1"));
}

export async function deleteFaqAction(fd: FormData) {
  await requireAdmin();
  done(await deleteFaq(Number(text(fd, "id", 10))));
}
