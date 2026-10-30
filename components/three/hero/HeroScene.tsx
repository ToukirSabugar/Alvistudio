"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { smoothstep } from "../hooks";
import Villa from "./Villa";
import { useVillaMaterials } from "./useVillaMaterials";

type Props = {
  progress: MutableRefObject<number>;
  tilt: MutableRefObject<{ x: number; y: number }>;
};

/** Our own dusk sky: near black overhead and a warm camel glow on the horizon behind the building. */
function Sky() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 512;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#07080b");
    grad.addColorStop(0.36, "#130f0e");
    grad.addColorStop(0.47, "#3b2418");
    grad.addColorStop(0.52, "#b87a44");
    grad.addColorStop(0.545, "#f0b774");
    grad.addColorStop(0.575, "#7a4c2c");
    grad.addColorStop(0.66, "#1a120d");
    grad.addColorStop(1, "#0b0b0b");
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[130, 32, 32]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} toneMapped={false} fog={false} depthWrite={false} />
    </mesh>
  );
}

/** A soft round lawn that fades to nothing at its edge, so the ground never shows a hard line. */
function Ground() {
  const m = useVillaMaterials();
  const fade = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 20, 128, 128, 128);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(0.55, "#fff");
    grad.addColorStop(1, "#000");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  const mat = useMemo(() => {
    const x = m.grass.clone();
    x.alphaMap = fade;
    x.transparent = true;
    x.depthWrite = true;
    return x;
  }, [m, fade]);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow material={mat}>
    <circleGeometry args={[34, 64]} />
  </mesh>;
}

/**
 * Moves the camera around the villa. The cursor sets the angle (left and right swing round the building,
 * up and down tilts the view); on touch screens the tilt hook drifts by itself. Scroll pulls the camera in.
 */
function Rig({ progress, tilt }: Props) {
  const applied = useRef("");
  useFrame((state) => {
    const { camera, size, clock, gl } = state;
    gl.toneMappingExposure = 1.05;
    const p = progress.current;
    const wide = size.width / size.height > 1.25;
    const t = clock.elapsedTime;
    const az = tilt.current.x * 1.15 + Math.sin(t * 0.22) * 0.1;
    const el = 0.26 - tilt.current.y * 0.2;
    const zoom = THREE.MathUtils.lerp(1, 1.12, smoothstep(0, 0.5, p));
    const dist = (wide ? 46 : 58) * zoom;
    const lift = 5.4 + smoothstep(0, 0.6, p) * 1.9;
    camera.position.set(Math.sin(az) * dist * Math.cos(el), lift + Math.sin(el) * dist, Math.cos(az) * dist * Math.cos(el));
    camera.lookAt(0, lift - 0.3, 0);
    // On wide screens push the building to the right so the text sits on the left.
    const key = `${size.width}x${size.height}`;
    if (applied.current !== key && "setViewOffset" in camera) {
      (camera as THREE.PerspectiveCamera).setViewOffset(size.width, size.height, wide ? -size.width * 0.14 : 0, 0, size.width, size.height);
      applied.current = key;
    }
  });
  return null;
}

export default function HeroScene({ progress, tilt }: Props) {
  const lite = useMemo(
    () => window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 700,
    [],
  );

  return (
    <>
      {/* A real sunset sky image lights the building and fills the glass with reflections; the backdrop is our own dusk gradient. */}
      <Environment files="/hero/sunset.hdr" environmentIntensity={0.9} />
      <Sky />
      <directionalLight
        position={[-14, 11, 16]}
        intensity={2.4}
        color="#ffcf9d"
        castShadow={!lite}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
      />
      <hemisphereLight args={["#ffd9b0", "#1c2a1e", 0.35]} />
      <Ground />
      <Villa progress={progress} />
      <Sparkles count={lite ? 40 : 90} scale={[34, 14, 34]} position={[0, 6, 0]} size={3.2} speed={0.25} opacity={0.7} color="#ffd9a0" />
      <Rig progress={progress} tilt={tilt} />
      {!lite && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.92} luminanceSmoothing={0.25} />
          <Vignette eskil={false} offset={0.25} darkness={0.65} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </>
  );
}
