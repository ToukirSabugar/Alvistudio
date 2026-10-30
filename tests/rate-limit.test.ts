import { describe, it, expect, vi, afterEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

afterEach(() => vi.useRealTimers());

describe("rateLimit", () => {
  it("allows N requests then blocks the N+1th", () => {
    const key = "a-" + Math.random();
    for (let i = 0; i < 3; i++) expect(rateLimit(key, 3, 1000)).toBe(true);
    expect(rateLimit(key, 3, 1000)).toBe(false);
  });

  it("keeps keys independent", () => {
    expect(rateLimit("k1", 1, 1000)).toBe(true);
    expect(rateLimit("k2", 1, 1000)).toBe(true);
    expect(rateLimit("k1", 1, 1000)).toBe(false);
  });

  it("recovers after the window passes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    expect(rateLimit("w", 1, 1000)).toBe(true);
    expect(rateLimit("w", 1, 1000)).toBe(false);
    vi.setSystemTime(new Date("2026-01-01T00:00:01.500Z"));
    expect(rateLimit("w", 1, 1000)).toBe(true);
  });
});
