import type { MetadataRoute } from "next";
import { getSeoConfig, buildRobots } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * Next.js standard Metadata Route for /robots.txt.
 * Controls search crawler indexing permissions and links to /sitemap.xml.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await getSeoConfig();
  return buildRobots(config);
}

