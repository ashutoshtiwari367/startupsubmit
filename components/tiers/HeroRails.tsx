import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, Zap } from 'lucide-react';
import { cn } from 'cn';
import type { StartupItem } from '@/lib/type';
import StartupLogo from '@/components/StartupLogo';
import { TierBadge } from '@/components/tiers/TierBadge';
import { EmptySlotCard } from '@/components/tiers/EmptySlotCard';
import { getEffectiveTier } from '@/lib/startups';

/**
 * Premium Hero Rail Card:
 * Spacious 2-row layout with Logo, clear Product Name, Category/Tier,
 * and 2-line tagline. Vote buttons are intentionally omitted to avoid crowding.
 */
export function HeroRailCard({ item }: { item: StartupItem }) {
  const tier = getEffectiveTier(item);

  return (
    <Link
      href={`/products/${item.slug}`}
      className="group relative block rounded-xl border border-border bg-card p-3 sm:p-3.5 shadow-2xs hover:border-primary/40 hover:shadow-xs hover:bg-subtle/50 transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <StartupLogo
            name={item.name}
            logoUrl={item.logo_url}
            websiteUrl={item.website_url}
            size={38}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {item.name}
              </span>
              {tier !== 'free' && (
                <TierBadge tier={tier} isVerified={item.is_verified} size="sm" />
              )}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground block truncate">
              {item.category} · {item.pricing_type}
            </span>
          </div>
        </div>

        <span className="shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {item.tagline}
      </p>
    </Link>
  );
}

// Keep CompactRailCard for backward compatibility if referenced elsewhere
export const CompactRailCard = HeroRailCard;

/** Left Rail: Featured Spotlights */
export function FeaturedRail({
  items,
  className,
}: {
  items: StartupItem[];
  onUpvote?: (id: string, currentUpvotes: number) => void;
  className?: string;
}) {
  return (
    <section
      aria-label="Featured startup spotlights"
      className={cn(
        'flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card/75 p-4 shadow-xs backdrop-blur-xs',
        className
      )}
    >
      <div className="flex items-center justify-between pb-2 border-b border-border/70">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Featured Spotlights
            </h3>
            <p className="text-[10px] text-muted-foreground">High-visibility launches</p>
          </div>
        </div>
        <Link
          href="/submit?plan=featured"
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:underline"
        >
          <span>Boost</span>
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="space-y-2.5 flex-1 my-1">
        {items.map((item) => (
          <HeroRailCard key={item.id} item={item} />
        ))}
      </div>

      <EmptySlotCard
        tier="featured"
        title="Your product here"
        subtitle="Get featured placement · from ₹999"
        compact
      />
    </section>
  );
}

/** Right Rail: Just Listed */
export function JustListedRail({
  items,
  className,
}: {
  items: StartupItem[];
  onUpvote?: (id: string, currentUpvotes: number) => void;
  className?: string;
}) {
  return (
    <section
      aria-label="Just listed startups"
      className={cn(
        'flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card/75 p-4 shadow-xs backdrop-blur-xs',
        className
      )}
    >
      <div className="flex items-center justify-between pb-2 border-b border-border/70">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-amber-100 text-amber-800">
            <Zap className="size-3.5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Just Listed
            </h3>
            <p className="text-[10px] text-muted-foreground">Fresh community additions</p>
          </div>
        </div>
        <Link
          href="/directory?sort=newest"
          className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          <span>View all</span>
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="space-y-2.5 flex-1 my-1">
        {items.map((item) => (
          <HeroRailCard key={item.id} item={item} />
        ))}
      </div>

      <EmptySlotCard
        tier="free"
        title="Launch for free today"
        subtitle="Join directory & AI index in 2 mins"
        compact
      />
    </section>
  );
}

/** Legacy 2-column container */
export function HeroRails({
  featured,
  justListed,
  className,
}: {
  featured: StartupItem[];
  justListed: StartupItem[];
  onUpvote?: (id: string, currentUpvotes: number) => void;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-5 w-full pt-4', className)}>
      <FeaturedRail items={featured} />
      <JustListedRail items={justListed} />
    </div>
  );
}
