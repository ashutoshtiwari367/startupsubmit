"use client";

import React from "react";
import { Badge } from "@/components/Badge";
import { MOCK_SPONSORS, SponsorProduct } from "@/lib/mock-data";
import { Plus, ArrowRight, ExternalLink, Sparkles } from "lucide-react";

export interface FeaturedSponsorsProps {
  onReserveClick?: () => void;
}

export const FeaturedSponsors: React.FC<FeaturedSponsorsProps> = ({
  onReserveClick,
}) => {
  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header bar: clearly labeled as sponsored but visually premium */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#5B5BF0]" />
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0F0F10]">
            Featured Sponsors
          </h3>
          <span className="text-[11px] text-[#8E8E93] hidden sm:inline">
            — Hand-picked high-velocity tools
          </span>
        </div>

        <button
          onClick={onReserveClick}
          className="text-xs font-semibold text-[#5B5BF0] hover:text-[#4B4BE5] transition-colors flex items-center gap-1 group"
        >
          <span>Promote your product</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Row of 3 sponsor cards + 1 dashed card */}
      {/* Mobile: horizontal scroll with snap */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {MOCK_SPONSORS.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex-none w-[275px] sm:w-auto snap-start rounded-[14px] p-[1px] transition-all duration-200 hover:-translate-y-1 block select-none"
          >
            {/* Subtle Gradient Border on hover */}
            <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-[#5B5BF0]/40 via-[#818CF8]/30 to-[#5B5BF0]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Card Content Surface */}
            <div className="relative h-full w-full rounded-[13px] bg-white border border-[#E8E8E3] group-hover:border-transparent p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] group-hover:shadow-[0_8px_24px_rgba(91,91,240,0.09)] flex flex-col justify-between transition-all duration-200">
              <div>
                {/* Header: 48px Logo & "Featured" Badge */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${sponsor.gradient} text-white font-heading font-extrabold text-base shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-200`}
                  >
                    {sponsor.initials}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-[#EEF0FE] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#4338CA] border border-[#D5D8FC]">
                      Featured
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Product Name */}
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-heading font-bold text-base text-[#0F0F10] tracking-tight group-hover:text-[#5B5BF0] transition-colors">
                    {sponsor.name}
                  </h4>
                  <span className="text-[10px] text-[#8E8E93] font-mono">
                    {sponsor.category}
                  </span>
                </div>

                {/* One-line Description */}
                <p className="text-xs text-[#66666B] leading-relaxed line-clamp-2">
                  {sponsor.tagline}
                </p>
              </div>

              {/* Bottom footer link */}
              <div className="mt-4 pt-3 border-t border-[#E8E8E3]/60 flex items-center justify-between text-[11px] text-[#8E8E93]">
                <span className="font-mono text-[#0F0F10] font-medium group-hover:text-[#5B5BF0] transition-colors">
                  Visit tool
                </span>
                <span className="text-[#8E8E93] group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </div>
          </a>
        ))}

        {/* 4th Card: Dashed Border "Your product here" */}
        <div
          onClick={onReserveClick}
          className="group relative flex-none w-[275px] sm:w-auto snap-start rounded-[14px] border-2 border-dashed border-[#D5D5CE] hover:border-[#5B5BF0] bg-white/50 hover:bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(91,91,240,0.06)] cursor-pointer flex flex-col justify-between"
        >
          <div>
            {/* Top row: 48px Plus Icon Container & Action Tag */}
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#E8E8E3] bg-[#FAFAF7] text-[#5B5BF0] group-hover:bg-[#EEF0FE] group-hover:border-[#D5D8FC] transition-all duration-200">
                <Plus className="h-5 w-5 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
              </div>

              <span className="rounded-full bg-[#FAFAF7] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#66666B] border border-[#E8E8E3]">
                1 Spot Left
              </span>
            </div>

            {/* Product Title */}
            <h4 className="font-heading font-bold text-base text-[#0F0F10] tracking-tight group-hover:text-[#5B5BF0] transition-colors mb-1">
              Your product here
            </h4>

            {/* Description */}
            <p className="text-xs text-[#66666B] leading-relaxed">
              Get premium placement above daily launches and reach 30,000+ active founders.
            </p>
          </div>

          {/* Learn More link */}
          <div className="mt-4 pt-3 border-t border-[#E8E8E3]/60 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#5B5BF0] group-hover:text-[#4B4BE5] transition-colors flex items-center gap-1">
              <span>Learn more</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
            <span className="text-[10px] font-mono text-[#8E8E93]">
              From $99/mo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

