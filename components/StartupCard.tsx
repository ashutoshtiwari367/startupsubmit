// components/StartupCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ExternalLink,
  Medal,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { cn } from 'cn';
import StartupLogo from '@/components/StartupLogo';
import { UpvoteButton } from '@/components/UpvoteButton';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { TierBadge } from '@/components/tiers/TierBadge';
import { categoryHref } from '@/lib/site-config';
import { cleanDomain, outboundUrl, pricingTone } from '@/lib/format';
import { getEffectiveTier } from '@/lib/startups';
import type { StartupItem } from '@/lib/type';

export type { StartupItem };

interface StartupCardProps {
  startup: StartupItem;
  variant?: 'grid' | 'list' | 'featured';
  rank?: number;
  onUpvote?: (id: string, currentUpvotes: number) => void;
  className?: string;
}

function RankIndicator({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span
        aria-label="Rank 1"
        className="inline-flex h-6 min-w-7 items-center justify-center gap-0.5 rounded-md bg-gold-soft px-1.5 text-xs font-bold text-gold tabular-nums"
      >
        <Medal className="size-3.5" aria-hidden="true" />1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span
        aria-label="Rank 2"
        className="inline-flex h-6 min-w-7 items-center justify-center gap-0.5 rounded-md bg-silver-soft px-1.5 text-xs font-bold text-silver tabular-nums"
      >
        <Medal className="size-3.5" aria-hidden="true" />2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span
        aria-label="Rank 3"
        className="inline-flex h-6 min-w-7 items-center justify-center gap-0.5 rounded-md bg-bronze-soft px-1.5 text-xs font-bold text-bronze tabular-nums"
      >
        <Medal className="size-3.5" aria-hidden="true" />3
      </span>
    );
  }
  return (
    <span
      aria-label={`Rank ${rank}`}
      className="inline-flex h-6 min-w-7 items-center justify-center text-xs font-medium text-muted-foreground tabular-nums"
    >
      {rank}
    </span>
  );
}

