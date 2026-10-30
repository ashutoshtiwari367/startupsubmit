'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Crown,
  ExternalLink,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from 'cn';
import StartupCard from '@/components/StartupCard';
import StartupLogo from '@/components/StartupLogo';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { EmptySlotCard } from '@/components/tiers/EmptySlotCard';
import { categories, tierConfig } from '@/lib/site-config';
import { getEffectiveTier } from '@/lib/startups';
import { useStartupList } from '@/lib/upvote';
import { outboundUrl } from '@/lib/format';
import type { StartupItem } from '@/lib/type';

type SortBy = 'upvotes' | 'newest' | 'name';
type PricingFilter = 'all' | 'Free' | 'Freemium' | 'Paid';
type ViewMode = 'grid' | 'list';

const PAGE_SIZE = 18;

export function DirectoryBrowser({
  initialStartups,
  initialCategory = 'All',
  initialQuery = '',
  showSponsored = true,
  defaultView = 'grid',
}: {
  initialStartups: StartupItem[];
  initialCategory?: string;
  initialQuery?: string;
  showSponsored?: boolean;
  defaultView?: ViewMode;
}) {
  const { startups, handleUpvote } = useStartupList(initialStartups);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [pricing, setPricing] = useState<PricingFilter>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortBy>('upvotes');
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sponsored & Featured startups
  const sponsoredStartups = useMemo(
    () =>
      startups.filter(
        (s) => getEffectiveTier(s) === 'featured' || getEffectiveTier(s) === 'premium'
      ),
    [startups]
  );

  const premiumStartups = useMemo(
    () => startups.filter((s) => getEffectiveTier(s) === 'premium').slice(0, 3),
    [startups]
  );

  const featuredRailStartups = useMemo(
    () =>
      startups
        .filter((s) => getEffectiveTier(s) === 'featured')
        .slice(0, 4),
    [startups]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: startups.length };
    startups.forEach((s) => {
      const key = s.category.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [startups]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return startups
      .filter((s) => {
        const sTier = getEffectiveTier(s);
        const matchesFeatured = !featuredOnly || sTier === 'featured' || sTier === 'premium';
        const matchesCat =
          selectedCategory === 'All' ||
          s.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesPrice =
          pricing === 'all' || s.pricing_type.toLowerCase() === pricing.toLowerCase();
        const matchesQuery =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q));
        return matchesFeatured && matchesCat && matchesPrice && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'upvotes') {
          // Keep premium/featured prioritized, then upvotes
          const tierWeight = { premium: 3, featured: 2, free: 1 };
          const weightA = tierWeight[getEffectiveTier(a)];
          const weightB = tierWeight[getEffectiveTier(b)];
          if (weightA !== weightB) return weightB - weightA;
          return (b.upvotes || 0) - (a.upvotes || 0);
        }
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'newest') {
          return (
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
        }
        return 0;
      });
  }, [startups, selectedCategory, pricing, featuredOnly, searchQuery, sortBy]);

  const visible = filtered.slice(0, visibleCount);

  const clearAll = () => {
    setSelectedCategory('All');
    setPricing('all');
    setFeaturedOnly(false);
    setSearchQuery('');
    setVisibleCount(PAGE_SIZE);
  };

  const allCategoryTabs = ['All', ...categories.map((c) => c.name)];

  return (
    <div className="space-y-8">
      {/* Top Promoted Strip (Optional) */}
      {showSponsored && sponsoredStartups.length > 0 && (
        <section aria-labelledby="dir-sponsored-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="md">
                <Sparkles aria-hidden="true" />
                Featured Spotlights
              </Badge>
              <span id="dir-sponsored-heading" className="text-xs text-muted-foreground">
                Verified high-visibility product placements
              </span>
            </div>
            <Link
              href="/submit?plan=featured"
              className="text-xs font-medium text-primary hover:underline"
            >
              Promote your product →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sponsoredStartups.slice(0, 3).map((item) => (
              <StartupCard
                key={item.id}
                startup={item}
                variant="featured"
                onUpvote={handleUpvote}
              />
            ))}

            <EmptySlotCard
              tier="featured"
              title="Your product here"
              subtitle="Drive targeted founder traffic"
            />
          </div>
        </section>
      )}

      {/* Mobile Collapsible Sidebar */}
      <div className="lg:hidden">
        <details className="group rounded-2xl border border-border bg-subtle p-4">
          <summary className="flex cursor-pointer items-center justify-between font-semibold text-xs text-foreground uppercase tracking-wider outline-none">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
              <span>Featured rails &amp; Launch tiers</span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="pt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Featured Products</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {featuredRailStartups.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
                    <StartupLogo name={f.name} logoUrl={f.logo_url} websiteUrl={f.website_url} size={32} />
                    <span className="text-xs font-medium text-foreground truncate">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <EmptySlotCard tier="featured" compact />
          </div>
        </details>
      </div>

      {/* Main Grid + Sticky Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Products Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls Bar */}
          <div className="space-y-4 rounded-xl border border-border bg-subtle p-4 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search input */}
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <label htmlFor="directory-search" className="sr-only">
                  Search startups
                </label>
                <Input
                  id="directory-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  placeholder="Search by name, tagline or keyword..."
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Pricing + Featured Only + View Mode */}
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

                {/* "Featured only" chip */}
                <button
                  type="button"
                  onClick={() => {
                    setFeaturedOnly(!featuredOnly);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  aria-pressed={featuredOnly}
                  className={cn(
                    'inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition-colors',
                    featuredOnly
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground'
                  )}
                >
                  <Sparkles className="size-3" aria-hidden="true" />
                  <span>Featured only</span>
                </button>

                <label htmlFor="directory-sort" className="sr-only">
                  Sort products
                </label>
                <NativeSelect
                  id="directory-sort"
                  size="sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  wrapperClassName="w-36"
                >
                  <option value="upvotes">Most upvoted</option>
                  <option value="newest">Newest first</option>
                  <option value="name">Name (A–Z)</option>
                </NativeSelect>

                <SegmentedControl<ViewMode>
                  label="Layout view"
                  size="sm"
                  value={viewMode}
                  onChange={setViewMode}
                  className="hidden sm:inline-flex"
                  options={[
                    { value: 'grid', label: <LayoutGrid />, ariaLabel: 'Grid view' },
                    { value: 'list', label: <List />, ariaLabel: 'List view' },
                  ]}
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
              {allCategoryTabs.map((cat) => {
                const count =
                  cat === 'All' ? categoryCounts.All : categoryCounts[cat.toLowerCase()] || 0;
                const active = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    aria-pressed={active}
                    className={cn(
                      'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors duration-150',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground'
                    )}
                  >
                    <span>{cat}</span>
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.2 text-[10px] tabular-nums',
                        active
                          ? 'bg-white/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Counts & Reset */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong className="font-semibold text-foreground">{visible.length}</strong> of{' '}
              <strong className="font-semibold text-foreground">{filtered.length}</strong> startups
            </span>
            {(selectedCategory !== 'All' || pricing !== 'all' || featuredOnly || searchQuery) && (
              <button
                type="button"
                onClick={clearAll}
                className="font-medium text-primary hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* Products Grid / List */}
          {visible.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {visible.map((item, idx) => (
                  <StartupCard
                    key={item.id}
                    startup={item}
                    variant="grid"
                    rank={sortBy === 'upvotes' ? idx + 1 : undefined}
                    onUpvote={handleUpvote}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {visible.map((item, idx) => (
                  <StartupCard
                    key={item.id}
                    startup={item}
                    variant="list"
                    rank={sortBy === 'upvotes' ? idx + 1 : undefined}
                    onUpvote={handleUpvote}
                  />
                ))}
              </div>
            )
          ) : (
            <EmptyState
              icon={<Search />}
              title="No startups found"
              description="No approved startups match your current category, pricing or featured filter."
            >
              <Button variant="secondary" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
              <Link href="/submit" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                Submit a startup
              </Link>
            </EmptyState>
          )}

          {/* Load More Button */}
          {visibleCount < filtered.length && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              >
                Load more ({filtered.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>

        {/* Sticky Right Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          {/* 1. Premium Launches (Top Tier) */}
          {premiumStartups.length > 0 && (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/20 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Crown className="size-4 text-amber-700" aria-hidden="true" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Premium Launches
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                  Top Tier
                </span>
              </div>

              <div className="space-y-2.5">
                {premiumStartups.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-card border border-amber-200/60 hover:border-amber-300 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <StartupLogo
                        name={p.name}
                        logoUrl={p.logo_url}
                        websiteUrl={p.website_url}
                        size={36}
                      />
                      <div className="min-w-0 space-y-0.5">
                        <Link
                          href={`/products/${p.slug}`}
                          className="text-xs font-semibold text-foreground group-hover:text-primary truncate block"
                        >
                          {p.name}
                        </Link>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {p.tagline}
                        </p>
                      </div>
                    </div>

                    <a
                      href={outboundUrl(p.website_url)}
                      target="_blank"
                      rel="sponsored noopener"
                      aria-label={`Visit ${p.name}`}
                      className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
                    >
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Featured Products */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Featured Products
                </h3>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                Spotlight
              </span>
            </div>

            <div className="space-y-2.5">
              {featuredRailStartups.map((f) => (
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
                      <Link
                        href={`/products/${f.slug}`}
                        className="text-xs font-semibold text-foreground group-hover:text-primary truncate block"
                      >
                        {f.name}
                      </Link>
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
              ))}
            </div>

            {/* Empty Slot CTA Card */}
            <EmptySlotCard
              tier="featured"
              title="Feature your product here"
              subtitle={`From ${tierConfig.featured.priceDisplay} / 14 days`}
              compact
            />
          </div>

          {/* 3. Compact "List your SaaS" summary card */}
          <div className="rounded-2xl border border-border bg-subtle p-5 space-y-3.5">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">List your startup</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose the right visibility tier for your product launch:
              </p>
            </div>

            <div className="space-y-2 text-xs divide-y divide-border">
              <div className="pt-1.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground block">Free Listing</span>
                  <span className="text-[11px] text-muted-foreground">Standard queue</span>
                </div>
                <span className="font-bold text-foreground">₹0</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-primary block">Featured</span>
                  <span className="text-[11px] text-muted-foreground">Dedicated rails</span>
                </div>
                <span className="font-bold text-foreground">{tierConfig.featured.priceDisplay}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-amber-800 block">Premium Launch</span>
                  <span className="text-[11px] text-muted-foreground">Top spot + banner</span>
                </div>
                <span className="font-bold text-foreground">{tierConfig.premium.priceDisplay}</span>
              </div>
            </div>

            <Link
              href="/submit"
              className={buttonVariants({ variant: 'primary', size: 'sm', className: 'w-full' })}
            >
              <span>Submit startup now</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
