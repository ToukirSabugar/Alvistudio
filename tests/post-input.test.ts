import { describe, expect, it } from "vitest";
import { cleanPost, postBlocks, slugify } from "@/lib/post-input";

const ok = {
  title: "Brick vs AAC blocks",
  slug: "",
  excerpt: "Which wall material suits a Himatnagar house.",
  body: "## Cost\r\n\r\nAAC is lighter.\r\n\r\n- Faster to lay\r\n- Less mortar",
  coverUrl: "",
  coverAlt: "",
  metaDescription: "",
  publish: true,
};

describe("slugify", () => {
  it("makes a clean web address from a title", () => {
    expect(slugify("Brick vs AAC: a guide!")).toBe("brick-vs-aac-a-guide");
    expect(slugify("  Vastu   tips — 2026 ")).toBe("vastu-tips-2026");
    expect(slugify("ઘર ડિઝાઇન")).toBe("");
  });
});

describe("cleanPost", () => {
  it("fills the slug from the title and normalises line breaks", () => {
    const r = cleanPost(ok, []);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.slug).toBe("brick-vs-aac-blocks");
    expect(r.value.body).toBe("## Cost\n\nAAC is lighter.\n\n- Faster to lay\n- Less mortar");
    expect(r.value.publish).toBe(true);
  });

  it("normalises a typed slug and refuses one that is taken by a built-in guide", () => {
    const r = cleanPost({ ...ok, slug: "Concrete Grades And Curing" }, ["concrete-grades-and-curing"]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.slug).toMatch(/already used/);
  });

  it("asks for a usable slug when the title has no Latin letters", () => {
    const r = cleanPost({ ...ok, title: "ઘર ડિઝાઇન ટિપ્સ" }, []);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.slug).toBeDefined();
  });

  it("checks required fields and lengths", () => {
    const r = cleanPost({ ...ok, title: "ab", body: "  ", excerpt: "x".repeat(501) }, []);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errors).sort()).toEqual(["body", "excerpt", "title"]);
  });

  it("accepts only a site path or https link for the cover", () => {
    expect(cleanPost({ ...ok, coverUrl: "javascript:alert(1)" }, []).ok).toBe(false);
    expect(cleanPost({ ...ok, coverUrl: "//evil.test/x.jpg" }, []).ok).toBe(false);
    expect(cleanPost({ ...ok, coverUrl: "/uploads/abc.jpg" }, []).ok).toBe(true);
    expect(cleanPost({ ...ok, coverUrl: "https://images.test/a.jpg" }, []).ok).toBe(true);
  });
});

describe("postBlocks", () => {
  it("splits paragraphs on blank lines and list lines one per item", () => {
    expect(postBlocks("## Cost\n\nAAC is lighter.\nStill strong.\n\n- one\n- two\n\n> tip")).toEqual([
      "## Cost",
      "AAC is lighter.\nStill strong.",
      "- one",
      "- two",
      "> tip",
    ]);
  });
  it("handles Windows line breaks and stray spaces", () => {
    expect(postBlocks("a\r\n\r\n  \r\n- x\r\n- y\r\n")).toEqual(["a", "- x", "- y"]);
  });
});
