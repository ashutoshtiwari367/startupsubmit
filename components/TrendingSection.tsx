"use client";

import React, { useRef, useState, useEffect } from "react";
import { Badge } from "@/components/Badge";
import { MOCK_TRENDING_PRODUCTS, TrendingProduct } from "@/lib/mock-data";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";

export interface TrendingSectionProps {
  onViewAllClick?: () => void;
  onProductClick?: (productId: string) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  onViewAllClick,
  onProductClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScrollability, { passive: true });
    window.addEventListener("resize", checkScrollability);
    return () => {
      el.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 300;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#EEF0FE] text-[#5B5BF0]">
            <TrendingUp className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0F0F10] tracking-tight">
              Trending Today
            </h3>
            <span className="rounded-full bg-[#F5F5F0] px-2.5 py-0.5 text-[11px] font-mono font-medium text-[#66666B] border border-[#E8E8E3] flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#8E8E93]" />
              past 24 hours
            </span>
          </div>
        </div>

        {/* Desktop Carousel Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E8E8E3] bg-white text-[#0F0F10] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#D5D5CE] hover:bg-[#FAFAF7] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E8E8E3] bg-white text-[#0F0F10] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#D5D5CE] hover:bg-[#FAFAF7] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel (Drag-scroll on mobile, arrows on desktop) */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 sm:pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
      >
        {MOCK_TRENDING_PRODUCTS.map((product) => {
          const isRankOne = product.rank === 1;

          return (
            <div
              key={product.id}
              onClick={() => onProductClick?.(product.id)}
              className={`group flex-none w-[270px] sm:w-[290px] snap-start rounded-[14px] bg-white p-4 transition-all duration-200 cursor-pointer hover:-translate-y-1 select-none flex flex-col justify-between ${
                isRankOne
                  ? "border-2 border-[#5B5BF0] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(91,91,240,0.12)]"
                  : "border border-[#E8E8E3] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#D5D5CE] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              }`}
            >
              <div>
                {/* Top Row: Rank / Hot Tag & Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    {product.isHot ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 text-[10px] font-bold text-[#DC2626] uppercase tracking-wide">
                        🔥 Hot #1
                      </span>
                    ) : (
                      <span className="font-mono text-xs font-semibold text-[#8E8E93]">
                        #{product.rank}
                      </span>
                    )}
                  </div>

                  <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 text-[10px] font-medium text-[#66666B] truncate max-w-[130px]">
                    {product.category}
                  </span>
                </div>

                {/* Product Identity: Logo + Name */}
                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${product.avatarGradient} text-white font-heading font-bold text-sm shadow-[0_2px_6px_rgba(0,0,0,0.08)] group-hover:scale-105 transition-transform duration-200`}
                  >
                    {product.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-heading font-bold text-base text-[#0F0F10] truncate tracking-tight group-hover:text-[#5B5BF0] transition-colors">
                      {product.name}
                    </h4>
                    <span className="text-[11px] font-mono text-[#8E8E93] block">
                      Launched today
                    </span>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-xs text-[#66666B] leading-relaxed line-clamp-2 mb-3">
                  {product.tagline}
                </p>
              </div>

              {/* Bottom Footer: Flame Upvote Count + Arrow */}
              <div className="pt-2.5 border-t border-[#E8E8E3]/70 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF0FE] text-[#5B5BF0] px-2.5 py-1 text-xs font-bold border border-[#D5D8FC]">
                  <Flame className="h-3.5 w-3.5 text-[#5B5BF0] fill-[#5B5BF0]" />
                  <span>{product.upvotes}</span>
                </div>

                <span className="text-xs font-semibold text-[#8E8E93] group-hover:text-[#5B5BF0] group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                  <span>View</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          );
        })}

        {/* End Card: "+9 more" */}
        <div
          onClick={onViewAllClick}
          className="group flex-none w-[200px] sm:w-[220px] snap-start rounded-[14px] border-2 border-dashed border-[#D5D5CE] hover:border-[#5B5BF0] bg-white/60 hover:bg-white p-5 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(91,91,240,0.08)] flex flex-col justify-between select-none"
        >
          <div className="flex flex-col items-center justify-center text-center h-full my-auto space-y-2 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF0FE] text-[#5B5BF0] group-hover:scale-110 transition-transform duration-200">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="font-heading font-extrabold text-xl text-[#0F0F10] tracking-tight">
              +9 more
            </div>

            <p className="text-xs text-[#66666B] leading-relaxed px-2">
              trending products launched in the past 24 hours
            </p>
          </div>

          <div className="pt-3 border-t border-[#E8E8E3]/70 text-center">
            <span className="text-xs font-semibold text-[#5B5BF0] group-hover:text-[#4B4BE5] flex items-center justify-center gap-1">
              <span>View all launches</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

