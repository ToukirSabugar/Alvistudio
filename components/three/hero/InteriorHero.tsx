"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { smoothstep } from "../hooks";
import { useVillaMaterials, type VillaMaterials } from "./useVillaMaterials";
import { B, Ball, Cyl, OrbitRig, Post, SkyDome, SoftGround, setGlow, useLite, type Progress, type RigConfig, type SkyStop, type Tilt } from "./common";

// Interior: a furnished living and dining room cut open like a model on a glowing plinth. Scroll turns the
// lamps on, lowers the pendants and wipes new wall finishes (timber, then stone) onto the walls.

const SKY: SkyStop[] = [
  [0, "#070605"],
  [0.4, "#120c08"],
  [0.48, "#24160d"],
  [0.54, "#5b3a20"],
  [0.6, "#1a110a"],
  [1, "#080706"],
];

const RIG: RigConfig = {
  dist: (p, wide) => (wide ? 25 : 31) - smoothstep(0, 1, p) * 7,
  lift: (p) => 8 - smoothstep(0, 1, p) * 3,
  look: () => 1.3,
  az: 0.55,
  azRange: 0.55,
  spin: (p) => smoothstep(0, 1, p) * 0.2,
  el: 0.3,
  shiftX: 0.16,
  shiftY: 0.14,
  exposure: 1.15,
};

const WALL = 3.2;

function Books({ m }: { m: VillaMaterials }) {
  const out: ReactNode[] = [];
  const mats = [m.bookA, m.bookB, m.bookC, m.art];
  for (let row = 0; row < 4; row++) {
    let z = 0.3;
    for (let i = 0; i < 9; i++) {
      const h = 0.34 + ((i * 7 + row * 3) % 5) * 0.045;
      const w = 0.08 + ((i * 3 + row) % 3) * 0.03;
      out.push(<B key={`${row}-${i}`} p={[0, 0.5 + row * 0.55 + h / 2, z + w / 2]} s={[0.3, h, w]} m={mats[(i + row) % 4]} cast={false} />);
      z += w + 0.03;
    }
  }
  return <group position={[-3.55, 0, -0.2]}>{out}</group>;
}

