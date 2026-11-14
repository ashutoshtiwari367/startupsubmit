"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Search,
  CheckCircle2,
  Layers,
  Plus,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import type { MasterCategoryItem, CategoryToolItem } from "@/lib/categories";

export interface FeaturedToolSidebarItem {
  id: string | number;
  slug: string;
  name: string;
  tagline: string;
  logoUrl?: string;
  initials?: string;
  pricingModel?: string;
  category?: string;
  upvotes?: number;
  listingPlan?: string;
}

export interface CategoryDetailViewProps {
  category: MasterCategoryItem;
  initialTools: CategoryToolItem[];
  relatedCategories: MasterCategoryItem[];
  featuredTools?: FeaturedToolSidebarItem[];
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  initialTools,
  relatedCategories,
  featuredTools,
}) => {
  const [tools, setTools] = useState<CategoryToolItem[]>(initialTools);
  const [searchQuery, setSearchQuery] = useState("");
  const [pricingFilter, setPricingFilter] = useState<"all" | "Free" | "Freemium" | "Paid">("all");
  const [sortBy, setSortBy] = useState<"featured" | "name" | "comments">("featured");

  // Dynamic Featured Tools state for Sticky Sidebar (strictly max 3 cards)
  const [featuredList, setFeaturedList] = useState<FeaturedToolSidebarItem[]>(
    featuredTools && featuredTools.length > 0 ? featuredTools.slice(0, 3) : []
  );

  // Dynamically load approved featured products if not passed via SSR (max 3)
  useEffect(() => {
    if (featuredTools && featuredTools.length > 0) {
      setFeaturedList(featuredTools.slice(0, 3));
      return;
    }

    fetch("/api/listings?limit=10")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data.listings)) {
          const featured = data.listings.filter(
            (l: any) =>
              l.listingPlan === "featured" ||
              l.isFeaturedActive ||
              l.listingPlan === "premium" ||
              l.listingPlan === "one_time"
          );
          const list = featured.length > 0 ? featured : data.listings;
          setFeaturedList(
            list.slice(0, 3).map((l: any) => ({
              id: l.id,
              slug: l.slug,
              name: l.name,
              tagline: l.tagline,
              logoUrl: l.logoUrl,
              initials: l.initials || (l.name || "TL").slice(0, 2).toUpperCase(),
              pricingModel: l.pricing,
              category: l.category,
              upvotes: l.upvotes || 0,
              listingPlan: l.listingPlan,
            }))
          );
        }
      })
      .catch(() => {});
  }, [featuredTools]);

  const filteredTools = useMemo(() => {
    return tools
      .filter((t) => {
        const matchesQuery =
          !searchQuery.trim() ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPricing =
          pricingFilter === "all" || t.pricingModel === pricingFilter;

        return matchesQuery && matchesPricing;
      })
      .sort((a, b) => {
        if (sortBy === "comments") return b.commentsCount - a.commentsCount;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        const weight = (plan?: string) =>
          plan === "featured" ? 2 : plan === "premium" ? 1 : 0;
        const planDiff = weight(b.listingPlan) - weight(a.listingPlan);
        if (planDiff !== 0) return planDiff;
        const aTs = Date.parse(a.approvedAt || "") || 0;
        const bTs = Date.parse(b.approvedAt || "") || 0;
        return bTs - aTs;
      });
  }, [tools, searchQuery, pricingFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-12 space-y-3.5 sm:space-y-4 flex-1 w-full">
        {/* 1. Breadcrumb & Back Link */}
        <div className="flex items-center justify-between text-xs text-[#55556E] pb-0.5">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hover:text-[#14142B] transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/categories"
              className="hover:text-[#14142B] transition-colors"
            >
              Categories
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#14142B]">
              {category.name}
            </span>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 font-medium hover:text-[#4F46E5] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Categories</span>
          </Link>
        </div>

        {/* 2. Compact Category Hero Banner */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-5.5 space-y-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 sm:gap-4">
              {/* Squircle Pastel Icon */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${category.iconBg} ${category.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                {category.icon}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] bg-[#F7F6FF] px-2.5 py-0.5 rounded-full border border-[#E0DEFC]">
                    CATEGORY DIRECTORY
                  </span>
                  <span className="rounded-full bg-[#ECFDF5] text-[#0F8A5F] text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Launches
                  </span>
                </div>

                <h1 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-[#14142B] tracking-tight">
                  Best {category.name} Software &amp; Tools
                </h1>

                <p className="text-xs sm:text-sm text-[#55556E] leading-relaxed max-w-2xl">
                  {category.description}. Discover community-ranked tools, verified maker launches, and curated resources for top software.
                </p>
              </div>
            </div>

            {/* Quick Submit CTA */}
            <Link
              href={`/submit?category=${category.slug}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer shadow-sm self-start"
            >
              <Plus className="h-4 w-4" />
              <span>Submit a {category.name} Tool</span>
            </Link>
          </div>

          {/* Streamlined metrics strip (Removes bulky 4-card whitespace) */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#F1F1F8] text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F6F6FB] border border-[#E6E6F0] font-semibold text-[#14142B]">
              <Layers className="h-3.5 w-3.5 text-[#4F46E5]" />
              {tools.length} {tools.length === 1 ? "Product" : "Products"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F6F6FB] border border-[#E6E6F0] font-semibold text-[#14142B]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0F8A5F]" />
              Verified Launches
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F6F6FB] border border-[#E6E6F0] text-[#55556E]">
              Community Ranked &amp; Editorial Verified
            </span>
          </div>
        </div>

        {/* 3. Refine Controls Bar (Search + Pricing Tabs + Sort) - Close Spacing to Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-[#E6E6F0] bg-white p-2.5 sm:p-3 shadow-2xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8AA3]" />
            <input
              type="text"
              placeholder={`Search ${category.name} tools by name or keyword...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9.5 rounded-xl border border-[#D4D4E4] bg-[#FDFDFF] pl-9 pr-8 text-xs sm:text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:border-[#4F46E5] focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8A8AA3] hover:text-[#14142B] cursor-pointer"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Pricing Filter Pills */}
            <div className="flex items-center rounded-xl bg-[#F6F6FB] border border-[#E6E6F0] p-0.5">
              {(["all", "Free", "Freemium", "Paid"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPricingFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    pricingFilter === tab
                      ? "bg-white text-[#14142B] shadow-2xs border border-[#E6E6F0]"
                      : "text-[#55556E] hover:text-[#14142B]"
                  }`}
                >
                  {tab === "all" ? "All Pricing" : tab}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#55556E] hidden sm:inline font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-8.5 rounded-lg border border-[#D4D4E4] bg-white px-2.5 text-xs font-semibold text-[#14142B] focus:border-[#4F46E5] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="comments">Most Comments</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Main 2-Column Grid (Products immediately visible on Left, Sticky Sidebar on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5.5 items-start">
          {/* LEFT: TOOLS LIST (8 COLS) - Starts Immediately Below Refine Section */}
          <div className="lg:col-span-8 space-y-2.5">
            <div className="flex items-center justify-between pb-0.5">
              <span className="font-mono text-xs font-bold uppercase text-[#55556E]">
                Showing {filteredTools.length} {category.name} Tools
              </span>
              <span className="text-xs text-[#55556E]">
                Curated founder &amp; community directory
              </span>
            </div>

            {tools.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E6E6F0] bg-white p-10 sm:p-14 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#F7F6FF] text-[#4F46E5] flex items-center justify-center mx-auto">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#14142B]">
                  No software launched in {category.name} yet
                </h3>
                <p className="text-xs sm:text-sm text-[#55556E] max-w-md mx-auto">
                  Be the first maker to submit and launch a verified {category.name} tool to the community.
                </p>
                <div className="pt-2">
                  <Link
                    href={`/submit?category=${category.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Submit a {category.name} Tool</span>
                  </Link>
                </div>
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="rounded-2xl border border-[#E6E6F0] bg-white p-10 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[#F6F6FB] flex items-center justify-center mx-auto text-[#55556E]">
                  <Search className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#14142B]">
                  No tools found matching &ldquo;{searchQuery}&rdquo;
                </h3>
                <p className="text-xs text-[#55556E] max-w-sm mx-auto">
                  Try adjusting your search query or reset the pricing filters to discover other software.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setPricingFilter("all");
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-[#4F46E5] bg-[#F7F6FF] border border-[#E0DEFC] hover:bg-[#E0DEFC] transition-colors cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTools.map((tool, idx) => (
                  <div
                    key={tool.id}
                    className="group relative rounded-2xl border border-[#E6E6F0] bg-white p-3.5 sm:p-4 hover:border-[#D4D4E4] hover:shadow-[0_4px_20px_rgba(20,20,43,0.04)] transition-all flex items-start justify-between gap-3.5"
                  >
                    {/* Left: Rank + Squircle Logo + Details */}
                    <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
                      {/* Rank Position */}
                      <span className="font-mono font-bold text-xs text-[#55556E] pt-2 w-5 shrink-0 text-center">
                        #{idx + 1}
                      </span>

                      {/* Logo Squircle */}
                      <div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${tool.logoBg} flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 overflow-hidden shadow-2xs`}
                      >
                        {tool.logoUrl ? (
                          <img
                            src={tool.logoUrl}
                            alt={tool.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          tool.initials
                        )}
                      </div>

                      {/* Text info */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/product/${tool.slug}`}
                            className="font-heading font-bold text-sm sm:text-base text-[#14142B] hover:text-[#4F46E5] transition-colors truncate"
                          >
                            {tool.name}
                          </Link>

                          {tool.isVerified && (
                            <span className="rounded-full bg-[#ECFDF5] text-[#0F8A5F] text-[10px] font-bold px-2 py-0.5">
                              Verified
                            </span>
                          )}

                          <span className="rounded-full bg-[#F1F1F8] text-[#55556E] text-[10px] font-medium px-2 py-0.5">
                            {tool.pricingModel}
                          </span>

                          {tool.priceDisplay && (
                            <span className="text-[10px] font-mono font-semibold text-[#14142B] bg-[#F7F6FF] border border-[#E0DEFC] px-1.5 py-0.2 rounded">
                              {tool.priceDisplay}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#55556E] leading-relaxed line-clamp-2">
                          {tool.tagline}
                        </p>

                        {/* Footer info: website link + maker */}
                        <div className="flex items-center gap-3 pt-0.5 text-[11px] text-[#55556E] flex-wrap">
                          {tool.websiteUrl && (
                            <a
                              href={tool.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#4F46E5] hover:underline font-medium"
                            >
                              <span>Visit site</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}

                          {tool.founder && (
                            <span>
                              by {tool.founder.name} {tool.founder.role && `(${tool.founder.role})`}
                            </span>
                          )}

                          {typeof tool.upvotes === "number" && tool.upvotes > 0 && (
                            <span className="inline-flex items-center gap-1 font-mono text-[#14142B]">
                              ▲ {tool.upvotes}
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 font-mono">
                            <MessageSquare className="h-3 w-3" />
                            {tool.commentsCount} comments
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: View Button */}
                    <Link
                      href={`/product/${tool.slug || tool.id}`}
                      className="flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-[#F6F6FB] hover:bg-[#EEEDFC] text-[#4F46E5] text-xs font-bold transition-all shrink-0 cursor-pointer self-center"
                    >
                      <span>View</span>
                      <span className="ml-1">&rarr;</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: STICKY SIDEBAR (4 COLS) - Stays sticky while scrolling */}
          <aside className="lg:col-span-4 space-y-3.5 lg:sticky lg:top-20 self-start">
            {/* Featured Tools – Sticky Sidebar */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-4.5 sm:p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#F1F1F8] pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#FFF4ED] text-[#EA580C]">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#14142B] leading-tight">
                      Featured Tools
                    </h3>
                    <p className="text-[11px] text-[#55556E]">
                      Spotlighted &amp; trending software
                    </p>
                  </div>
                </div>

                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#EA580C] bg-[#FFF4ED] px-2 py-0.5 rounded-md border border-[#FED7AA]">
                  Spotlight
                </span>
              </div>

              {/* Dynamic Featured Tools List */}
              <div className="space-y-2">
                {featuredList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#E6E6F0] p-4 text-center space-y-1.5">
                    <p className="text-xs font-semibold text-[#14142B]">
                      Spotlight your tool here
                    </p>
                    <p className="text-[11px] text-[#55556E]">
                      Get seen across all verified category directories.
                    </p>
                    <Link
                      href="/submit"
                      className="inline-block mt-1 text-xs font-bold text-[#4F46E5] hover:underline"
                    >
                      Promote your product &rarr;
                    </Link>
                  </div>
                ) : (
                  featuredList.slice(0, 3).map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/product/${tool.slug}`}
                      className="group flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-[#E0DEFC] hover:bg-[#F8F7FF] transition-all cursor-pointer block"
                    >
                      {/* Logo / Initials */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7E7EF6] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                        {tool.logoUrl ? (
                          <img
                            src={tool.logoUrl}
                            alt={tool.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          tool.initials || (tool.name || "TL").slice(0, 2).toUpperCase()
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-heading font-bold text-xs text-[#14142B] group-hover:text-[#4F46E5] transition-colors truncate">
                            {tool.name}
                          </span>
                          {tool.pricingModel && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F1F1F8] text-[#55556E] shrink-0 capitalize">
                              {tool.pricingModel}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#55556E] line-clamp-1 leading-normal">
                          {tool.tagline}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8A8AA3]">
                          {tool.category && (
                            <span className="font-medium text-[#4F46E5]">
                              {tool.category}
                            </span>
                          )}
                          {typeof tool.upvotes === "number" && tool.upvotes > 0 && (
                            <span>· ▲ {tool.upvotes}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Bottom Category Submit Action */}
              <div className="pt-2 border-t border-[#F1F1F8]">
                <Link
                  href={`/submit?category=${category.slug}`}
                  className="w-full py-2 px-3 rounded-xl bg-[#F7F6FF] hover:bg-[#EEEDFC] text-[#4F46E5] border border-[#E0DEFC] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer block text-center"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Submit a {category.name} Tool</span>
                </Link>
              </div>
            </div>

            {/* Related Categories Navigation Card */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-4.5 space-y-3 shadow-2xs">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#14142B]">
                Related Categories
              </h3>

              <div className="divide-y divide-[#F1F1F8]">
                {relatedCategories.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/category/${rel.slug}`}
                    className="py-2 flex items-center justify-between group hover:bg-[#F6F6FB] px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg ${rel.iconBg} ${rel.iconColor} flex items-center justify-center text-xs shrink-0`}
                      >
                        {rel.icon}
                      </div>
                      <span className="text-xs font-semibold text-[#14142B] group-hover:text-[#4F46E5] transition-colors">
                        {rel.name}
                      </span>
                    </div>

                    <ArrowRight className="h-3 w-3 text-[#8A8AA3] group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};
