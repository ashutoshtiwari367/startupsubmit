"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Rocket, CheckCircle2 } from "lucide-react";
import { Button } from "./Button";

export interface FinalCTAProps {
  onSubmitClick?: () => void;
  onBrowseClick?: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onSubmitClick,
  onBrowseClick,
}) => {
  return (
    <section className="relative w-full overflow-hidden bg-linear-to-br from-[#4338CA] via-[#4F46E5] to-[#7E7EF6] py-16 sm:py-24 text-white">
      {/* Decorative background glow & subtle dotted grid overlay */}
      <div
        className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#0F8A5F]/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 text-center space-y-7">
        {/* Kicker Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white">
          <Sparkles className="h-3.5 w-3.5 text-[#FDE68A]" />
          <span>Next daily launch period resets tonight at midnight PST</span>
        </div>

        {/* Headline */}
 <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] lg:text-6xl tracking-[-0.03em] leading-tight text-white max-w-3xl mx-auto">
          Ready to launch?
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto font-normal leading-relaxed">
          Join 30,000+ makers and founders. Submit your SaaS or AI product today, get instant community votes, and earn a permanent high-authority backlink.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={onSubmitClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-7 py-3.5 text-base font-extrabold text-[#4F46E5] hover:bg-[#F7F6FF] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Rocket className="h-4.5 w-4.5" />
            <span>Submit your product</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onBrowseClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/30 bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all duration-200 cursor-pointer"
          >
            Browse launches
          </button>
        </div>

        {/* Small kicker microcopy */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/75">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#A7F3D0]" />
            Takes 2 minutes
          </span>
          <span className="hidden sm:inline text-white/40">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#A7F3D0]" />
            No credit card required
          </span>
          <span className="hidden sm:inline text-white/40">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#A7F3D0]" />
            Free to submit
          </span>
        </div>
      </div>
    </section>
  );
};

