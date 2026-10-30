"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { smoothstep } from "../hooks";

export type V3 = [number, number, number];
export type Progress = MutableRefObject<number>;
export type Tilt = MutableRefObject<{ x: number; y: number }>;

const unitBox = new THREE.BoxGeometry(1, 1, 1);
const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 20);
const unitSphere = new THREE.IcosahedronGeometry(1, 2);

export function B({ p, s, m, rot, cast = true, receive = true }: { p: V3; s: V3; m: THREE.Material; rot?: V3; cast?: boolean; receive?: boolean }) {
  return <mesh geometry={unitBox} material={m} position={p} scale={s} rotation={rot} castShadow={cast} receiveShadow={receive} />;
}
export function Cyl({ p, r, h, m, cast = true }: { p: V3; r: number; h: number; m: THREE.Material; cast?: boolean }) {
  return <mesh geometry={unitCyl} material={m} position={p} scale={[r, h, r]} castShadow={cast} receiveShadow />;
}
export function Ball({ p, r, m, sy = 1, cast = true }: { p: V3; r: number; m: THREE.Material; sy?: number; cast?: boolean }) {
  return <mesh geometry={unitSphere} material={m} position={p} scale={[r, r * sy, r]} castShadow={cast} receiveShadow />;
}

/** Sets how strongly a glowing material shines. Used from useFrame to turn lights on with scroll. */
export function setGlow(mat: THREE.MeshStandardMaterial, intensity: number) {
  mat.emissiveIntensity = intensity;
}

/** Touch screens and small windows get the lighter scene: no shadows, no glow pass. */
export function useLite() {
  return useMemo(() => window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 700, []);
}

export type SkyStop = [number, string];

/**
 * A painted sky dome. Optionally darkens with scroll (`dimTo` is the brightness at the end), which is how a
 * scene goes from dusk to night without loading a second sky.
 */
export function SkyDome({ stops, progress, dimTo = 1 }: { stops: SkyStop[]; progress?: Progress; dimTo?: number }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 512;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 512);
    for (const [at, color] of stops) grad.addColorStop(at, color);
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [stops]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, toneMapped: false, fog: false, depthWrite: false }), [tex]);
  useFrame(() => {
    if (!progress) return;
    mat.color.setScalar(THREE.MathUtils.lerp(1, dimTo, smoothstep(0.05, 0.8, progress.current)));
  });
  return (
    <mesh scale={[-1, 1, 1]} material={mat}>
      <sphereGeometry args={[130, 32, 32]} />
    </mesh>
  );
}

/** A round patch of ground whose edge fades to nothing, so it never shows a hard line. */
export function SoftGround({ material, radius = 34, y = -0.01 }: { material: THREE.MeshStandardMaterial; radius?: number; y?: number }) {
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
    const x = material.clone();
    x.alphaMap = fade;
    x.transparent = true;
    return x;
  }, [material, fade]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow material={mat}>
      <circleGeometry args={[radius, 64]} />
    </mesh>
  );
}

export type RigConfig = {
  /** Camera distance from the middle, by scroll progress, for wide and narrow screens. */
  dist: (p: number, wide: boolean) => number;
  /** Camera height by scroll progress. */
  lift: (p: number) => number;
  /** Height the camera looks at by scroll progress. */
  look: (p: number) => number;
  /** Resting angle, how far the cursor swings it, and an extra turn driven by scroll. */
  az: number;
  azRange: number;
  spin?: (p: number) => number;
  /** Resting elevation. */
  el: number;
  /** Share of the width the building moves right on wide screens, and share of the height it moves up on narrow ones. */
  shiftX: number;
  shiftY: number;
  exposure?: number;
};

/** Moves the camera around the middle of the scene. The cursor sets the angle; touch screens drift by themselves. */
export function OrbitRig({ progress, tilt, cfg }: { progress: Progress; tilt: Tilt; cfg: RigConfig }) {
  const applied = useRef("");
  useFrame((state) => {
    const { camera, size, clock, gl } = state;
    gl.toneMappingExposure = cfg.exposure ?? 1.05;
    const p = progress.current;
    const wide = size.width / size.height > 1.25;
    const az = cfg.az + tilt.current.x * cfg.azRange + Math.sin(clock.elapsedTime * 0.22) * 0.07 + (cfg.spin?.(p) ?? 0);
    const el = cfg.el - tilt.current.y * 0.18;
    const dist = cfg.dist(p, wide);
    const lift = cfg.lift(p);
    camera.position.set(Math.sin(az) * dist * Math.cos(el), lift + Math.sin(el) * dist, Math.cos(az) * dist * Math.cos(el));
    camera.lookAt(0, cfg.look(p), 0);
    const key = `${size.width}x${size.height}`;
    if (applied.current !== key && "setViewOffset" in camera) {
      (camera as THREE.PerspectiveCamera).setViewOffset(
        size.width,
        size.height,
        wide ? -size.width * cfg.shiftX : 0,
        wide ? 0 : size.height * cfg.shiftY,
        size.width,
        size.height,
      );
      applied.current = key;
    }
  });
  return null;
}

/** Glow pass, soft vignette and film-like tone mapping. Skipped on the lite scene. */
export function Post({ lite, bloom = 0.85, threshold = 0.92 }: { lite: boolean; bloom?: number; threshold?: number }) {
  if (lite) return null;
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={bloom} luminanceThreshold={threshold} luminanceSmoothing={0.25} />
      <Vignette eskil={false} offset={0.25} darkness={0.65} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
