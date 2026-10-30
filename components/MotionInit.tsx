"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Reveal-on-scroll for any element with [data-reveal]. Content stays visible until this
// runs, and a 3.5 s safety timer shows everything if the observer never fires.
export function MotionInit() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    root.classList.add("motion-ready");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const safety = window.setTimeout(() => els.forEach((el) => el.classList.add("is-in")), 3500);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [pathname]);

  return null;
}
