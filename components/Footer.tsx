"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Check } from "lucide-react";

export interface FooterProps {
  onNavigate?: (route: string) => void;
  onSubmitClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSubmitClick }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 2500);
  };

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

      {/* 2. 5-Column Navigation Grid (Light Theme) */}
      <div className="max-w-[1240px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Col 1: Brand & Subtext (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
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
            <p className="text-xs text-[#55556E] leading-relaxed max-w-xs">
              The premier launch directory for founders, indie hackers and early adopters.
            </p>
          </div>

          {/* Col 2: PRODUCT (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
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
                <a href="#blog" className="hover:text-[#4F46E5] transition-colors">
                  Founder Blog
                </a>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#4F46E5] transition-colors">
                  Pricing & Plans
                </Link>
              </li>
              <li>
                <a href="#badges" className="hover:text-[#4F46E5] transition-colors">
                  Embed Badges
                </a>
              </li>
              <li>
                <a href="#seo" className="hover:text-[#4F46E5] transition-colors">
                  SEO Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: LEGAL (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#14142B] block">
              LEGAL
            </span>
            <ul className="space-y-2 text-xs text-[#55556E]">
              <li>
                <a href="#terms" className="hover:text-[#4F46E5] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#4F46E5] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#guidelines" className="hover:text-[#4F46E5] transition-colors">
                  Guidelines
                </a>
              </li>
              <li>
                <a href="#refund" className="hover:text-[#4F46E5] transition-colors">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: DAILY NEWSLETTER (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#14142B] block">
              DAILY NEWSLETTER
            </span>
            <p className="text-xs text-[#55556E]">
              Top 3 SaaS products in your inbox at 9am.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="founder@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white border border-[#D4D4E4] hover:border-[#B9B9CF] focus:border-[#4F46E5] px-3 py-2 text-xs text-[#14142B] placeholder:text-[#8A8AA3] transition-colors outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe to daily newsletter"
                className="rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-3.5 py-2 text-xs font-bold text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              >
                {subscribed ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
            {subscribed && (
              <span className="text-[11px] font-mono text-[#0F8A5F] block font-medium">
                Subscribed successfully!
              </span>
            )}
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
