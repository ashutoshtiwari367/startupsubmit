"use client";

import React, { useState, useEffect } from "react";
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
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setUpvoted(product.isUpvoted || false);
    setCount(product.upvotes);
  }, [product.isUpvoted, product.upvotes]);

  const handleUpvoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/listings/${product.id}/upvote`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.status === 401 || data.requiresAuth) {
        const nextUrl = typeof window !== "undefined" ? window.location.pathname : "/";
        window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`;
        return;
      }

      if (data.ok) {
        setUpvoted(data.isUpvoted);
        setCount(data.upvotesCount);
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 250);
        onUpvoteToggle?.(product.id, data.isUpvoted);
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsUpdating(false);
    }
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
        icon: <Crown className="h-3.5 w-3.5 text-[#7A4E00] fill-[#FBBF24]" />,
        text: "1st Place",
        badgeVariant: "gold" as const,
        borderGradient: "from-[#F59E0B] via-[#FBBF24] to-[#7A4E00]",
        shadow: "",
      };
    }
    if (isRankTwo) {
      return {
        icon: <Medal className="h-3.5 w-3.5 text-[#475569] fill-[#CBD5E1]" />,
        text: "2nd Place",
        badgeVariant: "silver" as const,
        borderGradient: "from-[#94A3B8] via-[#E2E8F0] to-[#64748B]",
        shadow: "",
      };
    }
    if (isRankThree) {
      return {
        icon: <Award className="h-3.5 w-3.5 text-[#9A3412] fill-[#FDBA74]" />,
        text: "3rd Place",
        badgeVariant: "bronze" as const,
        borderGradient: "from-[#7A4E00] via-[#FED7AA] to-[#9A3412]",
        shadow: "",
      };
    }
    return null;
  };

  const rankBadge = getRankBadge();

  // Common Logo Render
  const renderLogo = (sizeClass: string) => (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white font-heading font-extrabold  overflow-hidden transition-transform duration-200 group-hover:scale-105",
        product.avatarGradient || "from-[#4F46E5] to-[#7E7EF6]",
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
          product.maker.avatarColor || "bg-[#4F46E5]"
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
      <span className="text-xs text-[#55556E] font-medium truncate">
        by {product.maker.name}
      </span>
    </div>
  );

  // Common Action Button Render (Authenticated Upvote Button)
  const renderUpvoteButton = (buttonSize = "w-13 h-15") => (
    <button
      type="button"
      onClick={handleUpvoteClick}
      disabled={isUpdating}
      aria-label={`Upvote ${product.name}, currently ${count} upvotes`}
      className={cn(
        "group/btn relative flex flex-col items-center justify-center rounded-[11px] border transition-all duration-200 select-none cursor-pointer active:scale-95 shrink-0 font-bold text-xs p-1",
        buttonSize,
        upvoted
          ? "bg-[#F7F6FF] text-[#4F46E5] border-[#4F46E5] ring-1 ring-[#4F46E5]"
          : "border-[#E6E6F0] bg-white hover:bg-[#F6F6FB] hover:border-[#D4D4E4] text-[#14142B]"
      )}
    >
      <ChevronUp
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          upvoted ? "text-[#4F46E5]" : "text-[#55556E] group-hover/btn:text-[#4F46E5]",
          isBouncing && "-translate-y-1 scale-110",
          !upvoted && "group-hover/btn:-translate-y-0.5"
        )}
      />
      <span
        className={cn(
          "text-xs font-mono font-bold leading-tight",
          upvoted ? "text-[#4F46E5]" : "text-[#14142B]"
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
      ? cn("p-[2px] rounded-2xl bg-gradient-to-br", rankBadge.borderGradient, rankBadge.shadow)
      : "rounded-2xl border border-[#E6E6F0] ";

    return (
      <div
        onClick={() => onCardClick?.(product.id)}
        tabIndex={0}
        className={cn(
          "group relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 cursor-pointer select-none",
          borderWrap,
          className
        )}
      >
        <div className="relative h-full w-full rounded-2xl bg-white p-5 sm:p-6 flex flex-col justify-between">
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1D6] border border-[#F7E5A9] px-2 py-0.5 text-[10px] font-bold text-[#7A4E00] uppercase tracking-wider">
                    <Trophy className="h-3 w-3 text-[#7A4E00]" />
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
                className="p-1.5 rounded-full text-[#55556E] hover:text-[#4F46E5] hover:bg-[#F7F6FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
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
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#14142B] tracking-tight truncate group-hover:text-[#4F46E5] transition-colors">
                    {product.name}
                  </h3>
                  <span className="rounded-full bg-[#F6F6FB] border border-[#E6E6F0] px-2 py-0.5 text-[10px] font-mono font-medium text-[#55556E]">
                    {product.category}
                  </span>
                </div>

                <div className="mt-1">{renderMaker()}</div>
              </div>
            </div>

            {/* 1-line Tagline (Truncate) */}
            <p className="text-xs sm:text-sm text-[#55556E] leading-relaxed truncate mb-4">
              {product.tagline}
            </p>
          </div>

          {/* Footer: Comments Count & Upvote Button */}
          <div className="pt-3.5 border-t border-[#E6E6F0] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#55556E]">
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
          "group relative flex items-center justify-between rounded-2xl border border-[#E6E6F0] bg-white p-3 sm:p-4  transition-all duration-200 hover:border-[#D4D4E4] hover:bg-[#F6F6FB]/80  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 cursor-pointer select-none",
          className
        )}
      >
        {/* Left: Rank, Logo, Info */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0 pr-2 sm:pr-4">
          {product.rank && (
            <span className="font-mono font-bold text-xs sm:text-sm text-[#55556E] w-5 sm:w-6 shrink-0 text-center">
              #{product.rank}
            </span>
          )}

          {renderLogo("h-10 w-10 sm:h-11 sm:w-11 text-sm")}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h4 className="font-heading font-bold text-sm sm:text-base text-[#14142B] tracking-tight group-hover:text-[#4F46E5] transition-colors truncate">
                {product.name}
              </h4>

              <span className="rounded-full bg-[#F6F6FB] border border-[#E6E6F0] px-2 py-0.2 text-[10px] font-medium text-[#55556E] hidden sm:inline">
                {product.category}
              </span>

              {/* Badge earned ribbon for winners in row format */}
              {product.badgeEarned && (
                <span className="rounded-full bg-[#FFF1D6] border border-[#F7E5A9] px-1.5 py-0.2 text-[9px] font-bold text-[#7A4E00] hidden md:inline">
                  🏆 {product.badgeEarned}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-[#55556E] truncate max-w-sm sm:max-w-md">
                {product.tagline}
              </p>
              <span className="text-[#D4D4E4] hidden md:inline">•</span>
              <div className="hidden md:block shrink-0">{renderMaker()}</div>
            </div>
          </div>
        </div>

        {/* Right: Comments, External Link, Upvote */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-xs text-[#55556E]">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="font-mono">{product.commentsCount}</span>
          </div>

          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="p-1.5 rounded-full text-[#55556E] hover:text-[#4F46E5] hover:bg-[#F7F6FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
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
        "group relative flex flex-col justify-between rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-5  transition-all duration-200 hover:border-[#D4D4E4] hover:-translate-y-1  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 cursor-pointer select-none",
        isRankOne && "border-[#4F46E5]/40 ",
        className
      )}
    >
      <div>
        {/* Top Header: Badge / Category & External Link */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-[#F6F6FB] border border-[#E6E6F0] px-2 py-0.5 text-[10px] font-medium text-[#55556E]">
              {product.category}
            </span>

            {product.badgeEarned ? (
              <span className="rounded-full bg-[#FFF1D6] border border-[#F7E5A9] px-2 py-0.5 text-[10px] font-bold text-[#7A4E00] truncate">
                ★ {product.badgeEarned}
              </span>
            ) : product.rank ? (
              <span className="font-mono text-[11px] font-bold text-[#55556E]">
                #{product.rank}
              </span>
            ) : null}
          </div>

          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="p-1 rounded-full text-[#55556E] hover:text-[#4F46E5] hover:bg-[#F6F6FB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
            title="Visit website"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Logo + Product Name */}
        <div className="flex items-start gap-3 mb-2.5">
          {renderLogo("h-12 w-12 text-base")}

          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-bold text-base text-[#14142B] tracking-tight truncate group-hover:text-[#4F46E5] transition-colors">
              {product.name}
            </h4>
            <div className="mt-0.5">{renderMaker()}</div>
          </div>
        </div>

        {/* 1-line Tagline (Truncate) */}
        <p className="text-xs text-[#55556E] leading-relaxed truncate mb-4">
          {product.tagline}
        </p>
      </div>

      {/* Bottom Footer: Comments & Upvote Pill */}
      <div className="pt-3 border-t border-[#E6E6F0]/70 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#55556E]">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="font-mono">{product.commentsCount} comments</span>
        </div>

        {renderUpvoteButton("w-12 h-14")}
      </div>
    </div>
  );
};

