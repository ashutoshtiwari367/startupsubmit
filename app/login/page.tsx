"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthCard } from "@/components/AuthModal";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";
  const urlError = searchParams.get("error");

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] flex flex-col justify-between selection:bg-[#4F46E5]/15 selection:text-[#4F46E5]">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-8">
          <AuthCard
            defaultMode="signin"
            defaultMethod="password"
            nextUrl={nextUrl}
            initialError={urlError}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F6FB]" />}>
      <LoginFormContent />
    </Suspense>
  );
}
