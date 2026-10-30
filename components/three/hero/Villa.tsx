"use client";

import { useRef, type MutableRefObject, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { smoothstep } from "../hooks";
import { useVillaMaterials, type VillaMaterials } from "./useVillaMaterials";

type V3 = [number, number, number];

// Footprint (metres) and storey height. Levels are 3.2 m apart: 0.3 slab + 2.9 clear.
const W = 10;
const D = 8;
const STEP = 3.2;
const BASE = 0.5; // top of the plinth
const GAP = 1.9; // extra lift per level when the floors separate

const unitBox = new THREE.BoxGeometry(1, 1, 1);
const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 20);
const unitSphere = new THREE.IcosahedronGeometry(1, 2);

function B({ p, s, m, rot, cast = true, receive = true }: { p: V3; s: V3; m: THREE.Material; rot?: V3; cast?: boolean; receive?: boolean }) {
  return <mesh geometry={unitBox} material={m} position={p} scale={s} rotation={rot} castShadow={cast} receiveShadow={receive} />;
}
function Cyl({ p, r, h, m, cast = true }: { p: V3; r: number; h: number; m: THREE.Material; cast?: boolean }) {
  return <mesh geometry={unitCyl} material={m} position={p} scale={[r, h, r]} castShadow={cast} receiveShadow />;
}
function Ball({ p, r, m, sy = 1, cast = true }: { p: V3; r: number; m: THREE.Material; sy?: number; cast?: boolean }) {
  return <mesh geometry={unitSphere} material={m} position={p} scale={[r, r * sy, r]} castShadow={cast} receiveShadow />;
}

/** Vertical black mullions along a glass wall, plus top and bottom rails. */
function Curtain({ m, x, y, z, w, h, n }: { m: VillaMaterials; x: number; y: number; z: number; w: number; h: number; n: number }) {
  const out: ReactNode[] = [];
  for (let i = 0; i <= n; i++) out.push(<B key={i} p={[x - w / 2 + (w / n) * i, y, z]} s={[0.07, h, 0.1]} m={m.frame} />);
  return (
    <>
      <B p={[x, y, z]} s={[w, h, 0.04]} m={m.glass} cast={false} receive={false} />
      {out}
      <B p={[x, y + h / 2, z]} s={[w + 0.07, 0.09, 0.12]} m={m.frame} />
      <B p={[x, y - h / 2, z]} s={[w + 0.07, 0.09, 0.12]} m={m.frame} />
    </>
  );
}

/** Level 0 (Civil): the structure. A podium, concrete columns, a stone wall and the entrance. */
function LevelCivil({ m }: { m: VillaMaterials }) {
  const cols: ReactNode[] = [];
  for (const x of [-W / 2 + 0.4, 0, W / 2 - 0.4])
    for (const z of [D / 2 - 0.4, -D / 2 + 0.4]) cols.push(<B key={`${x}${z}`} p={[x, 0.3 + 1.45, z]} s={[0.5, 2.9, 0.5]} m={m.concrete} />);
  return (
    <>
      <B p={[0, 0.15, 0]} s={[W, 0.3, D]} m={m.concrete} />
      {cols}
      <B p={[0, 0.3 + 1.45, -D / 2 + 0.15]} s={[W, 2.9, 0.3]} m={m.plaster} />
      <B p={[-W / 2 + 0.15, 0.3 + 1.45, 0]} s={[0.3, 2.9, D]} m={m.stone} />
      <B p={[W / 2 - 0.15, 0.3 + 1.45, -D / 4]} s={[0.3, 2.9, D / 2]} m={m.plaster} />
      <Curtain m={m} x={2.4} y={0.3 + 1.45} z={D / 2 - 0.4} w={5} h={2.9} n={4} />
      <B p={[-2.6, 0.3 + 1.45, D / 2 - 0.3]} s={[3.6, 2.9, 0.3]} m={m.stone} />
      <B p={[0, 3.05, D / 2 - 0.9]} s={[W - 1.5, 0.05, 0.25]} m={m.warm} cast={false} />
    </>
  );
}

