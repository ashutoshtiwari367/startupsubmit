"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/Button";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Hard redirect to ensure browser sends newly set HttpOnly cookie
      window.location.href = "/admin";
    } catch {
      setError("Network error while connecting to authentication service.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <form
          onSubmit={handleLogin}
          className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)] space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[10px] bg-[#5B5BF0] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(91,91,240,0.3)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-xl text-[#0F0F10]">
                Admin Sign In
              </h1>
              <p className="text-xs text-[#66666B]">
                Direct authentication for authorized administrators
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-[10px] border border-[#FCA5A5] bg-[#FEF2F2] p-3.5 flex items-start gap-2.5 text-xs text-[#DC2626]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="admin-email-input"
              className="block text-xs font-bold text-[#0F0F10] mb-1.5"
            >
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
              <input
                id="admin-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vinay.olis3@gmail.com"
                required
                autoComplete="email"
                className="w-full h-10 rounded-[10px] border border-[#E8E8E3] bg-white pl-10 pr-3.5 text-sm text-[#0F0F10] focus:border-[#5B5BF0] focus:outline-none placeholder:text-[#A1A1AA]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password-input"
              className="block text-xs font-bold text-[#0F0F10] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
              <input
                id="admin-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your Supabase password"
                required
                autoComplete="current-password"
                className="w-full h-10 rounded-[10px] border border-[#E8E8E3] bg-white pl-10 pr-3.5 text-sm text-[#0F0F10] focus:border-[#5B5BF0] focus:outline-none placeholder:text-[#A1A1AA]"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#8E8E93] flex items-center gap-1">
              <KeyRound className="h-3 w-3 text-[#5B5BF0]" />
              <span>Direct password verification via Supabase Auth.</span>
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="w-full font-bold shadow-[0_2px_10px_rgba(91,91,240,0.25)]"
          >
            {loading ? "Verifying Credentials..." : "Sign In to Admin Queue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
