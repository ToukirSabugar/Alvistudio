"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

const FILES = {
  concreteD: "/hero/concrete-diff.jpg",
  concreteN: "/hero/concrete-nor.jpg",
  plasterD: "/hero/plaster-diff.jpg",
  plasterN: "/hero/plaster-nor.jpg",
  timberD: "/hero/timber-diff.jpg",
  timberN: "/hero/timber-nor.jpg",
  stoneD: "/hero/stone-diff.jpg",
  stoneN: "/hero/stone-nor.jpg",
  pavingD: "/hero/paving-diff.jpg",
  pavingN: "/hero/paving-nor.jpg",
  grassD: "/hero/grass-diff.jpg",
  grassN: "/hero/grass-nor.jpg",
};

function tile(src: THREE.Texture, repeat: [number, number], srgb: boolean, rotate = false) {
  const t = src.clone();
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  if (rotate) {
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
  }
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

/** Real CC0 surface textures (Poly Haven) wrapped into the materials the villa is made of. */
export function useVillaMaterials() {
  const tex = useTexture(FILES);

  return useMemo(() => {
    const surface = (
      d: THREE.Texture,
      n: THREE.Texture,
      repeat: [number, number],
      opts: { color?: string; rough?: number; metal?: number; normal?: number; rotate?: boolean } = {},
    ) =>
      new THREE.MeshStandardMaterial({
        map: tile(d, repeat, true, opts.rotate),
        normalMap: tile(n, repeat, false, opts.rotate),
        normalScale: new THREE.Vector2(opts.normal ?? 0.8, opts.normal ?? 0.8),
        color: opts.color ?? "#ffffff",
        roughness: opts.rough ?? 0.85,
        metalness: opts.metal ?? 0,
      });

    const plain = (color: string, rough = 0.8, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    const glow = (color: string, intensity: number) =>
      new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: color, emissiveIntensity: intensity, toneMapped: false });

    return {
      concrete: surface(tex.concreteD, tex.concreteN, [3, 1.2], { color: "#d8d6d2", rough: 0.88 }),
      plaster: surface(tex.plasterD, tex.plasterN, [2.5, 1.1], { color: "#f1ebe1", rough: 0.92, normal: 0.5 }),
      timber: surface(tex.timberD, tex.timberN, [1.1, 3], { color: "#f0c79a", rough: 0.55, rotate: true }),
      stone: surface(tex.stoneD, tex.stoneN, [1.4, 1.4], { color: "#e6d6bd", rough: 0.9, normal: 1.1 }),
      paving: surface(tex.pavingD, tex.pavingN, [5, 2], { color: "#d9d3c8", rough: 0.75 }),
      grass: surface(tex.grassD, tex.grassN, [26, 26], { color: "#9fbf88", rough: 1, normal: 0.6 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#b9d9e6",
        roughness: 0.03,
        metalness: 0,
        transparent: true,
        opacity: 0.2,
        envMapIntensity: 1.5,
        side: THREE.DoubleSide,
        depthWrite: false,
        ior: 1.5,
      }),
      frame: plain("#101216", 0.4, 0.7),
      water: new THREE.MeshPhysicalMaterial({
        color: "#35a8c9",
        emissive: "#0a4a63",
        emissiveIntensity: 0.9,
        roughness: 0.04,
        metalness: 0.05,
        transparent: true,
        opacity: 0.92,
        envMapIntensity: 1.8,
      }),
      poolEdge: plain("#e9e4da", 0.6),
      warm: glow("#ffc57a", 3.2),
      garden: glow("#ffd9a0", 4),
      sofa: plain("#3b4452", 0.95),
      sofaLight: plain("#cdbfa8", 0.95),
      rug: plain("#d6c8b0", 1),
      wood: plain("#5b3d28", 0.55),
      white: plain("#f4f1ea", 0.5),
      solar: plain("#14233b", 0.25, 0.6),
      leaf: plain("#2f6b3a", 0.9),
      leaf2: plain("#417f47", 0.9),
      shrub: plain("#2a5c34", 0.95),
      trunk: plain("#5a4330", 0.95),
      black: plain("#15171b", 0.6, 0.3),
      brick: surface(tex.stoneD, tex.stoneN, [2.2, 2.2], { color: "#d08a63", rough: 0.95, normal: 1.2 }),
      soil: surface(tex.pavingD, tex.pavingN, [14, 14], { color: "#7a6650", rough: 1 }),
      gravel: surface(tex.pavingD, tex.pavingN, [10, 10], { color: "#5a544c", rough: 0.95 }),
      darkStone: surface(tex.stoneD, tex.stoneN, [1.4, 1.4], { color: "#9c9486", rough: 0.9, normal: 1.1 }),
      steel: plain("#8a8f96", 0.45, 0.8),
      crane: plain("#e0a33a", 0.5, 0.2),
      sand: plain("#c9b48a", 1),
      rebar: plain("#8a5f3e", 0.7, 0.5),
      daylight: glow("#cfe3ff", 1.3),
      bookA: plain("#8f6b3f", 0.8),
      bookB: plain("#2f3d4f", 0.8),
      bookC: plain("#d9cdb6", 0.8),
      art: plain("#c19a6b", 0.7),
      pond: new THREE.MeshPhysicalMaterial({ color: "#10222e", emissive: "#0b3a52", emissiveIntensity: 0.5, roughness: 0.03, metalness: 0.6, envMapIntensity: 2 }),
    };
  }, [tex]);
}

export type VillaMaterials = ReturnType<typeof useVillaMaterials>;
