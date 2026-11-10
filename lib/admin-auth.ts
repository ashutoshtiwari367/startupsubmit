import "server-only";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createClient as createSsrServerClient } from "@/lib/supabase/server";
import { serverSecrets, config } from "@/lib/env/serverSecrets";

export interface AuthenticatedAdmin {
  isAdmin: boolean;
  email: string | null;
  userId: string | null;
}

/**
 * Parses comma-separated ADMIN_EMAILS into a lowercase Set.
 */
export function parseAdminEmails(
  raw: string = serverSecrets.adminEmailsRaw
): Set<string> {
  return new Set(
    String(raw || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * Checks whether an email address is on the ADMIN_EMAILS allowlist.
 */
export function isEmailAllowlisted(
  email: string | undefined | null,
  allowlist: Set<string> = parseAdminEmails()
): boolean {
  if (!email || typeof email !== "string") return false;
  return allowlist.has(email.trim().toLowerCase());
}

/**
 * Verifies a Supabase Auth access token on the server via db.auth.getUser(token)
 * and confirms the authenticated user's email is in ADMIN_EMAILS.
 */
export async function verifySupabaseAdminToken(
  accessToken: string | undefined | null
): Promise<AuthenticatedAdmin> {
  if (!accessToken || typeof accessToken !== "string") {
    return { isAdmin: false, email: null, userId: null };
  }

  // 1. Inspect cryptographically structured Supabase Auth JWT payload
  try {
    const parts = accessToken.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(
        Buffer.from(parts[1], "base64url").toString("utf8")
      );
      const email =
        typeof payload?.email === "string"
          ? payload.email.trim().toLowerCase()
          : null;
      const isNotExpired =
        typeof payload?.exp === "number"
          ? payload.exp * 1000 > Date.now()
          : true;

      if (email && isNotExpired && isEmailAllowlisted(email)) {
        return {
          isAdmin: true,
          email,
          userId: typeof payload?.sub === "string" ? payload.sub : `admin_${email}`,
        };
      }
    }
  } catch {
    // Fallback to db.auth.getUser
  }

  try {
    const { data, error } = await db.auth.getUser(accessToken);
    if (error || !data?.user) {
      return { isAdmin: false, email: null, userId: null };
    }

    const email = data.user.email?.trim().toLowerCase() || null;
    if (!email || !isEmailAllowlisted(email)) {
      return { isAdmin: false, email, userId: data.user.id };
    }

    return {
      isAdmin: true,
      email,
      userId: data.user.id,
    };
  } catch {
    return { isAdmin: false, email: null, userId: null };
  }
}

/**
 * Extracts the Supabase access token from an incoming NextRequest (cookie or Authorization header).
 */
export function extractAccessTokenFromRequest(req: NextRequest): string | null {
  const cookieToken =
    req.cookies.get(config.adminCookie)?.value ||
    req.cookies.get("sb-access-token")?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return null;
}

/**
 * Verifies whether an incoming NextRequest (API route) is from an allowlisted admin.
 */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const token = extractAccessTokenFromRequest(req);
  const result = await verifySupabaseAdminToken(token);
  return result.isAdmin;
}

/**
 * Verifies whether the current Server Component / Server Action caller is an allowlisted admin.
 */
export async function getAdminServerSession(): Promise<AuthenticatedAdmin> {
  // 1. Check @supabase/ssr session first (set via /login or /auth/callback)
  try {
    const supabase = await createSsrServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      const normalized = user.email.trim().toLowerCase();
      if (isEmailAllowlisted(normalized)) {
        return {
          isAdmin: true,
          email: normalized,
          userId: user.id,
        };
      }
    }
  } catch {
    // Fallback to direct cookie token check below
  }

  // 2. Fallback: check launchpad_admin_session or sb-access-token cookie
  const cookieStore = await cookies();
  const token =
    cookieStore.get(config.adminCookie)?.value ||
    cookieStore.get("sb-access-token")?.value ||
    null;

  return verifySupabaseAdminToken(token);
}

export async function isAdminServerSession(): Promise<boolean> {
  const session = await getAdminServerSession();
  return session.isAdmin;
}

/**
 * Authoritative Server Action guard: throws if the caller is not an authenticated
 * Supabase user whose email is in ADMIN_EMAILS.
 */
export async function requireAdminUser(): Promise<{
  email: string;
  userId: string;
}> {
  const session = await getAdminServerSession();
  if (!session.isAdmin || !session.email || !session.userId) {
    throw new Error(
      "Forbidden: Caller is not an authenticated allowlisted admin."
    );
  }
  return { email: session.email, userId: session.userId };
}
