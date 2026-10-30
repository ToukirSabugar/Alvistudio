"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, Environment, Grid, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { smoothstep } from "../hooks";
import { useVillaMaterials, type VillaMaterials } from "./useVillaMaterials";
import { B, Ball, Cyl, OrbitRig, Post, SkyDome, SoftGround, useLite, type Progress, type RigConfig, type SkyStop, type Tilt, type V3 } from "./common";

// Civil: a building site at sunrise. It starts as a glowing blueprint grid with a wire outline of the frame,
// and as you scroll the foundation, columns, slabs and brick walls go up floor by floor while the crane turns.

const SKY: SkyStop[] = [
  [0, "#0f141b"],
  [0.35, "#262c37"],
  [0.45, "#65564f"],
  [0.51, "#d8935a"],
  [0.545, "#ffc785"],
  [0.58, "#8a5a3a"],
  [0.7, "#1a1410"],
  [1, "#0c0b0a"],
];

const RIG: RigConfig = {
  dist: (p, wide) => (wide ? 60 : 76) - smoothstep(0, 1, p) * 6,
  lift: (p) => 8 + smoothstep(0, 1, p) * 3,
  look: () => 9,
  az: 0.35,
  azRange: 1,
  spin: (p) => -smoothstep(0, 1, p) * 0.3,
  el: 0.22,
  shiftX: 0.17,
  shiftY: 0.12,
  exposure: 1.1,
};

const FLOORS = 4;
const H = 3.2; // storey height
const BASE = 0.6; // top of the ground slab
const XS = [-4, 0, 4];
const ZS = [-3.6, 0, 3.6];

const range = (p: number, a: number, b: number) => smoothstep(a, b, p);

