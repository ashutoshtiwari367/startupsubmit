"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, Clock, ChevronUp } from "lucide-react";

export interface DirectoryListingItem {
  id: string;
  slug?: string;
  rank: number;
  name: string;
  category: string;
  tagline: string;
  pricing?: string;
  listingPlan?: "free" | "premium" | "featured" | string;
  isFeaturedActive?: boolean;
  featuredDaysRemaining?: number;
  approvedAt?: string;
  createdAt?: string;
  author?: string;
  commentsCount?: number;
  upvotes: number;
  initials: string;
  logoBg?: string;
  logoUrl?: string;
  isUpvoted?: boolean;
}

export interface PodiumItem extends DirectoryListingItem {
  rank: 1 | 2 | 3;
  rankLabel: string;
  badgeBg: string;
  badgeText: string;
  author: string;
  commentsCount: number;
  logoBg: string;
}

export type RegularLaunchItem = DirectoryListingItem;

export interface LaunchingNowSectionProps {
  onVisitProduct?: (url: string) => void;
  onProductClick?: (productId: string) => void;
  initialPodium?: PodiumItem[];
  initialRegular?: RegularLaunchItem[];
}

const LOGO_BACKGROUNDS = [
  "bg-[#4F46E5] text-white",
  "bg-[#14142B] text-white",
  "bg-[#0F8A5F] text-white",
  "bg-[#E0DEFC] text-[#4F46E5]",
  "bg-[#FFEAD8] text-[#EA580C]",
];

function formatRelativeLaunchTime(dateStr?: string): string {
  if (!dateStr) return "New";
  const ts = Date.parse(dateStr);
  if (!Number.isFinite(ts)) return "New";
  const diffMs = Math.max(0, Date.now() - ts);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1d ago";
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPlanBadge(item: DirectoryListingItem) {
  if (item.listingPlan === "premium") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] text-[10px] font-bold px-2 py-0.5">
        <ShieldCheck className="h-2.5 w-2.5" />
        Verified Maker
      </span>
    );
  }
  return null;
}

