import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { cn } from 'cn';
import { tierConfig } from '@/lib/site-config';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComparisonRow {
  feature: string;
  free: boolean | string;
  featured: boolean | string;
  premium: boolean | string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'Launch Queue & Review', free: '3-5 Days', featured: '24 Hours', premium: 'Guaranteed Live' },
  { feature: 'Permanent Product Page', free: true, featured: true, premium: true },
  { feature: 'Community Upvotes & Ranking', free: true, featured: true, premium: true },
  { feature: 'Included in /llms.txt AI Index', free: true, featured: true, premium: true },
  { feature: 'Dofollow Backlink', free: 'Badge required', featured: 'Immediate (No badge)', premium: 'Immediate (No badge)' },
  { feature: 'Featured Rail & Top Category Placement', free: false, featured: true, premium: true },
  { feature: 'Verified Maker & Product Badge', free: false, featured: false, premium: true },
  { feature: 'Guaranteed #1 Tier Lineup Position', free: false, featured: false, premium: true },
  { feature: 'Sponsored Banner Row Inclusion', free: false, featured: false, premium: true },
  { feature: 'Social Shoutout (X & LinkedIn)', free: false, featured: 'Weekly digest', premium: 'Dedicated post' },
];

export function PricingTable({ className }: { className?: string }) {
  const plans = [tierConfig.free, tierConfig.featured, tierConfig.premium];

  return (
    <div className={cn('space-y-12', className)}>
      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((p) => (
          <Card
            key={p.id}
            className={cn(
              'relative flex flex-col justify-between p-6 sm:p-7 transition-all',
              p.highlighted && 'border-primary ring-2 ring-primary/20 shadow-md'
            )}
          >
            {p.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="primary" size="sm" className="font-semibold shadow-xs">
                  Most Popular
                </Badge>
              </div>
            )}

            <div className="space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-h3">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 border-y border-border py-4">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground tabular-nums">
                  {p.priceDisplay}
                </span>
                <span className="text-xs text-muted-foreground">/{p.period}</span>
              </div>

              <div className="space-y-2.5">
                <span className="text-caption font-semibold text-foreground uppercase tracking-wider block">
                  Included:
                </span>
                <ul className="space-y-2">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs text-muted-foreground leading-normal">
                      <Check className="size-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href={`/submit?plan=${p.id}`}
                className={buttonVariants({
                  variant: p.highlighted ? 'primary' : 'secondary',
                  size: 'md',
                  className: 'w-full',
                })}
              >
                <span>{p.cta}</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Feature Comparison Table */}
      <div className="space-y-4">
        <h3 className="text-h3 text-center sm:text-left">Feature comparison</h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-subtle">
                <th className="p-3.5 sm:p-4 font-semibold text-foreground">Feature</th>
                <th className="p-3.5 sm:p-4 font-semibold text-foreground text-center">Free</th>
                <th className="p-3.5 sm:p-4 font-semibold text-primary text-center">Featured</th>
                <th className="p-3.5 sm:p-4 font-semibold text-amber-700 text-center">Premium Launch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} className="hover:bg-subtle/50 transition-colors">
                  <td className="p-3.5 sm:p-4 font-medium text-foreground">{row.feature}</td>
                  <td className="p-3.5 sm:p-4 text-center text-muted-foreground">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <Check className="size-4 text-success inline-block" />
                      ) : (
                        <Minus className="size-4 text-muted-foreground/40 inline-block" />
                      )
                    ) : (
                      <span>{row.free}</span>
                    )}
                  </td>
                  <td className="p-3.5 sm:p-4 text-center font-medium text-foreground">
                    {typeof row.featured === 'boolean' ? (
                      row.featured ? (
                        <Check className="size-4 text-primary inline-block" />
                      ) : (
                        <Minus className="size-4 text-muted-foreground/40 inline-block" />
                      )
                    ) : (
                      <span>{row.featured}</span>
                    )}
                  </td>
                  <td className="p-3.5 sm:p-4 text-center font-semibold text-amber-800">
                    {typeof row.premium === 'boolean' ? (
                      row.premium ? (
                        <Check className="size-4 text-amber-700 inline-block" />
                      ) : (
                        <Minus className="size-4 text-muted-foreground/40 inline-block" />
                      )
                    ) : (
                      <span>{row.premium}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

