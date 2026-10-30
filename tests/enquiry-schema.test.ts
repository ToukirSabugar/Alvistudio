import { describe, it, expect } from "vitest";
import { enquirySchema, enquiryTypes, fieldsFor } from "@/lib/enquiry-schema";

const arch = {
  type: "architecture",
  name: "Test Person",
  phone: "+91 98765 43210",
  email: "",
  message: "",
  website: "",
  plotSize: "1500 sq ft",
  location: "Himatnagar",
  buildingType: "House",
  budgetRange: "",
};

describe("enquirySchema", () => {
  it("exposes the four types", () => {
    expect([...enquiryTypes]).toEqual(["architecture", "interior", "civil", "consultation"]);
  });

  it("accepts a valid architecture enquiry", () => {
    expect(enquirySchema.safeParse(arch).success).toBe(true);
  });

  it("rejects phone 123", () => {
    const r = enquirySchema.safeParse({ ...arch, phone: "123" });
    expect(r.success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(enquirySchema.safeParse({ ...arch, website: "http://spam" }).success).toBe(false);
  });

  it("civil requires siteLocation", () => {
    const civil = {
      type: "civil", name: "Test Person", phone: "9876543210", website: "",
      siteLocation: "", workType: "Renovation",
    };
    const r = enquirySchema.safeParse(civil);
    expect(r.success).toBe(false);
    expect(enquirySchema.safeParse({ ...civil, siteLocation: "Alkapuri" }).success).toBe(true);
  });

  it("rejects a bad email and an unknown type", () => {
    expect(enquirySchema.safeParse({ ...arch, email: "nope" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...arch, type: "other" }).success).toBe(false);
  });
});

describe("fieldsFor", () => {
  it("returns ordered definitions per type", () => {
    expect(fieldsFor("architecture").map((f) => f.name)).toEqual([
      "plotSize", "location", "buildingType", "budgetRange",
    ]);
    expect(fieldsFor("civil").map((f) => f.name)).toEqual([
      "siteLocation", "workType", "area", "timeline",
    ]);
    expect(fieldsFor("consultation").map((f) => f.name)).toEqual([
      "preferredDay", "preferredTime", "topic",
    ]);
    expect(fieldsFor("interior").map((f) => f.name)).toEqual([
      "spaceType", "area", "budgetRange", "timeline",
    ]);
  });
});
