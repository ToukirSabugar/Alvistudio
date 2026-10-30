import { siteConfig } from "@/lib/site";
import { getContactSettings } from "@/lib/settings";
import { IconBadge } from "@/components/ui/IconBadge";
import type { IconName } from "@/components/ui/icons";

/**
 * The studio's numbers. This is the only place on the site that shows them as a block, so it is not
 * repeated on the service pages.
 */
export async function ProofStrip() {
  const { ratingUrl } = await getContactSettings();
  const { years, projects, rating } = siteConfig;
  const items: { icon: IconName; value: string; label: React.ReactNode }[] = [
    { icon: "design", value: String(years), label: "years in practice" },
    { icon: "house", value: projects, label: "projects completed" },
    {
      icon: "check",
      value: String(rating.value),
      label: (
        <>
          from {rating.count} ratings on{" "}
          <a
            href={ratingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center text-paper underline decoration-camel underline-offset-8 hover:decoration-paper"
          >
            JustDial
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </>
      ),
    },
  ];
  return (
    <section aria-label="Studio in numbers" className="bg-ink text-paper">
      <dl className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-3 sm:px-8 lg:py-24">
        {items.map((it) => (
          <div key={it.value} data-reveal className="flex flex-col items-center text-center">
            <IconBadge name={it.icon} size="md" className="text-camel" />
            <div className="mt-6 flex flex-col-reverse items-center">
              <dt className="mt-2 text-[var(--muted-on-dark)]">{it.label}</dt>
              <dd className="display text-6xl text-camel">{it.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
