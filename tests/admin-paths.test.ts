import { describe, expect, it } from "vitest";
import { isAdminArea, isPublicAdminPath } from "@/lib/admin-paths";

describe("isPublicAdminPath", () => {
  it("lets only the sign-in page through without a session", () => {
    expect(isPublicAdminPath("/admin/login")).toBe(true);
    expect(isPublicAdminPath("/admin/login/")).toBe(true);
    expect(isPublicAdminPath("/admin")).toBe(false);
    expect(isPublicAdminPath("/admin/login/x")).toBe(false);
    expect(isPublicAdminPath("/admin/loginx")).toBe(false);
    expect(isPublicAdminPath("/admin/enquiries")).toBe(false);
  });
});

describe("isAdminArea", () => {
  it("matches /admin and everything below it, nothing else", () => {
    expect(isAdminArea("/admin")).toBe(true);
    expect(isAdminArea("/admin/gallery")).toBe(true);
    expect(isAdminArea("/administrator")).toBe(false);
    expect(isAdminArea("/")).toBe(false);
    expect(isAdminArea("/about")).toBe(false);
  });
});
