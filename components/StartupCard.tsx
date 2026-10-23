// components/StartupCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ExternalLink, 
  ChevronUp, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  Check, 
  Globe, 
  Crown,
  Flame,
  Tag
} from 'lucide-react';
import StartupLogo from '@/components/StartupLogo';
import { hexToRgba } from '@/lib/image-utils';

export interface StartupItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  pricing_type: string;
  upvotes: number;
  website_url: string;
  is_featured: boolean;
  logo_url?: string | null;
  banner_url?: string | null;
  brand_color?: string | null;
  description?: string;
  twitter_handle?: string | null;
  status?: string;
  created_at?: string;
}

interface StartupCardProps {
  startup: StartupItem;
  variant?: 'grid' | 'list' | 'featured';
  rank?: number;
  onUpvote?: (id: string, currentUpvotes: number) => void;
  className?: string;
}

/** Product Visual Banner Component - Shows uploaded image in full or real screenshot / brand preview */
function ProductBannerImage({ 
  url, 
  name, 
  brand, 
  logoUrl,
  category,
  isFeatured
}: { 
  url: string; 
  name: string; 
  brand: string; 
  logoUrl?: string | null; 
  category?: string;
  isFeatured?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const screenshotUrl = `https://image.thum.io/get/width/800/crop/480/${url}`;
  const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-[#09090e] border-b border-white/10 group-hover:border-orange-500/30 transition-all">
      {/* Dynamic Ambient Glow matching brand */}
      <div 
        className="absolute inset-0 opacity-40 group-hover:opacity-75 transition-opacity pointer-events-none z-10"
        style={{
          background: `radial-gradient(ellipse at center, ${hexToRgba(brand, 0.45)}, transparent 75%)`
        }}
      />

      {/* Top Floating Browser Controls & Category Badge */}
      <div className="absolute top-3 inset-x-3.5 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <span className="w-2 h-2 rounded-full bg-red-500/90 inline-block shadow-sm shadow-red-500/50" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/90 inline-block shadow-sm shadow-yellow-500/50" />
          <span className="w-2 h-2 rounded-full bg-green-500/90 inline-block shadow-sm shadow-green-500/50" />
          <span className="text-[10px] font-mono text-slate-300 ml-1 truncate max-w-[120px]">
            {cleanUrl}
          </span>
        </div>

        {isFeatured ? (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/90 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-orange-500/30 backdrop-blur-md">
            <Sparkles className="w-3 h-3 fill-white" /> Featured
          </span>
        ) : category ? (
          <span className="text-[10px] font-semibold text-slate-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            {category}
          </span>
        ) : null}
      </div>

      {logoUrl ? (
        /* Full Image Section - Uploaded image fills the container in full */
        <div className="relative w-full h-full overflow-hidden bg-[#0b0b10]">
          {/* Ambient blurred backdrop to prevent harsh cutoffs */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-35 pointer-events-none"
          />
          {/* Full Cover Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={`${name} showcase`}
            className="relative z-10 w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
      ) : !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={screenshotUrl}
          alt={`${name} product interface preview`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
      ) : (
        /* Fallback rich visual brand mockup image with browser top bar */
        <div
          className="w-full h-full flex flex-col justify-between p-4 relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at top right, ${hexToRgba(brand, 0.4)}, #0a0a0f 85%)`,
          }}
        >
          <div className="flex items-center justify-between opacity-70 pt-8">
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              Live Product
            </span>
          </div>
          <div className="text-center py-4">
            <span className="text-sm font-mono text-slate-200 font-bold truncate block">
              {cleanUrl}
            </span>
          </div>
        </div>
      )}

      {/* Bottom gradient shadow transitioning into the card body */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/50 to-transparent pointer-events-none z-10" />
    </div>
  );
}

export default function StartupCard({
  startup,
  variant = 'grid',
  rank,
  onUpvote,
  className = '',
}: StartupCardProps) {
  const [copied, setCopied] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(startup.upvotes || 0);

  const brand = startup.brand_color || '#f97316';

  const handleVoteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVoted) return;

    setHasVoted(true);
    setVoteCount((prev) => prev + 1);
    if (onUpvote) {
      onUpvote(startup.id, voteCount);
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/products/${startup.slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Pricing badge color mapping
  const getPricingBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('free')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (t.includes('freemium')) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  };

  // Rank badge styling for top 3
  const getRankBadge = (pos?: number) => {
    if (!pos) return null;
    if (pos === 1) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black border border-amber-500/30">
          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" /> #1
        </span>
      );
    }
    if (pos === 2) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-300/20 text-slate-200 text-[11px] font-black border border-slate-300/30">
          🥈 #2
        </span>
      );
    }
    if (pos === 3) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-500 text-[11px] font-black border border-amber-700/30">
          🥉 #3
        </span>
      );
    }
    return (
      <span className="text-xs font-bold text-slate-500 w-6 text-center">
        #{pos}
      </span>
    );
  };

  /* ========================================================================= */
  /* VARIANT 1: FEATURED SHOWCASE HERO CARD                                    */
  /* ========================================================================= */
  if (variant === 'featured') {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl bg-[#0f0f16] border transition-all duration-300 group hover:shadow-2xl hover:scale-[1.01] ${className}`}
        style={{
          borderColor: hexToRgba(brand, 0.4),
          boxShadow: `0 12px 40px -15px ${hexToRgba(brand, 0.25)}`,
        }}
      >
        {/* Dynamic Top Ambient Header Gradient */}
        <div
          className="absolute inset-x-0 top-0 h-32 opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${hexToRgba(brand, 0.35)}, transparent)`,
          }}
        />

        <div className="relative p-6 sm:p-7 flex flex-col justify-between h-full gap-5">
          {/* Card Top Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <StartupLogo
                name={startup.name}
                logoUrl={startup.logo_url}
                websiteUrl={startup.website_url}
                brandColor={brand}
                size={58}
                className="group-hover:scale-105 transition-transform shadow-lg"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/products/${startup.slug}`}
                    className="font-black text-lg sm:text-xl text-white group-hover:text-orange-400 transition-colors"
                  >
                    {startup.name}
                  </Link>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Sparkles className="w-2.5 h-2.5" /> Featured
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Verified
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {startup.tagline}
                </p>
              </div>
            </div>

            {/* Upvote Button */}
            <button
              onClick={handleVoteClick}
              aria-label="Upvote startup"
              className={`flex flex-col items-center justify-center min-w-[58px] h-16 rounded-2xl border transition-all shrink-0 select-none ${
                hasVoted
                  ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/40 scale-105'
                  : 'bg-white/5 border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-white'
              }`}
            >
              <ChevronUp className={`w-5 h-5 transition-transform ${hasVoted ? 'text-white' : 'text-orange-400'}`} />
              <span className="text-xs font-black tracking-tight">{voteCount}</span>
            </button>
          </div>

          {/* Mini Browser Bar / Interactive Preview Teaser */}
          <div className="rounded-xl bg-black/40 border border-white/10 p-3 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70 inline-block" />
              </div>
              <div className="h-4 w-px bg-white/10 mx-1 shrink-0" />
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate font-mono text-[11px] text-slate-300">
                {startup.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPricingBadge(startup.pricing_type)}`}>
                {startup.pricing_type}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                {startup.category}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <Link
              href={`/products/${startup.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors group/link"
            >
              <span>Explore Product Profile</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform text-orange-400" />
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareClick}
                title="Copy share link"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>

              <a
                href={`${startup.website_url}?utm_source=vinay_startup`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-orange-500 text-white font-bold text-xs transition-all shadow-sm hover:shadow-orange-500/20"
              >
                <span>Visit Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* VARIANT 2: LIST / LEADERBOARD ROW                                         */
  /* ========================================================================= */
  if (variant === 'list') {
    return (
      <div
        className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#0d0d12] border border-white/5 hover:border-orange-500/30 hover:bg-[#121218] transition-all group shadow-md hover:shadow-xl ${className}`}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Rank Position */}
          {rank !== undefined && (
            <div className="shrink-0 flex items-center justify-center">
              {getRankBadge(rank)}
            </div>
          )}

          {/* Logo with Brand Border and Auto-Domain Favicon */}
          <StartupLogo
            name={startup.name}
            logoUrl={startup.logo_url}
            websiteUrl={startup.website_url}
            brandColor={brand}
            size={46}
            className="group-hover:scale-105 transition-transform shrink-0"
          />

          {/* Text Info */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/products/${startup.slug}`}
                className="font-bold text-sm sm:text-base text-white hover:text-orange-400 transition-colors truncate"
              >
                {startup.name}
              </Link>
              {startup.is_featured && (
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Featured
                </span>
              )}
              <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 font-medium">
                {startup.category}
              </span>
              <span className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getPricingBadge(startup.pricing_type)}`}>
                {startup.pricing_type}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1 leading-snug">
              {startup.tagline}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
          {/* Quick External Link */}
          <a
            href={`${startup.website_url}?utm_source=vinay_startup`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open website"
            className="hidden sm:inline-flex p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* View Details Link */}
          <Link
            href={`/products/${startup.slug}`}
            title="View product details"
            className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3 text-orange-400" />
          </Link>

          {/* Upvote Button */}
          <button
            onClick={handleVoteClick}
            aria-label="Upvote startup"
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border text-xs font-bold transition-all select-none ${
              hasVoted
                ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/30 scale-105'
                : 'bg-white/5 border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-white'
            }`}
          >
            <ChevronUp className={`w-3.5 h-3.5 ${hasVoted ? 'text-white' : 'text-orange-400'}`} />
            <span>{voteCount}</span>
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* VARIANT 3: DEFAULT GRID CARD (RICH PRODUCT CARD WITH BRAND IMAGE)         */
  /* ========================================================================= */
  return (
    <div
      className={`relative overflow-hidden flex flex-col justify-between rounded-3xl bg-[#0d0d12] border transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl ${className}`}
      style={{
        borderColor: hexToRgba(brand, 0.22),
        boxShadow: `0 10px 30px -15px ${hexToRgba(brand, 0.2)}`,
      }}
    >
      {/* Top Ambient Highlight Gradient */}
      <div
        className="absolute inset-x-0 top-0 h-28 opacity-40 group-hover:opacity-80 transition-opacity pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(brand, 0.25)}, transparent)`,
        }}
      />

      {/* Brand Product Visual Banner Image - Full Bleed Edge to Edge */}
      <ProductBannerImage
        url={startup.website_url}
        name={startup.name}
        brand={brand}
        logoUrl={startup.banner_url || startup.logo_url}
        category={startup.category}
        isFeatured={startup.is_featured}
      />

      <div className="relative p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3.5">
          {/* Header: Logo, Title, Badges */}
          <div className="flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <StartupLogo
                name={startup.name}
                logoUrl={startup.logo_url}
                websiteUrl={startup.website_url}
                brandColor={brand}
                size={44}
                className="group-hover:scale-105 transition-transform shrink-0 shadow-md rounded-2xl ring-1 ring-white/10"
              />
              <div className="space-y-1 min-w-0">
                <Link
                  href={`/products/${startup.slug}`}
                  className="font-black text-base text-white group-hover:text-orange-400 transition-colors truncate block leading-snug"
                >
                  {startup.name}
                </Link>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getPricingBadge(startup.pricing_type)}`}>
                    {startup.pricing_type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {startup.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Upvote Pill */}
            <button
              onClick={handleVoteClick}
              aria-label="Upvote startup"
              className={`flex flex-col items-center justify-center min-w-[46px] h-12 rounded-xl border transition-all shrink-0 select-none ${
                hasVoted
                  ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/40 scale-105'
                  : 'bg-white/5 border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-white'
              }`}
            >
              <ChevronUp className={`w-3.5 h-3.5 ${hasVoted ? 'text-white' : 'text-orange-400'}`} />
              <span className="text-xs font-black">{voteCount}</span>
            </button>
          </div>

          {/* Tagline / Value Proposition */}
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed min-h-[34px]">
            {startup.tagline}
          </p>
        </div>

        {/* Product Trust Footnote / AI Indexed */}
        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Product • Dofollow Backlink</span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="relative flex items-center justify-between p-3.5 px-4 sm:px-5 bg-black/30 border-t border-white/5">
        <Link
          href={`/products/${startup.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors group/view"
        >
          <span>View Product</span>
          <ArrowRight className="w-3 h-3 text-orange-400 group-hover/view:translate-x-1 transition-transform" />
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareClick}
            title="Share Product"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
          </button>

          <a
            href={`${startup.website_url}?utm_source=vinay_startup`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-orange-500 border border-white/10 hover:border-orange-400 text-white text-xs font-semibold transition-all"
          >
            <span>Launch</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
