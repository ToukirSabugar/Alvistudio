import { IconBadge } from "@/components/ui/IconBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { iconForProject } from "@/components/ui/icons";

// Each card has its own tone so the stack reads as four different things, and camel is easy to see.
const tones = [
  { card: "bg-ink text-paper border-ink", icon: "text-camel", text: "text-paper/75", glow: "var(--camel)", soft: "rgba(193,154,107,.6)", dot: undefined },
  { card: "bg-camel text-ink border-camel", icon: "text-ink", text: "text-ink/80", glow: "var(--ink)", soft: "rgba(11,11,11,.45)", dot: "var(--ink)" },
  { card: "bg-paper text-ink border-ink/30", icon: "text-camel-deep", text: "text-muted", glow: "var(--camel-deep)", soft: "rgba(143,107,63,.5)", dot: "var(--camel-deep)" },
  { card: "bg-ink-2 text-paper border-ink-2", icon: "text-camel", text: "text-paper/75", glow: "var(--camel)", soft: "rgba(193,154,107,.6)", dot: undefined },
] as const;

/** Four project types as cards that stack on top of each other as you scroll. */
export function ProjectsBlock({ heading, projects }: { heading: string; projects: { title: string; text: string }[] }) {
  return (
    <section aria-labelledby="projects-heading" className="bg-paper-2">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <SectionHeading id="projects-heading" title={heading} />
        <div className="mx-auto mt-14 max-w-3xl">
          {projects.map((p, i) => {
            const t = tones[i % tones.length];
            return (
              <div
                key={p.title}
                className="sticky mb-6 last:mb-0"
                style={{ top: `calc(5.5rem + ${i * 1.1}rem)`, zIndex: i + 1 }}
              >
                <article
                  className={`glow-card group flex min-h-[19rem] flex-col items-center justify-center border px-6 py-10 text-center sm:px-12 ${t.card}`}
                  style={{ ["--glow" as string]: t.glow, ["--glow-soft" as string]: t.soft }}
                >
                  <IconBadge name={iconForProject(p.title)} size="lg" className={t.icon} dot={t.dot} />
                  <h3 className="display mt-7 text-2xl sm:text-3xl">{p.title}</h3>
                  <p className={`mx-auto mt-4 max-w-lg ${t.text}`}>{p.text}</p>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