export default function StartupCard({
  startup,
  variant = 'list',
  rank,
  onUpvote,
  className = '',
}: StartupCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/products/${startup.slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const tier = getEffectiveTier(startup);
  const domain = cleanDomain(startup.website_url);
  const priceVariant = pricingTone(startup.pricing_type);
  const isTopThree = rank !== undefined && rank >= 1 && rank <= 3;
  const isPremium = tier === 'premium';
  const isFeatured = tier === 'featured';
  const sponsorRel = tier === 'free' ? 'noopener' : 'sponsored noopener';

  /* ------------------------------------------------------------------------ */
  /* LIST / LEADERBOARD ROW                                                   */
  /* ------------------------------------------------------------------------ */
  if (variant === 'list') {
    return (
      <article
        className={cn(
          'group relative flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-[border-color,background-color,box-shadow] duration-150 sm:gap-4 sm:p-4',
          isPremium
            ? 'border-amber-300/80 bg-amber-50/25 hover:border-amber-400 hover:bg-amber-50/40 shadow-xs'
            : isFeatured
            ? 'border-primary/25 bg-primary-soft/20 hover:border-primary/45 hover:bg-primary-soft/30 shadow-xs'
            : isTopThree
            ? 'border-border-strong bg-card hover:border-border-strong hover:bg-subtle/60'
            : 'border-border bg-card hover:border-border-strong hover:bg-subtle/60',
          className
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          {rank !== undefined && (
            <div className="hidden w-8 shrink-0 justify-center sm:flex">
              <RankIndicator rank={rank} />
            </div>
          )}

          <Link
            href={`/products/${startup.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="shrink-0"
          >
            <StartupLogo
              name={startup.name}
              logoUrl={startup.logo_url}
              websiteUrl={startup.website_url}
              size={48}
            />
          </Link>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {rank !== undefined && (
                <span className="sm:hidden">
                  <RankIndicator rank={rank} />
                </span>
              )}
              <h3 className="text-[0.9375rem] font-semibold text-foreground">
                <Link
                  href={`/products/${startup.slug}`}
                  className="transition-colors hover:text-primary focus-visible:rounded-sm"
                >
                  {startup.name}
                </Link>
              </h3>
              <TierBadge tier={tier} isVerified={startup.is_verified} size="sm" />
              {domain && (
                <span className="hidden text-xs text-muted-foreground md:inline">
                  · {domain}
                </span>
              )}
            </div>

            <p className="line-clamp-1 text-sm text-muted-foreground">{startup.tagline}</p>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <Link
                href={categoryHref(startup.category)}
                className="inline-flex h-5 items-center rounded-full border border-border bg-subtle px-2 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                {startup.category}
              </Link>
              <Badge variant={priceVariant} size="sm">
                {startup.pricing_type}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Tooltip content={copied ? 'Copied!' : 'Copy link'}>
            <button
              type="button"
              onClick={handleShareClick}
              aria-label={`Copy link to ${startup.name}`}
              className="hidden size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
            >
              {copied ? (
                <Check className="size-4 text-success" aria-hidden="true" />
              ) : (
                <Share2 className="size-4" aria-hidden="true" />
              )}
            </button>
          </Tooltip>

          <Tooltip content={`Visit ${domain || startup.name}`}>
            <a
              href={outboundUrl(startup.website_url)}
              target="_blank"
              rel={sponsorRel}
              aria-label={`Visit ${startup.name} website`}
              className="hidden size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Tooltip>

          <UpvoteButton
            startupId={startup.id}
            startupName={startup.name}
            count={startup.upvotes}
            variant="vertical"
            onUpvote={onUpvote}
          />
        </div>
      </article>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* FEATURED / HERO RAIL CARD                                                */
  /* ------------------------------------------------------------------------ */
  if (variant === 'featured') {
    return (
      <article
        className={cn(
          'group relative flex flex-col justify-between gap-4 rounded-xl border p-5 transition-[border-color,box-shadow] duration-150 hover:shadow-md',
          isPremium
            ? 'border-amber-300/90 bg-amber-50/30 hover:border-amber-400'
            : 'border-primary/25 bg-primary-soft/35 hover:border-primary/50',
          className
        )}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <StartupLogo
                name={startup.name}
                logoUrl={startup.logo_url}
                websiteUrl={startup.website_url}
                size={48}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-base font-semibold text-foreground">
                    <Link href={`/products/${startup.slug}`} className="hover:text-primary">
                      {startup.name}
                    </Link>
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">{domain}</span>
              </div>
            </div>
            <TierBadge tier={tier} isVerified={startup.is_verified} size="sm" />
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {startup.tagline}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" size="sm">
              {startup.category}
            </Badge>
            <Badge variant={priceVariant} size="sm">
              {startup.pricing_type}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={outboundUrl(startup.website_url)}
              target="_blank"
              rel={sponsorRel}
              aria-label={`Visit ${startup.name} website`}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
            <UpvoteButton
              startupId={startup.id}
              startupName={startup.name}
              count={startup.upvotes}
              variant="inline"
              onUpvote={onUpvote}
            />
          </div>
        </div>
      </article>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* GRID CARD (directory / related products)                                 */
  /* ------------------------------------------------------------------------ */
  return (
    <article
      className={cn(
        'group flex flex-col justify-between rounded-xl border p-5 transition-[border-color,box-shadow] duration-150 hover:shadow-md',
        isPremium
          ? 'border-amber-300/80 bg-amber-50/20 hover:border-amber-400'
          : isFeatured
          ? 'border-primary/25 bg-primary-soft/15 hover:border-primary/45'
          : 'border-border bg-card hover:border-border-strong',
        className
      )}
    >
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/products/${startup.slug}`} tabIndex={-1} aria-hidden="true">
              <StartupLogo
                name={startup.name}
                logoUrl={startup.logo_url}
                websiteUrl={startup.website_url}
                size={44}
              />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {rank !== undefined && <RankIndicator rank={rank} />}
                <h3 className="truncate text-[0.9375rem] font-semibold text-foreground">
                  <Link href={`/products/${startup.slug}`} className="hover:text-primary">
                    {startup.name}
                  </Link>
                </h3>
              </div>
              {domain && <p className="truncate text-xs text-muted-foreground">{domain}</p>}
            </div>
          </div>

          <UpvoteButton
            startupId={startup.id}
            startupName={startup.name}
            count={startup.upvotes}
            variant="vertical"
            onUpvote={onUpvote}
          />
        </div>

        <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground">
          {startup.tagline}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={categoryHref(startup.category)}
            className="inline-flex h-5 items-center rounded-full border border-border bg-subtle px-2 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            {startup.category}
          </Link>
          <Badge variant={priceVariant} size="sm">
            {startup.pricing_type}
          </Badge>
          <TierBadge tier={tier} isVerified={startup.is_verified} size="sm" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />
          <span>Verified · Dofollow</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleShareClick}
            aria-label={`Copy link to ${startup.name}`}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? (
              <Check className="size-3.5 text-success" aria-hidden="true" />
            ) : (
              <Share2 className="size-3.5" aria-hidden="true" />
            )}
          </button>
          <a
            href={outboundUrl(startup.website_url)}
            target="_blank"
            rel={sponsorRel}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-foreground transition-colors hover:bg-muted"
          >
            <span>Visit</span>
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
