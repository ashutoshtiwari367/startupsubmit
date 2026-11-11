import "server-only";
import { cache } from "react";
import { publicDb } from "@/lib/db";
import type { PricingModel, ListingStatus } from "@/types/db";

export interface ApprovedListingCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}

export interface ApprovedListingScreenshot {
  id: number;
  url: string;
  position: number;
}

export interface ApprovedListing {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description_short: string;
  description_long: string;
  website_url: string;
  logo_url: string;
  category_id: number;
  custom_category?: string | null;
  pricing_model: PricingModel;
  starting_price?: number | null;
  currency?: string;
  billing_period?: string | null;
  listing_plan?: string;
  listing_plan_price?: number;
  status: ListingStatus;
  submitted_by_email: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  categories: ApprovedListingCategory | null;
  listing_screenshots: ApprovedListingScreenshot[];
}

/**
 * Server-side data fetcher for public SEO tool listing pages.
 * - Queries Supabase directly using the public non-service-role client (publicDb from lib/db.ts)
 *   to adhere to strict Row-Level Security (RLS).
 * - Strictly enforces .eq("slug", cleanSlug) AND .eq("status", "approved").
 * - Wrapped with React cache() to deduplicate requests between generateMetadata()
 *   and page rendering within the same server request lifecycle.
 * - Returns null if the listing does not exist or has 'pending' / 'rejected' status.
 */
export const getApprovedListingBySlug = cache(
  async (slug: string): Promise<ApprovedListing | null> => {
    const cleanSlug = String(slug || "").trim();
    if (!cleanSlug) return null;

    try {
      // Primary query strictly uses publicDb (Anon Key, RLS-enforced)
      const client = publicDb;

      const { data, error } = await client
        .from("listings")
        .select(`
          id,
          slug,
          name,
          tagline,
          description_short,
          description_long,
          website_url,
          logo_url,
          category_id,
          pricing_model,
          status,
          submitted_by_email,
          created_at,
          updated_at,
          approved_at,
          categories (
            id,
            slug,
            name,
            description
          ),
          listing_screenshots (
            id,
            url,
            position
          )
        `)
        .eq("slug", cleanSlug)
        .eq("status", "approved")
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      // Explicit defense-in-depth: Never expose non-approved listings
      if (data.status !== "approved") {
        return null;
      }

      // Normalize category (Supabase can return object or single element array)
      const categoryRaw = Array.isArray(data.categories)
        ? data.categories[0]
        : data.categories;

      const normalizedCategory: ApprovedListingCategory | null = categoryRaw
        ? {
            id: Number(categoryRaw.id),
            slug: String(categoryRaw.slug || ""),
            name: String(categoryRaw.name || ""),
            description: categoryRaw.description ? String(categoryRaw.description) : null,
          }
        : null;

      // Normalize and sort screenshots by position ASC
      const rawScreenshots = Array.isArray(data.listing_screenshots)
        ? data.listing_screenshots
        : [];

      const sortedScreenshots: ApprovedListingScreenshot[] = rawScreenshots
        .map((ss) => ({
          id: Number(ss.id),
          url: String(ss.url || ""),
          position: Number(ss.position ?? 0),
        }))
        .filter((ss) => Boolean(ss.url))
        .sort((a, b) => a.position - b.position);

      return {
        id: Number(data.id),
        slug: String(data.slug),
        name: String(data.name),
        tagline: String(data.tagline),
        description_short: String(data.description_short),
        description_long: String(data.description_long),
        website_url: String(data.website_url || ""),
        logo_url: String(data.logo_url),
        category_id: Number(data.category_id),
        custom_category: null,
        pricing_model: data.pricing_model as PricingModel,
        starting_price:
          (data as any).starting_price !== undefined && (data as any).starting_price !== null
            ? Number((data as any).starting_price)
            : null,
        currency: (data as any).currency ? String((data as any).currency) : "USD",
        billing_period: (data as any).billing_period ? String((data as any).billing_period) : null,
        listing_plan: (data as any).listing_plan ? String((data as any).listing_plan) : "free",
        listing_plan_price:
          (data as any).listing_plan_price !== undefined && (data as any).listing_plan_price !== null
            ? Number((data as any).listing_plan_price)
            : 0,
        status: data.status as ListingStatus,
        submitted_by_email: String(data.submitted_by_email),
        created_at: String(data.created_at),
        updated_at: String(data.updated_at),
        approved_at: data.approved_at ? String(data.approved_at) : null,
        categories: normalizedCategory,
        listing_screenshots: sortedScreenshots,
      };
    } catch (err: unknown) {
      console.error(`[lib/listings] Error fetching listing '${cleanSlug}':`, err);
      return null;
    }
  }
);

