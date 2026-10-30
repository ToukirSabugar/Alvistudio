import Link from "next/link";
import type { Service } from "@/content/services";
import { IconBadge } from "@/components/ui/IconBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { iconForMaterial } from "@/components/ui/icons";
import { isPaused } from "@/lib/site";

/** Pale section: one centred card per material, each linking to its guide while the blog is live. */
export function MaterialsBlock({
  heading,
  materials,
}: {
  heading: string;
  materials: Service["materials"];
}) {
  return (
    <section aria-labelledby="materials-heading" className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <SectionHeading id="materials-heading" title={heading} />
        <ul className="mt-14 flex flex-wrap justify-center gap-5">
          {materials.map((m) => (
            <li
              key={m.name}
              data-reveal
              className="basis-full sm:basis-[calc(50%-0.65rem)] lg:basis-[calc(25%-0.95rem)]"
            >
              <article
                className="glow-card group flex h-full flex-col items-center border border-ink/25 bg-paper-2 px-6 py-9 text-center"
                style={{
                  ["--glow" as string]: "var(--camel-deep)",
                  ["--glow-soft" as string]: "rgba(143,107,63,.5)",
                }}
              >
                <IconBadge
                  name={iconForMaterial(m.name)}
                  size="md"
                  className="text-camel-deep"
                />
                <h3 className="display mt-6 text-xl">{m.name}</h3>
                <p className="mt-3 flex-1 text-muted">{m.note}</p>
                {isPaused("/blog") ? null : (
                  <Link
                    href={`/blog/${m.guide}`}
                    className="mt-6 inline-flex min-h-11 items-center justify-center border border-ink px-5 text-sm uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
                  >
                    Read the guide<span className="sr-only">: {m.name}</span>
                  </Link>
                )}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
