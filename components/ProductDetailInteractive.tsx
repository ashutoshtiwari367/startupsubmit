// components/ProductDetailInteractive.tsx
'use client';

import { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UpvoteButton } from '@/components/UpvoteButton';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cleanDomain, outboundUrl } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';

interface ProductDetailInteractiveProps {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  initialUpvotes: number;
  websiteUrl: string;
  bannerUrl?: string | null;
  twitterHandle?: string | null;
  badgeEmbedCode: string;
}

/** Header action bar: Visit website, Upvote, Share. */
export function ProductActionBar({
  id,
  slug,
  name,
  initialUpvotes,
  websiteUrl,
}: {
  id: string;
  slug: string;
  name: string;
  initialUpvotes: number;
  websiteUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/products/${slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <a
        href={outboundUrl(websiteUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({
          variant: 'primary',
          size: 'md',
          className: 'h-11 px-5',
        })}
      >
        <span>Visit website</span>
        <ExternalLink className="size-4" aria-hidden="true" />
      </a>

      <UpvoteButton
        startupId={id}
        startupName={name}
        count={initialUpvotes}
        variant="hero"
      />

      <Button
        variant="secondary"
        size="md"
        onClick={handleCopyLink}
        className="h-11"
        aria-label="Copy link to product page"
      >
        {copied ? (
          <>
            <Check className="size-4 text-success" aria-hidden="true" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Share2 className="size-4" aria-hidden="true" />
            <span>Share</span>
          </>
        )}
      </Button>
    </div>
  );
}

/** Browser-framed product screenshot / preview + share & embed cards. */
export default function ProductDetailInteractive({
  slug,
  name,
  tagline,
  websiteUrl,
  bannerUrl,
  twitterHandle,
  badgeEmbedCode,
}: ProductDetailInteractiveProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const domain = cleanDomain(websiteUrl);
  const screenshotSrc =
    bannerUrl || `https://image.thum.io/get/width/1200/crop/720/${websiteUrl}`;
  const pageUrl = `${siteConfig.url}/products/${slug}`;
  const shareText = `Check out ${name} — ${tagline} on ${siteConfig.name}`;

  const copyBadge = async () => {
    try {
      await navigator.clipboard.writeText(badgeEmbedCode);
      setCopiedBadge(true);
      setTimeout(() => setCopiedBadge(false), 2000);
    } catch {
      // ignore
    }
  };

  const copyLink = async () => {
    try {
      const url = typeof window !== 'undefined' ? `${window.location.origin}/products/${slug}` : pageUrl;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Browser preview frame */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-subtle px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
          </div>

          <div className="flex max-w-md flex-1 items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 truncate">
              <ShieldCheck className="size-3.5 shrink-0 text-success" aria-hidden="true" />
              <span className="truncate text-foreground">{domain || websiteUrl}</span>
            </span>
            <a
              href={outboundUrl(websiteUrl)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${name} in new tab`}
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>

          <span className="hidden text-xs text-muted-foreground sm:inline">Preview</span>
        </div>

        <div className="relative aspect-[16/10] w-full bg-subtle">
          {!imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screenshotSrc}
              alt={`${name} product preview`}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="size-full object-cover object-top"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-h3">{name}</p>
              <p className="max-w-md text-sm text-muted-foreground">{tagline}</p>
              <a
                href={outboundUrl(websiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                <span>Open live website</span>
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Badge embed + Social share */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
              <span>Embed official launch badge</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Add this badge to your site to verify your reciprocal dofollow backlink.
            </p>
          </div>

          <div className="flex items-center justify-center rounded-lg border border-border bg-subtle p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/badge.svg"
              alt={`Featured on ${siteConfig.name}`}
              width={230}
              height={50}
              className="h-11 w-auto"
            />
          </div>

          <div className="relative">
            <pre className="max-h-24 overflow-x-auto rounded-lg border border-border bg-subtle p-3 font-mono text-[11px] leading-relaxed text-foreground select-all">
              {badgeEmbedCode}
            </pre>
            <Button
              variant="secondary"
              size="xs"
              onClick={copyBadge}
              className="absolute top-2 right-2"
            >
              {copiedBadge ? (
                <>
                  <Check className="size-3 text-success" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" aria-hidden="true" />
                  <span>Copy HTML</span>
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 gap-4">
          <div className="space-y-1">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Share2 className="size-4 text-primary" aria-hidden="true" />
              <span>Share {name}</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Help {name} climb this week&apos;s launch leaderboard by sharing with your network.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              <span>Share on X</span>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              <span>LinkedIn</span>
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              <MessageCircle className="size-3.5 text-success" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
            <Button variant="secondary" size="sm" onClick={copyLink}>
              {copiedLink ? (
                <>
                  <Check className="size-3.5 text-success" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" aria-hidden="true" />
                  <span>Copy link</span>
                </>
              )}
            </Button>
          </div>

          {twitterHandle && (
            <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span>Maker</span>
              <a
                href={`https://twitter.com/${twitterHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                @{twitterHandle.replace('@', '')}
              </a>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
