import { describe, expect, it } from "vitest";
import { GUIDE_CATEGORIES, bodyWordCount, guides } from "@/content/guides";

const SLUGS = [
  "concrete-grades-and-curing",
  "choosing-bricks-and-blocks",
  "steel-and-reinforcement-basics",
  "timber-and-plywood-for-interiors",
  "flooring-and-tiles-for-hot-climates",
  "designing-for-heat-and-ventilation",
  "planning-your-house-budget",
];

const fullText = (g: (typeof guides)[number]) => [g.title, g.excerpt, ...g.body].join("\n");

describe("guides", () => {
  it("has the seven guides in order", () => {
    expect(guides.map((g) => g.slug)).toEqual(SLUGS);
  });

  it("has unique slugs", () => {
    expect(new Set(guides.map((g) => g.slug)).size).toBe(guides.length);
  });

  it("keeps every guide a draft", () => {
    for (const g of guides) expect(g.draft).toBe(true);
  });

  it("has 500 to 1100 words each", () => {
    for (const g of guides) {
      const n = bodyWordCount(g.body);
      expect(n, `${g.slug} has ${n} words`).toBeGreaterThanOrEqual(500);
      expect(n, `${g.slug} has ${n} words`).toBeLessThanOrEqual(1100);
    }
  });

  it("has related slugs that exist, not itself, at most two", () => {
    const all = new Set(guides.map((g) => g.slug));
    for (const g of guides) {
      expect(g.related.length).toBeLessThanOrEqual(2);
      for (const r of g.related) {
        expect(all.has(r), `${g.slug} -> ${r}`).toBe(true);
        expect(r).not.toBe(g.slug);
      }
    }
  });

  it("uses allowed categories", () => {
    for (const g of guides) expect(GUIDE_CATEGORIES).toContain(g.category);
  });

  it("has at least 4 sections each", () => {
    for (const g of guides) {
      expect(g.body.filter((b) => b.startsWith("## ")).length, g.slug).toBeGreaterThanOrEqual(4);
    }
  });

  it("has a questions section and a sensible excerpt and reading time", () => {
    for (const g of guides) {
      expect(g.body.some((b) => b.startsWith("## Questions to ask")), g.slug).toBe(true);
      expect(g.excerpt.length, g.slug).toBeGreaterThanOrEqual(120);
      expect(g.excerpt.length, g.slug).toBeLessThanOrEqual(160);
      expect(g.readMinutes).toBeGreaterThanOrEqual(3);
    }
  });

  it("contains no prices", () => {
    for (const g of guides) {
      const t = fullText(g);
      expect(t, g.slug).not.toContain("₹");
      expect(t, g.slug).not.toMatch(/\bRs\.?/);
      expect(t.toLowerCase(), g.slug).not.toContain("per sq");
    }
  });

  it("contains no markup", () => {
    for (const g of guides) expect(fullText(g), g.slug).not.toMatch(/<[a-z/]/i);
  });
});
