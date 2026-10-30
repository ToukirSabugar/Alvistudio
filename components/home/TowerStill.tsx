// Still picture of the three-floor tower. It is the fallback for WebGL failure, reduced motion
// and loading, so it must look finished on its own. Purely decorative: the real words are HTML.

const S = 40;
const CX = 200;
const CY = 238;
const COS = 0.866;
const SIN = 0.5;

const P = (x: number, y: number, z: number) => `${(CX + (x - z) * COS * S).toFixed(1)},${(CY + (x + z) * SIN * S - y * S).toFixed(1)}`;
const poly = (pts: [number, number, number][]) => pts.map((p) => P(...p)).join(" ");

type Face = { pts: [number, number, number][]; fill: string; stroke?: string; sw?: number };

function boxFaces(x0: number, y0: number, z0: number, w: number, h: number, d: number, tones: [string, string, string], stroke?: string): Face[] {
  const [top, left, right] = tones;
  return [
    { pts: [[x0, y0, z0 + d], [x0 + w, y0, z0 + d], [x0 + w, y0 + h, z0 + d], [x0, y0 + h, z0 + d]], fill: left, stroke },
    { pts: [[x0 + w, y0, z0], [x0 + w, y0, z0 + d], [x0 + w, y0 + h, z0 + d], [x0 + w, y0 + h, z0]], fill: right, stroke },
    { pts: [[x0, y0 + h, z0], [x0 + w, y0 + h, z0], [x0 + w, y0 + h, z0 + d], [x0, y0 + h, z0 + d]], fill: top, stroke },
  ];
}

const SLAB_TONES: [string, string, string] = ["#e3dfd3", "#b3aea1", "#8d887d"];
const GLASS_TONES: [string, string, string] = ["rgba(169,195,209,0.10)", "rgba(169,195,209,0.20)", "rgba(169,195,209,0.30)"];
const CAMEL = "#c19a6b";

const w = 3;
const d = 3;
const slab = 0.14;
const h = 1;
const pitch = slab + h + 0.62; // visible gap: the floors are mid-separation

export function TowerStill({ className = "" }: { className?: string }) {
  const floors = [0, 1, 2].map((i) => {
    const y = i * pitch;
    const faces: Face[] = [...boxFaces(0, y, 0, w, slab, d, SLAB_TONES, CAMEL)];
    if (i === 1) {
      faces.push(...boxFaces(0.3, y + slab, 1.5, 1.3, 0.34, 0.9, ["#5a5b62", "#3c3d42", "#2f3034"]));
      faces.push(...boxFaces(1.9, y + slab, 0.4, 0.5, 0.2, 0.9, ["#a4724a", "#8a5a35", "#6f4727"]));
    }
    faces.push(...boxFaces(0.05, y + slab, 0.05, w - 0.1, h, d - 0.1, GLASS_TONES, CAMEL));
    if (i === 2) faces.push(...boxFaces(-0.3, y + slab + h, -0.3, w + 0.6, slab, d + 0.6, SLAB_TONES, CAMEL));
    if (i === 0) faces.unshift(...boxFaces(-0.2, y - 0.12, -0.2, w + 0.4, 0.12, d + 0.4, SLAB_TONES, CAMEL));
    return faces;
  });

  return (
    <svg
      viewBox="0 0 400 400"
      className={`h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="still-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={CAMEL} stopOpacity="0.4" />
          <stop offset="1" stopColor={CAMEL} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={CX} cy={CY + 3 * S * 0.5 + 4} rx="170" ry="52" fill="url(#still-glow)" />
      <ellipse cx={CX} cy={CY + 3 * S * 0.5 + 4} rx="118" ry="34" fill="none" stroke={CAMEL} strokeOpacity="0.45" />
      <line x1={CX} y1="36" x2={CX} y2="372" stroke={CAMEL} strokeOpacity="0.35" strokeDasharray="3 6" />
      {floors.map((faces, i) => (
        <g key={i}>
          {faces.map((f, j) => (
            <polygon
              key={j}
              points={poly(f.pts)}
              fill={f.fill}
              stroke={f.stroke}
              strokeWidth={f.stroke ? 0.9 : 0}
              strokeLinejoin="round"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
