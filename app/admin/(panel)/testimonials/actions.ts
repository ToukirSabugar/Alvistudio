"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { projectTypes, type ProjectTypeId } from "@/lib/site";
import { addTestimonial, deleteTestimonial, setTestimonialVisible } from "@/lib/store";
import { requireAdmin } from "../guard";

function text(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max + 1) : "";
}

function knownType(v: string): v is ProjectTypeId {
  return projectTypes.some((p) => p.id === v);
}

export async function createTestimonial(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name", 80);
  const projectType = text(formData, "projectType", 40);
  const quote = text(formData, "quote", 1000);
  if (!name || name.length > 80 || !quote || quote.length > 1000 || !knownType(projectType)) {
    redirect("/admin/testimonials?e=invalid");
  }
  const ok = await addTestimonial({ name, projectType, quote });
  revalidatePath("/", "layout");
  redirect(ok ? "/admin/testimonials?ok=1" : "/admin/testimonials?e=db");
}

export async function removeTestimonial(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id", 20);
  if (/^\d+$/.test(id)) await deleteTestimonial(id);
  revalidatePath("/", "layout");
  redirect("/admin/testimonials");
}

export async function toggleTestimonial(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id", 20);
  const visible = formData.get("visible") === "1";
  if (!/^\d+$/.test(id)) redirect("/admin/testimonials?e=invalid");
  const ok = await setTestimonialVisible(id, visible);
  revalidatePath("/", "layout");
  redirect(ok ? "/admin/testimonials?ok=1" : "/admin/testimonials?e=db");
}
