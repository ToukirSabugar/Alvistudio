"use client";

// "From plot to home": a stylised two-storey house (built in code, not a real project) that is
// surveyed, planned, framed, clad and furnished as the visitor scrolls. Timing comes from lib/story.ts.

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { at, build } from "@/lib/story";
import { B, DrawLines, Layer, rect, type Block, type P, type Palette, type Seg, type V3 } from "./parts";

const STAGE = "#0d0c0a";
const LINE = "#efe8da";
const CAMEL = "#c19a6b";

const std = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) => () =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, transparent: true, opacity: 0, ...extra });

const palette: Palette = {
  concrete: std("#b9b2a4"),
  plaster: std("#e8e1d2"),
  stone: std("#8a8174", { roughness: 0.95 }),
  timber: std("#9a6b43", { roughness: 0.7 }),
  metal: std("#2a2826", { roughness: 0.4, metalness: 0.6 }),
  glass: std("#1f2629", { roughness: 0.08, metalness: 0.3, emissive: new THREE.Color("#ffb066"), emissiveIntensity: 0 }),
  fabric: std("#cdbfa6", { roughness: 1 }),
  walnut: std("#6b4a2f", { roughness: 0.6 }),
  rug: std("#7d6650", { roughness: 1 }),
  brass: std("#c19a6b", { roughness: 0.35, metalness: 0.7, emissive: new THREE.Color("#ffcf8a"), emissiveIntensity: 0 }),
  leaf: std("#454d3a", { roughness: 0.95, flatShading: true }),
};

// ---------- Geometry (metres-ish). Ground floor 0.3 to 3.5, first floor 3.8 to 7.0, upper floor cantilevers to z = 6.

const XS = [-6, -2, 2, 6];
const ZS = [-4.5, 0, 4.5];
const columns = (y0: number, y1: number): Block[] =>
  XS.flatMap((x) => ZS.map((z) => B([x - 0.18, y0, z - 0.18], [x + 0.18, y1, z + 0.18], "concrete")));
const COLS_G = columns(0.3, 3.5);
const COLS_F = columns(3.8, 7.0);
const PLINTH = [B([-6.4, 0, -4.9], [6.4, 0.3, 4.9], "stone"), B([-3, 0, 4.9], [1.5, 0.15, 5.7], "stone")];
const SLAB_1 = [B([-6.25, 3.5, -4.8], [6.25, 3.8, 6.2], "concrete")];
const SLAB_R = [B([-6.25, 7.0, -4.8], [6.25, 7.3, 6.2], "concrete")];

const WALLS: Block[] = [
  // ground floor
  B([-6, 0.3, -4.62], [6, 3.5, -4.38], "plaster"),
  B([-6.12, 0.3, -4.5], [-5.88, 3.5, 4.5], "plaster"),
  B([5.88, 0.3, -4.5], [6.12, 3.5, 1.2], "plaster"),
  B([-6, 0.3, 4.36], [-3.2, 3.5, 4.62], "stone"),
  // first floor
  B([-6, 3.8, -4.62], [6, 7.0, -4.38], "plaster"),
  B([-6.12, 3.8, -4.5], [-5.88, 7.0, 6.0], "plaster"),
  B([5.88, 3.8, -4.5], [6.12, 7.0, 6.0], "plaster"),
  B([-6, 3.8, 5.82], [0.6, 7.0, 6.02], "plaster"),
  // parapet
  B([-6.25, 7.3, -4.8], [6.25, 7.8, -4.6], "plaster"),
  B([-6.25, 7.3, 6.0], [6.25, 7.8, 6.2], "plaster"),
  B([-6.25, 7.3, -4.6], [-6.05, 7.8, 6.0], "plaster"),
  B([6.05, 7.3, -4.6], [6.25, 7.8, 6.0], "plaster"),
];
const LOUVRES: Block[] = Array.from({ length: 18 }, (_, i) => {
  const x = -5.8 + i * 0.36;
  return B([x, 3.85, 6.08], [x + 0.12, 6.95, 6.3], "timber");
});
const GLASS: Block[] = [
  B([-3.2, 0.3, 4.47], [6, 3.5, 4.53], "glass"),
  B([0.6, 3.8, 5.89], [5.88, 7.0, 5.95], "glass"),
  B([5.96, 0.3, 1.2], [6.02, 3.5, 4.4], "glass"),
];
const FRAMES: Block[] = [
  ...[-0.4, 2.4].map((x) => B([x - 0.04, 0.3, 4.44], [x + 0.04, 3.5, 4.56], "metal")),
  ...[2.4].map((x) => B([x - 0.04, 3.8, 5.86], [x + 0.04, 7.0, 5.98], "metal")),
];

