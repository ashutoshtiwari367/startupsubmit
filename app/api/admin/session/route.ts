import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { config } from "@/lib/env/serverSecrets";
import {
  isEmailAllowlisted,
  verifySupabaseAdminToken,
  extractAccessTokenFromRequest,
} from "@/lib/admin-auth";

/**
 * POST /api/admin/session
 * Authenticates an admin using Supabase Auth (email + password or access_token)
 * and verifies that the authenticated user's email is in ADMIN_EMAILS.
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

      // First check allowlist before even issuing session cookie
      if (!isEmailAllowlisted(email)) {
        return NextResponse.json(
          {
            ok: false,
            message: "Forbidden: This email is not on the ADMIN_EMAILS allowlist.",
          },
          { status: 403 }
        );
      }

      const { data, error } = await db.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.session?.access_token) {
        return NextResponse.json(
          {
            ok: false,
            message: error?.message || "Invalid Supabase credentials.",
          },
          { status: 401 }
        );
      }

      accessToken = data.session.access_token;
    }

    const verified = await verifySupabaseAdminToken(accessToken);
    if (!verified.isAdmin || !verified.email) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Forbidden: Authenticated user is not in the ADMIN_EMAILS allowlist.",
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

export async function GET(req: NextRequest) {
  const token = extractAccessTokenFromRequest(req);
  const verified = await verifySupabaseAdminToken(token);
  if (!verified.isAdmin) {
    return NextResponse.json(
      { ok: false, authenticated: false },
      { status: 403 }
    );
  }
  return NextResponse.json({
    ok: true,
    authenticated: true,
    email: verified.email,
  });
}
