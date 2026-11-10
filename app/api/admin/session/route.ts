import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient as createSsrServerClient } from "@/lib/supabase/server";
import { config } from "@/lib/env/serverSecrets";
import {
  isEmailAllowlisted,
  verifySupabaseAdminToken,
  extractAccessTokenFromRequest,
} from "@/lib/admin-auth";

/**
 * POST /api/admin/session
 * Direct, 100% secure Supabase Auth authentication.
 * 1. Authenticates email + password against Supabase Auth (auth.users).
 * 2. Confirms that authenticated user's email is on the ADMIN_EMAILS allowlist.
 * 3. Issues secure, HTTP-only session cookie with the verified Supabase access token.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body?.password === "string" ? body.password : "";
    const directAccessToken =
      typeof body?.access_token === "string" ? body.access_token.trim() : "";

    let accessToken = directAccessToken;

    if (!accessToken) {
      if (!email || !password) {
        return NextResponse.json(
          {
            ok: false,
            message: "Admin email and password are required.",
          },
          { status: 400 }
        );
      }

      // Step 1: Pre-check if email is in ADMIN_EMAILS allowlist
      if (!isEmailAllowlisted(email)) {
        return NextResponse.json(
          {
            ok: false,
            message: "Forbidden: You are not authorized as an administrator.",
          },
          { status: 403 }
        );
      }

      // Step 2: Direct password authentication against Supabase Auth
      const { data, error } = await db.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.session?.access_token || !data?.user) {
        return NextResponse.json(
          {
            ok: false,
            message:
              error?.message ||
              "Invalid email or password. Please check your Supabase credentials.",
          },
          { status: 401 }
        );
      }

      accessToken = data.session.access_token;
    }

    // Step 3: Cryptographically verify token and authorize allowlisted email
    const verified = await verifySupabaseAdminToken(accessToken);
    if (!verified.isAdmin || !verified.email) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Forbidden: Authenticated user is not on the ADMIN_EMAILS allowlist.",
        },
        { status: 403 }
      );
    }

    const res = NextResponse.json({
      ok: true,
      email: verified.email,
      message: "Admin session established.",
    });

    res.cookies.set(config.adminCookie, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set("sb-access-token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request payload." },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/admin/session
 * Clears the admin session cookie.
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true, message: "Logged out." });
  res.cookies.delete(config.adminCookie);
  return res;
}

/**
 * GET /api/admin/session
 * Checks whether an active admin session or active SSR login exists.
 */
export async function GET(req: NextRequest) {
  const token = extractAccessTokenFromRequest(req);
  if (token) {
    const verified = await verifySupabaseAdminToken(token);
    if (verified.isAdmin && verified.email) {
      return NextResponse.json({
        ok: true,
        authenticated: true,
        email: verified.email,
      });
    }
  }

  // Check @supabase/ssr session if signed in via web app (Google/OTP/password)
  try {
    const supabase = await createSsrServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email && isEmailAllowlisted(user.email)) {
      const normalizedEmail = user.email.trim().toLowerCase();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = NextResponse.json({
        ok: true,
        authenticated: true,
        email: normalizedEmail,
      });

      if (session?.access_token) {
        res.cookies.set(config.adminCookie, session.access_token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: session.expires_in || 60 * 60 * 24 * 7,
        });
      }

      return res;
    }
  } catch {
    // Ignore SSR fallback errors
  }

  return NextResponse.json(
    { ok: false, authenticated: false },
    { status: 401 }
  );
}
