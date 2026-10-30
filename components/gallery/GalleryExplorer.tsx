"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";

export type GalleryTile = {
  id: string;
  type: string;
  title: string;
  alt: string;
  src: string;
  width: number;
  height: number;
  sample: boolean;
};

export type GallerySection = { id: string; label: string; heading: string; tiles: GalleryTile[] };

// Mosaic pattern for ten categories on a four-column grid (it also copes with fewer or more).
const bentoSpan = [
  "col-span-2 md:row-span-2",
  "col-span-2",
  "col-span-1",
  "col-span-1",
  "col-span-1",
  "col-span-1",
  "col-span-2",
  "col-span-2",
  "col-span-1",
  "col-span-1",
];
const FIRST_SHOWN = 6;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/**
 * The gallery: a sticky bar of category chips, a mosaic of the categories, one grid of image cards per
 * category (alternating pale and black bands), and a full-screen viewer with previous / next.
 */
export function GalleryExplorer({ sections }: { sections: GallerySection[] }) {
  const flat = sections.flatMap((s) => s.tiles);
  const indexOf = (id: string) => flat.findIndex((t) => t.id === id);

  const [active, setActive] = useState<string>("all");
  const [open, setOpen] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const dialog = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  // Highlight the chip of the section that is in the middle of the screen.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      if (els[0] && els[0].getBoundingClientRect().top > window.innerHeight * 0.5) setActive("all");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  function show(i: number, trigger?: HTMLElement | null) {
    if (trigger) lastTrigger.current = trigger;
    setOpen(((i % flat.length) + flat.length) % flat.length);
  }

  // Open and close the native dialog (it traps focus and closes on Escape by itself).
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    }
    if (open === null && d.open) d.close();
  }, [open]);

  const onClosed = () => {
    setOpen(null);
    document.documentElement.style.overflow = "";
    lastTrigger.current?.focus();
  };

  const current = open !== null ? flat[open] : null;

  return (
    <>
      {/* Category chips. Stays at the top of the screen while you browse. */}
      <div className="sticky top-0 z-30 border-y border-[var(--line)] bg-paper-2/95 backdrop-blur">
        <nav aria-label="Gallery categories" className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-8">
          <ul className="m-0 flex w-max min-w-full list-none justify-start gap-2 p-0 py-3 sm:justify-center">
            {[{ id: "all", label: "All" }, ...sections].map((c) => {
              const on = active === c.id;
              return (
                <li key={c.id}>
                  <a
                    href={c.id === "all" ? "#gallery-top" : `#${c.id}`}
                    aria-current={on ? "true" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      if (c.id === "all") window.scrollTo({ top: 0, behavior: "smooth" });
                      else scrollToSection(c.id);
                    }}
                    className={`inline-flex min-h-11 items-center whitespace-nowrap border px-5 text-sm transition-colors ${
                      on ? "border-ink bg-ink text-paper" : "border-ink/30 hover:border-ink hover:bg-paper"
                    }`}
                  >
                    {c.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Category mosaic */}
      <section aria-labelledby="top-categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
        <SectionHeading id="top-categories" title="Browse by category" />
        <ul className="mt-12 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] md:grid-cols-4">
          {sections.map((s, i) => (
            <li key={s.id} className={`${bentoSpan[i % bentoSpan.length]} min-h-0`}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(s.id);
                }}
                className="glow-card group relative block h-full w-full overflow-hidden border border-ink/30 bg-ink"
              >
                <Image
                  src={s.tiles[0].src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  unoptimized
                  loading="eager"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-center px-3 pb-5 text-center text-paper">
                  <span className="display text-lg sm:text-2xl">{s.label}</span>
                  <span className="mt-1 text-sm text-paper/80">
                    {s.tiles.length} {s.tiles.length === 1 ? "design" : "designs"}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* One band per category, alternating pale and black */}
      {sections.map((s, si) => {
        const dark = si % 2 === 0;
        return (
          <section
            key={s.id}
            id={s.id}
            aria-labelledby={`${s.id}-h`}
            className={`scroll-mt-16 ${dark ? "bg-ink text-paper" : "bg-paper text-ink"}`}
          >
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
              <SectionHeading id={`${s.id}-h`} title={s.heading} dark={dark} />
              <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(expanded[s.id] ? s.tiles : s.tiles.slice(0, FIRST_SHOWN)).map((t) => (
                  <li key={t.id} className="h-full" data-reveal>
                    <article
                      className={`glow-card group flex h-full flex-col overflow-hidden border ${
                        dark ? "border-[var(--line-on-dark)] bg-ink-2" : "border-ink/25 bg-paper-2"
                      }`}
                      style={{
                        ["--glow" as string]: dark ? "var(--camel)" : "var(--camel-deep)",
                        ["--glow-soft" as string]: dark ? "rgba(193,154,107,.55)" : "rgba(143,107,63,.5)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => show(indexOf(t.id), e.currentTarget)}
                        aria-label={`View larger: ${t.title}`}
                        className="relative block aspect-[3/2] w-full overflow-hidden"
                      >
                        <Image
                          src={t.src}
                          alt={t.alt}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                          unoptimized
                          loading="lazy"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {t.sample && (
                          <span className="absolute left-3 top-3 bg-ink/85 px-2.5 py-1 text-xs text-paper">Sample image</span>
                        )}
                        <span
                          aria-hidden
                          className="absolute inset-0 grid place-items-center bg-ink/0 opacity-0 transition duration-300 group-hover:bg-ink/45 group-hover:opacity-100"
                        >
                          <span className="border border-paper px-4 py-2 text-sm uppercase tracking-[0.14em] text-paper">View larger</span>
                        </span>
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          className="absolute bottom-3 right-3 h-8 w-8 bg-ink/70 p-1.5 text-paper"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        >
                          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                        </svg>
                      </button>
                      <div className="flex flex-1 flex-col items-center px-5 pb-6 pt-5 text-center">
                        <h3 className="display text-lg">{t.title}</h3>
                        <Link
                          href="/contact?type=consultation"
                          className={`mt-4 inline-flex min-h-11 items-center justify-center border px-5 text-sm uppercase tracking-[0.14em] transition-colors ${
                            dark
                              ? "border-camel text-paper hover:bg-camel hover:text-ink"
                              : "border-ink hover:bg-ink hover:text-paper"
                          }`}
                        >
                          Ask about this design
                        </Link>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
              {s.tiles.length > FIRST_SHOWN && !expanded[s.id] && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => ({ ...v, [s.id]: true }))}
                    className={`inline-flex min-h-11 items-center justify-center border px-6 text-sm uppercase tracking-[0.14em] transition-colors ${
                      dark ? "border-camel text-paper hover:bg-camel hover:text-ink" : "border-ink hover:bg-ink hover:text-paper"
                    }`}
                  >
                    Show all {s.tiles.length} designs
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Full-screen viewer */}
      <dialog
        ref={dialog}
        aria-label="Photo viewer"
        onClose={onClosed}
        onKeyDown={(e) => {
          if (open === null) return;
          if (e.key === "ArrowRight") show(open + 1);
          if (e.key === "ArrowLeft") show(open - 1);
        }}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-paper backdrop:bg-ink/90"
      >
        {current && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-3 py-6 sm:px-16">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Close viewer"
              className="absolute right-3 top-3 grid h-11 w-11 place-items-center border border-paper/50 bg-ink/70 text-paper hover:bg-camel hover:text-ink"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
            <div className="relative flex w-full max-w-5xl flex-1 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="text-center">
              <p className="display text-xl">{current.title}</p>
              <p className="mt-1 text-sm text-paper/70">
                {current.sample ? "Sample image. " : ""}
                {(open ?? 0) + 1} of {flat.length}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => show((open ?? 0) - 1)}
                className="inline-flex min-h-11 min-w-28 items-center justify-center border border-paper/60 px-5 text-sm uppercase tracking-[0.14em] hover:bg-camel hover:text-ink"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => show((open ?? 0) + 1)}
                className="inline-flex min-h-11 min-w-28 items-center justify-center border border-paper/60 px-5 text-sm uppercase tracking-[0.14em] hover:bg-camel hover:text-ink"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
