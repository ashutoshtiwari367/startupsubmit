'use client';

import * as React from 'react';
import { Fragment, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ExternalLink,
  LayoutGrid,
  List,
  Rocket,
  Sparkles,
} from 'lucide-react';
import StartupCard from '@/components/StartupCard';
import StartupLogo from '@/components/StartupLogo';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { NativeSelect } from '@/components/ui/native-select';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SponsoredBanner } from '@/components/tiers/SponsoredBanner';
import { TierBadge } from '@/components/tiers/TierBadge';
import { categories, tierConfig } from '@/lib/site-config';
import { getEffectiveTier } from '@/lib/startups';
import { useStartupList } from '@/lib/upvote';
import { outboundUrl } from '@/lib/format';
import type { StartupItem } from '@/lib/type';

type Period = 'week' | 'today' | 'all';
type PricingFilter = 'all' | 'Free' | 'Freemium' | 'Paid';
type ViewMode = 'list' | 'grid';

const PAGE_SIZE = 12;

export function HomeLeaderboard({
  initialStartups,
  weekNumber,
}: {
  initialStartups: StartupItem[];
  weekNumber: number;
}) {
  const { startups, handleUpvote } = useStartupList(initialStartups);

  const [period, setPeriod] = useState<Period>('week');
  const [pricing, setPricing] = useState<PricingFilter>('all');
  const [category, setCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Identify featured items for sidebar
  const featuredStartups = useMemo(
    () =>
      startups.filter(
        (s) => getEffectiveTier(s) === 'featured' || getEffectiveTier(s) === 'premium'
      ),
    [startups]
  );

  // Identify first premium item with banner data for the in-list sponsored row
  const premiumBannerItem = useMemo(
    () =>
      startups.find(
        (s) =>
          getEffectiveTier(s) === 'premium' && (s.banner_title || s.banner_image)
      ) || null,
    [startups]
  );

  // Period filter anchored on the newest launch timestamp
  const periodFiltered = useMemo(() => {
    const dayMs = 86_400_000;
    const latestMs = startups.reduce((max, s) => {
      const t = s.created_at ? new Date(s.created_at).getTime() : 0;
      return Number.isFinite(t) && t > max ? t : max;
    }, 0);
    if (!latestMs) return startups;

    if (period === 'today') {
      const recent = startups.filter(
        (s) => s.created_at && latestMs - new Date(s.created_at).getTime() <= dayMs * 2
      );
      if (recent.length > 0) return recent;
    }
    if (period === 'week') {
      const recent = startups.filter(
        (s) => s.created_at && latestMs - new Date(s.created_at).getTime() <= dayMs * 7
      );
      if (recent.length > 0) return recent;
    }
    return startups;
  }, [startups, period]);

  const filtered = useMemo(() => {
    return periodFiltered
      .filter((s) => {
        const matchesPricing =
          pricing === 'all' || s.pricing_type.toLowerCase() === pricing.toLowerCase();
        const matchesCategory =
          category === 'all' || s.category.toLowerCase() === category.toLowerCase();
        return matchesPricing && matchesCategory;
      })
      .sort((a, b) => {
        // Global tier priority: premium > featured > free, then upvotes
        const tierWeight = { premium: 3, featured: 2, free: 1 };
        const weightA = tierWeight[getEffectiveTier(a)];
        const weightB = tierWeight[getEffectiveTier(b)];
        if (weightA !== weightB) return weightB - weightA;
        return (b.upvotes || 0) - (a.upvotes || 0);
      });
  }, [periodFiltered, pricing, category]);

  const visible = filtered.slice(0, visibleCount);

  const resetFilters = () => {
    setPricing('all');
    setCategory('all');
    setPeriod('all');
  };

  return (
    <div className="space-y-10">
      {/* Leaderboard Controls */}
      <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="leaderboard-heading" className="text-h3">
            Launch Leaderboard
          </h2>
          <Badge variant="outline" size="md">
            Week {weekNumber}
          </Badge>
          <SegmentedControl<Period>
            label="Leaderboard period"
            size="sm"
            value={period}
            onChange={(v) => {
              setPeriod(v);
              setVisibleCount(PAGE_SIZE);
            }}
            options={[
              { value: 'week', label: 'This Week' },
              { value: 'today', label: 'Today' },
              { value: 'all', label: 'All-time' },
            ]}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<PricingFilter>
            label="Filter by pricing"
            size="sm"
            value={pricing}
            onChange={(v) => {
              setPricing(v);
              setVisibleCount(PAGE_SIZE);
            }}
            options={[
              { value: 'all', label: 'All' },
              { value: 'Free', label: 'Free' },
              { value: 'Freemium', label: 'Freemium' },
              { value: 'Paid', label: 'Paid' },
            ]}
          />

          <label htmlFor="home-category-filter" className="sr-only">
            Filter by category
          </label>
          <NativeSelect
            id="home-category-filter"
            size="sm"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            wrapperClassName="w-40"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </NativeSelect>

          <SegmentedControl<ViewMode>
            label="Layout view"
            size="sm"
            value={viewMode}
            onChange={setViewMode}
            className="hidden sm:inline-flex"
            options={[
              { value: 'list', label: <List />, ariaLabel: 'List view' },
              { value: 'grid', label: <LayoutGrid />, ariaLabel: 'Grid view' },
            ]}
          />
        </div>
      </div>

      {/* Main Leaderboard + Desktop Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Products List/Grid */}
        <div className="lg:col-span-8 space-y-3">
          {visible.length > 0 ? (
            viewMode === 'list' ? (
              <div className="space-y-3">
                {visible.map((item, idx) => (
                  <Fragment key={item.id}>
                    <StartupCard
                      startup={item}
                      variant="list"
                      rank={idx + 1}
                      onUpvote={handleUpvote}
                    />

                    {/* Insert Sponsored / Premium banner row after 3rd item */}
                    {idx === 2 && (
                      <div className="py-1">
                        <SponsoredBanner item={premiumBannerItem} />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {visible.map((item, idx) => (
                    <StartupCard
                      key={item.id}
                      startup={item}
                      variant="grid"
                      rank={idx + 1}
                      onUpvote={handleUpvote}
                    />
                  ))}
                </div>
                {/* Banner row in grid view */}
                <div className="pt-2">
                  <SponsoredBanner item={premiumBannerItem} />
                </div>
              </div>
            )
          ) : (
            <EmptyState
              icon={<Rocket />}
              title="No startups match these filters"
              description="Try clearing the pricing or category filter, or launch the first product in this category."
            >
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Reset filters
              </Button>
              <Link href="/submit" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                Submit a product
              </Link>
            </EmptyState>
          )}

          {/* Pagination / counts */}
          <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row border-t border-border mt-6">
            <p className="text-xs text-muted-foreground">
              Showing <strong className="font-semibold text-foreground">{visible.length}</strong> of{' '}
              <strong className="font-semibold text-foreground">{filtered.length}</strong> products
            </p>

            <div className="flex items-center gap-2">
              {visibleCount < filtered.length && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                >
                  Show more ({filtered.length - visibleCount} remaining)
                </Button>
              )}
              <Link
                href="/directory"
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                <span>Browse full directory</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Desktop): Featured Box */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-foreground">
                  Featured Products
                </h3>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                Spotlight
              </span>
            </div>

            <div className="space-y-3">
              {featuredStartups.slice(0, 4).map((f) => {
                const fTier = getEffectiveTier(f);
                return (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-subtle transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <StartupLogo
                        name={f.name}
                        logoUrl={f.logo_url}
                        websiteUrl={f.website_url}
                        size={36}
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <Link
                            href={`/products/${f.slug}`}
                            className="text-xs font-semibold text-foreground group-hover:text-primary truncate"
                          >
                            {f.name}
                          </Link>
                          <TierBadge tier={fTier} isVerified={f.is_verified} size="sm" />
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {f.tagline}
                        </p>
                      </div>
                    </div>

                    <a
                      href={outboundUrl(f.website_url)}
                      target="_blank"
                      rel="sponsored noopener"
                      aria-label={`Visit ${f.name}`}
                      className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
                    >
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Final row: Your product here - from ₹999 / week */}
            <div className="border-t border-border pt-3">
              <Link
                href="/submit?plan=featured"
                className="group flex items-center justify-between rounded-xl border border-dashed border-border-strong bg-subtle p-3 hover:border-primary hover:bg-primary-soft/30 transition-all text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground group-hover:text-primary">
                    Your product here
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    From {tierConfig.featured.priceDisplay} / 14 days
                  </p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Quick 3-Tier summary card */}
          <div className="rounded-2xl border border-border bg-subtle p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Launch Tiers
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Free Listing</span>
                <span className="text-muted-foreground">₹0 · Permanent</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-primary">Featured Spotlight</span>
                <span className="font-semibold text-foreground">{tierConfig.featured.priceDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-amber-800">Premium Launch</span>
                <span className="font-semibold text-foreground">{tierConfig.premium.priceDisplay}</span>
              </div>
            </div>
            <Link
              href="/pricing"
              className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'w-full text-xs' })}
            >
              Compare all plans →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
