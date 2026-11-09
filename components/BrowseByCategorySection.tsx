"use client";

import React from "react";
import Link from "next/link";
import {
  Bot,
  Cloud,
  Megaphone,
  Zap,
  Code2,
  Palette,
  Coins,
  HeartPulse,
  Video,
  ShoppingBag,
  ArrowRight,
  Layers,
} from "lucide-react";

export interface CategoryCardData {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBg: string;
  cardHoverBorder: string;
  cardArrowColor: string;
}

export const CATEGORIES_DATA: CategoryCardData[] = [
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    count: 428,
    icon: <Bot className="h-5 w-5" />,
    iconBg: "bg-[#EEF0FE]",
    iconColor: "text-[#5B5BF0]",
    cardBg: "bg-[#FAF9FF]",
    cardBorder: "border-[#E8E8FD]",
    cardHoverBg: "hover:bg-[#F3F2FE]",
    cardHoverBorder: "hover:border-[#C7CAFC]",
    cardArrowColor: "text-[#5B5BF0]",
  },
  {
    id: "saas-tools",
    name: "SaaS & Tools",
    count: 384,
    icon: <Cloud className="h-5 w-5" />,
    iconBg: "bg-[#E0F2FE]",
    iconColor: "text-[#0284C7]",
    cardBg: "bg-[#F7FAFD]",
    cardBorder: "border-[#E2EFFC]",
    cardHoverBg: "hover:bg-[#EDF6FD]",
    cardHoverBorder: "hover:border-[#BAE6FD]",
    cardArrowColor: "text-[#0284C7]",
  },
  {
    id: "marketing-sales",
    name: "Marketing & Sales",
    count: 246,
    icon: <Megaphone className="h-5 w-5" />,
    iconBg: "bg-[#FFEDD5]",
    iconColor: "text-[#EA580C]",
    cardBg: "bg-[#FFF9F4]",
    cardBorder: "border-[#FDEEE2]",
    cardHoverBg: "hover:bg-[#FFF3E8]",
    cardHoverBorder: "hover:border-[#FED7AA]",
    cardArrowColor: "text-[#EA580C]",
  },
  {
    id: "productivity",
    name: "Productivity",
    count: 312,
    icon: <Zap className="h-5 w-5" />,
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]",
    cardBg: "bg-[#FFFCF2]",
    cardBorder: "border-[#FDF6E2]",
    cardHoverBg: "hover:bg-[#FEF7D8]",
    cardHoverBorder: "hover:border-[#FDE68A]",
    cardArrowColor: "text-[#D97706]",
  },
  {
    id: "developer-tools",
    name: "Developer Tools",
    count: 389,
    icon: <Code2 className="h-5 w-5" />,
    iconBg: "bg-[#ECFDF5]",
    iconColor: "text-[#059669]",
    cardBg: "bg-[#F7FDFB]",
    cardBorder: "border-[#E3F7EE]",
    cardHoverBg: "hover:bg-[#ECFAF3]",
    cardHoverBorder: "hover:border-[#A7F3D0]",
    cardArrowColor: "text-[#059669]",
  },
  {
    id: "design-art",
    name: "Design & Art",
    count: 194,
    icon: <Palette className="h-5 w-5" />,
    iconBg: "bg-[#FCE7F3]",
    iconColor: "text-[#DB2777]",
    cardBg: "bg-[#FDF7FA]",
    cardBorder: "border-[#FCE6F1]",
    cardHoverBg: "hover:bg-[#FCEBF5]",
    cardHoverBorder: "hover:border-[#FBCFE8]",
    cardArrowColor: "text-[#DB2777]",
  },
  {
    id: "finance-fintech",
    name: "Finance & FinTech",
    count: 162,
    icon: <Coins className="h-5 w-5" />,
    iconBg: "bg-[#DCFCE7]",
    iconColor: "text-[#16A34A]",
    cardBg: "bg-[#F7FDF8]",
    cardBorder: "border-[#E1F7E8]",
    cardHoverBg: "hover:bg-[#ECFBF1]",
    cardHoverBorder: "hover:border-[#BBF7D0]",
    cardArrowColor: "text-[#16A34A]",
  },
  {
    id: "health-wellness",
    name: "Health & Wellness",
    count: 98,
    icon: <HeartPulse className="h-5 w-5" />,
    iconBg: "bg-[#FEE2E2]",
    iconColor: "text-[#DC2626]",
    cardBg: "bg-[#FFF7F7]",
    cardBorder: "border-[#FDE6E6]",
    cardHoverBg: "hover:bg-[#FEECEB]",
    cardHoverBorder: "hover:border-[#FECACA]",
    cardArrowColor: "text-[#DC2626]",
  },
  {
    id: "video-content",
    name: "Video & Content",
    count: 175,
    icon: <Video className="h-5 w-5" />,
    iconBg: "bg-[#F3E8FF]",
    iconColor: "text-[#9333EA]",
    cardBg: "bg-[#FAF7FD]",
    cardBorder: "border-[#F2E8FC]",
    cardHoverBg: "hover:bg-[#F4ECFD]",
    cardHoverBorder: "hover:border-[#E9D5FF]",
    cardArrowColor: "text-[#9333EA]",
  },
  {
    id: "e-commerce",
    name: "E-commerce",
    count: 210,
    icon: <ShoppingBag className="h-5 w-5" />,
    iconBg: "bg-[#DBEAFE]",
    iconColor: "text-[#2563EB]",
    cardBg: "bg-[#F7FAFF]",
    cardBorder: "border-[#E3EEFD]",
    cardHoverBg: "hover:bg-[#ECF4FE]",
    cardHoverBorder: "hover:border-[#BFDBFE]",
    cardArrowColor: "text-[#2563EB]",
  },
];

