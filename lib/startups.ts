// lib/startups.ts
// Server-side data access for public pages.
// Computes effective tiers (with automatic expiration fallback to 'free'),
// global sorting (premium > featured > free, then upvotes), and rail selections.

import { supabase, normalizeStartup } from '@/lib/supabase';
import { DEMO_STARTUPS } from '@/lib/demo-startups';
import type { ListingTier, StartupItem } from '@/lib/type';
import { slotLimits } from '@/lib/site-config';

/**
 * Returns the effective tier for a startup.
 * If a time-boxed paid tier has expired, it automatically falls back to 'free'.
 */
export function getEffectiveTier(startup: StartupItem): ListingTier {
  const tier = startup.tier || (startup.is_featured ? 'featured' : 'free');
  if (tier === 'free') return 'free';

  if (startup.tier_expires_at) {
    const expiry = new Date(startup.tier_expires_at).getTime();
    if (Number.isFinite(expiry) && expiry < Date.now()) {
      return 'free';
    }
  }

  return tier;
}

/**
 * Global sorting rule:
 * Premium > Featured > Free, then preserved ranking (upvotes).
 */
export function sortStartupsByTier(items: StartupItem[]): StartupItem[] {
  const tierWeight: Record<ListingTier, number> = {
    premium: 3,
    featured: 2,
    free: 1,
  };

  return [...items].sort((a, b) => {
    const weightA = tierWeight[getEffectiveTier(a)];
    const weightB = tierWeight[getEffectiveTier(b)];
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    return (b.upvotes || 0) - (a.upvotes || 0);
  });
}

function mergeWithDemos(dbRows: StartupItem[], demos: StartupItem[] = DEMO_STARTUPS): StartupItem[] {
  const dbSlugs = new Set(dbRows.map((s) => s.slug));
  return [...dbRows, ...demos.filter((d) => !dbSlugs.has(d.slug))];
}

/** All approved startups ordered by effective tier, merged with the demo dataset. */
export async function getApprovedStartups(): Promise<StartupItem[]> {
  try {
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('status', 'approved')
      .order('upvotes', { ascending: false });

    if (error) {
      // Graceful fallback to demo dataset if Supabase is offline or paused
      console.warn(`[Supabase notice] Startups query fallback (${error.message}). Loading local demo startups.`);
      return sortStartupsByTier(DEMO_STARTUPS);
    }
    if (data && data.length > 0) {
      const dbNormalized = data.map((d) => normalizeStartup(d as Record<string, unknown>));
      return sortStartupsByTier(mergeWithDemos(dbNormalized));
    }
    return sortStartupsByTier(DEMO_STARTUPS);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Supabase notice] Connection error (${msg}). Loading local demo startups.`);
    return sortStartupsByTier(DEMO_STARTUPS);
  }
}

/** Approved startups in a category, sorted with featured/premium first. */
export async function getStartupsByCategory(slug: string): Promise<StartupItem[]> {
  const needle = decodeURIComponent(slug).toLowerCase();
  const demos = DEMO_STARTUPS.filter((d) => d.category.toLowerCase() === needle);
  try {
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('status', 'approved')
      .ilike('category', needle)
      .order('upvotes', { ascending: false });

    if (error) {
      console.warn(`[Supabase notice] Category query fallback (${error.message}). Loading local demo startups.`);
      return sortStartupsByTier(demos);
    }
    const rows = (data || []).map((d) => normalizeStartup(d as Record<string, unknown>));
    return sortStartupsByTier(mergeWithDemos(rows, demos));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Supabase notice] Category connection error (${msg}). Loading local demo startups.`);
    return sortStartupsByTier(demos);
  }
}

/** Top approved startups (Best of year). */
export async function getTopStartups(limit = 10): Promise<StartupItem[]> {
  const all = await getApprovedStartups();
  return all.slice(0, limit);
}

/** Single startup by slug. */
export async function getStartupBySlug(slug: string): Promise<StartupItem | null> {
  try {
    const { data, error } = await supabase.from('startups').select('*').eq('slug', slug).single();
    if (!error && data) return normalizeStartup(data as Record<string, unknown>);
  } catch {
    // fall through to demo lookup
  }
  return DEMO_STARTUPS.find((d) => d.slug === slug) ?? null;
}

/** Related products prioritizing premium & featured of the same category. */
export async function getRelatedStartups(
  category: string,
  currentId: string,
  limit = 3
): Promise<StartupItem[]> {
  const all = await getApprovedStartups();
  const sameCategory = all.filter((s) => s.id !== currentId && s.category.toLowerCase() === category.toLowerCase());
  if (sameCategory.length > 0) {
    return sameCategory.slice(0, limit);
  }
  return all.filter((s) => s.id !== currentId).slice(0, limit);
}

/** Hero rails: Left = Featured (up to 3), Right = Just Listed / Recent (up to 3). */
export function getHeroRails(startups: StartupItem[]) {
  const featured = startups
    .filter((s) => getEffectiveTier(s) === 'featured' || getEffectiveTier(s) === 'premium')
    .slice(0, slotLimits.heroFeaturedRail);

  const justListed = [...startups]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, slotLimits.heroJustListedRail);

  return { featured, justListed };
}
