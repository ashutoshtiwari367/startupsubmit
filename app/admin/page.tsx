// app/admin/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Crown,
  Layers,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import StartupLogo from '@/components/StartupLogo';
import { TierBadge } from '@/components/tiers/TierBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, SectionHeader } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { updateStartupTierAction } from '@/actions/admin-tiers';
import { DEMO_STARTUPS } from '@/lib/demo-startups';
import { getEffectiveTier } from '@/lib/startups';
import { slotLimits, tierConfig } from '@/lib/site-config';
import type { ListingTier, StartupItem } from '@/lib/type';

export default function AdminTiersPage() {
  const [startups, setStartups] = React.useState<StartupItem[]>(DEMO_STARTUPS);
  const [search, setSearch] = React.useState('');
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return startups;
    return startups.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q)
    );
  }, [startups, search]);

  // Slot usage metrics
  const premiumCount = startups.filter((s) => getEffectiveTier(s) === 'premium').length;
  const featuredCount = startups.filter((s) => getEffectiveTier(s) === 'featured').length;
  const freeCount = startups.filter((s) => getEffectiveTier(s) === 'free').length;

  const handleTierChange = async (startup: StartupItem, newTier: ListingTier) => {
    setUpdatingId(startup.id);
    try {
      const res = await updateStartupTierAction({
        id: startup.id,
        slug: startup.slug,
        tier: newTier,
        isVerified: newTier === 'premium' ? true : startup.is_verified,
      });

      if (res.success) {
        setStartups((prev) =>
          prev.map((item) =>
            item.id === startup.id
              ? {
                  ...item,
                  tier: newTier,
                  is_featured: newTier !== 'free',
                  is_verified: newTier === 'premium' ? true : item.is_verified,
                }
              : item
          )
        );
        toast.add({
          type: 'success',
          title: 'Tier updated',
          description: `${startup.name} is now set to ${tierConfig[newTier].name}.`,
        });
      } else {
        toast.add({
          type: 'error',
          title: 'Update failed',
          description: res.error || 'Could not update tier.',
        });
      }
    } catch {
      toast.add({
        type: 'error',
        title: 'Error',
        description: 'Network error while updating tier.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleVerify = async (startup: StartupItem) => {
    setUpdatingId(startup.id);
    const nextVerify = !startup.is_verified;
    try {
      const res = await updateStartupTierAction({
        id: startup.id,
        slug: startup.slug,
        tier: startup.tier || 'free',
        isVerified: nextVerify,
      });

      if (res.success) {
        setStartups((prev) =>
          prev.map((item) => (item.id === startup.id ? { ...item, is_verified: nextVerify } : item))
        );
        toast.add({
          type: 'success',
          title: nextVerify ? 'Marked Verified' : 'Unverified',
          description: `${startup.name} verification status updated.`,
        });
      }
    } catch {
      toast.add({
        type: 'error',
        title: 'Error',
        description: 'Failed to toggle verification.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="py-10 sm:py-14">
      <Container className="space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Back to public site</span>
        </Link>

        <SectionHeader
          as="h1"
          eyebrow="Admin Portal"
          title="Listing Tiers & Slot Management"
          description="Control product tiers, monitor featured/premium slot capacities, and toggle verification badges."
        />

        {/* Slot Capacity Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-5 space-y-3 border-amber-200/80 bg-amber-50/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <Crown className="size-4 text-amber-600" aria-hidden="true" />
                Premium Slots
              </span>
              <Badge variant="warning" size="sm">
                Top Priority
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {premiumCount}
              </span>
              <span className="text-xs text-muted-foreground">
                / {slotLimits.premiumHomeTop} max home slots
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{
                  width: `${Math.min(100, (premiumCount / slotLimits.premiumHomeTop) * 100)}%`,
                }}
              />
            </div>
          </Card>

          <Card className="p-5 space-y-3 border-primary/20 bg-primary-soft/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                Featured Slots
              </span>
              <Badge variant="primary" size="sm">
                Rail Spotlight
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {featuredCount}
              </span>
              <span className="text-xs text-muted-foreground">
                / {slotLimits.heroFeaturedRail} hero rail slots
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${Math.min(100, (featuredCount / slotLimits.heroFeaturedRail) * 100)}%`,
                }}
              />
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="size-4 text-muted-foreground" aria-hidden="true" />
                Free Queue
              </span>
              <Badge variant="neutral" size="sm">
                Standard
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {freeCount}
              </span>
              <span className="text-xs text-muted-foreground">active free products</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Always unlimited capacity. Permanent profiles.
            </p>
          </Card>
        </div>

        {/* Search & Listing Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Showing {filtered.length} of {startups.length} products
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-subtle">
                  <th className="p-3.5 font-semibold text-foreground">Product</th>
                  <th className="p-3.5 font-semibold text-foreground">Category</th>
                  <th className="p-3.5 font-semibold text-foreground">Upvotes</th>
                  <th className="p-3.5 font-semibold text-foreground">Current Tier</th>
                  <th className="p-3.5 font-semibold text-foreground">Verified</th>
                  <th className="p-3.5 font-semibold text-foreground text-right">Quick Tier Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => {
                  const effective = getEffectiveTier(item);
                  const isBusy = updatingId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <StartupLogo
                            name={item.name}
                            logoUrl={item.logo_url}
                            websiteUrl={item.website_url}
                            size={32}
                          />
                          <div>
                            <span className="font-semibold text-foreground block">{item.name}</span>
                            <span className="text-[11px] text-muted-foreground line-clamp-1">
                              {item.tagline}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-foreground">{item.category}</td>

                      <td className="p-3.5 font-semibold text-foreground tabular-nums">
                        {item.upvotes || 0}
                      </td>

                      <td className="p-3.5">
                        <TierBadge tier={effective} isVerified={item.is_verified} size="sm" />
                      </td>

                      <td className="p-3.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          disabled={isBusy}
                          onClick={() => handleToggleVerify(item)}
                          className={item.is_verified ? 'text-success' : 'text-muted-foreground'}
                        >
                          {item.is_verified ? (
                            <ShieldCheck className="size-4" aria-hidden="true" />
                          ) : (
                            <ShieldAlert className="size-4" aria-hidden="true" />
                          )}
                          <span>{item.is_verified ? 'Yes' : 'No'}</span>
                        </Button>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            variant={effective === 'free' ? 'secondary' : 'ghost'}
                            size="xs"
                            disabled={isBusy || effective === 'free'}
                            onClick={() => handleTierChange(item, 'free')}
                          >
                            Free
                          </Button>
                          <Button
                            variant={effective === 'featured' ? 'primary' : 'outline'}
                            size="xs"
                            disabled={isBusy || effective === 'featured'}
                            onClick={() => handleTierChange(item, 'featured')}
                          >
                            Featured
                          </Button>
                          <Button
                            variant={effective === 'premium' ? 'primary' : 'outline'}
                            size="xs"
                            disabled={isBusy || effective === 'premium'}
                            onClick={() => handleTierChange(item, 'premium')}
                            className={effective === 'premium' ? 'bg-amber-600 border-amber-600' : ''}
                          >
                            Premium
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </main>
  );
}
