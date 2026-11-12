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
  const [sponsors, setSponsors] = React.useState<any[]>(MOCK_SPONSORS);

  React.useEffect(() => {
    fetch("/api/listings?featured=true&limit=4")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.featured && data.featured.length > 0) {
          const gradients = [
            "from-[#4F46E5] to-[#7E7EF6]",
            "from-[#0F8A5F] to-[#34D399]",
            "from-[#EA580C] to-[#FB923C]",
            "from-[#7C3AED] to-[#A78BFA]",
          ];
          setSponsors(
            data.featured.map((f: any, idx: number) => ({
              id: f.id,
              name: f.name,
              tagline: f.tagline,
              badge: "Featured",
              url: `/product/${f.slug || f.id}`,
              initials: f.initials,
              gradient: gradients[idx % gradients.length],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);
  return (
    <section className="relative w-full max-w-[1240px] mx-auto px-6 py-12 md:py-[72px]">
      {/* Header bar: clearly labeled as sponsored but visually premium */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#4F46E5]" />
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#14142B]">
            Featured Sponsors
          </h3>
          <span className="text-[11px] text-[#55556E] hidden sm:inline">
            — Hand-picked high-velocity tools
          </span>
        </div>

        <button
          onClick={onReserveClick}
          className="text-xs font-semibold text-[#4F46E5] hover:text-[#4F46E5] transition-colors flex items-center gap-1 group"
        >
          <span>Promote your product</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Row of 3 sponsor cards + 1 dashed card */}
      {/* Mobile: horizontal scroll with snap */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {sponsors.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex-none w-[275px] sm:w-auto snap-start rounded-2xl p-[1px] transition-all duration-200 hover:-translate-y-1 block select-none"
          >
            {/* Subtle Gradient Border on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#4F46E5]/40 via-[#818CF8]/30 to-[#4F46E5]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Card Content Surface */}
            <div className="relative h-full w-full rounded-[13px] bg-white border border-[#E6E6F0] group-hover:border-transparent p-5 flex flex-col justify-between transition-all duration-200">
              <div>
                {/* Header: 48px Logo & "Featured" Badge */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${sponsor.gradient} text-white font-heading font-extrabold text-base  group-hover:scale-105 transition-transform duration-200`}
                  >
                    {sponsor.initials}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-[#F7F6FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#4338CA] border border-[#E0DEFC]">
                      Featured
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#55556E] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Product Name */}
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-heading font-bold text-base text-[#14142B] tracking-tight group-hover:text-[#4F46E5] transition-colors">
                    {sponsor.name}
                  </h4>
                  <span className="text-[10px] text-[#55556E] font-mono">
                    {sponsor.category}
                  </span>
                </div>

                {/* One-line Description */}
                <p className="text-xs text-[#55556E] leading-relaxed line-clamp-2">
                  {sponsor.tagline}
                </p>
              </div>

              {/* Bottom footer link */}
              <div className="mt-4 pt-3 border-t border-[#E6E6F0]/60 flex items-center justify-between text-[11px] text-[#55556E]">
                <span className="font-mono text-[#14142B] font-medium group-hover:text-[#4F46E5] transition-colors">
                  Visit tool
                </span>
                <span className="text-[#55556E] group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </div>
          </a>
        ))}

        {/* 4th Card: Dashed Border "Your product here" */}
        <div
          onClick={onReserveClick}
          className="group relative flex-none w-[275px] sm:w-auto snap-start rounded-2xl border-2 border-dashed border-[#D4D4E4] hover:border-[#4F46E5] bg-white/50 hover:bg-white p-5 transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div>
            {/* Top row: 48px Plus Icon Container & Action Tag */}
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#E6E6F0] bg-[#F6F6FB] text-[#4F46E5] group-hover:bg-[#F7F6FF] group-hover:border-[#E0DEFC] transition-all duration-200">
                <Plus className="h-5 w-5 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
              </div>

              <span className="rounded-full bg-[#F6F6FB] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#55556E] border border-[#E6E6F0]">
                1 Spot Left
              </span>
            </div>

            {/* Product Title */}
            <h4 className="font-heading font-bold text-base text-[#14142B] tracking-tight group-hover:text-[#4F46E5] transition-colors mb-1">
              Your product here
            </h4>

            {/* Description */}
            <p className="text-xs text-[#55556E] leading-relaxed">
              Get premium placement above daily launches and reach 30,000+ active founders.
            </p>
          </div>

          {/* Learn More link */}
          <div className="mt-4 pt-3 border-t border-[#E6E6F0]/60 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#4F46E5] group-hover:text-[#4F46E5] transition-colors flex items-center gap-1">
              <span>Learn more</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
            <span className="text-[10px] font-mono text-[#55556E]">
              From $99/mo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

