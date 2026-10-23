// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

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
// Fallback to placeholder values prevents createClient from throwing 'supabaseKey is required' during module evaluation
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
 * Normalizes startup record, extracting any embedded logo_url or brand_color
 * metadata from the description if database schema columns are not present.
 */
export function normalizeStartup<T extends Record<string, any>>(raw: T): T {
  if (!raw) return raw;
  let logo_url = raw.logo_url || null;
  let banner_url = raw.banner_url || raw.image_url || null;
  let brand_color = raw.brand_color || null;
  let description = raw.description || '';

  // Extract embedded metadata from description
  const metaMatch = description.match(/<!--meta:({[\s\S]*?})-->/);
  if (metaMatch) {
    try {
      const parsed = JSON.parse(metaMatch[1]);
      if (parsed.logo_url && !logo_url) logo_url = parsed.logo_url;
      if (parsed.banner_url && !banner_url) banner_url = parsed.banner_url;
      if (parsed.image_url && !banner_url) banner_url = parsed.image_url;
      if (parsed.brand_color && !brand_color) brand_color = parsed.brand_color;
      description = description.replace(/<!--meta:[\s\S]*?-->/, '').trim();
    } catch {
      // Ignore parse errors
    }
  }

  return {
    ...raw,
    description,
    logo_url,
    banner_url: banner_url || logo_url,
    brand_color,
  };
}