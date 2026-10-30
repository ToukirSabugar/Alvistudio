import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/auth";
import { isPublicAdminPath } from "@/lib/admin-paths";

// Optimistic check only: a signed, unexpired cookie is required for /admin and /api/admin. Every admin page and
// server action still calls requireAdmin(), which also confirms the user is active in the database.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const signedIn = readSession(req.cookies.get(SESSION_COOKIE)?.value) !== null;

  let res: NextResponse;
  if (signedIn || isPublicAdminPath(pathname)) {
    res = NextResponse.next();
  } else if (pathname.startsWith("/api/")) {
    res = NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });
  } else {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    res = NextResponse.redirect(url);
  }
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"] };
