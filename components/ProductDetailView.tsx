"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowBigUp,
  ExternalLink,
  MessageSquare,
  Award,
  Crown,
  Calendar,
  Globe,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Heart,
  CornerDownRight,
  Send,
  Zap,
  TrendingUp,
  Flame,
  Star,
  Layers,
  Lock,
} from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Pill } from "./Pill";
import { ProductCard } from "./ProductCard";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ProductReviewsSection } from "./ProductReviewsSection";
import { ProductCommentsSection } from "./ProductCommentsSection";
import type { ApprovedListing } from "@/lib/listings";
import { getSafeInitials } from "@/lib/utils";

export { getSafeInitials };

export interface CommentItem {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    isMaker?: boolean;
    role?: string;
  };
  text: string;
  timestamp: string;
  upvotes: number;
  isUpvoted?: boolean;
  replies?: CommentItem[];
}

function isValidHttpUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getHostname(url?: string | null): string {
  if (!url) return "official-site.com";
  try {
    const parsed = new URL(url.trim());
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "official-site.com";
  }
}

function formatPricing(model?: string): "Free" | "Freemium" | "Paid" | "One-time" {
  switch (model?.toLowerCase().trim()) {
    case "free":
      return "Free";
    case "freemium":
      return "Freemium";
    case "paid":
    case "premium":
      return "Paid";
    case "one_time":
      return "One-time";
    default:
      return "Freemium";
  }
}

export function formatPricingLabelWithDetails(listing?: ApprovedListing): string {
  if (!listing) return "Freemium";
  const base = formatPricing(listing.pricing_model);
  if (base === "Free" || !listing.starting_price) return base;
  const period =
    listing.billing_period === "one_time"
      ? "one-time"
      : listing.billing_period === "yearly"
      ? "yr"
      : "mo";
  if (base === "Freemium") {
    return `Freemium (From $${listing.starting_price}/${period})`;
  }
  return `Paid ($${listing.starting_price}/${period})`;
}

function formatLaunchDate(dateStr?: string | null): string {
  if (!dateStr) return "Nov 9, 2026 (Today)";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently Launched";
  }
}

