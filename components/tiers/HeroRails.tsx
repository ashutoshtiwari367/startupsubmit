import * as React from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles, Zap } from 'lucide-react';
import { cn } from 'cn';
import type { StartupItem } from '@/lib/type';
import StartupLogo from '@/components/StartupLogo';
import { UpvoteButton } from '@/components/UpvoteButton';
import { TierBadge } from '@/components/tiers/TierBadge';
import { EmptySlotCard } from '@/components/tiers/EmptySlotCard';
import { getEffectiveTier } from '@/lib/startups';
import { outboundUrl } from '@/lib/format';

interface HeroRailsProps {
  featured: StartupItem[];
  justListed: StartupItem[];
  onUpvote?: (id: string, currentUpvotes: number) => void;
  className?: string;
}

function CompactRailCard({
  item,
  onUpvote,
}: {
  item: StartupItem;
  onUpvote?: (id: string, currentUpvotes: number) => void;
}) {
  const tier = getEffectiveTier(item);

  return (
    <article className="group relative flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs hover:border-border-strong hover:bg-subtle/60 transition-all">
      <div className="flex min-w-0 items-center gap-2.5 flex-1">
        <Link href={`/products/${item.slug}`} className="shrink-0" tabIndex={-1}>
          <StartupLogo
            name={item.name}
            logoUrl={item.logo_url}
            websiteUrl={item.website_url}
            size={40}
          />
        </Link>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs font-semibold text-foreground truncate max-w-[130px]">
              <Link href={`/products/${item.slug}`} className="hover:text-primary">
                {item.name}
              </Link>
            </h4>
            <TierBadge tier={tier} isVerified={item.is_verified} size="sm" />
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {item.tagline}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <a
          href={outboundUrl(item.website_url)}
          target="_blank"
          rel={tier === 'free' ? 'noopener' : 'sponsored noopener'}
          aria-label={`Visit ${item.name}`}
          className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
        <UpvoteButton
          startupId={item.id}
          startupName={item.name}
          count={item.upvotes}
          variant="inline"
          onUpvote={onUpvote}
        />
      </div>
    </article>
  );
}

export function HeroRails({
  featured,
  justListed,
  onUpvote,
  className,
}: HeroRailsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-2 gap-6 w-full pt-6',
        className
      )}
    >
      {/* Left Rail: Featured Spotlights */}
      <section
        aria-label="Featured startup spotlights"
        className="flex flex-col gap-2.5 rounded-2xl border border-border bg-subtle/50 p-4"
      >
        <div className="flex items-center justify-between px-1 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="flex size-5 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Sparkles className="size-3" aria-hidden="true" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Featured Launches
            </span>
          </div>
          <Link
            href="/submit?plan=featured"
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Get spotlighted →
          </Link>
        </div>

        <div className="space-y-2">
          {featured.map((item) => (
            <CompactRailCard key={item.id} item={item} onUpvote={onUpvote} />
          ))}
          <EmptySlotCard
            tier="featured"
            title="Your product here"
            subtitle="Get featured placement · from ₹999"
            compact
          />
        </div>
      </section>

      {/* Right Rail: Just Listed */}
      <section
        aria-label="Just listed startups"
        className="flex flex-col gap-2.5 rounded-2xl border border-border bg-subtle/50 p-4"
      >
        <div className="flex items-center justify-between px-1 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="flex size-5 items-center justify-center rounded-md bg-amber-100 text-amber-800">
              <Zap className="size-3" aria-hidden="true" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Just Listed
            </span>
          </div>
          <Link
            href="/directory?sort=newest"
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            View all new →
          </Link>
        </div>

        <div className="space-y-2">
          {justListed.map((item) => (
            <CompactRailCard key={item.id} item={item} onUpvote={onUpvote} />
          ))}
          <EmptySlotCard
            tier="free"
            title="Launch for free today"
            subtitle="Join the directory & AI index in 2 minutes"
            compact
          />
        </div>
      </section>
    </div>
  );
}

