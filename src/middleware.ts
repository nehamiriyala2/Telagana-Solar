import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE, verifySession } from "./lib/admin/session-token";

const intl = createMiddleware(routing);

/** Admin pages and APIs reachable without a session. */
const ADMIN_PUBLIC = new Set(["/admin/login", "/api/admin/auth/request-code", "/api/admin/auth/verify"]);

/**
 * /admin and /api/admin: no locale routing, never indexed, signed session cookie required.
 * (The cookie signature is checked here; pages and APIs also check the session row and staff role in MySQL.)
 * Everything else: next-intl, unchanged.
 */
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");
  if (!isAdmin) return intl(req);

  const noindex = (res: NextResponse) => { res.headers.set("X-Robots-Tag", "noindex, nofollow"); return res; };
  if (ADMIN_PUBLIC.has(pathname)) return noindex(NextResponse.next());

  const sessionId = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (sessionId) return noindex(NextResponse.next());

  if (pathname.startsWith("/api/")) return noindex(NextResponse.json({ error: "unauthorized" }, { status: 401 }));
  const login = new URL("/admin/login", req.url);
  if (pathname !== "/admin") login.searchParams.set("next", pathname);
  return noindex(NextResponse.redirect(login));
}

// Public pages (as before) + the admin APIs.
export const config = { matcher: ["/((?!api|_next|_vercel|scene-capture|.*\\..*).*)", "/api/admin/:path*"] };
