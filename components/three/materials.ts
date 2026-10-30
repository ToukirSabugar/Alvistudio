import * as THREE from "three";

/** Tower dimensions in scene units. */
export const W = 4;
export const D = 3;
export const SLAB = 0.14;
export const H = 1;
export const STEP = H + SLAB;
/** Extra vertical gap between floors when fully separated. */
export const GAP = 1.1;

const CAMEL = "#c19a6b";

function radialTexture(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Everything the tower needs: shared unit geometries (scaled per mesh) and a small set of
 * materials, so the whole scene stays at a few dozen draw calls. Call dispose() on unmount.
 */
export function createKit() {
  const box = new THREE.BoxGeometry(1, 1, 1);
  const edges = new THREE.EdgesGeometry(box);
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 12);
  const sphere = new THREE.SphereGeometry(1, 16, 12);
  const disc = new THREE.CircleGeometry(1, 48);
  const ring = new THREE.RingGeometry(0.985, 1, 96);

  const concrete = new THREE.MeshStandardMaterial({ color: "#d8d3c7", roughness: 0.85, metalness: 0 });
  const steel = new THREE.MeshStandardMaterial({ color: "#2b2824", roughness: 0.38, metalness: 0.7 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: "#a9c3d1",
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    opacity: 0.3,
    envMapIntensity: 1.8,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    depthWrite: false,
  });
  const timber = new THREE.MeshStandardMaterial({ color: "#8a5a35", roughness: 0.6, metalness: 0 });
  const fabric = new THREE.MeshStandardMaterial({ color: "#3c3d42", roughness: 0.95, metalness: 0 });
  const rug = new THREE.MeshStandardMaterial({ color: CAMEL, roughness: 1, metalness: 0 });
  const lamp = new THREE.MeshStandardMaterial({
    color: "#ffe2b0",
    emissive: "#ffc477",
    emissiveIntensity: 2.2,
    roughness: 0.5,
  });
  const line = new THREE.LineBasicMaterial({ color: CAMEL, transparent: true, opacity: 0.9 });
  const ringLine = new THREE.MeshBasicMaterial({
    color: CAMEL,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const shadowTex = radialTexture([
    [0, "rgba(0,0,0,0.75)"],
    [0.55, "rgba(0,0,0,0.25)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  const glowTex = radialTexture([
    [0, "rgba(193,154,107,0.55)"],
    [0.45, "rgba(193,154,107,0.16)"],
    [1, "rgba(193,154,107,0)"],
  ]);
  const shadow = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const glow = new THREE.MeshBasicMaterial({
    map: glowTex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const geos = [box, edges, cyl, sphere, disc, ring];
  const mats = [concrete, steel, glass, timber, fabric, rug, lamp, line, ringLine, shadow, glow];
  return {
    box,
    edges,
    cyl,
    sphere,
    disc,
    ring,
    concrete,
    steel,
    glass,
    timber,
    fabric,
    rug,
    lamp,
    line,
    ringLine,
    shadow,
    glow,
    dispose() {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      shadowTex.dispose();
      glowTex.dispose();
    },
  };
}

export type Kit = ReturnType<typeof createKit>;
