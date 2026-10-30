"use client";

import dynamic from "next/dynamic";
import { useRef, type ReactNode } from "react";
import { SceneShell } from "@/components/three/SceneShell";
import { useScrollProgress, useTilt } from "@/components/three/hooks";
import { StillImage } from "./StillImage";
import { AssemblyFallback, BlueprintFallback, RoomFallback } from "./Fallbacks";
import type { ServiceSlug } from "@/content/services";

const ArchitectureHero = dynamic(() => import("@/components/three/hero/ArchitectureHero"), { ssr: false });
const InteriorHero = dynamic(() => import("@/components/three/hero/InteriorHero"), { ssr: false });
const CivilHero = dynamic(() => import("@/components/three/hero/CivilHero"), { ssr: false });

// The scenes move the camera themselves; this is only where it starts.
const camera: Record<ServiceSlug, { position: [number, number, number]; fov: number }> = {
  architecture: { position: [0, 6, 40], fov: 32 },
  interior: { position: [8, 8, 24], fov: 34 },
  civil: { position: [18, 8, 50], fov: 32 },
};

/**
 * Dark hero card with a scroll-driven 3D scene behind real HTML text.
 * The header sits on the light page above the card, so it stays readable (no Header change needed).
 */
export function ServiceHero({
  kind,
  children,
  stillUrl,
  stillAlt = "",
}: {
  kind: ServiceSlug;
  children: ReactNode;
  /** Owner-chosen image shown instead of the built-in drawing when 3D is unavailable. */
  stillUrl?: string;
  stillAlt?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(track);
  const tilt = useTilt();

  const fallback = stillUrl ? (
    <StillImage url={stillUrl} alt={stillAlt} />
  ) : kind === "architecture" ? <AssemblyFallback /> : kind === "interior" ? <RoomFallback /> : <BlueprintFallback />;

  return (
    <div className="px-3 pt-24 sm:px-6">
      <div ref={track} className="relative h-[240svh] motion-reduce:h-auto">
        <div className="sticky top-3 h-[calc(100svh-6rem)] min-h-[30rem] overflow-hidden bg-ink text-paper motion-reduce:static motion-reduce:h-[34rem]">
          <div className="absolute inset-0">
            <SceneShell fallback={fallback} className="h-full w-full" camera={camera[kind]} bare shadows keepFallback>
              {kind === "architecture" ? (
                <ArchitectureHero progress={progress} tilt={tilt} />
              ) : kind === "interior" ? (
                <InteriorHero progress={progress} tilt={tilt} />
              ) : (
                <CivilHero progress={progress} tilt={tilt} />
              )}
            </SceneShell>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/75 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 max-w-3xl p-5 sm:p-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
