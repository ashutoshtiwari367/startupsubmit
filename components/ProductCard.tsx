"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/Badge";
import {
  ChevronUp,
  MessageSquare,
  ExternalLink,
  Crown,
  Medal,
  Award,
  Sparkles,
  Trophy,
} from "lucide-react";

export interface ProductCardMaker {
  name: string;
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColor?: string;
  role?: string;
}

export interface ProductCardData {
  id: string;
  name: string;
  tagline: string;
  category: string;
  upvotes: number;
  isUpvoted?: boolean;
  rank?: number;
  commentsCount: number;
  url: string;
  logoUrl?: string;
  initials: string;
  avatarGradient?: string;
  maker: ProductCardMaker;
  badgeEarned?: string; // e.g. "#1 Product of the Day", "Top 3 Winner"
}

export interface ProductCardProps {
  product: ProductCardData;
  variant?: "podium" | "row" | "grid";
  onUpvoteToggle?: (id: string, isUpvoted: boolean) => void;
  onCardClick?: (id: string) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = "grid",
  onUpvoteToggle,
  onCardClick,
  className,
}) => {
  const [upvoted, setUpvoted] = useState(product.isUpvoted || false);
  const [count, setCount] = useState(product.upvotes);
  const [isBouncing, setIsBouncing] = useState(false);

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !upvoted;
    setUpvoted(nextState);
    setCount((prev) => (nextState ? prev + 1 : prev - 1));
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 250);
    onUpvoteToggle?.(product.id, nextState);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Rank configurations for podium & badge earned
  const isRankOne = product.rank === 1;
  const isRankTwo = product.rank === 2;
  const isRankThree = product.rank === 3;

  const getRankBadge = () => {
    if (isRankOne) {
      return {
        icon: <Crown className="h-3.5 w-3.5 text-[#D97706] fill-[#FBBF24]" />,
        text: "1st Place",
        badgeVariant: "gold" as const,
        borderGradient: "from-[#F59E0B] via-[#FBBF24] to-[#D97706]",
        shadow: "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_36px_rgba(245,158,11,0.15)]",
      };
    }
    if (isRankTwo) {
      return {
        icon: <Medal className="h-3.5 w-3.5 text-[#475569] fill-[#CBD5E1]" />,
        text: "2nd Place",
        badgeVariant: "silver" as const,
        borderGradient: "from-[#94A3B8] via-[#E2E8F0] to-[#64748B]",
        shadow: "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_rgba(100,116,139,0.12)]",
      };
    }
    if (isRankThree) {
      return {
        icon: <Award className="h-3.5 w-3.5 text-[#9A3412] fill-[#FDBA74]" />,
        text: "3rd Place",
        badgeVariant: "bronze" as const,
        borderGradient: "from-[#D97706] via-[#FED7AA] to-[#9A3412]",
        shadow: "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_rgba(154,52,18,0.12)]",
      };
    }
    return null;
  };

  const rankBadge = getRankBadge();

  // Common Logo Render
  const renderLogo = (sizeClass: string) => (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white font-heading font-extrabold shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden transition-transform duration-200 group-hover:scale-105",
        product.avatarGradient || "from-[#5B5BF0] to-[#7E7EF6]",
        sizeClass
      )}
    >
      {product.logoUrl ? (
        <img
          src={product.logoUrl}
          alt={product.name}
          className="h-full w-full object-cover rounded-xl"
        />
      ) : (
        <span>{product.initials}</span>
      )}
    </div>
  );

  // Common Maker Tag Render
  const renderMaker = () => (
    <div className="flex items-center gap-1.5 min-w-0">
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white overflow-hidden",
          product.maker.avatarColor || "bg-[#5B5BF0]"
        )}
      >
        {product.maker.avatarUrl ? (
          <img
            src={product.maker.avatarUrl}
            alt={product.maker.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>
            {product.maker.avatarInitials ||
              product.maker.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
          </span>
        )}
      </div>
      <span className="text-xs text-[#66666B] font-medium truncate">
        by {product.maker.name}
      </span>
    </div>
  );

  // Common Upvote Button Render (vertical pill with bounce)
  const renderUpvoteButton = (buttonSize = "w-13 h-15") => (
    <button
      type="button"
      onClick={handleUpvoteClick}
      aria-label={`Upvote ${product.name}, currently ${count} upvotes`}
      className={cn(
        "group/upvote relative flex flex-col items-center justify-center rounded-[11px] border transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5BF0] focus-visible:ring-offset-2 active:scale-95 shrink-0",
        buttonSize,
        upvoted
          ? "bg-[#5B5BF0] text-white border-[#5B5BF0] shadow-[0_4px_14px_rgba(91,91,240,0.35)] -translate-y-0.5"
          : "bg-white text-[#0F0F10] border-[#E8E8E3] hover:border-[#5B5BF0]/40 hover:bg-[#FAFAF7] shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        isBouncing && "scale-105"
      )}
    >
      <ChevronUp
        className={cn(
          "h-4 w-4 transition-transform duration-200 stroke-[2.5]",
          upvoted
            ? "text-white"
            : "text-[#8E8E93] group-hover/upvote:text-[#5B5BF0] group-hover/upvote:-translate-y-0.5",
          isBouncing && "-translate-y-1"
        )}
      />
      <span
        className={cn(
          "font-mono text-xs font-bold tracking-tight",
          upvoted ? "text-white" : "text-[#0F0F10]"
        )}
      >
        {count}
      </span>
    </button>
  );

  // ==========================================
  // VARIANT 1: PODIUM (LARGE)
  // ==========================================
  if (variant === "podium") {
    const borderWrap = rankBadge
      ? cn("p-[2px] rounded-[16px] bg-gradient-to-br", rankBadge.borderGradient, rankBadge.shadow)
      : "rounded-[16px] border border-[#E8E8E3] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.05)]";

    return (
      <div
        onClick={() => onCardClick?.(product.id)}
        tabIndex={0}
        className={cn(
          "group relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5BF0] focus-visible:ring-offset-2 cursor-pointer select-none",
          borderWrap,
          className
        )}
      >
        <div className="relative h-full w-full rounded-[14px] bg-white p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Top Ribbon / Rank Header */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                {rankBadge ? (
                  <Badge variant={rankBadge.badgeVariant} size="md" icon={rankBadge.icon}>
                    {rankBadge.text}
                  </Badge>
                ) : product.rank ? (
                  <Badge variant="neutral" size="sm">
                    #{product.rank} Leaderboard
                  </Badge>
                ) : null}

                {/* "Badge earned" tiny ribbon for winners */}
                {(product.badgeEarned || rankBadge) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF9E7] border border-[#F7E5A9] px-2 py-0.5 text-[10px] font-bold text-[#B45309] uppercase tracking-wider">
                    <Trophy className="h-3 w-3 text-[#D97706]" />
                    <span>Badge Earned</span>
                  </span>
                )}
              </div>

              {/* External Link */}
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="p-1.5 rounded-full text-[#8E8E93] hover:text-[#5B5BF0] hover:bg-[#EEF0FE] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5BF0]"
                title="Visit website"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Logo + Product Name + Category */}
            <div className="flex items-start gap-3.5 mb-3">
              {renderLogo("h-14 w-14 text-xl")}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0F0F10] tracking-tight truncate group-hover:text-[#5B5BF0] transition-colors">
                    {product.name}
                  </h3>
                  <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 text-[10px] font-mono font-medium text-[#66666B]">
                    {product.category}
                  </span>
                </div>

                <div className="mt-1">{renderMaker()}</div>
              </div>
            </div>

            {/* 1-line Tagline (Truncate) */}
            <p className="text-xs sm:text-sm text-[#66666B] leading-relaxed truncate mb-4">
              {product.tagline}
            </p>
          </div>

          {/* Footer: Comments Count & Upvote Button */}
          <div className="pt-3.5 border-t border-[#E8E8E3] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="font-mono">{product.commentsCount} comments</span>
            </div>

            {renderUpvoteButton("w-14 h-16")}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VARIANT 2: ROW (COMPACT)
  // ==========================================
  if (variant === "row") {
    return (
      <div
        onClick={() => onCardClick?.(product.id)}
        tabIndex={0}
        className={cn(
          "group relative flex items-center justify-between rounded-[14px] border border-[#E8E8E3] bg-white p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#D5D5CE] hover:bg-[#FAFAF7]/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5BF0] focus-visible:ring-offset-2 cursor-pointer select-none",
          className
        )}
      >
        {/* Left: Rank, Logo, Info */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0 pr-2 sm:pr-4">
          {product.rank && (
            <span className="font-mono font-bold text-xs sm:text-sm text-[#8E8E93] w-5 sm:w-6 shrink-0 text-center">
              #{product.rank}
            </span>
          )}

          {renderLogo("h-10 w-10 sm:h-11 sm:w-11 text-sm")}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h4 className="font-heading font-bold text-sm sm:text-base text-[#0F0F10] tracking-tight group-hover:text-[#5B5BF0] transition-colors truncate">
                {product.name}
              </h4>

              <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.2 text-[10px] font-medium text-[#66666B] hidden sm:inline">
                {product.category}
              </span>

              {/* Badge earned ribbon for winners in row format */}
              {product.badgeEarned && (
                <span className="rounded-full bg-[#FEF9E7] border border-[#F7E5A9] px-1.5 py-0.2 text-[9px] font-bold text-[#B45309] hidden md:inline">
                  🏆 {product.badgeEarned}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-[#66666B] truncate max-w-sm sm:max-w-md">
                {product.tagline}
              </p>
              <span className="text-[#D5D5CE] hidden md:inline">•</span>
              <div className="hidden md:block shrink-0">{renderMaker()}</div>
            </div>
          </div>
        </div>

        {/* Right: Comments, External Link, Upvote */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-xs text-[#8E8E93]">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="font-mono">{product.commentsCount}</span>
          </div>

          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="p-1.5 rounded-full text-[#8E8E93] hover:text-[#5B5BF0] hover:bg-[#EEF0FE] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5BF0]"
            title="Visit website"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {renderUpvoteButton("w-11 h-13 sm:w-12 sm:h-14")}
        </div>
      </div>
    );
  }

  // ==========================================
  // VARIANT 3: GRID (MEDIUM) - DEFAULT
  // ==========================================
  return (
    <div
      onClick={() => onCardClick?.(product.id)}
      tabIndex={0}
      className={cn(
        "group relative flex flex-col justify-between rounded-[14px] border border-[#E8E8E3] bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#D5D5CE] hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5BF0] focus-visible:ring-offset-2 cursor-pointer select-none",
        isRankOne && "border-[#5B5BF0]/40 shadow-[0_4px_20px_rgba(91,91,240,0.08)]",
        className
      )}
    >
      <div>
        {/* Top Header: Badge / Category & External Link */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 text-[10px] font-medium text-[#66666B]">
              {product.category}
            </span>

            {product.badgeEarned ? (
              <span className="rounded-full bg-[#FEF9E7] border border-[#F7E5A9] px-2 py-0.5 text-[10px] font-bold text-[#B45309] truncate">
                ★ {product.badgeEarned}
              </span>
            ) : product.rank ? (
              <span className="font-mono text-[11px] font-bold text-[#8E8E93]">
                #{product.rank}
              </span>
            ) : null}
          </div>

          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="p-1 rounded-full text-[#8E8E93] hover:text-[#5B5BF0] hover:bg-[#FAFAF7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5BF0]"
            title="Visit website"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Logo + Product Name */}
        <div className="flex items-start gap-3 mb-2.5">
          {renderLogo("h-12 w-12 text-base")}

          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-bold text-base text-[#0F0F10] tracking-tight truncate group-hover:text-[#5B5BF0] transition-colors">
              {product.name}
            </h4>
            <div className="mt-0.5">{renderMaker()}</div>
          </div>
        </div>

        {/* 1-line Tagline (Truncate) */}
        <p className="text-xs text-[#66666B] leading-relaxed truncate mb-4">
          {product.tagline}
        </p>
      </div>

      {/* Bottom Footer: Comments & Upvote Pill */}
      <div className="pt-3 border-t border-[#E8E8E3]/70 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="font-mono">{product.commentsCount} comments</span>
        </div>

        {renderUpvoteButton("w-12 h-14")}
      </div>
    </div>
  );
};

