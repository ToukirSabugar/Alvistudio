import { describe, expect, it } from "vitest";
import { services } from "@/content/services";

const guides = [
  "concrete-grades-and-curing",
  "choosing-bricks-and-blocks",
  "timber-and-plywood-for-interiors",
  "steel-and-reinforcement-basics",
  "flooring-and-tiles-for-hot-climates",
  "designing-for-heat-and-ventilation",
  "planning-your-house-budget",
];

describe.each(Object.values(services))("service: $slug", (s) => {
  it("has meta text within length limits", () => {
    expect(s.metaTitle.length).toBeLessThanOrEqual(60);
    expect(s.metaDescription.length).toBeGreaterThanOrEqual(130);
    expect(s.metaDescription.length).toBeLessThanOrEqual(155);
  });
  it("has the required counts", () => {
    expect(s.offers.length).toBeGreaterThanOrEqual(5);
    expect(s.offers.length).toBeLessThanOrEqual(6);
    expect(s.process).toHaveLength(6);
    expect(s.projects.map((p) => p.title)).toEqual(["Full house", "Renovation", "Tuition classes", "Farm"]);
    expect(s.deliverables.length).toBeGreaterThanOrEqual(5);
    expect(s.deliverables.length).toBeLessThanOrEqual(7);
    expect(s.bring.length).toBeGreaterThanOrEqual(5);
    expect(s.bring.length).toBeLessThanOrEqual(6);
    expect(s.materials.length).toBeGreaterThanOrEqual(3);
    expect(s.materials.length).toBeLessThanOrEqual(5);
  });
  it("has three approach groups with three points each", () => {
    expect(s.approach.map((g) => g.title)).toEqual(["How we design", "How we choose materials", "How we advise you"]);
    s.approach.forEach((g) => expect(g.points).toHaveLength(3));
  });
  it("links only to known guides", () => {
    s.materials.forEach((m) => expect(guides).toContain(m.guide));
  });
});
