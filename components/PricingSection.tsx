"use client";

import React, { useState } from "react";
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Award,
  Link2,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  popular?: boolean;
  badge?: string;
  features: string[];
  ctaText: string;
  ctaVariant: "primary" | "secondary" | "ghost";
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For bootstrapped indie hackers testing early product-market traction.",
    features: [
      "Standard 24h launch leaderboard queue",
      "Community upvoting & feedback thread",
      "Permanent searchable product listing",
      "Dofollow backlink if you finish in Top 3",
      "Standard queue (3-5 days review)",
    ],
    ctaText: "Submit for Free",
    ctaVariant: "secondary",
  },
  {
    id: "premium",
    name: "Premium Launch",
    price: "$39",
    period: "one-time payment",
    popular: true,
    badge: "Most popular",
    description: "Guaranteed launch date, instant indexing, and permanent DR 72+ backlink equity.",
    features: [
      "Everything in Free, plus:",
      "Guaranteed launch date within 24 hours",
      "Guaranteed permanent dofollow backlink (DR 72+)",
      "Verified Maker badge on all launch cards",
      "Featured in daily newsletter (12k+ founders)",
      "DoFollow target anchor customization",
    ],
    ctaText: "Get Premium Launch",
    ctaVariant: "primary",
  },
  {
    id: "featured",
    name: "Featured Spotlight",
    price: "$149",
    period: "one-time payment",
    badge: "Maximum Visibility",
    description: "Top-of-feed spotlight placement for funded startups and scaling AI products.",
    features: [
      "Everything in Premium Launch, plus:",
      "7 days sticky placement in Featured row",
      "#1 Leaderboard hero sponsor slot for 24h",
      "Dedicated shoutout on X (38,000+ followers)",
      "Permanent homepage partner link credit",
      "Priority 1-hour fast-track approval",
    ],
    ctaText: "Reserve Featured Spot",
    ctaVariant: "secondary",
  },
];

export interface PricingSectionProps {
  onSelectPlan?: (planId: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="accent" size="sm" icon={<Zap className="h-3 w-3" />}>
          TRANSPARENT PRICING
        </Badge>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0F0F10] tracking-[-0.03em]">
          Simple, one-time launch plans
        </h2>
        <p className="text-sm sm:text-base text-[#66666B]">
          No subscriptions, no hidden renewals. Pay once to submit, get seen by tens of thousands of founders, and permanently boost your domain authority.
        </p>
      </div>

      {/* 3 Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const isPopular = plan.popular;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-[16px] bg-white transition-all duration-200 ${
                isPopular
                  ? "border-2 border-[#5B5BF0] shadow-[0_8px_32px_rgba(91,91,240,0.12)] md:-translate-y-2"
                  : "border border-[#E8E8E3] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#D5D5CE]"
              } p-6 sm:p-7`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5B5BF0] px-3.5 py-1 text-xs font-bold text-white shadow-[0_2px_8px_rgba(91,91,240,0.35)]">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-extrabold text-xl text-[#0F0F10]">
                    {plan.name}
                  </h3>
                  {!isPopular && plan.badge && (
                    <span className="font-mono text-[10px] font-bold text-[#8E8E93] bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#66666B] min-h-[40px] leading-relaxed mb-5">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 border-b border-[#E8E8E3] pb-5 mb-5">
                  <span className="font-heading font-black text-4xl sm:text-5xl text-[#0F0F10] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs font-mono text-[#8E8E93]">
                    / {plan.period}
                  </span>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-3 mb-6">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E8E93] block">
                    What's included:
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => {
                      const isHeader = feature.includes("plus:");

                      return (
                        <li
                          key={idx}
                          className={`flex items-start gap-2.5 text-xs sm:text-sm ${
                            isHeader
                              ? "font-bold text-[#0F0F10] pt-1"
                              : "text-[#47474F]"
                          }`}
                        >
                          <div
                            className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                              isPopular
                                ? "bg-[#EEF0FE] text-[#5B5BF0]"
                                : "bg-[#ECFDF5] text-[#059669]"
                            }`}
                          >
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant={plan.ctaVariant}
                  size="md"
                  className={`w-full font-bold ${
                    isPopular
                      ? "bg-[#5B5BF0] hover:bg-[#4C4CE0] text-white shadow-[0_2px_10px_rgba(91,91,240,0.3)]"
                      : ""
                  }`}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => onSelectPlan?.(plan.id)}
                >
                  {plan.ctaText}
                </Button>
                <div className="mt-2.5 text-center text-[11px] font-mono text-[#8E8E93] flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>30-day money-back satisfaction guarantee</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="rounded-[14px] border border-[#E8E8E3] bg-[#FAFAF7] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-[#E8E8E3] text-[#5B5BF0] shadow-xs">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-[#0F0F10]">
              Need bulk launches or agency billing?
            </div>
            <div className="text-xs text-[#66666B]">
              We offer volume discounts and custom editorial partner backlink packages.
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-semibold text-[#5B5BF0] hover:text-[#4338CA]"
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
        >
          Contact Editorial Team
        </Button>
      </div>
    </section>
  );
};

