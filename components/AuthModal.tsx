"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";

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
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [authMethod, setAuthMethod] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (authMethod === "password" && password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    // Simulate API authentication request
    setTimeout(() => {
      setIsLoading(false);
      if (email.endsWith("@error.com")) {
        setErrorMsg("Unable to authenticate with this email. Please try again.");
      } else {
        setIsSuccess(true);
      }
    }, 1000);
  };

  const handleSocialLogin = (provider: "Google" | "X") => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Modal Card */}
      <div
        className="relative w-full max-w-md rounded-[18px] border border-[#E8E8E3] bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#8E8E93] hover:text-[#0F0F10] hover:bg-[#FAFAF7] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          {/* Brand Logo squircle */}
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#5B5BF0] text-white shadow-[0_2px_10px_rgba(91,91,240,0.3)]">
            <Sparkles className="h-5 w-5" />
          </div>

          <h2
            id="auth-modal-title"
            className="font-heading font-extrabold text-2xl text-[#0F0F10] tracking-tight"
          >
            {isSuccess
              ? "Check your email!"
              : mode === "signin"
              ? "Welcome back to LaunchOS"
              : "Create your maker account"}
          </h2>

          <p className="text-xs sm:text-sm text-[#66666B]">
            {isSuccess
              ? `We sent a magic sign-in link to ${email}`
              : mode === "signin"
              ? "Sign in to upvote products, submit launches, and claim backlinks."
              : "Join 30,000+ founders launching and discovering vetted products."}
          </p>
        </div>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="space-y-5 text-center py-2 animate-in fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5] text-[#10B981] border-2 border-[#A7F3D0]">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="rounded-[12px] bg-[#FAFAF7] border border-[#E8E8E3] p-4 text-xs text-[#52525A] space-y-1">
              <span className="font-bold text-[#0F0F10] block">
                Instant Passwordless Access
              </span>
              <p>
                Click the button in your email to instantly verify your account and return to your launch dashboard.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full font-bold"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        ) : (
          /* FORM BODY */
          <div className="space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-full bg-[#FAFAF7] p-1 border border-[#E8E8E3]">
              <button
                type="button"
                onClick={() => setMode("signin")}
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
                onClick={() => setMode("signup")}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-white text-[#0F0F10] shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Social Auth Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Google Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSocialLogin("Google")}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-[#E8E8E3] bg-white hover:bg-[#FAFAF7] py-2.5 px-3 text-xs font-bold text-[#0F0F10] shadow-xs transition-colors cursor-pointer"
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
                <span>Google</span>
              </button>

              {/* X / Twitter Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSocialLogin("X")}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-[#E8E8E3] bg-white hover:bg-[#FAFAF7] py-2.5 px-3 text-xs font-bold text-[#0F0F10] shadow-xs transition-colors cursor-pointer"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X / Twitter</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#E8E8E3]" />
              <span className="absolute bg-white px-3 text-[11px] font-mono text-[#8E8E93] uppercase tracking-wider">
                or with email
              </span>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-[8px] bg-[#FEE2E2] border border-[#FECACA] p-2.5 text-xs text-[#DC2626] animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0F0F10] mb-1.5">
                  Work or Personal Email
                </label>
                <Input
                  type="email"
                  required
                  placeholder="alex@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </div>

              {/* Password toggle if user selects password method */}
              {authMethod === "password" && (
                <div className="animate-in fade-in">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-[#0F0F10]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMethod("magic")}
                      className="text-[11px] text-[#5B5BF0] hover:underline font-semibold"
                    >
                      Use Magic Link instead
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="h-4 w-4" />}
                  />
                </div>
              )}

              {/* Submit CTA */}
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading}
                className="w-full font-bold shadow-[0_2px_10px_rgba(91,91,240,0.3)] mt-2"
                rightIcon={
                  isLoading ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )
                }
              >
                {isLoading
                  ? "Verifying..."
                  : authMethod === "magic"
                  ? "Send Magic Link"
                  : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
              </Button>
            </form>

            {/* Alternate toggle */}
            {authMethod === "magic" && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMethod("password")}
                  className="text-xs text-[#8E8E93] hover:text-[#5B5BF0] transition-colors"
                >
                  Prefer password sign in?
                </button>
              </div>
            )}

            {/* Privacy note */}
            <div className="pt-2 text-center text-[10px] text-[#8E8E93] leading-relaxed">
              By proceeding, you agree to LaunchOS's{" "}
              <a href="#terms" className="underline hover:text-[#0F0F10]">
                Terms
              </a>{" "}
              and{" "}
              <a href="#privacy" className="underline hover:text-[#0F0F10]">
                Privacy Policy
              </a>
              . No spam, ever.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
