"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { smoothstep } from "../hooks";
import { useVillaMaterials, type VillaMaterials } from "./useVillaMaterials";
import { B, Ball, Cyl, OrbitRig, Post, SkyDome, SoftGround, setGlow, useLite, type Progress, type RigConfig, type SkyStop, type Tilt, type V3 } from "./common";

// Architecture: a cantilevered house beside a still pond. Dusk turns to night as you scroll and the upper
// volume slides out over the water, so the lit glass and timber start to glow.

const SKY: SkyStop[] = [
  [0, "#05070d"],
  [0.3, "#0c1220"],
  [0.43, "#1d2a3d"],
  [0.5, "#5b5a62"],
  [0.535, "#d9a06a"],
  [0.56, "#f2c48c"],
  [0.6, "#6a4a36"],
  [0.7, "#141418"],
  [1, "#0a0a0c"],
];

const RIG: RigConfig = {
  dist: (p, wide) => (wide ? 40 : 52) - smoothstep(0, 1, p) * 9,
  lift: (p) => 4.6 - smoothstep(0, 1, p) * 1.6,
  look: () => 3.6,
  az: -0.4,
  azRange: 0.9,
  spin: (p) => smoothstep(0, 1, p) * 0.5,
  el: 0.2,
  shiftX: 0.17,
  shiftY: 0.13,
  exposure: 1.1,
};

function Curtain({ m, x, y, z, w, h, n }: { m: VillaMaterials; x: number; y: number; z: number; w: number; h: number; n: number }) {
  const bars: ReactNode[] = [];
  for (let i = 0; i <= n; i++) bars.push(<B key={i} p={[x - w / 2 + (w / n) * i, y, z]} s={[0.07, h, 0.1]} m={m.frame} />);
  return (
    <>
      <B p={[x, y, z]} s={[w, h, 0.04]} m={m.glass} cast={false} receive={false} />
      {bars}
      <B p={[x, y + h / 2, z]} s={[w + 0.07, 0.1, 0.12]} m={m.frame} />
      <B p={[x, y - h / 2, z]} s={[w + 0.07, 0.1, 0.12]} m={m.frame} />
    </>
  );
}

function Interior({ m }: { m: VillaMaterials }) {
  return (
    <>
      <B p={[-1.1, 0.56, 0]} s={[6.6, 0.1, 5.4]} m={m.timber} receive />
      <B p={[-2.4, 0.85, 0.6]} s={[2.6, 0.5, 1]} m={m.sofa} />
      <B p={[-2.4, 1.15, 0.2]} s={[2.6, 0.55, 0.22]} m={m.sofa} />
      <B p={[-2.4, 0.7, 1.9]} s={[1.3, 0.28, 0.7]} m={m.wood} />
      <B p={[0.9, 1.0, -1.2]} s={[1.8, 0.07, 0.9]} m={m.wood} />
      <B p={[-1.1, 1.6, -2.78]} s={[6, 1.7, 0.05]} m={m.black} cast={false} />
      <Ball p={[0.9, 2.5, -1.2]} r={0.22} m={m.warm} cast={false} />
      <Ball p={[-2.4, 2.7, 0.6]} r={0.2} m={m.warm} cast={false} />
      <B p={[-1.1, 3.55, 0]} s={[6.4, 0.05, 0.3]} m={m.warm} cast={false} />
    </>
  );
}

function Tree({ m, p, s = 1 }: { m: VillaMaterials; p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 1.2, 0]} r={0.2} h={2.4} m={m.trunk} />
      <Ball p={[0, 3.3, 0]} r={1.7} m={m.leaf} sy={0.95} />
      <Ball p={[0.8, 2.8, 0.3]} r={1.2} m={m.leaf2} />
    </group>
  );
}

