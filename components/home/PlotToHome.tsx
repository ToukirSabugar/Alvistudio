"use client";

import { lazy, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { SceneShell } from "@/components/three/SceneShell";
import { useScrollProgress, useTilt } from "@/components/three/hooks";
import { CHAPTERS, chapterAt } from "@/lib/story";
import { siteConfig } from "@/lib/site";
import { HouseStill } from "./HouseStill";

// three.js loads only when the scene mounts, after the text is on screen.
const HouseStory = lazy(() => import("@/components/three/story/HouseStory"));

type Chapter = { label: string; title: string; text: string; link?: { href: string; label: string } };

// Index matches CHAPTERS in lib/story.ts (1..6 = I..VI).
const COPY: Chapter[] = [
  { label: "", title: "", text: "" }, // the intro is laid out separately below
  {
    label: "The plot",
    title: "Every house begins with the ground.",
    text: "Before a line is drawn we walk the plot, take levels and note where the afternoon sun falls and where the rain runs off. Boundaries, setbacks and soil decide what the house can be.",
    link: { href: "/civil", label: "Civil work" },
  },
  {
    label: "The plan",
    title: "Rooms placed for light, air and the way you live.",
    text: "Layouts drawn around your family and the local heat: bedrooms away from the western sun, a breeze through every room, and drawings a builder can follow without guessing.",
    link: { href: "/architecture", label: "Architecture" },
  },
  {
    label: "The structure",
    title: "A frame checked on paper before it is cast.",
    text: "Columns, beams and slabs are checked against the plan, so no column lands in the middle of a room and no beam cuts across a window. Then we visit the site to see it built that way.",
    link: { href: "/civil", label: "Civil work" },
  },
  {
    label: "The facade",
    title: "Materials chosen for the climate, not the brochure.",
    text: "Stone, plaster, timber and glass, named on the drawings by type and grade, so every quote you receive compares like with like.",
    link: { href: "/architecture", label: "Architecture" },
  },
  {
    label: "The interior",
    title: "Rooms finished down to the last shelf.",
    text: "Layouts, furniture, lighting and finishes for the rooms you use every day, from one kitchen to a whole house.",
    link: { href: "/interior", label: "Interior design" },
  },
  {
    label: "Handover",
    title: "One studio, from the first visit to the keys.",
    text: "The person who draws your plan is the person who sees it built and finished.",
  },
];

const scrim =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--stage)_0%,rgba(13,12,10,0.75)_38%,transparent_70%)] lg:bg-[linear-gradient(to_right,var(--stage)_0%,rgba(13,12,10,0.8)_30%,transparent_58%)]";

export function PlotToHome() {
  const section = useRef<HTMLElement>(null);
  const progress = useScrollProgress(section);
  const tilt = useTilt();
  const rail = useRef<HTMLOListElement>(null);

  // Highlight the chapter on screen in the rail, and tell the sound engine when it changes.
  useEffect(() => {
    let current = -1;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const k = chapterAt(span > 0 ? -r.top / span : 0);
      const inView = r.bottom > window.innerHeight * 0.5 && r.top < window.innerHeight * 0.5;
      if (k === current) return;
      current = k;
      rail.current?.querySelectorAll("li").forEach((li, i) => li.toggleAttribute("data-active", i + 1 === k));
      if (inView) window.dispatchEvent(new CustomEvent("alvi:chapter", { detail: k }));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={section} aria-label="From plot to home" className="story-stage relative bg-[var(--stage)] text-paper">
      {/* Stage: the 3D house (or the still drawing) stays on screen while the chapters scroll over it. */}
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:relative">
        <SceneShell className="h-full w-full" fallback={<HouseStill />} camera={{ position: [24, 28, 30], fov: 34 }} bare shadows>
          <HouseStory progress={progress} tilt={tilt} />
        </SceneShell>
        <div aria-hidden className={scrim} />

        <nav aria-label="Story chapters" className="absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 sm:block motion-reduce:!hidden">
          <ol ref={rail} className="flex flex-col gap-1">
            {CHAPTERS.slice(1).map((c, i) => (
              <li key={c.id} className="story-rail group">
                <a href={`#story-${c.id}`} className="flex min-h-9 items-center justify-end gap-3 text-[var(--muted-on-dark)] transition-colors group-data-[active]:text-paper">
                  <span className="hidden bg-[rgba(13,12,10,0.7)] px-2 py-1 text-xs tracking-[0.18em] uppercase opacity-0 transition-opacity group-data-[active]:opacity-100 lg:inline">
                    {COPY[i + 1].label}
                  </span>
                  <span className="serif w-7 text-right text-sm italic">{c.numeral}</span>
                  <span aria-hidden className="block h-px w-4 bg-current transition-all group-data-[active]:w-9 group-data-[active]:bg-camel" />
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Chapters: real text, one screen each, scrolling over the stage. */}
      <div className="relative z-10 -mt-[100svh]">
        <div id="story-intro" className="flex min-h-svh items-end px-5 pb-16 pt-28 sm:px-10 lg:items-center lg:pb-0 lg:pl-[7vw]">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.28em] text-camel uppercase">
              {siteConfig.name} {siteConfig.byline} · {siteConfig.city}
            </p>
            <h1 className="mt-5">
              <span className="serif block text-[2.7rem] leading-[1.02] sm:text-6xl lg:text-7xl">
                From plot <em className="text-camel">to home.</em>
              </span>
              <span className="mt-5 block max-w-md text-base font-normal leading-relaxed text-paper/80 sm:text-lg">
                Architecture, civil and interior design in {siteConfig.city}, under one roof.
              </span>
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/contact?type=consultation" variant="onDark">
                Start a project
              </Button>
              <Button href="/about" variant="ghostDark">
                Meet the studio
              </Button>
            </div>
            <p className="mt-10 flex items-center gap-3 text-xs tracking-[0.24em] text-[var(--muted-on-dark)] uppercase motion-reduce:hidden">
              <span aria-hidden className="scroll-cue block h-10 w-px bg-camel" />
              Scroll to build the house
            </p>
          </div>
        </div>

        {CHAPTERS.slice(1).map((c, i) => {
          const ch = COPY[i + 1];
          return (
            <article
              key={c.id}
              id={`story-${c.id}`}
              aria-labelledby={`story-${c.id}-h`}
              className="flex min-h-svh items-end px-5 pb-14 sm:px-10 lg:items-center lg:pb-0 lg:pl-[7vw] motion-reduce:min-h-0 motion-reduce:py-14"
            >
              <div className="max-w-md">
                <p className="flex items-baseline gap-3 text-xs tracking-[0.26em] text-camel uppercase">
                  <span className="serif text-base normal-case tracking-normal italic">{c.numeral}</span>
                  {ch.label}
                </p>
                <h2 id={`story-${c.id}-h`} className="serif mt-4 text-3xl leading-tight sm:text-[2.6rem]">
                  {ch.title}
                </h2>
                <p className="mt-4 leading-relaxed text-paper/80">{ch.text}</p>
                {ch.link ? (
                  <Link href={ch.link.href} className="link-dark mt-6 inline-flex min-h-11 items-center gap-2 text-sm tracking-[0.14em] uppercase">
                    {ch.link.label} <span aria-hidden>→</span>
                  </Link>
                ) : (
                  <div className="mt-7">
                    <Button href="/contact?type=consultation" variant="onDark">
                      Start a project
                    </Button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