const FURNITURE: Block[] = [
  B([-2.2, 0.3, -2.6], [2.2, 0.33, 0.8], "rug"),
  // sofa
  B([-1.8, 0.3, -3.4], [1.8, 0.72, -2.5], "fabric"),
  B([-1.8, 0.72, -3.62], [1.8, 1.3, -3.32], "fabric"),
  B([-2.05, 0.3, -3.62], [-1.75, 0.95, -2.5], "fabric"),
  B([1.75, 0.3, -3.62], [2.05, 0.95, -2.5], "fabric"),
  // coffee table
  B([-0.6, 0.3, -1.5], [0.6, 0.6, -1.0], "walnut"),
  B([-0.85, 0.6, -1.65], [0.85, 0.68, -0.85], "walnut"),
  // armchair
  B([2.6, 0.3, -1.6], [3.5, 0.72, -0.6], "fabric"),
  B([3.3, 0.72, -1.6], [3.55, 1.25, -0.6], "fabric"),
  // shelving on the back wall
  ...[-3.5, -1.2, 1.2, 3.5].map((x) => B([x - 0.04, 0.3, -4.36], [x + 0.04, 2.8, -4.0], "walnut")),
  ...[1.0, 1.7, 2.4].map((y) => B([-3.5, y, -4.36], [3.5, y + 0.05, -4.0], "walnut")),
  // dining
  B([-5.2, 1.0, -1.8], [-3.7, 1.07, 0.6], "walnut"),
  B([-4.6, 0.3, -0.9], [-4.3, 1.0, -0.3], "walnut"),
  // plant
  B([-2.95, 0.3, 0.9], [-2.45, 0.8, 1.4], "stone", "cyl"),
  B([-3.25, 0.8, 0.6], [-2.15, 1.9, 1.7], "leaf", "ico"),
];
const LAMP: Block[] = [B([-0.35, 2.32, -1.6], [0.35, 2.46, -0.9], "brass", "cyl")];

const TREES: Block[] = (
  [
    [-9, -5.5, 1.4],
    [8.6, 2.5, 1.1],
    [-8.4, 6.5, 1.25],
    [9.2, -6, 1.5],
  ] as [number, number, number][]
).flatMap(([x, z, s]) => [
  B([x - 0.12, 0, z - 0.12], [x + 0.12, 2.2 * s, z + 0.12], "walnut"),
  B([x - 1.3 * s, 1.6 * s, z - 1.3 * s], [x + 1.3 * s, 4.2 * s, z + 1.3 * s], "leaf", "ico"),
]);

// ---------- Line drawings on the ground (survey and plan).

function contours(): Seg[] {
  const out: Seg[] = [];
  for (const [c, amp, k] of [
    [-13, 1.2, 0.18],
    [-17, 1.6, 0.14],
    [-22, 2.2, 0.11],
    [13, 1.1, 0.2],
    [17.5, 1.7, 0.15],
    [23, 2.4, 0.1],
  ]) {
    for (let x = -34; x < 34; x += 1.2) {
      const z0 = c + amp * Math.sin(x * k + c);
      const z1 = c + amp * Math.sin((x + 1.2) * k + c);
      out.push([x, 0.01, z0, x + 1.2, 0.01, z1]);
    }
  }
  return out;
}

function dimension(a: V3, b: V3, tick: V3): Seg[] {
  const [ax, ay, az] = a;
  const [bx, by, bz] = b;
  const [tx, , tz] = tick;
  const len = Math.hypot(bx - ax, bz - az);
  const ux = (bx - ax) / len;
  const uz = (bz - az) / len;
  const h = 0.45;
  return [
    [ax, ay, az, bx, by, bz],
    [ax - tx, ay, az - tz, ax + tx, ay, az + tz],
    [bx - tx, by, bz - tz, bx + tx, by, bz + tz],
    [ax, ay, az, ax + (ux + tx * 0.6) * h, ay, az + (uz + tz * 0.6) * h],
    [ax, ay, az, ax + (ux - tx * 0.6) * h, ay, az + (uz - tz * 0.6) * h],
    [bx, by, bz, bx + (-ux + tx * 0.6) * h, by, bz + (-uz + tz * 0.6) * h],
    [bx, by, bz, bx + (-ux - tx * 0.6) * h, by, bz + (-uz - tz * 0.6) * h],
  ];
}

