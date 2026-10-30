import type { ApproachGroup } from "@/content/services";
import { IconBadge } from "@/components/ui/IconBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { IconName } from "@/components/ui/icons";

const groupIcon: Record<ApproachGroup["title"], IconName> = {
  "How we design": "design",
  "How we choose materials": "bricks",
  "How we advise you": "advice",
};

/** Black section: three centred panels, each with an icon in turning rings and three points. */
export function ApproachBlock({ heading, intro, groups }: { heading: string; intro: string; groups: ApproachGroup[] }) {
  return (
    <section aria-labelledby="approach-heading" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <SectionHeading id="approach-heading" title={heading} intro={intro} dark />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.title} data-reveal className="h-full">
              <article
                className="glow-card group flex h-full flex-col items-center border border-[var(--line-on-dark)] bg-ink-2 px-6 py-10 text-center"
                style={{ ["--glow" as string]: "var(--camel)" }}
              >
                <IconBadge name={groupIcon[g.title]} size="lg" className="text-camel" />
                <h3 className="display mt-7 text-xl text-camel sm:text-2xl">{g.title}</h3>
                <ul className="mt-6 w-full divide-y divide-[var(--line-on-dark)] border-t border-[var(--line-on-dark)]">
                  {g.points.map((p) => (
                    <li key={p.title} className="py-5">
                      <h4 className="font-semibold text-paper">{p.title}</h4>
                      <p className="mx-auto mt-2 max-w-sm text-paper/75">{p.text}</p>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
