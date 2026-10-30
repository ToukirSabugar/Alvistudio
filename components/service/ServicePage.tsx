import { Faqs } from "@/components/Faqs";
import { Button } from "@/components/Button";
import { IconBadge } from "@/components/ui/IconBadge";
import { services, type ServiceSlug } from "@/content/services";
import { getPageHero } from "@/lib/site-content-store";
import { ServiceHero } from "./ServiceHero";
import { ScrollStory } from "./ScrollStory";
import { Blueprint } from "./drawings";
import { ApproachBlock } from "./blocks/ApproachBlock";
import { ProjectsBlock } from "./blocks/ProjectsBlock";
import { DeliverablesBlock } from "./blocks/DeliverablesBlock";
import { MaterialsBlock } from "./blocks/MaterialsBlock";

export async function ServicePage({ slug }: { slug: ServiceSlug }) {
  const s = services[slug];
  const hero = await getPageHero(`/${slug}`); // null when unset or the database is down
  return (
    <>
      <ServiceHero kind={slug} stillUrl={hero?.url} stillAlt={hero?.alt}>
        <h1 className="display text-3xl sm:text-5xl">{s.h1}</h1>
        <p className="mt-4 max-w-xl text-base text-paper/90 sm:text-lg">{s.intro}</p>
      </ServiceHero>

      <ScrollStory
        label="What we do"
        heading="What we do"
        variant="drawing"
        visual={<Blueprint kind={slug} label={`Line drawing for ${s.title.toLowerCase()} work that draws itself as you scroll`} />}
        items={s.offers}
      />

      <ApproachBlock heading={s.headings.approach} intro={s.headings.approachIntro} groups={s.approach} />
      <ProjectsBlock heading={s.headings.projects} projects={s.projects} />
      <DeliverablesBlock deliverablesHeading={s.headings.deliverables} bringHeading={s.headings.bring} deliverables={s.deliverables} bring={s.bring} />
      <MaterialsBlock heading={s.headings.materials} materials={s.materials} />

      <ScrollStory
        label="How it works"
        heading="How it works"
        note={s.draft ? "Process draft: to be confirmed by the studio" : undefined}
        variant="ring"
        tone="ink"
        items={s.process}
      />

      <Faqs pagePath={`/${slug}`} />

      <section className="bg-camel text-ink">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-8">
          <IconBadge name="design" size="md" className="text-ink" dot="var(--ink)" />
          <h2 className="display text-3xl sm:text-4xl">{s.headings.cta}</h2>
          <Button href={`/contact?type=${s.enquiryType}`} className="!bg-ink !text-paper hover:!bg-paper hover:!text-ink">
            Send an enquiry
          </Button>
        </div>
      </section>
    </>
  );
}
