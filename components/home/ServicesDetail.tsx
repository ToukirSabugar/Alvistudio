import Link from "next/link";
import { services, type ServiceSlug } from "@/content/services";
import { IconBadge } from "@/components/ui/IconBadge";
import type { IconName } from "@/components/ui/icons";

// One line per service, plus its first four offers (the full list is on each service page).
const ORDER: { slug: ServiceSlug; icon: IconName; line: string }[] = [
  { slug: "architecture", icon: "design", line: "Plans, 3D views and approval drawings for houses, farms and classrooms." },
  { slug: "civil", icon: "concrete", line: "Foundations, structure, repairs and renovation, built to the drawings." },
  { slug: "interior", icon: "light", line: "Layouts, furniture, lighting and finishes for the rooms you use every day." },
];

const glow = { ["--glow" as string]: "var(--camel-deep)", ["--glow-soft" as string]: "rgba(143,107,63,.45)" };

export function ServicesDetail() {
  return (
    <section aria-labelledby="services-h" className="bg-paper-2 text-ink">
      <div className="mx-auto max-w-[90rem] px-5 py-24 sm:px-10 lg:py-32">
        <div data-reveal className="max-w-2xl">
          <IconBadge name="list" size="md" className="text-camel-deep" />
          <h2 id="services-h" className="serif mt-6 text-4xl leading-tight sm:text-5xl">
            Three disciplines, <em className="text-camel-deep">one set of drawings.</em>
          </h2>
        </div>
        <ul className="mt-14 grid gap-6 lg:grid-cols-3">
          {ORDER.map(({ slug, icon, line }, i) => {
            const s = services[slug];
            return (
              <li key={slug} data-reveal style={{ transitionDelay: `${i * 0.12}s` }}>
                <Link href={`/${slug}`} style={glow} className="glow-card group flex h-full flex-col border border-ink/20 bg-paper p-8 sm:p-10">
                  <div className="flex items-start justify-between gap-6">
                    <IconBadge name={icon} size="lg" className="text-camel-deep" />
                    <span className="serif text-lg text-camel-deep italic">0{i + 1}</span>
                  </div>
                  <span className="serif mt-8 text-4xl">{s.title}</span>
                  <span className="mt-3 text-ink/80">{line}</span>
                  <ul className="mt-7 flex-1 text-sm">
                    {s.offers.slice(0, 4).map((o) => (
                      <li key={o.title} className="flex items-center gap-3 border-t border-[var(--line)] py-3">
                        <span aria-hidden className="h-px w-4 bg-camel transition-all duration-300 group-hover:w-7" />
                        {o.title}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm tracking-[0.14em] uppercase underline decoration-camel underline-offset-8 group-hover:decoration-ink">
                    Explore {s.title.toLowerCase()} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
