"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowBigUp,
  Award,
  Link2,
  TrendingUp,
  Users,
  MessageSquare,
  Search,
  Globe,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Flame,
  Layers,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";

export const HowItWorksSection: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER: HOW IT WORKS                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#5B5BF0]/20 bg-[#EEF0FE] px-3 py-1 text-xs font-semibold text-[#5B5BF0]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Simple, Transparent Launch System</span>
        </div>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0F0F10] tracking-[-0.03em]">
          How it works
        </h2>
        <p className="text-sm sm:text-base text-[#66666B]">
          Three straightforward steps from submitting your product to claiming your high-authority backlink and community recognition.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3 NUMBERED STEPS CONNECTED BY A DASHED LINE                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative">
        {/* Desktop Dashed Connecting Line */}
        <div
          className="hidden md:block absolute top-[88px] left-[16%] right-[16%] h-[2px] border-t-2 border-dashed border-[#D5D5CE] z-0 pointer-events-none"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-6 relative z-10">
          {/* STEP 1 */}
          <div className="group relative flex flex-col items-center text-center">
            {/* Step Number Badge */}
            <div className="relative mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#5B5BF0] text-[#5B5BF0] font-heading font-black text-base shadow-[0_2px_8px_rgba(91,91,240,0.15)] group-hover:bg-[#5B5BF0] group-hover:text-white transition-colors duration-200">
                1
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#FAFAF7] border border-[#E8E8E3] text-[10px] font-mono font-bold text-[#8E8E93] uppercase tracking-wider">
                Step
              </span>
            </div>

            {/* Step Illustration Card */}
            <div className="w-full max-w-sm rounded-[14px] border border-[#E8E8E3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col items-center text-left">
              {/* Mini UI Illustration */}
              <div className="w-full rounded-[10px] bg-[#FAFAF7] border border-[#E8E8E3] p-3.5 mb-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-[#8E8E93] font-mono">
                  <span>launch-form.tsx</span>
                  <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    Instant draft
                  </span>
                </div>
                {/* Mock inputs */}
                <div className="space-y-1.5">
                  <div className="h-7 w-full rounded-[6px] bg-white border border-[#E8E8E3] px-2.5 flex items-center text-xs text-[#0F0F10] font-medium">
                    <span className="text-[#8E8E93] mr-1">https://</span>yourproduct.com
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-full bg-[#EEF0FE] text-[#5B5BF0] px-2 py-0.5 text-[10px] font-semibold">
                      AI & SaaS
                    </span>
                    <span className="rounded-full bg-[#F3F4F6] text-[#66666B] px-2 py-0.5 text-[10px] font-semibold">
                      Dofollow Ready
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="font-heading font-bold text-lg text-[#0F0F10] tracking-tight mb-1.5">
                1. Submit your product
              </h3>
              <p className="text-xs sm:text-sm text-[#66666B] leading-relaxed">
                Add your product tagline, logo, live URL, and founder story in under 2 minutes. No credit card required.
              </p>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="group relative flex flex-col items-center text-center">
            {/* Step Number Badge */}
            <div className="relative mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#5B5BF0] text-[#5B5BF0] font-heading font-black text-base shadow-[0_2px_8px_rgba(91,91,240,0.15)] group-hover:bg-[#5B5BF0] group-hover:text-white transition-colors duration-200">
                2
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#FAFAF7] border border-[#E8E8E3] text-[10px] font-mono font-bold text-[#8E8E93] uppercase tracking-wider">
                Step
              </span>
            </div>

            {/* Step Illustration Card */}
            <div className="w-full max-w-sm rounded-[14px] border border-[#E8E8E3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col items-center text-left">
              {/* Mini UI Illustration */}
              <div className="w-full rounded-[10px] bg-[#FAFAF7] border border-[#E8E8E3] p-3.5 mb-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#8E8E93] font-mono">
                  <span className="flex items-center gap-1 text-[#EA580C] font-semibold">
                    <Clock className="h-3 w-3" />
                    24h Countdown
                  </span>
                  <span className="font-bold text-[#0F0F10]">14:22:05</span>
                </div>
                {/* Mock Upvote Interaction */}
                <div className="rounded-[8px] bg-white border border-[#E8E8E3] p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-[6px] bg-[#5B5BF0] text-white flex items-center justify-center font-bold text-xs">
                      P
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F0F10]">PulseAI</div>
                      <div className="text-[10px] text-[#10B981] font-semibold flex items-center gap-0.5">
                        <Flame className="h-2.5 w-2.5" /> +14 votes / hr
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-[#EEF0FE] text-[#5B5BF0] px-2.5 py-1 text-xs font-bold shadow-xs">
                    <ArrowBigUp className="h-3.5 w-3.5 fill-current" />
                    <span>284</span>
                  </div>
                </div>
              </div>

              <h3 className="font-heading font-bold text-lg text-[#0F0F10] tracking-tight mb-1.5">
                2. Get upvotes for 24 hours
              </h3>
              <p className="text-xs sm:text-sm text-[#66666B] leading-relaxed">
                Rally your community and get discovered by 30,000+ indie hackers, early adopters, and active tech buyers.
              </p>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="group relative flex flex-col items-center text-center">
            {/* Step Number Badge */}
            <div className="relative mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#5B5BF0] text-[#5B5BF0] font-heading font-black text-base shadow-[0_2px_8px_rgba(91,91,240,0.15)] group-hover:bg-[#5B5BF0] group-hover:text-white transition-colors duration-200">
                3
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#FAFAF7] border border-[#E8E8E3] text-[10px] font-mono font-bold text-[#8E8E93] uppercase tracking-wider">
                Step
              </span>
            </div>

            {/* Step Illustration Card */}
            <div className="w-full max-w-sm rounded-[14px] border border-[#E8E8E3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col items-center text-left">
              {/* Mini UI Illustration */}
              <div className="w-full rounded-[10px] bg-[#FAF9FF] border border-[#D5D8FC] p-3.5 mb-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-[#B45309] font-bold">
                    <Award className="h-3.5 w-3.5 text-[#F59E0B]" />
                    Daily Top 3
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#DCFCE7] text-[#16A34A] text-[10px] font-bold">
                    Dofollow Active
                  </span>
                </div>
                {/* Embeddable badge preview */}
                <div className="rounded-[8px] bg-white border border-[#E8E8E3] p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-[6px] bg-linear-to-br from-[#FEF3C7] to-[#FDE68A] text-[#B45309] flex items-center justify-center font-bold text-xs border border-[#FCD34D]">
                      🏆
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#0F0F10]">#1 Product of the Day</div>
                      <div className="text-[9px] text-[#5B5BF0] font-mono">rel="dofollow" DR 72+</div>
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                </div>
              </div>

              <h3 className="font-heading font-bold text-lg text-[#0F0F10] tracking-tight mb-1.5">
                3. Win a badge + backlink
              </h3>
              <p className="text-xs sm:text-sm text-[#66666B] leading-relaxed">
                Top 3 daily products automatically win an embeddable winner badge and a permanent high-authority dofollow backlink.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BENEFITS GRID: BENTO LAYOUT (6 CARDS)                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-8 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="accent" size="sm" icon={<Award className="h-3 w-3" />}>
            FOUNDER BENEFITS
          </Badge>
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F0F10] tracking-[-0.03em]">
            Built to boost your domain authority and traffic
          </h3>
          <p className="text-xs sm:text-sm text-[#66666B]">
            Every launch is engineered to deliver immediate customer traction and lasting technical SEO gains.
          </p>
        </div>

        {/* Bento Grid: 1 large featured card (spans 2 cols on lg) + 5 modular cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* ============================================================== */}
          {/* BENTO CARD 1 (LARGE HIGHLIGHTED: HIGH-AUTHORITY BACKLINKS)     */}
          {/* ============================================================== */}
          <div className="lg:col-span-2 group relative overflow-hidden rounded-[14px] border-2 border-[#5B5BF0]/40 bg-linear-to-br from-white via-[#FAF9FF] to-[#F1F2FE] p-6 sm:p-7 shadow-[0_2px_12px_rgba(91,91,240,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(91,91,240,0.12)]">
            {/* Top Row: Tag & Live Indicator */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5B5BF0] text-white px-3 py-1 text-xs font-bold shadow-xs">
                <Link2 className="h-3.5 w-3.5" />
                Featured Benefit
              </span>
              <span className="font-mono text-xs text-[#5B5BF0] font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                100% Google Safe & Indexed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Left Column: Copy */}
              <div className="sm:col-span-7 space-y-3">
                <h4 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F0F10] tracking-tight leading-tight">
                  High-authority backlinks
                </h4>
                <p className="text-sm text-[#47474F] leading-relaxed">
                  Earn clean, direct editorial backlinks with strict <code className="font-mono text-xs bg-[#EEF0FE] text-[#5B5BF0] px-1.5 py-0.5 rounded font-bold">rel="dofollow"</code> attributes. Boost your search rankings with legitimate domain equity that compounds over time.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#10B981]">
                    <CheckCircle2 className="h-4 w-4" /> Permanent editorial backlink
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#10B981]">
                    <CheckCircle2 className="h-4 w-4" /> Zero redirect wrappers
                  </div>
                </div>
              </div>

              {/* Right Column: DR 72+ Stat Badge & SEO Metric Visual */}
              <div className="sm:col-span-5 flex flex-col items-center sm:items-end">
                <div className="w-full max-w-[240px] rounded-[12px] bg-white border border-[#D5D8FC] p-4 shadow-[0_4px_16px_rgba(91,91,240,0.08)] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8E8E3] pb-2">
                    <span className="text-[11px] font-mono text-[#8E8E93] uppercase tracking-wider">Domain Rating</span>
                    <span className="text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A] px-1.5 py-0.5 rounded">Ahrefs Verified</span>
                  </div>
                  
                  {/* Big Hero DR Stat */}
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading font-black text-4xl text-[#5B5BF0] tracking-tight">
                      DR 72+
                    </span>
                    <span className="text-xs font-semibold text-[#10B981] flex items-center">
                      <TrendingUp className="h-3 w-3 mr-0.5" /> +4.2
                    </span>
                  </div>

                  {/* Micro metric bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#66666B]">
                      <span>Indexed URLs</span>
                      <span className="font-bold text-[#0F0F10]">99.8%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#EEF0FE] overflow-hidden">
                      <div className="h-full w-[94%] bg-[#5B5BF0] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* BENTO CARD 2: WINNER BADGES                                    */}
          {/* ============================================================== */}
          <div className="group rounded-[14px] border border-[#E8E8E3] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-[10px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-full font-bold">
                  SVG / PNG
                </span>
              </div>
              <h4 className="font-heading font-bold text-lg text-[#0F0F10] tracking-tight mb-1.5">
                Winner badges
              </h4>
              <p className="text-xs sm:text-sm text-[#66666B] leading-relaxed mb-4">
                Embed your shiny Gold, Silver, or Bronze badge directly on your landing page and README to boost social proof.
              </p>
            </div>

            {/* Micro Badge Snippet Preview */}
            <div className="rounded-[8px] bg-[#FAFAF7] border border-[#E8E8E3] p-2 flex items-center justify-between text-xs font-mono text-[#66666B]">
              <span className="truncate max-w-[170px]">&lt;img src="badge-1st.svg" /&gt;</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] text-[#5B5BF0] font-semibold hover:underline"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-[#10B981]" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedCode ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* BENTO CARD 3: FOUNDER VISIBILITY                               */}
          {/* ============================================================== */}
          <div className="group rounded-[14px] border border-[#E8E8E3] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-[10px] bg-[#EEF0FE] text-[#5B5BF0] flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] text-[#5B5BF0] bg-[#EEF0FE] px-2 py-0.5 rounded-full font-bold">
                  30,000+ Makers
                </span>
              </div>
              <h4 className="font-heading font-bold text-lg text-[#0F0F10] tracking-tight mb-1.5">
                Founder visibility
              </h4>
              <p className="text-xs sm:text-sm text-[#66666B] leading-relaxed">
                Connect directly with tech scouts, early adopters, and fellow founders who actively share launches on X and LinkedIn.
              </p>
            </div>

            {/* Overlapping Avatars Row */}
            <div className="mt-4 pt-3 border-t border-[#E8E8E3] flex items-center justify-between">
              <div className="flex -space-x-2">
                {["AM", "ER", "MC", "SL", "+4k"].map((initial, i) => (
                  <div
                    key={i}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-xs ${
                      i === 0 ? "bg-[#5B5BF0]" : i === 1 ? "bg-[#059669]" : i === 2 ? "bg-[#D97706]" : i === 3 ? "bg-[#DB2777]" : "bg-[#0F0F10]"
                    }`}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-mono text-[#8E8E93]">Audience</span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* BENTO CARD 4: REAL USER FEEDBACK                               */}
          {/* ============================================================== */}
          <div className="group rounded-[14px] border border-[#E8E8E3] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-[10px] bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] text-[#059669] bg-[#DCFCE7] px-2 py-0.5 rounded-full font-bold">
                  Verified Makers
                </span>
              </div>
              <h4 className="font-heading font-bold text-lg text-[#0F0F10] tracking-tight mb-1.5">
                Real user feedback
              </h4>
              <p className="text-xs sm:text-sm text-[#66666B] leading-relaxed">
                Receive candid reviews, feature suggestions, and bug reports from technical builders who understand product design.
              </p>
            </div>

            {/* Mock mini quote */}
            <div className="mt-4 pt-3 border-t border-[#E8E8E3] flex items-center gap-2 text-xs text-[#66666B]">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <span className="italic truncate">"Onboarded 40 new users on day 1..."</span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* BENTO CARD 5: SEO BOOST                                        */}
          {/* ============================================================== */}
          <div className="group rounded-[14px] border border-[#E8E8E3] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-[10px] bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center">
                  <Search className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] text-[#DB2777] bg-[#FDF2F8] px-2 py-0.5 rounded-full font-bold">
                  Organic Traffic
                </span>
              </div>
              <h4 className="font-heading font-bold text-lg text-[#0F0F10] tracking-tight mb-1.5">
                SEO boost
              </h4>
              <p className="text-xs sm:text-sm text-[#66666B] leading-relaxed">
                Fast indexing and schema-optimized product pages designed to rank for your brand name and long-tail category keywords.
              </p>
            </div>

            {/* Keyword Ranking snippet */}
            <div className="mt-4 pt-3 border-t border-[#E8E8E3] flex items-center justify-between text-xs font-mono">
              <span className="text-[#66666B] truncate max-w-[150px]">"ai customer success"</span>
              <span className="font-bold text-[#10B981] flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> Pos #1
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* BENTO CARD 6: LIFETIME LISTING PAGE                            */}
          {/* ============================================================== */}
          <div className="group rounded-[14px] border border-[#E8E8E3] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-[10px] bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] text-[#0284C7] bg-[#F0F9FF] px-2 py-0.5 rounded-full font-bold">
                  Permanent Archive
                </span>
              </div>
              <h4 className="font-heading font-bold text-lg text-[#0F0F10] tracking-tight mb-1.5">
                Lifetime listing page
              </h4>
              <p className="text-xs sm:text-sm text-[#66666B] leading-relaxed">
                Your product page remains indexed forever in our searchable archive with maker credits and direct website referral links.
              </p>
            </div>

            {/* Permanent URL badge */}
            <div className="mt-4 pt-3 border-t border-[#E8E8E3] flex items-center justify-between text-xs font-mono text-[#8E8E93]">
              <span className="truncate max-w-[180px]">launchos.com/p/your-tool</span>
              <span className="text-[#10B981] font-semibold">Live Forever</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

