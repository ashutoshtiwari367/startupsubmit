import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from 'cn';
import type { StartupItem } from '@/lib/type';
import { outboundUrl } from '@/lib/format';
import { tierConfig } from '@/lib/site-config';

export function SponsoredBanner({
  item,
  className,
}: {
  item?: StartupItem | null;
  className?: string;
}) {
  if (item && (item.banner_title || item.banner_image)) {
    return (
      <aside
        aria-label="Sponsored product promotion"
        className={cn(
          'relative overflow-hidden rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 p-4 sm:p-5 shadow-xs',
          className
        )}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {item.banner_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.banner_image}
                alt=""
                className="size-12 rounded-lg object-cover border border-amber-200 shrink-0"
              />
            ) : (
              <span className="flex size-11 items-center justify-center rounded-lg bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-amber-200/70 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  Sponsored
                </span>
                <span className="text-xs font-semibold text-foreground truncate">
                  {item.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                {item.banner_title || item.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <Link
              href={`/products/${item.slug}`}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted"
            >
              <span>Learn more</span>
            </Link>
            <a
              href={outboundUrl(item.website_url)}
              target="_blank"
              rel="sponsored noopener"
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary-hover shadow-xs"
            >
              <span>Visit site</span>
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </aside>
    );
  }

  // Placeholder when no premium item has banner content
  return (
    <aside
      aria-label="Sponsorship advertisement"
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-dashed border-border-strong bg-subtle/80 px-4 py-3.5 text-xs text-muted-foreground',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border border-border">
          Sponsored
        </span>
        <span className="text-foreground font-medium">
          Promote your startup in this sponsored row with a banner and direct link.
        </span>
      </div>

      <Link
        href="/submit?plan=premium"
        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline shrink-0"
      >
        <span>Claim this spot ({tierConfig.premium.priceDisplay})</span>
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </aside>
  );
}

