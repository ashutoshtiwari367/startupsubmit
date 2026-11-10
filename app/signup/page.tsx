"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/AuthModal";

function SignupFormContent() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";
  const urlError = searchParams.get("error");

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md rounded-[18px] border border-[#E8E8E3] bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <AuthCard
          defaultMode="signup"
          defaultMethod="password"
          nextUrl={nextUrl}
          initialError={urlError}
        />
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF7]" />}>
      <SignupFormContent />
    </Suspense>
  );
}
