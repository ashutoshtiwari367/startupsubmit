import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryDetailView } from "@/components/CategoryDetailView";
import {
  getCategoryBySlug,
  getRelatedCategories,
  CategoryToolItem,
} from "@/lib/categories";
import { publicDb } from "@/lib/db";
import { getSiteUrl } from "@/lib/seo";
import { normalizeDirectoryPlan } from "@/config/site";
import { getListingUpvoteCountsMap } from "@/lib/upvotes";

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

  // 1. Fetch strictly real approved listings from Supabase for this category
  let dbToolItems: CategoryToolItem[] = [];
  try {
    // Look up category in Supabase by slug or name
    const { data: dbCat } = await publicDb
      .from("categories")
      .select("id, slug, name")
      .or(`slug.eq.${category.slug},slug.eq.${cleanSlug},name.ilike.${category.name}`)
      .maybeSingle();

    let query = publicDb
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
        upvotes_count,
        approved_at,
        created_at,
        categories (
          id,
          slug,
          name
        )
      `)
      .eq("status", "approved");

    if (dbCat?.id) {
      query = query.eq("category_id", dbCat.id);
    } else {
      query = query.eq("categories.slug", category.slug);
    }

    const { data: dbListings } = await query
      .order("approved_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (dbListings && dbListings.length > 0) {
      const fetchedIds = dbListings.map((item: any) => Number(item.id)).filter(Boolean);
      const upvoteCountsMap =
        fetchedIds.length > 0
          ? await getListingUpvoteCountsMap(fetchedIds)
          : new Map<number, number>();

      dbToolItems = dbListings.map((item: any) => {
        const listingPlan = normalizeDirectoryPlan(item.listing_plan);
        const dynamicVotes =
          upvoteCountsMap.get(Number(item.id)) || Number(item.upvotes_count || 0);

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
          upvotes: dynamicVotes,
          commentsCount: 0,
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

  // 2. Strictly real approved listings (NO dummy/fake tools injected)
  const allTools = dbToolItems;

  // 3. Fetch dynamically approved featured tools for Sticky Sidebar
  let featuredToolsList: any[] = [];
  try {
    const { data: featuredRows } = await publicDb
      .from("listings")
      .select(`
        id,
        slug,
        name,
        tagline,
        logo_url,
        pricing_model,
        starting_price,
        listing_plan,
        upvotes_count,
        categories (
          id,
          slug,
          name
        )
      `)
      .eq("status", "approved")
      .in("listing_plan", ["featured", "one_time", "premium"])
      .order("approved_at", { ascending: false, nullsFirst: false })
      .limit(6);

    let rows = featuredRows || [];
    if (rows.length === 0) {
      const { data: fallbackRows } = await publicDb
        .from("listings")
        .select(`
          id,
          slug,
          name,
          tagline,
          logo_url,
          pricing_model,
          starting_price,
          listing_plan,
          upvotes_count,
          categories (
            id,
            slug,
            name
          )
        `)
        .eq("status", "approved")
        .order("approved_at", { ascending: false, nullsFirst: false })
        .limit(5);
      rows = fallbackRows || [];
    }

    if (rows.length > 0) {
      const featIds = rows.map((r: any) => Number(r.id)).filter(Boolean);
      const featVotesMap =
        featIds.length > 0
          ? await getListingUpvoteCountsMap(featIds)
          : new Map<number, number>();

      featuredToolsList = rows.map((r: any) => ({
        id: String(r.id),
        slug: r.slug,
        name: r.name,
        tagline: r.tagline,
        logoUrl: r.logo_url,
        initials: (r.name || "TL").slice(0, 2).toUpperCase(),
        pricingModel: r.pricing_model,
        category: (r.categories as any)?.name || category.name,
        upvotes: featVotesMap.get(Number(r.id)) || Number(r.upvotes_count || 0),
        listingPlan: r.listing_plan,
      }));
    }
  } catch (err) {
    console.warn("[CategoryPage] Error querying featured tools for sidebar:", err);
  }

  // 4. Related categories
  const related = getRelatedCategories(category.slug, 5);

  return (
    <CategoryDetailView
      category={category}
      initialTools={allTools}
      relatedCategories={related}
      featuredTools={featuredToolsList}
    />
  );
}

