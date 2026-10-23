// components/ProductDetailInteractive.tsx
'use client';

import { useState } from 'react';
import { 
  ChevronUp, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  MessageCircle, 
  Flame, 
  CheckCircle2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { hexToRgba } from '@/lib/image-utils';

interface ProductDetailInteractiveProps {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  initialUpvotes: number;
  websiteUrl: string;
  brandColor?: string | null;
  twitterHandle?: string | null;
  category: string;
  badgeEmbedCode: string;
}

export default function ProductDetailInteractive({
  id,
  slug,
  name,
  tagline,
  initialUpvotes,
  websiteUrl,
  brandColor,
  twitterHandle,
  category,
  badgeEmbedCode,
}: ProductDetailInteractiveProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes || 1);
  const [hasVoted, setHasVoted] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [badgeTheme, setBadgeTheme] = useState<'dark' | 'light'>('dark');

  const brand = brandColor || '#f97316';

  const handleUpvote = async () => {
    if (hasVoted) return;
    setHasVoted(true);
    setUpvotes((prev) => prev + 1);

    try {
      await supabase
        .from('startups')
        .update({ upvotes: upvotes + 1 })
        .eq('id', id);
    } catch (err) {
      console.error('Failed to update upvote:', err);
    }
  };

  const handleCopyBadge = async () => {
    try {
      await navigator.clipboard.writeText(badgeEmbedCode);
      setCopiedBadge(true);
      setTimeout(() => setCopiedBadge(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/products/${slug}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/products/${slug}` : '';
  const shareText = `Check out ${name} — ${tagline} on Vinay Startup Platform!`;

  return (
    <div className="space-y-8">
      {/* Primary Action Bar (Visit, Upvote, Share) */}
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`${websiteUrl}?utm_source=vinay_startup`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Launch & Visit Website</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Big Upvote CTA */}
        <button
          onClick={handleUpvote}
          aria-label="Upvote this startup"
          className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border font-bold text-sm transition-all select-none ${
            hasVoted
              ? 'bg-orange-500 text-white border-orange-400 shadow-xl shadow-orange-500/40 scale-105'
              : 'bg-white/5 border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-white'
          }`}
        >
          <ChevronUp className={`w-5 h-5 transition-transform ${hasVoted ? 'text-white' : 'text-orange-400'}`} />
          <span>{hasVoted ? 'Upvoted!' : 'Upvote Product'}</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-xs font-black">
            {upvotes}
          </span>
        </button>

        {/* Copy Share Link */}
        <button
          onClick={handleCopyLink}
          title="Copy link to product"
          className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-slate-400" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Browser Mockup Preview Showcase */}
      <div 
        className="rounded-3xl border overflow-hidden shadow-2xl transition-all"
        style={{
          borderColor: hexToRgba(brand, 0.35),
          boxShadow: `0 20px 60px -20px ${hexToRgba(brand, 0.25)}`,
        }}
      >
        {/* Browser Top Navigation Header */}
        <div className="bg-[#121218] px-4 py-3 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
          </div>

          {/* Browser Address Bar */}
          <div className="flex-1 max-w-lg mx-auto bg-black/60 rounded-xl px-4 py-1.5 border border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-400/90 text-[11px]">https://</span>
              <span className="text-white text-[11px] truncate">
                {websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </span>
            </div>
            <a
              href={`${websiteUrl}?utm_source=vinay_startup`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors ml-2 shrink-0"
              title="Open in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px]">
              Live Preview Frame
            </span>
          </div>
        </div>

        {/* Inside the Browser Showcase Screen */}
        <div
          className="relative p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[340px]"
          style={{
            background: `radial-gradient(ellipse at center, ${hexToRgba(brand, 0.15)}, #0d0d12 70%)`,
          }}
        >
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-orange-400">
              <Sparkles className="w-3.5 h-3.5" /> Verified Product Experience
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Experience {name} Live
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {tagline}
            </p>
          </div>

          {/* Quick interactive action to test drive */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <a
              href={`${websiteUrl}?utm_source=vinay_startup`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-extrabold text-xs hover:bg-slate-200 transition-all shadow-lg hover:scale-105"
            >
              <span>Test Drive {name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleUpvote}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all border border-white/10"
            >
              <ChevronUp className="w-4 h-4 text-orange-400" />
              <span>Support with Upvote ({upvotes})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embed Badge & Sharing Utilities Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Dofollow Embed Badge Box */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Embed Official Launch Badge
              </h4>
              <p className="text-[11px] text-slate-400">
                Unlock an official dofollow backlink and showcase your launch status.
              </p>
            </div>
          </div>

          {/* Badge Preview */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/badge.svg"
              alt={`Featured on Vinay Startup`}
              className="h-10 w-auto shadow-md"
            />
            <span className="text-[10px] text-slate-500 font-mono">
              Live Badge Preview
            </span>
          </div>

          {/* Embed Code Snippet */}
          <div className="relative group">
            <pre className="p-3 bg-black/80 rounded-xl border border-white/10 font-mono text-[10px] text-orange-400/90 break-all select-all whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
              {badgeEmbedCode}
            </pre>
            <button
              onClick={handleCopyBadge}
              className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-md transition-all"
            >
              {copiedBadge ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy HTML</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share & Founder Shoutout */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-orange-400" /> Share {name}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Help {name} reach the #1 Product of the Day spot by sharing with your network.
            </p>
          </div>

          {/* Social Channels */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Share on X</span>
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current text-blue-400" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.91 0-1.64.73-1.64 1.64s.73 1.64 1.64 1.64 1.64-.73 1.64-1.64-.73-1.64-1.64-1.64" />
              </svg>
              <span>LinkedIn</span>
            </a>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-colors"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
            </button>
          </div>

          {twitterHandle && (
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Maker / Founder:</span>
              <a
                href={`https://twitter.com/${twitterHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:underline font-semibold"
              >
                @{twitterHandle.replace('@', '')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
