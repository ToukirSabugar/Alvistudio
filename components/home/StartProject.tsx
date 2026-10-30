import Link from "next/link";
import { IconBadge } from "@/components/ui/IconBadge";
import type { IconName } from "@/components/ui/icons";

// The three ways in. All lead to the one enquiry form, pre-set to the right type.
const ENTRIES: { href: string; icon: IconName; title: string; text: string }[] = [
  { href: "/contact?type=architecture", icon: "house", title: "Design a new building", text: "A house, a farm or a classroom on your plot." },
  { href: "/contact?type=interior", icon: "light", title: "Finish or redo interiors", text: "One room, a kitchen or the whole home." },
  { href: "/contact?type=civil", icon: "renovation", title: "Build, repair or renovate", text: "Construction, structural work and waterproofing." },
];

export function StartProject() {
  return (
    <section aria-labelledby="start-h" className="bg-camel text-ink">
      <div className="mx-auto max-w-[90rem] px-5 py-24 sm:px-10 lg:py-28">
        <div data-reveal className="max-w-2xl">
          <h2 id="start-h" className="serif text-4xl leading-tight sm:text-6xl">
            Start with a <em>conversation.</em>
          </h2>
          <p className="mt-5 text-lg text-ink/80">Choose what you are planning. We reply to every enquiry by phone or WhatsApp.</p>
        </div>
        <ul className="mt-12 grid gap-px bg-ink/25 md:grid-cols-3">
          {ENTRIES.map((e, i) => (
            <li key={e.href} data-reveal style={{ transitionDelay: `${i * 0.12}s` }} className="bg-camel">
              <Link href={e.href} className="group flex h-full items-start justify-between gap-6 p-7 transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper md:p-9">
                <span>
                  <IconBadge name={e.icon} size="sm" dot="currentColor" />
                  <span className="serif mt-5 block text-2xl sm:text-3xl">{e.title}</span>
                  <span className="mt-2 block text-sm opacity-80">{e.text}</span>
                </span>
                <span aria-hidden className="text-2xl transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm">
          Not sure yet?{" "}
          <Link href="/contact?type=consultation" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
            Book a consultation
          </Link>
        </p>
      </div>
    </section>
  );
}
