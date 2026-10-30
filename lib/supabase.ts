// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { ListingTier, StartupItem } from '@/lib/type';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are missing.'
  );
}

// Standard public client for client & server components
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Server-only client with elevated permissions for sensitive operations
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin server operations.');
  }
  return createClient(supabaseUrl || '', serviceRoleKey);
};

/**
 * Normalizes startup record, extracting any embedded logo_url, brand_color,
 * or tier metadata from the description if database schema columns are not present.
 */
export function normalizeStartup(raw: Record<string, unknown>): StartupItem {
  if (!raw) return raw as unknown as StartupItem;
  let logo_url = (raw.logo_url as string) || null;
  let banner_url = (raw.banner_url as string) || (raw.image_url as string) || null;
  let brand_color = (raw.brand_color as string) || null;
  let description = (raw.description as string) || '';
  let tier = (raw.tier as ListingTier) || undefined;
  let tier_starts_at = (raw.tier_starts_at as string) || null;
  let tier_expires_at = (raw.tier_expires_at as string) || null;
  let is_verified = Boolean(raw.is_verified);
  let banner_title = (raw.banner_title as string) || null;
  let banner_image = (raw.banner_image as string) || null;

  // Extract embedded metadata from description
  const metaMatch = description.match(/<!--meta:({[\s\S]*?})-->/);
  if (metaMatch) {
    try {
      const parsed = JSON.parse(metaMatch[1]);
      if (parsed.logo_url && !logo_url) logo_url = parsed.logo_url;
      if (parsed.banner_url && !banner_url) banner_url = parsed.banner_url;
      if (parsed.image_url && !banner_url) banner_url = parsed.image_url;
      if (parsed.brand_color && !brand_color) brand_color = parsed.brand_color;
      if (parsed.tier && !tier) tier = parsed.tier;
      if (parsed.tier_starts_at && !tier_starts_at) tier_starts_at = parsed.tier_starts_at;
      if (parsed.tier_expires_at && !tier_expires_at) tier_expires_at = parsed.tier_expires_at;
      if (parsed.is_verified !== undefined) is_verified = Boolean(parsed.is_verified);
      if (parsed.banner_title && !banner_title) banner_title = parsed.banner_title;
      if (parsed.banner_image && !banner_image) banner_image = parsed.banner_image;
      description = description.replace(/<!--meta:[\s\S]*?-->/, '').trim();
    } catch {
      // Ignore parse errors
    }
  }

  // Fallback defaults for tier
  if (!tier) {
    if (raw.listing_type === 'premium') {
      tier = 'premium';
    } else if (raw.is_featured) {
      tier = 'featured';
    } else {
      tier = 'free';
    }
  }

  if (tier === 'premium') {
    is_verified = true;
  }

  return {
    ...(raw as unknown as StartupItem),
    description,
    logo_url,
    banner_url: banner_url || logo_url,
    brand_color,
    tier,
    tier_starts_at,
    tier_expires_at,
    is_verified,
    banner_title,
    banner_image,
    is_featured: tier === 'featured' || tier === 'premium' || Boolean(raw.is_featured),
    views: typeof raw.views === 'number' ? raw.views : 124 + ((raw.upvotes as number) || 1) * 3,
    clicks: typeof raw.clicks === 'number' ? raw.clicks : Math.floor(((raw.upvotes as number) || 1) * 1.5),
  };
}
