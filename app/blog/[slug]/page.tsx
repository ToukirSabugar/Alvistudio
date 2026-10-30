import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { getGuide, guides } from "@/content/guides";
import { getPost } from "@/lib/store";
import { postBlocks } from "@/lib/post-input";

type Article = {
  title: string;
  excerpt: string;
  paragraphs: string[];
  draft: boolean;
  coverUrl: string | null;
  coverAlt: string;
  metaDescription: string | null;
  category: string | null;
  readMinutes: number | null;
  related: string[];
};

async function load(slug: string): Promise<Article | null> {
  const g = getGuide(slug);
  if (g) {
    return {
      title: g.title,
      excerpt: g.excerpt,
      paragraphs: g.body,
      draft: true,
      coverUrl: null,
      coverAlt: "",
      metaDescription: null,
      category: g.category,
      readMinutes: g.readMinutes,
      related: g.related,
    };
  }
  const p = await getPost(slug);
  if (!p) return null;
  const paragraphs = postBlocks(p.body);
  return {
    title: p.title,
    excerpt: p.excerpt,
    paragraphs,
    draft: false,
    coverUrl: p.coverUrl,
    coverAlt: p.coverAlt ?? "",
    metaDescription: p.metaDescription ?? null,
    category: null,
    readMinutes: null,
    related: [],
  };
}

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

function clip(s: string, n: number) {
  return s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = await load(slug);
  if (!a) return { title: "Article not found" };
  return {
    title: clip(a.title, 52),
    description: clip(a.metaDescription || a.excerpt, 155),
    alternates: { canonical: `/blog/${slug}` },
    // Draft guides stay out of search until the studio has reviewed them.
    robots: a.draft ? { index: false, follow: true } : undefined,
  };
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const a = await load(slug);
  if (!a) notFound();

  const related = a.related.map((s) => getGuide(s)).filter((g): g is NonNullable<typeof g> => Boolean(g));
  // Only fields that are visible on the page; no author or date we do not have.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
  }).replace(/</g, "\\u003c");

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/blog" className="underline decoration-camel underline-offset-4 hover:decoration-ink">
          Blog and guides
        </Link>
      </nav>
      <h1 className="display mt-4 text-3xl [overflow-wrap:anywhere] sm:text-4xl">{a.title}</h1>
      {(a.category || a.readMinutes) && (
        <p className="mt-3 text-sm text-camel-deep">
          {[a.category, a.readMinutes ? `${a.readMinutes} min read` : null].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="mt-4 max-w-[65ch] text-lg text-muted">{a.excerpt}</p>
      {a.draft && (
        <p className="mt-4 border-l-2 border-camel pl-4 text-sm text-muted">
          Draft guide, reviewed by the studio before publishing.
        </p>
      )}
      {a.coverUrl && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden">
          <Image src={a.coverUrl} alt={a.coverAlt} fill sizes="(min-width: 768px) 768px, 100vw" unoptimized className="object-cover" />
        </div>
      )}
      <div className="mt-8">
        <ArticleBody blocks={a.paragraphs} />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-h" className="mt-14 border-t border-[var(--line)] pt-8">
          <h2 id="related-h" className="display text-2xl">
            Related guides
          </h2>
          <ul className="mt-4 list-none divide-y divide-[var(--line)] border-y border-[var(--line)] p-0">
            {related.map((r) => (
              <li key={r.slug} className="py-4">
                <Link
                  href={`/blog/${r.slug}`}
                  className="text-lg font-medium underline decoration-camel underline-offset-4 hover:decoration-ink"
                >
                  {r.title}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  {r.category} · {r.readMinutes} min read
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <aside className="mt-14 bg-paper-2 p-6 sm:p-8">
        <p className="max-w-[55ch] text-lg">
          Planning a build or a renovation in Himatnagar? Talk to us before you buy materials.
        </p>
        <div className="mt-4">
          <Button href="/contact?type=consultation">Book a consultation</Button>
        </div>
      </aside>
    </article>
  );
}
