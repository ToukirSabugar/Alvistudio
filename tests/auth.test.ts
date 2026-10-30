import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hashPassword, verifyPasswordHash, signSession, verifySession, readSession, adminEnabled, SESSION_MS } from "@/lib/auth";

const OLD = { ...process.env };
beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = "s3cret-s3cret-s3cret";
});
afterEach(() => {
  process.env = { ...OLD };
});

describe("adminEnabled", () => {
  it("needs only the session secret", () => {
    expect(adminEnabled()).toBe(true);
    delete process.env.ADMIN_SESSION_SECRET;
    expect(adminEnabled()).toBe(false);
  });
});

describe("password hashing", () => {
  it("round trips", async () => {
    const h = await hashPassword("a long enough pass");
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(h.split("$")).toHaveLength(6);
    expect(await verifyPasswordHash("a long enough pass", h)).toBe(true);
  });
  it("rejects a wrong password", async () => {
    const h = await hashPassword("a long enough pass");
    expect(await verifyPasswordHash("another pass word", h)).toBe(false);
    expect(await verifyPasswordHash("", h)).toBe(false);
  });
  it("returns false for malformed stored strings", async () => {
    for (const bad of ["", "plain", "scrypt$1$2$3", "bcrypt$16384$8$1$AAAA$AAAA", "scrypt$x$8$1$AAAA$AAAA", "scrypt$16384$8$1$$"]) {
      expect(await verifyPasswordHash("whatever", bad)).toBe(false);
    }
  });
  it("refuses absurd cost parameters instead of burning CPU", async () => {
    expect(await verifyPasswordHash("x", "scrypt$1073741824$8$1$AAAA$AAAA")).toBe(false);
  });
  it("uses a fresh salt each time", async () => {
    const a = await hashPassword("a long enough pass");
    const b = await hashPassword("a long enough pass");
    expect(a).not.toBe(b);
  });
});

describe("session tokens", () => {
  it("verifies a fresh token and exposes the user id", () => {
    const t = signSession(7);
    expect(verifySession(t)).toBe(true);
    expect(readSession(t)).toEqual({ userId: 7 });
  });
  it("rejects undefined and empty", () => {
    expect(verifySession(undefined)).toBe(false);
    expect(verifySession("")).toBe(false);
    expect(readSession("")).toBeNull();
  });
  it("rejects a tampered expiry, signature or user id", () => {
    const [uid, exp, sig] = signSession(7).split(".");
    expect(verifySession(`${uid}.${Number(exp) + 1000}.${sig}`)).toBe(false);
    expect(verifySession(`8.${exp}.${sig}`)).toBe(false);
    expect(verifySession(`${uid}.${exp}.${sig.slice(0, -1)}${sig.endsWith("a") ? "b" : "a"}`)).toBe(false);
  });
  it("rejects an old two-part token", () => {
    expect(verifySession("9999999999999.abcd")).toBe(false);
  });
  it("rejects an expired token", () => {
    const token = signSession(1, 1_000);
    expect(verifySession(token, 1_000 + SESSION_MS - 1)).toBe(true);
    expect(verifySession(token, 1_000 + SESSION_MS + 1)).toBe(false);
  });
  it("rejects a token signed with another secret", () => {
    const token = signSession(1);
    process.env.ADMIN_SESSION_SECRET = "different-secret";
    expect(verifySession(token)).toBe(false);
  });
  it("fails when the secret is missing", () => {
    const token = signSession(1);
    delete process.env.ADMIN_SESSION_SECRET;
    expect(verifySession(token)).toBe(false);
  });
  it("refuses to sign for an invalid user id", () => {
    expect(() => signSession(0)).toThrow();
    expect(() => signSession(1.5)).toThrow();
  });
});
