"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  ChevronUp,
  Plus,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import type { MasterCategoryItem, CategoryToolItem } from "@/lib/categories";

export interface CategoryDetailViewProps {
  category: MasterCategoryItem;
  initialTools: CategoryToolItem[];
  relatedCategories: MasterCategoryItem[];
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  initialTools,
  relatedCategories,
}) => {
  const [tools, setTools] = useState<CategoryToolItem[]>(initialTools);
  const [searchQuery, setSearchQuery] = useState("");
  const [pricingFilter, setPricingFilter] = useState<"all" | "Free" | "Freemium" | "Paid">("all");
  const [sortBy, setSortBy] = useState<"featured" | "name" | "comments">("featured");

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

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 flex-1 w-full">
        {/* 1. Breadcrumb & Back Link */}
        <div className="flex items-center justify-between text-xs text-[#55556E]">
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
            <span>All 35 Categories</span>
          </Link>
        </div>

        {/* 2. Category Hero Banner */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Squircle Pastel Icon */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${category.iconBg} ${category.iconColor} flex items-center justify-center shrink-0 shadow-sm`}
              >
                {category.icon}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#4F46E5] bg-[#F7F6FF] px-2.5 py-0.5 rounded-full border border-[#E0DEFC]">
                    CATEGORY DIRECTORY
                  </span>
                  <span className="rounded-full bg-[#ECFDF5] text-[#0F8A5F] text-[11px] font-bold px-2 py-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Launches
                  </span>
                </div>

                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#14142B] tracking-tight">
                  Best {category.name} Software & Tools
                </h1>

                <p className="text-xs sm:text-sm text-[#55556E] leading-relaxed max-w-2xl pt-1">
                  {category.description}. Discover community-ranked tools, verified maker launches, and curated resources for top software.
                </p>
              </div>
            </div>

            {/* Quick Submit CTA */}
            <Link
              href={`/submit?category=${category.slug}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer shadow-sm self-start"
            >
              <Plus className="h-4 w-4" />
              <span>Submit a {category.name} Tool</span>
            </Link>
          </div>

          {/* Metrics summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#F1F1F8] text-xs">
            <div className="bg-[#F6F6FB] rounded-xl p-3 border border-[#E6E6F0]">
              <span className="text-[#55556E] block text-[11px]">Indexed Tools</span>
              <span className="font-bold text-[#14142B] text-sm mt-0.5 block">
                {category.count} Products
              </span>
            </div>
            <div className="bg-[#F6F6FB] rounded-xl p-3 border border-[#E6E6F0]">
              <span className="text-[#55556E] block text-[11px]">Review SLA</span>
              <span className="font-bold text-[#14142B] text-sm mt-0.5 block">
                &lt; 24h Editorial
              </span>
            </div>
            <div className="bg-[#F6F6FB] rounded-xl p-3 border border-[#E6E6F0]">
              <span className="text-[#55556E] block text-[11px]">Directory Link</span>
              <span className="font-bold text-[#0F8A5F] text-sm mt-0.5 block">
                Verified
              </span>
            </div>
            <div className="bg-[#F6F6FB] rounded-xl p-3 border border-[#E6E6F0]">
              <span className="text-[#55556E] block text-[11px]">Ranking Logic</span>
              <span className="font-bold text-[#14142B] text-sm mt-0.5 block">
                Editorial & Community
              </span>
            </div>
          </div>
        </div>

        {/* 3. Controls Bar: Search + Pricing Filter Tabs + Sorting */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-[#E6E6F0] bg-white p-3.5 sm:p-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#55556E]" />
            <input
              type="text"
              placeholder={`Search ${category.name} tools by name or keyword...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-xl border border-[#D4D4E4] bg-white pl-9 pr-3 text-xs sm:text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:border-[#4F46E5] focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Pricing Filter Pills */}
            <div className="flex items-center rounded-xl bg-[#F6F6FB] border border-[#E6E6F0] p-1">
              {(["all", "Free", "Freemium", "Paid"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPricingFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    pricingFilter === tab
                      ? "bg-white text-[#14142B] shadow-xs border border-[#E6E6F0]"
                      : "text-[#55556E] hover:text-[#14142B]"
                  }`}
                >
                  {tab === "all" ? "All Pricing" : tab}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#55556E] hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 rounded-xl border border-[#D4D4E4] bg-white px-3 text-xs font-medium text-[#14142B] focus:border-[#4F46E5] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="comments">Most Comments</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Main 2-Column Grid (8 cols tools, 4 cols sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: TOOLS LIST (8 COLS) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="font-mono text-xs font-bold uppercase text-[#55556E]">
                Showing {filteredTools.length} {category.name} Tools
              </span>
              <span className="text-xs text-[#55556E]">
                Curated founder & community directory
              </span>
            </div>

            {filteredTools.length === 0 ? (
              <div className="rounded-2xl border border-[#E6E6F0] bg-white p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#F6F6FB] flex items-center justify-center mx-auto text-[#55556E]">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#14142B]">
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4F46E5] bg-[#F7F6FF] border border-[#E0DEFC] hover:bg-[#E0DEFC] transition-colors cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTools.map((tool, idx) => {
                  const isUpvoted = (tool as any).isUpvoted;

                  return (
                    <div
                      key={tool.id}
                      className="group relative rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-5 hover:border-[#D4D4E4] hover:shadow-[0_4px_20px_rgba(20,20,43,0.04)] transition-all flex items-start justify-between gap-4"
                    >
                      {/* Left: Rank + Squircle Logo + Details */}
                      <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                        {/* Rank Position */}
                        <span className="font-mono font-bold text-xs text-[#55556E] pt-2 w-5 shrink-0 text-center">
                          #{idx + 1}
                        </span>

                        {/* Logo Squircle */}
                        <div
                          className={`w-12 h-12 rounded-xl ${tool.logoBg} flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden shadow-xs`}
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
                              className="font-heading font-bold text-base text-[#14142B] hover:text-[#4F46E5] transition-colors truncate"
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
                              <span className="text-[11px] font-mono font-semibold text-[#14142B] bg-[#F7F6FF] border border-[#E0DEFC] px-1.5 py-0.2 rounded">
                                {tool.priceDisplay}
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-[#55556E] leading-relaxed line-clamp-2">
                            {tool.tagline}
                          </p>

                          {/* Footer info: website link + maker */}
                          <div className="flex items-center gap-3 pt-1 text-[11px] text-[#55556E] flex-wrap">
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
                        className="flex items-center justify-center px-4 py-2 rounded-xl bg-[#F6F6FB] hover:bg-[#EEEDFC] text-[#4F46E5] text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        <span>View</span>
                        <span className="ml-1">&rarr;</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: SIDEBAR (4 COLS) */}
          <div className="lg:col-span-4 space-y-5 sticky top-20">
            {/* CTA 1: Launch your tool in this category */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#F7F6FF] text-[#4F46E5]">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h3 className="font-bold text-base text-[#14142B]">
                  Building in {category.name}?
                </h3>
              </div>

              <p className="text-xs text-[#55556E] leading-relaxed">
                Launch your software to our directory of 30,000+ founders, marketers, and early adopters. Free submissions go live after a quick 24-48h editorial review.
              </p>

              <ul className="space-y-1.5 text-xs text-[#55556E]">
                <li className="flex items-center gap-1.5">
                  <span className="text-[#0F8A5F] font-bold">✓</span>
                  <span>Instant listing indexation</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#0F8A5F] font-bold">✓</span>
                  <span>Permanent community profile</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#0F8A5F] font-bold">✓</span>
                  <span>Featured spotlight for top 3 tools</span>
                </li>
              </ul>

              <Link
                href={`/submit?category=${category.slug}`}
                className="w-full py-3 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer block text-center"
              >
                <span>Submit {category.name} Tool for Free</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Related Categories Navigation Card */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#14142B]">
                Related Categories
              </h3>

              <div className="divide-y divide-[#F1F1F8]">
                {relatedCategories.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/category/${rel.slug}`}
                    className="py-2.5 flex items-center justify-between group hover:bg-[#F6F6FB] px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${rel.iconBg} ${rel.iconColor} flex items-center justify-center text-xs shrink-0`}>
                        {rel.icon}
                      </div>
                      <span className="text-xs font-semibold text-[#14142B] group-hover:text-[#4F46E5] transition-colors">
                        {rel.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[#55556E]">
                      <span className="font-mono text-[11px]">{rel.count}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#4F46E5]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

