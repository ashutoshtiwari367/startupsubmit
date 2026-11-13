"use client";

import React from "react";
import { Badge } from "@/components/Badge";
import {
  Trophy,
  Medal,
  Award,
  ArrowRight,
  ExternalLink,
  ChevronUp,
  Link2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export interface WinnerItem {
  rank: 1 | 2 | 3;
  medalEmoji: string;
  name: string;
  tagline: string;
  category: string;
  upvotes: number;
  url: string;
  initials: string;
  avatarGradient: string;
  maker: {
    name: string;
    avatarInitials: string;
    avatarColor: string;
  };
}

export const LATEST_WINNERS: WinnerItem[] = [
  {
    rank: 1,
    medalEmoji: "🥇",
    name: "QueryCraft",
    tagline: "Natural language SQL generator connected directly to read replicas with explain analyze verification.",
    category: "Analytics & Data",
    upvotes: 512,
    url: "https://querycraft.ai",
    initials: "QC",
    avatarGradient: "from-[#4F46E5] to-[#818CF8]",
    maker: {
      name: "Sarah Jenkins",
      avatarInitials: "SJ",
      avatarColor: "bg-[#4F46E5]",
    },
  },
  {
    rank: 2,
    medalEmoji: "🥈",
    name: "ShipFast Native",
    tagline: "React Native boilerplate with pre-configured Stripe in-app subscriptions and biometric auth.",
    category: "Developer Tools",
    upvotes: 429,
    url: "https://shipfastnative.com",
    initials: "SF",
    avatarGradient: "from-[#0F8A5F] to-[#34D399]",
    maker: {
      name: "Kyle Brody",
      avatarInitials: "KB",
      avatarColor: "bg-[#0F8A5F]",
    },
  },
  {
    rank: 3,
    medalEmoji: "🥉",
    name: "HyperDraft",
    tagline: "AI video storyboard generator turning product release notes into 30s marketing teasers.",
    category: "Productivity",
    upvotes: 367,
    url: "https://hyperdraft.video",
    initials: "HD",
    avatarGradient: "from-[#7A4E00] to-[#FBBF24]",
    maker: {
      name: "Nico Ramirez",
      avatarInitials: "NR",
      avatarColor: "bg-[#7A4E00]",
    },
  },
];

export interface LatestWinnersSectionProps {
  onSeeAllWinnersClick?: () => void;
  onViewLaunchClick?: (url: string) => void;
}

export const LatestWinnersSection: React.FC<LatestWinnersSectionProps> = ({
  onSeeAllWinnersClick,
  onViewLaunchClick,
}) => {
  return (
    <section className="relative w-full max-w-[1240px] mx-auto px-6 py-12 md:py-[72px] space-y-6">
      {/* Header bar: Title, Caption, See all winners link */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6E6F0] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF1D6] text-[#7A4E00] text-xs">
              🏆
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-medium uppercase tracking-[0.08em] text-[#4F46E5]">
              Yesterday's Hall of Fame
            </span>
          </div>

 <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] text-[#14142B] tracking-[-0.03em]">
            Latest Winners
          </h2>

          {/* Small Caption */}
          <p className="mt-1.5 text-base text-[#55556E] leading-relaxed flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 font-medium text-[#14142B]">
              <Sparkles className="h-3.5 w-3.5 text-[#4F46E5]" />
              Winners get a badge + permanent spotlight
            </span>
            <span className="text-[#55556E] hidden md:inline">
              (Top community ranked products)
            </span>
          </p>
        </div>

        {/* "See all winners" link */}
        <button
          onClick={onSeeAllWinnersClick}
          className="group inline-flex items-center gap-1 text-sm font-semibold text-[#4F46E5] hover:text-[#4F46E5] transition-colors self-start sm:self-end cursor-pointer"
        >
          <span>See all winners</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 3-Column Layout of Trophy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
        {LATEST_WINNERS.map((winner) => {
          const isGold = winner.rank === 1;
          const isSilver = winner.rank === 2;
          const isBronze = winner.rank === 3;

          const theme = isGold
            ? {
                bgGradient:
                  "bg-gradient-to-br from-[#FFF1D6] via-[#FFFDF7] to-[#FDF4D7]",
                border: "border-[#F7E5A9]",
                shadow:
                  "",
                badgeText: "1st Place Winner",
                badgeVariant: "gold" as const,
                icon: <Trophy className="h-3.5 w-3.5 text-[#7A4E00]" />,
                textColor: "text-[#7A4E00]",
                buttonBg: "hover:bg-[#FDF4D7]",
              }
            : isSilver
            ? {
                bgGradient:
                  "bg-gradient-to-br from-[#F1F3F5] via-[#F8F9FA] to-[#E9ECEF]",
                border: "border-[#DDE1E5]",
                shadow:
                  "",
                badgeText: "2nd Place Winner",
                badgeVariant: "silver" as const,
                icon: <Medal className="h-3.5 w-3.5 text-[#475569]" />,
                textColor: "text-[#475569]",
                buttonBg: "hover:bg-[#E9ECEF]",
              }
            : {
                bgGradient:
                  "bg-gradient-to-br from-[#FAF2EB] via-[#FFF8F2] to-[#F5E6D8]",
                border: "border-[#ECD5C5]",
                shadow:
                  "",
                badgeText: "3rd Place Winner",
                badgeVariant: "bronze" as const,
                icon: <Award className="h-3.5 w-3.5 text-[#9A3412]" />,
                textColor: "text-[#9A3412]",
                buttonBg: "hover:bg-[#F5E6D8]",
              };

          return (
            <div
              key={winner.rank}
              className={`group relative flex flex-col justify-between rounded-2xl border ${theme.border} ${theme.bgGradient} p-5 sm:p-6 ${theme.shadow} transition-all duration-300 hover:-translate-y-1.5 select-none`}
            >
              <div>
                {/* Top Medal Header & Category */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{winner.medalEmoji}</span>
                    <Badge variant={theme.badgeVariant} size="sm" icon={theme.icon}>
                      {theme.badgeText}
                    </Badge>
                  </div>

                  <span className="rounded-full bg-white/80 backdrop-blur-sm border border-[#E6E6F0] px-2.5 py-0.5 text-[10px] font-mono font-medium text-[#55556E]">
                    {winner.category}
                  </span>
                </div>

                {/* Product Logo + Name + Maker */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${winner.avatarGradient} text-white font-heading font-extrabold text-base  group-hover:scale-105 transition-transform duration-200`}
                  >
                    {winner.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#14142B] tracking-tight truncate group-hover:text-[#4F46E5] transition-colors">
                      {winner.name}
                    </h3>

                    {/* Maker with Avatar */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full ${winner.maker.avatarColor} text-[9px] font-bold text-white`}
                      >
                        {winner.maker.avatarInitials}
                      </div>
                      <span className="text-xs text-[#55556E] font-medium truncate">
                        by {winner.maker.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-xs sm:text-sm text-[#55556E] leading-relaxed line-clamp-2 mb-4">
                  {winner.tagline}
                </p>
              </div>

              {/* Bottom Footer: Vote Count & "View launch" Link */}
              <div className="pt-3.5 border-t border-black/[0.06] flex items-center justify-between">
                {/* Featured Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-black/[0.08] px-2.5 py-1 text-xs font-bold text-[#4F46E5]">
                  <span>★</span>
                  <span>Featured Winner</span>
                </div>

                {/* "View launch" Link */}
                <a
                  href={winner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (onViewLaunchClick) {
                      e.preventDefault();
                      onViewLaunchClick(winner.url);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${theme.textColor} hover:underline px-2.5 py-1 rounded-full ${theme.buttonBg} transition-colors`}
                >
                  <span>View launch</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

