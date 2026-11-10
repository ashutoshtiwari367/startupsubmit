"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ── Form Action: Sign In (Password) ──────────────────────────────────────────
export async function signIn(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string | null) || "/dashboard";

  const res = await signInWithPasswordAction({ email, password });
  if (res.error) {
    return res;
  }

  redirect(next);
}

// ── Form Action: Sign Up (Password) ──────────────────────────────────────────
export async function signUp(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const fullName = ((formData.get("fullName") as string) || "").trim();

  const res = await signUpWithPasswordAction({
    email,
    password,
    confirmPassword,
    fullName,
  });

  return { error: res.error, success: res.success };
}

// ── Direct Action: Sign In with Password ────────────────────────────────────
export async function signInWithPasswordAction(params: {
  email: string;
  password: string;
}): Promise<{ error: string | null }> {
  const email = params.email?.trim().toLowerCase();
  const password = params.password;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Incorrect email or password." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please verify your email address first." };
    }
    return { error: error.message };
  }

  return { error: null };
}

// ── Direct Action: Sign Up with Password ────────────────────────────────────
export async function signUpWithPasswordAction(params: {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}): Promise<{ error: string | null; success: boolean; sessionCreated: boolean }> {
  const email = params.email?.trim().toLowerCase();
  const password = params.password;
  const confirmPassword = params.confirmPassword;
  const fullName = (params.fullName || "").trim();

  if (!email || !password) {
    return {
      error: "Please fill in all fields.",
      success: false,
      sessionCreated: false,
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
      success: false,
      sessionCreated: false,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      success: false,
      sessionCreated: false,
    };
  }

  const supabase = await createClient();

  // If the user previously logged in via OTP / Magic Link with this exact email
  // and wants to set their password via Create Account, update their password directly!
  const {
    data: { user: existingSessionUser },
  } = await supabase.auth.getUser();

  if (
    existingSessionUser &&
    existingSessionUser.email?.toLowerCase() === email
  ) {
    const { error: updateErr } = await supabase.auth.updateUser({
      password,
      data: fullName ? { full_name: fullName } : undefined,
    });
    if (updateErr) {
      return {
        error: updateErr.message,
        success: false,
        sessionCreated: false,
      };
    }
    return {
      error: null,
      success: true,
      sessionCreated: true,
    };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return {
        error: "An account with this email already exists.",
        success: false,
        sessionCreated: false,
      };
    }
    return { error: error.message, success: false, sessionCreated: false };
  }

  // Supabase returns an empty identities array when Confirm Email is enabled and the user already exists
  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return {
      error: "An account with this email already exists. Please sign in.",
      success: false,
      sessionCreated: false,
    };
  }

  return {
    error: null,
    success: true,
    sessionCreated: Boolean(data?.session),
  };
}

// ── Direct Action: Send Email OTP or Magic Link ─────────────────────────────
export async function sendOtpOrMagicLinkAction(params: {
  email: string;
  fullName?: string;
  next?: string;
}): Promise<{ error: string | null }> {
  const email = params.email?.trim().toLowerCase();
  const fullName = (params.fullName || "").trim();
  const next = params.next || "/dashboard";

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// ── Direct Action: Verify 6-Digit Email OTP Code ────────────────────────────
export async function verifyEmailOtpAction(params: {
  email: string;
  token: string;
}): Promise<{ error: string | null }> {
  const email = params.email?.trim().toLowerCase();
  const token = params.token?.trim();

  if (!email || !token || token.length < 6) {
    return { error: "Please enter the 6-digit OTP code from your email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: error.message || "Invalid or expired OTP code." };
  }

  return { error: null };
}

// ── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
