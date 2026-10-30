// Still drawings shown while a hero loads, when WebGL fails, and under reduced motion.
// Each one tells the same story as its 3D scene. Decorative: the real text is HTML beside them.
const CAMEL = "#c19a6b";
const PAPER = "#f4f1ea";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid meet" className="h-full w-full" aria-hidden focusable="false">
      <defs>
        <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(193,154,107,0.12)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="800" height="520" fill="url(#bp-grid)" />
      {children}
    </svg>
  );
}

/** Building with foundation, columns, floors, glass and roof. */
export function AssemblyFallback() {
  const cols = [250, 400, 550];
  return (
    <Frame>
      <rect x="190" y="330" width="420" height="22" fill="#7d7a73" />
      {cols.map((x) => (
        <rect key={x} x={x - 6} y="100" width="12" height="230" fill="#bdb7aa" />
      ))}
      {[220, 275, 330].map((y) => (
        <rect key={y} x="210" y={y - 6} width="380" height="8" fill={y === 330 ? "#7d7a73" : "#d9d3c5"} />
      ))}
      <rect x="214" y="106" width="372" height="114" fill="rgba(159,196,216,0.28)" stroke={PAPER} strokeOpacity="0.5" />
      <rect x="214" y="224" width="372" height="102" fill="rgba(159,196,216,0.28)" stroke={PAPER} strokeOpacity="0.5" />
      <rect x="195" y="88" width="410" height="14" fill={CAMEL} />
      <path d="M400 106V326M214 165H586M214 275H586" stroke={PAPER} strokeOpacity="0.25" fill="none" />
    </Frame>
  );
}

/** Furnished living room seen through a dissolving facade. */
export function RoomFallback() {
  return (
    <Frame>
      <path d="M170 90H630V380H170Z" fill="#e9e4d9" />
      <path d="M170 380H630L690 440H110Z" fill="#8a6a47" />
      <path d="M170 90L110 40H690L630 90Z" fill="#f4f1ea" />
      <path d="M170 90L110 40V440L170 380Z" fill="#ddd6c8" />
      <path d="M630 90L690 40V440L630 380Z" fill="#ddd6c8" />
      <rect x="360" y="130" width="130" height="70" fill={CAMEL} />
      <rect x="372" y="141" width="106" height="48" fill="#16130f" />
      <ellipse cx="400" cy="400" rx="150" ry="28" fill="#a98458" />
      <rect x="290" y="300" width="250" height="60" fill="#3b4a52" />
      <rect x="290" y="270" width="250" height="40" fill="#33414a" />
      <rect x="275" y="285" width="24" height="75" fill="#33414a" />
      <rect x="531" y="285" width="24" height="75" fill="#33414a" />
      <rect x="360" y="375" width="110" height="10" fill="#6e4f33" />
      <rect x="580" y="140" width="70" height="220" fill="none" stroke="#4a3523" strokeWidth="5" />
      <path d="M580 205H650M580 270H650" stroke="#4a3523" strokeWidth="4" />
      <circle cx="225" cy="215" r="70" fill="#ffb25c" opacity="0.18" />
      <path d="M225 245V365" stroke="#16130f" strokeWidth="4" />
      <path d="M205 245L212 205H238L245 245Z" fill="#ffd9a0" />
    </Frame>
  );
}

/** Blueprint: dashed outline on the left filling in to a solid structure on the right, with a dimension line. */
export function BlueprintFallback() {
  return (
    <Frame>
      <g fill="none" stroke={CAMEL} strokeWidth="2" strokeDasharray="7 6">
        <rect x="180" y="120" width="200" height="220" />
        <path d="M180 230H380M180 120L380 340M380 120L180 340" strokeOpacity="0.5" />
      </g>
      <rect x="380" y="120" width="240" height="220" fill="rgba(159,196,216,0.25)" stroke={PAPER} strokeOpacity="0.7" strokeWidth="2" />
      <rect x="380" y="330" width="240" height="22" fill="#8a867d" />
      <rect x="378" y="104" width="244" height="16" fill={CAMEL} />
      {[392, 502, 604].map((x) => (
        <rect key={x} x={x} y="120" width="14" height="210" fill="#bdb7aa" stroke={PAPER} strokeOpacity="0.6" />
      ))}
      <rect x="380" y="226" width="240" height="10" fill="#a49e90" />
      <rect x="400" y="290" width="90" height="40" fill="#3b4a52" />
      <g stroke={CAMEL} strokeWidth="2" fill="none">
        <path d="M180 400H620M180 388V412M620 388V412" />
        <path d="M180 400l12 -5v10zM620 400l-12 -5v10z" fill={CAMEL} />
      </g>
    </Frame>
  );
}
