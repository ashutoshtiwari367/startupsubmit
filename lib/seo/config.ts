import { db } from "@/lib/db";
import { serverSecrets } from "@/lib/env/serverSecrets";
import { SITE_CONFIG, getAllPlans } from "@/config/site";
import type { SeoConfig, DynamicEntry } from "@/lib/seo/types";

export const dynamic = "force-dynamic";

/**
 * Returns the centralized, authoritative LaunchOS SEO configuration.
 * Consumed by app/robots.ts, app/sitemap.ts, and app/llms.txt/route.ts.
 */
export async function getSeoConfig(): Promise<SeoConfig> {
  const siteUrl = (serverSecrets.siteUrl || "https://launchos.com").replace(
    /\/+$/,
    ""
  );

  return {
    siteUrl,
    staticRoutes: [
      {
        path: "/",
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        path: "/categories",
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        path: "/winners",
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        path: "/pricing",
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        path: "/submit",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        path: "/login",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        path: "/signup",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ],
    categories: {
      basePath: "/categories",
      getEntries: async (): Promise<DynamicEntry[]> => {
        try {
          const { data } = await db
            .from("categories")
            .select("slug, created_at");

          return (data || []).map((cat) => ({
            slug: cat.slug,
            lastModified: cat.created_at,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }));
        } catch {
          return [];
        }
      },
    },
    listings: {
      basePath: "/product",
      chunkSize: 1000,
      getEntries: async (): Promise<DynamicEntry[]> => {
        try {
          // Strictly fetch approved listings only; pending/rejected are NEVER indexed
          const { data } = await db
            .from("listings")
            .select("slug, updated_at, approved_at, status")
            .eq("status", "approved")
            .order("approved_at", { ascending: false });

          return (data || [])
            .filter((row) => row.status === "approved")
            .map((row) => ({
              slug: row.slug,
              lastModified: row.updated_at || row.approved_at,
              changeFrequency: "weekly" as const,
              priority: 0.9,
            }));
        } catch {
          return [];
        }
      },
    },
    robots: {
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/dashboard",
        "/dashboard/",
        "/api/admin/",
        "/auth/callback",
      ],
    },
    llms: {
      title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
      summary:
        "LaunchOS is a curated directory and launchpad for indie makers, AI developers, and SaaS founders to showcase products, gain early traction, and earn verified backlinks.",
      sections: [
        {
          heading: "Core Pages",
          items: [
            {
              title: "Home Directory & Live Leaderboard",
              path: "/",
              note: "Top voted AI and SaaS tools launched today.",
            },
            {
              title: "Daily Launch Winners",
              path: "/winners",
              note: "Historical archive of top-ranked daily launch winners.",
            },
            {
              title: "Browse by Category",
              path: "/categories",
              note: "Explore software filtered by use cases and niches.",
            },
            {
              title: "Pricing & Sponsorship",
              path: "/pricing",
              note: "Flexible tiers from free submissions to premium spotlight placements.",
            },
            {
              title: "Submit a Tool",
              path: "/submit",
              note: "Submit your software or AI tool for editorial moderation.",
            },
            {
              title: "Maker Sign In",
              path: "/login",
              note: "Sign in to manage submitted products and maker profile.",
            },
            {
              title: "Create Maker Account",
              path: "/signup",
              note: "Join LaunchOS community to upvote, review, and launch products.",
            },
          ],
        },
        {
          heading: "LaunchOS Pricing Plans",
          items: getAllPlans().map((plan) => ({
            title: `${plan.name} (${plan.formattedPrice})`,
            path: "/pricing",
            note: `${plan.description} Review SLA: ${plan.reviewSla}.`,
          })),
        },
      ],
    },
  };
}

