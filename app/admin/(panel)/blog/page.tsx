import Link from "next/link";
import { guides } from "@/content/guides";
import { formatIst } from "@/lib/ist";
import { listPostsAdmin } from "@/lib/posts-admin";
import { requireAdmin } from "../guard";
import { AdminShell, Notice, btnCls, cardCls } from "../ui";

export const dynamic = "force-dynamic";

export default async function BlogAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string; e?: string }> }) {
  await requireAdmin();
  const { deleted, e } = await searchParams;
  const posts = await listPostsAdmin();
  return (
    <AdminShell
      title="Blog posts"
      intro="News, finished projects and advice in your own words. Published posts appear on the Blog page and in Google's sitemap."
      actions={
        <Link href="/admin/blog/new" className={btnCls}>
          Write a new post
        </Link>
      }
    >
      {deleted ? (
        <p role="status" className="mb-6 border-l-4 border-camel-deep bg-white p-4">
          The post was deleted.
        </p>
      ) : (
        <Notice error={e} />
      )}
      {posts.length === 0 ? (
        <p className={`${cardCls} p-6`}>No posts yet. Use “Write a new post” to start one; it stays a draft until you publish it.</p>
      ) : (
        <ul className={`${cardCls} divide-y divide-ink/10`}>
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/blog/${p.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 hover:bg-paper-2/60">
                <span className="min-w-0">
                  <span className="block font-medium">{p.title}</span>
                  <span className="block truncate text-sm text-muted">/blog/{p.slug}</span>
                </span>
                <span className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-0.5 text-xs ${p.isPublished ? "bg-camel text-ink" : "border border-ink/30 text-muted"}`}>
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                  <span className="text-muted">{p.publishedAt ? formatIst(p.publishedAt, "date") : `Edited ${formatIst(p.updatedAt, "date")}`}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-sm text-muted">
        The {guides.length} building guides on the Blog page are part of the website itself and are changed by your web developer.
      </p>
    </AdminShell>
  );
}
