"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export interface FooterProps {
  onNavigate?: (route: string) => void;
  onSubmitClick?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="w-full bg-white border-t border-[#E6E6F0] text-[#14142B] mt-12 sm:mt-16">
      {/* 1. Stat Strip (Light Theme) */}
      <div className="max-w-[1240px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
              12K+
            </div>
            <div className="text-xs text-[#55556E] mt-1 font-medium">
              Active makers
            </div>
          </div>

          <div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
              2,600+
            </div>
            <div className="text-xs text-[#55556E] mt-1 font-medium">
              Total launches
            </div>
          </div>

          <div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
              24h
            </div>
            <div className="text-xs text-[#55556E] mt-1 font-medium">
              Review turnaround
            </div>
          </div>

          <div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
              500K+
            </div>
            <div className="text-xs text-[#55556E] mt-1 font-medium">
              Monthly visits
            </div>
          </div>
        </div>
      </div>

      {/* Thin Divider */}
      <div className="border-t border-[#E6E6F0]" />

      {/* 2. 4-Column Navigation Grid (Light Theme) */}
      <div className="max-w-[1240px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Col 1: Brand & Subtext (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/";
              }}
              className="inline-flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4F46E5] text-white group-hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-[#14142B]">
                LaunchOS
              </span>
            </Link>
            <p className="text-xs text-[#55556E] leading-relaxed max-w-sm">
              The premier launch directory for founders, indie hackers and early adopters. Discover modern software, track upvotes, and launch your next product.
            </p>
          </div>

          {/* Col 2: PRODUCT (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#14142B] block">
              PRODUCT
            </span>
            <ul className="space-y-2 text-xs text-[#55556E]">
              <li>
                <Link href="/submit" className="hover:text-[#4F46E5] transition-colors">
                  Submit Product
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-[#4F46E5] transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/winners" className="hover:text-[#4F46E5] transition-colors">
                  Hall of Winners
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#4F46E5] transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: RESOURCES (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#14142B] block">
              RESOURCES
            </span>
            <ul className="space-y-2 text-xs text-[#55556E]">
              <li>
                <Link href="/blog" className="hover:text-[#4F46E5] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#4F46E5] transition-colors">
                  Pricing &amp; Plans
                </Link>
              </li>
              <li>
                <Link href="/badges" className="hover:text-[#4F46E5] transition-colors">
                  Embed Badges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#4F46E5] transition-colors">
                  FAQ &amp; Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: LEGAL (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#14142B] block">
              LEGAL
            </span>
            <ul className="space-y-2 text-xs text-[#55556E]">
              <li>
                <Link href="/terms" className="hover:text-[#4F46E5] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#4F46E5] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-[#4F46E5] transition-colors">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-[#4F46E5] transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Copyright + Status Indicator */}
      <div className="border-t border-[#E6E6F0] py-6">
        <div className="max-w-[1240px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#55556E]">
          <div>
            &copy; 2026 LaunchOS. Built for indie founders.
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0F8A5F] animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
