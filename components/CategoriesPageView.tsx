"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  ArrowRight,
  X,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProductCard } from "./ProductCard";
import { Badge } from "./Badge";
import { MASTER_CATEGORIES, MasterCategoryItem } from "@/lib/categories";

export interface CategoryCardState {
  id: string | number;
  slug: string;
  name: string;
  description: string;
  count: number;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

export const CategoriesPageView: React.FC = () => {
  const [categories, setCategories] = useState<CategoryCardState[]>(() =>
    MASTER_CATEGORIES.map((c: MasterCategoryItem) => ({
      ...c,
      count: 0, // Real verified product count
    }))
  );
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Load real categories & real listings from API on mount
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch("/api/categories").then((res) => res.json()).catch(() => ({ ok: false })),
      fetch("/api/listings?limit=100").then((res) => res.json()).catch(() => ({ ok: false })),
    ])
      .then(([catRes, listRes]) => {
        const fetchedListings = listRes?.ok && Array.isArray(listRes.listings) ? listRes.listings : [];
        setProducts(fetchedListings);

        // Calculate REAL product counts per category (strictly from approved listings)
        const countsMap: Record<string, number> = {};
        fetchedListings.forEach((item: any) => {
          const catSlug = (item.categorySlug || item.category || "").toLowerCase().trim();
          if (catSlug) {
            countsMap[catSlug] = (countsMap[catSlug] || 0) + 1;
          }
        });

        if (catRes?.ok && Array.isArray(catRes.categories) && catRes.categories.length > 0) {
          // Merge API categories with master icon styles
          const merged: CategoryCardState[] = catRes.categories.map((apiCat: any) => {
            const master = MASTER_CATEGORIES.find(
              (m: MasterCategoryItem) => m.slug === apiCat.slug || m.name.toLowerCase() === apiCat.name.toLowerCase()
            );
            const realCount =
              typeof apiCat.tool_count === "number"
                ? apiCat.tool_count
                : countsMap[apiCat.slug] || 0;

            return {
              id: apiCat.id,
              slug: apiCat.slug,
              name: apiCat.name,
              description: apiCat.description || master?.description || "",
              count: realCount,
              iconBg: master?.iconBg || "bg-[#F7F6FF]",
              iconColor: master?.iconColor || "text-[#4F46E5]",
              icon: master?.icon || <Layers className="h-5 w-5" />,
            };
          });

          setCategories(merged);
        } else {
          // Fallback to master taxonomy with real computed counts
          setCategories(
            MASTER_CATEGORIES.map((m: MasterCategoryItem) => ({
              ...m,
              count: countsMap[m.slug] || 0,
            }))
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Filter categories by search keyword
  const displayedCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.includes(q)
    );
  }, [categories, searchQuery]);

  // Filter real products by search keyword
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.tagline?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-5 pb-14 space-y-6 flex-1 w-full">
        {/* ======================================================== */}
        {/* TWO-COLUMN HEADER: HEADING CONTENT (LEFT) & SEARCH (RIGHT) */}
        {/* ======================================================== */}
        <section className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Side: Heading Content */}
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm" icon={<Layers className="h-3 w-3" />}>
                CATEGORIES DIRECTORY
              </Badge>
              <span className="text-[11px] font-mono font-semibold text-[#8A8AA3]">
                {displayedCategories.length} Categories
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#14142B] tracking-tight">
              Browse by Category
            </h1>
            <p className="text-xs sm:text-sm text-[#55556E] leading-relaxed">
              Explore curated software, developer tools, and AI platforms across verified categories.
            </p>
          </div>

          {/* Right Side: Only Search Bar */}
          <div className="w-full md:w-80 lg:w-96 shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8AA3]" />
              <input
                type="text"
                placeholder="Search categories or tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#D4D4E4] bg-[#FDFDFF] pl-9.5 pr-8 text-xs sm:text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:border-[#4F46E5] focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/10 focus:outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8A8AA3] hover:text-[#14142B] transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* COMPACT CATEGORIES GRID SECTION                          */}
        {/* ======================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#E6E6F0] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base sm:text-lg text-[#14142B]">
                All Categories
              </span>
              <span className="rounded-full bg-[#F1F1F8] border border-[#E6E6F0] px-2.5 py-0.5 text-xs font-mono font-bold text-[#4F46E5]">
                {displayedCategories.length} Categories
              </span>
            </div>

            <span className="text-xs text-[#55556E] hidden sm:inline">
              Click any category to explore software &amp; curated tools
            </span>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#E6E6F0] bg-white p-4 space-y-3 animate-pulse"
                >
                  <div className="h-10 w-10 bg-[#F1F1F8] rounded-xl" />
                  <div className="h-4 bg-[#F1F1F8] rounded-md w-3/4" />
                  <div className="h-3 bg-[#F1F1F8] rounded-md w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Categories Grid (Real verified tool counts) */}
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {displayedCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#E6E6F0] bg-white p-4.5 hover:border-[#4F46E5] hover:shadow-[0_8px_24px_rgba(79,70,229,0.06)] transition-all cursor-pointer block"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${cat.iconBg} ${cat.iconColor} flex items-center justify-center font-bold text-base shadow-2xs group-hover:scale-105 transition-transform`}
                      >
                        {cat.icon}
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-[#8E8E93] bg-[#F6F6FB] px-2 py-0.5 rounded-full group-hover:bg-[#F0EEFF] group-hover:text-[#4F46E5] transition-colors">
                        {cat.count === 1 ? "1 product" : `${cat.count} products`}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-sm sm:text-base text-[#14142B] group-hover:text-[#4F46E5] transition-colors line-clamp-1 mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#55556E] line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F1F1F8] flex items-center justify-between text-xs text-[#4F46E5] font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                    <span>Explore tools</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && displayedCategories.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#E6E6F0] bg-white p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-[#14142B]">
                No categories matching &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs text-[#55556E]">
                Try searching for a different keyword or check verified software below.
              </p>
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* DYNAMIC PRODUCTS LIST (Search Results or Verified Tools)   */}
        {/* ======================================================== */}
        <section className="space-y-3 pt-3 border-t border-[#E6E6F0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#14142B]">
                {searchQuery.trim()
                  ? `Software matching "${searchQuery}"`
                  : "Verified Community Software"}
              </h2>
              <span className="text-xs font-mono text-[#55556E]">
                Showing {filteredProducts.length} verified products
              </span>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-[#4F46E5] hover:underline self-start sm:self-auto cursor-pointer"
              >
                Clear search query &rarr;
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E6E6F0] bg-white p-8 sm:p-10 text-center space-y-2.5">
              <h3 className="font-heading font-bold text-sm text-[#14142B]">
                No software found matching &quot;{searchQuery}&quot;
              </h3>
              <p className="text-xs text-[#55556E] max-w-sm mx-auto">
                Try searching with another keyword or browse our full categories directory above.
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-block mt-1 px-4 py-1.5 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#4338CA] transition-colors cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  variant="row"
                  product={{
                    id: String(product.id),
                    name: product.name,
                    tagline: product.tagline,
                    category: product.category,
                    upvotes: product.upvotes || 0,
                    isUpvoted: product.isUpvoted || false,
                    rank: product.rank,
                    commentsCount: product.commentsCount || 0,
                    url: `/product/${product.slug || product.id}`,
                    initials: (product.name || "TL").slice(0, 2).toUpperCase(),
                    avatarGradient: "from-[#4F46E5] to-[#7E7EF6]",
                    badgeEarned: product.rank === 1 ? "#1 Product of the Day" : undefined,
                    maker: {
                      name: product.author || "Maker",
                      avatarInitials: (product.author || "MK").slice(0, 2).toUpperCase(),
                      avatarColor: "bg-[#4F46E5]",
                    },
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};
