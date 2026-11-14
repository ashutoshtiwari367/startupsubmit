"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SITE_INFO } from "@/config/site-info";

export interface FeaturedItem {
  id: string;
  slug?: string;
  name: string;
  initials: string;
  category: string;
  tagline: string;
  upvotes: number;
  isHighlighted?: boolean;
  isFeaturedActive?: boolean;
  featuredDaysRemaining?: number;
  listingPlan?: string;
  logoBg?: string;
  logoUrl?: string;
}

export interface HeroSectionProps {
  onSubmitClick?: () => void;
  onBrowseClick?: () => void;
  initialFeatured?: FeaturedItem[];
}

const FALLBACK_FEATURED: FeaturedItem[] = [
  {
    id: "f-1",
    slug: "cortex-ai",
    name: "Cortex AI",
    initials: "CA",
    category: "AI Agents",
    tagline: "Autonomous customer success agents for modern B2B SaaS teams.",
    upvotes: 386,
    isHighlighted: true,
    logoBg: "bg-[#14142B] text-white",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop&q=80",
  },
  {
    id: "f-2",
    slug: "vector-flow",
    name: "VectorFlow",
    initials: "VF",
    category: "Developer Tools",
    tagline: "Instant vector database deployment with zero cold starts.",
    upvotes: 276,
    logoBg: "bg-[#F7F6FF] text-[#4F46E5]",
    logoUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&h=200&fit=crop&q=80",
  },
  {
    id: "f-3",
    slug: "prism-studio",
    name: "Prism Studio",
    initials: "PS",
    category: "Design",
    tagline: "Turn design system tokens into production React code.",
    upvotes: 231,
    logoBg: "bg-[#ECFDF5] text-[#0F8A5F]",
    logoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop&q=80",
  },
  {
    id: "f-4",
    slug: "supaship",
    name: "Supaship",
    initials: "SS",
    category: "Building Products",
    tagline: "Ship your Next.js SaaS in days. Auth, Stripe and DB ready.",
    upvotes: 412,
    logoBg: "bg-[#14142B] text-white",
    logoUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop&q=80",
  },
  {
    id: "f-5",
    slug: "aether-db",
    name: "AetherDB",
    initials: "AD",
    category: "Developer Tools",
    tagline: "Serverless Postgres with instant branching.",
    upvotes: 345,
    logoBg: "bg-[#F7F6FF] text-[#4F46E5]",
    logoUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop&q=80",
  },
  {
    id: "f-6",
    slug: "agent-flow",
    name: "AgentFlow",
    initials: "AF",
    category: "AI Agents",
    tagline: "Visual canvas for multi-agent workflows.",
    upvotes: 298,
    isHighlighted: true,
    logoBg: "bg-[#14142B] text-white",
    logoUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&h=200&fit=crop&q=80",
  },
  {
    id: "f-7",
    slug: "pulse-grid",
    name: "PulseGrid",
    initials: "PG",
    category: "Monitoring",
    tagline: "Minimalist server health and cron monitoring for indie teams.",
    upvotes: 189,
    logoBg: "bg-[#ECFDF5] text-[#0F8A5F]",
    logoUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop&q=80",
  },
  {
    id: "f-8",
    slug: "prompt-smith",
    name: "PromptSmith",
    initials: "PS",
    category: "Artificial Intelligence",
    tagline: "Automated prompt regression testing and cost optimization.",
    upvotes: 141,
    logoBg: "bg-[#F7F6FF] text-[#4F46E5]",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop&q=80",
  },
  {
    id: "f-9",
    slug: "trace-kit",
    name: "TraceKit",
    initials: "TK",
    category: "Developer Tools",
    tagline: "Distributed OpenTelemetry logging with zero-instrumentation config.",
    upvotes: 114,
    logoBg: "bg-[#14142B] text-white",
    logoUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=200&h=200&fit=crop&q=80",
  },
  {
    id: "f-10",
    slug: "seo-engine",
    name: "SEOEngine",
    initials: "SE",
    category: "SEO",
    tagline: "Programmatic keyword clustering and landing page generation.",
    upvotes: 85,
    logoBg: "bg-[#F7F6FF] text-[#4F46E5]",
    logoUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop&q=80",
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSubmitClick,
  onBrowseClick,
  initialFeatured = [],
}) => {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedItem[]>(
    initialFeatured.length >= 10 ? initialFeatured : FALLBACK_FEATURED
  );
  const [isLoading, setIsLoading] = useState(initialFeatured.length === 0);

  useEffect(() => {
    fetch("/api/listings?limit=60")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          const activeFeaturedPool = Array.isArray(data.featured) ? data.featured : [];
          const premiumPool = Array.isArray(data.premium) ? data.premium : [];
          const freePool = Array.isArray(data.free) ? data.free : [];
          const listingsPool = Array.isArray(data.listings) ? data.listings : [];

          // 1. Active 7-day Featured listings come first (newest approved = #1 first place).
          // 2. Expired featured (>7 days) rotate out of the header; remaining slots (if <10)
          //    backfill with newest Premium -> Free -> non-expired approved listings.
          const seenIds = new Set<string>();
          const combined: any[] = [];

          for (const item of activeFeaturedPool) {
            const itemId = String(item.id);
            if (!seenIds.has(itemId)) {
              seenIds.add(itemId);
              combined.push(item);
            }
            if (combined.length >= 10) break;
          }

          if (combined.length < 10) {
            for (const item of [...premiumPool, ...freePool, ...listingsPool]) {
              if (item.listingPlan === "featured" && !item.isFeaturedActive) {
                continue; // 7-day header window expired — rotate out of header slots
              }
              const itemId = String(item.id);
              if (!seenIds.has(itemId)) {
                seenIds.add(itemId);
                combined.push(item);
              }
              if (combined.length >= 10) break;
            }
          }

          if (combined.length > 0) {
            const mappedCombined: FeaturedItem[] = combined.map((item: any, idx: number) => ({
              id: String(item.id),
              slug: item.slug,
              name: item.name,
              initials: item.initials || item.name.slice(0, 2).toUpperCase(),
              category: item.category || "SaaS",
              tagline: item.tagline || "",
              upvotes: item.upvotes || 200,
              isHighlighted: Boolean(item.isFeaturedActive) || idx === 0 || idx === 5,
              isFeaturedActive: Boolean(item.isFeaturedActive),
              featuredDaysRemaining: Number(item.featuredDaysRemaining || 0),
              listingPlan: item.listingPlan || "free",
              logoBg:
                idx % 3 === 0
                  ? "bg-[#14142B] text-white"
                  : idx % 3 === 1
                  ? "bg-[#F7F6FF] text-[#4F46E5]"
                  : "bg-[#ECFDF5] text-[#0F8A5F]",
              logoUrl: item.logoUrl,
            }));

            // Keep 5 left + 5 right symmetry if DB has fewer than 10 eligible listings
            if (mappedCombined.length < 10) {
              for (const fb of FALLBACK_FEATURED) {
                if (mappedCombined.length >= 10) break;
                if (!seenIds.has(fb.id)) {
                  mappedCombined.push(fb);
                }
              }
            }

            setFeaturedProducts(mappedCombined);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Split into exact 5 left cards and 5 right cards
  const leftProducts = featuredProducts.slice(0, 5);
  const rightProducts = featuredProducts.slice(5, 10);

  const renderProductCard = (p: FeaturedItem, isFirst: boolean = false) => (
    <Link
      key={p.id}
      href={`/product/${p.slug || p.id}`}
      className={`group rounded-xl p-2.5 sm:p-3 flex items-center gap-3 transition-all duration-150 cursor-pointer block border hover:-translate-y-0.5 ${
        p.isHighlighted || isFirst
          ? "border-[#4F46E5] bg-[#F7F6FF]/40 hover:bg-[#F7F6FF] shadow-2xs hover:shadow-xs"
          : "border-[#E6E6F0] bg-white hover:border-[#D4D4E4] hover:bg-[#F6F6FB]/80 shadow-[0_1px_3px_rgba(20,20,43,0.03)] hover:shadow-xs"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Logo Squircle */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${p.logoBg || "bg-[#14142B] text-white"} font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs border border-[#E6E6F0]/60`}
        >
          {p.logoUrl ? (
            <img src={p.logoUrl} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            p.initials
          )}
        </div>

        {/* Content - Clean, balanced, full available space */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5">
            <span className="font-bold text-xs sm:text-sm text-[#14142B] group-hover:text-[#4F46E5] transition-colors truncate">
              {p.name}
            </span>
            <span className="rounded-md bg-[#F1F1F8] text-[#55556E] text-[10px] font-medium px-1.5 py-0.5 shrink-0">
              {p.category}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#55556E] line-clamp-2 mt-0.5 leading-snug">
            {p.tagline}
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="relative w-full bg-white pt-5 pb-8 sm:pt-6 sm:pb-10 md:pt-6 md:pb-12 border-b border-[#E6E6F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          {/* ======================================================== */}
          {/* 1. LEFT COLUMN: 5 FEATURED CARDS (3 COLS ON DESKTOP)     */}
          {/* ======================================================== */}
          <div className="order-2 lg:order-1 lg:col-span-3">
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-3.5 sm:p-4 shadow-[0_8px_30px_rgba(20,20,43,0.04)] space-y-2.5">
              {/* Header */}
              <div className="flex items-center justify-between pb-1 border-b border-[#F1F1F8]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-[#14142B]">
                    {SITE_INFO.featuredTab.title}
                  </span>
                  <span className="rounded-full bg-[#FFF1D6] text-[#7A4E00] text-[9px] font-bold px-2 py-0.5 tracking-wide uppercase">
                    {SITE_INFO.featuredTab.badge}
                  </span>
                </div>
                <Link
                  href={SITE_INFO.featuredTab.promoteLink}
                  className="text-[11px] font-semibold text-[#4F46E5] hover:underline"
                >
                  {SITE_INFO.featuredTab.promoteText}
                </Link>
              </div>

              {/* 5 Cards List */}
              <div className="space-y-2">
                {leftProducts.map((p, idx) => renderProductCard(p, idx === 0))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. CENTER COLUMN: HERO HEADLINE & ACTIONS (6 COLS)       */}
          {/* ======================================================== */}
          <div className="order-1 lg:order-2 lg:col-span-6 text-center space-y-4 sm:space-y-5 px-2 sm:px-4">
            {/* Pill badge: • 30,000+ founders launch here */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E6F0] bg-white px-3.5 py-1.5 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#0F8A5F] animate-pulse" />
              <span className="text-xs font-medium text-[#55556E]">
                {SITE_INFO.hero.pillText}
              </span>
            </div>

            {/* Main H1 Heading */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] leading-[1.1] tracking-[-0.035em] text-[#14142B] max-w-2xl mx-auto">
              {SITE_INFO.hero.headlineLine1}
              <br />
              {SITE_INFO.hero.headlineLine2Prefix}
              <span className="text-[#4F46E5]">{SITE_INFO.hero.headlineLine2Highlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#55556E] leading-relaxed max-w-lg mx-auto">
              {SITE_INFO.hero.subtitle}
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={onSubmitClick}
                className="px-6 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>{SITE_INFO.hero.primaryCtaText}</span>
                <span>&rarr;</span>
              </button>

              <button
                type="button"
                onClick={onBrowseClick}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#F6F6FB] text-[#14142B] border border-[#E6E6F0] font-semibold text-sm transition-colors cursor-pointer"
              >
                {SITE_INFO.hero.secondaryCtaText}
              </button>
            </div>

            {/* AS SEEN ON */}
            <div className="pt-3 space-y-2">
              <div className="text-[10px] font-bold font-mono tracking-wider text-[#55556E] uppercase">
                {SITE_INFO.hero.asSeenOnLabel}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 opacity-70">
                {SITE_INFO.hero.asSeenOnLogos.map((brand) => (
                  <span
                    key={brand}
                    className="font-heading font-extrabold text-xs sm:text-sm text-[#14142B]"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. RIGHT COLUMN: 5 FEATURED CARDS (3 COLS ON DESKTOP)    */}
          {/* ======================================================== */}
          <div className="order-3 lg:order-3 lg:col-span-3">
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-3.5 sm:p-4 shadow-[0_8px_30px_rgba(20,20,43,0.04)] space-y-2.5">
              {/* Header */}
              <div className="flex items-center justify-between pb-1 border-b border-[#F1F1F8]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-[#14142B]">
                    {SITE_INFO.featuredTab.rightTitle || "Top Sponsors"}
                  </span>
                  <span className="rounded-full bg-[#E0DEFC] text-[#4F46E5] text-[9px] font-bold px-2 py-0.5 tracking-wide uppercase">
                    {SITE_INFO.featuredTab.rightBadge || "SPOTLIGHT"}
                  </span>
                </div>
                <Link
                  href={SITE_INFO.featuredTab.promoteLink}
                  className="text-[11px] font-semibold text-[#4F46E5] hover:underline"
                >
                  {SITE_INFO.featuredTab.promoteText}
                </Link>
              </div>

              {/* 5 Cards List */}
              <div className="space-y-2">
                {rightProducts.map((p, idx) => renderProductCard(p, idx === 0))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
