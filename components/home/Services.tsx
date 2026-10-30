import Link from "next/link";
import { IconBadge } from "@/components/ui/IconBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { IconName } from "@/components/ui/icons";

const SERVICES: { href: string; name: string; line: string; icon: IconName }[] = [
  { href: "/architecture", name: "Architecture", line: "Full-house, farm and tuition-class designs drawn to your plot.", icon: "design" },
  { href: "/interior", name: "Interior", line: "Renovation and fit-out of the rooms you use every day.", icon: "light" },
  { href: "/civil", name: "Civil", line: "Building, repair and renovation work from foundation to finish.", icon: "steel" },
];

export function Services() {
  return (
    <section aria-labelledby="services-title" className="bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <SectionHeading id="services-title" title="Where to begin" />
        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {SERVICES.map((s) => (
            <li key={s.href} data-reveal className="h-full">
              <Link
                href={s.href}
                className="glow-card group flex h-full flex-col items-center border border-ink/25 bg-paper-2 px-6 py-10 text-center"
                style={{ ["--glow" as string]: "var(--camel-deep)", ["--glow-soft" as string]: "rgba(143,107,63,.5)" }}
              >
                <IconBadge name={s.icon} size="lg" className="text-camel-deep" />
                <span className="display mt-7 text-2xl">{s.name}</span>
                <span className="mt-3 flex-1 text-muted">{s.line}</span>
                <span className="mt-7 inline-flex min-h-11 items-center justify-center border border-ink px-5 text-sm uppercase tracking-[0.14em] transition-colors group-hover:bg-ink group-hover:text-paper">
                  See {s.name.toLowerCase()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
