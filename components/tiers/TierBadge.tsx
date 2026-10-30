import * as React from 'react';
import { CheckCircle2, Crown, Sparkles } from 'lucide-react';
import { cn } from 'cn';
import type { ListingTier } from '@/lib/type';

export function TierBadge({
  tier,
  isVerified = false,
  size = 'sm',
  className,
}: {
  tier?: ListingTier;
  isVerified?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  if (tier === 'premium') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs tabular-nums',
          size === 'sm' ? 'h-5 px-2 text-[0.6875rem]' : 'h-6 px-2.5 text-xs',
          className
        )}
      >
        <Crown className="size-3 text-amber-600 fill-amber-500/20" aria-hidden="true" />
        <span>Premium</span>
        {isVerified && (
          <CheckCircle2 className="size-3 text-amber-700 ml-0.5" aria-hidden="true" />
        )}
      </span>
    );
  }

  if (tier === 'featured') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 font-medium rounded-full bg-primary-soft text-primary-soft-foreground border border-primary/20 shadow-xs',
          size === 'sm' ? 'h-5 px-2 text-[0.6875rem]' : 'h-6 px-2.5 text-xs',
          className
        )}
      >
        <Sparkles className="size-3 text-primary" aria-hidden="true" />
        <span>Featured</span>
      </span>
    );
  }

  // Free (default)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full bg-muted text-muted-foreground border border-border',
        size === 'sm' ? 'h-5 px-2 text-[0.6875rem]' : 'h-6 px-2.5 text-xs',
        className
      )}
    >
      <span>Free</span>
    </span>
  );
}