/** Level 1 (Interior): the glazed living floor, furnished and lit from inside. */
function LevelInterior({ m }: { m: VillaMaterials }) {
  return (
    <>
      <B p={[0, 0.15, 0]} s={[W + 0.4, 0.3, D + 0.4]} m={m.concrete} />
      <B p={[0, 0.3 + 1.45, -D / 2 + 0.125]} s={[W, 2.9, 0.25]} m={m.plaster} />
      <B p={[W / 2 - 0.125, 0.3 + 1.45, 0]} s={[0.25, 2.9, D]} m={m.plaster} />
      <B p={[-W / 2 + 0.125, 0.3 + 1.45, -D / 2 + 1.8]} s={[0.25, 2.9, 3.6]} m={m.timber} />
      <Curtain m={m} x={0} y={0.3 + 1.45} z={D / 2 - 0.1} w={W - 0.5} h={2.9} n={6} />
      <Curtain m={m} x={-W / 2 + 0.125} y={0.3 + 1.45} z={D / 4 + 0.4} w={0.01} h={2.9} n={1} />
      <B p={[-W / 2 + 0.125, 0.3 + 1.45, D / 4 + 0.6]} s={[0.04, 2.9, 3.4]} m={m.glass} cast={false} receive={false} />
      {/* living area */}
      <B p={[-1.8, 0.33, 1.2]} s={[4.2, 0.03, 3.2]} m={m.rug} receive />
      <B p={[-1.8, 0.62, -0.2]} s={[2.8, 0.5, 1.05]} m={m.sofa} />
      <B p={[-1.8, 0.95, -0.62]} s={[2.8, 0.55, 0.25]} m={m.sofa} />
      <B p={[-3.3, 0.7, -0.2]} s={[0.25, 0.65, 1.05]} m={m.sofa} />
      <B p={[-0.3, 0.7, -0.2]} s={[0.25, 0.65, 1.05]} m={m.sofa} />
      <B p={[-1.8, 0.5, 1.3]} s={[1.3, 0.32, 0.75]} m={m.wood} />
      <B p={[-1.8, 0.9, -D / 2 + 0.5]} s={[3.4, 1.1, 0.35]} m={m.wood} />
      <B p={[-1.8, 1.55, -D / 2 + 0.32]} s={[2.2, 1.0, 0.04]} m={m.black} cast={false} />
      {/* dining area */}
      <B p={[2.8, 0.78, 1.0]} s={[2.4, 0.07, 1.0]} m={m.wood} />
      {[
        [2.1, 0.4],
        [3.5, 0.4],
        [2.1, 1.6],
        [3.5, 1.6],
      ].map(([x, z]) => (
        <B key={`${x}${z}`} p={[x, 0.55, z]} s={[0.45, 0.08, 0.45]} m={m.sofaLight} />
      ))}
      {[-0.9, 0.9].map((dx) => (
        <group key={dx}>
          <B p={[2.8 + dx, 2.45, 1.0]} s={[0.012, 0.9, 0.012]} m={m.black} cast={false} />
          <Ball p={[2.8 + dx, 1.95, 1.0]} r={0.2} m={m.warm} cast={false} />
        </group>
      ))}
      <B p={[0.5, 2.85, 0.6]} s={[W - 3.5, 0.05, 0.3]} m={m.warm} cast={false} />
      {/* plant */}
      <Cyl p={[4.2, 0.45, -2.8]} r={0.3} h={0.6} m={m.white} />
      <Ball p={[4.2, 1.1, -2.8]} r={0.5} m={m.leaf2} sy={1.3} />
      <pointLight position={[0.2, 2.3, 0.6]} color="#ffc98a" intensity={9} distance={11} decay={2} />
    </>
  );
}

