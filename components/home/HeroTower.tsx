"use client";

import { lazy, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { SceneShell } from "@/components/three/SceneShell";
import { smoothstep, useScrollProgress, useTilt } from "@/components/three/hooks";
import { siteConfig } from "@/lib/site";
import { StillImage } from "@/components/service/StillImage";
import { TowerStill } from "./TowerStill";

// Loaded only when the 3D scene actually mounts, so three.js stays out of the first page load.
const HeroScene = lazy(() => import("@/components/three/hero/HeroScene"));

// idx = which floor of the tower (0 base). Listed top to bottom, like the tower.
const FLOORS = [
  { name: "Architecture", fact: "Plans and elevations for new buildings.", href: "/architecture", idx: 2 },
  { name: "Interior", fact: "Layouts, finishes and furniture for rooms.", href: "/interior", idx: 1 },
  { name: "Civil", fact: "Foundations, structure and site work.", href: "/civil", idx: 0 },
] as const;

export function HeroTower({ stillUrl, stillAlt = "" }: { stillUrl?: string; stillAlt?: string }) {
  const section = useRef<HTMLElement>(null);
  const progress = useScrollProgress(section);
  const tilt = useTilt();
  const labels = useRef<(HTMLAnchorElement | null)[]>([]);

  // Each floor name brightens as its floor separates. Never hidden: the text is readable from the start.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const p = progress.current;
      labels.current.forEach((el, k) => {
        if (!el) return;
        const idx = FLOORS[k].idx;
        const f = smoothstep(0.1 + idx * 0.08, 0.45 + idx * 0.08, p);
        el.style.opacity = String(0.62 + 0.38 * f);
        const bar = el.firstElementChild as HTMLElement | null;
        if (bar) bar.style.transform = `scaleX(${0.15 + 0.85 * f})`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [progress]);

  return (
    <section ref={section} className="relative h-[300vh] bg-ink text-paper motion-reduce:h-auto">
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:relative motion-reduce:h-auto motion-reduce:min-h-svh">
        {/* Stage: the 3D villa, or the still picture when 3D is unavailable. It is not interactive, so touch scrolling is never blocked.
            The cursor moves the camera round the building; the soft edges and glow are drawn over it. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[20%] top-[34%] lg:inset-y-0">
          <SceneShell className="h-full w-full" fallback={stillUrl ? <StillImage url={stillUrl} alt={stillAlt} /> : <TowerStill />} camera={{ position: [0, 8, 30], fov: 32 }} bare shadows keepFallback>
            <HeroScene progress={progress} tilt={tilt} />
          </SceneShell>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(55% 55% at 68% 58%, rgba(193,154,107,0.22), transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-ink via-ink/70 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[52%] bg-gradient-to-r from-ink via-ink/75 to-transparent lg:block" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between gap-4 px-4 pb-5 pt-24 sm:px-8 lg:flex-row lg:items-center lg:gap-6 lg:pb-0 lg:pt-0 motion-reduce:min-h-svh">
          <div className="lg:w-[29%]">
            <h1 className="display text-[1.55rem] sm:text-4xl lg:text-[2.6rem]">
              Architecture, civil and interior design in {siteConfig.city}
            </h1>
            <p className="mt-3 max-w-sm text-sm text-[var(--muted-on-dark)] sm:text-base lg:mt-5">
              One studio for the plan, the structure and the rooms inside it, by Fatma and Aqib.
            </p>
            <div className="mt-4 lg:mt-7">
              <Button href="/contact?type=consultation" variant="onDark">
                Start your project
              </Button>
            </div>
          </div>

          <ul className="flex flex-col gap-1 lg:absolute lg:bottom-10 lg:left-1/2 lg:w-auto lg:-translate-x-1/2 lg:flex-row lg:gap-16" aria-label="Our services">
            {FLOORS.map((f, k) => (
              <li key={f.name}>
                <Link
                  href={f.href}
                  ref={(el) => {
                    labels.current[k] = el;
                  }}
                  className="group block min-h-11 py-1 transition-colors"
                >
                  <span aria-hidden className="mb-1 block h-px origin-left bg-camel lg:mb-2" />
                  <span className="display block text-base tracking-[0.2em] group-hover:text-camel lg:text-xl">{f.name}</span>
                  <span className="block text-xs text-[var(--muted-on-dark)] lg:text-sm">{f.fact}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
