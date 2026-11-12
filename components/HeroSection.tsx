"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface FeaturedItem {
  id: string;
  slug?: string;
  name: string;
  initials: string;
  category: string;
  tagline: string;
  upvotes: number;
  isHighlighted?: boolean;
  logoBg?: string;
  logoUrl?: string;
}

export interface HeroSectionProps {
  onSubmitClick?: () => void;
  onBrowseClick?: () => void;
  initialFeatured?: FeaturedItem[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSubmitClick,
  onBrowseClick,
  initialFeatured = [],
}) => {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedItem[]>(initialFeatured);
  const [isLoading, setIsLoading] = useState(initialFeatured.length === 0);

  useEffect(() => {
    fetch("/api/listings?featured=true&limit=3")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.featured && data.featured.length > 0) {
          setFeaturedProducts(
            data.featured.slice(0, 3).map((item: any, idx: number) => ({
              id: item.id,
              slug: item.slug,
              name: item.name,
              initials: item.initials || item.name.slice(0, 2).toUpperCase(),
              category: item.category,
              tagline: item.tagline,
              upvotes: item.upvotes || 250,
              isHighlighted: idx === 0,
              logoBg:
                idx === 0
                  ? "bg-[#14142B] text-white"
                  : idx === 1
                  ? "bg-[#F7F6FF] text-[#4F46E5]"
                  : "bg-[#ECFDF5] text-[#0F8A5F]",
              logoUrl: item.logoUrl,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="relative w-full bg-white py-12 md:py-[72px] lg:py-20 border-b border-[#E6E6F0]">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT COLUMN: HERO HEADLINE & ACTIONS (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill badge: • 30,000+ founders launch here */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E6F0] bg-white px-3.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0F8A5F] animate-pulse" />
              <span className="text-xs font-medium text-[#55556E]">
                30,000+ founders launch here
              </span>
            </div>

            {/* Main H1 Heading */}
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-[56px] leading-[1.08] tracking-[-0.035em] text-[#14142B]">
              Launch your product.
              <br />
              Get seen. Get{" "}
              <span className="text-[#4F46E5]">backlinks.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#55556E] leading-relaxed max-w-xl">
              Daily launches, curated directories, and a high-authority dofollow
              backlink for top featured products.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onSubmitClick}
                className="px-6 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Submit your product</span>
                <span>&rarr;</span>
              </button>

              <button
                type="button"
                onClick={onBrowseClick}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#F6F6FB] text-[#14142B] border border-[#E6E6F0] font-semibold text-sm transition-colors cursor-pointer"
              >
                Browse launches
              </button>
            </div>

            {/* AS SEEN ON */}
            <div className="pt-6 space-y-3">
              <div className="text-[11px] font-bold font-mono tracking-wider text-[#55556E] uppercase">
                AS SEEN ON
              </div>
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 opacity-70">
                <span className="font-heading font-extrabold text-sm sm:text-base text-[#14142B]">
                  TechCrunch
                </span>
                <span className="font-heading font-extrabold text-sm sm:text-base text-[#14142B]">
                  Hacker News
                </span>
                <span className="font-heading font-extrabold text-sm sm:text-base text-[#14142B]">
                  Product Hunt
                </span>
                <span className="font-heading font-extrabold text-sm sm:text-base text-[#14142B]">
                  Indie Hackers
                </span>
                <span className="font-heading font-extrabold text-sm sm:text-base text-[#14142B]">
                  Y Combinator
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FEATURED TODAY CARD (5 COLS) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 shadow-[0_12px_40px_rgba(20,20,43,0.08)] space-y-3.5">
              {/* Header: Featured today + SPONSORED badge + Promote yours link */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-[#14142B]">
                    Featured today
                  </span>
                  <span className="rounded-full bg-[#FFF1D6] text-[#7A4E00] text-[10px] font-bold px-2 py-0.5 tracking-wide uppercase">
                    SPONSORED
                  </span>
                </div>
                <Link
                  href="/pricing"
                  className="text-xs font-semibold text-[#4F46E5] hover:underline"
                >
                  Promote yours &rarr;
                </Link>
              </div>

              {/* Dynamic Featured Products List */}
              <div className="space-y-3">
                {isLoading && featuredProducts.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-[#55556E]">
                    Loading featured launches...
                  </div>
                ) : featuredProducts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#E6E6F0] p-6 text-center text-xs text-[#55556E]">
                    No sponsored tools active today.{" "}
                    <Link href="/pricing" className="text-[#4F46E5] font-semibold underline">
                      Be the first
                    </Link>
                  </div>
                ) : (
                  featuredProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug || p.id}`}
                      className={`rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer block ${
                        p.isHighlighted
                          ? "border-2 border-[#4F46E5] bg-[#F7F6FF]/30 hover:bg-[#F7F6FF]/50"
                          : "border border-[#E6E6F0] bg-white hover:border-[#D4D4E4] hover:bg-[#F6F6FB]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Logo Squircle */}
                        <div
                          className={`w-11 h-11 rounded-xl ${p.logoBg || "bg-[#14142B] text-white"} font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden shadow-2xs`}
                        >
                          {p.logoUrl ? (
                            <img src={p.logoUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            p.initials
                          )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-[#14142B] truncate">
                              {p.name}
                            </span>
                            <span className="rounded-md bg-[#F1F1F8] text-[#55556E] text-[11px] font-medium px-2 py-0.5">
                              {p.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#55556E] truncate mt-0.5">
                            {p.tagline}
                          </p>
                        </div>
                      </div>

                      {/* View CTA */}
                      <div className="rounded-lg bg-[#F6F6FB] group-hover:bg-[#EEEDFC] text-[#4F46E5] text-xs font-semibold px-2.5 py-1.5 transition-colors shrink-0 flex items-center gap-1">
                        <span>View</span>
                        <span>&rarr;</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
