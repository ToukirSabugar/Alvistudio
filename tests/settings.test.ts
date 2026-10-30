import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/store", () => ({ getSettings: async () => ({}) }));

import { mergeSettings, getContactSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

describe("mergeSettings", () => {
  it("falls back to defaults for missing or blank keys", () => {
    const s = mergeSettings({ phone: "   ", address: "" });
    expect(s.phone).toBe(siteConfig.phone);
    expect(s.phoneDisplay).toBe("07383 490 630");
    expect(s.whatsapp).toBe(siteConfig.whatsapp);
    expect(s.address).toBe(siteConfig.address);
    expect(s.hours).toBe(siteConfig.hours);
    expect(s.mapUrl).toBe(siteConfig.mapUrl);
    expect(s.ratingUrl).toBe(siteConfig.rating.url);
  });
  it("lets overrides win", () => {
    const s = mergeSettings({ hours: "Mon-Sat 10-6", whatsapp: "919999999999", ratingUrl: "https://x.test/r" });
    expect(s.hours).toBe("Mon-Sat 10-6");
    expect(s.whatsapp).toBe("919999999999");
    expect(s.ratingUrl).toBe("https://x.test/r");
  });
  it("formats an 11 digit number starting with 0", () => {
    expect(mergeSettings({ phone: "07383490630" }).phoneDisplay).toBe("07383 490 630");
  });
  it("leaves a 10 digit number as given", () => {
    expect(mergeSettings({ phone: "9876543210" }).phoneDisplay).toBe("9876543210");
  });
  it("ignores unknown keys", () => {
    const s = mergeSettings({ nonsense: "x" });
    expect(Object.keys(s).sort()).toEqual(
      ["address", "email", "facebook", "hours", "instagram", "mapUrl", "phone", "phoneDisplay", "ratingUrl", "whatsapp", "youtube"],
    );
  });
});

describe("email and social links", () => {
  it("email falls back to the built-in value; social links are empty until set", () => {
    const s = mergeSettings({ instagram: "  " });
    expect(s.email).toBe(siteConfig.email);
    expect(s.instagram).toBe("");
    expect(s.facebook).toBe("");
    expect(s.youtube).toBe("");
  });
  it("uses saved values", () => {
    const s = mergeSettings({ email: "hello@alvi.test", instagram: "https://instagram.com/alvi" });
    expect(s.email).toBe("hello@alvi.test");
    expect(s.instagram).toBe("https://instagram.com/alvi");
  });
});

describe("getContactSettings", () => {
  it("returns defaults when the store is empty", async () => {
    expect((await getContactSettings()).phone).toBe(siteConfig.phone);
  });
});
