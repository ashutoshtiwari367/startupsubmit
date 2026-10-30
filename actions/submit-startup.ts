// actions/submit-startup.ts
'use server';

import { supabase, getServiceSupabase } from '@/lib/supabase';
import { tierConfig } from '@/lib/site-config';
import type { ListingTier } from '@/lib/type';

export interface SubmitStartupInput {
  name: string;
  tagline: string;
  websiteUrl: string;
  category: string;
  pricingType: string;
  description: string;
  twitterHandle?: string;
  listingType: string; // 'free' | 'featured' | 'premium'
  logoUrl?: string | null;
  brandColor?: string | null;
  bannerTitle?: string | null;
  bannerImage?: string | null;
}

export async function submitStartupAction(formData: SubmitStartupInput) {
  try {
    // 1. Validation check
    if (!formData.name || !formData.websiteUrl || !formData.tagline || !formData.description) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    // 2. SEO-friendly unique slug
    const baseSlug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Use service role client if available on server to bypass RLS
    let db = supabase;
    try {
      db = getServiceSupabase();
    } catch {
      db = supabase;
    }

    const brandColor =
      formData.brandColor && /^#[0-9a-f]{6}$/i.test(formData.brandColor) ? formData.brandColor : null;

    const rawTier = formData.listingType as ListingTier;
    const tier: ListingTier = rawTier === 'premium' || rawTier === 'featured' ? rawTier : 'free';
    const cfg = tierConfig[tier] || tierConfig.free;

    const startsAt = new Date().toISOString();
    const expiresAt =
      cfg.durationDays && cfg.durationDays > 0
        ? new Date(Date.now() + cfg.durationDays * 86400000).toISOString()
        : null;

    const isVerified = tier === 'premium';
    const isFeatured = tier === 'featured' || tier === 'premium';

    // Embed metadata tag so tier, logo_url, brand_color, etc. are preserved even if DB schema columns are not present
    const metaTag = `\n\n<!--meta:${JSON.stringify({
      logo_url: formData.logoUrl || null,
      brand_color: brandColor || null,
      tier,
      tier_starts_at: startsAt,
      tier_expires_at: expiresAt,
      is_verified: isVerified,
      banner_title: formData.bannerTitle || null,
      banner_image: formData.bannerImage || null,
    })}-->`;

    // 3. Supabase insert with fallback
    const baseRow = {
      name: formData.name.trim(),
      slug: uniqueSlug,
      tagline: formData.tagline.trim(),
      description: formData.description.trim() + metaTag,
      website_url: formData.websiteUrl.trim(),
      twitter_handle: formData.twitterHandle ? formData.twitterHandle.trim() : null,
      category: formData.category,
      pricing_type: formData.pricingType,
      listing_type: formData.listingType,
      status: 'approved',
      upvotes: 1,
      is_featured: isFeatured,
    };

    let { data, error } = await db
      .from('startups')
      .insert([
        {
          ...baseRow,
          logo_url: formData.logoUrl || null,
          brand_color: brandColor,
          tier,
          tier_starts_at: startsAt,
          tier_expires_at: expiresAt,
          is_verified: isVerified,
        },
      ])
      .select()
      .single();

    // If native columns don't exist in Supabase, insert baseRow (which preserves metadata in description)
    if (error && /logo_url|brand_color|tier|is_verified/i.test(error.message)) {
      ({ data, error } = await db.from('startups').insert([baseRow]).select().single());
    }

    if (error) {
      console.error('Supabase insert error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: unknown) {
    console.error('Submission server error:', err);
    return { success: false, error: 'Submission encountered an error. Please try again.' };
  }
}
