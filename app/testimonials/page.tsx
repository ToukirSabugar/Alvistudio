import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { TypeFilter } from "@/components/gallery/TypeFilter";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { siteConfig, projectTypes, MIN_TESTIMONIALS } from "@/lib/site";
import { getTestimonials } from "@/lib/store";
import { getContactSettings } from "@/lib/settings";

const PER_PAGE = 9;

// Read per request: the page filters by the URL and must appear as soon as real reviews are added.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/testimonials", {
  title: "Client testimonials | Architects in Himatnagar",
  description:
    "What clients say about working with Alvi Studio by Fatma & Aqib in Himatnagar, in their own words, across houses, renovations, tuition classes and farms.",
  });
}

function href(type: string | null, page: number) {
  const q = new URLSearchParams();
  if (type) q.set("type", type);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/testimonials?${s}` : "/testimonials";
}

export default async function TestimonialsPage({ searchParams }: PageProps<"/testimonials">) {
  const all = await getTestimonials();
  if (all.length < MIN_TESTIMONIALS) notFound();

  const { ratingUrl } = await getContactSettings();
  const sp = await searchParams;
  const rawType = typeof sp.type === "string" ? sp.type : null;
  const available = projectTypes.filter((p) => all.some((t) => t.projectType === p.id));
  const type = available.find((p) => p.id === rawType)?.id ?? null;

  const list = type ? all.filter((t) => t.projectType === type) : all;
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const rawPage = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
  const page = Math.min(pages, Math.max(1, Number.isFinite(rawPage) ? rawPage : 1));
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-8">
      <h1 className="display text-[1.6rem] sm:text-5xl">Client testimonials</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Words from people we have built and designed for in {siteConfig.city}. Each is the client&apos;s own.
      </p>
      <p className="mt-2 text-sm">
        <a
          href={ratingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-camel-deep underline underline-offset-4"
        >
          Rated {siteConfig.rating.value} from {siteConfig.rating.count} ratings on JustDial
        </a>
      </p>

      {available.length > 1 && (
        <div className="mt-6">
          <TypeFilter basePath="/testimonials" options={[...available]} active={type} label="Filter by project type" />
        </div>
      )}

      <ul className="mt-10 grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <li key={t.id}>
            <TestimonialCard t={t} />
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav aria-label="Pages" className="mt-10 flex flex-wrap items-center gap-3">
          {page > 1 && (
            <Link href={href(type, page - 1)} className="inline-flex min-h-11 items-center border border-ink px-4 text-sm">
              Previous
            </Link>
          )}
          <span className="text-sm text-muted">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link href={href(type, page + 1)} className="inline-flex min-h-11 items-center border border-ink px-4 text-sm">
              Next
            </Link>
          )}
        </nav>
      )}

      <div className="mt-16">
        <Button href="/contact">Start your project</Button>
      </div>
    </div>
  );
}
