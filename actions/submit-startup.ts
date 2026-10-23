// actions/submit-startup.ts
'use server';

import { supabase, getServiceSupabase } from '@/lib/supabase';

export interface SubmitStartupInput {
  name: string;
  tagline: string;
  websiteUrl: string;
  category: string;
  pricingType: string;
  description: string;
  twitterHandle?: string;
  listingType: string;
  logoUrl?: string | null;
  brandColor?: string | null;
}

export async function submitStartupAction(formData: SubmitStartupInput) {
  try {
    // 1. Validation check
    if (!formData.name || !formData.websiteUrl || !formData.tagline || !formData.description) {
      return { success: false, error: 'Kripya saare zaroori fields fill karein.' };
    }

    // 2. SEO-friendly unique slug generate karein
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

    // Embed metadata tag so logo_url and brand_color are preserved even if DB columns are not created
    const metaTag = (formData.logoUrl || brandColor)
      ? `\n\n<!--meta:${JSON.stringify({ logo_url: formData.logoUrl || null, brand_color: brandColor || null })}-->`
      : '';

    // 3. Supabase me insert karein
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
        status: 'approved', // Instant live approval so it shows immediately on Home & Directory
        upvotes: 1,
        is_featured: formData.listingType === 'premium',
    };

    let { data, error } = await db
      .from('startups')
      .insert([{ ...baseRow, logo_url: formData.logoUrl || null, brand_color: brandColor }])
      .select()
      .single();

    // Agar DB me logo_url / brand_color columns abhi nahi bane hain, toh metadata-backed baseRow save karein
    if (error && /logo_url|brand_color/i.test(error.message)) {
      console.warn('logo_url/brand_color columns missing. Saving with embedded metadata in description.');
      ({ data, error } = await db.from('startups').insert([baseRow]).select().single());
    }

    if (error) {
      console.error('Supabase insert error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Submission server error:', err);
    return { success: false, error: 'Submission me issue aaya. Dobara try karein.' };
  }
}