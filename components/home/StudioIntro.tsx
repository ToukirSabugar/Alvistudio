import type { CSSProperties } from "react";
import { siteConfig } from "@/lib/site";
import { getContactSettings } from "@/lib/settings";
import { IconBadge } from "@/components/ui/IconBadge";
import type { IconName } from "@/components/ui/icons";
import { CountUp } from "@/components/motion/CountUp";

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/** A floor-plan fragment that draws itself: walls, a door swing, windows and a dimension line. */
function PlanSketch() {
  return (
    <svg data-reveal viewBox="0 0 420 230" className="draw mt-12 hidden w-full max-w-md text-camel-deep lg:block" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path pathLength="1" style={d(0)} d="M20 40H400V210H20Z" strokeWidth="2" />
      <path pathLength="1" style={d(0.5)} d="M170 40V120M170 160V210M290 40V95M290 140H400" />
      <path pathLength="1" style={d(0.9)} d="M170 120A40 40 0 0 1 210 160" opacity="0.7" />
      <path pathLength="1" style={d(1.1)} d="M60 40V34H130V40M320 210V216H380V210M20 90H14V160H20" strokeWidth="2.4" />
      <path pathLength="1" style={d(1.4)} d="M20 14H400M20 8V20M400 8V20M20 14L30 10M20 14L30 18M400 14L390 10M400 14L390 18" opacity="0.7" />
      <path pathLength="1" style={d(1.7)} d="M40 190L70 160M40 175L55 160M55 190L70 175" opacity="0.5" />
    </svg>
  );
}

/** Who the studio is. The only place on the home page that shows the studio's numbers. */
export async function StudioIntro() {
  const { ratingUrl } = await getContactSettings();
  const { years, projects, rating } = siteConfig;
  const stats: { icon: IconName; value: string; label: React.ReactNode }[] = [
    { icon: "design", value: String(years), label: "years in practice" },
    { icon: "house", value: projects, label: "projects completed" },
    {
      icon: "check",
      value: String(rating.value),
      label: (
        <>
          from {rating.count} ratings on{" "}
          <a href={ratingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline decoration-camel underline-offset-4 hover:text-ink">
            JustDial<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </>
      ),
    },
  ];
  return (
    <section aria-labelledby="studio-h" className="bg-paper text-ink">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-24 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-24 lg:py-32">
        <div data-reveal>
          <IconBadge name="design" size="md" className="text-camel-deep" />
          <h2 id="studio-h" className="serif mt-6 text-4xl leading-[1.05] sm:text-6xl">
            One studio for the plan, the structure <em className="text-camel-deep">and the rooms inside.</em>
          </h2>
          <PlanSketch />
        </div>
        <div className="lg:pt-24">
          <div data-reveal className="space-y-5 text-lg leading-relaxed text-ink/85">
            <p>
              {siteConfig.name} is run by Fatma and Aqib from Alkapuri, {siteConfig.city}. We design and build full houses,
              renovations, tuition classes and farms, with architecture, civil work and interiors handled by the same people.
            </p>
            <p>
              That matters on site. When the person who drew the plan is the one who checks the columns and chooses the
              tiles, decisions are made once, and nobody has to guess what a drawing meant.
            </p>
          </div>
          <dl className="mt-12 grid gap-8 border-t border-[var(--line)] pt-10 sm:grid-cols-3 sm:gap-4">
            {stats.map((s, i) => (
              <div key={s.icon} data-reveal style={{ transitionDelay: `${i * 0.15}s` }} className="group flex items-center gap-4 sm:flex-col sm:items-start">
                <IconBadge name={s.icon} size="sm" className="text-camel-deep" />
                <div className="flex flex-col-reverse">
                  <dt className="text-sm text-muted">{s.label}</dt>
                  <dd className="serif text-5xl text-camel-deep">
                    <CountUp value={s.value} />
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
