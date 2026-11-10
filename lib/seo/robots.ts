import type { MetadataRoute } from "next";
import type { SeoConfig } from "@/lib/seo/types";

export function buildRobots(config: SeoConfig): MetadataRoute.Robots {
  const baseUrl = config.siteUrl.replace(/\/+$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: config.robots.allow ?? "/",
      disallow: config.robots.disallow,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

