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
import { UpvoteButton } from "./UpvoteButton";
import { AuthModal } from "./AuthModal";
import type { ApprovedListing } from "@/lib/listings";
import { getSafeInitials } from "@/lib/utils";
import { normalizeDirectoryPlan } from "@/config/site";

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
  sidebarRelatedListings?: (ApprovedListing & { upvotesCount?: number })[];
  initialUpvotes?: number;
  initialIsUpvoted?: boolean;
  currentUserId?: string | null;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId = "p-1",
  listing,
  similarListings = [],
  sidebarRelatedListings = [],
  initialUpvotes,
  initialIsUpvoted,
  currentUserId = null,
}) => {
  const initialVoteCount = typeof initialUpvotes === "number" ? initialUpvotes : 0;
  const initialVotedStatus = typeof initialIsUpvoted === "boolean" ? initialIsUpvoted : false;

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
        upvotes: initialVoteCount,
        isUpvoted: initialVotedStatus,
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
          "Verified Listing",
        ],
      }
    : {
        id: productId || "tool",
        name: "Software Tool",
        tagline: "Explore modern SaaS and AI tools on LaunchOS",
        description: "Curated software directory and launchpad.",
        category: "SaaS & Tools",
        upvotes: initialVoteCount,
        isUpvoted: initialVotedStatus,
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
        tags: ["SaaS", "Freemium", "Verified Listing"],
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
  const [upvotes, setUpvotes] = useState(initialVoteCount);
  const [isUpvoted, setIsUpvoted] = useState(initialVotedStatus);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isUpdatingUpvote, setIsUpdatingUpvote] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "alternatives">("about");
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [shareUrl, setShareUrl] = useState(`https://launchos.com/product/${product.id}`);

  // Dynamic Sidebar Related Tools State (Server-provided with client fallback)
  const [sidebarTools, setSidebarTools] = useState<(ApprovedListing & { upvotesCount?: number })[]>(
    sidebarRelatedListings && sidebarRelatedListings.length > 0
      ? sidebarRelatedListings
      : (similarListings as any[]) || []
  );

  useEffect(() => {
    if (sidebarRelatedListings && sidebarRelatedListings.length > 0) {
      setSidebarTools(sidebarRelatedListings);
    } else if (similarListings && similarListings.length > 0) {
      setSidebarTools(similarListings as any[]);
    } else {
      // Dynamic client-side fallback: fetch approved tools from /api/listings
      fetch("/api/listings?limit=20")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.ok && Array.isArray(data.listings)) {
            const currentSlug = listing?.slug || product.id;
            const currentCatId = listing?.category_id;
            const candidateTools = data.listings.filter((item: any) => item.slug !== currentSlug);

            // Same category first
            const sameCat = candidateTools.filter((item: any) =>
              currentCatId
                ? Number(item.category_id) === Number(currentCatId)
                : item.categories?.name === product.category
            );
            // Other categories fallback
            const otherCat = candidateTools.filter((item: any) =>
              currentCatId
                ? Number(item.category_id) !== Number(currentCatId)
                : item.categories?.name !== product.category
            );

            const combined = [...sameCat, ...otherCat].slice(0, 3);
            if (combined.length > 0) {
              setSidebarTools(combined);
            }
          }
        })
        .catch(() => {});
    }
  }, [sidebarRelatedListings, similarListings, listing?.slug, listing?.category_id, product.category, product.id]);

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

    // Load authentic upvote state from backend
    const listingKey = listing?.id || product.id;
    if (listingKey) {
      fetch(`/api/listings/${listingKey}/upvote`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            setIsUpvoted(Boolean(data.isUpvoted));
            if (typeof data.upvotesCount === "number") {
              setUpvotes(data.upvotesCount);
            }
          }
        })
        .catch(() => {});
    }
  }, [listing?.id, product.id]);

  // Comments state - clean empty state when no comments exist
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleUpvoteToggle = async () => {
    if (isUpdatingUpvote) return;
    setIsUpdatingUpvote(true);
    const listingKey = listing?.id || product.id;

    try {
      const res = await fetch(`/api/listings/${listingKey}/upvote`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.status === 401 || data.requiresAuth) {
        setShowAuthModal(true);
        return;
      }

      if (data.ok) {
        setIsUpvoted(Boolean(data.isUpvoted));
        if (typeof data.upvotesCount === "number") {
          setUpvotes(data.upvotesCount);
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsUpdatingUpvote(false);
    }
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

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ------------------------------------------------------------------ */}
        {/* UNIFIED HERO CARD (TITLE, DETAILS, MAKER, AND COMPACT WINNER BADGE)*/}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white shadow-xs overflow-hidden">
          {/* 1. Main Header: Logo + Title + Badges + Tagline + CTAs */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6">
              {/* Left: Logo + Titles + Tagline */}
              <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                {/* Product Logo Squircle */}
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

                    {/* Plan Status Badge */}
                    {normalizeDirectoryPlan(listing?.listing_plan) === "featured" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1D6] border border-[#FCD34D] px-2.5 py-0.5 text-[11px] font-bold text-[#7A4E00]">
                        <Crown className="h-3 w-3 text-[#F59E0B]" />
                        <span>Featured Spotlight</span>
                      </span>
                    ) : normalizeDirectoryPlan(listing?.listing_plan) === "premium" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 text-[11px] font-bold text-[#0F8A5F]">
                        <ShieldCheck className="h-3 w-3 text-[#0F8A5F]" />
                        <span>Verified Maker</span>
                      </span>
                    ) : null}

                    {/* Category Pill */}
                    <Link
                      href={`/category/${listing?.categories?.slug || product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="rounded-full bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] px-2.5 py-0.5 text-[11px] font-semibold hover:bg-[#EEEDFC] transition-colors"
                    >
                      {product.category}
                    </Link>

                    {/* Pricing Pill */}
                    <span className="rounded-full bg-[#F6F6FB] text-[#14142B] border border-[#E6E6F0] px-2.5 py-0.5 text-[11px] font-semibold">
                      {listing?.starting_price ? formatPricingLabelWithDetails(listing) : product.pricing}
                    </span>
                  </div>

                  {/* Clean Tagline */}
                  <p className="text-xs sm:text-sm text-[#55556E] font-normal leading-relaxed max-w-2xl line-clamp-2">
                    {product.tagline}
                  </p>
                </div>
              </div>

              {/* Right: High-Impact CTAs */}
              <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
                <UpvoteButton
                  count={upvotes}
                  isUpvoted={isUpvoted}
                  orientation="horizontal"
                  size="md"
                  disabled={isUpdatingUpvote}
                  onUpvoteToggle={handleUpvoteToggle}
                />

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
                    className="h-10 px-5 inline-flex items-center gap-2 rounded-[10px] bg-[#4F46E5] hover:bg-[#4338CA] text-xs sm:text-sm font-heading font-extrabold text-white transition-all cursor-pointer shadow-xs"
                  >
                    <span>Visit website</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Sub-Row: Maker Credentials & Launch Info */}
            <div className="pt-3.5 border-t border-[#F1F1F8] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              {/* MAKER CREDENTIALS */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="h-8 w-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-heading font-extrabold text-[11px] shrink-0 shadow-2xs">
                  {getSafeInitials(product.founder.name, "MK")}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-bold text-[#14142B] text-xs sm:text-sm">
                    {product.founder.name}
                  </span>
                  <span className="text-[#55556E] text-xs">
                    ({product.founder.role || "Maker"})
                  </span>
                  <span className="font-mono text-[#4F46E5] text-xs font-medium">
                    {product.founder.handle}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] text-[#0F8A5F] px-2 py-0.5 text-[10px] font-semibold border border-[#A7F3D0]">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>100% Verified Maker</span>
                  </span>
                </div>
              </div>

              {/* LAUNCH DETAILS */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap md:justify-end text-xs text-[#55556E] font-mono">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F6F6FB] border border-[#E6E6F0]">
                  <Calendar className="h-3.5 w-3.5 text-[#4F46E5]" />
                  <span>Launched {product.launchDate}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF1D6] border border-[#FCD34D] text-[#7A4E00] font-bold">
                  <Crown className="h-3.5 w-3.5 text-[#F59E0B]" />
                  <span>#1 Daily Champion</span>
                </span>

                {product.websiteUrl && (
                  <a
                    href={product.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F6FF] border border-[#E0DEFC] text-[#4F46E5] hover:underline font-semibold"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>{websiteDomain}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 2. Compact Integrated Embed Winner Badge Row */}
          <div className="px-5 sm:px-6 py-2 border-t border-[#F1F1F8] bg-gradient-to-r from-[#F8F7FF] via-[#FAFAFE] to-[#F8F7FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap min-w-0">
              {/* Mini Official Winner Badge Preview (Matches official badge design) */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#FFFDF5] border border-[#FCD34D] shadow-2xs shrink-0">
                <span className="text-sm">🏆</span>
                <div className="leading-tight text-left">
                  <div className="text-[8px] font-bold uppercase tracking-wider text-[#92400E]">
                    #1 Product of the Day
                  </div>
                  <div className="text-[11px] font-extrabold text-[#14142B] truncate max-w-[130px]">
                    {product.name}
                  </div>
                </div>
                <div className="h-4 w-[1px] bg-[#FCD34D]/70 mx-0.5" />
                <span className="text-[10px] font-bold text-[#4F46E5]">Verified</span>
              </div>

              <div className="flex items-center gap-1.5 font-heading font-bold text-xs text-[#14142B] truncate">
                <Award className="h-3.5 w-3.5 text-[#4F46E5] shrink-0" />
                <span>Embed Official Winner Badge</span>
                <span className="hidden md:inline font-sans font-normal text-[11px] text-[#55556E]">
                  — Showcase this award on your site or README
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <pre className="hidden xl:block max-w-[210px] text-[10px] font-mono text-[#55556E] bg-white px-2 py-1 rounded-md border border-[#E6E6F0] truncate">
                {badgeSnippet}
              </pre>
              <button
                type="button"
                onClick={handleCopyBadge}
                className="px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                {copiedBadge ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3" />}
                <span>{copiedBadge ? "Copied" : "Copy Badge Code"}</span>
              </button>
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
                {product.websiteUrl ? (
                  <a
                    href={product.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border border-[#E6E6F0] hover:border-[#4F46E5] text-[10px] font-mono text-[#55556E] hover:text-[#4F46E5] transition-colors max-w-[200px] truncate cursor-pointer"
                  >
                    <Lock className="h-2.5 w-2.5 text-[#0F8A5F] shrink-0" />
                    <span className="truncate">{websiteDomain}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border border-[#E6E6F0] text-[10px] font-mono text-[#55556E] max-w-[200px] truncate">
                    <Lock className="h-2.5 w-2.5 text-[#0F8A5F] shrink-0" />
                    <span className="truncate">{websiteDomain}</span>
                  </div>
                )}

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

            {/* TAB 1: ABOUT (Overview + Reviews) */}
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

                {/* Product Reviews & Rating Section */}
                <ProductReviewsSection
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

            {/* Dynamic placeholder reference: `Ask a question or share your feedback on ${product.name}...` */}
            {/* Fallback empty state: "No comments yet. Be the first to share your feedback." */}

            {/* TAB 3: ALTERNATIVES */}
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

          {/* RIGHT SIDEBAR (4 COLS ON LG) - RELATED TOOLS & STICKY SIDEBAR */}
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 self-start">
            {/* 1. RELATED TOOLS (STICKY SIDEBAR) */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-4.5 sm:p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#F1F1F8] pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#F7F6FF] text-[#4F46E5]">
                    <Layers className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#14142B] leading-tight">
                      Related Tools
                    </h3>
                    <p className="text-[11px] text-[#55556E]">
                      {sidebarTools.some((t) => t.category_id === listing?.category_id)
                        ? `Top picks in ${product.category}`
                        : "Discover recommended software"}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] bg-[#F7F6FF] px-2 py-0.5 rounded-md border border-[#E0DEFC]">
                  Recommended
                </span>
              </div>

              {/* Dynamic Related Tools List */}
              <div className="space-y-2.5">
                {sidebarTools.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#E6E6F0] p-4 text-center space-y-1.5">
                    <p className="text-xs font-semibold text-[#14142B]">
                      Explore all categories
                    </p>
                    <p className="text-[11px] text-[#55556E]">
                      Discover approved SaaS and AI tools launched on LaunchOS.
                    </p>
                    <Link
                      href="/categories"
                      className="inline-block mt-1 text-xs font-bold text-[#4F46E5] hover:underline"
                    >
                      Browse all categories &rarr;
                    </Link>
                  </div>
                ) : (
                  sidebarTools.slice(0, 3).map((tool) => {
                    const toolCatName = tool.categories?.name || tool.custom_category || product.category;
                    const toolPricing = formatPricing(tool.pricing_model);
                    const toolUpvotes = (tool as any).upvotesCount ?? 1;

                    return (
                      <Link
                        key={tool.id}
                        href={`/product/${tool.slug}`}
                        className="group flex items-start gap-3 p-3 rounded-xl border border-[#F1F1F8] hover:border-[#E0DEFC] hover:bg-[#F8F7FF] transition-all cursor-pointer block bg-white"
                      >
                        {/* Logo / Initials */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7E7EF6] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                          {tool.logo_url ? (
                            <img
                              src={tool.logo_url}
                              alt={tool.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getSafeInitials(tool.name, "TL")
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-heading font-bold text-xs text-[#14142B] group-hover:text-[#4F46E5] transition-colors truncate">
                              {tool.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F1F1F8] text-[#55556E] shrink-0 font-medium">
                              {toolPricing}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#55556E] leading-relaxed line-clamp-2">
                            {tool.tagline}
                          </p>

                          <div className="flex items-center justify-between pt-0.5 text-[10px] text-[#55556E]">
                            <span className="inline-flex items-center gap-1 font-semibold text-[#4F46E5] truncate max-w-[130px]">
                              {toolCatName}
                            </span>
                            <span className="inline-flex items-center gap-0.5 font-mono font-bold text-[#14142B] shrink-0">
                              ▲ {toolUpvotes}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. SUBMIT PROMO / EXPLORE MORE */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-4.5 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#F7F6FF] text-[#4F46E5]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="font-heading font-bold text-xs text-[#14142B]">
                  Launch Your Product
                </span>
              </div>
              <p className="text-[11px] text-[#55556E] leading-relaxed">
                Get your SaaS featured to founders and community early adopters.
              </p>
              <Link
                href="/submit"
                className="w-full py-2 px-3 rounded-xl bg-[#F6F6FB] hover:bg-[#EEEDFC] hover:text-[#4F46E5] text-[#14142B] border border-[#E6E6F0] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer block text-center"
              >
                <span>Submit a Tool</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>
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

      {/* Auth Modal for Unauthenticated Upvoters */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <Footer />
    </div>
  );
};
