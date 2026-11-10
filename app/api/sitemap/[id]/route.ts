import { NextResponse } from "next/server";
import { getSeoConfig } from "@/lib/seo/config";
import { buildSitemapChunk, sitemapToXml } from "@/lib/seo/sitemap";

export const dynamic = "force-dynamic";

/**
 * Route handler for /sitemap/:id.xml (via next.config.ts rewrite).
 * - /sitemap/0.xml -> chunk 0 (Static Pages + Categories)
 * - /sitemap/1.xml -> chunk 1 (Approved Products 1-1000)
 * - /sitemap/2.xml -> chunk 2 (Approved Products 1001-2000)
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const params = await Promise.resolve(context.params);
  const rawId = (params?.id || "").replace(/\.xml$/i, "").trim();
  const chunkId = parseInt(rawId, 10);

  if (isNaN(chunkId) || chunkId < 0) {
    return new NextResponse("Invalid sitemap chunk id", { status: 404 });
  }

  const config = await getSeoConfig();
  const chunkEntries = await buildSitemapChunk(config, chunkId);

  const xml = sitemapToXml(chunkEntries);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

