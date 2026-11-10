import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeNextUrl(target: string | null): string {
  if (!target) return "/dashboard";
  const trimmed = target.trim();
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("://") &&
    !trimmed.startsWith("/\\")
  ) {
    return trimmed;
  }
  return "/dashboard";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next");
  const oauthError =
    searchParams.get("error_description") || searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(oauthError)}`,
        origin
      ).toString()
    );
  }

  const safeNext = sanitizeNextUrl(rawNext);

  // 1. PKCE Code Exchange (Google OAuth / Magic Links)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, origin).toString());
    }
  }

  // 2. Token Hash verification (OTP / Magic Links)
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, origin).toString());
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=auth_failed", origin).toString()
  );
}

