"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Suspense, type ReactNode } from "react";

type Props = {
  active: boolean;
  children: ReactNode;
  camera?: { position: [number, number, number]; fov?: number };
  /** Skip the default lights and studio reflections: the scene brings its own (used by the Home hero). */
  bare?: boolean;
  shadows?: boolean;
};

/** Studio-style reflections built from light panels, so no HDR file is downloaded. */
function StudioLight() {
  return (
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={4} color="#fff3e0" position={[0, 5, -6]} scale={[12, 4, 1]} />
      <Lightformer form="rect" intensity={2.5} color="#c19a6b" position={[-6, 1, 2]} scale={[2, 8, 1]} />
      <Lightformer form="rect" intensity={2} color="#dbe7ff" position={[6, 2, 3]} scale={[2, 8, 1]} />
      <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 8, 0]} scale={6} />
    </Environment>
  );
}

export default function SceneCanvas({ active, children, camera, bare = false, shadows = false }: Props) {
  const phone = typeof window !== "undefined" && window.innerWidth < 700;
  return (
    <Canvas
      shadows={shadows ? "soft" : false}
      frameloop={active ? "always" : "never"}
      dpr={[1, phone ? 1.5 : 2]}
      camera={{ position: camera?.position ?? [0, 2, 9], fov: camera?.fov ?? 35 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        {!bare && (
          <>
            <ambientLight intensity={0.25} />
            <directionalLight position={[5, 8, 5]} intensity={1.4} />
            <StudioLight />
          </>
        )}
        {children}
      </Suspense>
    </Canvas>
  );
}
