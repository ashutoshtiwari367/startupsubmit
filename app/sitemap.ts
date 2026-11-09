import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { serverSecrets } from "@/lib/env/serverSecrets";

export const dynamic = "force-dynamic";

/**
 * Generates /sitemap.xml for search engines.
 * Strictly includes ONLY listings where status = 'approved'.
 * Pending and rejected listings are never included in the index.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (serverSecrets.siteUrl || "https://launchos.com").replace(
    /\/+$/,
    ""
  );

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/winners`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    // 1. Fetch approved listings ONLY
    const { data: approvedListings } = await db
      .from("listings")
      .select("slug, updated_at, approved_at, status")
      .eq("status", "approved")
      .order("approved_at", { ascending: false });

    const listingEntries: MetadataRoute.Sitemap = (approvedListings || [])
      .filter((row) => row.status === "approved")
      .map((row) => ({
        url: `${baseUrl}/product/${encodeURIComponent(row.slug)}`,
        lastModified: new Date(row.updated_at || row.approved_at || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }));

    // 2. Fetch categories
    const { data: categories } = await db
      .from("categories")
      .select("slug, created_at");

    const categoryEntries: MetadataRoute.Sitemap = (categories || []).map(
      (cat) => ({
        url: `${baseUrl}/categories/${encodeURIComponent(cat.slug)}`,
        lastModified: new Date(cat.created_at || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })
    );

    return [...staticEntries, ...categoryEntries, ...listingEntries];
  } catch {
    return staticEntries;
  }
}