/**
 * Server-side data fetcher for similar approved listings in the same category.
 * - Uses publicDb (Anon Key, RLS-enforced).
 * - Strictly enforces .eq("category_id", categoryId).eq("status", "approved").neq("slug", currentSlug).
 * - Limits results to the specified limit (defaults to 4).
 * - Orders by id DESC.
 */
export async function getSimilarApprovedListings(
  categoryId: number,
  currentSlug: string,
  limit = 4
): Promise<ApprovedListing[]> {
  if (!categoryId || !currentSlug) return [];

  try {
    const client = publicDb;
    const { data, error } = await client
      .from("listings")
      .select(`
        id,
        slug,
        name,
        tagline,
        description_short,
        description_long,
        website_url,
        logo_url,
        category_id,
        pricing_model,
        status,
        submitted_by_email,
        created_at,
        updated_at,
        approved_at,
        categories (
          id,
          slug,
          name,
          description
        ),
        listing_screenshots (
          id,
          url,
          position
        )
      `)
      .eq("category_id", categoryId)
      .eq("status", "approved")
      .neq("slug", currentSlug)
      .order("id", { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data
      .filter((item) => item.status === "approved" && item.slug !== currentSlug)
      .map((item) => {
        const categoryRaw = Array.isArray(item.categories)
          ? item.categories[0]
          : item.categories;

        const normalizedCategory: ApprovedListingCategory | null = categoryRaw
          ? {
              id: Number(categoryRaw.id),
              slug: String(categoryRaw.slug || ""),
              name: String(categoryRaw.name || ""),
              description: categoryRaw.description ? String(categoryRaw.description) : null,
            }
          : null;

        const rawScreenshots = Array.isArray(item.listing_screenshots)
          ? item.listing_screenshots
          : [];

        const sortedScreenshots: ApprovedListingScreenshot[] = rawScreenshots
          .map((ss) => ({
            id: Number(ss.id),
            url: String(ss.url || ""),
            position: Number(ss.position ?? 0),
          }))
          .filter((ss) => Boolean(ss.url))
          .sort((a, b) => a.position - b.position);

        return {
          id: Number(item.id),
          slug: String(item.slug),
          name: String(item.name),
          tagline: String(item.tagline),
          description_short: String(item.description_short),
          description_long: String(item.description_long),
          website_url: String(item.website_url || ""),
          logo_url: String(item.logo_url),
          category_id: Number(item.category_id),
          custom_category: null,
          pricing_model: item.pricing_model as PricingModel,
          starting_price:
            (item as any).starting_price !== undefined && (item as any).starting_price !== null
              ? Number((item as any).starting_price)
              : null,
          currency: (item as any).currency ? String((item as any).currency) : "USD",
          billing_period: (item as any).billing_period ? String((item as any).billing_period) : null,
          listing_plan: (item as any).listing_plan ? String((item as any).listing_plan) : "free",
          listing_plan_price:
            (item as any).listing_plan_price !== undefined && (item as any).listing_plan_price !== null
              ? Number((item as any).listing_plan_price)
              : 0,
          status: item.status as ListingStatus,
          submitted_by_email: String(item.submitted_by_email),
          created_at: String(item.created_at),
          updated_at: String(item.updated_at),
          approved_at: item.approved_at ? String(item.approved_at) : null,
          categories: normalizedCategory,
          listing_screenshots: sortedScreenshots,
        };
      });
  } catch (err: unknown) {
    console.error(`[lib/listings] Error fetching similar listings for category ${categoryId}:`, err);
    return [];
  }
}


