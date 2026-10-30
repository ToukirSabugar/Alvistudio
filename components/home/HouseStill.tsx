// Still front elevation of the story house, shown when 3D is off (reduced motion, no WebGL, weak
// device). Same house as components/three/story/HouseStory.tsx at 50 px per metre.

const X = (m: number) => 450 + m * 50;
const Y = (m: number) => 520 - m * 50;

export function HouseStill() {
  const louvres = Array.from({ length: 18 }, (_, i) => X(-5.8 + i * 0.36));
  const hatch = Array.from({ length: 12 }, (_, i) => X(-6) + i * 14);
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--stage)] lg:justify-end lg:pr-[6%]">
      <svg
        viewBox="0 0 900 600"
        role="img"
        aria-label="Line drawing of the front of a two-storey house with a stone wall, large windows and timber louvres (illustration)"
        className="h-auto w-[min(92vw,900px)] lg:w-[min(62vw,900px)]"
        fill="none"
        strokeLinecap="round"
      >
        <g stroke="#efe8da" strokeWidth="1.4" opacity="0.85">
          {/* plinth, stone wall, glass */}
          <rect x={X(-6.4)} y={Y(0.3)} width={X(6.4) - X(-6.4)} height={15} />
          <rect x={X(-6)} y={Y(3.5)} width={X(-3.2) - X(-6)} height={Y(0.3) - Y(3.5)} />
          <rect x={X(-3.2)} y={Y(3.5)} width={X(6) - X(-3.2)} height={Y(0.3) - Y(3.5)} />
          <path d={`M${X(-0.4)} ${Y(3.5)}V${Y(0.3)}M${X(2.4)} ${Y(3.5)}V${Y(0.3)}`} />
          {/* slabs, upper floor, parapet */}
          <rect x={X(-6.25)} y={Y(3.8)} width={X(6.25) - X(-6.25)} height={15} />
          <rect x={X(-6)} y={Y(7)} width={X(0.6) - X(-6)} height={Y(3.8) - Y(7)} />
          <rect x={X(0.6)} y={Y(7)} width={X(6) - X(0.6)} height={Y(3.8) - Y(7)} />
          <path d={`M${X(2.4)} ${Y(7)}V${Y(3.8)}`} />
          <rect x={X(-6.25)} y={Y(7.8)} width={X(6.25) - X(-6.25)} height={Y(7) - Y(7.8)} />
          <path d={`M${X(-6.25)} ${Y(7.3)}H${X(6.25)}`} />
        </g>
        <g stroke="#c19a6b" strokeWidth="1.2">
          {louvres.map((x) => (
            <path key={x} d={`M${x} ${Y(6.95)}V${Y(3.85)}`} />
          ))}
          {hatch.map((x) => (
            <path key={x} d={`M${x} ${Y(0.3)}L${Math.min(x + 60, X(-3.2))} ${Y(0.3) - Math.min(60, X(-3.2) - x)}`} opacity="0.5" />
          ))}
          {/* ground line and a dimension line above the roof */}
          <path d="M30 520H870" />
          <path d={`M${X(-6.25)} 95H${X(6.25)}M${X(-6.25)} 85V105M${X(6.25)} 85V105`} opacity="0.8" />
          <path d={`M${X(-6.25)} 95l14 -6M${X(-6.25)} 95l14 6M${X(6.25)} 95l-14 -6M${X(6.25)} 95l-14 6`} opacity="0.8" />
        </g>
        {/* trees */}
        <g stroke="#efe8da" strokeWidth="1.1" opacity="0.5">
          <circle cx={X(-7.9)} cy={Y(4.6)} r="62" />
          <path d={`M${X(-7.9)} ${Y(0)}V${Y(3.4)}`} />
          <circle cx={X(7.8)} cy={Y(3.9)} r="50" />
          <path d={`M${X(7.8)} ${Y(0)}V${Y(2.9)}`} />
        </g>
        {/* warm windows */}
        <rect x={X(-3.2) + 2} y={Y(3.5) + 2} width={X(6) - X(-3.2) - 4} height={Y(0.3) - Y(3.5) - 4} fill="#ffb066" opacity="0.12" />
        <rect x={X(0.6) + 2} y={Y(7) + 2} width={X(6) - X(0.6) - 4} height={Y(3.8) - Y(7) - 4} fill="#ffb066" opacity="0.1" />
      </svg>
    </div>
  );
}
