"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Send,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { Button } from "./Button";

export interface FooterProps {
  onNavigate?: (route: string) => void;
  onSubmitClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSubmitClick }) => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 2000);
  };

  return (
    <footer className="w-full border-t border-[#E8E8E3] bg-[#FAFAF7] text-[#0F0F10] pt-14 sm:pt-20 pb-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-14">
        {/* Top Grid: Brand & Newsletter + Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Column: Brand, Blurb & Socials (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#5B5BF0] text-white shadow-[0_2px_8px_rgba(91,91,240,0.3)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-xl font-extrabold tracking-tight text-[#0F0F10]">
                  LaunchOS
                </span>
                <span className="rounded-full bg-[#EEF0FE] px-2 py-0.5 text-[10px] font-bold text-[#4338CA]">
                  [BRAND]
                </span>
              </div>
            </div>

            {/* Short Blurb */}
            <p className="text-xs sm:text-sm text-[#66666B] leading-relaxed max-w-sm">
              The premier product launch directory for founders, indie hackers, and early adopters. Launch your product, get real upvotes, and earn high-authority dofollow backlinks.
            </p>

            {/* Social Icons */}
            <div className="pt-2 flex items-center gap-2 text-[#8E8E93]">
              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E8E8E3] hover:text-[#0F0F10] hover:border-[#D5D5CE] transition-colors"
                aria-label="X Twitter"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E8E8E3] hover:text-[#0F0F10] hover:border-[#D5D5CE] transition-colors"
                aria-label="GitHub"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>

              {/* Discord / Community */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E8E8E3] hover:text-[#0F0F10] hover:border-[#D5D5CE] transition-colors"
                aria-label="Discord Community"
              >
                <MessageSquare className="h-4 w-4" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E8E8E3] hover:text-[#0F0F10] hover:border-[#D5D5CE] transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Column 1: Product (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0F0F10]">
              Product
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#66666B]">
              <li>
                <Link
                  href="/submit"
                  className="hover:text-[#5B5BF0] transition-colors"
                >
                  Submit Product
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-[#5B5BF0] transition-colors">
                  Daily Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/winners" className="hover:text-[#5B5BF0] transition-colors">
                  Hall of Winners
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#5B5BF0] transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#5B5BF0] transition-colors">
                  Featured Sponsors
                </Link>
              </li>
              <li>
                <a href="#badges" className="hover:text-[#5B5BF0] transition-colors">
                  Embed Badges
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Resources (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0F0F10]">
              Resources
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#66666B]">
              <li>
                <a href="#blog" className="hover:text-[#5B5BF0] transition-colors">
                  Founder Blog
                </a>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#5B5BF0] transition-colors">
                  Pricing & Plans
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#5B5BF0] transition-colors">
                  Explore Categories
                </Link>
              </li>
              <li>
                <Link href="/winners" className="hover:text-[#5B5BF0] transition-colors">
                  Launch Archive & Winners
                </Link>
              </li>
              <li>
                <a href="#backlinks" className="hover:text-[#5B5BF0] transition-colors">
                  SEO & Backlinks Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Legal (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0F0F10]">
              Legal & Safety
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#66666B]">
              <li>
                <a href="#terms" className="hover:text-[#5B5BF0] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#5B5BF0] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#editorial" className="hover:text-[#5B5BF0] transition-colors">
                  Editorial Guidelines
                </a>
              </li>
              <li>
                <a href="#refunds" className="hover:text-[#5B5BF0] transition-colors">
                  Refund Guarantee
                </a>
              </li>
            </ul>

            {/* Newsletter Subscription Box */}
            <div className="pt-3">
              <span className="block font-heading font-bold text-xs text-[#0F0F10] mb-1.5">
                Daily Top Launches Newsletter
              </span>
              <p className="text-[11px] text-[#8E8E93] mb-2 leading-relaxed">
                Top 3 SaaS products sent to your inbox daily at 9am.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-1.5">
                <input
                  type="email"
                  required
                  placeholder="founder@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[8px] border border-[#E8E8E3] bg-white px-2.5 py-1.5 text-xs text-[#0F0F10] placeholder:text-[#8E8E93] focus:border-[#5B5BF0] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-[8px] bg-[#5B5BF0] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#4C4CE0] transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                >
                  {isSubscribed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                </button>
              </form>
              {isSubscribed && (
                <span className="block text-[11px] font-mono text-[#10B981] mt-1 font-semibold">
                  Subscribed! Welcome to the daily briefing.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Copyright & Status Pill */}
        <div className="border-t border-[#E8E8E3] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8E93]">
          <div>
            &copy; {new Date().getFullYear()} LaunchOS. Built for indie founders and software builders.
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-mono text-[11px] text-[#66666B]">
              All systems operational &bull; DR 72+ Verified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
