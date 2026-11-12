"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { SITE_CONFIG, type PlanId } from "@/config/site";

export interface PricingSectionProps {
  onSelectPlan?: (planId: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
}) => {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const plans = [
    {
      id: "free" as PlanId,
      name: "Free",
      price: "$0",
      period: "forever",
      popular: false,
      features: [
        "Review in 3 to 5 days",
        "Community launch visibility",
        "Permanent listing",
      ],
      ctaText: "Submit free",
      isPrimary: false,
    },
    {
      id: "premium" as PlanId,
      name: "Premium",
      price: "$29",
      period: "one-time",
      popular: true,
      features: [
        "Everything in Free",
        "Guaranteed 24h review",
        "Verified Maker badge",
      ],
      ctaText: "Get Premium",
      isPrimary: true,
    },
    {
      id: "featured" as PlanId,
      name: "Featured",
      price: "$49",
      period: "one-time",
      popular: false,
      features: [
        "Everything in Premium",
        "7 days on the homepage",
        "Newsletter spotlight",
      ],
      ctaText: "Get Featured",
      isPrimary: false,
    },
  ];

  const handlePlanClick = (planId: PlanId) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else {
      router.push(`/submit?plan=${planId}`);
    }
  };

  return (
    <section className="relative w-full max-w-[1240px] mx-auto px-6 py-10 md:py-14 space-y-8">
      {/* Centered Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#4F46E5] block">
          TRANSPARENT PRICING
        </span>
        <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] text-[#14142B] tracking-tight leading-tight">
          Simple launch plans for every stage
        </h2>
        <p className="text-sm sm:text-base text-[#55556E]">
          Start free. Upgrade only when you want to move faster.
        </p>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#DC2626] flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* 3 Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
        {plans.map((plan) => {
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl bg-white p-6 sm:p-7 flex flex-col justify-between transition-all ${
                plan.popular
                  ? "border-2 border-[#4F46E5] shadow-[0_12px_40px_rgba(20,20,43,0.08)]"
                  : "border border-[#E6E6F0] hover:border-[#D4D4E4]"
              }`}
            >
              {/* Popular Pill */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#4F46E5] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-bold text-base text-[#14142B]">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline mt-3 pb-5 border-b border-[#F1F1F8]">
                  <span className="font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-[#55556E] ml-2 font-medium">
                    {plan.period}
                  </span>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-3 py-6">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-xs sm:text-sm text-[#55556E]"
                    >
                      <span className="text-[#0F8A5F] font-bold text-xs shrink-0">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handlePlanClick(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    plan.isPrimary
                      ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                      : "bg-white hover:bg-[#F6F6FB] text-[#14142B] border border-[#D4D4E4]"
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    plan.ctaText
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
