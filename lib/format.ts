// lib/format.ts
// Small, framework-agnostic presentation helpers.
import { siteConfig } from '@/lib/site-config';

export function cleanDomain(url?: string | null): string {
  if (!url) return '';
  try {
    const withProto = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(withProto).hostname.replace(/^www\./i, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

/** Outbound link with the platform's UTM source (same format as before). */
export function outboundUrl(url: string): string {
  return `${url}?utm_source=${siteConfig.utmSource}`;
}

export type PricingTone = 'success' | 'info' | 'neutral';

export function pricingTone(type?: string | null): PricingTone {
  const t = (type || '').toLowerCase();
  if (t === 'free') return 'success';
  if (t === 'freemium') return 'info';
  return 'neutral';
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN', { notation: n >= 10000 ? 'compact' : 'standard' }).format(n);
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** ISO-8601 week number. */
export function isoWeek(date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function initials(name: string): string {
  return name
    .replace(/^@/, '')
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

