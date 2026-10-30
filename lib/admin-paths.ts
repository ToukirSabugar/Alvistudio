// Path rules for the admin area, shared by proxy.ts (server) and SiteChrome (browser). No imports on purpose.

/** True for /admin and anything below it. */
export function isAdminArea(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** The only admin page that opens without a session. */
export function isPublicAdminPath(pathname: string): boolean {
  return pathname === "/admin/login" || pathname === "/admin/login/";
}
