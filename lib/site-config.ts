// lib/site-config.ts
// Central brand + navigation + tier config. Change brand, tiers, slots and URLs here only.

import type { ListingTier } from '@/lib/type';

export const siteConfig = {
  name: 'Vinay Startup',
  legalName: 'Vinay Indian Startup Platform',
  tagline: 'Launch your startup. Get discovered.',
  description:
    'The launch platform and permanent directory for SaaS and AI startups. Launch for free, collect upvotes, earn a dofollow backlink and get indexed by AI search.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://vinaystartup.com').replace(/\/$/, ''),
  utmSource: 'vinay_startup',
  social: {
    x: 'https://x.com/',
    linkedin: 'https://www.linkedin.com/',
  },
  newsletterUrl: process.env.NEXT_PUBLIC_NEWSLETTER_URL || '',
} as const;

export interface CategoryDef {
  name: string;
  slug: string;
  description: string;
}

/** Categories match the values stored in `startups.category` (case-insensitive). */
export const categories: CategoryDef[] = [
  { name: 'SaaS', slug: 'saas', description: 'Software tools for teams and businesses' },
  { name: 'AI', slug: 'ai', description: 'AI and machine learning products' },
  { name: 'DevTools', slug: 'devtools', description: 'Tools for developers and engineers' },
  { name: 'Fintech', slug: 'fintech', description: 'Payments, UPI, finance and banking' },
  { name: 'Marketing', slug: 'marketing', description: 'Marketing, SEO and growth tools' },
  { name: 'Productivity', slug: 'productivity', description: 'Get more done, faster' },
  { name: 'E-Commerce', slug: 'e-commerce', description: 'Tools for online stores and D2C brands' },
];

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  const s = decodeURIComponent(slug).toLowerCase();
  return categories.find((c) => c.slug === s || c.name.toLowerCase() === s);
}

export function categoryHref(category: string): string {
  return `/category/${encodeURIComponent(category.toLowerCase())}`;
}

export const mainNav = [
  { label: 'Launches', href: '/' },
  { label: 'Products', href: '/directory' },
  { label: 'Best of', href: '/best', withYear: true },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Dashboard', href: '/dashboard' },
] as const;

/* -------------------------------------------------------------------------- */
/* 3-TIER LISTING MODEL CONFIGURATION                                        */
/* -------------------------------------------------------------------------- */

export interface TierDetails {
  id: ListingTier;
  name: string;
  price: number;
  priceDisplay: string;
  period: string;
  durationDays: number | null;
  badge: string;
  description: string;
  highlighted?: boolean;
  features: string[];
  cta: string;
}

export const tierConfig: Record<ListingTier, TierDetails> = {
  free: {
    id: 'free',
    name: 'Free Listing',
    price: 0,
    priceDisplay: '₹0',
    period: 'forever',
    durationDays: null,
    badge: 'Standard',
    description: 'Permanent listing in our standard directory queue.',
    features: [
      'Standard launch queue (3-5 days review)',
      'Permanent listing in full directory',
      'Community upvotes & comments',
      'Indexed in /llms.txt AI search feed',
      'Dofollow backlink (badge embed required)',
    ],
    cta: 'Submit for free',
  },
  featured: {
    id: 'featured',
    name: 'Featured',
    price: 999,
    priceDisplay: '₹999',
    period: '14 days',
    durationDays: 14,
    badge: 'Featured',
    highlighted: true,
    description: 'Time-boxed spotlight in dedicated rails and top of category pages.',
    features: [
      'Featured placement in Home & Directory rails',
      'Top placement above Free items in its category',
      'Soft brand-tinted card with Featured pill badge',
      'Immediate approval within 24 hours',
      'Permanent high DR dofollow backlink',
      'Weekly launch digest mention',
    ],
    cta: 'Get Featured',
  },
  premium: {
    id: 'premium',
    name: 'Premium Launch',
    price: 2999,
    priceDisplay: '₹2,999',
    period: '30 days',
    durationDays: 30,
    badge: 'Premium Launch',
    description: 'Top-tier launch with guaranteed top placement, verified badge & banner row.',
    features: [
      'Guaranteed #1-tier placement above Featured & Free',
      'Verified Badge & gold accent border styling',
      'In-list Sponsored banner row inclusion',
      'Hero rail and all sidebars priority slot',
      'Priority citations for Perplexity, ChatGPT & Gemini',
      'Social media announcement on X & LinkedIn',
      'Permanent dofollow backlink (no badge required)',
    ],
    cta: 'Launch as Premium',
  },
};

/** Slot limits across different sections of the website (all configurable). */
export const slotLimits = {
  heroFeaturedRail: 3,
  heroJustListedRail: 3,
  premiumHomeTop: 5,
  directorySidebarFeatured: 4,
  directorySidebarPremium: 3,
  categoryTopFeatured: 3,
  categorySidebarFeatured: 3,
} as const;
