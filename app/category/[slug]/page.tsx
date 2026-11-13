import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryDetailView } from "@/components/CategoryDetailView";
import {
  getCategoryBySlug,
  getCuratedToolsForCategory,
  getRelatedCategories,
  CategoryToolItem,
} from "@/lib/categories";
import { publicDb } from "@/lib/db";
import { getSiteUrl } from "@/lib/seo";
import { normalizeDirectoryPlan } from "@/config/site";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = String(slug || "").toLowerCase().trim();
  const category = getCategoryBySlug(cleanSlug);

  if (!category) {
    return {
      title: "Category Not Found | LaunchOS",
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/category/${category.slug}`;

  return {
    title: `Best ${category.name} Software & Tools (2026) | LaunchOS`,
    description: `Discover top vetted ${category.name} tools, SaaS platforms, and software on LaunchOS. Curated by founders and community reviews.`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `Best ${category.name} Software & Tools | LaunchOS`,
      description: `Explore curated ${category.name} tools and software vetted by founders.`,
      url: pageUrl,
      siteName: "LaunchOS",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Best ${category.name} Software & Tools | LaunchOS`,
      description: `Explore curated ${category.name} tools and software vetted by founders.`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const cleanSlug = String(slug || "").toLowerCase().trim();
  const category = getCategoryBySlug(cleanSlug);

  if (!category) {
    notFound();
  }

  // 1. Fetch any approved real listings from Supabase for this category
  let dbToolItems: CategoryToolItem[] = [];
  try {
    const { data: dbListings } = await publicDb
      .from("listings")
      .select(`
        id,
        slug,
        name,
        tagline,
        description_short,
        website_url,
        logo_url,
        pricing_model,
        starting_price,
        currency,
        billing_period,
        listing_plan,
        approved_at,
        created_at,
        categories!inner (
          id,
          slug,
          name
        )
      `)
      .eq("categories.slug", category.slug)
      .eq("status", "approved")
      .order("approved_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (dbListings && dbListings.length > 0) {
      dbToolItems = dbListings.map((item: any) => {
        const listingPlan = normalizeDirectoryPlan(item.listing_plan);
        return {
          id: `db-${item.id}`,
          name: item.name,
          slug: item.slug,
          tagline: item.tagline,
          description: item.description_short,
          category: category.name,
          pricingModel: (item.pricing_model === "free"
            ? "Free"
            : item.pricing_model === "freemium"
            ? "Freemium"
            : "Paid") as "Free" | "Freemium" | "Paid",
          priceDisplay:
            item.starting_price && item.starting_price > 0
              ? `$${item.starting_price}/${item.billing_period === "yearly" ? "yr" : "mo"}`
              : item.pricing_model === "free"
              ? "100% Free"
              : undefined,
          upvotes: 120,
          commentsCount: 8,
          initials: (item.name || "TL").slice(0, 2).toUpperCase(),
          logoBg: "bg-[#4F46E5] text-white",
          logoUrl: item.logo_url,
          websiteUrl: item.website_url,
          isVerified: listingPlan === "premium" || listingPlan === "featured",
          listingPlan,
          approvedAt: item.approved_at || item.created_at,
        };
      });
    }
  } catch (err) {
    console.warn(`[CategoryPage] Error querying DB listings for ${category.slug}:`, err);
  }

  // 2. Fetch curated tools for this category (e.g. Sales)
  const curatedTools = getCuratedToolsForCategory(category.slug);

  // 3. Merge real approved DB listings first, then curated tools
  const allTools = [...dbToolItems, ...curatedTools];

  // 4. Related categories
  const related = getRelatedCategories(category.slug, 5);

  return (
    <CategoryDetailView
      category={category}
      initialTools={allTools}
      relatedCategories={related}
    />
  );
}

