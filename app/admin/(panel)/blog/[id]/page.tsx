import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostAdmin } from "@/lib/posts-admin";
import { listMedia } from "@/lib/store";
import { requireAdmin } from "../../guard";
import { ConfirmButton } from "../../ConfirmButton";
import { AdminShell, btnDangerCls, btnQuietCls } from "../../ui";
import { deletePostAction } from "../actions";
import { PostForm } from "../PostForm";

export const dynamic = "force-dynamic";

export default async function EditPost({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const { id: raw } = await params;
  const { saved } = await searchParams;
  const id = /^\d{1,10}$/.test(raw) ? Number(raw) : 0;
  const [post, media] = await Promise.all([id ? getPostAdmin(id) : null, listMedia()]);
  if (!post) notFound();
  return (
    <AdminShell
      title="Edit post"
      intro={post.isPublished ? "Published: changes show on the website as soon as you save." : "Draft: not on the website yet."}
      actions={
        post.isPublished ? (
          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener" className={btnQuietCls}>
            View on website
          </a>
        ) : null
      }
    >
      <p className="-mt-4 mb-6">
        <Link href="/admin/blog" className="inline-flex min-h-11 items-center text-sm underline decoration-camel underline-offset-4">
          ← All posts
        </Link>
      </p>
      {saved ? (
        <p role="status" className="mb-6 border-l-4 border-camel-deep bg-white p-4">
          Saved.
        </p>
      ) : null}
      <PostForm key={post.updatedAt} post={post} media={media} />
      <form action={deletePostAction} className="mt-10 border border-red-800/40 bg-white p-5">
        <input type="hidden" name="id" value={post.id} />
        <p className="font-medium text-red-800">Delete this post</p>
        <p className="mt-1 text-sm text-muted">It disappears from the website straight away. This cannot be undone.</p>
        <div className="mt-3">
          <ConfirmButton message={`Delete "${post.title}" for good?`} className={btnDangerCls}>
            Delete post
          </ConfirmButton>
        </div>
      </form>
    </AdminShell>
  );
}
