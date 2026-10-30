import type { ServiceSlug } from "@/content/services";

// Line drawings that draw themselves as the page scrolls. Every path has pathLength=1 and its own
// start point `--s` (0 to 1); the CSS class .scroll-draw turns the section's --p into stroke progress.
type P = { d: string; s: number; camel?: boolean };

const drawings: Record<ServiceSlug, P[]> = {
  architecture: [
    { d: "M20 270H380", s: 0 },
    { d: "M60 270V150H340V270", s: 0.08 },
    { d: "M46 150L200 66L354 150", s: 0.2, camel: true },
    { d: "M132 270V204H190V270", s: 0.32 },
    { d: "M242 188H302V232H242Z", s: 0.38 },
    { d: "M272 188V232M242 210H302", s: 0.44 },
    { d: "M60 292H340M60 285V299M340 285V299", s: 0.52, camel: true },
    { d: "M24 24H156V100H24ZM88 24V68M24 68H88", s: 0.62 },
    { d: "M104 100V86M88 68A16 16 0 0 1 104 84", s: 0.74 },
  ],
  interior: [
    { d: "M20 262H380", s: 0 },
    { d: "M60 262V56H340V262", s: 0.06 },
    { d: "M110 262V218H252V262M110 218V186H252V218", s: 0.2 },
    { d: "M122 196H240", s: 0.3 },
    { d: "M304 262V120M282 120H326L316 88H292Z", s: 0.38, camel: true },
    { d: "M148 84H244V150H148Z", s: 0.5 },
    { d: "M160 96H232V138H160Z", s: 0.56 },
    { d: "M84 278H278", s: 0.64 },
    { d: "M200 56V86M186 86H214", s: 0.74, camel: true },
  ],
  civil: [
    { d: "M20 252H380", s: 0 },
    { d: "M72 252V274H168V252M232 252V274H328V252", s: 0.1 },
    { d: "M112 252V92M288 252V92", s: 0.24 },
    { d: "M124 240V104M276 240V104", s: 0.34 },
    { d: "M72 92H328M72 70H328M72 70V92M328 70V92", s: 0.46, camel: true },
    { d: "M52 70H348", s: 0.58 },
    { d: "M112 252L288 92M288 252L112 92", s: 0.68 },
    { d: "M112 296H288M112 289V303M288 289V303", s: 0.82, camel: true },
  ],
};

export function Blueprint({ kind, label }: { kind: ServiceSlug; label: string }) {
  return (
    <svg
      viewBox="0 0 400 310"
      role="img"
      aria-label={label}
      className="h-full w-full text-ink"
      fill="none"
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <defs>
        <pattern id="bp-grid-live" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="310" fill="url(#bp-grid-live)" />
      {drawings[kind].map((p) => (
        <path
          key={p.d}
          d={p.d}
          pathLength={1}
          className="scroll-draw"
          style={{ ["--s" as string]: p.s }}
          stroke={p.camel ? "var(--camel-deep)" : "currentColor"}
        />
      ))}
    </svg>
  );
}
