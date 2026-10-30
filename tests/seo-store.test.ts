import { describe, expect, it } from "vitest";
import { cleanFaq, cleanKeyword, cleanPageSeo, isSeoPath } from "@/lib/seo-store";
import { STARTER_KEYWORDS } from "@/app/admin/(panel)/seo/starter";
import { cleanKeyword as ck } from "@/lib/seo-store";

const base = { keyword: "architect in Himatnagar", pagePath: "/architecture", intent: "primary", priority: 1 };

describe("cleanKeyword", () => {
  it("trims, collapses spaces and defaults the city", () => {
    const c = cleanKeyword({ ...base, keyword: "  architect   in  Himatnagar " });
    expect(c?.keyword).toBe("architect in Himatnagar");
    expect(c?.targetCity).toBe("Himatnagar");
    expect(c?.notes).toBeNull();
  });
  it("rejects bad length, page, intent and priority", () => {
    expect(cleanKeyword({ ...base, keyword: "a" })).toBeNull();
    expect(cleanKeyword({ ...base, keyword: "x".repeat(151) })).toBeNull();
    expect(cleanKeyword({ ...base, pagePath: "/nope" })).toBeNull();
    expect(cleanKeyword({ ...base, intent: "other" })).toBeNull();
    expect(cleanKeyword({ ...base, priority: 0 })).toBeNull();
    expect(cleanKeyword({ ...base, priority: 4 })).toBeNull();
    expect(cleanKeyword({ ...base, priority: "2.5" })).toBeNull();
  });
  it("accepts string priority from forms and boundary lengths", () => {
    expect(cleanKeyword({ ...base, priority: "3" })?.priority).toBe(3);
    expect(cleanKeyword({ ...base, keyword: "ab" })).not.toBeNull();
    expect(cleanKeyword({ ...base, keyword: "x".repeat(150) })).not.toBeNull();
  });
});

describe("cleanPageSeo", () => {
  it("blank fields become null (clears override)", () => {
    expect(cleanPageSeo({ path: "/about", metaTitle: " ", metaDescription: "" })).toEqual({
      path: "/about",
      metaTitle: null,
      metaDescription: null,
      ogImageUrl: null,
      noindex: false,
    });
  });
  it("only known paths, sane image url, length caps", () => {
    expect(cleanPageSeo({ path: "/admin" })).toBeNull();
    expect(cleanPageSeo({ path: "/", ogImageUrl: "javascript:alert(1)" })).toBeNull();
    expect(cleanPageSeo({ path: "/", ogImageUrl: "/uploads/a.jpg" })).not.toBeNull();
    expect(cleanPageSeo({ path: "/", metaTitle: "x".repeat(121) })).toBeNull();
    expect(cleanPageSeo({ path: "/", metaDescription: "x".repeat(301) })).toBeNull();
  });
});

describe("cleanFaq and paths", () => {
  it("validates question and answer", () => {
    expect(cleanFaq({ pagePath: "/", question: "Hi?", answer: "Yes it is." })).toBeNull();
    expect(cleanFaq({ pagePath: "/", question: "Do you build farms?", answer: "Yes." })).toBeNull();
    expect(cleanFaq({ pagePath: "/x", question: "Do you build farms?", answer: "Yes we do." })).toBeNull();
    expect(cleanFaq({ pagePath: "/civil", question: "Do you build farms?", answer: "Yes we do." })).not.toBeNull();
  });
  it("knows the site paths", () => {
    expect(isSeoPath("/contact")).toBe(true);
    expect(isSeoPath("/admin")).toBe(false);
  });
});

describe("starter keywords", () => {
  it("are all valid and unique per page", () => {
    const seen = new Set<string>();
    for (const k of STARTER_KEYWORDS) {
      expect(ck(k)).not.toBeNull();
      const key = `${k.pagePath}|${k.keyword.toLowerCase()}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
    expect(STARTER_KEYWORDS.some((k) => k.keyword === "architect in Himatnagar")).toBe(true);
  });
});
