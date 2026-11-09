"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  ArrowRight,
  Sparkles,
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
  ExternalLink,
  Filter,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FinalCTA } from "./FinalCTA";
import { ProductCard } from "./ProductCard";
import { Input } from "./Input";
import { Pill } from "./Pill";
import { Badge } from "./Badge";
import { CATEGORIES_DATA } from "./BrowseByCategorySection";
import { MOCK_PRODUCTS, LaunchProduct } from "@/lib/mock-data";

export const CategoriesPageView: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<LaunchProduct[]>(MOCK_PRODUCTS);

  const categoryMapping: Record<string, string> = {
    "ai-ml": "AI & Agents",
    "developer-tools": "Developer Tools",
    "saas-tools": "Developer Tools",
    "productivity": "Productivity",
    "design-art": "Design & UX",
    "finance-fintech": "Analytics & Data",
    "marketing-sales": "Productivity",
    "health-wellness": "AI & Agents",
    "video-content": "Design & UX",
    "e-commerce": "Analytics & Data",
  };

  const handleUpvote = (productId: string, isUpvoted: boolean) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            upvotes: isUpvoted ? item.upvotes + 1 : item.upvotes - 1,
            isUpvoted,
          };
        }
        return item;
      })
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      let matchesCat = true;
      if (selectedCategoryId !== "all") {
        const expectedName = categoryMapping[selectedCategoryId];
        matchesCat = p.category === expectedName;
      }

      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F0F10] selection:bg-[#5B5BF0]/15 selection:text-[#5B5BF0]">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="accent" size="sm" icon={<Layers className="h-3 w-3" />}>
            ECOSYSTEM TAXONOMY
          </Badge>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#0F0F10] tracking-[-0.03em]">
            Browse by Category
          </h1>
          <p className="text-sm sm:text-base text-[#66666B]">
            Explore 2,600+ vetted SaaS products, AI developer tools, and workflow automations indexed by community authority.
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-md mx-auto">
            <Input
              placeholder="Search category or tool name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              showClear
              onClear={() => setSearchQuery("")}
            />
          </div>
        </div>

        {/* 10 CATEGORIES GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES_DATA.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  setSelectedCategoryId(isSelected ? "all" : cat.id)
                }
                className={`group relative flex flex-col justify-between rounded-[14px] border p-4 sm:p-4.5 transition-all duration-200 cursor-pointer select-none ${
                  isSelected
                    ? "border-[#5B5BF0] bg-[#EEF0FE]/70 shadow-[0_4px_16px_rgba(91,91,240,0.15)] ring-2 ring-[#5B5BF0]/30"
                    : `${cat.cardBorder} ${cat.cardBg} hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${cat.cardHoverBg} ${cat.cardHoverBorder}`
                }`}
              >
                <div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-[10px] ${cat.iconBg} ${cat.iconColor} shadow-xs group-hover:scale-105 transition-transform mb-3`}
                  >
                    {cat.icon}
                  </div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-[#0F0F10] tracking-tight group-hover:text-[#5B5BF0] transition-colors">
                    {cat.name}
                  </h3>
                </div>

                <div className="pt-2 mt-2 border-t border-black/[0.06] flex items-center justify-between text-xs">
                  <span className="font-mono text-[#8E8E93] text-[11px] sm:text-xs font-medium">
                    {cat.count} tools
                  </span>
                  <div
                    className={`flex items-center ${cat.cardArrowColor} opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FILTERED PRODUCTS LIST */}
        <div className="space-y-5 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E8E3] pb-4">
            <div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F0F10] tracking-tight">
                {selectedCategoryId === "all"
                  ? "All Category Launches"
                  : CATEGORIES_DATA.find((c) => c.id === selectedCategoryId)?.name}
              </h2>
              <span className="text-xs font-mono text-[#8E8E93]">
                Showing {filteredProducts.length} verified products
              </span>
            </div>

            {selectedCategoryId !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCategoryId("all")}
                className="text-xs font-bold text-[#5B5BF0] hover:underline cursor-pointer"
              >
                Reset filter (Show all)
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-12 text-center text-[#66666B] space-y-3">
              <p className="text-base font-semibold">No products found for this search.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryId("all");
                  setSearchQuery("");
                }}
                className="text-xs text-[#5B5BF0] font-bold hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  variant="row"
                  product={{
                    id: p.id,
                    name: p.name,
                    tagline: p.tagline,
                    category: p.category,
                    upvotes: p.upvotes,
                    isUpvoted: p.isUpvoted,
                    rank: p.rank,
                    commentsCount: p.commentsCount,
                    url: `/product/${p.id}`,
                    initials: p.name.slice(0, 2).toUpperCase(),
                    avatarGradient: "from-[#5B5BF0] to-[#7E7EF6]",
                    badgeEarned: p.rank === 1 ? "#1 Product of the Day" : undefined,
                    maker: {
                      name: p.founder.name,
                      avatarInitials: p.founder.name.split(" ").map((n) => n[0]).join(""),
                      avatarColor: "bg-[#5B5BF0]",
                      role: p.founder.role,
                    },
                  }}
                  onUpvoteToggle={(id, isVoted) => handleUpvote(id, isVoted)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <FinalCTA />
      <Footer />
    </div>
  );
};