const PLOT: Seg[] = rect(-10, -8, 10, 8);
const SURVEY: Seg[] = [
  ...dimension([-10, 0.02, 9.4], [10, 0.02, 9.4], [0, 0, 0.5]),
  ...dimension([11.4, 0.02, -8], [11.4, 0.02, 8], [0.5, 0, 0]),
  ...[
    [-10, -8],
    [10, -8],
    [10, 8],
    [-10, 8],
  ].flatMap(([x, z]) => [
    [x, 0, z, x, 1.4, z] as Seg,
    [x - 0.5, 0.02, z, x + 0.5, 0.02, z] as Seg,
    [x, 0.02, z - 0.5, x, 0.02, z + 0.5] as Seg,
  ]),
  // setback line inside the plot
  ...rect(-7.5, -6, 7.5, 6.6, 0.015),
];

function arc(cx: number, cz: number, r: number, a0: number, a1: number): Seg[] {
  const out: Seg[] = [];
  const n = 8;
  for (let i = 0; i < n; i++) {
    const t0 = a0 + ((a1 - a0) * i) / n;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / n;
    out.push([cx + r * Math.cos(t0), 0.03, cz + r * Math.sin(t0), cx + r * Math.cos(t1), 0.03, cz + r * Math.sin(t1)]);
  }
  return out;
}

const PLAN: Seg[] = [
  ...rect(-6, -4.5, 6, 4.5, 0.03),
  [-3.2, 0.03, -4.5, -3.2, 0.03, -1.0],
  [-3.2, 0.03, 0.2, -3.2, 0.03, 4.5],
  [3.4, 0.03, -1.8, 6, 0.03, -1.8],
  [3.4, 0.03, -4.5, 3.4, 0.03, -2.6],
  // stair: two strings and treads
  [-5.6, 0.03, -4.2, -5.6, 0.03, -1.4],
  [-3.7, 0.03, -4.2, -3.7, 0.03, -1.4],
  ...Array.from({ length: 9 }, (_, i): Seg => [-5.6, 0.03, -4.2 + i * 0.35, -3.7, 0.03, -4.2 + i * 0.35]),
  // door swings
  ...arc(-3.2, -1.0, 1.2, Math.PI / 2, 0),
  ...arc(3.4, -1.8, 0.8, Math.PI, Math.PI * 1.5),
  // furniture hints
  ...rect(-1.8, -3.6, 1.8, -2.5, 0.03),
  ...rect(-0.85, -1.65, 0.85, -0.85, 0.03),
  ...rect(-5.2, -1.8, -3.7, 0.6, 0.03),
];

const GRID: Seg[] = (() => {
  const out: Seg[] = [];
  for (let i = -36; i <= 36; i += 3) {
    out.push([i, 0, -36, i, 0, 36], [-36, 0, i, 36, 0, i]);
  }
  return out;
})();

// ---------- Camera: one keyframe per chapter, reached when that chapter's text is centred.

type Key = { pos: V3; look: V3; fov: number; wide: number; shift: number };
const KEYS: Key[] = [
  { pos: [24, 28, 30], look: [0, 0, 0], fov: 34, wide: 1.6, shift: 0.14 },
  { pos: [15, 21, 23], look: [0, 0, 0.5], fov: 34, wide: 1.6, shift: 0.14 },
  { pos: [2, 25, 11], look: [0, 0, 0.5], fov: 34, wide: 1.6, shift: 0.14 },
  { pos: [-17, 9, 19], look: [0, 3, 0], fov: 34, wide: 1.6, shift: 0.12 },
  { pos: [15, 7, 28], look: [0, 3.4, 0.5], fov: 34, wide: 1.6, shift: 0.12 },
  { pos: [0.6, 1.85, 2.4], look: [0, 1.4, -3.2], fov: 58, wide: 1, shift: 0.06 },
  { pos: [-15, 6.5, 25], look: [0, 3.2, 0.5], fov: 34, wide: 1.6, shift: 0.12 },
];
const ease = (x: number) => x * x * (3 - 2 * x);

