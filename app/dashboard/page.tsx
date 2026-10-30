// app/dashboard/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  ExternalLink,
  Eye,
  MousePointerClick,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import StartupLogo from '@/components/StartupLogo';
import { TierBadge } from '@/components/tiers/TierBadge';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, SectionHeader } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from '@/components/ui/toast';
import { updateStartupTierAction } from '@/actions/admin-tiers';
import { DEMO_STARTUPS } from '@/lib/demo-startups';
import { getEffectiveTier } from '@/lib/startups';
import { tierConfig } from '@/lib/site-config';
import type { ListingTier, StartupItem } from '@/lib/type';

export default function MakerDashboardPage() {
  const [mySlugs] = React.useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('my_startups');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedSlug, setSelectedSlug] = React.useState<string>(() => {
    if (typeof window === 'undefined') return DEMO_STARTUPS[0]?.slug || '';
    try {
      const raw = localStorage.getItem('my_startups');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch {
      // ignore
    }
    return DEMO_STARTUPS[0]?.slug || '';
  });

  const [allProducts, setAllProducts] = React.useState<StartupItem[]>(DEMO_STARTUPS);
  const [upgrading, setUpgrading] = React.useState(false);

  const currentProduct = React.useMemo(() => {
    return allProducts.find((p) => p.slug === selectedSlug) || allProducts[0];
  }, [allProducts, selectedSlug]);

  const effectiveTier = currentProduct ? getEffectiveTier(currentProduct) : 'free';
  const planInfo = tierConfig[effectiveTier] || tierConfig.free;

  const handleUpgradeTier = async (newTier: ListingTier) => {
    if (!currentProduct) return;
    setUpgrading(true);
    try {
      const res = await updateStartupTierAction({
        id: currentProduct.id,
        slug: currentProduct.slug,
        tier: newTier,
        isVerified: newTier === 'premium',
      });

      if (res.success) {
        const days = tierConfig[newTier].durationDays || 30;
        const newExpires = new Date(Date.now() + days * 86400000).toISOString();
        setAllProducts((prev) =>
          prev.map((item) =>
            item.slug === currentProduct.slug
              ? {
                  ...item,
                  tier: newTier,
                  is_featured: newTier !== 'free',
                  is_verified: newTier === 'premium',
                  tier_starts_at: new Date().toISOString(),
                  tier_expires_at: newExpires,
                }
              : item
          )
        );
        toast.add({
          type: 'success',
          title: `Upgraded to ${tierConfig[newTier].name}!`,
          description: `Your product is now boosted with ${tierConfig[newTier].name} placement.`,
        });
      } else {
        toast.add({
          type: 'error',
          title: 'Upgrade notice',
          description: res.error || 'Could not upgrade tier.',
        });
      }
    } catch {
      toast.add({
        type: 'error',
        title: 'Error',
        description: 'Network error. Please try again.',
      });
    } finally {
      setUpgrading(false);
    }
  };

  const daysRemaining = React.useMemo(() => {
    if (!currentProduct?.tier_expires_at) return null;
    const startMs = currentProduct.tier_starts_at
      ? new Date(currentProduct.tier_starts_at).getTime()
      : 0;
    const expiryMs = new Date(currentProduct.tier_expires_at).getTime();
    if (!startMs || !expiryMs || expiryMs <= startMs) return 14;
    return Math.max(0, Math.ceil((expiryMs - startMs) / (1000 * 60 * 60 * 24)));
  }, [currentProduct]);

  return (
    <main className="py-10 sm:py-14">
      <Container className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            as="h1"
            eyebrow="Maker Portal"
            title="Founder Dashboard"
            description="Manage your startup listings, track community upvotes, and boost tier placement."
          />
          <Link
            href="/submit"
            className={buttonVariants({ variant: 'primary', size: 'md', className: 'self-start sm:self-auto' })}
          >
            <Plus className="size-4" aria-hidden="true" />
            <span>Launch new product</span>
          </Link>
        </div>

        {/* Product Switcher Bar */}
        <Card className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 bg-card">
          <div className="flex items-center gap-3">
            <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
              Select Product:
            </span>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="h-9 rounded-lg border border-border bg-subtle px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              {allProducts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} ({getEffectiveTier(p).toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {mySlugs.includes(selectedSlug) ? (
              <Badge variant="success" size="sm">
                <CheckCircle2 className="size-3" aria-hidden="true" />
                Submitted by this browser
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                Demo Preview Mode
              </Badge>
            )}
          </div>
        </Card>

        {currentProduct ? (
          <div className="space-y-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-5 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Community Upvotes</span>
                  <TrendingUp className="size-4 text-primary" aria-hidden="true" />
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {currentProduct.upvotes || 1}
                </div>
                <p className="text-[11px] text-muted-foreground">Ranked in #{currentProduct.category}</p>
              </Card>

              <Card className="p-5 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Directory Views</span>
                  <Eye className="size-4 text-emerald-600" aria-hidden="true" />
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {currentProduct.views || 382}
                </div>
                <p className="text-[11px] text-muted-foreground">+18% this past week</p>
              </Card>

              <Card className="p-5 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Website Clicks</span>
                  <MousePointerClick className="size-4 text-blue-600" aria-hidden="true" />
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {currentProduct.clicks || 84}
                </div>
                <p className="text-[11px] text-muted-foreground">Direct outbound traffic</p>
              </Card>

              <Card className="p-5 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Active Listing Tier</span>
                  {effectiveTier === 'premium' ? (
                    <Crown className="size-4 text-amber-600" aria-hidden="true" />
                  ) : effectiveTier === 'featured' ? (
                    <Sparkles className="size-4 text-primary" aria-hidden="true" />
                  ) : (
                    <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <TierBadge tier={effectiveTier} isVerified={currentProduct.is_verified} size="md" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {effectiveTier === 'free'
                    ? 'Standard review queue'
                    : daysRemaining !== null
                    ? `${daysRemaining} days duration`
                    : 'Active spotlight'}
                </p>
              </Card>
            </div>

            {/* Product Overview + Boost Actions */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <Card className="p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <StartupLogo
                        name={currentProduct.name}
                        logoUrl={currentProduct.logo_url}
                        websiteUrl={currentProduct.website_url}
                        size={56}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-h3">{currentProduct.name}</h2>
                          <TierBadge
                            tier={effectiveTier}
                            isVerified={currentProduct.is_verified}
                            size="sm"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {currentProduct.tagline}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/products/${currentProduct.slug}`}
                      className={buttonVariants({ variant: 'secondary', size: 'xs' })}
                    >
                      <span>Public page</span>
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-y border-border py-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Category</span>
                      <span className="font-semibold text-foreground">{currentProduct.category}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Pricing</span>
                      <span className="font-semibold text-foreground">{currentProduct.pricing_type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">AI Search Index</span>
                      <span className="font-semibold text-success">Active in /llms.txt</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Dofollow Status</span>
                      <span className="font-semibold text-foreground">
                        {effectiveTier !== 'free' ? 'Guaranteed permanent' : 'Reciprocal badge'}
                      </span>
                    </div>
                  </div>

                  {/* Verification Badge Code */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-foreground">Official Launch Badge</span>
                    <p className="text-[11px] text-muted-foreground">
                      Embed this badge on your website footer or readme to display your ranking:
                    </p>
                    <code className="block rounded-lg border border-border bg-subtle p-3 font-mono text-[11px] text-foreground break-all select-all">
                      {`<a href="https://vinaystartup.com/products/${currentProduct.slug}" target="_blank"><img src="https://vinaystartup.com/badge.svg" alt="Featured on Vinay Startup" width="220" /></a>`}
                    </code>
                  </div>
                </Card>
              </div>

              {/* Upgrade / Tier Management */}
              <div className="space-y-6 lg:col-span-5">
                <Card className="p-6 space-y-5 border-primary/30 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-semibold uppercase tracking-wider text-primary">
                      Tier Placement
                    </span>
                    <TierBadge tier={effectiveTier} isVerified={currentProduct.is_verified} size="sm" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-h4">
                      {effectiveTier === 'free'
                        ? 'Accelerate your traction'
                        : `${planInfo.name} active`}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {effectiveTier === 'free'
                        ? 'Free listings compete in the standard queue. Upgrade to Featured or Premium Launch to gain top spotlight positions and in-list sponsored banners.'
                        : `Your ${planInfo.name} boost is live. You can extend or change your tier at any time.`}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {effectiveTier !== 'featured' && (
                      <Button
                        variant={effectiveTier === 'free' ? 'primary' : 'secondary'}
                        size="md"
                        loading={upgrading}
                        className="w-full justify-between"
                        onClick={() => handleUpgradeTier('featured')}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Sparkles className="size-4" aria-hidden="true" />
                          <span>Switch to Featured (₹999)</span>
                        </span>
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Button>
                    )}

                    {effectiveTier !== 'premium' && (
                      <Button
                        variant="primary"
                        size="md"
                        loading={upgrading}
                        className="w-full justify-between bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                        onClick={() => handleUpgradeTier('premium')}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Crown className="size-4" aria-hidden="true" />
                          <span>Launch as Premium (₹2,999)</span>
                        </span>
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Button>
                    )}

                    {effectiveTier !== 'free' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={upgrading}
                        className="w-full text-muted-foreground"
                        onClick={() => handleUpgradeTier('free')}
                      >
                        <span>Revert to Free tier</span>
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Rocket />}
            title="No product found"
            description="Submit your first SaaS or AI startup to start collecting upvotes and tracking traffic."
          >
            <Link href="/submit" className={buttonVariants({ variant: 'primary', size: 'md' })}>
              Launch your startup
            </Link>
          </EmptyState>
        )}
      </Container>
    </main>
  );
}
