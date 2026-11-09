"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Compass, Trophy, Tag, DollarSign } from "lucide-react";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F0F10] flex flex-col justify-between selection:bg-[#5B5BF0]/15 selection:text-[#5B5BF0]">
      {/* Header Bar */}
      <header className="w-full border-b border-[#E8E8E3] bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#5B5BF0] text-white shadow-[0_2px_8px_rgba(91,91,240,0.3)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-extrabold tracking-tight text-[#0F0F10]">
                  LaunchOS
                </span>
                <span className="rounded-full bg-[#EEF0FE] px-2 py-0.5 text-[10px] font-bold text-[#5B5BF0]">
                  404
                </span>
              </div>
              <p className="text-[11px] text-[#66666B] font-mono leading-none">
                Product Launch Directory
              </p>
            </div>
          </Link>

          <Link href="/">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>
              Back to Launches
            </Button>
          </Link>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-[#EEF0FE] text-[#5B5BF0] shadow-[0_4px_20px_rgba(91,91,240,0.15)]">
            <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: "12s" }} />
          </div>

          <div className="space-y-2">
            <div className="font-mono text-xs font-bold text-[#5B5BF0] tracking-widest uppercase">
              Page Not Found • Error 404
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#0F0F10] tracking-[-0.03em]">
              Lost in launch orbit?
            </h1>
            <p className="text-sm sm:text-base text-[#66666B] max-w-md mx-auto leading-relaxed">
              The product, category, or page you were looking for doesn't exist or may have been moved.
            </p>
          </div>

          {/* Quick Route Shortcuts */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-left">
            <Link
              href="/"
              className="p-3.5 rounded-[12px] border border-[#E8E8E3] bg-white hover:border-[#5B5BF0] hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#0F0F10] group-hover:text-[#5B5BF0]">
                <Compass className="h-4 w-4 text-[#5B5BF0]" />
                <span>Today's Launches</span>
              </div>
              <p className="text-[11px] text-[#66666B] mt-1 line-clamp-1">
                Explore products launched today
              </p>
            </Link>

            <Link
              href="/winners"
              className="p-3.5 rounded-[12px] border border-[#E8E8E3] bg-white hover:border-[#5B5BF0] hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#0F0F10] group-hover:text-[#5B5BF0]">
                <Trophy className="h-4 w-4 text-[#F59E0B]" />
                <span>Hall of Winners</span>
              </div>
              <p className="text-[11px] text-[#66666B] mt-1 line-clamp-1">
                Top upvoted champion products
              </p>
            </Link>

            <Link
              href="/categories"
              className="p-3.5 rounded-[12px] border border-[#E8E8E3] bg-white hover:border-[#5B5BF0] hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#0F0F10] group-hover:text-[#5B5BF0]">
                <Tag className="h-4 w-4 text-[#059669]" />
                <span>Browse Categories</span>
              </div>
              <p className="text-[11px] text-[#66666B] mt-1 line-clamp-1">
                10 startup ecosystem taxonomies
              </p>
            </Link>

            <Link
              href="/pricing"
              className="p-3.5 rounded-[12px] border border-[#E8E8E3] bg-white hover:border-[#5B5BF0] hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#0F0F10] group-hover:text-[#5B5BF0]">
                <DollarSign className="h-4 w-4 text-[#7C3AED]" />
                <span>Launch Pricing</span>
              </div>
              <p className="text-[11px] text-[#66666B] mt-1 line-clamp-1">
                One-time plans & DR 72+ backlinks
              </p>
            </Link>
          </div>

          <div className="pt-4">
            <Link href="/submit">
              <Button variant="primary" size="md" className="font-bold">
                Launch your product &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-6 border-t border-[#E8E8E3] text-center text-xs font-mono text-[#8E8E93]">
        LaunchOS • The Modern Product Launch Platform
      </footer>
    </div>
  );
}
