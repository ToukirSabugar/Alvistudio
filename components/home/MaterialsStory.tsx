"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/Button";
import { BrickVisual, ConcreteVisual, GlassTimberVisual, RoomVisual, SteelVisual } from "./visuals";

type Tone = "paper" | "paper2" | "ink" | "ink2";

const TONES: Record<Tone, { box: string; text: string; rule: string }> = {
  paper: { box: "bg-paper text-ink", text: "text-muted", rule: "bg-camel-deep" },
  paper2: { box: "bg-paper-2 text-ink", text: "text-muted", rule: "bg-camel-deep" },
  ink: { box: "bg-ink text-paper", text: "text-[var(--muted-on-dark)]", rule: "bg-camel" },
  ink2: { box: "bg-ink-2 text-paper", text: "text-[var(--muted-on-dark)]", rule: "bg-camel" },
};

/**
 * One short pinned stage: the section is tall, the inner stage is sticky for the length of the
 * scroll, and ScrollTrigger scrubs a timeline across it. Under reduced motion the CSS below
 * removes the height and the sticky, so the finished state is simply shown.
 */
function Stage({
  id,
  tone,
  title,
  children,
  visual,
  extra,
}: {
  id: string;
  tone: Tone;
  title: string;
  children: ReactNode;
  visual: ReactNode;
  extra?: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <section id={id} data-stage={id} aria-labelledby={`${id}-title`} className={`relative h-[240vh] motion-reduce:h-auto ${t.box}`}>
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto">
        <div className="mx-auto grid h-full max-w-7xl grid-rows-[auto_minmax(0,1fr)] gap-5 px-4 py-6 pb-20 sm:px-8 lg:grid-cols-2 lg:grid-rows-1 lg:items-center lg:gap-16 lg:py-16 motion-reduce:h-auto motion-reduce:py-16">
          <div className="max-w-xl">
            <span aria-hidden className={`mb-4 block h-px w-16 ${t.rule}`} />
            <h2 id={`${id}-title`} className="display text-2xl sm:text-4xl">
              {title}
            </h2>
            <p className={`mt-3 text-sm sm:mt-5 sm:text-base ${t.text}`}>{children}</p>
            {extra}
          </div>
          <div className="relative mx-auto h-full min-h-48 w-full max-w-xl motion-reduce:h-[55svh] lg:h-[min(70svh,34rem)]">{visual}</div>
        </div>
      </div>
    </section>
  );
}

export function MaterialsStory() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const q = gsap.utils.selector(el);
        const tl = (id: string) =>
          gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: q(`[data-stage="${id}"]`)[0], start: "top 40%", end: "bottom bottom", scrub: 0.5 },
          });

        // 1 Concrete: the cured layer is poured in from the top; the camel line is the pour front.
        tl("concrete").fromTo("[data-pour]", { "--p": 0 }, { "--p": 100, duration: 0.85 }, 0);

        // 2 Brick: courses are laid from the bottom row up, each brick dropping in left to right.
        const brick = tl("brick");
        const rows = q("[data-stage='brick'] [data-row]");
        rows.forEach((row, i) => {
          brick.from(row.querySelectorAll("[data-brick]"), { yPercent: -160, opacity: 0, stagger: 0.012, duration: 0.07 }, 0.02 + (rows.length - 1 - i) * 0.08);
        });

        // 3 Steel: every bar draws itself, then the ties appear at the crossings.
        const steel = tl("steel");
        steel.fromTo(q("[data-stage='steel'] [data-bar]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.14, stagger: 0.04 }, 0);
        steel.from(q("[data-stage='steel'] [data-tie]"), { attr: { r: 0 }, opacity: 0, stagger: 0.004, duration: 0.05 }, 0.68);

        // 4 Glass and timber: planks stack from above, then the glass panes slide in from the sides.
        const gt = tl("glass");
        gt.from(q("[data-plank]"), { yPercent: -400, opacity: 0, stagger: 0.07, duration: 0.14 }, 0);
        gt.from(q("[data-pane]"), { xPercent: (i: number) => (i % 2 ? 160 : -160), opacity: 0, stagger: 0.1, duration: 0.2 }, 0.4);

        // 5 Room: the view pushes in while the evening light comes up.
        const room = tl("room");
        room.fromTo("[data-room]", { scale: 1 }, { scale: 1.22, duration: 0.9 }, 0);
        room.from("[data-glow]", { opacity: 0.1, duration: 0.8 }, 0);
        room.from("[data-dim]", { opacity: 0.85, duration: 0.5 }, 0);
      },
      el,
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={root}>
      <Stage id="concrete" tone="paper" title="Concrete sets the base" visual={<ConcreteVisual />}>
        Cement, sand, stone and water are mixed, poured into formwork and left to cure. Strength builds over weeks, which is why
        curing matters as much as the mix.
      </Stage>
      <Stage id="brick" tone="ink" title="Brick, one course at a time" visual={<BrickVisual />}>
        Each course is offset from the one below, so the joints never line up and the load spreads across the whole wall.
      </Stage>
      <Stage id="steel" tone="paper2" title="Steel carries the pull" visual={<SteelVisual />}>
        Concrete resists squeezing but cracks when pulled. Bars set inside it take the tension, so slabs and beams can span an opening.
      </Stage>
      <Stage id="glass" tone="ink2" title="Glass and timber finish the shell" visual={<GlassTimberVisual />}>
        Glass brings in daylight and views; timber adds warmth to floors, doors and furniture. Both are chosen for how they age as well
        as how they look.
      </Stage>
      <Stage
        id="room"
        tone="ink"
        title="Then it becomes a room"
        visual={<RoomVisual />}
        extra={
          <div className="mt-5">
            <Button href="/contact?type=consultation" variant="onDark">
              Start your project
            </Button>
          </div>
        }
      >
        Daylight, material and layout come together in the part you will actually live in. Tell us what yours should feel like.
      </Stage>
    </div>
  );
}