/** The thin camel outline of the frame the site is building, visible at the start and gone when it is finished. */
function Ghost() {
  return (
    <>
      {Array.from({ length: FLOORS }).map((_, k) => (
        <group key={k} position={[0, BASE + k * H, 0]}>
          {XS.flatMap((x) =>
            ZS.map((z) => (
              <mesh key={`${x}${z}`} position={[x, H / 2, z]}>
                <boxGeometry args={[0.45, H, 0.45]} />
                <meshBasicMaterial visible={false} />
                <Edges color="#c19a6b" />
              </mesh>
            )),
          )}
          <mesh position={[0, H - 0.125, 0]}>
            <boxGeometry args={[9.6, 0.25, 8.6]} />
            <meshBasicMaterial visible={false} />
            <Edges color="#c19a6b" />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Floor({ k, progress, m }: { k: number; progress: Progress; m: VillaMaterials }) {
  const cols = useRef<THREE.Group>(null);
  const slab = useRef<THREE.Group>(null);
  const walls = useRef<THREE.Group>(null);
  const glass = useRef<THREE.Group>(null);
  const s = 0.1 + 0.19 * k;

  useFrame(() => {
    const p = progress.current;
    if (cols.current) cols.current.scale.y = Math.max(0.001, range(p, s, s + 0.08));
    const drop = range(p, s + 0.06, s + 0.14);
    if (slab.current) {
      slab.current.visible = drop > 0.001;
      slab.current.position.y = (1 - drop) * 9;
    }
    if (walls.current) walls.current.scale.y = Math.max(0.001, range(p, s + 0.12, s + 0.2));
    if (glass.current) glass.current.scale.y = Math.max(0.001, range(p, 0.88 + k * 0.02, 0.96 + k * 0.01));
  });

  const rebar: ReactNode[] = [];
  if (k === FLOORS - 1)
    for (const x of XS) for (const z of ZS) rebar.push(<Cyl key={`${x}${z}`} p={[x, H + 0.4, z]} r={0.03} h={0.9} m={m.rebar} cast={false} />);

  return (
    <group position={[0, BASE + k * H, 0]}>
      <group ref={cols}>
        {XS.flatMap((x) => ZS.map((z) => <B key={`${x}${z}`} p={[x, H / 2, z]} s={[0.45, H, 0.45]} m={m.concrete} />))}
        {rebar}
      </group>
      <group ref={slab}>
        <B p={[0, H - 0.125, 0]} s={[9.6, 0.25, 8.6]} m={m.concrete} />
      </group>
      <group ref={walls}>
        <B p={[0, H / 2 - 0.13, -4.0]} s={[9.2, H - 0.3, 0.3]} m={m.brick} />
        <B p={[-4.5, H / 2 - 0.13, 0]} s={[0.3, H - 0.3, 8.0]} m={m.brick} />
        <B p={[4.5, H / 2 - 0.13, -2.8]} s={[0.3, H - 0.3, 2.4]} m={m.brick} />
        <B p={[4.5, H / 2 - 0.13, 2.8]} s={[0.3, H - 0.3, 2.4]} m={m.brick} />
        <B p={[4.5, H - 0.45, 0]} s={[0.3, 0.4, 3.2]} m={m.brick} />
      </group>
      <group ref={glass}>
        <B p={[0, H / 2 - 0.13, 4.1]} s={[9.2, H - 0.3, 0.04]} m={m.glass} cast={false} receive={false} />
        {[-4.6, -2.3, 0, 2.3, 4.6].map((x) => (
          <B key={x} p={[x, H / 2 - 0.13, 4.12]} s={[0.07, H - 0.3, 0.09]} m={m.frame} />
        ))}
      </group>
    </group>
  );
}

function Foundation({ progress, m }: { progress: Progress; m: VillaMaterials }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (g.current) g.current.scale.y = Math.max(0.001, range(progress.current, 0.01, 0.1));
  });
  return (
    <group ref={g}>
      <B p={[0, BASE / 2, 0]} s={[10.2, BASE, 9.2]} m={m.concrete} />
    </group>
  );
}

function Scaffold({ progress, m }: { progress: Progress; m: VillaMaterials }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = progress.current;
    if (g.current) g.current.scale.y = Math.max(0.001, range(p, 0.1, 0.7) * (1 - range(p, 0.9, 0.98)));
  });
  const top = FLOORS * H + BASE + 1;
  const lifts = Math.floor(top / 2.2);
  const poles: ReactNode[] = [];
  const rails: ReactNode[] = [];
  for (const x of [5.5, 6.3])
    for (let z = -4; z <= 4; z += 2) poles.push(<Cyl key={`${x}${z}`} p={[x, top / 2, z]} r={0.05} h={top} m={m.steel} cast={false} />);
  for (let i = 1; i <= lifts; i++) {
    const y = i * 2.2;
    rails.push(<B key={i} p={[5.9, y, 0]} s={[0.9, 0.05, 8.2]} m={m.wood} cast={false} />);
    rails.push(<B key={`r${i}`} p={[5.5, y + 0.9, 0]} s={[0.04, 0.04, 8.2]} m={m.steel} cast={false} />);
  }
  return (
    <group ref={g}>
      {poles}
      {rails}
    </group>
  );
}

function Crane({ progress, m }: { progress: Progress; m: VillaMaterials }) {
  const jib = useRef<THREE.Group>(null);
  const trolley = useRef<THREE.Group>(null);
  const MAST = 21;
  useFrame((state) => {
    const p = progress.current;
    if (jib.current) jib.current.rotation.y = state.clock.elapsedTime * 0.12 + p * 1.2 + 0.4;
    if (trolley.current) trolley.current.position.x = 8 + Math.sin(state.clock.elapsedTime * 0.35) * 3;
  });
  const braces: ReactNode[] = [];
  for (let y = 1.5; y < MAST; y += 1.5) braces.push(<B key={y} p={[0, y, 0]} s={[1.0, 0.09, 1.0]} m={m.crane} cast={false} />);
  return (
    <group position={[-9.5, 0, -6]}>
      <B p={[0, 0.4, 0]} s={[3.6, 0.8, 3.6]} m={m.concrete} />
      {[
        [-0.45, -0.45],
        [0.45, -0.45],
        [-0.45, 0.45],
        [0.45, 0.45],
      ].map(([x, z]) => (
        <B key={`${x}${z}`} p={[x, MAST / 2 + 0.8, z]} s={[0.12, MAST, 0.12]} m={m.crane} />
      ))}
      <group position={[0, 0.8, 0]}>{braces}</group>
      <group ref={jib} position={[0, MAST + 0.8, 0]}>
        <B p={[0, 0.6, 0]} s={[1.3, 1.2, 1.3]} m={m.crane} />
        <B p={[7, 0.2, 0]} s={[18, 0.28, 0.5]} m={m.crane} />
        <B p={[7, 0.55, 0]} s={[18, 0.06, 0.06]} m={m.steel} cast={false} />
        <B p={[-3.4, 0.2, 0]} s={[5.2, 0.28, 0.5]} m={m.crane} />
        <B p={[-5.2, -0.3, 0]} s={[1.6, 1.4, 1.1]} m={m.concrete} />
        <B p={[0, 2.2, 0]} s={[0.2, 3.4, 0.2]} m={m.crane} />
        <B p={[8, 1.3, 0]} s={[0.04, 0.04, 0.04]} m={m.steel} cast={false} />
        <B p={[3, 1.15, 0]} s={[12.5, 0.03, 0.03]} m={m.steel} cast={false} rot={[0, 0, 0.1]} />
        <B p={[-2.8, 1.15, 0]} s={[6.2, 0.03, 0.03]} m={m.steel} cast={false} rot={[0, 0, -0.18]} />
        <group ref={trolley} position={[8, -0.1, 0]}>
          <B p={[0, 0, 0]} s={[0.8, 0.3, 0.7]} m={m.steel} />
          <B p={[0, -4, 0]} s={[0.025, 8, 0.025]} m={m.black} cast={false} />
          <B p={[0, -8.2, 0]} s={[1.5, 0.5, 1.0]} m={m.brick} />
          <B p={[0, -7.8, 0]} s={[1.6, 0.12, 1.1]} m={m.wood} />
        </group>
      </group>
    </group>
  );
}

// Bricks, steel bars, sand and a site cabin, so it reads as a working site.
function Site({ m }: { m: VillaMaterials }) {
  const bricks: ReactNode[] = [];
  for (let l = 0; l < 4; l++)
    for (let i = 0; i < 5 - (l % 2); i++) bricks.push(<B key={`${l}${i}`} p={[i * 0.55 - 1.1 + (l % 2) * 0.27, 0.15 + l * 0.2, 0]} s={[0.5, 0.18, 0.28]} m={m.brick} />);
  const bars: ReactNode[] = [];
  for (let i = 0; i < 6; i++) bars.push(<Cyl key={i} p={[Math.floor(i / 3) * 0.12, 0, (i % 3) * 0.14 - 0.14]} r={0.05} h={5} m={m.rebar} cast={false} />);
  const lights: V3[] = [
    [9, 0, 7],
    [-8, 0, 8],
  ];
  return (
    <>
      <Ball p={[10, 0.4, 3]} r={2.4} m={m.sand} sy={0.45} />
      <Ball p={[11.5, 0.3, 4.2]} r={1.4} m={m.sand} sy={0.4} />
      <group position={[-8, 0, 3]}>{bricks}</group>
      <group position={[-7, 0.1, 6.5]} rotation={[0, 0, Math.PI / 2]}>
        {bars}
      </group>
      <B p={[11, 1.15, -6]} s={[4.4, 2.3, 2.1]} m={m.white} />
      <B p={[11, 1.0, -4.92]} s={[1.0, 1.7, 0.06]} m={m.black} cast={false} />
      <B p={[11, 2.34, -6]} s={[4.5, 0.08, 2.2]} m={m.steel} />
      {lights.map(([x, , z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Cyl p={[0, 2.5, 0]} r={0.06} h={5} m={m.black} />
          <B p={[0, 5.1, 0]} s={[1.0, 0.4, 0.2]} m={m.garden} cast={false} />
          <pointLight position={[0, 4.6, 0.5]} color="#ffd8a0" intensity={14} distance={16} decay={2} />
        </group>
      ))}
    </>
  );
}

function Scene({ progress }: { progress: Progress }) {
  const m = useVillaMaterials();
  const ghost = useRef<THREE.Group>(null);
  const lite = useLite();
  useFrame(() => {
    if (ghost.current) ghost.current.visible = progress.current < 0.9;
  });
  return (
    <>
      <directionalLight
        position={[16, 10, 12]}
        intensity={2.6}
        color="#ffb878"
        castShadow={!lite}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
      />
      <hemisphereLight args={["#ffcf9d", "#2a2018", 0.35]} />
      <SoftGround material={m.soil} radius={40} />
      <Grid
        position={[0, 0.02, 0]}
        args={[80, 80]}
        cellSize={1.2}
        cellThickness={0.6}
        cellColor="#8a6a43"
        sectionSize={6}
        sectionThickness={1.2}
        sectionColor="#c19a6b"
        fadeDistance={48}
        fadeStrength={1.6}
        infiniteGrid
      />
      <group ref={ghost}>
        <Ghost />
      </group>
      <Foundation progress={progress} m={m} />
      {Array.from({ length: FLOORS }).map((_, k) => (
        <Floor key={k} k={k} progress={progress} m={m} />
      ))}
      <Scaffold progress={progress} m={m} />
      <Crane progress={progress} m={m} />
      <Site m={m} />
    </>
  );
}

export default function CivilHero({ progress, tilt }: { progress: Progress; tilt: Tilt }) {
  const lite = useLite();
  const sky = useMemo(() => SKY, []);
  return (
    <>
      <Environment files="/hero/sunset.hdr" environmentIntensity={0.8} />
      <SkyDome stops={sky} />
      <Scene progress={progress} />
      <Sparkles count={lite ? 40 : 100} scale={[44, 14, 40]} position={[0, 6, 0]} size={4} speed={0.3} opacity={0.5} color="#f0cfa0" />
      <OrbitRig progress={progress} tilt={tilt} cfg={RIG} />
      <Post lite={lite} bloom={0.8} threshold={0.92} />
    </>
  );
}
