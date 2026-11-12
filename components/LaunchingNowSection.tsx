"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronUp } from "lucide-react";

export interface LaunchingNowSectionProps {
  onVisitProduct?: (url: string) => void;
  onProductClick?: (productId: string) => void;
  initialPodium?: PodiumItem[];
  initialRegular?: RegularLaunchItem[];
}

export interface PodiumItem {
  id: string;
  slug?: string;
  rank: 1 | 2 | 3;
  rankLabel: string;
  badgeBg: string;
  badgeText: string;
  name: string;
  category: string;
  tagline: string;
  author: string;
  commentsCount: number;
  upvotes: number;
  initials: string;
  logoBg: string;
  logoUrl?: string;
  isUpvoted?: boolean;
}

export interface RegularLaunchItem {
  id: string;
  slug?: string;
  rank: number;
  name: string;
  category: string;
  tagline: string;
  upvotes: number;
  initials: string;
  logoBg: string;
  logoUrl?: string;
  isUpvoted?: boolean;
}

export const LaunchingNowSection: React.FC<LaunchingNowSectionProps> = ({
  onVisitProduct,
  onProductClick,
  initialPodium = [],
  initialRegular = [],
}) => {
  const [activeTab, setActiveTab] = useState<"today" | "week" | "month">("today");
  const [podiumList, setPodiumList] = useState<PodiumItem[]>(initialPodium);
  const [regularLaunches, setRegularLaunches] = useState<RegularLaunchItem[]>(initialRegular);
  const [isLoading, setIsLoading] = useState(initialPodium.length === 0);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/listings?period=${activeTab}&limit=20`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          if (data.podium && data.podium.length > 0) {
            setPodiumList(data.podium);
          }
          if (data.regular && data.regular.length > 0) {
            setRegularLaunches(data.regular);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [activeTab]);



  return (
    <section className="relative w-full max-w-[1240px] mx-auto px-6 py-10 md:py-14 space-y-6">
      {/* 1. Header Bar: Eyebrow + Title + Period Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#4F46E5] block mb-1">
            LIVE LEADERBOARD
          </span>
          <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] text-[#14142B] tracking-tight leading-tight">
            Launching now
          </h2>
          <p className="mt-1 text-sm sm:text-base text-[#55556E]">
            Top 3 launches today earn a permanent dofollow backlink.
          </p>
        </div>

        {/* Tab Filters: Today | This week | This month */}
        <div className="inline-flex items-center rounded-full bg-transparent p-1 gap-1 self-start sm:self-end">
          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "today"
                ? "bg-[#14142B] text-white"
                : "text-[#55556E] hover:text-[#14142B]"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("week")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "week"
                ? "bg-[#14142B] text-white"
                : "text-[#55556E] hover:text-[#14142B]"
            }`}
          >
            This week
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("month")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "month"
                ? "bg-[#14142B] text-white"
                : "text-[#55556E] hover:text-[#14142B]"
            }`}
          >
            This month
          </button>
        </div>
      </div>

      {/* 2. Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {isLoading && podiumList.length === 0 ? (
          <div className="md:col-span-3 py-12 text-center text-xs font-mono text-[#55556E]">
            Loading leaderboard launches...
          </div>
        ) : (
          podiumList.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-5 flex flex-col justify-between transition-all hover:border-[#D4D4E4] ${
                item.rank === 1 ? "border-[#E6E6F0]" : "border-[#E6E6F0]"
              }`}
            >
              <div>
                {/* Top row: Rank badge + Category chip */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${item.badgeBg} ${item.badgeText}`}
                  >
                    {item.rankLabel}
                  </span>
                  <span className="rounded-full bg-[#F1F1F8] text-[#55556E] text-xs font-medium px-2.5 py-0.5">
                    {item.category}
                  </span>
                </div>

                {/* Logo + Title */}
                <div
                  onClick={() => onProductClick?.(item.slug || item.id)}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${item.logoBg} font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden`}
                  >
                    {item.logoUrl ? (
                      <img src={item.logoUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      item.initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-[#14142B] tracking-tight group-hover:text-[#4F46E5] transition-colors truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#55556E] mt-1 leading-relaxed line-clamp-2">
                      {item.tagline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom row: Author + comments count & View CTA */}
              <div className="pt-4 mt-4 border-t border-[#F1F1F8] flex items-center justify-between">
                <span className="text-xs text-[#55556E]">
                  by {item.author} &middot; {item.commentsCount} comments
                </span>

                <button
                  type="button"
                  onClick={() => onProductClick?.(item.slug || item.id)}
                  className="rounded-lg bg-[#F6F6FB] hover:bg-[#EEEDFC] text-[#4F46E5] text-xs font-semibold px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Below Podium: Premium Launches List in One Card */}
      <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4">
        {/* Header: Premium launches + Verified makers badge & Community note */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F1F8]">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base text-[#14142B]">
              Premium launches
            </h3>
            <span className="rounded-full bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] text-[11px] font-semibold px-2.5 py-0.5">
              Verified makers
            </span>
          </div>
          <span className="text-xs text-[#55556E]">
            Curated daily launches
          </span>
        </div>

        {/* Rows List */}
        <div className="divide-y divide-[#F1F1F8]">
          {isLoading && regularLaunches.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#55556E]">
              Loading launches...
            </div>
          ) : regularLaunches.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#55556E]">
              No launches found for this time period.
            </div>
          ) : (
            regularLaunches.map((item) => (
              <div
                key={item.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-[#F6F6FB]/60 px-2 rounded-xl transition-colors"
              >
                <div
                  onClick={() => onProductClick?.(item.slug || item.id)}
                  className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 cursor-pointer group"
                >
                  {/* Rank # */}
                  <span className="font-mono text-xs text-[#55556E] w-6 shrink-0">
                    #{item.rank}
                  </span>

                  {/* Logo Squircle */}
                  <div
                    className={`w-10 h-10 rounded-xl ${item.logoBg} font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden`}
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
                      <span className="rounded-md bg-[#F1F1F8] text-[#55556E] text-[11px] font-medium px-2 py-0.5">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#55556E] truncate mt-0.5">
                      {item.tagline}
                    </p>
                  </div>
                </div>

                {/* View Button */}
                <button
                  type="button"
                  onClick={() => onProductClick?.(item.slug || item.id)}
                  className="rounded-lg bg-[#F6F6FB] hover:bg-[#EEEDFC] text-[#4F46E5] text-xs font-semibold px-3 py-1.5 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <span>View</span>
                  <span>&rarr;</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Show more launches button */}
        <div className="pt-2 text-center">
          <Link
            href="/categories"
            className="inline-block px-6 py-2.5 rounded-xl border border-[#D4D4E4] bg-white hover:bg-[#F6F6FB] text-xs sm:text-sm font-semibold text-[#14142B] transition-all cursor-pointer"
          >
            Explore all category directories &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
};
