"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
} from "lucide-react";
import { Button } from "./Button";
import { createClient } from "@/lib/supabase/client";
import {
  signInWithPasswordAction,
  signUpWithPasswordAction,
  sendOtpOrMagicLinkAction,
  verifyEmailOtpAction,
} from "@/app/auth/actions";

export interface AuthCardProps {
  defaultMode?: "signin" | "signup";
  defaultMethod?: "password" | "otp" | "magic";
  nextUrl?: string;
  initialError?: string | null;
  onSuccessClose?: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  defaultMode = "signin",
  defaultMethod = "password",
  nextUrl = "/dashboard",
  initialError = null,
  onSuccessClose,
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [authMethod, setAuthMethod] = useState<"password" | "otp" | "magic">(
    defaultMode === "signup" ? "password" : defaultMethod
  );
  const [step, setStep] = useState<
    "form" | "otp" | "magic" | "signup_confirm"
  >("form");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Create Account ALWAYS uses Password + Confirm Password
  const effectiveMethod = mode === "signup" ? "password" : authMethod;

  const handleModeSwitch = (nextMode: "signin" | "signup") => {
    setMode(nextMode);
    if (nextMode === "signup") {
      setAuthMethod("password");
    }
    setStep("form");
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleMethodSwitch = (nextMethod: "password" | "otp" | "magic") => {
    setAuthMethod(nextMethod);
    setStep("form");
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            nextUrl
          )}`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
      }
    } catch {
      setErrorMsg("Unable to start Google sign-in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      if (effectiveMethod === "otp" || effectiveMethod === "magic") {
        const res = await sendOtpOrMagicLinkAction({
          email: normalizedEmail,
          next: nextUrl,
        });
        setIsLoading(false);
        if (res.error) {
          setErrorMsg(res.error);
          return;
        }
        if (effectiveMethod === "otp") {
          setOtpCode("");
          setStep("otp");
        } else {
          setStep("magic");
        }
        return;
      }

      // Password mode (Sign In or Create Account)
      if (mode === "signin") {
        const res = await signInWithPasswordAction({
          email: normalizedEmail,
          password,
        });
        setIsLoading(false);
        if (res.error) {
          setErrorMsg(res.error);
          return;
        }
        onSuccessClose?.();
        router.push(nextUrl);
        router.refresh();
      } else {
        const res = await signUpWithPasswordAction({
          email: normalizedEmail,
          password,
          confirmPassword,
          fullName,
        });
        setIsLoading(false);
        if (res.error) {
          setErrorMsg(res.error);
          return;
        }
        if (res.sessionCreated) {
          onSuccessClose?.();
          router.push(nextUrl);
          router.refresh();
        } else {
          setStep("signup_confirm");
        }
      }
    } catch {
      setIsLoading(false);
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanCode = otpCode.replace(/\D/g, "").trim();
    if (cleanCode.length < 6) {
      setErrorMsg("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyEmailOtpAction({
        email: email.trim().toLowerCase(),
        token: cleanCode,
      });
      setIsLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
        return;
      }
      onSuccessClose?.();
      router.push(nextUrl);
      router.refresh();
    } catch {
      setIsLoading(false);
      setErrorMsg("Unable to verify OTP code. Please try again.");
    }
  };

  const handleResendOtpOrMagic = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);
    const res = await sendOtpOrMagicLinkAction({
      email: email.trim().toLowerCase(),
      next: nextUrl,
    });
    setIsLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setInfoMsg(
        effectiveMethod === "otp"
          ? "A fresh 6-digit OTP code has been sent to your email."
          : "A fresh Magic Link has been sent to your email."
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#5B5BF0] text-white shadow-[0_2px_10px_rgba(91,91,240,0.3)]"
        >
          <Sparkles className="h-5 w-5" />
        </Link>

        <h2
          id="auth-modal-title"
          className="font-heading font-extrabold text-2xl text-[#0F0F10] tracking-tight"
        >
          {step === "otp"
            ? "Verify your Email OTP"
            : step === "magic"
            ? "Check your email inbox!"
            : step === "signup_confirm"
            ? "Account Created!"
            : mode === "signin"
            ? "Welcome back to LaunchOS"
            : "Create your maker account"}
        </h2>

        <p className="text-xs sm:text-sm text-[#66666B]">
          {step === "otp"
            ? `Enter the 6-digit verification code sent to ${email}`
            : step === "magic"
            ? `We sent a one-click sign-in link to ${email}`
            : step === "signup_confirm"
            ? `Check ${email} to confirm your account, or sign in with your password.`
            : mode === "signin"
            ? "Sign in with your password, Email OTP, Magic Link, or Google."
            : "Create your account with Email & Password (min. 8 characters) or Google."}
        </p>
      </div>

      {/* STEP: 6-DIGIT OTP VERIFICATION */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] p-3 text-xs text-[#DC2626]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="flex items-center gap-2 rounded-[10px] bg-[#ECFDF5] border border-[#A7F3D0] p-3 text-xs text-[#065F46]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          <div className="rounded-[12px] bg-[#FAFAF7] border border-[#E8E8E3] p-4 space-y-2.5 text-center">
            <label
              htmlFor="otp-code-input"
              className="block text-xs font-bold text-[#0F0F10]"
            >
              6-Digit OTP Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
              <input
                id="otp-code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                placeholder="000000"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full h-11 rounded-[10px] border border-[#5B5BF0] bg-white pl-10 pr-4 text-center tracking-[0.45em] font-mono font-bold text-base text-[#0F0F10] focus:outline-none focus:ring-2 focus:ring-[#5B5BF0]/20"
              />
            </div>
            <p className="text-[11px] text-[#66666B]">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleResendOtpOrMagic}
                className="font-bold text-[#5B5BF0] hover:underline cursor-pointer"
              >
                Resend OTP
              </button>
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            rightIcon={
              isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )
            }
            className="w-full font-bold shadow-[0_2px_10px_rgba(91,91,240,0.3)]"
          >
            {isLoading ? "Verifying OTP..." : "Verify OTP & Continue"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className="text-xs text-[#66666B] hover:text-[#0F0F10] underline cursor-pointer"
            >
              ← Change email or sign-in method
            </button>
          </div>
        </form>
      )}

      {/* STEP: MAGIC LINK SENT */}
      {step === "magic" && (
        <div className="space-y-4 text-center py-1 animate-in fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF5] text-[#10B981] border-2 border-[#A7F3D0]">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="rounded-[12px] bg-[#FAFAF7] border border-[#E8E8E3] p-4 text-xs text-[#52525A] space-y-1.5">
            <span className="font-bold text-[#0F0F10] block">
              Instant Passwordless Access
            </span>
            <p>
              Click the Magic Link in your email to instantly verify your
              account and open your LaunchOS dashboard.
            </p>
          </div>

          {infoMsg && (
            <p className="text-xs text-[#059669] font-medium">{infoMsg}</p>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleResendOtpOrMagic}
              className="w-full h-10 rounded-[10px] border border-[#E8E8E3] bg-white hover:bg-[#FAFAF7] text-xs font-bold text-[#0F0F10] transition-colors cursor-pointer"
            >
              {isLoading ? "Sending..." : "Resend Magic Link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className="text-xs text-[#66666B] hover:text-[#0F0F10] underline cursor-pointer py-1"
            >
              ← Back to sign-in options
            </button>
          </div>
        </div>
      )}

      {/* STEP: SIGNUP CONFIRMATION */}
      {step === "signup_confirm" && (
        <div className="space-y-4 text-center py-1 animate-in fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF5] text-[#10B981] border-2 border-[#A7F3D0]">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="rounded-[12px] bg-[#FAFAF7] border border-[#E8E8E3] p-4 text-xs text-[#52525A] space-y-1.5">
            <span className="font-bold text-[#0F0F10] block">
              Account created with password!
            </span>
            <p>
              Please check <strong>{email}</strong> to verify your email address,
              then sign in with your password.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full font-bold"
            onClick={() => {
              setMode("signin");
              setAuthMethod("password");
              setStep("form");
            }}
          >
            Go to Sign In
          </Button>
        </div>
      )}

      {/* STEP: MAIN AUTH FORM */}
      {step === "form" && (
        <div className="space-y-4">
          {/* 1. Sign In / Create Account Mode Switcher */}
          <div className="flex rounded-full bg-[#FAFAF7] p-1 border border-[#E8E8E3]">
            <button
              type="button"
              onClick={() => handleModeSwitch("signin")}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-white text-[#0F0F10] shadow-xs"
                  : "text-[#66666B] hover:text-[#0F0F10]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("signup")}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-white text-[#0F0F10] shadow-xs"
                  : "text-[#66666B] hover:text-[#0F0F10]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* 2. Full-Width Google OAuth Button (Twitter/X Removed) */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 rounded-[10px] border border-[#E8E8E3] bg-white hover:bg-[#FAFAF7] py-2.5 px-4 text-xs font-bold text-[#0F0F10] shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {mode === "signin"
                ? "Continue with Google"
                : "Sign up with Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#E8E8E3]" />
            <span className="absolute bg-white px-3 text-[11px] font-mono text-[#8E8E93] uppercase tracking-wider">
              or with email
            </span>
          </div>

          {/* 3. Email Auth Method Selector Pills (Shown ONLY in Sign In mode; Default = Password) */}
          {mode === "signin" && (
            <div className="grid grid-cols-3 gap-1.5 rounded-[10px] bg-[#FAFAF7] p-1 border border-[#E8E8E3]">
              <button
                type="button"
                onClick={() => handleMethodSwitch("password")}
                className={`py-1.5 px-2 rounded-[7px] text-xs font-bold transition-all cursor-pointer ${
                  authMethod === "password"
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10]"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => handleMethodSwitch("otp")}
                className={`py-1.5 px-2 rounded-[7px] text-xs font-bold transition-all cursor-pointer ${
                  authMethod === "otp"
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10]"
                }`}
              >
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => handleMethodSwitch("magic")}
                className={`py-1.5 px-2 rounded-[7px] text-xs font-bold transition-all cursor-pointer ${
                  authMethod === "magic"
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10]"
                }`}
              >
                Magic Link
              </button>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] p-3 text-xs text-[#DC2626] animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleSubmitForm} className="space-y-3.5">
            {/* Full Name (Optional in Create Account mode) */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="auth-full-name"
                  className="block text-xs font-bold text-[#0F0F10] mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
                  <input
                    id="auth-full-name"
                    name="fullName"
                    type="text"
                    placeholder="Alex Rivera"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 rounded-[10px] border border-[#E8E8E3] bg-white pl-10 pr-3.5 text-sm text-[#0F0F10] focus:border-[#5B5BF0] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-bold text-[#0F0F10] mb-1.5"
              >
                Email Address <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full h-10 rounded-[10px] border border-[#E8E8E3] bg-white pl-10 pr-3.5 text-sm text-[#0F0F10] focus:border-[#5B5BF0] focus:outline-none"
                />
              </div>
            </div>

            {/* Password Fields (Always shown on Create Account, and on Sign In when Password method is active) */}
            {effectiveMethod === "password" ? (
              <div className="space-y-3.5 animate-in fade-in">
                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-bold text-[#0F0F10] mb-1.5"
                  >
                    {mode === "signup"
                      ? "Password (min. 8 characters)"
                      : "Password"}{" "}
                    <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
                    <input
                      id="auth-password"
                      name="password"
                      type="password"
                      required
                      minLength={mode === "signup" ? 8 : 1}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 rounded-[10px] border border-[#E8E8E3] bg-white pl-10 pr-3.5 text-sm text-[#0F0F10] focus:border-[#5B5BF0] focus:outline-none"
                    />
                  </div>
                </div>

                {mode === "signup" && (
                  <div>
                    <label
                      htmlFor="auth-confirm-password"
                      className="block text-xs font-bold text-[#0F0F10] mb-1.5"
                    >
                      Confirm Password <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
                      <input
                        id="auth-confirm-password"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-10 rounded-[10px] border border-[#E8E8E3] bg-white pl-10 pr-3.5 text-sm text-[#0F0F10] focus:border-[#5B5BF0] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Helper Box for OTP / Magic Link in Sign In mode */
              <div className="rounded-[10px] bg-[#FAFAF7] border border-[#E8E8E3] px-3.5 py-2.5 text-xs text-[#66666B]">
                {effectiveMethod === "otp" ? (
                  <>
                    We&apos;ll send a{" "}
                    <strong className="text-[#0F0F10]">
                      6-digit one-time code
                    </strong>{" "}
                    to your email for instant verification.
                  </>
                ) : (
                  <>
                    We&apos;ll email you a{" "}
                    <strong className="text-[#0F0F10]">
                      one-click Magic Link
                    </strong>{" "}
                    to sign in without a password.
                  </>
                )}
              </div>
            )}

            {/* Submit CTA */}
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isLoading}
              className="w-full font-bold shadow-[0_2px_10px_rgba(91,91,240,0.3)]"
              rightIcon={
                isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )
              }
            >
              {isLoading
                ? "Processing..."
                : mode === "signup"
                ? "Create Account"
                : effectiveMethod === "otp"
                ? "Send 6-Digit OTP Code"
                : effectiveMethod === "magic"
                ? "Send Magic Link"
                : "Sign In"}
            </Button>
          </form>

          {/* Privacy note */}
          <div className="pt-1 text-center text-[11px] text-[#8E8E93] leading-relaxed">
            By continuing, you agree to LaunchOS&apos;s{" "}
            <a href="#terms" className="underline hover:text-[#0F0F10]">
              Terms
            </a>{" "}
            and{" "}
            <a href="#privacy" className="underline hover:text-[#0F0F10]">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      )}
    </div>
  );
};

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = "signin",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="relative w-full max-w-md rounded-[18px] border border-[#E8E8E3] bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#8E8E93] hover:text-[#0F0F10] hover:bg-[#FAFAF7] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <AuthCard
          defaultMode={defaultMode}
          defaultMethod="password"
          onSuccessClose={onClose}
        />
      </div>
    </div>
  );
};
