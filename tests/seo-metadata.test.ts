import { describe, expect, it } from "vitest";
import { mergePageMetadata, pickKeywords } from "@/lib/page-metadata";
import type { PageSeo } from "@/lib/seo-store";

const defaults = { title: "Default title", description: "Default description" };
const kw = (keyword: string, intent: string, priority: number, isActive = true) => ({
  keyword,
  intent: intent as "primary",
  priority,
  isActive,
});
const override = (o: Partial<PageSeo>): PageSeo => ({
  path: "/about",
  metaTitle: "",
  metaDescription: "",
  ogImageUrl: "",
  noindex: false,
  ...o,
});

describe("mergePageMetadata", () => {
  it("uses defaults when there is no override or it is blank", () => {
    for (const o of [null, override({ metaTitle: "  " })]) {
      const m = mergePageMetadata(defaults, o, [], "/about");
      expect(m.title).toBe("Default title");
      expect(m.description).toBe("Default description");
      expect(m.alternates?.canonical).toBe("/about");
      expect(m.robots).toBeUndefined();
      expect(m.keywords).toBeUndefined();
      expect(m.openGraph).toBeUndefined();
    }
  });
  it("owner values win, field by field", () => {
    const m = mergePageMetadata(defaults, override({ metaTitle: "Mine" }), [], "/about");
    expect(m.title).toBe("Mine");
    expect(m.description).toBe("Default description");
  });
  it("noindex and og image", () => {
    const m = mergePageMetadata(defaults, override({ noindex: true, ogImageUrl: "/u/a.jpg" }), [], "/about");
    expect(m.robots).toEqual({ index: false });
    expect(m.openGraph?.images).toEqual([{ url: "/u/a.jpg" }]);
  });
  it("adds keywords", () => {
    expect(mergePageMetadata(defaults, null, [kw("a b", "primary", 1)], "/").keywords).toEqual(["a b"]);
  });
});

describe("pickKeywords", () => {
  it("puts primary first, skips inactive, dedupes case-insensitively", () => {
    const out = pickKeywords([
      kw("secondary one", "secondary", 1),
      kw("Primary Two", "primary", 2),
      kw("primary one", "primary", 1),
      kw("PRIMARY ONE", "primary", 1),
      kw("hidden", "primary", 1, false),
    ]);
    expect(out).toEqual(["primary one", "Primary Two", "secondary one"]);
  });
  it("caps at 12", () => {
    const many = Array.from({ length: 30 }, (_, i) => kw(`phrase ${i}`, "secondary", 2));
    expect(pickKeywords(many)).toHaveLength(12);
  });
});
