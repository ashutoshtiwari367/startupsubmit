// actions/admin-tiers.ts
'use server';

import { supabase, getServiceSupabase } from '@/lib/supabase';
import type { ListingTier } from '@/lib/type';
import { revalidatePath } from 'next/cache';

export interface UpdateTierInput {
  id: string;
  slug?: string;
  tier: ListingTier;
  durationDays?: number;
  isVerified?: boolean;
  bannerTitle?: string | null;
  bannerImage?: string | null;
}

export async function updateStartupTierAction(input: UpdateTierInput) {
  try {
    let db = supabase;
    try {
      db = getServiceSupabase();
    } catch {
      db = supabase;
    }

    const startsAt = new Date().toISOString();
    const expiresAt =
      input.durationDays && input.durationDays > 0
        ? new Date(Date.now() + input.durationDays * 86400000).toISOString()
        : null;

    // First fetch existing startup to preserve existing description and meta
    const { data: existing, error: fetchErr } = await db
      .from('startups')
      .select('*')
      .eq('id', input.id)
      .single();

    if (fetchErr || !existing) {
      return { success: false, error: 'Startup not found in database.' };
    }

    // Prepare updated metadata comment
    let rawDesc = (existing.description as string) || '';
    let existingMeta: Record<string, unknown> = {};
    const metaMatch = rawDesc.match(/<!--meta:({[\s\S]*?})-->/);
    if (metaMatch) {
      try {
        existingMeta = JSON.parse(metaMatch[1]);
      } catch {
        // ignore
      }
      rawDesc = rawDesc.replace(/<!--meta:[\s\S]*?-->/, '').trim();
    }

    const updatedMeta = {
      ...existingMeta,
      tier: input.tier,
      tier_starts_at: startsAt,
      tier_expires_at: expiresAt,
      is_verified: input.isVerified ?? (input.tier === 'premium'),
      banner_title: input.bannerTitle || existingMeta.banner_title || null,
      banner_image: input.bannerImage || existingMeta.banner_image || null,
    };

    const newDescription = `${rawDesc}\n\n<!--meta:${JSON.stringify(updatedMeta)}-->`;

    // Attempt direct column update first
    const directUpdatePayload: Record<string, unknown> = {
      description: newDescription,
      is_featured: input.tier === 'featured' || input.tier === 'premium',
      tier: input.tier,
      tier_starts_at: startsAt,
      tier_expires_at: expiresAt,
      is_verified: updatedMeta.is_verified,
    };

    let { error: updateErr } = await db
      .from('startups')
      .update(directUpdatePayload)
      .eq('id', input.id);

    // If native columns don't exist in Supabase, update description only (safe fallback)
    if (updateErr && /tier|is_verified/i.test(updateErr.message)) {
      const fallbackPayload = {
        description: newDescription,
        is_featured: input.tier === 'featured' || input.tier === 'premium',
      };
      const res = await db.from('startups').update(fallbackPayload).eq('id', input.id);
      updateErr = res.error;
    }

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath('/');
    revalidatePath('/directory');
    revalidatePath(`/products/${existing.slug}`);
    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (err: unknown) {
    console.error('Update tier error:', err);
    return { success: false, error: 'Could not update tier.' };
  }
}