function setFov(cam: THREE.PerspectiveCamera, fov: number) {
  if (Math.abs(cam.fov - fov) < 0.01) return;
  cam.fov = fov;
  cam.updateProjectionMatrix();
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function CameraRig({ p, tilt }: { p: P; tilt: MutableRefObject<{ x: number; y: number }> }) {
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => () => (camera as THREE.PerspectiveCamera).clearViewOffset(), [camera]);
  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const t = Math.min(KEYS.length - 1, Math.max(0, p.current * (KEYS.length - 1)));
    const i = Math.min(KEYS.length - 2, Math.floor(t));
    const f = ease(t - i);
    const a = KEYS[i];
    const b = KEYS[i + 1];
    const portrait = size.width < size.height;
    const wide = portrait ? lerp(a.wide, b.wide, f) : 1;
    look.set(lerp(a.look[0], b.look[0], f), lerp(a.look[1], b.look[1], f), lerp(a.look[2], b.look[2], f));
    const px = lerp(a.pos[0], b.pos[0], f);
    const py = lerp(a.pos[1], b.pos[1], f);
    const pz = lerp(a.pos[2], b.pos[2], f);
    // A little parallax from the cursor (or a slow drift on touch), smaller when indoors.
    const sway = wide > 1.01 || a.fov < 50 ? 1 : 0.25;
    cam.position.set(
      look.x + (px - look.x) * wide + tilt.current.x * 1.2 * sway,
      look.y + (py - look.y) * wide - tilt.current.y * 0.6 * sway,
      look.z + (pz - look.z) * wide,
    );
    cam.lookAt(look);
    setFov(cam, lerp(a.fov, b.fov, f) + (portrait ? 10 : 0));
    // Wide screens: the text sits on the left, so the house is drawn right of centre.
    // Portrait screens: the text sits at the bottom, so the house is drawn in the upper half.
    const shift = portrait ? 0 : lerp(a.shift, b.shift, f);
    const lift = portrait ? 0.17 * (wide > 1.01 ? 1 : 0.4) : 0;
    cam.setViewOffset(size.width, size.height, -size.width * shift, size.height * lift, size.width, size.height);
  });
  return null;
}

function Lights({ p }: { p: P }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const room = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const v = p.current;
    const dusk = build(v, at(6) - 0.03, at(6) + 0.08);
    const indoor = build(v, at(5) - 0.02, at(5) + 0.07) * (1 - dusk * 0.4);
    if (sun.current) sun.current.intensity = lerp(2.4, 0.5, dusk);
    if (hemi.current) hemi.current.intensity = lerp(0.9, 0.35, dusk);
    if (lamp.current) lamp.current.intensity = indoor * 4.5 + dusk * 5;
    if (room.current) room.current.intensity = indoor * 2.4 + dusk * 8;
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#f3e6d0", STAGE, 0.9]} />
      <directionalLight
        ref={sun}
        position={[14, 20, 12]}
        color="#ffe7c4"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0005}
      />
      <pointLight ref={lamp} position={[0, 2.1, -1.25]} color="#ffc98a" distance={9} decay={1.6} intensity={0} />
      <pointLight ref={room} position={[1, 2.6, 1.5]} color="#ffd6a3" distance={14} decay={1.4} intensity={0} />
    </>
  );
}