export interface BrowseByCategorySectionProps {
  onCategorySelect?: (categoryId: string) => void;
}

export const BrowseByCategorySection: React.FC<BrowseByCategorySectionProps> = ({
  onCategorySelect,
}) => {
  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E8E3] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF0FE] text-[#5B5BF0] text-xs">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#5B5BF0]">
              Discover Directory
            </span>
          </div>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F0F10] tracking-[-0.03em]">
            Browse by Category
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-[#66666B]">
            Explore 2,600+ curated SaaS products, developer tools, and autonomous AI agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/categories"
            className="text-xs font-semibold text-[#5B5BF0] hover:underline flex items-center gap-1"
          >
            <span>Explore all categories</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <span className="text-xs font-mono text-[#8E8E93] hidden sm:block">• 10 Ecosystem Categories</span>
        </div>
      </div>

      {/* Grid: 4-col desktop / 2-col mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {CATEGORIES_DATA.map((cat) => (
          <div
            key={cat.id}
            role="button"
            tabIndex={0}
            onClick={() => onCategorySelect?.(cat.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCategorySelect?.(cat.id);
              }
            }}
            className={`group relative flex flex-col justify-between rounded-[14px] border ${cat.cardBorder} ${cat.cardBg} p-4 sm:p-4.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 cursor-pointer select-none hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5BF0] ${cat.cardHoverBg} ${cat.cardHoverBorder}`}
          >
            <div>
              {/* Colorful icon in rounded square (42px) */}
              <div
                className={`flex h-10.5 w-10.5 sm:h-11 sm:w-11 items-center justify-center rounded-[10px] ${cat.iconBg} ${cat.iconColor} shadow-[0_1px_2px_rgba(0,0,0,0.04)] group-hover:scale-105 transition-transform duration-200 mb-3`}
              >
                {cat.icon}
              </div>

              {/* Category Name */}
              <h3 className="font-heading font-bold text-sm sm:text-base text-[#0F0F10] tracking-tight group-hover:text-[#5B5BF0] transition-colors line-clamp-1 mb-1">
                {cat.name}
              </h3>
            </div>

            {/* Bottom Row: Tool count & Arrow on hover */}
            <div className="pt-2 mt-2 border-t border-black/[0.06] flex items-center justify-between text-xs">
              <span className="font-mono text-[#8E8E93] text-[11px] sm:text-xs font-medium">
                {cat.count} tools
              </span>

              {/* Arrow on hover */}
              <div className={`flex items-center ${cat.cardArrowColor} opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200`}>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

