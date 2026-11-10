import { NextResponse } from "next/server";
import { getSeoConfig } from "@/lib/seo/config";
import { sitemapChunkIds, sitemapIndexToXml } from "@/lib/seo/sitemap";

export const dynamic = "force-dynamic";

/**
 * Route handler for /sitemap.xml (via next.config.ts rewrite).
 * Returns the root <sitemapindex> pointing to chunked sitemaps:
 * - /sitemap/0.xml (Static Pages + Categories)
 * - /sitemap/1.xml (Approved Product Listings 1-1000)
 */
export async function GET() {
  const config = await getSeoConfig();
  const baseUrl = config.siteUrl.replace(/\/+$/, "");
  const chunkIds = await sitemapChunkIds(config);

  const sitemaps = chunkIds.map((chunk) => ({
    loc: `${baseUrl}/sitemap/${chunk.id}.xml`,
    lastmod: new Date(),
  }));

  const xml = sitemapIndexToXml(sitemaps);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

