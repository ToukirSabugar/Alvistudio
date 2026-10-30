"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isAdminArea } from "@/lib/admin-paths";

/**
 * Smooth wheel scrolling with Lenis, on desktop only. Touch screens keep their native scrolling,
 * reduced motion keeps the browser default, and the admin area is left alone.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const admin = isAdminArea(pathname);

  useEffect(() => {
    if (admin) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    let stop = () => {};
    let cancelled = false;
    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({ duration: 1.15, anchors: true });
      let raf = requestAnimationFrame(function loop(t) {
        lenis.raf(t);
        raf = requestAnimationFrame(loop);
      });
      stop = () => {
        cancelAnimationFrame(raf);
        lenis.destroy();
      };
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [admin]);

  return null;
}