function Room({ progress }: { progress: Progress }) {
  const m = useVillaMaterials();
  const timberWall = useRef<THREE.Group>(null);
  const stoneWall = useRef<THREE.Group>(null);
  const pendants = useRef<THREE.Group>(null);
  const floorLamp = useRef<THREE.PointLight>(null);
  const tableLamp = useRef<THREE.PointLight>(null);
  const pendant = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const p = progress.current;
    const on = smoothstep(0.05, 0.6, p);
    if (timberWall.current) timberWall.current.scale.y = Math.max(0.001, smoothstep(0.2, 0.5, p));
    if (stoneWall.current) stoneWall.current.scale.y = Math.max(0.001, smoothstep(0.45, 0.78, p));
    if (pendants.current) pendants.current.position.y = (1 - smoothstep(0.08, 0.5, p)) * 1.1;
    if (floorLamp.current) floorLamp.current.intensity = THREE.MathUtils.lerp(2, 12, on);
    if (tableLamp.current) tableLamp.current.intensity = THREE.MathUtils.lerp(1.5, 8, on);
    if (pendant.current) pendant.current.intensity = THREE.MathUtils.lerp(2, 16, on);
    setGlow(m.warm, THREE.MathUtils.lerp(0.7, 4.2, on));
    state.scene.environmentIntensity = 0.3;
  });

  return (
    <>
      <directionalLight position={[7, 10, 9]} intensity={0.8} color="#ffd8b0" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={1} shadow-camera-far={40} shadow-bias={-0.0005} />
      <hemisphereLight args={["#ffd9b0", "#120c08", 0.25]} />

      {/* plinth and floor */}
      <B p={[0, -0.32, 0]} s={[8.8, 0.34, 7.2]} m={m.darkStone} />
      <B p={[0, -0.08, 0]} s={[8.4, 0.16, 6.8]} m={m.timber} />

      {/* walls: plaster, with a timber panel and a stone wall wiped on as you scroll */}
      <B p={[0, WALL / 2, -3.3]} s={[8.4, WALL, 0.25]} m={m.plaster} />
      <B p={[-4.075, WALL / 2, 0]} s={[0.25, WALL, 6.85]} m={m.plaster} />
      <group ref={timberWall} position={[-1.6, 0, -3.14]}>
        <B p={[0, WALL / 2, 0]} s={[4.4, WALL - 0.1, 0.06]} m={m.timber} />
      </group>
      <group ref={stoneWall} position={[-3.92, 0, 0.1]}>
        <B p={[0, WALL / 2, 0]} s={[0.06, WALL - 0.1, 6.5]} m={m.stone} />
      </group>
      <B p={[0, WALL + 0.02, -3.3]} s={[8.4, 0.06, 0.25]} m={m.white} cast={false} />
      <B p={[0, 3.1, -3.12]} s={[8, 0.05, 0.12]} m={m.warm} cast={false} />
      <B p={[-3.96, 3.1, 0]} s={[0.12, 0.05, 6.4]} m={m.warm} cast={false} />

      {/* window */}
      <B p={[2.4, 1.85, -3.16]} s={[2.5, 1.9, 0.05]} m={m.daylight} cast={false} />
      {[-0.62, 0.62].map((dx) => (
        <B key={dx} p={[2.4 + dx, 1.85, -3.1]} s={[0.05, 1.9, 0.06]} m={m.frame} cast={false} />
      ))}
      <B p={[2.4, 1.85, -3.1]} s={[2.6, 0.05, 0.06]} m={m.frame} cast={false} />

      {/* art above the sofa */}
      {[-2.7, -1.6, -0.5].map((x, i) => (
        <group key={x} position={[x, 1.95 + (i === 1 ? 0.15 : 0), -3.0]}>
          <B p={[0, 0, 0]} s={[0.85, i === 1 ? 1.3 : 1.05, 0.05]} m={m.black} cast={false} />
          <B p={[0, 0, 0.03]} s={[0.7, i === 1 ? 1.15 : 0.9, 0.02]} m={i === 1 ? m.art : m.bookC} cast={false} />
        </group>
      ))}

      {/* sofa, rug, table, lamps */}
      <B p={[-0.8, 0.015, 0.1]} s={[4.8, 0.03, 3.6]} m={m.rug} />
      <B p={[-1.6, 0.3, -2.3]} s={[3.2, 0.5, 1.1]} m={m.sofa} />
      <B p={[-1.6, 0.78, -2.78]} s={[3.2, 0.62, 0.26]} m={m.sofa} />
      <B p={[-3.3, 0.5, -2.3]} s={[0.26, 0.75, 1.1]} m={m.sofa} />
      <B p={[0.1, 0.5, -2.3]} s={[0.26, 0.75, 1.1]} m={m.sofa} />
      <B p={[-2.5, 0.72, -2.4]} s={[0.55, 0.5, 0.18]} m={m.art} rot={[0.2, 0.3, 0]} />
      <B p={[-0.7, 0.72, -2.4]} s={[0.55, 0.5, 0.18]} m={m.sofaLight} rot={[0.2, -0.3, 0]} />
      <B p={[-1.6, 0.23, -0.6]} s={[1.5, 0.46, 0.85]} m={m.wood} />
      <B p={[-1.6, 0.5, -0.6]} s={[1.0, 0.06, 0.5]} m={m.white} />
      <B p={[-3.2, 0.2, 1.5]} s={[1.0, 0.4, 1.0]} m={m.sofaLight} />

      <Cyl p={[0.6, 0.3, -2.5]} r={0.3} h={0.6} m={m.wood} />
      <Cyl p={[0.6, 0.85, -2.5]} r={0.04} h={0.5} m={m.black} />
      <Ball p={[0.6, 1.2, -2.5]} r={0.26} m={m.warm} cast={false} />
      <pointLight ref={tableLamp} position={[0.6, 1.3, -2.3]} color="#ffc27a" intensity={1.5} distance={7} decay={2} />

      <Cyl p={[-3.5, 1.15, -1.6]} r={0.04} h={2.3} m={m.black} />
      <Ball p={[-3.5, 2.35, -1.6]} r={0.34} m={m.warm} sy={0.8} cast={false} />
      <pointLight ref={floorLamp} position={[-3.3, 2.3, -1.4]} color="#ffc27a" intensity={2} distance={9} decay={2} />

      <Books m={m} />
      <B p={[-3.78, 1.2, -0.2]} s={[0.05, 2.5, 2.8]} m={m.wood} cast={false} />
      <B p={[-3.55, 0.25, -0.2]} s={[0.46, 0.5, 2.8]} m={m.wood} />

      {/* dining */}
      <B p={[2.2, 0.76, 0.7]} s={[2.3, 0.07, 1.1]} m={m.wood} />
      {[
        [1.2, 0.3],
        [3.2, 0.3],
        [1.2, 1.1],
        [3.2, 1.1],
      ].map(([x, z]) => (
        <B key={`${x}${z}`} p={[x, 0.38, z]} s={[0.07, 0.76, 0.07]} m={m.black} />
      ))}
      {[
        [1.6, -0.2],
        [2.8, -0.2],
        [1.6, 1.6],
        [2.8, 1.6],
      ].map(([x, z]) => (
        <group key={`${x}${z}`}>
          <B p={[x, 0.45, z]} s={[0.5, 0.07, 0.5]} m={m.sofaLight} />
          <B p={[x, 0.22, z]} s={[0.06, 0.44, 0.06]} m={m.black} />
        </group>
      ))}
      <group ref={pendants}>
        {[1.35, 2.2, 3.05].map((x) => (
          <group key={x}>
            <B p={[x, 3.1, 0.7]} s={[0.012, 1.6, 0.012]} m={m.black} cast={false} />
            <Ball p={[x, 2.25, 0.7]} r={0.22} m={m.warm} cast={false} />
          </group>
        ))}
        <pointLight ref={pendant} position={[2.2, 2.0, 0.7]} color="#ffc27a" intensity={2} distance={8} decay={2} />
      </group>

      {/* plants */}
      <Cyl p={[3.5, 0.3, -2.5]} r={0.34} h={0.6} m={m.white} />
      <Ball p={[3.5, 1.2, -2.5]} r={0.6} m={m.leaf2} sy={1.7} />
      <Cyl p={[-3.4, 0.25, 2.6]} r={0.28} h={0.5} m={m.white} />
      <Ball p={[-3.4, 0.85, 2.6]} r={0.45} m={m.leaf} sy={1.4} />
    </>
  );
}

export default function InteriorHero({ progress, tilt }: { progress: Progress; tilt: Tilt }) {
  const lite = useLite();
  const m = useVillaMaterials();
  const sky = useMemo(() => SKY, []);
  return (
    <>
      <Environment files="/hero/sunset.hdr" environmentIntensity={0.3} />
      <SkyDome stops={sky} />
      <SoftGround material={m.frame} radius={18} y={-0.75} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]} material={m.garden}>
        <ringGeometry args={[6.1, 6.2, 96]} />
      </mesh>
      <Room progress={progress} />
      <Sparkles count={lite ? 30 : 70} scale={[16, 7, 14]} position={[0, 2.5, 0]} size={2.6} speed={0.2} opacity={0.55} color="#ffd9a0" />
      <OrbitRig progress={progress} tilt={tilt} cfg={RIG} />
      <Post lite={lite} bloom={1} threshold={0.88} />
    </>
  );
}