export const LaunchingNowSection: React.FC<LaunchingNowSectionProps> = ({
  onProductClick,
  initialPodium = [],
  initialRegular = [],
}) => {
  const [justListedTab, setJustListedTab] = useState<"all" | "today" | "week" | "month">("all");
  const [premiumList, setPremiumList] = useState<DirectoryListingItem[]>([]);
  const [justListedAll, setJustListedAll] = useState<DirectoryListingItem[]>(() => [
    ...initialPodium,
    ...initialRegular,
  ]);
  const [isLoading, setIsLoading] = useState(initialPodium.length === 0 && initialRegular.length === 0);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/listings?limit=60")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          const decorate = (items: any[]) =>
            items.map((item, idx) => ({
              ...item,
              rank: idx + 1,
              logoBg: item.logoBg || LOGO_BACKGROUNDS[idx % LOGO_BACKGROUNDS.length],
            }));

          const nextPremium = Array.isArray(data.premium) ? decorate(data.premium) : [];
          const nextJustListed = Array.isArray(data.justListed)
            ? decorate(data.justListed)
            : Array.isArray(data.listings)
            ? decorate(data.listings)
            : [];

          setPremiumList(nextPremium);
          setJustListedAll(nextJustListed);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleRowUpvote = async (listingId: string) => {
    try {
      const res = await fetch(`/api/listings/${listingId}/upvote`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.status === 401 || data.requiresAuth) {
        const nextUrl = typeof window !== "undefined" ? window.location.pathname : "/";
        window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`;
        return;
      }
      if (data.ok) {
        const updateItem = (item: DirectoryListingItem) =>
          item.id === listingId
            ? { ...item, isUpvoted: data.isUpvoted, upvotes: data.upvotesCount }
            : item;

        setPremiumList((prev) => prev.map(updateItem));
        setJustListedAll((prev) => prev.map(updateItem));
      }
    } catch {
      // Ignore
    }
  };

  const filteredJustListed = useMemo(() => {
    if (justListedTab === "all") return justListedAll;
    const now = Date.now();
    const windowDays = justListedTab === "today" ? 1 : justListedTab === "week" ? 7 : 30;
    const cutoff = now - windowDays * 24 * 60 * 60 * 1000;
    return justListedAll
      .filter((item) => {
        const ts = Date.parse(item.approvedAt || item.createdAt || "");
        return Number.isFinite(ts) && ts >= cutoff;
      })
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [justListedAll, justListedTab]);

  const renderListingRow = (
    item: DirectoryListingItem,
    index: number,
    options: { showPlanBadge?: boolean; showPricingChip?: boolean } = {}
  ) => {
    const rankNumber = index + 1;
    const isNewestFirst = rankNumber === 1;

    return (
      <div
        key={`${item.id}-${index}`}
        className={`py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 px-2.5 rounded-xl transition-colors ${
          isNewestFirst
            ? "bg-[#F7F6FF]/50 hover:bg-[#F7F6FF]"
            : "hover:bg-[#F6F6FB]/70"
        }`}
      >
        <div
          onClick={() => onProductClick?.(item.slug || item.id)}
          className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 cursor-pointer group"
        >
          {/* Rank # (#1 = newest) */}
          <span
            className={`font-mono text-xs w-7 shrink-0 font-bold ${
              isNewestFirst ? "text-[#4F46E5]" : "text-[#55556E]"
            }`}
          >
            #{rankNumber}
          </span>

          {/* Logo Squircle */}
          <div
            className={`w-10 h-10 rounded-xl ${
              item.logoBg || LOGO_BACKGROUNDS[index % LOGO_BACKGROUNDS.length]
            } font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden`}
          >
            {item.logoUrl ? (
              <img src={item.logoUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              item.initials
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-[#14142B] group-hover:text-[#4F46E5] transition-colors truncate">
                {item.name}
              </span>

              {isNewestFirst && (
                <span className="rounded-md bg-[#ECFDF5] text-[#0F8A5F] text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                  New
                </span>
              )}

              {options.showPlanBadge && formatPlanBadge(item)}

              {!options.showPlanBadge && item.listingPlan === "premium" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] text-[10px] font-bold px-2 py-0.5">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Verified Maker
                </span>
              )}

              <span className="rounded-md bg-[#F1F1F8] text-[#55556E] text-[11px] font-medium px-2 py-0.5">
                {item.category}
              </span>

              {options.showPricingChip && item.pricing && (
                <span className="rounded-md bg-white border border-[#E6E6F0] text-[#55556E] text-[10px] font-mono px-1.5 py-0.5 capitalize">
                  {item.pricing.replace("_", "-")}
                </span>
              )}
            </div>

            <p className="text-xs text-[#55556E] line-clamp-2 mt-0.5 leading-snug">{item.tagline}</p>
          </div>
        </div>

        {/* Time + Upvote */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#55556E]">
            <Clock className="h-3 w-3" />
            {formatRelativeLaunchTime(item.approvedAt || item.createdAt)}
          </span>

          {/* Authenticated Upvote Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRowUpvote(item.id);
            }}
            aria-label={`Upvote ${item.name}`}
            className={`rounded-lg text-xs font-mono font-bold px-2.5 py-1.5 transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
              item.isUpvoted
                ? "bg-[#F7F6FF] text-[#4F46E5] border-[#4F46E5] ring-1 ring-[#4F46E5]"
                : "bg-white text-[#14142B] border-[#E6E6F0] hover:bg-[#F6F6FB]"
            }`}
          >
            <ChevronUp className={`h-3.5 w-3.5 ${item.isUpvoted ? "text-[#4F46E5]" : "text-[#55556E]"}`} />
            <span>{item.upvotes}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="relative w-full max-w-[1240px] mx-auto px-6 py-10 md:py-14 space-y-10">
      {/* =================================================================== */}
      {/* 1. PREMIUM SECTION (Right after Header Featured Cards)              */}
      {/* =================================================================== */}
      <div id="premium-launches" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#4F46E5] block mb-1">
              PREMIUM SPOTLIGHT
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-heading font-extrabold text-[24px] sm:text-[28px] text-[#14142B] tracking-tight leading-tight">
                Premium launches
              </h2>
              <span className="rounded-full bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] text-[11px] font-semibold px-2.5 py-0.5">
                Verified makers
              </span>
            </div>
            <p className="mt-1 text-sm text-[#55556E]">
              Fast-tracked verified products — newly approved tools appear first at #1.
            </p>
          </div>

          <Link
            href="/submit?plan=premium"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:underline self-start sm:self-end"
          >
            <span>Get Premium placement</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-[#E0DEFC] bg-white p-4 sm:p-6 shadow-[0_8px_24px_rgba(79,70,229,0.04)]">
          <div className="divide-y divide-[#F1F1F8]">
            {isLoading ? (
              <div className="py-8 text-center text-xs font-mono text-[#55556E]">
                Loading premium launches...
              </div>
            ) : premiumList.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-[#55556E]">
                  No approved Premium launches yet. Be the first to claim #1 placement!
                </p>
                <Link
                  href="/submit?plan=premium"
                  className="inline-block text-xs font-semibold text-[#4F46E5] hover:underline"
                >
                  Submit Premium Listing ($29) &rarr;
                </Link>
              </div>
            ) : (
              premiumList.map((item, idx) => renderListingRow(item, idx))
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. JUST LISTED SECTION (Newest Approved First Across All Plans)     */}
      {/* =================================================================== */}
      <div id="just-listed" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#0F8A5F] block mb-1">
              LIVE FEED · NEWEST FIRST
            </span>
            <h2 className="font-heading font-extrabold text-[24px] sm:text-[28px] text-[#14142B] tracking-tight leading-tight">
              Just listed
            </h2>
            <p className="mt-1 text-sm text-[#55556E]">
              Freshly approved tools across LaunchOS — every new launch lands at #1 first place.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full bg-white border border-[#E6E6F0] p-1 gap-1 self-start sm:self-end">
            {(
              [
                { id: "all", label: "All latest" },
                { id: "today", label: "Today" },
                { id: "week", label: "This week" },
                { id: "month", label: "This month" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setJustListedTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  justListedTab === tab.id
                    ? "bg-[#14142B] text-white"
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-6 space-y-4">
          <div className="divide-y divide-[#F1F1F8]">
            {isLoading && filteredJustListed.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#55556E]">
                Loading just listed tools...
              </div>
            ) : filteredJustListed.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#55556E]">
                No launches found for this time period.
              </div>
            ) : (
              filteredJustListed
                .slice(0, 20)
                .map((item, idx) =>
                  renderListingRow(item, idx, { showPlanBadge: true, showPricingChip: true })
                )
            )}
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/categories"
              className="inline-block px-6 py-2.5 rounded-xl border border-[#D4D4E4] bg-white hover:bg-[#F6F6FB] text-xs sm:text-sm font-semibold text-[#14142B] transition-all cursor-pointer"
            >
              Explore all category directories &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
