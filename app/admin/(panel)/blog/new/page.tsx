import Link from "next/link";
import { listMedia } from "@/lib/store";
import { requireAdmin } from "../../guard";
import { AdminShell } from "../../ui";
import { PostForm } from "../PostForm";

export const dynamic = "force-dynamic";

export default async function NewPost() {
  await requireAdmin();
  const media = await listMedia();
  return (
    <AdminShell title="New post" intro="It stays a draft until you tick Published and save.">
      <p className="-mt-4 mb-6">
        <Link href="/admin/blog" className="inline-flex min-h-11 items-center text-sm underline decoration-camel underline-offset-4">
          ← All posts
        </Link>
      </p>
      <PostForm media={media} />
    </AdminShell>
  );
}