function House({ progress }: { progress: Progress }) {
  const m = useVillaMaterials();
  const up = useRef<THREE.Group>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const roomA = useRef<THREE.PointLight>(null);
  const roomB = useRef<THREE.PointLight>(null);
  const lite = useLite();

  useFrame((state) => {
    const p = progress.current;
    const slide = smoothstep(0.1, 0.7, p);
    const night = smoothstep(0.1, 0.85, p);
    if (up.current) up.current.position.x = -1.5 * slide;
    if (sun.current) sun.current.intensity = THREE.MathUtils.lerp(2.3, 0.35, night);
    if (roomA.current) roomA.current.intensity = THREE.MathUtils.lerp(7, 26, night);
    if (roomB.current) roomB.current.intensity = THREE.MathUtils.lerp(4, 16, night);
    setGlow(m.warm, THREE.MathUtils.lerp(2.4, 6, night));
    setGlow(m.garden, THREE.MathUtils.lerp(3, 7, night));
    state.scene.environmentIntensity = THREE.MathUtils.lerp(0.85, 0.25, night);
  });

  const fins: ReactNode[] = [];
  for (let i = 0; i < 21; i++) fins.push(<B key={i} p={[-7.4 + i * 0.46, 5.4, 2.8]} s={[0.12, 2.8, 0.14]} m={m.timber} />);
  const stones: V3[] = [
    [1.0, 0.14, 5.4],
    [1.3, 0.14, 6.4],
    [0.9, 0.14, 7.4],
    [1.3, 0.14, 8.4],
  ];

  return (
    <>
      <directionalLight
        ref={sun}
        position={[-12, 12, 16]}
        intensity={2.3}
        color="#ffc896"
        castShadow={!lite}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
      />
      <hemisphereLight args={["#9fb4d8", "#1a1612", 0.3]} />

      <SoftGround material={m.gravel} radius={36} />

      {/* podium and pond */}
      <B p={[0, 0.25, 0]} s={[15, 0.5, 9]} m={m.darkStone} />
      <B p={[-3.4, 0.07, 6.9]} s={[14.5, 0.1, 5.4]} m={m.pond} cast={false} />
      <B p={[-3.4, 0.03, 6.9]} s={[15, 0.06, 5.9]} m={m.black} cast={false} />
      {stones.map((p, i) => (
        <B key={i} p={p} s={[1.5, 0.12, 0.8]} m={m.stone} cast={false} />
      ))}

      {/* ground floor: glass living room and a stone core */}
      <B p={[3.7, 2.1, -0.2]} s={[2.8, 3.2, 6]} m={m.darkStone} />
      <B p={[0.3, 2.1, -3.0]} s={[9.6, 3.2, 0.3]} m={m.plaster} />
      <B p={[-4.4, 2.1, -0.2]} s={[0.25, 3.2, 5.6]} m={m.plaster} />
      <Curtain m={m} x={-1.1} y={2.1} z={2.8} w={6.8} h={3.2} n={5} />
      <Interior m={m} />
      <B p={[0.5, 3.85, 0]} s={[10.6, 0.3, 6.6]} m={m.concrete} />
      <pointLight ref={roomA} position={[-2.2, 2.5, 0.8]} color="#ffc27a" intensity={7} distance={10} decay={2} />
      <pointLight ref={roomB} position={[0.8, 2.6, -1.2]} color="#ffc27a" intensity={4} distance={8} decay={2} />

      {/* upper volume: timber box that slides out over the pond */}
      <group ref={up}>
        <B p={[-3, 5.4, 0]} s={[10, 2.8, 5.4]} m={m.timber} />
        <B p={[-2.6, 5.6, 2.72]} s={[6.4, 1.2, 0.06]} m={m.glass} cast={false} receive={false} />
        <B p={[-2.6, 5.6, 2.76]} s={[6.5, 0.07, 0.07]} m={m.frame} />
        <B p={[-2.6, 5.0, 2.76]} s={[6.5, 0.07, 0.07]} m={m.frame} />
        <B p={[-2.6, 6.2, 2.76]} s={[6.5, 0.07, 0.07]} m={m.frame} />
        <B p={[-2.6, 5.02, 2.7]} s={[6.2, 0.05, 0.2]} m={m.warm} cast={false} />
        <B p={[-7.95, 5.6, 0.2]} s={[0.06, 1.2, 4.6]} m={m.glass} cast={false} receive={false} />
        {fins}
        <B p={[-3, 7.0, 0]} s={[10.8, 0.3, 6.2]} m={m.concrete} />
        <B p={[-3, 7.22, 3.0]} s={[10.8, 0.16, 0.1]} m={m.white} />
        {[-6.4, -4.8, -3.2].map((x) => (
          <B key={x} p={[x, 7.4, -1.2]} s={[1.4, 0.05, 1.7]} m={m.solar} rot={[-0.35, 0, 0]} />
        ))}
      </group>

      {/* entry steps, planting, lamps */}
      {[0, 1].map((i) => (
        <B key={i} p={[-1.1, 0.52 - i * 0.14, 3.15 + i * 0.5]} s={[2.4, 0.1, 0.5]} m={m.stone} />
      ))}
      {[6.2, 7.6, 9].map((x, i) => (
        <Ball key={x} p={[x, 0.65, 3.5 + (i % 2) * 0.4]} r={0.6} m={m.shrub} sy={0.8} />
      ))}
      <Tree m={m} p={[10.5, 0.03, 0]} s={1.3} />
      <Tree m={m} p={[-12, 0.03, -3]} s={1.2} />
      <Tree m={m} p={[3, 0.03, -9]} s={1.4} />
      <Tree m={m} p={[-6, 0.03, -10]} s={1.25} />
      {[9.4, 11.6].map((x) => (
        <Ball key={x} p={[x, 2.4, 4.6]} r={0.7} m={m.leaf2} sy={3.2} />
      ))}
      {[-9.5, -6, -2.5, 1].map((x) => (
        <group key={x} position={[x, 0.18, 9.9]}>
          <Cyl p={[0, 0.2, 0]} r={0.05} h={0.4} m={m.black} />
          <Ball p={[0, 0.5, 0]} r={0.1} m={m.garden} cast={false} />
        </group>
      ))}
    </>
  );
}

export default function ArchitectureHero({ progress, tilt }: { progress: Progress; tilt: Tilt }) {
  const lite = useLite();
  const sky = useMemo(() => SKY, []);
  return (
    <>
      <Environment files="/hero/sunset.hdr" environmentIntensity={0.85} />
      <SkyDome stops={sky} progress={progress} dimTo={0.3} />
      <House progress={progress} />
      <Sparkles count={lite ? 30 : 70} scale={[34, 12, 30]} position={[0, 5, 2]} size={3} speed={0.2} opacity={0.6} color="#ffd9a0" />
      <OrbitRig progress={progress} tilt={tilt} cfg={RIG} />
      <Post lite={lite} bloom={0.95} threshold={0.9} />
    </>
  );
}
