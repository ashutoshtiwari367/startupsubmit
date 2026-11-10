import type { MetadataRoute } from "next";
import type { SeoConfig } from "@/lib/seo/types";

const STATIC_LASTMOD = new Date("2026-10-27");

export function toSafeDate(
  val: Date | string | number | null | undefined,
  fallback: Date = STATIC_LASTMOD
): Date {
  if (!val) return fallback;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? fallback : val;
  }
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? fallback : parsed;
}

/**
 * Returns chunk IDs for Next.js generateSitemaps().
 * id 0 = core static pages + categories (MAIN).
 * id 1..N = listings chunks (chunkSize items per chunk, chunk index = id - 1).
 */
export async function sitemapChunkIds(
  config: SeoConfig
): Promise<{ id: number }[]> {
  const ids = [{ id: 0 }];

  // 1. Listings chunks (e.g. 1000 items per chunk)
  if (config.listings) {
    let total = 0;
    try {
      total = (await config.listings.getEntries()).length;
    } catch {
      total = 0;
    }
    const chunks = Math.max(
      1,
      Math.ceil(total / Math.max(1, config.listings.chunkSize))
    );
    for (let i = 1; i <= chunks; i++) {
      ids.push({ id: i });
    }
    return ids;
  }

  // 2. Blog chunks fallback
  if (config.blog) {
    let total = 0;
    try {
      total = (await config.blog.getEntries()).length;
    } catch {
      total = 0;
    }
    const chunks = Math.ceil(total / Math.max(1, config.blog.chunkSize));
    for (let i = 1; i <= chunks; i++) {
      ids.push({ id: i });
    }
    return ids;
  }

  return ids;
}

export async function buildSitemapChunk(
  config: SeoConfig,
  id: number = 0
): Promise<MetadataRoute.Sitemap> {
  const baseUrl = config.siteUrl.replace(/\/+$/, "");

  // id 0 = Static routes + Category directory routes
  if (id === 0) {
    const staticItems: MetadataRoute.Sitemap = config.staticRoutes.map((r) => ({
      url: `${baseUrl}${r.path.startsWith("/") ? r.path : `/${r.path}`}`,
      lastModified: toSafeDate(r.lastModified, STATIC_LASTMOD),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    }));

    if (config.categories) {
      try {
        const catEntries = await config.categories.getEntries();
        const catItems: MetadataRoute.Sitemap = (catEntries || [])
          .filter((cat) => Boolean(cat && cat.slug))
          .map((cat) => ({
            url: `${baseUrl}${config.categories!.basePath}/${encodeURIComponent(cat.slug)}`,
            lastModified: toSafeDate(cat.lastModified, STATIC_LASTMOD),
            changeFrequency: cat.changeFrequency ?? ("weekly" as const),
            priority: cat.priority ?? 0.7,
          }));
        return [...staticItems, ...catItems];
      } catch {
        return staticItems;
      }
    }

    return staticItems;
  }

  // id >= 1: Listings chunks (1000 items per chunk)
  if (config.listings) {
    let entries;
    try {
      entries = await config.listings.getEntries();
    } catch {
      return [];
    }
    const start = (id - 1) * config.listings.chunkSize;
    return (entries || [])
      .slice(start, start + config.listings.chunkSize)
      .filter((e) => Boolean(e && e.slug))
      .map((e) => ({
        url: `${baseUrl}${config.listings!.basePath}/${encodeURIComponent(e.slug)}`,
        lastModified: toSafeDate(e.lastModified, STATIC_LASTMOD),
        changeFrequency: e.changeFrequency ?? ("weekly" as const),
        priority: e.priority ?? 0.9,
      }));
  }

  // id >= 1: Blog fallback
  if (config.blog) {
    let entries;
    try {
      entries = await config.blog.getEntries();
    } catch {
      return [];
    }
    const start = (id - 1) * config.blog.chunkSize;
    return (entries || [])
      .slice(start, start + config.blog.chunkSize)
      .filter((e) => Boolean(e && e.slug))
      .map((e) => ({
        url: `${baseUrl}${config.blog!.basePath}/${encodeURIComponent(e.slug)}`,
        lastModified: toSafeDate(e.lastModified, STATIC_LASTMOD),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  }

  return [];
}

/**
 * Builds full aggregated sitemap across all static routes, categories, and listings.
 * Fail-safe: Always returns at least staticItems even if database queries fail.
 */
export async function buildFullSitemap(
  config: SeoConfig
): Promise<MetadataRoute.Sitemap> {
  const baseUrl = config.siteUrl.replace(/\/+$/, "");
  const staticItems: MetadataRoute.Sitemap = config.staticRoutes.map((r) => ({
    url: `${baseUrl}${r.path.startsWith("/") ? r.path : `/${r.path}`}`,
    lastModified: toSafeDate(r.lastModified, STATIC_LASTMOD),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  try {
    let catItems: MetadataRoute.Sitemap = [];
    if (config.categories) {
      const catEntries = await config.categories.getEntries();
      catItems = (catEntries || [])
        .filter((cat) => Boolean(cat && cat.slug))
        .map((cat) => ({
          url: `${baseUrl}${config.categories!.basePath}/${encodeURIComponent(cat.slug)}`,
          lastModified: toSafeDate(cat.lastModified, STATIC_LASTMOD),
          changeFrequency: cat.changeFrequency ?? ("weekly" as const),
          priority: cat.priority ?? 0.7,
        }));
    }

    let listingItems: MetadataRoute.Sitemap = [];
    if (config.listings) {
      const listingEntries = await config.listings.getEntries();
      listingItems = (listingEntries || [])
        .filter((item) => Boolean(item && item.slug))
        .map((item) => ({
          url: `${baseUrl}${config.listings!.basePath}/${encodeURIComponent(item.slug)}`,
          lastModified: toSafeDate(item.lastModified, STATIC_LASTMOD),
          changeFrequency: item.changeFrequency ?? ("weekly" as const),
          priority: item.priority ?? 0.9,
        }));
    }

    return [...staticItems, ...catItems, ...listingItems];
  } catch (err) {
    console.error("buildFullSitemap error:", err);
    return staticItems;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Formats a MetadataRoute.Sitemap array into standard XML sitemap string.
 */
export function sitemapToXml(entries: MetadataRoute.Sitemap): string {
  const xmlUrls = entries
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeXml(entry.url)}</loc>${
          entry.lastModified
            ? `\n    <lastmod>${toSafeDate(entry.lastModified, STATIC_LASTMOD).toISOString()}</lastmod>`
            : ""
        }${
          entry.changeFrequency
            ? `\n    <changefreq>${entry.changeFrequency}</changefreq>`
            : ""
        }${
          entry.priority !== undefined
            ? `\n    <priority>${entry.priority.toFixed(1)}</priority>`
            : ""
        }\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls}\n</urlset>`;
}

/**
 * Formats a list of sitemap URLs into a standard XML <sitemapindex> string.
 */
export function sitemapIndexToXml(
  sitemaps: { loc: string; lastmod?: Date | string }[]
): string {
  const xmlSitemaps = sitemaps
    .map(
      (s) =>
        `  <sitemap>\n    <loc>${escapeXml(s.loc)}</loc>${
          s.lastmod
            ? `\n    <lastmod>${toSafeDate(s.lastmod, STATIC_LASTMOD).toISOString()}</lastmod>`
            : ""
        }\n  </sitemap>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlSitemaps}\n</sitemapindex>`;
}

