"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { guides } from "@/content/guides";
import { cleanPost } from "@/lib/post-input";
import { deletePost, otherPostSlugs, savePost } from "@/lib/posts-admin";
import { mediaUrl } from "@/lib/admin-store";
import { filesFrom, uploadPhoto } from "@/lib/media-upload";
import { requireAdmin } from "../guard";

export type PostFormState = { errors?: Record<string, string>; message?: string };

function text(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.slice(0, max) : "";
}

function postId(fd: FormData): number | undefined {
  const raw = text(fd, "id", 12);
  return /^\d{1,10}$/.test(raw) && Number(raw) > 0 ? Number(raw) : undefined;
}

export async function savePostAction(_prev: PostFormState, fd: FormData): Promise<PostFormState> {
  await requireAdmin();
  const id = postId(fd);
  let taken: string[];
  try {
    taken = [...guides.map((g) => g.slug), ...(await otherPostSlugs(id))];
  } catch {
    return { message: "Could not reach the database. Nothing was saved. Try again in a minute." };
  }

  // Cover: a new upload wins, then a picked image, then "no cover".
  let coverUrl = "";
  const picked = text(fd, "coverMediaId", 12);
  if (/^\d{1,10}$/.test(picked)) coverUrl = (await mediaUrl(Number(picked))) ?? "";

  const r = cleanPost(
    {
      title: text(fd, "title", 400),
      slug: text(fd, "slug", 200),
      excerpt: text(fd, "excerpt", 1000),
      body: text(fd, "body", 70000),
      coverUrl,
      coverAlt: text(fd, "coverAlt", 400),
      metaDescription: text(fd, "metaDescription", 600),
      publish: fd.get("publish") === "on",
    },
    taken,
  );
  if (!r.ok) return { errors: r.errors, message: "Please fix the marked fields. Nothing was saved yet." };

  const [file] = filesFrom(fd, "cover", 1);
  if (file) {
    const up = await uploadPhoto(file, { slot: "blog", title: `Cover: ${r.value.title}`.slice(0, 150), altText: r.value.coverAlt ?? r.value.title });
    if ("error" in up) return { message: up.error === "upload" ? "The cover photo must be a real JPEG, PNG or WebP up to 8 MB." : "Could not save the cover photo." };
    r.value.coverUrl = await mediaUrl(up.id);
  }

  const saved = await savePost(r.value, id);
  if (saved === "taken") return { errors: { slug: "That web address is already used. Choose another." }, message: "Nothing was saved yet." };
  if (saved === null) return { message: "Could not reach the database. Nothing was saved. Try again in a minute." };
  revalidatePath("/blog");
  revalidatePath(`/blog/${r.value.slug}`);
  revalidatePath("/sitemap.xml");
  redirect(`/admin/blog/${saved}?saved=1`);
}

export async function deletePostAction(fd: FormData) {
  await requireAdmin();
  const id = postId(fd);
  const slug = id ? await deletePost(id) : null;
  if (slug) {
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/sitemap.xml");
  }
  redirect(slug ? "/admin/blog?deleted=1" : "/admin/blog?e=db");
}
