"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

type Props = {
  /** Shown while loading, when WebGL fails, and under reduced motion. Must read fine on its own. */
  fallback: ReactNode;
  /** The R3F scene content (lights, meshes). */
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov?: number };
  /** The scene brings its own lights and environment. */
  bare?: boolean;
  shadows?: boolean;
  /** Keep the fallback picture visible under the 3D canvas, so there is something to see while the scene loads. */
  keepFallback?: boolean;
  /** Render the still fallback instead of moving 3D when the visitor prefers reduced motion. Default true. */
  stillOnReducedMotion?: boolean;
};

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const noSubscribe = () => () => {};

let cachedWebgl: boolean | undefined;
function decideMode(stillOnReducedMotion: boolean): "3d" | "still" {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowMem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (reduce && stillOnReducedMotion) return "still";
  if (lowMem !== undefined && lowMem < 2) return "still";
  cachedWebgl ??= webglOk();
  return cachedWebgl ? "3d" : "still";
}

export function SceneShell({ fallback, children, className = "", camera, bare, shadows, keepFallback, stillOnReducedMotion = true }: Props) {
  const box = useRef<HTMLDivElement>(null);
  // "loading" on the server and first paint, then the real answer once we are in the browser.
  const mode = useSyncExternalStore(
    noSubscribe,
    () => decideMode(stillOnReducedMotion),
    () => "loading" as const,
  );
  const [visible, setVisible] = useState(true);

  // Pause drawing when off screen or when the tab is hidden.
  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    const onVis = () => document.hidden && setVisible(false);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={box} className={`relative ${className}`}>
      <div className="absolute inset-0" aria-hidden={mode === "3d"}>
        {(mode !== "3d" || keepFallback) && fallback}
      </div>
      {mode === "3d" && (
        <div className="absolute inset-0" aria-hidden>
          <SceneCanvas active={visible} camera={camera} bare={bare} shadows={shadows}>
            {children}
          </SceneCanvas>
        </div>
      )}
    </div>
  );
}
