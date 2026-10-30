import { describe, expect, it } from "vitest";
import { canDeactivate, cleanNewAdmin, passwordProblem } from "@/lib/admin-rules";

describe("canDeactivate", () => {
  it("never lets you switch yourself off", () => {
    expect(canDeactivate(1, 1, 3)).toBe(false);
  });
  it("never switches off the last active admin", () => {
    expect(canDeactivate(1, 2, 1)).toBe(false);
  });
  it("allows switching off another admin when one stays", () => {
    expect(canDeactivate(1, 2, 2)).toBe(true);
  });
});

describe("passwordProblem", () => {
  it("needs 10 characters and a matching repeat", () => {
    expect(passwordProblem("short", "short")).toMatch(/10 characters/);
    expect(passwordProblem("long enough pw", "long enough pW")).toMatch(/do not match/);
    expect(passwordProblem("long enough pw", "long enough pw")).toBeNull();
  });
  it("refuses very long input", () => {
    expect(passwordProblem("x".repeat(201), "x".repeat(201))).toMatch(/200/);
  });
});

describe("cleanNewAdmin", () => {
  it("lowercases the email and checks fields", () => {
    expect(cleanNewAdmin({ email: " Fatma@Example.COM ", name: " Fatma ", password: "a good password", confirm: "a good password" })).toEqual({
      ok: true,
      value: { email: "fatma@example.com", name: "Fatma", password: "a good password" },
    });
    const bad = cleanNewAdmin({ email: "not-an-email", name: "", password: "x", confirm: "y" });
    expect(bad.ok).toBe(false);
  });
});
