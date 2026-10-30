"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Item = { title: string; text: string };

type Props = {
  /** Short label in the sticky progress bar, e.g. "What we do". */
  label: string;
  heading: string;
  note?: string;
  items: Item[];
  /** "drawing": the section's line drawing (pass it as `visual`). "ring": a progress ring with the current step. */
  variant: "drawing" | "ring";
  visual?: ReactNode;
  tone?: "paper" | "paper2" | "ink";
};

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A section that is driven by scrolling: a progress bar sticks to the top while the section is on
 * screen, a line fills down the list, each item lights up as it reaches the middle of the screen, and
 * the drawing or ring beside it advances. Everything is real text; with reduced motion (or before
 * the script runs) every item is simply shown, finished.
 */
export function ScrollStory({ label, heading, note, items, variant, visual, tone = "paper" }: Props) {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const total = items.length;
  const dark = tone === "ink";
  const bg = tone === "paper2" ? "bg-paper-2" : dark ? "bg-ink text-paper" : "bg-paper";
  const nodeBg = tone === "paper2" ? "bg-paper-2" : dark ? "bg-ink" : "bg-paper";
  const line = dark ? "border-[var(--line-on-dark)]" : "border-[var(--line)]";
  const track = dark ? "bg-[var(--line-on-dark)]" : "bg-[var(--line)]";
  const muted = dark ? "text-paper/70" : "text-muted";

  useEffect(() => {
    const el = root.current;
    const ol = list.current;
    if (!el || !ol) return;
    const lis = Array.from(ol.children) as HTMLElement[];
    const nums = Array.from(el.querySelectorAll<HTMLElement>("[data-story-num]"));
    const show = (i: number) => {
      if (counter.current) counter.current.textContent = `${pad(i + 1)} / ${pad(total)}`;
      nums.forEach((n) => (n.textContent = pad(i + 1)));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", "1");
      lis.forEach((li) => (li.dataset.state = "done"));
      show(total - 1);
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.5;
      const r = ol.getBoundingClientRect();
      el.style.setProperty("--p", clamp((line - r.top) / r.height).toFixed(4));
      let active = 0;
      lis.forEach((li, i) => {
        const b = li.getBoundingClientRect();
        const state = b.bottom < line ? "done" : b.top <= line ? "active" : "next";
        if (li.dataset.state !== state) li.dataset.state = state;
        if (state !== "next") active = i;
      });
      show(active);
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
  }, [total]);

  return (
    <section ref={root} className={`story relative ${bg}`} aria-label={heading}>
      {/* Progress bar: sticks to the top while this section is on screen. */}
      <div className={`sticky top-0 z-30 border-b ${line} ${bg}/95 backdrop-blur`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs uppercase tracking-[0.18em] sm:px-8">
          <span>{label}</span>
          <span ref={counter} className="tabular-nums" aria-hidden>
            {`01 / ${pad(total)}`}
          </span>
        </div>
        <div className={`h-[3px] ${track}`} aria-hidden>
          <div className="story-bar h-full bg-camel" />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20 lg:py-24">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="display text-2xl sm:text-3xl">{heading}</h2>
          {note && <p className={`mt-3 text-sm ${muted}`}>{note}</p>}
          <div className="mt-8 max-w-md">
            {variant === "drawing" ? (
              <div className="aspect-[4/3] w-full border border-[var(--line)] bg-paper-2/50">{visual}</div>
            ) : (
              <div className="relative mx-auto grid aspect-square w-40 place-items-center sm:w-52 lg:mx-0 lg:w-64" aria-hidden>
                <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90" fill="none">
                  <circle cx="60" cy="60" r="54" stroke={dark ? "var(--line-on-dark)" : "var(--line)"} strokeWidth="2" />
                  <circle cx="60" cy="60" r="54" stroke="var(--camel)" strokeWidth="3" strokeDasharray="3 5" className="march" opacity="0.7" />
                  <circle cx="60" cy="60" r="54" pathLength={1} stroke={dark ? "var(--camel)" : "var(--camel-deep)"} strokeWidth="4" className="story-ring" />
                </svg>
                <div className="text-center">
                  <p className={`text-xs uppercase tracking-[0.2em] ${muted}`}>Step</p>
                  <p data-story-num className="display text-5xl tabular-nums lg:text-6xl">
                    01
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          {/* Rail: faint moving dashes for the road ahead, a solid line for the road covered. */}
          <svg className="absolute left-6 top-0 h-full w-2 -translate-x-1/2" aria-hidden focusable="false">
            <line x1="4" y1="0" x2="4" y2="100%" stroke="var(--camel)" strokeWidth="2" className="march" opacity="0.55" />
          </svg>
          <div className={`story-rail-fill absolute left-6 top-0 h-full w-[3px] -translate-x-1/2 ${dark ? "bg-camel" : "bg-camel-deep"}`} aria-hidden />
          <ol ref={list}>
            {items.map((it, i) => (
              <li key={it.title} className="story-item relative grid grid-cols-[3rem_1fr] gap-x-5 pb-16 last:pb-0">
                <span
                  className={`story-node relative z-10 grid h-12 w-12 place-items-center border border-camel text-sm font-medium tabular-nums ${nodeBg}`}
                >
                  {pad(i + 1)}
                </span>
                <div className="pt-2">
                  <h3 className="display text-lg sm:text-xl">{it.title}</h3>
                  <p className={`mt-2 max-w-xl ${muted}`}>{it.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
