"use client";

import React from "react";
import Link from "next/link";
import {
  Bot,
  Briefcase,
  Megaphone,
  Zap,
  Code2,
  Palette,
  Coins,
  HeartPulse,
} from "lucide-react";

export interface CategoryCardData {
  id: string;
  slug: string;
  name: string;
  count: number | string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  cardBg?: string;
  cardBorder?: string;
  cardHoverBg?: string;
  cardHoverBorder?: string;
  cardArrowColor?: string;
}

export const CATEGORIES_DATA: CategoryCardData[] = [
  {
    id: "artificial-intelligence",
    slug: "artificial-intelligence",
    name: "Artificial Intelligence",
    count: 426,
    iconBg: "bg-[#F0EEFF]",
    iconColor: "text-[#4F46E5]",
    icon: <Bot className="h-5 w-5" />,
    cardBg: "bg-white",
    cardBorder: "border-[#E6E6F0]",
    cardHoverBg: "hover:bg-[#F6F6FB]",
    cardHoverBorder: "hover:border-[#D4D4E4]",
    cardArrowColor: "text-[#4F46E5]",
  },
  {
    id: "sales",
    slug: "sales",
    name: "Sales",
    count: 240,
    iconBg: "bg-[#F0FDF4]",
    iconColor: "text-[#15803D]",
    icon: <Briefcase className="h-5 w-5" />,
    cardBg: "bg-white",
    cardBorder: "border-[#E6E6F0]",
    cardHoverBg: "hover:bg-[#F6F6FB]",
    cardHoverBorder: "hover:border-[#D4D4E4]",
    cardArrowColor: "text-[#15803D]",
  },
  {
    id: "marketing",
    slug: "marketing",
    name: "Marketing",
    count: 295,
    iconBg: "bg-[#FFF4ED]",
    iconColor: "text-[#EA580C]",
    icon: <Megaphone className="h-5 w-5" />,
    cardBg: "bg-white",
    cardBorder: "border-[#E6E6F0]",
    cardHoverBg: "hover:bg-[#F6F6FB]",
    cardHoverBorder: "hover:border-[#D4D4E4]",
    cardArrowColor: "text-[#EA580C]",
  },
  {
    id: "productivity",
    slug: "productivity",
    name: "Productivity",
    count: 312,
    iconBg: "bg-[#FEFCE8]",
    iconColor: "text-[#7A4E00]",
    icon: <Zap className="h-5 w-5" />,
    cardBg: "bg-white",
    cardBorder: "border-[#E6E6F0]",
    cardHoverBg: "hover:bg-[#F6F6FB]",
    cardHoverBorder: "hover:border-[#D4D4E4]",
    cardArrowColor: "text-[#7A4E00]",
  },
  {
    id: "developer-tools",
    slug: "developer-tools",
    name: "Developer Tools",
    count: 390,
    iconBg: "bg-[#F0FDF4]",
    iconColor: "text-[#0F8A5F]",
    icon: <Code2 className="h-5 w-5" />,
    cardBg: "bg-white",
    cardBorder: "border-[#E6E6F0]",
    cardHoverBg: "hover:bg-[#F6F6FB]",
    cardHoverBorder: "hover:border-[#D4D4E4]",
    cardArrowColor: "text-[#0F8A5F]",
  },
  {
    id: "design",
    slug: "design",
    name: "Design",
    count: 246,
    iconBg: "bg-[#FDF2F8]",
    iconColor: "text-[#DB2777]",
    icon: <Palette className="h-5 w-5" />,
    cardBg: "bg-white",
    cardBorder: "border-[#E6E6F0]",
    cardHoverBg: "hover:bg-[#F6F6FB]",
    cardHoverBorder: "hover:border-[#D4D4E4]",
    cardArrowColor: "text-[#DB2777]",
  },
  {
    id: "fintech",
    slug: "fintech",
    name: "Fintech",
    count: 198,
    iconBg: "bg-[#ECFEFF]",
    iconColor: "text-[#0D9488]",
    icon: <Coins className="h-5 w-5" />,
    cardBg: "bg-white",
    cardBorder: "border-[#E6E6F0]",
    cardHoverBg: "hover:bg-[#F6F6FB]",
    cardHoverBorder: "hover:border-[#D4D4E4]",
    cardArrowColor: "text-[#0D9488]",
  },
  {
    id: "health-fitness",
    slug: "health-fitness",
    name: "Health & Fitness",
    count: 174,
    iconBg: "bg-[#FFF1F2]",
    iconColor: "text-[#E11D48]",
    icon: <HeartPulse className="h-5 w-5" />,
    cardBg: "bg-white",
    cardBorder: "border-[#E6E6F0]",
    cardHoverBg: "hover:bg-[#F6F6FB]",
    cardHoverBorder: "hover:border-[#D4D4E4]",
    cardArrowColor: "text-[#E11D48]",
  },
];

export interface BrowseByCategorySectionProps {
  onCategorySelect?: (categoryId: string) => void;
}

export const BrowseByCategorySection: React.FC<BrowseByCategorySectionProps> = ({
  onCategorySelect,
}) => {
  return (
    <section className="relative w-full max-w-[1240px] mx-auto px-6 py-10 md:py-14 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#4F46E5] block mb-1">
            DISCOVER DIRECTORY
          </span>
          <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] text-[#14142B] tracking-tight leading-tight">
            Browse by category
          </h2>
          <p className="mt-1 text-sm sm:text-base text-[#55556E]">
            Explore 2,600+ curated SaaS products, developer tools and AI agents.
          </p>
        </div>

        <Link
          href="/categories"
          className="text-xs sm:text-sm font-bold text-[#4F46E5] hover:text-[#4338CA] hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View all 35 categories</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* 4x2 Grid of Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {CATEGORIES_DATA.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            onClick={(e) => {
              if (onCategorySelect) {
                e.preventDefault();
                onCategorySelect(cat.slug);
              }
            }}
            className="rounded-2xl border border-[#E6E6F0] bg-white p-5 hover:border-[#4F46E5] hover:shadow-[0_8px_30px_rgba(79,70,229,0.08)] transition-all cursor-pointer group block"
          >
            {/* Squircle Pastel Icon */}
            <div
              className={`w-11 h-11 rounded-xl ${cat.iconBg} ${cat.iconColor} mb-4 flex items-center justify-center group-hover:scale-105 transition-transform`}
            >
              {cat.icon}
            </div>

            {/* Title & Count */}
            <h3 className="font-bold text-sm sm:text-base text-[#14142B] tracking-tight group-hover:text-[#4F46E5] transition-colors">
              {cat.name}
            </h3>
            <p className="text-xs text-[#55556E] mt-1 font-medium">
              {typeof cat.count === "number" ? `${cat.count} tools` : cat.count}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};
