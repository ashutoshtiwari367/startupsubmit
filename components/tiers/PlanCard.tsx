import * as React from 'react';
import { Check, Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from 'cn';
import { tierConfig } from '@/lib/site-config';
import type { ListingTier } from '@/lib/type';
import { Badge } from '@/components/ui/badge';

export function PlanCard({
  tier,
  selected,
  onSelect,
  className,
}: {
  tier: ListingTier;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}) {
  const plan = tierConfig[tier];
  if (!plan) return null;

  const Icon =
    tier === 'premium' ? Crown : tier === 'featured' ? Sparkles : ShieldCheck;

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'relative flex flex-col justify-between rounded-xl border p-5 cursor-pointer transition-[border-color,box-shadow,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring select-none',
        selected
          ? 'border-primary bg-primary-soft/40 ring-2 ring-primary/20 shadow-sm'
          : 'border-border bg-card hover:border-border-strong hover:bg-subtle/50',
        className
      )}
    >
      {plan.highlighted && (
        <div className="absolute -top-2.5 right-4">
          <Badge variant="primary" size="sm" className="shadow-xs font-semibold">
            Recommended
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-lg border',
                tier === 'premium'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : tier === 'featured'
                  ? 'border-primary/20 bg-primary-soft text-primary'
                  : 'border-border bg-muted text-muted-foreground'
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="font-semibold text-sm text-foreground">{plan.name}</span>
          </div>

          <div className="text-right">
            <span className="text-base font-bold text-foreground tabular-nums">
              {plan.priceDisplay}
            </span>
            <span className="text-[11px] text-muted-foreground block">
              /{plan.period}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {plan.description}
        </p>

        <ul className="space-y-1.5 border-t border-border pt-3">
          {plan.features.slice(0, 4).map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="size-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
        <span className={cn('font-medium', selected ? 'text-primary' : 'text-muted-foreground')}>
          {selected ? 'Selected plan' : 'Click to select'}
        </span>
        <div
          className={cn(
            'size-4 rounded-full border flex items-center justify-center transition-colors',
            selected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border-strong bg-card'
          )}
        >
          {selected && <div className="size-1.5 rounded-full bg-white" />}
        </div>
      </div>
    </div>
  );
}

