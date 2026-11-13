import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env/publicEnv";

const DEFAULT_SUPABASE_URL = publicEnv.supabaseUrl;
const DEFAULT_SUPABASE_ANON_KEY = publicEnv.supabaseAnonKey;
const DEFAULT_ADMIN_EMAILS = "vinay.olis3@gmail.com";
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
 * Verifies a direct Bearer / admin cookie JWT cryptographically against Supabase Auth
 * and confirms their email is in ADMIN_EMAILS.
 * Never trusts unverified base64-decoded JWT claims.
 */
async function verifyDirectAdminToken(req: NextRequest): Promise<string | null> {
  const token =
    req.cookies.get(ADMIN_COOKIE_NAME)?.value ||
    req.cookies.get("sb-access-token")?.value ||
    (req.headers.get("authorization")?.startsWith("Bearer ")
      ? req.headers.get("authorization")!.slice("Bearer ".length).trim()
      : null);

  if (!token) return null;

  const allowlist = getAllowlistedEmails();

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;
  const apiKey =
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

    if (!res.ok) return null;

    const user = await res.json();
    const email =
      typeof user?.email === "string" ? user.email.trim().toLowerCase() : null;
    return email && allowlist.has(email) ? email : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public access to the admin login screen & session login endpoint
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/session")
  ) {
    return NextResponse.next();
  }

  // 1. Protect /admin/** and /api/admin/** (require Supabase Auth + ADMIN_EMAILS allowlist)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const allowlist = getAllowlistedEmails();
    const directEmail = await verifyDirectAdminToken(request);
    const isAdmin = Boolean(directEmail && allowlist.has(directEmail));

    if (!isAdmin) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "Forbidden: Admin authentication and ADMIN_EMAILS allowlist required.",
          },
          { status: 403 }
        );
      }

      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 2. Protect /dashboard/** (require authenticated user)
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin", "/admin/:path*", "/api/admin/:path*"],
};
