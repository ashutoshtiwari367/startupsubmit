'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ListingTier } from '@/lib/type';
import { tierConfig } from '@/lib/site-config';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(slug: string) {
  return () => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem('my_startups');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.includes(slug);
    } catch {
      return false;
    }
  };
}

const getServerSnapshot = () => false;

export function OwnerUpgradeCard({
  slug,
  name,
  tier = 'free',
  expiresAt,
}: {
  slug: string;
  name: string;
  tier?: ListingTier;
  expiresAt?: string | null;
}) {
  const isOwner = React.useSyncExternalStore(
    subscribe,
    React.useMemo(() => getSnapshot(slug), [slug]),
    getServerSnapshot
  );

  if (!isOwner) {
    return null;
  }

  const isFree = tier === 'free';
  const plan = tierConfig[tier] || tierConfig.free;

  return (
    <Card className="p-5 space-y-3.5 border-primary/30 bg-primary-soft/30 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption font-semibold uppercase tracking-wider text-primary">
          Maker Controls
        </span>
        <Badge variant={isFree ? 'neutral' : 'primary'} size="sm">
          {plan.name}
        </Badge>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          {isFree ? `Boost ${name}'s launch` : `${name} is in ${plan.name}`}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isFree
            ? 'Your product is currently on the Free tier. Upgrade to Featured or Premium to lock in top spots across hero rails and category pages.'
            : expiresAt
            ? `Your active boost expires on ${new Date(expiresAt).toLocaleDateString()}. Renew or manage anytime in your dashboard.`
            : 'Your boost is active with high priority ranking.'}
        </p>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        {isFree ? (
          <Link
            href={`/submit?plan=featured&slug=${slug}`}
            className={buttonVariants({ variant: 'primary', size: 'sm', className: 'w-full' })}
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            <span>Upgrade this listing</span>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'w-full' })}
          >
            <TrendingUp className="size-3.5" aria-hidden="true" />
            <span>Manage in Dashboard</span>
          </Link>
        )}
      </div>
    </Card>
  );
}

