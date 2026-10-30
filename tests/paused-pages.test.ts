import { describe, expect, it } from "vitest";
import { isPaused, navLinks } from "@/lib/site";

describe("paused pages", () => {
  it("pauses gallery and blog, including blog articles", () => {
    expect(isPaused("/gallery")).toBe(true);
    expect(isPaused("/blog")).toBe(true);
    expect(isPaused("/blog/planning-your-house-budget")).toBe(true);
  });

  it("does not pause pages that only start with the same letters", () => {
    expect(isPaused("/blogger")).toBe(false);
    expect(isPaused("/about")).toBe(false);
  });

  it("keeps paused pages out of the menu", () => {
    const hrefs = navLinks(true).map((l) => l.href);
    expect(hrefs).not.toContain("/gallery");
    expect(hrefs).not.toContain("/blog");
    expect(hrefs).toContain("/testimonials");
    expect(hrefs).toContain("/contact");
  });
});