/** Level 2 (Architecture): the upper floor with timber slats, a ribbon window, a balcony and the roof. */
function LevelDesign({ m }: { m: VillaMaterials }) {
  const slats: ReactNode[] = [];
  for (let i = 0; i < 17; i++) slats.push(<B key={i} p={[1.4 + i * 0.24, 0.3 + 1.45, D / 2 + 0.05]} s={[0.1, 2.9, 0.08]} m={m.timber} />);
  return (
    <>
      <B p={[0, 0.15, 0]} s={[W + 0.4, 0.3, D + 0.4]} m={m.concrete} />
      <B p={[-1.7, 0.3 + 1.45, -0.4]} s={[W * 0.62, 2.9, D * 0.8]} m={m.plaster} />
      <B p={[3.4, 0.3 + 1.45, -0.4]} s={[W * 0.38, 2.9, D * 0.8]} m={m.timber} />
      {/* facade: ribbon window left, timber slats right */}
      <B p={[-1.9, 0.3 + 1.7, D * 0.4 - 0.4 + 0.03]} s={[5.2, 1.3, 0.05]} m={m.glass} cast={false} receive={false} />
      <B p={[-1.9, 0.3 + 1.7, D * 0.4 - 0.4 + 0.07]} s={[5.3, 0.07, 0.07]} m={m.frame} />
      <B p={[-1.9, 0.3 + 1.05, D * 0.4 - 0.4 + 0.07]} s={[5.3, 0.07, 0.07]} m={m.frame} />
      <B p={[-1.9, 0.3 + 2.35, D * 0.4 - 0.4 + 0.07]} s={[5.3, 0.07, 0.07]} m={m.frame} />
      {slats}
      {/* balcony with glass rail */}
      <B p={[3.1, 0.15, D / 2 + 1.5]} s={[4.2, 0.22, 2.6]} m={m.concrete} />
      <B p={[3.1, 0.75, D / 2 + 2.75]} s={[4.2, 1.1, 0.04]} m={m.glass} cast={false} receive={false} />
      <B p={[3.1, 1.32, D / 2 + 2.75]} s={[4.25, 0.05, 0.07]} m={m.frame} />
      <B p={[3.1 + 2.1, 0.75, D / 2 + 1.5]} s={[0.04, 1.1, 2.6]} m={m.glass} cast={false} receive={false} />
      <B p={[3.1, 3.0, D / 2 + 0.6]} s={[3.2, 0.04, 0.2]} m={m.warm} cast={false} />
      {/* roof */}
      <B p={[0, 3.2 + 0.18, 0]} s={[W + 1.6, 0.36, D + 1.6]} m={m.concrete} />
      <B p={[0, 3.2 + 0.46, D / 2 + 0.8 - 0.06]} s={[W + 1.6, 0.2, 0.12]} m={m.white} />
      {[-4, -2.4, -0.8].map((x) => (
        <B key={x} p={[x, 3.2 + 0.62, -1.6]} s={[1.4, 0.05, 1.7]} m={m.solar} rot={[-0.38, 0, 0]} />
      ))}
      {[2.4, 4.4].map((x) =>
        [1.4, 3.0].map((z) => <B key={`${x}${z}`} p={[x, 3.2 + 1.2, z - 0.6]} s={[0.08, 1.7, 0.08]} m={m.frame} />),
      )}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <B key={i} p={[3.4, 3.2 + 2.05, 0.7 + i * 0.32]} s={[2.5, 0.05, 0.12]} m={m.timber} />
      ))}
    </>
  );
}

function Tree({ m, p, s = 1 }: { m: VillaMaterials; p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 1.4, 0]} r={0.22} h={2.8} m={m.trunk} />
      <Ball p={[0, 3.6, 0]} r={1.9} m={m.leaf} sy={0.95} />
      <Ball p={[0.9, 3.0, 0.4]} r={1.4} m={m.leaf2} />
      <Ball p={[-0.9, 3.2, -0.3]} r={1.5} m={m.leaf2} />
    </group>
  );
}

