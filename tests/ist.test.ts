import { describe, expect, it } from "vitest";
import { formatIst, istDayStart, parseIstDate, rangeStart } from "@/lib/ist";

describe("India time helpers", () => {
  it("finds midnight in India for any instant of that Indian day", () => {
    expect(istDayStart(new Date("2026-10-30T10:00:00Z")).toISOString()).toBe("2026-10-29T18:30:00.000Z");
    // 20:00 UTC on the 29th is already 01:30 on the 30th in India.
    expect(istDayStart(new Date("2026-10-29T20:00:00Z")).toISOString()).toBe("2026-10-29T18:30:00.000Z");
  });

  it("parses a YYYY-MM-DD date as India midnight and rejects impossible dates", () => {
    expect(parseIstDate("2026-10-30")?.toISOString()).toBe("2026-10-29T18:30:00.000Z");
    expect(parseIstDate("2026-02-30")).toBeNull();
    expect(parseIstDate("30-10-2026")).toBeNull();
    expect(parseIstDate("")).toBeNull();
  });

  it("starts ranges at India midnight", () => {
    const now = new Date("2026-10-30T10:00:00Z");
    expect(rangeStart("today", now).toISOString()).toBe("2026-10-29T18:30:00.000Z");
    expect(rangeStart("week", now).toISOString()).toBe("2026-10-23T18:30:00.000Z"); // today and the 6 days before
    expect(rangeStart("month", now).toISOString()).toBe("2026-09-30T18:30:00.000Z"); // 1 Oct, India
  });

  it("formats in India time", () => {
    expect(formatIst(new Date("2026-10-29T20:00:00Z"), "date")).toBe("30 Oct 2026");
    expect(formatIst("2026-10-29T20:00:00.000Z", "datetime")).toBe("30 Oct 2026, 1:30 am");
    expect(formatIst("not a date", "date")).toBe("");
  });
});
