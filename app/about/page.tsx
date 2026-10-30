import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";
import { Button } from "@/components/Button";
import { IconBadge } from "@/components/ui/IconBadge";
import type { IconName } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/lib/site";
import { getPageHero, getTeamMembers, type TeamMember } from "@/lib/site-content-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/about", {
    title: "About the Himatnagar architects",
    description:
      "Alvi Studio by Fatma & Aqib is an architecture, civil and interior design studio in Alkapuri, Himatnagar. Seven years of work and more than 30 projects.",
  });
}

const cardStyle = { ["--glow" as string]: "var(--camel)" };

// Wording follows "How we advise you" on the service pages (content/services.ts).
const PRINCIPLES: { title: string; icon: IconName; text: string }[] = [
  {
    title: "Cost against design, said plainly",
    icon: "budget",
    text: "If a feature pushes the budget, we say so and show what it would cost you in other parts of the house. The decision stays with you.",
  },
  {
    title: "Reasons, not only answers",
    icon: "list",
    text: "When we recommend something, we explain why, so you can judge it yourself and talk to your builder with confidence.",
  },
  {
    title: "A no is part of the job",
    icon: "check",
    text: "If a plot, a budget or a wish does not work, we tell you early and offer another way.",
  },
];

function Owner({ name }: { name: string }) {
  return (
    <div data-reveal className="h-full">
      <div
        className="glow-card group flex h-full flex-col items-center border border-[var(--line-on-dark)] bg-ink-2 px-6 py-10 text-center"
        style={cardStyle}
      >
        <div role="img" aria-label={`Placeholder for a photo of ${name}`} className="grid place-items-center">
          <IconBadge size="xl" className="text-camel">
            <svg viewBox="0 0 120 120" className="h-[50%] w-[50%]" aria-hidden="true">
              <circle cx="60" cy="46" r="20" fill="none" stroke="var(--camel)" strokeWidth="3" />
              <path d="M20 108C20 82 38 74 60 74s40 8 40 34" fill="none" stroke="var(--camel)" strokeWidth="3" />
            </svg>
          </IconBadge>
        </div>
        <h3 className="display mt-6 text-2xl text-camel">{name}</h3>
        <p className="mt-2 text-paper/75">Photo and introduction coming soon.</p>
      </div>
    </div>
  );
}

function Member({ m }: { m: TeamMember }) {
  return (
    <div data-reveal className="h-full">
      <div
        className="glow-card group flex h-full flex-col items-center border border-[var(--line-on-dark)] bg-ink-2 px-6 py-10 text-center"
        style={cardStyle}
      >
        {m.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.photoUrl}
            alt={m.photoAlt}
            width={320}
            height={320}
            loading="lazy"
            className="h-40 w-40 rounded-full border border-camel object-cover"
          />
        ) : (
          <IconBadge name="design" size="lg" className="text-camel" />
        )}
        <h3 className="display mt-6 text-2xl text-camel">{m.name}</h3>
        {m.role ? <p className="mt-1 text-paper/75">{m.role}</p> : null}
        {m.bio ? <p className="mx-auto mt-4 max-w-sm whitespace-pre-line text-paper/85">{m.bio}</p> : null}
      </div>
    </div>
  );
}

export default async function AboutPage() {
  const [hero, team] = await Promise.all([getPageHero("/about"), getTeamMembers()]);
  return (
    <>
      {hero ? (
        <div className="px-3 pt-24 sm:px-6">
          <div className="relative flex min-h-[18rem] items-end justify-center overflow-hidden bg-ink text-paper sm:min-h-[24rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.url} alt={hero.alt} width={1600} height={900} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" aria-hidden="true" />
            <h1 className="display relative px-4 pb-8 text-center text-3xl sm:text-5xl">About Alvi Studio</h1>
          </div>
        </div>
      ) : null}

      <section className={`bg-paper text-ink ${hero ? "pt-16" : "pt-36"}`}>
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 pb-24 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <div>
            <IconBadge name="design" size="md" className="text-camel-deep" />
            {hero ? (
              <p className="serif mt-6 text-4xl leading-[1.05] sm:text-6xl">
                Drawn, built and finished <em className="text-camel-deep">by the same people.</em>
              </p>
            ) : (
              <h1 className="serif mt-6 text-4xl leading-[1.05] sm:text-6xl">
                About Alvi Studio: drawn, built and finished <em className="text-camel-deep">by the same people.</em>
              </h1>
            )}
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-ink/85 lg:pt-12">
            <p>
              {siteConfig.name} {siteConfig.byline} is an architecture, civil and interior design studio in Alkapuri,{" "}
              {siteConfig.city}. In {siteConfig.years} years the studio has completed {siteConfig.projects} projects: full
              houses, renovations, tuition classes and a farm.
            </p>
            <p>
              Most building projects pass through three hands: an architect who draws, a contractor who builds and a
              decorator who finishes. Every hand-over is a chance for something to be lost. We keep all three under one
              roof, so the person who draws the plan is the person who sees it built.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="principles-h" className="bg-paper-2 text-ink">
        <div className="mx-auto max-w-[90rem] px-5 py-24 sm:px-10 lg:py-28">
          <IconBadge name="advice" size="md" className="text-camel-deep" />
          <h2 id="principles-h" className="serif mt-6 max-w-2xl text-4xl leading-tight sm:text-5xl">
            Three promises we make <em className="text-camel-deep">on every project.</em>
          </h2>
          <ul className="mt-14 grid gap-px bg-[var(--line)] md:grid-cols-3">
            {PRINCIPLES.map((x, i) => (
              <li key={x.title} data-reveal style={{ transitionDelay: `${i * 0.12}s` }} className="group bg-paper-2 p-8 md:p-10">
                <div className="flex items-start justify-between">
                  <IconBadge name={x.icon} size="md" className="text-camel-deep" />
                  <span className="serif text-lg text-camel-deep italic">0{i + 1}</span>
                </div>
                <h3 className="serif mt-6 text-2xl sm:text-3xl">{x.title}</h3>
                <p className="mt-4 leading-relaxed text-ink/80">{x.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="people-h" className="bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-8 lg:py-28">
          <SectionHeading id="people-h" title="The people behind the drawings" dark />
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {team.length > 0 ? (
              team.map((m) => <Member key={m.id} m={m} />)
            ) : (
              <>
                <Owner name="Fatma" />
                <Owner name="Aqib" />
              </>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="about-cta" className="bg-camel text-ink">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-8">
          <IconBadge name="advice" size="md" className="text-ink" dot="var(--ink)" />
          <h2 id="about-cta" className="display text-3xl sm:text-4xl">
            Talk to Fatma and Aqib about your project
          </h2>
          <Button href="/contact?type=consultation" className="!bg-ink !text-paper hover:!bg-paper hover:!text-ink">
            Book a consultation
          </Button>
        </div>
      </section>
    </>
  );
}