function Garden({ m }: { m: VillaMaterials }) {
  const lamps: V3[] = [
    [-3.2, 0.3, D / 2 + 3.2],
    [-0.4, 0.3, D / 2 + 3.2],
    [-7.2, 0.3, 2],
    [8.4, 0.3, -2],
  ];
  return (
    <>
      <B p={[0, 0.25, 0]} s={[W + 2, 0.5, D + 2]} m={m.concrete} />
      <B p={[0, 0.03, 1.2]} s={[W + 7, 0.06, D + 5.5]} m={m.paving} receive cast={false} />
      {/* entrance steps and path */}
      {[0, 1, 2].map((i) => (
        <B key={i} p={[-2.6, 0.12 - i * 0.04, D / 2 + 1.15 + i * 0.38]} s={[3.6, 0.2 - i * 0.04, 0.4]} m={m.stone} />
      ))}
      <B p={[-2.6, 0.04, D / 2 + 5.2]} s={[2.2, 0.05, 4.4]} m={m.stone} cast={false} />
      {/* pool */}
      <B p={[6.6, 0.07, 6.6]} s={[5.6, 0.1, 3]} m={m.poolEdge} />
      <B p={[6.6, 0.14, 6.6]} s={[5, 0.04, 2.4]} m={m.water} cast={false} />
      <pointLight position={[6.6, 0.5, 6.6]} color="#4cc8e8" intensity={4} distance={7} decay={2} />
      {[-0.7, 0.7].map((dx) => (
        <group key={dx} position={[6.6 + dx * 1.2, 0.16, 8.7]}>
          <B p={[0, 0.12, 0]} s={[0.7, 0.14, 1.7]} m={m.white} />
          <B p={[0, 0.34, -0.7]} s={[0.7, 0.1, 0.7]} m={m.white} rot={[-0.9, 0, 0]} />
        </group>
      ))}
      {/* planting and lights */}
      {[-6.2, -5, -3.8, 1, 2.2].map((x, i) => (
        <Ball key={x} p={[x, 0.4, D / 2 + 1.6 + (i % 2) * 0.3]} r={0.55} m={m.shrub} sy={0.75} />
      ))}
      <Tree m={m} p={[-9.5, 0.03, -2]} s={1.15} />
      <Tree m={m} p={[-10.5, 0.03, 6]} s={0.95} />
      <Tree m={m} p={[11.5, 0.03, -5]} s={1.2} />
      <Tree m={m} p={[12.8, 0.03, 2]} s={0.9} />
      <Tree m={m} p={[-4, 0.03, -10]} s={1.1} />
      <Tree m={m} p={[5, 0.03, -11]} s={1.3} />
      {lamps.map((p, i) => (
        <group key={i} position={p}>
          <Cyl p={[0, 0, 0]} r={0.07} h={0.6} m={m.black} />
          <Ball p={[0, 0.36, 0]} r={0.12} m={m.garden} cast={false} />
        </group>
      ))}
    </>
  );
}

type Props = {
  progress: MutableRefObject<number>;
};

/**
 * A modern three-storey villa built in code from real surface textures. The three levels are the three
 * services (Civil at the base, Interior in the middle, Architecture on top). They separate with scroll.
 */
export default function Villa({ progress }: Props) {
  const m = useVillaMaterials();
  const l0 = useRef<THREE.Group>(null);
  const l1 = useRef<THREE.Group>(null);
  const l2 = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = progress.current;
    const back = 1 - smoothstep(0.82, 0.98, p);
    [l0, l1, l2].forEach((ref, i) => {
      if (!ref.current) return;
      const e = smoothstep(0.05 + 0.08 * i, 0.45 + 0.08 * i, p) * back;
      ref.current.position.y = BASE + i * STEP + i * GAP * e;
    });
  });

  return (
    <group>
      <Garden m={m} />
      <group ref={l0} position={[0, BASE, 0]}>
        <LevelCivil m={m} />
      </group>
      <group ref={l1} position={[0, BASE + STEP, 0]}>
        <LevelInterior m={m} />
      </group>
      <group ref={l2} position={[0, BASE + STEP * 2, 0]}>
        <LevelDesign m={m} />
      </group>
    </group>
  );
}
