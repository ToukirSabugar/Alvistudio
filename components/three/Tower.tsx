"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { smoothstep } from "./hooks";
import { createKit, D, GAP, H, SLAB, STEP, W, type Kit } from "./materials";

type V3 = [number, number, number];

type Props = {
  /** Scroll progress 0..1 of the hero section (ref, read every frame). */
  progress: MutableRefObject<number>;
  /** Cursor tilt in [-1, 1] (ref, read every frame). */
  tilt: MutableRefObject<{ x: number; y: number }>;
};

function Block({
  kit,
  pos,
  size,
  mat,
  edge = false,
}: {
  kit: Kit;
  pos: V3;
  size: V3;
  mat: THREE.Material;
  edge?: boolean;
}) {
  return (
    <>
      <mesh geometry={kit.box} material={mat} position={pos} scale={size} />
      {edge && <lineSegments geometry={kit.edges} material={kit.line} position={pos} scale={size} />}
    </>
  );
}

const COLS: [number, number][] = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

/** One floor: slab, four columns, a glass volume, and whatever belongs to that service. */
function Floor({ kit, index }: { kit: Kit; index: number }) {
  const cw = index === 0 ? 0.24 : 0.1;
  const mid = SLAB / 2 + H / 2;
  return (
    <>
      <Block kit={kit} pos={[0, 0, 0]} size={[W, SLAB, D]} mat={kit.concrete} edge />
      {COLS.map(([cx, cz]) => (
        <Block
          key={`${cx}${cz}`}
          kit={kit}
          pos={[cx * (W / 2 - 0.13), mid, cz * (D / 2 - 0.13)]}
          size={[cw, H, cw]}
          mat={kit.steel}
        />
      ))}

      {index === 0 && <Block kit={kit} pos={[0, -SLAB / 2 - 0.06, 0]} size={[W + 0.4, 0.12, D + 0.4]} mat={kit.concrete} edge />}

      {index === 1 && (
        <>
          <Block kit={kit} pos={[0, SLAB / 2 + 0.01, 0.1]} size={[2.2, 0.02, 1.5]} mat={kit.rug} />
          <Block kit={kit} pos={[-0.85, SLAB / 2 + 0.17, 0.55]} size={[1.3, 0.34, 0.55]} mat={kit.fabric} />
          <Block kit={kit} pos={[-0.85, SLAB / 2 + 0.42, 0.78]} size={[1.3, 0.3, 0.1]} mat={kit.fabric} />
          <Block kit={kit} pos={[0.45, SLAB / 2 + 0.11, -0.05]} size={[0.7, 0.2, 0.45]} mat={kit.timber} />
          <Block kit={kit} pos={[1.55, SLAB / 2 + 0.4, -0.2]} size={[0.14, 0.8, 1.1]} mat={kit.timber} />
          <mesh geometry={kit.cyl} material={kit.steel} position={[1.4, SLAB / 2 + 0.35, 0.95]} scale={[0.015, 0.7, 0.015]} />
          <mesh geometry={kit.sphere} material={kit.lamp} position={[1.4, SLAB / 2 + 0.78, 0.95]} scale={0.1} />
        </>
      )}

      {index === 2 && (
        <Block kit={kit} pos={[0, SLAB / 2 + H + SLAB / 2, 0]} size={[W + 0.7, SLAB, D + 0.7]} mat={kit.concrete} edge />
      )}

      <Block kit={kit} pos={[0, mid, 0]} size={[W - 0.1, H, D - 0.1]} mat={kit.glass} edge />
    </>
  );
}

/**
 * Three-floor tower: Civil (base), Interior (middle), Architecture (top).
 * Scroll separates the floors with a stagger and eases the camera in; at the end they re-join.
 */
export default function Tower({ progress, tilt }: Props) {
  const kit = useMemo(() => createKit(), []);
  useEffect(() => () => kit.dispose(), [kit]);

  const spin = useRef<THREE.Group>(null);
  const floors = useRef<(THREE.Group | null)[]>([]);
  const glow = useRef<THREE.Mesh>(null);
  const eased = useRef(0);

  useFrame((state, dt) => {
    eased.current = THREE.MathUtils.damp(eased.current, progress.current, 5, Math.min(dt, 0.05));
    const p = eased.current;
    const join = 1 - smoothstep(0.82, 0.98, p);

    floors.current.forEach((g, i) => {
      if (!g) return;
      const s = smoothstep(0.05 + i * 0.08, 0.45 + i * 0.08, p) * join;
      g.position.y = i * STEP + i * GAP * s;
    });
    const e = smoothstep(0.05, 0.6, p) * join;

    const t = state.clock.elapsedTime;
    const tl = tilt.current;
    if (spin.current) {
      spin.current.rotation.y = 0.55 + t * 0.12 + tl.x * 0.55;
      spin.current.rotation.x = tl.y * 0.1;
    }
    if (glow.current) (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.6 + 0.4 * e;

    // Keep the whole tower in frame on narrow screens, then ease the camera in as the floors split.
    const cam = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const halfTan = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    const fitDist = Math.max(12.5, 6.4 / (2 * halfTan * Math.max(aspect, 0.25)));
    const zoom = 1 - 0.12 * smoothstep(0, 0.5, p);
    const cy = 1.6 + e * GAP;
    cam.position.set(tl.x * 0.8, cy + 2.4, fitDist * zoom);
    cam.lookAt(0, cy, 0);
  });

  return (
    <>
      <group ref={spin}>
        {[0, 1, 2].map((i) => (
          <group
            key={i}
            ref={(g) => {
              floors.current[i] = g;
            }}
            position={[0, i * STEP, 0]}
          >
            <Floor kit={kit} index={i} />
          </group>
        ))}
      </group>

      <group position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={kit.disc} material={kit.shadow} scale={3.6} renderOrder={-2} />
        <mesh ref={glow} geometry={kit.disc} material={kit.glow} scale={6.2} position={[0, 0, 0.002]} renderOrder={-1} />
        <mesh geometry={kit.ring} material={kit.ringLine} scale={4.6} position={[0, 0, 0.004]} />
      </group>
    </>
  );
}

export { Tower };
