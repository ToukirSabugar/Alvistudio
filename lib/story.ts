// Timeline of the home page story "From plot to home". Scroll progress p runs 0..1 over the whole
// section. The section holds seven full-screen chapters (the intro plus I to VI); chapter k's text is
// centred on screen at p = k / 6, and the chapter owns the span half a step either side of that.
// Pure functions, shared by the 3D scene and the chapter rail.

export const CHAPTERS = [
  { id: "intro", numeral: "" },
  { id: "plot", numeral: "I" },
  { id: "plan", numeral: "II" },
  { id: "structure", numeral: "III" },
  { id: "facade", numeral: "IV" },
  { id: "interior", numeral: "V" },
  { id: "handover", numeral: "VI" },
] as const;

const STEPS = CHAPTERS.length - 1;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** Index of the chapter on screen at progress p (overscroll clamps to the first or last). */
export function chapterAt(p: number): number {
  return Math.round(clamp(p) * STEPS);
}

/** 0..1 progress inside chapter `chapter`'s share of the section. */
export function phase(p: number, chapter: number): number {
  return clamp(clamp(p) * STEPS - chapter + 0.5);
}

/** Smooth 0..1 as p moves from `from` to `to`; 0 before, 1 after. */
export function build(p: number, from: number, to: number): number {
  const x = clamp((p - from) / (to - from));
  return x * x * (3 - 2 * x);
}

/** Start of chapter k's span as a progress value, for windows like build(p, at(2), at(3)). */
export const at = (k: number) => (k - 0.5) / STEPS;

/** Progress at which chapter k's text is centred: where the camera reaches that chapter's view. */
export const centre = (k: number) => k / STEPS;
