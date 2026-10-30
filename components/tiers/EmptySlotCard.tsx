import * as React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from 'cn';
import { tierConfig } from '@/lib/site-config';
import type { ListingTier } from '@/lib/type';

export function EmptySlotCard({
  tier = 'featured',
  title = 'Your product here',
  subtitle,
  compact = false,
  className,
}: {
  tier?: ListingTier;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
}) {
  const cfg = tierConfig[tier] || tierConfig.featured;
  const sub = subtitle || `Get ${cfg.name} placement · from ${cfg.priceDisplay}`;

  return (
    <Link
      href={`/submit?plan=${tier}`}
      className={cn(
        'group flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border-strong bg-subtle/70 transition-[border-color,background-color,transform] duration-150 hover:border-primary hover:bg-primary-soft/30 hover:-translate-y-0.5',
        compact ? 'p-3.5 gap-1.5' : 'p-5 gap-2.5 min-h-[110px]',
        className
      )}
    >
      <span className="flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground shadow-xs">
        <Plus className="size-3.5" aria-hidden="true" />
      </span>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-foreground group-hover:text-primary">
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {sub}
        </p>
      </div>
    </Link>
  );
}

