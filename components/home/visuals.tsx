import type { CSSProperties } from "react";

// Drawn (no images, no 3D) visuals for the materials story. Every one is rendered in its FINISHED
// state; MaterialsStory animates it from "empty" to this state while the visitor scrolls, and
// leaves it finished under reduced motion. The data-* attributes are the animation hooks.

function noise(freq: number, opacity: number) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>` +
    `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/>` +
    `<feColorMatrix type='saturate' values='0'/></filter>` +
    `<rect width='100%' height='100%' filter='url(#n)' opacity='${opacity}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Concrete: a formwork panel. A wet, dark pour is covered top to bottom by cured, speckled concrete. */
export function ConcreteVisual() {
  const wet: CSSProperties = {
    backgroundColor: "#55524c",
    backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 40%), ${noise(0.012, 0.5)}`,
  };
  const cured: CSSProperties = {
    backgroundColor: "#c9c4b8",
    backgroundImage: [
      "radial-gradient(circle at 50% 50%, rgba(11,11,11,0.38) 3px, transparent 4.5px)",
      `${noise(0.9, 0.55)}`,
      `${noise(0.02, 0.35)}`,
    ].join(", "),
    backgroundSize: "25% 20%, 240px 240px, 240px 240px",
    clipPath: "inset(0 0 calc(100% - var(--p) * 1%) 0)",
  };
  return (
    <div
      data-pour
      className="relative h-full w-full overflow-hidden border border-ink/40"
      style={{ ["--p" as string]: 100 } as CSSProperties}
    >
      <div className="absolute inset-0" style={wet} />
      <div className="absolute inset-0" style={cured} />
      <div
        className="absolute inset-x-0 h-[3px] bg-camel shadow-[0_0_14px_2px_rgba(193,154,107,0.7)]"
        style={{ top: "calc(var(--p) * 1% - 3px)" }}
      />
    </div>
  );
}

const BRICK = ["#9b4f37", "#a65a40", "#8f4731", "#b0654a", "#a05238"];
const ROWS = 10;

/** Brick: running bond. Row 0 is the top course; the wall is built from the bottom row up. */
export function BrickVisual() {
  return (
    <div className="grid h-full w-full grid-rows-[repeat(10,minmax(0,1fr))] gap-[3px] overflow-hidden bg-[#cfc7b6] p-[3px]">
      {Array.from({ length: ROWS }, (_, r) => {
        const offset = r % 2 === 1;
        const cells = offset ? [1, 2, 2, 2, 2, 2, 1] : [2, 2, 2, 2, 2, 2];
        return (
          <div key={r} data-row className="grid grid-cols-12 gap-[3px]">
            {cells.map((span, c) => (
              <span
                key={c}
                data-brick
                className="block"
                style={{ gridColumn: `span ${span}`, backgroundColor: BRICK[(r * 3 + c * 2) % BRICK.length] }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

const BARS = [60, 100, 140, 180, 220, 260, 300, 340];

/** Steel: a reinforcement mat plus stirrup in section. Each bar is drawn with stroke-dashoffset. */
export function SteelVisual() {
  const common = { pathLength: 1, strokeDasharray: 1, fill: "none", strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <rect x="30" y="30" width="340" height="340" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="4 6" />
      {BARS.map((v) => (
        <path key={`h${v}`} data-bar d={`M40 ${v} H360`} stroke="currentColor" strokeWidth="3.5" {...common} />
      ))}
      {BARS.map((v) => (
        <path key={`v${v}`} data-bar d={`M${v} 40 V360`} stroke="currentColor" strokeWidth="3.5" {...common} />
      ))}
      <path data-bar d="M100 100 H300 V300 H100 Z" stroke="#c19a6b" strokeWidth="3" {...common} />
      {BARS.flatMap((x) => BARS.map((y) => ({ x, y }))).map(({ x, y }) => (
        <circle key={`${x}-${y}`} data-tie cx={x} cy={y} r="4.5" fill="#c19a6b" stroke="currentColor" strokeWidth="1.2" />
      ))}
    </svg>
  );
}

/** Glass and timber: planks stacked on one side, glass panes slid into place on the other. */
export function GlassTimberVisual() {
  const grain = (i: number): CSSProperties => ({
    backgroundColor: ["#8a5a35", "#7c4f2d", "#936340", "#855630"][i % 4],
    backgroundImage:
      "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 9px), linear-gradient(180deg, rgba(255,255,255,0.16), rgba(0,0,0,0.2))",
  });
  return (
    <div className="grid h-full w-full grid-cols-2 gap-3 overflow-hidden">
      <div className="flex flex-col gap-[3px]">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} data-plank className="block flex-1" style={grain(i)} />
        ))}
      </div>
      <div className="flex gap-2 border border-camel/70 p-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            data-pane
            className="relative block flex-1 overflow-hidden border border-paper/30"
            style={{
              backgroundImage:
                "linear-gradient(115deg, rgba(255,255,255,0.28) 0 12%, rgba(255,255,255,0) 12% 30%, rgba(255,255,255,0.12) 30% 38%, rgba(255,255,255,0) 38%), linear-gradient(180deg, rgba(150,190,215,0.35), rgba(60,100,130,0.45))",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** A finished living room in one-point perspective. Light is warmed and the view pushed in on scroll. */
export function RoomVisual() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#14110d]">
      <div data-room className="absolute inset-0">
        <svg viewBox="0 0 400 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id="room-glow" cx="50%" cy="45%" r="60%">
              <stop offset="0" stopColor="#ffd08a" stopOpacity="0.85" />
              <stop offset="1" stopColor="#ffd08a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="room-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1d2a4a" />
              <stop offset="1" stopColor="#e0925a" />
            </linearGradient>
          </defs>
          {/* walls, ceiling, floor */}
          <polygon points="0,0 400,0 300,70 100,70" fill="#26211b" />
          <polygon points="100,70 300,70 300,210 100,210" fill="#3a332a" />
          <polygon points="0,0 100,70 100,210 0,300" fill="#2f2921" />
          <polygon points="400,0 300,70 300,210 400,300" fill="#2b251e" />
          <polygon points="0,300 100,210 300,210 400,300" fill="#6b4a2e" />
          {/* floor boards */}
          {[130, 160, 190, 240].map((x) => (
            <line key={x} x1={x} y1="210" x2={x < 200 ? x - 90 : x + 90} y2="300" stroke="#000" strokeOpacity="0.18" />
          ))}
          {/* window with evening sky */}
          <rect x="140" y="95" width="120" height="75" fill="url(#room-sky)" stroke="#c19a6b" strokeWidth="2" />
          <line x1="200" y1="95" x2="200" y2="170" stroke="#c19a6b" strokeWidth="2" />
          <line x1="140" y1="132" x2="260" y2="132" stroke="#c19a6b" strokeWidth="1.5" />
          {/* rug */}
          <polygon points="130,262 270,262 300,292 100,292" fill="#c19a6b" fillOpacity="0.85" />
          {/* sofa */}
          <rect x="150" y="196" width="110" height="26" fill="#44454c" />
          <rect x="150" y="182" width="110" height="18" fill="#393a41" />
          <rect x="144" y="190" width="12" height="32" fill="#2f3036" />
          <rect x="254" y="190" width="12" height="32" fill="#2f3036" />
          {/* low table */}
          <rect x="176" y="238" width="58" height="8" fill="#8a5a35" />
          <rect x="180" y="246" width="4" height="10" fill="#6f4727" />
          <rect x="226" y="246" width="4" height="10" fill="#6f4727" />
          {/* floor lamp */}
          <line x1="298" y1="212" x2="298" y2="130" stroke="#2b2824" strokeWidth="2.5" />
          <circle cx="298" cy="122" r="9" fill="#ffe2b0" />
          {/* pendant */}
          <line x1="200" y1="0" x2="200" y2="40" stroke="#2b2824" strokeWidth="1.5" />
          <circle cx="200" cy="46" r="8" fill="#ffe2b0" />
          <g data-glow>
            <rect width="400" height="300" fill="url(#room-glow)" />
            <polygon points="140,170 260,170 330,300 70,300" fill="#ffd08a" fillOpacity="0.08" />
          </g>
        </svg>
      </div>
      <div data-dim className="pointer-events-none absolute inset-0 bg-ink opacity-0" />
    </div>
  );
}
