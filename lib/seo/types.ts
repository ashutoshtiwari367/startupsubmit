import type { MetadataRoute } from "next";

export type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

export interface StaticRoute {
  path: string;
  priority?: number;
  changeFrequency?: ChangeFreq;
  lastModified?: Date | string;
}

export interface DynamicEntry {
  slug: string;
  lastModified?: Date | string | null;
  changeFrequency?: ChangeFreq;
  priority?: number;
}

export interface BlogEntry {
  slug: string;
  lastModified?: string | Date | null;
}

export interface SeoConfig {
  siteUrl: string;
  staticRoutes: StaticRoute[];
  categories?: {
    basePath: string;
    getEntries: () => Promise<DynamicEntry[]>;
  };
  listings?: {
    basePath: string;
    chunkSize: number;
    getEntries: () => Promise<DynamicEntry[]>;
  };
  blog?: {
    basePath: string;
    chunkSize: number;
    getEntries: () => Promise<BlogEntry[]>;
  };
  robots: {
    disallow: string[];
    allow?: string | string[];
  };
  llms?: {
    title: string;
    summary: string;
    sections: {
      heading: string;
      items: { title: string; path: string; note?: string }[];
    }[];
  };
}
