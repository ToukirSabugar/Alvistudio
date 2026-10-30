"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteEnquiry, isEnquiryStatus, markEnquirySeen, saveEnquiryNotes, setEnquiryStatus } from "@/lib/store";
import { requireAdmin } from "../guard";

function text(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max + 1) : "";
}

function enquiryId(fd: FormData): number | null {
  const raw = text(fd, "id", 12);
  return /^\d{1,10}$/.test(raw) && Number(raw) > 0 ? Number(raw) : null;
}

const back = (id: number, flag: string) => `/admin/enquiries/${id}?saved=${flag}`;

export async function changeStatus(formData: FormData) {
  await requireAdmin();
  const id = enquiryId(formData);
  if (!id) redirect("/admin/enquiries");
  const status = text(formData, "status", 12);
  const note = text(formData, "note", 500);
  if (!isEnquiryStatus(status) || note.length > 500) redirect(back(id, "invalid"));
  const ok = await setEnquiryStatus(id, status, note);
  revalidatePath("/admin", "layout");
  redirect(back(id, ok ? "status" : "db"));
}

export async function saveNotes(formData: FormData) {
  await requireAdmin();
  const id = enquiryId(formData);
  if (!id) redirect("/admin/enquiries");
  const notes = text(formData, "notes", 5000);
  if (notes.length > 5000) redirect(back(id, "invalid"));
  const ok = await saveEnquiryNotes(id, notes);
  redirect(back(id, ok ? "notes" : "db"));
}

export async function removeEnquiry(formData: FormData) {
  await requireAdmin();
  const id = enquiryId(formData);
  if (!id) redirect("/admin/enquiries");
  const ok = await deleteEnquiry(id);
  revalidatePath("/admin", "layout");
  redirect(ok ? "/admin/enquiries?deleted=1" : back(id, "db"));
}

/** Called from the browser once a new enquiry's page is on screen, so a page load alone never changes data. */
export async function markSeen(id: number): Promise<void> {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) return;
  if (await markEnquirySeen(id)) revalidatePath("/admin", "layout");
}
