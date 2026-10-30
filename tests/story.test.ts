import { describe, expect, it } from "vitest";
import { CHAPTERS, build, chapterAt, phase } from "@/lib/story";

describe("story timeline", () => {
  it("has the intro plus six numbered chapters", () => {
    expect(CHAPTERS).toHaveLength(7);
    expect(CHAPTERS[0].numeral).toBe("");
    expect(CHAPTERS.slice(1).map((c) => c.numeral)).toEqual(["I", "II", "III", "IV", "V", "VI"]);
  });

  it("maps progress to a chapter and clamps overscroll", () => {
    expect(chapterAt(0)).toBe(0);
    expect(chapterAt(1)).toBe(6);
    expect(chapterAt(-0.2)).toBe(0);
    expect(chapterAt(1.3)).toBe(6);
    expect(chapterAt(0.5)).toBe(3);
  });

  it("gives progress inside one chapter", () => {
    expect(phase(0, 3)).toBe(0);
    expect(phase(1, 3)).toBe(1);
    expect(phase(0.5, 3)).toBeCloseTo(0.5);
  });

  it("eases a value over a progress window", () => {
    expect(build(0.2, 0.3, 0.5)).toBe(0);
    expect(build(0.6, 0.3, 0.5)).toBe(1);
    expect(build(0.4, 0.3, 0.5)).toBeCloseTo(0.5);
  });
});
