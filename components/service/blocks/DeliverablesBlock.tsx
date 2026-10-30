import { IconBadge } from "@/components/ui/IconBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";

function Tiles({ items, dark }: { items: string[]; dark: boolean }) {
  const tile = dark ? "bg-ink text-paper border-ink" : "bg-paper text-ink border-ink/20";
  return (
    <ul className="mt-10 flex flex-wrap justify-center gap-4">
      {items.map((it) => (
        <li key={it} data-reveal className="basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.7rem)]">
          <div
            className={`glow-card group flex h-full flex-col items-center border px-5 py-7 text-center ${tile}`}
            style={{
              ["--glow" as string]: dark ? "var(--paper)" : "var(--ink)",
              ["--glow-soft" as string]: "rgba(11,11,11,.5)",
            }}
          >
            <IconBadge name="check" size="sm" className={dark ? "text-camel" : "text-ink"} dot={dark ? undefined : "var(--camel-deep)"} />
            <p className="mt-4">{it}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Camel section: what the client receives (black tiles) and what to bring (light tiles). */
export function DeliverablesBlock({
  deliverablesHeading,
  bringHeading,
  deliverables,
  bring,
}: {
  deliverablesHeading: string;
  bringHeading: string;
  deliverables: string[];
  bring: string[];
}) {
  return (
    <section aria-label={`${deliverablesHeading}, ${bringHeading}`} className="bg-camel text-ink">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
        <SectionHeading title={deliverablesHeading} />
        <Tiles items={deliverables} dark />
        <div className="mt-20">
          <SectionHeading title={bringHeading} />
          <Tiles items={bring} dark={false} />
        </div>
      </div>
    </section>
  );
}
