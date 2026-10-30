"use client";

import { useEffect, useRef, type RefObject, type MutableRefObject } from "react";

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/**
 * Scroll progress 0..1 of a tall (sticky-stage) section: 0 when its top reaches the top of the
 * viewport, 1 when its bottom reaches the bottom. Read `.current` inside useFrame.
 */
export function useScrollProgress(target: RefObject<HTMLElement | null>): MutableRefObject<number> {
  const p = useRef(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = target.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      p.current = span > 0 ? clamp(-r.top / span) : clamp(1 - r.bottom / (window.innerHeight + r.height));
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
  }, [target]);
  return p;
}

/**
 * Tilt vector in [-1, 1]. Follows the cursor on desktop. On touch screens there is no cursor, so it
 * drifts by itself (and follows a finger drag), so the effect is never mouse-only.
 * Read `.current.x` / `.current.y` inside useFrame.
 */
export function useTilt(): MutableRefObject<{ x: number; y: number }> {
  const t = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: 0, y: 0 };
    let dragging = false;
    const move = (e: PointerEvent) => {
      if (coarse && !dragging) return;
      target.x = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
      target.y = clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
    };
    const down = () => (dragging = true);
    const up = () => (dragging = false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    let raf = 0;
    const start = performance.now();
    let last = start;
    const tick = (now: number) => {
      if (reduce) return;
      if (coarse && !dragging) {
        const s = (now - start) / 1000;
        target.x = Math.sin(s * 0.5) * 0.6;
        target.y = Math.cos(s * 0.37) * 0.25;
      }
      // Time-based easing, so the view follows the cursor at the same speed on slow and fast devices.
      const k = 1 - Math.exp(-Math.min(0.25, (now - last) / 1000) / 0.14);
      last = now;
      t.current.x += (target.x - t.current.x) * k;
      t.current.y += (target.y - t.current.y) * k;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);
  return t;
}

export const ease = (x: number) => x * x * (3 - 2 * x);
export const smoothstep = (a: number, b: number, x: number) => ease(clamp((x - a) / (b - a)));
