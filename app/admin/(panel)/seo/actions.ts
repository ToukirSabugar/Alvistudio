"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addSeoKeyword,
  deleteSeoKeyword,
  savePageSeo,
  setSeoKeywordActive,
  SEO_PATHS,
} from "@/lib/seo-store";
import { requireAdmin } from "../guard";
import { STARTER_KEYWORDS } from "./starter";

function text(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max + 1) : "";
}

function done(ok: boolean, error: "invalid" | "db" = "db"): never {
  revalidatePath("/", "layout");
  redirect(ok ? "/admin/seo?ok=1" : `/admin/seo?e=${error}`);
}

/** One form saves every page row. Fields are named title:/path, desc:/path, og:/path, noindex:/path. */
export async function savePageSeoAll(fd: FormData) {
  await requireAdmin();
  let allOk = true;
  for (const path of SEO_PATHS) {
    const r = await savePageSeo({
      path,
      metaTitle: text(fd, `title:${path}`, 120),
      metaDescription: text(fd, `desc:${path}`, 300),
      ogImageUrl: text(fd, `og:${path}`, 500),
      noindex: fd.get(`noindex:${path}`) === "on",
    });
    if (r === "invalid") done(false, "invalid");
    if (r === "error") allOk = false;
  }
  done(allOk);
}

export async function addKeywordAction(fd: FormData) {
  await requireAdmin();
  const r = await addSeoKeyword({
    keyword: text(fd, "keyword", 150),
    pagePath: text(fd, "pagePath", 120),
    intent: text(fd, "intent", 20),
    priority: text(fd, "priority", 1),
    targetCity: text(fd, "targetCity", 60),
    notes: text(fd, "notes", 300),
  });
  if (r === "invalid") done(false, "invalid");
  done(r !== "error");
}

export async function addStarterKeywordsAction() {
  await requireAdmin();
  let failed = false;
  for (const kw of STARTER_KEYWORDS) {
    if ((await addSeoKeyword(kw)) === "error") failed = true;
  }
  done(!failed);
}

export async function toggleKeywordAction(fd: FormData) {
  await requireAdmin();
  const id = Number(text(fd, "id", 10));
  done(await setSeoKeywordActive(id, text(fd, "active", 1) === "1"));
}

export async function deleteKeywordAction(fd: FormData) {
  await requireAdmin();
  done(await deleteSeoKeyword(Number(text(fd, "id", 10))));
}
