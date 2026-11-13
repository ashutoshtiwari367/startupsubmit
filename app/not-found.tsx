"use client";

import React from "react";
import Link from "next/link";
import { Compass, Trophy, Tag, DollarSign } from "lucide-react";
import { Button } from "@/components/Button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] flex flex-col justify-between selection:bg-[#4F46E5]/15 selection:text-[#4F46E5]">
      <Navbar />

      {/* Main 404 Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-[#F7F6FF] text-[#4F46E5]">
            <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: "12s" }} />
          </div>

          <div className="space-y-2">
            <div className="font-mono text-xs font-bold text-[#4F46E5] tracking-widest uppercase">
              Page Not Found • Error 404
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#14142B] tracking-[-0.03em]">
              Lost in launch orbit?
            </h1>
            <p className="text-sm sm:text-base text-[#55556E] max-w-md mx-auto leading-relaxed">
              The product, category, or page you were looking for doesn't exist or may have been moved.
            </p>
          </div>

          {/* Quick Route Shortcuts */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-left">
            <Link
              href="/"
              className="p-3.5 rounded-[12px] border border-[#E6E6F0] bg-white hover:border-[#4F46E5] transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#14142B] group-hover:text-[#4F46E5]">
                <Compass className="h-4 w-4 text-[#4F46E5]" />
                <span>Today's Launches</span>
              </div>
              <p className="text-[11px] text-[#55556E] mt-1 line-clamp-1">
                Explore products launched today
              </p>
            </Link>

            <Link
              href="/winners"
              className="p-3.5 rounded-[12px] border border-[#E6E6F0] bg-white hover:border-[#4F46E5] transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#14142B] group-hover:text-[#4F46E5]">
                <Trophy className="h-4 w-4 text-[#F59E0B]" />
                <span>Hall of Winners</span>
              </div>
              <p className="text-[11px] text-[#55556E] mt-1 line-clamp-1">
                Top daily champion products
              </p>
            </Link>

            <Link
              href="/categories"
              className="p-3.5 rounded-[12px] border border-[#E6E6F0] bg-white hover:border-[#4F46E5] transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#14142B] group-hover:text-[#4F46E5]">
                <Tag className="h-4 w-4 text-[#0F8A5F]" />
                <span>Browse Categories</span>
              </div>
              <p className="text-[11px] text-[#55556E] mt-1 line-clamp-1">
                10 startup ecosystem taxonomies
              </p>
            </Link>

            <Link
              href="/pricing"
              className="p-3.5 rounded-[12px] border border-[#E6E6F0] bg-white hover:border-[#4F46E5] transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#14142B] group-hover:text-[#4F46E5]">
                <DollarSign className="h-4 w-4 text-[#7C3AED]" />
                <span>Launch Pricing</span>
              </div>
              <p className="text-[11px] text-[#55556E] mt-1 line-clamp-1">
                One-time plans & curated directory
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

      {/* Unified Global Footer */}
      <Footer />
    </div>
  );
}
