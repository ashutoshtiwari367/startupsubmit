// lib/types.ts
export type ListingTier = 'free' | 'featured' | 'premium';

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl: string;
  category: string;
  pricingType: 'Free' | 'Freemium' | 'Paid';
  upvotes: number;
  tier?: ListingTier;
  isFeatured?: boolean;
  isVerified?: boolean;
  createdAt: string;
}

/** Shape of a row in the Supabase `startups` table (after `normalizeStartup`). */
export interface StartupItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  pricing_type: string;
  upvotes: number;
  website_url: string;
  is_featured: boolean;
  tier?: ListingTier;
  tier_starts_at?: string | null;
  tier_expires_at?: string | null;
  is_verified?: boolean;
  banner_title?: string | null;
  banner_image?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  brand_color?: string | null;
  description?: string;
  twitter_handle?: string | null;
  status?: string;
  created_at?: string;
  views?: number;
  clicks?: number;
}
