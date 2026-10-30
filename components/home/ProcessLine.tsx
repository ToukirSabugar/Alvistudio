"use client";

import { useEffect, useRef } from "react";
import { IconBadge } from "@/components/ui/IconBadge";
import type { IconName } from "@/components/ui/icons";

// How a project runs, from the client's side. Wording follows the process on the service pages.
const STEPS: { title: string; icon: IconName; text: string }[] = [
  { title: "First conversation", icon: "advice", text: "You tell us what you want to build or change, your budget range and your timeline. We visit the plot or the house." },
  { title: "Concept options", icon: "design", text: "Simple layout sketches with the reasons behind each. You react, and choose the direction we develop." },
  { title: "Plans and 3D views", icon: "house", text: "Floor plans, elevations and 3D views you can walk through. You ask for changes and sign off the design." },
  { title: "Drawings and estimate", icon: "budget", text: "Working drawings, approval drawings and an itemised estimate, so every rupee has a line it belongs to." },
  { title: "Construction", icon: "concrete", text: "Work on site to the approved drawings, checked at each stage. Any change is agreed with you in writing first." },
  { title: "Interiors and handover", icon: "light", text: "Furniture, lighting and finishes go in, a final inspection is done, and you get the keys with care advice." },
];

/** Six steps on a vertical line that fills as the visitor scrolls. Full line without script. */
export function ProcessLine() {
  const box = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      el.style.setProperty("--p", p.toFixed(3));
      el.querySelectorAll<HTMLElement>("[data-step]").forEach((li) => {
        const top = li.getBoundingClientRect().top;
        li.toggleAttribute("data-done", top < mid);
      });
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
    <section aria-labelledby="process-h" className="bg-paper text-ink">
      <div className="mx-auto grid max-w-[90rem] gap-14 px-5 py-24 sm:px-10 lg:grid-cols-[1fr_1.4fr] lg:gap-24 lg:py-32">
        <div data-reveal className="lg:sticky lg:top-32 lg:self-start">
          <IconBadge name="steel" size="md" className="text-camel-deep" />
          <h2 id="process-h" className="serif mt-6 text-4xl leading-tight sm:text-5xl">
            Six steps, <em className="text-camel-deep">no surprises.</em>
          </h2>
          <p className="mt-6 max-w-sm text-ink/80">
            At every stage you know what happens next and what we need from you.
          </p>
        </div>
        <ol ref={box} className="process relative">
          <span aria-hidden className="absolute bottom-8 left-[1.625rem] top-8 w-px bg-[var(--line)]" />
          <span aria-hidden className="process-fill absolute bottom-8 left-[1.625rem] top-8 w-px bg-camel" />
          {STEPS.map((s, i) => (
            <li key={s.title} data-step data-reveal className="group relative grid grid-cols-[3.25rem_1fr] gap-6 pb-12 last:pb-0">
              <span className="relative z-10 bg-paper text-ink/35 transition-colors duration-500 group-data-[done]:text-camel-deep">
                <IconBadge name={s.icon} size="sm" />
              </span>
              <div className="pt-2">
                <p className="serif text-sm text-camel-deep italic">Step {i + 1}</p>
                <h3 className="serif text-2xl sm:text-3xl">{s.title}</h3>
                <p className="mt-2 max-w-lg text-ink/80">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