export interface ProductDetailViewProps {
  productId?: string;
  listing?: ApprovedListing;
  similarListings?: ApprovedListing[];
  currentUserId?: string | null;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId = "p-1",
  listing,
  similarListings = [],
  currentUserId = null,
}) => {
  const emailUser = (listing?.submitted_by_email || "").split("@")[0].trim();
  const founderName = emailUser
    ? emailUser.replace(/[._+-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim()
    : "Maker";
  const founderHandle = emailUser
    ? `@${emailUser.replace(/[^a-zA-Z0-9_]/g, "")}`
    : "@maker";

  const product = listing
    ? {
        id: listing.slug,
        name: listing.name,
        tagline: listing.tagline,
        description: listing.description_long || listing.description_short,
        category: listing.categories?.name || listing.custom_category || "SaaS & Tools",
        upvotes: 42,
        isUpvoted: false,
        rank: 1,
        commentsCount: 0,
        pricing: formatPricing(listing.pricing_model),
        launchDate: formatLaunchDate(listing.approved_at || listing.created_at),
        websiteUrl: isValidHttpUrl(listing.website_url) ? listing.website_url.trim() : undefined,
        logoUrl: listing.logo_url || undefined,
        founder: {
          name: founderName,
          handle: founderHandle,
          role: "Solo Founder",
        },
        tags: [
          listing.categories?.name || listing.custom_category || "SaaS",
          formatPricing(listing.pricing_model),
          "DR 72+ Verified",
        ],
      }
    : {
        id: productId || "tool",
        name: "Software Tool",
        tagline: "Explore modern SaaS and AI tools on LaunchOS",
        description: "Curated software directory and launchpad.",
        category: "SaaS & Tools",
        upvotes: 1,
        isUpvoted: false,
        rank: 1,
        commentsCount: 0,
        pricing: "Freemium" as const,
        launchDate: "Recently Launched",
        websiteUrl: undefined as string | undefined,
        logoUrl: undefined as string | undefined,
        founder: {
          name: "Maker",
          handle: "@maker",
          role: "Solo Founder",
        },
        tags: ["SaaS", "Freemium", "DR 72+ Verified"],
      };

  const gallery =
    listing && listing.listing_screenshots && listing.listing_screenshots.length > 0
      ? listing.listing_screenshots.map((ss, idx) => ({
          id: String(ss.id),
          title: `${listing.name} Screenshot ${idx + 1}`,
          url: ss.url,
          caption: listing.tagline,
        }))
      : [];

  const [logoError, setLogoError] = useState(false);
  const [upvotes, setUpvotes] = useState(product.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(product.isUpvoted || false);
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "comments" | "alternatives">("about");
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [shareUrl, setShareUrl] = useState(`https://launchos.com/product/${product.id}`);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
    // Record page view event for this listing
    if (listing?.id) {
      fetch("/api/analytics/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listing.id }),
      }).catch(() => {});
    }
  }, [listing?.id]);

  // Comments state - clean empty state when no comments exist
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const toggleUpvote = () => {
    setIsUpvoted((prev) => {
      const next = !prev;
      setUpvotes((count) => (next ? count + 1 : count - 1));
      return next;
    });
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const badgeSnippet = `<a href="https://launchos.com/product/${product.id}" target="_blank" rel="noopener noreferrer">
  <img src="https://api.launchos.com/badges/${product.id}-1st.svg" alt="${product.name} on LaunchOS" width="220" height="54" />
</a>`;

  const handleCopyBadge = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(badgeSnippet);
      setCopiedBadge(true);
      setTimeout(() => setCopiedBadge(false), 2000);
    }
  };

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return;

    const newReply: CommentItem = {
      id: `r-${Date.now()}`,
      author: {
        name: "You (Maker)",
        handle: "@founder",
        avatar: "YO",
        role: "Community Founder",
      },
      text: replyText.trim(),
      timestamp: "Just now",
      upvotes: 1,
      isUpvoted: true,
    };

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        return c;
      })
    );

    setReplyingToId(null);
    setReplyText("");
  };

  const websiteDomain = getHostname(product.websiteUrl);

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] font-sans antialiased">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[#55556E]">
            <Link
              href="/"
              className="hover:text-[#4F46E5] transition-colors flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Live Directory</span>
            </Link>
            <span className="text-[#D4D4E4]">/</span>
            <Link
              href="/categories"
              className="hover:text-[#4F46E5] transition-colors font-medium"
            >
              {product.category}
            </Link>
            <span className="text-[#D4D4E4]">/</span>
            <span className="text-[#14142B] font-bold truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>

          <button
            type="button"
            onClick={handleCopyLink}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#55556E] hover:text-[#4F46E5] bg-white border border-[#E6E6F0] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-[#0F8A5F]" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copiedLink ? "Link copied" : "Share tool"}</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* HERO CARD: COHESIVE, BALANCED, MODERN PRODUCT HEADER               */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            {/* Left: Logo + Titles + Tagline + Meta */}
            <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
              {/* Product Logo Squircle (68x68) */}
              <div className="h-16 w-16 sm:h-[68px] sm:w-[68px] rounded-2xl bg-[#F7F6FF] border border-[#E0DEFC] shrink-0 flex items-center justify-center font-heading font-extrabold text-2xl text-[#4F46E5] overflow-hidden p-1 shadow-2xs">
                {product.logoUrl && !logoError ? (
                  <img
                    src={product.logoUrl}
                    alt={product.name}
                    onError={() => setLogoError(true)}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  (product.name || "Tool").slice(0, 2).toUpperCase()
                )}
              </div>

              {/* Title & Info Block */}
              <div className="space-y-1.5 flex-1 min-w-0">
                {/* Title & Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14142B] tracking-tight">
                    {product.name}
                  </h1>

                  {/* #1 Product of the Day Badge */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1D6] border border-[#FCD34D] px-2.5 py-0.5 text-[11px] font-bold text-[#7A4E00]">
                    <Crown className="h-3 w-3 text-[#F59E0B]" />
                    <span>#1 of the Day</span>
                  </span>

                  {/* Category Pill */}
                  <span className="rounded-full bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] px-2.5 py-0.5 text-[11px] font-semibold">
                    {product.category}
                  </span>

                  {/* Pricing Pill */}
                  <span className="rounded-full bg-[#F6F6FB] text-[#14142B] border border-[#E6E6F0] px-2.5 py-0.5 text-[11px] font-semibold">
                    {listing?.starting_price ? formatPricingLabelWithDetails(listing) : product.pricing}
                  </span>
                </div>

                {/* Clean Tagline */}
                <p className="text-xs sm:text-sm text-[#55556E] font-normal leading-relaxed max-w-2xl line-clamp-2">
                  {product.tagline}
                </p>

                {/* Meta details row: Backlink + Launch date + Domain */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-[#55556E]">
                  <span className="inline-flex items-center gap-1 text-[#0F8A5F] font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>DR 72+ Verified Backlink</span>
                  </span>
                  <span className="text-[#D4D4E4]">•</span>
                  <span>Launched {product.launchDate}</span>
                  {product.websiteUrl && (
                    <>
                      <span className="text-[#D4D4E4]">•</span>
                      <a
                        href={product.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4F46E5] hover:underline inline-flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        <span>{websiteDomain}</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: High-Impact CTAs */}
            <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
              {/* Visit Website CTA */}
              {product.websiteUrl && (
                <a
                  href={product.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (listing?.id) {
                      fetch("/api/analytics/website-click", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ listing_id: listing.id }),
                      }).catch(() => {});
                    }
                  }}
                  className="h-11 px-6 inline-flex items-center gap-2 rounded-[12px] bg-[#4F46E5] hover:bg-[#4338CA] text-xs sm:text-sm font-heading font-extrabold text-white transition-all cursor-pointer shadow-xs"
                >
                  <span>Visit website</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 2-COLUMN MAIN: CONTENT & PREVIEW (LEFT 8 COLS) + SIDEBAR (RIGHT 4) */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: PREVIEW + TABS (8 COLS ON LG) */}
          <div className="lg:col-span-8 space-y-6">
            {/* SCREENSHOTS / PRODUCT PREVIEW: COMPACT BROWSER WINDOW (MAX-H 300-340PX) */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white overflow-hidden shadow-xs">
              {/* Slim Faux Browser Header */}
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#E6E6F0] bg-[#F6F6FB]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                </div>

                {/* Compact Address Bar */}
                <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border border-[#E6E6F0] text-[10px] font-mono text-[#55556E] max-w-[200px] truncate">
                  <Lock className="h-2.5 w-2.5 text-[#0F8A5F] shrink-0" />
                  <span className="truncate">{websiteDomain}</span>
                </div>

                <div className="text-[10px] font-mono text-[#55556E] font-medium">
                  {gallery.length > 0 ? `${activeGalleryIdx + 1}/${gallery.length}` : "Verified Preview"}
                </div>
              </div>

              {gallery.length > 0 ? (
                <div className="p-3 sm:p-4 space-y-3">
                  {/* Compact Viewport */}
                  <div className="relative rounded-[10px] overflow-hidden border border-[#E6E6F0] bg-[#0F0F1A] aspect-16/9 max-h-[300px] sm:max-h-[340px]">
                    <img
                      src={gallery[activeGalleryIdx]?.url || gallery[0]?.url}
                      alt={gallery[activeGalleryIdx]?.title || product.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Next / Prev Controls */}
                    {gallery.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveGalleryIdx((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))
                          }
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveGalleryIdx((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {/* Subtle Caption Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 text-white">
                      <div className="font-heading font-semibold text-xs sm:text-sm">
                        {gallery[activeGalleryIdx]?.title || product.name}
                      </div>
                    </div>
                  </div>

                  {/* Compact Thumbnail Strip */}
                  {gallery.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {gallery.map((img, idx) => (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => setActiveGalleryIdx(idx)}
                          className={`relative rounded-[8px] overflow-hidden border-2 w-18 h-12 shrink-0 transition-all cursor-pointer ${
                            activeGalleryIdx === idx
                              ? "border-[#4F46E5] ring-2 ring-[#C7C4FA]"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Compact Empty State Preview */
                <div className="p-6 text-center bg-gradient-to-b from-[#F7F6FF]/30 to-white flex flex-col items-center justify-center space-y-2">
                  <div className="h-12 w-12 rounded-xl bg-[#F7F6FF] border border-[#E0DEFC] flex items-center justify-center font-heading font-extrabold text-lg text-[#4F46E5]">
                    {(product.name || "Tool").slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#14142B]">
                    No screenshots uploaded yet
                  </h3>
                  <p className="text-xs text-[#55556E] max-w-sm">
                    The maker hasn&apos;t added product preview screenshots for {product.name} yet.
                  </p>
                </div>
              )}
            </div>
            {/* Segmented Tab Bar */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-white border border-[#E6E6F0] shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab("about")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "about"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB]"
                }`}
              >
                About Product
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "reviews"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB]"
                }`}
              >
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>Reviews &amp; Ratings</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "comments"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB]"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Comments &amp; AMA</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("alternatives")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "alternatives"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB]"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Alternatives</span>
              </button>
            </div>

            {/* TAB 1: ABOUT (Overview + Reviews + Comments stacked) */}
            {activeTab === "about" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Product Overview Card */}
                <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
                  <div>
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#4F46E5] block mb-1">
                      ABOUT THE PRODUCT
                    </span>
                    <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14142B] tracking-tight">
                      Product Overview
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-[#55556E] leading-relaxed whitespace-pre-line font-normal">
                    {product.description}
                  </p>
                </div>

                {/* Product Reviews Section */}
                <ProductReviewsSection
                  listingId={listing?.id || Number(product.id) || 50000001}
                  listingSlug={listing?.slug || String(product.id)}
                  listingName={product.name}
                  currentUserId={currentUserId}
                />

                {/* Product Comments Section */}
                <ProductCommentsSection
                  listingId={listing?.id || Number(product.id) || 50000001}
                  listingSlug={listing?.slug || String(product.id)}
                  listingName={product.name}
                  currentUserId={currentUserId}
                />
              </div>
            )}

            {/* TAB 2: REVIEWS ONLY */}
            {activeTab === "reviews" && (
              <div className="animate-in fade-in duration-200">
                <ProductReviewsSection
                  listingId={listing?.id || Number(product.id) || 50000001}
                  listingSlug={listing?.slug || String(product.id)}
                  listingName={product.name}
                  currentUserId={currentUserId}
                />
              </div>
            )}

            {/* TAB 3: COMMENTS ONLY */}
            {activeTab === "comments" && (
              <div className="animate-in fade-in duration-200">
                {/* Dynamic placeholder reference: `Ask a question or share your feedback on ${product.name}...` */}
                {/* Fallback empty state: "No comments yet. Be the first to share your feedback." */}
                <ProductCommentsSection
                  listingId={listing?.id || Number(product.id) || 50000001}
                  listingSlug={listing?.slug || String(product.id)}
                  listingName={product.name}
                  currentUserId={currentUserId}
                />
              </div>
            )}

            {/* TAB 4: ALTERNATIVES */}
            {activeTab === "alternatives" && (
              <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-8 space-y-5 animate-in fade-in duration-200 shadow-xs">
                <div className="border-b border-[#E6E6F0] pb-4">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#4F46E5] block mb-1">
                    CURATED ALTERNATIVES
                  </span>
                  <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14142B] tracking-tight">
                    Top Alternatives to {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55556E] mt-1">
                    Looking for comparable tools? Check out other approved launches in {product.category}.
                  </p>
                </div>

                {similarListings && similarListings.length > 0 ? (
                  <div className="space-y-3 pt-1">
                    {similarListings.map((alt) => (
                      <Link
                        key={alt.id}
                        href={`/product/${alt.slug}`}
                        className="rounded-[12px] border border-[#E6E6F0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F6F6FB] hover:border-[#4F46E5] hover:bg-white transition-all group cursor-pointer"
                      >
                        <div>
                          <div className="font-heading font-bold text-sm text-[#14142B] group-hover:text-[#4F46E5] transition-colors">
                            {alt.name}
                          </div>
                          <div className="text-xs text-[#55556E] mt-0.5 line-clamp-1">{alt.tagline}</div>
                        </div>
                        <span className="font-mono text-xs text-[#4F46E5] shrink-0 font-medium">
                          View tool &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[12px] border border-dashed border-[#D4D4E4] bg-[#F6F6FB] p-8 text-center">
                    <p className="text-sm text-[#55556E]">
                      No alternative tools found in {product.category} yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (4 COLS ON LG) */}
          <div className="lg:col-span-4 space-y-5 sticky top-24">
            {/* 1. MAKER CARD */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#4F46E5] block">
                Maker Credentials
              </span>

              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-heading font-extrabold text-sm shrink-0 shadow-xs">
                  {getSafeInitials(product.founder.name, "MK")}
                </div>
                <div>
                  <div className="font-heading font-bold text-sm sm:text-base text-[#14142B] leading-snug">
                    {product.founder.name}
                  </div>
                  <div className="text-xs text-[#55556E]">{product.founder.role}</div>
                  <div className="text-xs font-mono text-[#4F46E5] font-medium mt-0.5">
                    {product.founder.handle}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E6E6F0] pt-3 flex items-center justify-between text-xs font-mono text-[#55556E]">
                <span>Launch Status</span>
                <span className="text-[#0F8A5F] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>100% Verified Maker</span>
                </span>
              </div>
            </div>

            {/* 2. LAUNCH STATS & RANK CARD */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-3.5 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#4F46E5] block">
                Launch Details &amp; SEO
              </span>

              <div className="space-y-3 text-xs divide-y divide-[#E6E6F0]">
                <div className="flex items-center justify-between pt-1 first:pt-0">
                  <span className="text-[#55556E] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Launch Date:
                  </span>
                  <span className="font-bold text-[#14142B] font-mono">{product.launchDate}</span>
                </div>

                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-[#55556E] flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-[#F59E0B]" /> Ranking:
                  </span>
                  <span className="font-bold text-[#7A4E00]">#1 Daily Champion</span>
                </div>

                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-[#55556E] flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0F8A5F]" /> Backlink Quality:
                  </span>
                  <span className="font-bold text-[#0F8A5F]">rel=&quot;dofollow&quot; DR 72+</span>
                </div>

                {product.websiteUrl && (
                  <div className="flex items-center justify-between pt-2.5">
                    <span className="text-[#55556E] flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-[#4F46E5]" /> Domain:
                    </span>
                    <span className="font-mono text-[#4F46E5] font-semibold truncate max-w-[140px]">
                      {websiteDomain}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. SHARE ROW */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-5 space-y-3 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#4F46E5] block">
                Share Launch
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-[10px] border border-[#E6E6F0] bg-[#F6F6FB] hover:bg-[#F7F6FF] hover:text-[#4F46E5] py-2.5 text-xs font-semibold text-[#14142B] transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-[#0F8A5F]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out ${product.name} on @LaunchOS today! ${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#14142B] text-white hover:bg-black transition-colors"
                  aria-label="Share on X"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* 4. EMBED WINNER BADGE BOX */}
            <div className="rounded-2xl border border-[#E0DEFC] bg-gradient-to-br from-[#F7F6FF] to-white p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-[#14142B] flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#4F46E5]" />
                  Embed Winner Badge
                </span>
                <button
                  type="button"
                  onClick={handleCopyBadge}
                  className="text-[11px] font-semibold text-[#4F46E5] hover:underline cursor-pointer flex items-center gap-1 font-mono"
                >
                  {copiedBadge ? <Check className="h-3 w-3 text-[#0F8A5F]" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedBadge ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Visual Badge Display */}
              <div className="p-3.5 bg-white rounded-[10px] border border-[#E6E6F0] flex items-center justify-center shadow-2xs">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-[8px] bg-gradient-to-r from-[#FFF1D6] to-white border border-[#FCD34D]">
                  <span className="text-base">🏆</span>
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-bold text-[#7A4E00]">#1 Product of the Day</div>
                    <div className="text-xs font-extrabold text-[#14142B] font-heading">{product.name}</div>
                  </div>
                  <div className="h-5 w-px bg-[#E6E6F0] ml-1" />
                  <div className="font-mono text-[10px] font-bold text-[#4F46E5]">
                    Verified
                  </div>
                </div>
              </div>

              <pre className="text-[10px] font-mono text-[#55556E] bg-white p-2.5 rounded-[8px] border border-[#E6E6F0] truncate">
                {badgeSnippet}
              </pre>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* BELOW: "SIMILAR PRODUCTS" GRID                                     */}
        {/* ------------------------------------------------------------------ */}
        {similarListings && similarListings.length > 0 && (
          <div className="border-t border-[#E6E6F0] pt-12 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#4F46E5] block mb-1">
                  DISCOVER MORE
                </span>
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14142B] tracking-tight">
                  Similar Products in {product.category}
                </h3>
                <p className="text-xs sm:text-sm text-[#55556E] mt-0.5">
                  Discover other approved software launches in this category.
                </p>
              </div>
              <Link
                href="/categories"
                className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1 font-mono"
              >
                <span>Browse all categories</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similarListings.map((sim) => {
                const simMakerName = sim.submitted_by_email
                  ? sim.submitted_by_email.split("@")[0].replace(/[._+-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim()
                  : "Maker";
                return (
                  <ProductCard
                    key={sim.id}
                    variant="grid"
                    product={{
                      id: sim.slug,
                      name: sim.name,
                      tagline: sim.tagline,
                      category: sim.categories?.name || sim.custom_category || product.category,
                      upvotes: 1,
                      isUpvoted: false,
                      commentsCount: 0,
                      url: `/product/${sim.slug}`,
                      logoUrl: sim.logo_url || undefined,
                      initials: getSafeInitials(sim.name, "TL"),
                      avatarGradient: "from-[#4F46E5] to-[#7E7EF6]",
                      maker: {
                        name: simMakerName,
                        avatarInitials: getSafeInitials(simMakerName, "MK"),
                        avatarColor: "bg-[#4F46E5]",
                        role: "Maker",
                      },
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
