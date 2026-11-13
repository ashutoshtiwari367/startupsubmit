"use client";

import React from "react";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "1",
      title: "Submit your product",
      description:
        "Add your logo, tagline and screenshots in under 3 minutes. No credit card needed.",
    },
    {
      number: "2",
      title: "Get discovered for 24 hours",
      description:
        "Rally your community and get discovered by 30,000+ indie hackers and early adopters.",
    },
    {
      number: "3",
      title: "Win a badge and spotlight",
      description:
        "Top 3 daily products get featured spotlight and a winner badge for their site.",
    },
  ];

  return (
    <section className="relative w-full max-w-[1240px] mx-auto px-6 py-10 md:py-14 space-y-8">
      {/* Centered Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#4F46E5] block">
          SIMPLE LAUNCH SYSTEM
        </span>
        <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] text-[#14142B] tracking-tight leading-tight">
          How it works
        </h2>
        <p className="text-sm sm:text-base text-[#55556E]">
          Three steps from submission to a high-authority backlink.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-7 hover:border-[#D4D4E4] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Step circle */}
              <div className="h-8 w-8 rounded-full bg-[#4F46E5] text-white font-bold flex items-center justify-center text-xs mb-4">
                {step.number}
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-base text-[#14142B] tracking-tight">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#55556E] mt-2 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
