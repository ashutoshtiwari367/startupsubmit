import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SUPABASE_URL = "https://tbatttczyklqaxgbqlke.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "sb_publishable_JfRBjUG1CaO96fxTBCnPbw_ZQqNOnia";
const DEFAULT_ADMIN_EMAILS = "admin@launchos.com";
const ADMIN_COOKIE_NAME = "launchpad_admin_session";

function getAllowlistedEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS;
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * Verifies the caller's Supabase Auth JWT and checks their email against ADMIN_EMAILS.
 */
async function verifyAdminInMiddleware(req: NextRequest): Promise<boolean> {
  const token =
    req.cookies.get(ADMIN_COOKIE_NAME)?.value ||
    req.cookies.get("sb-access-token")?.value ||
    (req.headers.get("authorization")?.startsWith("Bearer ")
      ? req.headers.get("authorization")!.slice("Bearer ".length).trim()
      : null);

  if (!token) return false;

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;
  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return false;

    const user = await res.json();
    const email =
      typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
    if (!email) return false;

    const allowlist = getAllowlistedEmails();
    return allowlist.has(email);
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public access to the login screen & session login endpoint
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/session")
  ) {
    return NextResponse.next();
  }

  const isAdmin = await verifyAdminInMiddleware(req);

  if (!isAdmin) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        {
          ok: false,
          message: "Forbidden: Admin authentication and ADMIN_EMAILS allowlist required.",
        },
        { status: 403 }
      );
    }

    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

