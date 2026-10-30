import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";
import { Button } from "@/components/Button";
import { IconBadge } from "@/components/ui/IconBadge";
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

      <section className={`mx-auto max-w-3xl px-4 pb-20 text-center sm:px-8 ${hero ? "pt-14" : "pt-36"}`}>
        {hero ? null : <h1 className="display text-3xl sm:text-5xl">About Alvi Studio</h1>}
        <div className="mx-auto mt-8 max-w-2xl space-y-5 text-lg leading-relaxed">
          <p>
            {siteConfig.name} {siteConfig.byline} is an architecture, civil and interior design studio in Alkapuri,{" "}
            {siteConfig.city}. The work so far includes full houses, renovations, tuition classes and a farm.
          </p>
          <p>
            Architecture, construction and interiors sit under one roof, so the person who draws the plan is the person
            who sees it built.
          </p>
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
