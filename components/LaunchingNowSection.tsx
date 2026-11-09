"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/Badge";
import { Pill } from "@/components/Pill";
import { LEADERBOARD_DATA, LeaderboardProduct } from "@/lib/mock-data";
import {
  Crown,
  Medal,
  Award,
  ChevronUp,
  MessageSquare,
  ExternalLink,
  Flame,
  ArrowRight,
  Sparkles,
  Loader2,
  Clock,
  Layers,
} from "lucide-react";

export interface LaunchingNowSectionProps {
  onVisitProduct?: (url: string) => void;
  onProductClick?: (productId: string) => void;
}

export const LaunchingNowSection: React.FC<LaunchingNowSectionProps> = ({
  onVisitProduct,
  onProductClick,
}) => {
  const [activeTab, setActiveTab] = useState<"today" | "week" | "month">("today");
  const [products, setProducts] = useState<Record<string, LeaderboardProduct>>(
    () => {
      const all: Record<string, LeaderboardProduct> = {};
      Object.values(LEADERBOARD_DATA).forEach((list) => {
        list.forEach((p) => {
          all[p.id] = { ...p };
        });
      });
      return all;
    }
  );

  // Expanded launches state
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Live countdown timer state (calculating time to next midnight PST / UTC-8)
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Target midnight tonight
      const target = new Date();
      target.setHours(24, 0, 0, 0);

      const diff = Math.max(0, target.getTime() - now.getTime());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days: d.toString().padStart(2, "0"),
        hours: h.toString().padStart(2, "0"),
        minutes: m.toString().padStart(2, "0"),
        seconds: s.toString().padStart(2, "0"),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle local upvote toggle with bounce animation
  const handleUpvote = (id: string) => {
    setProducts((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const isUpvoted = !current.isUpvoted;
      return {
        ...prev,
        [id]: {
          ...current,
          isUpvoted,
          upvotes: isUpvoted ? current.upvotes + 1 : current.upvotes - 1,
        },
      };
    });
  };

  // Get current tab products
  const currentList = LEADERBOARD_DATA[activeTab].map(
    (p) => products[p.id] || p
  );
  const podiumProducts = currentList.slice(0, 3);
  const regularLaunches = currentList.slice(3);

  // Handle "Show more launches" with skeleton animation
  const handleShowMore = () => {
    if (isExpanded) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setIsLoadingMore(false);
      setIsExpanded(true);
    }, 600);
  };

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      {/* 1. Header Bar: Title, Live Countdown Boxes & Period Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 border-b border-[#E8E8E3] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#059669]"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#059669]">
              Live Leaderboard
            </span>
          </div>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#0F0F10] tracking-[-0.03em] leading-tight">
            Launching Now
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-[#66666B]">
            Real-time community rankings. Top 3 earn permanent dofollow authority backlinks.
          </p>
        </div>

        {/* Right side: Countdown Timer & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 self-start lg:self-end">
          {/* Live Countdown in 4 Boxes */}
          <div className="flex items-center gap-2.5 bg-white border border-[#E8E8E3] rounded-[12px] p-2 sm:p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="text-[10px] font-mono font-semibold uppercase text-[#8E8E93] leading-tight pr-1 hidden sm:block">
              Next launch
              <br />
              period:
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <div className="flex flex-col items-center justify-center h-10 w-9 sm:w-10 rounded-[8px] bg-[#FAFAF7] border border-[#E8E8E3]">
                <span className="text-xs sm:text-sm font-bold text-[#0F0F10]">
                  {timeLeft.days}
                </span>
                <span className="text-[9px] text-[#8E8E93]">DAYS</span>
              </div>
              <span className="text-[#8E8E93] font-bold text-xs">:</span>

              <div className="flex flex-col items-center justify-center h-10 w-9 sm:w-10 rounded-[8px] bg-[#FAFAF7] border border-[#E8E8E3]">
                <span className="text-xs sm:text-sm font-bold text-[#0F0F10]">
                  {timeLeft.hours}
                </span>
                <span className="text-[9px] text-[#8E8E93]">HRS</span>
              </div>
              <span className="text-[#8E8E93] font-bold text-xs">:</span>

              <div className="flex flex-col items-center justify-center h-10 w-9 sm:w-10 rounded-[8px] bg-[#FAFAF7] border border-[#E8E8E3]">
                <span className="text-xs sm:text-sm font-bold text-[#0F0F10]">
                  {timeLeft.minutes}
                </span>
                <span className="text-[9px] text-[#8E8E93]">MINS</span>
              </div>
              <span className="text-[#8E8E93] font-bold text-xs">:</span>

              <div className="flex flex-col items-center justify-center h-10 w-9 sm:w-10 rounded-[8px] bg-[#EEF0FE] border border-[#D5D8FC]">
                <span className="text-xs sm:text-sm font-bold text-[#5B5BF0]">
                  {timeLeft.seconds}
                </span>
                <span className="text-[9px] text-[#4338CA]">SECS</span>
              </div>
            </div>
          </div>

          {/* Tab Switcher: Today | This Week | This Month */}
          <div className="flex items-center rounded-[10px] border border-[#E8E8E3] bg-[#FAFAF7] p-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            {(["today", "week", "month"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsExpanded(false);
                }}
                className={`px-3 sm:px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all select-none cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-[#0F0F10] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#E8E8E3]"
                    : "text-[#66666B] hover:text-[#0F0F10]"
                }`}
              >
                {tab === "today"
                  ? "Today"
                  : tab === "week"
                  ? "This Week"
                  : "This Month"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PODIUM: TOP 3 AS LARGER CARDS WITH DISTINCT RANK STYLING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {podiumProducts.map((product) => {
          const isFirst = product.rank === 1;
          const isSecond = product.rank === 2;
          const isThird = product.rank === 3;

          // Rank styling gradients & icons
          const rankConfig = isFirst
            ? {
                outerBorder: "bg-gradient-to-br from-[#F59E0B] via-[#FBBF24] to-[#D97706]",
                shadow: "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_36px_rgba(245,158,11,0.16)]",
                badgeText: "1st Place",
                badgeVariant: "gold" as const,
                icon: <Crown className="h-4 w-4 text-[#D97706] fill-[#FBBF24]" />,
                accentColor: "text-[#B45309]",
                ribbon: "Top Leader",
              }
            : isSecond
            ? {
                outerBorder: "bg-gradient-to-br from-[#94A3B8] via-[#E2E8F0] to-[#64748B]",
                shadow: "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_rgba(100,116,139,0.12)]",
                badgeText: "2nd Place",
                badgeVariant: "silver" as const,
                icon: <Medal className="h-4 w-4 text-[#475569] fill-[#CBD5E1]" />,
                accentColor: "text-[#475569]",
                ribbon: "Runner Up",
              }
            : {
                outerBorder: "bg-gradient-to-br from-[#D97706] via-[#FED7AA] to-[#9A3412]",
                shadow: "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_rgba(154,52,18,0.12)]",
                badgeText: "3rd Place",
                badgeVariant: "bronze" as const,
                icon: <Award className="h-4 w-4 text-[#9A3412] fill-[#FDBA74]" />,
                accentColor: "text-[#9A3412]",
                ribbon: "Bronze Pick",
              };

          return (
            <div
              key={product.id}
              className={`relative rounded-[16px] p-[2px] ${rankConfig.outerBorder} ${rankConfig.shadow} transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between select-none`}
            >
              <div className="relative h-full w-full rounded-[14px] bg-white p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  {/* Top Badge & Rank Header */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={rankConfig.badgeVariant} size="md" icon={rankConfig.icon}>
                      {rankConfig.badgeText}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 text-[10px] font-mono font-medium text-[#66666B]">
                        {product.category}
                      </span>
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-full text-[#8E8E93] hover:text-[#0F0F10] hover:bg-[#FAFAF7] transition-colors"
                        title="Visit website"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {/* Product Logo & Name */}
                  <div
                    onClick={() => onProductClick?.(product.id)}
                    className="flex items-start gap-3.5 mb-3 cursor-pointer group/title"
                  >
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br ${product.avatarGradient} text-white font-heading font-extrabold text-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] group-hover/title:scale-105 transition-transform`}
                    >
                      {product.initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-bold text-lg sm:text-xl text-[#0F0F10] tracking-tight truncate group-hover/title:text-[#5B5BF0] transition-colors">
                        {product.name}
                      </h3>
                      {/* Maker Name + Avatar */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full ${product.maker.avatarColor} text-[9px] font-bold text-white`}
                        >
                          {product.maker.avatarInitials}
                        </div>
                        <span className="text-xs text-[#66666B] font-medium">
                          {product.maker.name}
                        </span>
                        <span className="text-[10px] text-[#8E8E93]">
                          ({product.maker.role})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs sm:text-sm text-[#66666B] leading-relaxed line-clamp-2 mb-4">
                    {product.tagline}
                  </p>
                </div>

                {/* Bottom Row: Upvote Pill + Comment Count */}
                <div className="pt-3.5 border-t border-[#E8E8E3] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="font-mono">{product.commentsCount} comments</span>
                  </div>

                  {/* Vertical Upvote Pill with Bounce */}
                  <button
                    onClick={() => handleUpvote(product.id)}
                    className={`group relative flex flex-col items-center justify-center w-14 h-16 rounded-[12px] border transition-all duration-200 select-none cursor-pointer active:scale-95 ${
                      product.isUpvoted
                        ? "bg-[#5B5BF0] text-white border-[#5B5BF0] shadow-[0_4px_14px_rgba(91,91,240,0.35)] -translate-y-0.5"
                        : "bg-white text-[#0F0F10] border-[#E8E8E3] hover:border-[#5B5BF0]/40 hover:bg-[#FAFAF7] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    }`}
                  >
                    <ChevronUp
                      className={`h-4 w-4 transition-transform duration-200 ${
                        product.isUpvoted
                          ? "text-white"
                          : "text-[#8E8E93] group-hover:text-[#5B5BF0] group-hover:-translate-y-0.5"
                      }`}
                    />
                    <span className="font-mono text-xs font-bold tracking-tight">
                      {product.upvotes}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. BELOW PODIUM: "PREMIUM LAUNCHES" COMPACT ROWS LIST */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-lg text-[#0F0F10] tracking-tight">
              Premium Launches
            </h3>
            <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 text-[11px] font-mono text-[#66666B]">
              Rank #4 & beyond
            </span>
          </div>

          <span className="text-xs text-[#8E8E93] hidden sm:inline">
            Ranked by community votes
          </span>
        </div>

        {/* Compact Rows */}
        <div className="space-y-2.5">
          {regularLaunches.map((product) => (
            <div
              key={product.id}
              className="group relative flex items-center justify-between rounded-[14px] border border-[#E8E8E3] bg-white p-3.5 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#D5D5CE] hover:bg-[#FAFAF7]/70 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
            >
              {/* Left Details: Rank #, Logo, Name & Tagline */}
              <div
                onClick={() => onProductClick?.(product.id)}
                className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-4 cursor-pointer"
              >
                {/* Rank Number */}
                <span className="font-mono font-bold text-xs sm:text-sm text-[#8E8E93] w-6 shrink-0 text-center">
                  #{product.rank}
                </span>

                {/* 40px Squircle Logo */}
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${product.avatarGradient} text-white font-heading font-bold text-sm shadow-[0_2px_6px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-200`}
                >
                  {product.initials}
                </div>

                {/* Name, Tagline & Category */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-heading font-bold text-sm sm:text-base text-[#0F0F10] tracking-tight group-hover:text-[#5B5BF0] transition-colors truncate">
                      {product.name}
                    </h4>

                    <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 text-[10px] font-medium text-[#66666B] hidden sm:inline">
                      {product.category}
                    </span>

                    <span className="text-xs text-[#8E8E93] font-medium hidden md:inline">
                      by {product.maker.name}
                    </span>
                  </div>

                  <p className="text-xs text-[#66666B] truncate max-w-xl">
                    {product.tagline}
                  </p>
                </div>
              </div>

              {/* Right: Comments, Slide-in Arrow & Upvote Button */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="hidden sm:flex items-center gap-1 text-xs text-[#8E8E93]">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="font-mono">{product.commentsCount}</span>
                </div>

                {/* Slide-in Arrow on Row Hover */}
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 p-1.5 rounded-full text-[#5B5BF0] hover:bg-[#EEF0FE] hidden sm:flex items-center justify-center"
                  title="Visit tool"
                >
                  <ArrowRight className="h-4 w-4" />
                </a>

                {/* Vertical Upvote Pill with Bounce */}
                <button
                  onClick={() => handleUpvote(product.id)}
                  className={`group/btn flex flex-col items-center justify-center w-12 h-14 rounded-[10px] border transition-all duration-200 select-none cursor-pointer active:scale-95 ${
                    product.isUpvoted
                      ? "bg-[#5B5BF0] text-white border-[#5B5BF0] shadow-[0_2px_8px_rgba(91,91,240,0.3)] -translate-y-0.5"
                      : "bg-[#FAFAF7] text-[#0F0F10] border-[#E8E8E3] hover:border-[#5B5BF0]/40 hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  }`}
                >
                  <ChevronUp
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      product.isUpvoted
                        ? "text-white"
                        : "text-[#8E8E93] group-hover/btn:text-[#5B5BF0] group-hover/btn:-translate-y-0.5"
                    }`}
                  />
                  <span className="font-mono text-xs font-bold tracking-tight">
                    {product.upvotes}
                  </span>
                </button>
              </div>
            </div>
          ))}

          {/* Skeleton Loading States when expanding */}
          {isLoadingMore && (
            <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-[14px] border border-[#E8E8E3] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] animate-pulse"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-4 w-6 bg-[#E8E8E3] rounded" />
                    <div className="h-11 w-11 bg-[#E8E8E3] rounded-[10px]" />
                    <div className="space-y-2 flex-1 max-w-md">
                      <div className="h-4 bg-[#E8E8E3] rounded w-1/3" />
                      <div className="h-3 bg-[#F5F5F0] rounded w-2/3" />
                    </div>
                  </div>
                  <div className="h-14 w-12 bg-[#E8E8E3] rounded-[10px]" />
                </div>
              ))}
            </div>
          )}

          {/* Additional rows shown after expansion */}
          {isExpanded && (
            <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
              {[
                {
                  id: "lb-extra-1",
                  name: "SaaSStash",
                  tagline: "Curated directory of 1,200+ micro-SaaS resources and developer deals",
                  category: "Productivity",
                  upvotes: 91,
                  rank: 9,
                  commentsCount: 6,
                  avatarGradient: "from-[#F59E0B] to-[#FBBF24]",
                  initials: "SS",
                  url: "#",
                  maker: { name: "Leo Miller" },
                },
                {
                  id: "lb-extra-2",
                  name: "CloudMeter",
                  tagline: "Automated AWS and GCP egress cost anomaly detector with Slack webhooks",
                  category: "Developer Tools",
                  upvotes: 84,
                  rank: 10,
                  commentsCount: 8,
                  avatarGradient: "from-[#059669] to-[#34D399]",
                  initials: "CM",
                  url: "#",
                  maker: { name: "Ananya Patel" },
                },
                {
                  id: "lb-extra-3",
                  name: "BrandMark AI",
                  tagline: "Generate vector logos, style guides, and brand kits in under 30 seconds",
                  category: "Design & UX",
                  upvotes: 76,
                  rank: 11,
                  commentsCount: 5,
                  avatarGradient: "from-[#7C3AED] to-[#A78BFA]",
                  initials: "BM",
                  url: "#",
                  maker: { name: "Sam Brody" },
                },
              ].map((product) => (
                <div
                  key={product.id}
                  className="group relative flex items-center justify-between rounded-[14px] border border-[#E8E8E3] bg-white p-3.5 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#D5D5CE] hover:bg-[#FAFAF7]/70"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-4">
                    <span className="font-mono font-bold text-xs sm:text-sm text-[#8E8E93] w-6 shrink-0 text-center">
                      #{product.rank}
                    </span>
                    <div
                      className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${product.avatarGradient} text-white font-heading font-bold text-sm shadow-[0_2px_6px_rgba(0,0,0,0.06)]`}
                    >
                      {product.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-sm sm:text-base text-[#0F0F10] truncate">
                          {product.name}
                        </h4>
                        <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 text-[10px] font-medium text-[#66666B] hidden sm:inline">
                          {product.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#66666B] truncate max-w-xl">
                        {product.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1 text-xs text-[#8E8E93]">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span className="font-mono">{product.commentsCount}</span>
                    </div>

                    <button
                      onClick={() => handleUpvote(product.id)}
                      className="flex flex-col items-center justify-center w-12 h-14 rounded-[10px] border border-[#E8E8E3] bg-[#FAFAF7] hover:bg-white text-[#0F0F10] hover:border-[#5B5BF0]/40 transition-colors cursor-pointer"
                    >
                      <ChevronUp className="h-3.5 w-3.5 text-[#8E8E93]" />
                      <span className="font-mono text-xs font-bold">
                        {product.upvotes}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. "SHOW MORE LAUNCHES (563 REMAINING)" BUTTON */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleShowMore}
            disabled={isLoadingMore || isExpanded}
            className="group inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E8E8E3] bg-white px-6 py-3 text-sm font-semibold text-[#0F0F10] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#D5D5CE] hover:bg-[#FAFAF7] hover:-translate-y-0.5 disabled:opacity-75 disabled:hover:translate-y-0 cursor-pointer"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#5B5BF0]" />
                <span>Loading launches...</span>
              </>
            ) : isExpanded ? (
              <>
                <Sparkles className="h-4 w-4 text-[#5B5BF0]" />
                <span>All 563+ launches active</span>
              </>
            ) : (
              <>
                <span>Show more launches (563 remaining)</span>
                <span className="text-[#8E8E93] group-hover:translate-y-0.5 transition-transform">
                  ↓
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

