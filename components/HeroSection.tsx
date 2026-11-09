"use client";

import React from "react";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { UpvoteButton } from "@/components/UpvoteButton";
import {
  Sparkles,
  ArrowRight,
  Star,
  Trophy,
  ExternalLink,
  Flame,
  TrendingUp,
  Link2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export interface HeroSectionProps {
  onSubmitClick?: () => void;
  onBrowseClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSubmitClick,
  onBrowseClick,
}) => {
  // 6 Founder avatars for social proof row
  const founders = [
    { name: "Austin Miller", color: "from-[#5B5BF0] to-[#7E7EF6]" },
    { name: "Elena Rostova", color: "from-[#059669] to-[#34D399]" },
    { name: "Marcus Chen", color: "from-[#D97706] to-[#FBBF24]" },
    { name: "Sarah Jenkins", color: "from-[#7C3AED] to-[#A78BFA]" },
    { name: "Devon Vance", color: "from-[#0F0F10] to-[#3A3A40]" },
    { name: "Kyle Brody", color: "from-[#2563EB] to-[#60A5FA]" },
  ];

  // Placeholder logos for "As seen on"
  const partnerLogos = [
    {
      name: "TechCrunch",
      svg: (
        <svg className="h-6 w-auto" viewBox="0 0 140 24" fill="currentColor">
          <text x="0" y="18" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="18" letterSpacing="-0.05em">
            TechCrunch
          </text>
        </svg>
      ),
    },
    {
      name: "Hacker News",
      svg: (
        <svg className="h-6 w-auto" viewBox="0 0 135 24" fill="currentColor">
          <rect x="0" y="2" width="20" height="20" rx="3" fill="#FF6600" />
          <text x="5" y="17" fill="white" fontFamily="system-ui, sans-serif" fontWeight="bold" fontSize="14">
            Y
          </text>
          <text x="26" y="18" fontFamily="system-ui, sans-serif" fontWeight="bold" fontSize="16" letterSpacing="-0.03em">
            Hacker News
          </text>
        </svg>
      ),
    },
    {
      name: "Product Hunt",
      svg: (
        <svg className="h-6 w-auto" viewBox="0 0 130 24" fill="currentColor">
          <circle cx="10" cy="12" r="10" fill="#DA552F" />
          <text x="6" y="17" fill="white" fontFamily="system-ui, sans-serif" fontWeight="bold" fontSize="14">
            P
          </text>
          <text x="26" y="18" fontFamily="system-ui, sans-serif" fontWeight="bold" fontSize="15" letterSpacing="-0.03em">
            Product Hunt
          </text>
        </svg>
      ),
    },
    {
      name: "Indie Hackers",
      svg: (
        <svg className="h-6 w-auto" viewBox="0 0 135 24" fill="currentColor">
          <text x="0" y="18" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="16" letterSpacing="-0.04em">
            INDIE HACKERS
          </text>
        </svg>
      ),
    },
    {
      name: "Y Combinator",
      svg: (
        <svg className="h-6 w-auto" viewBox="0 0 120 24" fill="currentColor">
          <text x="0" y="18" fontFamily="system-ui, sans-serif" fontWeight="bold" fontSize="16" letterSpacing="-0.03em">
            Y Combinator
          </text>
        </svg>
      ),
    },
    {
      name: "Ben's Bites",
      svg: (
        <svg className="h-6 w-auto" viewBox="0 0 115 24" fill="currentColor">
          <text x="0" y="18" fontFamily="system-ui, sans-serif" fontWeight="bold" fontSize="15" letterSpacing="-0.02em">
            Ben's Bites AI
          </text>
        </svg>
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#E8E8E3]">
      {/* 1. Dotted Background Pattern with Soft Radial Mask */}
      <div className="absolute inset-0 bg-dotted-pattern [mask-image:radial-gradient(ellipse_80%_70%_at_50%_35%,black_40%,transparent_100%)] pointer-events-none opacity-80" />

      {/* 2. Soft Electric Indigo Radial Glow behind headline */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(91,91,240,0.14),rgba(250,250,247,0))] pointer-events-none" />

      {/* FLOATING DECORATIVE MINI-CARDS (LEFT & RIGHT) - Hidden on mobile/tablet, visible on desktop (xl) */}
      
      {/* LEFT SIDE FLOATING CARDS */}
      <div className="hidden xl:block absolute left-4 lg:left-8 top-28 z-20 pointer-events-none select-none">
        {/* Floating Mini Product Card */}
        <div className="animate-float-slow -rotate-6 transition-transform duration-300 hover:rotate-0 hover:scale-105 pointer-events-auto">
          <div className="w-72 rounded-[14px] border border-[#E8E8E3] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="gold" size="sm" rankNumber={1}>
                #1 Daily Launch
              </Badge>
              <span className="text-[11px] font-mono text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded-full border border-[#A7F3D0]">
                +24% today
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar name="Cortex AI" shape="squircle" size="md" status="online" />
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-bold text-sm text-[#0F0F10] truncate">
                  Cortex AI
                </h4>
                <p className="text-[11px] text-[#66666B] truncate">
                  Autonomous support agents
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-[8px] bg-[#EEF0FE] text-[#5B5BF0] px-2 py-1 text-xs font-bold border border-[#D5D8FC]">
                ▲ 384
              </div>
            </div>
          </div>
        </div>

        {/* Floating Mini Upvote Bubble */}
        <div className="mt-8 ml-6 animate-float-reverse rotate-3 transition-transform duration-300 hover:rotate-0 hover:scale-105 pointer-events-auto">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E8E8E3] bg-white/95 px-3.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_rgba(91,91,240,0.08)] backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-xs text-[#0F0F10] font-medium">
              <strong className="text-[#5B5BF0]">Austin M.</strong> upvoted <span className="font-semibold">Prism Studio</span>
            </span>
            <span className="text-[10px] text-[#8E8E93] font-mono">1m ago</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE FLOATING CARDS */}
      <div className="hidden xl:block absolute right-4 lg:right-8 top-24 z-20 pointer-events-none select-none">
        {/* Floating Mini Dofollow Backlink Badge Card */}
        <div className="animate-float-reverse rotate-6 transition-transform duration-300 hover:rotate-0 hover:scale-105 pointer-events-auto">
          <div className="w-68 rounded-[14px] border border-[#E8E8E3] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(91,91,240,0.09)]">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF9E7] text-[#B45309]">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8E8E93] uppercase block leading-none">
                  RANK REWARD
                </span>
                <span className="font-heading font-bold text-xs text-[#0F0F10]">
                  High-Authority Dofollow
                </span>
              </div>
            </div>
            <div className="rounded-[8px] bg-[#FAFAF7] border border-[#E8E8E3] p-2 text-[11px] text-[#57575C] flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono text-[#0F0F10] font-semibold">
                <Link2 className="h-3.5 w-3.5 text-[#5B5BF0]" /> DA 74 Link
              </span>
              <span className="font-semibold text-[#059669] flex items-center gap-0.5">
                <CheckCircle2 className="h-3 w-3" /> Permanent
              </span>
            </div>
          </div>
        </div>

        {/* Floating Traffic Stat Card */}
        <div className="mt-8 mr-6 animate-float-slow -rotate-3 transition-transform duration-300 hover:rotate-0 hover:scale-105 pointer-events-auto">
          <div className="inline-flex items-center gap-3 rounded-[12px] border border-[#E8E8E3] bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.06)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#EEF0FE] text-[#5B5BF0]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-[#0F0F10]">
                +1,840 Unique Clicks
              </div>
              <div className="text-[10px] text-[#66666B]">
                Average Launch Day Traffic
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CENTERED HERO CONTENT */}
      <div className="relative z-30 mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
        {/* Pill above headline */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E8E3] bg-white px-3.5 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] mb-6 transition-all duration-200 hover:border-[#D5D5CE] hover:-translate-y-0.5">
          <span className="text-xs font-semibold text-[#0F0F10] flex items-center gap-1.5">
            <span>✨</span> 30,000+ founders launched here
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#5B5BF0]" />
          <span className="text-xs font-medium text-[#5B5BF0]">
            Explore Launches →
          </span>
        </div>

        {/* H1 Headline (Large: 64px desktop / 38px mobile) */}
        <h1 className="font-heading font-extrabold tracking-[-0.035em] text-[#0F0F10] text-[38px] sm:text-5xl lg:text-[64px] leading-[1.08] max-w-4xl mx-auto">
          Launch your product. Get seen. Get{" "}
          <span className="relative inline-block text-[#5B5BF0]">
            backlinks.
            <svg
              className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#5B5BF0]/25 -z-10"
              viewBox="0 0 100 12"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path d="M0,8 Q50,0 100,8 L100,12 Q50,4 0,12 Z" />
            </svg>
          </span>
        </h1>

        {/* Subheadline (Max 2 lines) */}
        <p className="mt-5 sm:mt-6 text-base sm:text-xl text-[#66666B] leading-relaxed max-w-2xl mx-auto">
          Daily launches, real upvotes, and a high-authority dofollow backlink
          for the top 3 products.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto h-12 px-7 text-base rounded-[10px] font-semibold"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            onClick={onSubmitClick}
          >
            Submit your product
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto h-12 px-7 text-base rounded-[10px]"
            onClick={onBrowseClick}
          >
            Browse launches
          </Button>
        </div>

        {/* Social Proof: 6 Overlapping Founder Avatars + Text + 5 Star Rating */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-[#66666B]">
          {/* 6 Overlapping Avatars */}
          <div className="flex items-center -space-x-2.5 overflow-hidden p-0.5">
            {founders.map((f, i) => (
              <div
                key={f.name}
                className="inline-block rounded-full ring-2 ring-white shadow-sm"
                title={f.name}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${f.color} text-[11px] font-bold text-white`}
                >
                  {f.name.split(" ").map((n) => n[0]).join("")}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0F0F10]">
              Trusted by 30,000+ makers
            </span>
            <span className="text-[#D5D5CE]">•</span>
            {/* 5-Star Rating */}
            <div className="flex items-center gap-1 text-[#F59E0B]">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]"
                  />
                ))}
              </div>
              <span className="font-semibold text-[#0F0F10] text-xs ml-0.5">
                5.0
              </span>
            </div>
          </div>
        </div>

        {/* Logo Strip: "As seen on" (Placeholder logos, grayscale, hover to color) */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-[#E8E8E3]/70 max-w-4xl mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#8E8E93] mb-6">
            AS SEEN ON & TRUSTED ACROSS THE STARTUP ECOSYSTEM
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {partnerLogos.map((logo) => (
              <div
                key={logo.name}
                className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-200 cursor-pointer text-[#0F0F10] hover:-translate-y-0.5"
                title={logo.name}
              >
                {logo.svg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

