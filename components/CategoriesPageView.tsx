"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  ArrowRight,
  Filter,
  Sparkles,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProductCard } from "./ProductCard";
import { Input } from "./Input";
import { Badge } from "./Badge";
import { ALL_35_CATEGORIES } from "@/lib/categories";
import { MOCK_PRODUCTS, LaunchProduct } from "@/lib/mock-data";

export const CategoriesPageView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<LaunchProduct[]>(MOCK_PRODUCTS);

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

  // Filter categories by search query
  const displayedCategories = useMemo(() => {
    if (!searchQuery.trim()) return ALL_35_CATEGORIES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_35_CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.includes(q)
    );
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-6 py-10 sm:py-16 space-y-12 flex-1">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="accent" size="sm" icon={<Layers className="h-3 w-3" />}>
            ECOSYSTEM TAXONOMY &bull; 35 MASTER CATEGORIES
          </Badge>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#14142B] tracking-[-0.03em]">
            Browse by Category
          </h1>
          <p className="text-base text-[#55556E] leading-relaxed">
            Explore 2,600+ vetted SaaS products, developer tools, and autonomous AI agents across 35 curated industry verticals.
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-md mx-auto">
            <Input
              placeholder="Search all 35 categories or tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              showClear
              onClear={() => setSearchQuery("")}
            />
          </div>
        </div>

        {/* Total Categories Badge & Action */}
        <div className="flex items-center justify-between border-b border-[#E6E6F0] pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#14142B]">
              All 35 Master Categories
            </span>
            <span className="rounded-full bg-[#F1F1F8] border border-[#E6E6F0] px-2.5 py-0.5 text-xs font-mono font-bold text-[#4F46E5]">
              {displayedCategories.length} / 35
            </span>
          </div>

          <span className="text-xs text-[#55556E] font-medium hidden sm:inline">
            Click any category to view its curated software and tools
          </span>
        </div>

        {/* 35 CATEGORIES GRID (Responsive: 1 col mobile, 2 col tablet, 4 col desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#E6E6F0] bg-white p-5 hover:border-[#4F46E5] hover:shadow-[0_8px_30px_rgba(79,70,229,0.08)] transition-all cursor-pointer block"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  {/* Icon Squircle */}
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${cat.iconBg} ${cat.iconColor} group-hover:scale-105 transition-transform`}
                  >
                    {cat.icon}
                  </div>

                  <span className="text-xs font-mono font-semibold text-[#55556E] bg-[#F6F6FB] px-2 py-0.5 rounded-md border border-[#E6E6F0]">
                    {cat.count} tools
                  </span>
                </div>

                <h3 className="font-heading font-bold text-sm sm:text-base text-[#14142B] tracking-tight group-hover:text-[#4F46E5] transition-colors">
                  {cat.name}
                </h3>

                <p className="text-xs text-[#55556E] mt-1.5 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#F1F1F8] flex items-center justify-between text-xs">
                <span className="text-xs font-semibold text-[#4F46E5] group-hover:underline">
                  Explore {cat.name}
                </span>
                <div className="flex items-center text-[#4F46E5] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* FEATURED COMMUNITY LAUNCHES */}
        <div className="space-y-5 pt-6 border-t border-[#E6E6F0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14142B] tracking-tight">
                Trending Software Across All Categories
              </h2>
              <span className="text-xs font-mono text-[#55556E]">
                Showing {filteredProducts.length} verified products
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                variant="row"
                product={{
                  id: product.id,
                  name: product.name,
                  tagline: product.tagline,
                  category: product.category,
                  upvotes: product.upvotes,
                  isUpvoted: product.isUpvoted,
                  rank: product.rank,
                  commentsCount: product.commentsCount,
                  url: `/product/${product.id}`,
                  initials: product.name.split(" ").map((n) => n[0]).join(""),
                  avatarGradient: "from-[#4F46E5] to-[#7E7EF6]",
                  badgeEarned: product.rank === 1 ? "#1 Product of the Day" : undefined,
                  maker: {
                    name: product.founder.name,
                    avatarInitials: product.founder.name.split(" ").map((n) => n[0]).join(""),
                    avatarColor: "bg-[#4F46E5]",
                    role: product.founder.role,
                  },
                }}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
