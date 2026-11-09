"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  ChevronDown,
  Lock,
  Flame,
  Award,
  Link2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { AuthModal } from "./AuthModal";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const PricingPageView: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"onetime" | "monthly">("onetime");
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(["pf-1", "pf-2"]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const prices = {
    free: "$0",
    premium: billingCycle === "onetime" ? "$39" : "$29",
    featured: billingCycle === "onetime" ? "$149" : "$99",
  };

  const periodLabels = {
    free: "forever",
    premium: billingCycle === "onetime" ? "one-time payment" : "per month, billed annually",
    featured: billingCycle === "onetime" ? "one-time payment" : "per month, billed annually",
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F0F10] selection:bg-[#5B5BF0]/15 selection:text-[#5B5BF0]">
      <Navbar />

      {/* Main Pricing Container */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5B5BF0]/20 bg-[#EEF0FE] px-3.5 py-1 text-xs font-bold text-[#5B5BF0]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Guaranteed High-Authority Distribution</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#0F0F10] tracking-[-0.03em] leading-tight">
            Simple pricing for ambitious builders
          </h1>

          <p className="text-sm sm:text-base text-[#66666B] leading-relaxed">
            Every launch is engineered for immediate customer acquisition and permanent DR 72+ search authority. Pick the tier that matches your speed.
          </p>

          {/* MONTHLY / ONE-TIME TOGGLE */}
          <div className="pt-3 flex items-center justify-center">
            <div className="inline-flex items-center rounded-full border border-[#E8E8E3] bg-white p-1.5 shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("onetime")}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "onetime"
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10]"
                }`}
              >
                One-time launch
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10]"
                }`}
              >
                <span>Agency / Monthly</span>
                <span className="rounded-full bg-[#ECFDF5] text-[#059669] px-2 py-0.2 text-[10px] font-extrabold">
                  Save 25%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 3 PLAN CARDS                                                       */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {/* PLAN 1: FREE */}
          <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#D5D5CE] transition-all flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-extrabold text-xl text-[#0F0F10]">
                  Free Launch
                </h2>
                <span className="text-[10px] font-mono font-bold bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 rounded-full text-[#8E8E93]">
                  Standard
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#66666B] min-h-[36px]">
                For bootstrapped indie hackers testing early product-market fit.
              </p>

              <div className="border-b border-[#E8E8E3] pb-5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-black text-4xl sm:text-5xl text-[#0F0F10]">
                    {prices.free}
                  </span>
                  <span className="text-xs font-mono text-[#8E8E93]">/ {periodLabels.free}</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#47474F]">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>Standard 24h leaderboard queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>Community upvotes & comments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>Permanent directory listing page</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>Dofollow link if in Top 3</span>
                </li>
                <li className="flex items-center gap-2 text-[#8E8E93]">
                  <X className="h-4 w-4 shrink-0 text-[#8E8E93]" />
                  <span className="line-through">Guaranteed instant launch</span>
                </li>
                <li className="flex items-center gap-2 text-[#8E8E93]">
                  <X className="h-4 w-4 shrink-0 text-[#8E8E93]" />
                  <span className="line-through">Homepage featured hero slot</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link href="/submit">
                <Button variant="secondary" size="md" className="w-full font-bold text-xs justify-center">
                  Submit Free (3-5d review)
                </Button>
              </Link>
            </div>
          </div>

          {/* PLAN 2: PREMIUM LAUNCH (HIGHLIGHTED) */}
          <div className="relative rounded-[18px] border-2 border-[#5B5BF0] bg-white p-6 sm:p-7 shadow-[0_12px_40px_rgba(91,91,240,0.14)] md:-translate-y-2 flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5B5BF0] px-4 py-1 text-xs font-bold text-white shadow-[0_2px_10px_rgba(91,91,240,0.4)]">
                <Sparkles className="h-3 w-3" />
                Most Popular
              </span>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-extrabold text-xl text-[#0F0F10]">
                  Premium Launch
                </h2>
                <span className="text-[10px] font-mono font-bold bg-[#EEF0FE] text-[#5B5BF0] px-2 py-0.5 rounded-full">
                  Fast-Track
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#66666B] min-h-[36px]">
                Guaranteed launch date, instant indexing, and permanent DR 72+ SEO equity.
              </p>

              <div className="border-b border-[#E8E8E3] pb-5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-black text-4xl sm:text-5xl text-[#0F0F10]">
                    {prices.premium}
                  </span>
                  <span className="text-xs font-mono text-[#8E8E93]">/ {periodLabels.premium}</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#0F0F10] font-medium">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#5B5BF0] shrink-0 stroke-[2.5]" />
                  <span>Everything in Free, plus:</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span className="font-bold">Guaranteed launch within 24 hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span className="font-bold">Permanent DR 72+ dofollow backlink</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>Newsletter blast to 30,000+ founders</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>Social spotlight shoutout on X (@launchos)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>Google Indexation ping via Indexing API</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link href="/submit">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full font-bold text-xs justify-center shadow-[0_4px_16px_rgba(91,91,240,0.35)]"
                >
                  Get Premium Launch &rarr;
                </Button>
              </Link>
            </div>
          </div>

          {/* PLAN 3: FEATURED SPOTLIGHT */}
          <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#D5D5CE] transition-all flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-extrabold text-xl text-[#0F0F10]">
                  Featured Spotlight
                </h2>
                <span className="text-[10px] font-mono font-bold bg-[#FEF9E7] text-[#B45309] border border-[#F7E5A9] px-2 py-0.5 rounded-full">
                  Maximum Reach
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#66666B] min-h-[36px]">
                Prime homepage banner real estate, 7-day sticky category hero, and VIP distribution.
              </p>

              <div className="border-b border-[#E8E8E3] pb-5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-black text-4xl sm:text-5xl text-[#0F0F10]">
                    {prices.featured}
                  </span>
                  <span className="text-xs font-mono text-[#8E8E93]">/ {periodLabels.featured}</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#47474F]">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#5B5BF0] shrink-0" />
                  <span>Everything in Premium Launch, plus:</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span className="font-bold text-[#0F0F10]">7 days pinned top-of-homepage sponsor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span className="font-bold text-[#0F0F10]">Dedicated standalone email blast</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>Pinned hero placement in your category</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>Priority 1-hour expedited editorial audit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>Custom founder interview blog feature</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link href="/submit">
                <Button variant="secondary" size="md" className="w-full font-bold text-xs justify-center">
                  Reserve Featured Spot
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MONEY BACK GUARANTEE STRIP                                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-[16px] border border-[#A7F3D0] bg-[#ECFDF5] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-white text-[#059669] flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#0F0F10]">
                100% Risk-Free 30-Day Money-Back Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-[#47474F] max-w-xl">
                If your submission is rejected by our editorial safety guidelines, or your dofollow backlink isn't indexed within 30 days, we issue a full unconditional refund. Zero friction.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-[#059669] font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Stripe Verified Refund SLA</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* DETAILED FEATURE COMPARISON TABLE WITH STICKY HEADER              */}
        {/* ------------------------------------------------------------------ */}
        <div className="space-y-6 pt-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="accent" size="sm">
              FULL SPECIFICATIONS
            </Badge>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F0F10] tracking-tight">
              Compare all features side-by-side
            </h2>
            <p className="text-xs sm:text-sm text-[#66666B]">
              Comprehensive technical breakdown of distribution, SEO equity, and editorial SLAs.
            </p>
          </div>

          <div className="rounded-[16px] border border-[#E8E8E3] bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                {/* STICKY HEADER */}
                <thead className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-[#E8E8E3]">
                  <tr>
                    <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-[#8E8E93] w-2/5">
                      Feature & Deliverable
                    </th>
                    <th className="py-4 px-4 text-center w-1/5">
                      <div className="font-heading font-bold text-sm text-[#0F0F10]">
                        Free Launch
                      </div>
                      <div className="text-xs text-[#8E8E93] font-mono">{prices.free}</div>
                    </th>
                    <th className="py-4 px-4 text-center w-1/5 bg-[#5B5BF0]/5 border-x border-[#5B5BF0]/20">
                      <div className="font-heading font-black text-sm text-[#5B5BF0]">
                        Premium Launch
                      </div>
                      <div className="text-xs text-[#5B5BF0] font-mono font-bold">
                        {prices.premium}
                      </div>
                    </th>
                    <th className="py-4 px-4 text-center w-1/5">
                      <div className="font-heading font-bold text-sm text-[#0F0F10]">
                        Featured Spotlight
                      </div>
                      <div className="text-xs text-[#8E8E93] font-mono">{prices.featured}</div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E8E8E3] text-xs sm:text-sm">
                  {/* CATEGORY: DISTRIBUTION */}
                  <tr className="bg-[#FAFAF7]">
                    <td
                      colSpan={4}
                      className="py-2.5 px-6 font-mono text-[11px] font-bold uppercase tracking-wider text-[#5B5BF0]"
                    >
                      1. Distribution & Visibility
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-[#0F0F10]">
                      24-Hour Leaderboard Window
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981]">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] bg-[#5B5BF0]/5 border-x border-[#5B5BF0]/20">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981]">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-[#0F0F10]">
                      Guaranteed Specific Launch Date
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93]">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] bg-[#5B5BF0]/5 border-x border-[#5B5BF0]/20 font-bold">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] font-bold">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-[#0F0F10]">
                      Pinned Homepage Sponsor Rail
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93]">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93] bg-[#5B5BF0]/5 border-x border-[#5B5BF0]/20">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] font-bold">
                      7 Days Included
                    </td>
                  </tr>

                  {/* CATEGORY: SEO & BACKLINKS */}
                  <tr className="bg-[#FAFAF7]">
                    <td
                      colSpan={4}
                      className="py-2.5 px-6 font-mono text-[11px] font-bold uppercase tracking-wider text-[#5B5BF0]"
                    >
                      2. SEO & Authority Building
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-[#0F0F10]">
                      Permanent Searchable Directory Page
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981]">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] bg-[#5B5BF0]/5 border-x border-[#5B5BF0]/20">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981]">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-[#0F0F10]">
                      Dofollow Backlink (Ahrefs DR 72+)
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93]">
                      Top 3 Finishers Only
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] bg-[#5B5BF0]/5 border-x border-[#5B5BF0]/20 font-bold">
                      Permanent Guaranteed
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] font-bold">
                      Permanent Guaranteed
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-[#0F0F10]">
                      Google Indexing API Trigger
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93]">
                      Standard Crawl
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] bg-[#5B5BF0]/5 border-x border-[#5B5BF0]/20">
                      Instant API Ping
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981]">
                      Instant API Ping
                    </td>
                  </tr>

                  {/* CATEGORY: COMMUNITY & OUTREACH */}
                  <tr className="bg-[#FAFAF7]">
                    <td
                      colSpan={4}
                      className="py-2.5 px-6 font-mono text-[11px] font-bold uppercase tracking-wider text-[#5B5BF0]"
                    >
                      3. Outreach & Review Time
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-[#0F0F10]">
                      Newsletter Distribution (30k+ Subscribers)
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93]">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] bg-[#5B5BF0]/5 border-x border-[#5B5BF0]/20">
                      Weekly Digest
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] font-bold">
                      Dedicated Solo Blast
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-[#0F0F10]">
                      Editorial Review Time
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#66666B] font-mono text-xs">
                      3-5 business days
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#5B5BF0] bg-[#5B5BF0]/5 border-x border-[#5B5BF0]/20 font-mono text-xs font-bold">
                      &lt; 24 hours
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#5B5BF0] font-mono text-xs font-bold">
                      &lt; 1 hour priority
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* BILLING & LAUNCH FAQ ACCORDION                                    */}
        {/* ------------------------------------------------------------------ */}
        <div className="space-y-6 pt-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F0F10] tracking-tight">
              Frequently asked pricing questions
            </h2>
            <p className="text-xs sm:text-sm text-[#66666B]">
              Common questions regarding payments, receipts, and backlink duration.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {[
              {
                id: "pf-1",
                q: "Are there any recurring subscriptions or hidden renewals?",
                a: "No. When you choose One-Time Launch ($39 or $149), you pay exactly once. Your product page, maker profile, and editorial dofollow backlink remain live perpetually with zero renewal fees.",
              },
              {
                id: "pf-2",
                q: "How does the backlink indexation guarantee work?",
                a: "Our domain holds an Ahrefs DR 72+ and is crawled by Googlebot multiple times per day. Your listing includes direct canonical schema. If for any reason your backlink isn't indexed by Google within 30 days, we issue an immediate 100% refund.",
              },
              {
                id: "pf-3",
                q: "Can digital marketing agencies buy bulk packages for clients?",
                a: "Yes! Our monthly plan is designed for incubators, venture studios, and SEO agencies shipping multiple client tools. You receive 3 guaranteed premium launches every month with priority fast-track review.",
              },
              {
                id: "pf-4",
                q: "What payment methods do you support?",
                a: "We process payments via Stripe. We support all major credit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and European SEPA transfers.",
              },
            ].map((faq) => {
              const isOpen = openFaqIds.includes(faq.id);

              return (
                <div
                  key={faq.id}
                  className="rounded-[14px] border border-[#E8E8E3] bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none cursor-pointer"
                  >
                    <span className="font-heading font-bold text-sm sm:text-base text-[#0F0F10] pr-4">
                      {faq.q}
                    </span>
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform ${
                        isOpen ? "bg-[#EEF0FE] text-[#5B5BF0] rotate-180" : "text-[#8E8E93]"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 sm:px-5 text-xs sm:text-sm text-[#52525A] leading-relaxed border-t border-[#E8E8E3]/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CTA BAND */}
        <div className="rounded-[20px] bg-linear-to-r from-[#4C4CE0] via-[#5B5BF0] to-[#7676F7] p-8 sm:p-12 text-center text-white space-y-5 shadow-[0_12px_40px_rgba(91,91,240,0.2)]">
          <h2 className="font-heading font-black text-2xl sm:text-4xl tracking-tight">
            Ready to boost your domain authority?
          </h2>
          <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto">
            Submit your SaaS or AI product now. Review takes under 24 hours.
          </p>
          <div className="pt-2">
            <Link href="/submit">
              <button
                type="button"
                className="rounded-[10px] bg-white px-7 py-3.5 text-sm font-extrabold text-[#5B5BF0] shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:bg-[#FAF9FF] transition-all cursor-pointer"
              >
                Submit your product today &rarr;
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      {/* Auth Modal Trigger */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
