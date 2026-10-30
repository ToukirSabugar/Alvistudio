"use client";

// Building parts for the "From plot to home" scene. Everything animates from one scroll-progress ref
// inside useFrame (no React re-renders): lines draw themselves in order, blocks rise, then fill.

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

export type P = MutableRefObject<number>;

// Per-frame changes go through these helpers, so components never assign to memoised objects directly.
function setLineOpacity(m: THREE.LineBasicMaterial, o: number) {
  m.opacity = o;
}
function setSolidOpacity(m: THREE.MeshStandardMaterial, o: number) {
  m.opacity = o;
  m.transparent = o < 0.995;
  m.depthWrite = o > 0.6;
}
export type V3 = [number, number, number];
export type Seg = [number, number, number, number, number, number];

/** Split segments into short pieces so a partial draw range grows smoothly instead of in jumps. */
function pieces(segs: Seg[], step = 0.6): number[] {
  const out: number[] = [];
  for (const [ax, ay, az, bx, by, bz] of segs) {
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay, bz - az) / step));
    for (let i = 0; i < n; i++) {
      const t0 = i / n;
      const t1 = (i + 1) / n;
      out.push(ax + (bx - ax) * t0, ay + (by - ay) * t0, az + (bz - az) * t0);
      out.push(ax + (bx - ax) * t1, ay + (by - ay) * t1, az + (bz - az) * t1);
    }
  }
  return out;
}

/** Line drawing that draws itself: draw(p) 0..1 is how much is drawn, opacity(p) how strong. */
export function DrawLines({
  segs,
  color,
  p,
  draw,
  opacity,
}: {
  segs: Seg[];
  color: string;
  p: P;
  draw: (p: number) => number;
  opacity: (p: number) => number;
}) {
  const { geo, count } = useMemo(() => {
    const pos = pieces(segs);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return { geo: g, count: pos.length / 3 };
  }, [segs]);
  const mat = useMemo(
    () => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }),
    [color],
  );
  const line = useRef<THREE.LineSegments>(null);
  useEffect(() => () => (geo.dispose(), mat.dispose()), [geo, mat]);
  useFrame(() => {
    const d = draw(p.current);
    const o = opacity(p.current);
    geo.setDrawRange(0, Math.floor((d * count) / 2) * 2);
    setLineOpacity(mat, o);
    if (line.current) line.current.visible = d > 0.001 && o > 0.001;
  });
  return <lineSegments ref={line} geometry={geo} material={mat} frustumCulled={false} />;
}

export type Kind = "box" | "cyl" | "ico";
export type Block = { min: V3; max: V3; mat: string; kind?: Kind };
export type Palette = Record<string, () => THREE.MeshStandardMaterial>;

function geometryFor(kind: Kind, w: number, h: number, d: number) {
  if (kind === "cyl") return new THREE.CylinderGeometry(w / 2, w / 2, h, 20, 1);
  if (kind === "ico") {
    const g = new THREE.IcosahedronGeometry(0.5, 1);
    g.scale(w, h, d);
    return g;
  }
  return new THREE.BoxGeometry(w, h, d);
}

/**
 * A set of blocks sharing one timing. Each block has an outline (edge) and a solid (fill).
 * grow(p, i) raises block i from the ground (1 = full height). Materials are per layer, so two
 * layers can fade differently.
 */
export function Layer({
  blocks,
  palette,
  p,
  edge,
  fill,
  grow,
  edgeColor = "#efe8da",
  tick,
}: {
  blocks: Block[];
  palette: Palette;
  p: P;
  edge: (p: number) => number;
  fill: (p: number) => number;
  grow?: (p: number, i: number) => number;
  edgeColor?: string;
  /** Extra per-frame changes, for example a glowing window. */
  tick?: (p: number, mats: Record<string, THREE.MeshStandardMaterial>) => void;
}) {
  const mats = useMemo(() => {
    const m: Record<string, THREE.MeshStandardMaterial> = {};
    for (const b of blocks) m[b.mat] ??= palette[b.mat]();
    return m;
  }, [blocks, palette]);
  const lineMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0, depthWrite: false }),
    [edgeColor],
  );
  const parts = useMemo(
    () =>
      blocks.map((b) => {
        const w = b.max[0] - b.min[0];
        const h = b.max[1] - b.min[1];
        const d = b.max[2] - b.min[2];
        const geo = geometryFor(b.kind ?? "box", w, h, d);
        geo.translate(0, h / 2, 0); // pivot at the base, so scale.y raises it from the ground
        const edges = new THREE.EdgesGeometry(geo, 30);
        const base: V3 = [(b.min[0] + b.max[0]) / 2, b.min[1], (b.min[2] + b.max[2]) / 2];
        return { geo, edges, base, mat: mats[b.mat] };
      }),
    [blocks, mats],
  );
  useEffect(
    () => () => {
      parts.forEach((x) => (x.geo.dispose(), x.edges.dispose()));
      Object.values(mats).forEach((m) => m.dispose());
      lineMat.dispose();
    },
    [parts, mats, lineMat],
  );

  const groups = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    const v = p.current;
    const e = edge(v);
    const f = fill(v);
    setLineOpacity(lineMat, e);
    for (const m of Object.values(mats)) setSolidOpacity(m, f);
    tick?.(v, mats);
    groups.current.forEach((g, i) => {
      if (!g) return;
      const s = grow ? grow(v, i) : 1;
      g.visible = s > 0.001 && (e > 0.001 || f > 0.001);
      g.scale.set(1, Math.max(s, 0.0001), 1);
      const mesh = g.children[0] as THREE.Mesh;
      mesh.visible = f > 0.002;
      mesh.castShadow = f > 0.9;
      (g.children[1] as THREE.LineSegments).visible = e > 0.002;
    });
  });

  return (
    <>
      {parts.map((x, i) => (
        <group
          key={i}
          position={x.base}
          ref={(g) => {
            groups.current[i] = g;
          }}
        >
          <mesh geometry={x.geo} material={x.mat} receiveShadow />
          <lineSegments geometry={x.edges} material={lineMat} />
        </group>
      ))}
    </>
  );
}

/** Box from corner to corner, the way an architect measures it. */
export const B = (min: V3, max: V3, mat: string, kind?: Kind): Block => ({ min, max, mat, kind });

/** Outline of a rectangle on a horizontal plane at height y. */
export function rect(x0: number, z0: number, x1: number, z1: number, y = 0.02): Seg[] {
  return [
    [x0, y, z0, x1, y, z0],
    [x1, y, z0, x1, y, z1],
    [x1, y, z1, x0, y, z1],
    [x0, y, z1, x0, y, z0],
  ];
}
