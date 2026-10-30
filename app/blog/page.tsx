import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import { GUIDE_CATEGORIES, guides } from "@/content/guides";
import { getPosts } from "@/lib/store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/blog", {
    title: "Blog and building guides",
    description:
      "Plain-language guides on concrete, bricks, steel, timber, flooring, heat and budgeting, from architects and interior designers in Himatnagar, Gujarat.",
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Format from the stored string only (no Date), e.g. "2026-10-29" -> "29 Oct 2026".
function formatDate(s: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return "";
  return `${parseInt(m[3], 10)} ${MONTHS[parseInt(m[2], 10) - 1] ?? ""} ${m[1]}`;
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const categories = GUIDE_CATEGORIES.filter((c) => guides.some((g) => g.category === c));
  const active = categories.find((c) => c === raw) ?? null;
  const shown = active ? guides.filter((g) => g.category === active) : guides;

  const posts = await getPosts();
  const guideSlugs = new Set(guides.map((g) => g.slug));
  const published = posts.filter((p) => !guideSlugs.has(p.slug));

  const pill = "inline-flex min-h-11 items-center border px-4 text-sm";
  const on = "border-ink bg-ink text-paper";
  const off = "border-[var(--line)] hover:border-ink";

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-32 sm:px-8">
      <h1 className="display text-4xl sm:text-5xl">Blog and guides</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Short, practical reading on building materials, design and planning for homes in Himatnagar and North Gujarat.
      </p>

      {published.length > 0 && (
        <section aria-labelledby="posts-h" className="mt-12">
          <h2 id="posts-h" className="display text-2xl">
            Latest posts
          </h2>
          <ul className="mt-4 list-none divide-y divide-[var(--line)] border-y border-[var(--line)] p-0">
            {published.map((p) => (
              <li key={p.slug} className="py-6">
                {formatDate(p.publishedAt) && <p className="text-sm text-muted">{formatDate(p.publishedAt)}</p>}
                <h3 className="mt-1 text-xl font-medium">
                  <Link href={`/blog/${p.slug}`} className="underline decoration-camel underline-offset-4 hover:decoration-ink">
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-2 max-w-[65ch] text-muted">{p.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="guides-h" className="mt-14">
        <h2 id="guides-h" className="display text-2xl">
          Building guides
        </h2>
        <nav aria-label="Filter guides by category" className="mt-4 flex flex-wrap gap-2">
          <Link href="/blog" aria-current={active ? undefined : "page"} className={`${pill} ${active ? off : on}`}>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/blog?category=${encodeURIComponent(c)}`}
              aria-current={active === c ? "page" : undefined}
              className={`${pill} ${active === c ? on : off}`}
            >
              {c}
            </Link>
          ))}
        </nav>

        <ul className="mt-6 list-none divide-y divide-[var(--line)] border-y border-[var(--line)] p-0">
          {shown.map((g) => (
            <li key={g.slug} className="py-6 sm:grid sm:grid-cols-[9rem_1fr] sm:gap-8">
              <p className="text-sm text-camel-deep">
                {g.category}
                <span className="block text-muted">{g.readMinutes} min read</span>
              </p>
              <div className="mt-1 sm:mt-0">
                <h3 className="text-xl font-medium [overflow-wrap:anywhere]">
                  <Link href={`/blog/${g.slug}`} className="underline decoration-camel underline-offset-4 hover:decoration-ink">
                    {g.title}
                  </Link>
                </h3>
                <p className="mt-2 max-w-[65ch] text-muted">{g.excerpt}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">Draft guides, reviewed by the studio before publishing.</p>
      </section>
    </div>
  );
}
