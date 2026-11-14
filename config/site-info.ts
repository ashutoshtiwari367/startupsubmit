/**
 * Single source of truth for site-wide content, branding, and hero/featured configurations.
 * Updating values here automatically updates the homepage and relevant UI components.
 */

export interface FeaturedTabConfig {
  title: string;
  badge: string;
  promoteText: string;
  promoteLink: string;
  maxItemsPerSide: number;
  rightTitle?: string;
  rightBadge?: string;
}

export interface HeroSectionConfig {
  pillText: string;
  headlineLine1: string;
  headlineLine2Prefix: string;
  headlineLine2Highlight: string;
  subtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  asSeenOnLabel: string;
  asSeenOnLogos: string[];
}

export interface SiteInfoConfig {
  name: string;
  domain: string;
  tagline: string;
  featuredTab: FeaturedTabConfig;
  hero: HeroSectionConfig;
}

export const FEATURED_CONFIG: FeaturedTabConfig = {
  title: "Featured Today",
  badge: "SPONSORED",
  promoteText: "Promote →",
  promoteLink: "/pricing",
  maxItemsPerSide: 5,
  rightTitle: "Top Sponsors",
  rightBadge: "SPOTLIGHT",
};

export const SITE_INFO: SiteInfoConfig = {
  name: "LaunchOS",
  domain: "launchos.com",
  tagline: "Product Launch Directory for AI & SaaS Makers",
  featuredTab: FEATURED_CONFIG,
  hero: {
    pillText: "30,000+ founders launch here",
    headlineLine1: "Launch your product.",
    headlineLine2Prefix: "Get seen. Get ",
    headlineLine2Highlight: "users.",
    subtitle:
      "Daily launches, curated directories, and verified discovery for top featured products.",
    primaryCtaText: "Submit your product",
    secondaryCtaText: "Browse launches",
    asSeenOnLabel: "AS SEEN ON",
    asSeenOnLogos: [
      "TechCrunch",
      "Hacker News",
      "Product Hunt",
      "Indie Hackers",
      "Y Combinator",
    ],
  },
};
