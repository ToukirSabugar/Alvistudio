import { describe, it, expect } from "vitest";
import { ENQUIRY_STATUSES, isEnquiryStatus } from "@/lib/store";

describe("enquiry statuses", () => {
  it("matches the database ENUM in order with labels", () => {
    expect(ENQUIRY_STATUSES).toEqual([
      { id: "new", label: "New" },
      { id: "seen", label: "Seen" },
      { id: "contacted", label: "Contacted" },
      { id: "quoted", label: "Quoted" },
      { id: "closed", label: "Closed" },
    ]);
  });
  it("accepts only listed statuses", () => {
    expect(isEnquiryStatus("quoted")).toBe(true);
    for (const bad of ["read", "done", "", "NEW", null, undefined, 3]) expect(isEnquiryStatus(bad)).toBe(false);
  });
});