export default function HouseStory({ progress, tilt }: { progress: P; tilt: MutableRefObject<{ x: number; y: number }> }) {
  const p = progress;

  return (
    <>
      <color attach="background" args={[STAGE]} />
      <fog attach="fog" args={[STAGE, 45, 130]} />
      <Lights p={p} />

      <mesh rotation-x={-Math.PI / 2} position-y={-0.01} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#141210" roughness={1} />
      </mesh>

      {/* Survey grid: present from the start, quieter once the house stands. */}
      <DrawLines segs={GRID} color={LINE} p={p} draw={() => 1} opacity={(v) => 0.1 - 0.05 * build(v, at(4), at(5))} />
      {/* I. The plot */}
      <DrawLines segs={PLOT} color={CAMEL} p={p} draw={(v) => build(v, at(1) - 0.03, at(1) + 0.08)} opacity={() => 0.95} />
      <DrawLines segs={contours()} color={LINE} p={p} draw={(v) => build(v, at(1), at(2) - 0.02)} opacity={(v) => 0.32 - 0.12 * build(v, at(4), at(5))} />
      <DrawLines segs={SURVEY} color={CAMEL} p={p} draw={(v) => build(v, at(1) + 0.04, at(2) - 0.02)} opacity={(v) => 0.85 - 0.6 * build(v, at(3), at(4))} />
      {/* II. The plan */}
      <DrawLines segs={PLAN} color={CAMEL} p={p} draw={(v) => build(v, at(2), at(3) - 0.02)} opacity={(v) => 1 - 0.75 * build(v, at(3) + 0.02, at(3) + 0.08)} />

      {/* III. The structure: plinth, ground-floor columns, slab, first-floor columns, roof */}
      <Layer blocks={PLINTH} palette={palette} p={p} edge={(v) => build(v, at(3) - 0.03, at(3)) * 0.8} fill={(v) => build(v, at(3) - 0.025, at(3) + 0.01)} />
      <Layer
        blocks={COLS_G}
        palette={palette}
        p={p}
        grow={(v, i) => build(v, at(3) - 0.01 + i * 0.001, at(3) + 0.02 + i * 0.001)}
        edge={() => 0.9}
        fill={(v) => 0.8 * build(v, at(3) + 0.01, at(3) + 0.04) + 0.2 * build(v, at(4), at(4) + 0.04)}
      />
      <Layer blocks={SLAB_1} palette={palette} p={p} edge={(v) => build(v, at(3) + 0.02, at(3) + 0.035) * 0.9} fill={(v) => 0.4 * build(v, at(3) + 0.025, at(3) + 0.045) + 0.6 * build(v, at(4), at(4) + 0.05)} />
      <Layer
        blocks={COLS_F}
        palette={palette}
        p={p}
        grow={(v, i) => build(v, at(3) + 0.035 + i * 0.001, at(3) + 0.06 + i * 0.001)}
        edge={() => 0.9}
        fill={(v) => 0.8 * build(v, at(3) + 0.05, at(3) + 0.075) + 0.2 * build(v, at(4), at(4) + 0.04)}
      />
      <Layer blocks={SLAB_R} palette={palette} p={p} edge={(v) => build(v, at(3) + 0.06, at(3) + 0.075) * 0.9} fill={(v) => 0.4 * build(v, at(3) + 0.065, at(3) + 0.085) + 0.6 * build(v, at(4), at(4) + 0.05)} />

      {/* IV. The facade: outlines first, then plaster, stone, timber and glass */}
      <Layer
        blocks={WALLS}
        palette={palette}
        p={p}
        edge={(v) => build(v, at(4) - 0.02, at(4) + 0.02) * (1 - 0.55 * build(v, at(4) + 0.07, at(5)))}
        fill={(v) => build(v, at(4) + 0.015, at(4) + 0.07)}
      />
      <Layer blocks={LOUVRES} palette={palette} p={p} grow={(v, i) => build(v, at(4) + 0.02 + i * 0.0015, at(4) + 0.05 + i * 0.0015)} edge={(v) => 0.7 * build(v, at(4) + 0.02, at(4) + 0.05)} fill={(v) => build(v, at(4) + 0.04, at(4) + 0.08)} />
      <Layer blocks={FRAMES} palette={palette} p={p} edge={(v) => 0.8 * build(v, at(4) + 0.02, at(4) + 0.05)} fill={(v) => build(v, at(4) + 0.03, at(4) + 0.07)} />
      <Layer
        blocks={GLASS}
        palette={palette}
        p={p}
        edge={(v) => 0.5 * build(v, at(4) + 0.03, at(4) + 0.06)}
        // Glass clears while the camera passes through it in V, then returns, glowing at dusk.
        fill={(v) => 0.55 * build(v, at(4) + 0.04, at(4) + 0.08) * (1 - 0.9 * build(v, at(5) - 0.04, at(5) + 0.01) + 0.9 * build(v, at(6) - 0.02, at(6) + 0.04))}
        tick={(v, m) => {
          m.glass.emissiveIntensity = 1.6 * build(v, at(6), at(6) + 0.07);
        }}
      />
      <Layer blocks={TREES} palette={palette} p={p} grow={(v, i) => build(v, at(4) + 0.02 + i * 0.006, at(4) + 0.07 + i * 0.006)} edge={(v) => 0.5 * build(v, at(4) + 0.02, at(4) + 0.06)} fill={(v) => build(v, at(4) + 0.05, at(4) + 0.1)} />

      {/* V. The interior: furniture outlines show through the glass, then fill once inside */}
      <Layer blocks={FURNITURE} palette={palette} p={p} edge={(v) => 0.85 * build(v, at(4) + 0.08, at(5) - 0.01) * (1 - 0.5 * build(v, at(5) + 0.06, at(6)))} fill={(v) => build(v, at(5) + 0.01, at(5) + 0.09)} />
      <Layer
        blocks={LAMP}
        palette={palette}
        p={p}
        edge={(v) => 0.85 * build(v, at(5) - 0.02, at(5) + 0.03)}
        fill={(v) => build(v, at(5) + 0.02, at(5) + 0.07)}
        tick={(v, m) => {
          m.brass.emissiveIntensity = 1.2 * build(v, at(5) + 0.03, at(5) + 0.08);
        }}
      />
      <DrawLines segs={[[0, 3.5, -1.25, 0, 2.46, -1.25]]} color={CAMEL} p={p} draw={(v) => build(v, at(5) - 0.02, at(5) + 0.02)} opacity={() => 0.9} />

      <CameraRig p={p} tilt={tilt} />
    </>
  );
}
