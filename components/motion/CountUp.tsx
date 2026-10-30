"use client";

import { useEffect, useRef } from "react";

/**
 * A number that counts up from zero the first time it scrolls into view. The final value is rendered on
 * the server, so it reads correctly without script and under reduced motion. `value` may carry a suffix
 * ("30+") or decimals ("4.9"); both are kept.
 */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    const m = /^(\d+(?:\.\d+)?)(.*)$/.exec(value);
    if (!node || !m || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const target = Number(m[1]);
    const suffix = m[2];
    const decimals = m[1].includes(".") ? m[1].split(".")[1].length : 0;
    const show = (n: number) => (node.textContent = `${n.toFixed(decimals)}${suffix}`);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1600);
          show(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        show(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      node.textContent = value;
    };
  }, [value]);

  return (
    <span ref={el} className={className}>
      {value}
    </span>
  );
}
