import { describe, expect, it } from "vitest";
import { faqJsonLd, jsonLdString } from "@/lib/faq-schema";

describe("faqJsonLd", () => {
  it("builds FAQPage from the visible text only", () => {
    const d = faqJsonLd([{ question: "Q1?", answer: "A1" }]);
    expect(d["@type"]).toBe("FAQPage");
    expect(d.mainEntity).toEqual([
      { "@type": "Question", name: "Q1?", acceptedAnswer: { "@type": "Answer", text: "A1" } },
    ]);
  });
  it("empty list gives empty mainEntity", () => {
    expect(faqJsonLd([]).mainEntity).toEqual([]);
  });
  it("escapes < so a script tag cannot be closed early", () => {
    expect(jsonLdString({ a: "</script><b>" })).not.toContain("<");
  });
});
