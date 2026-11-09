"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Pill } from "./Pill";
import { ProductCard } from "./ProductCard";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MOCK_PRODUCTS, LaunchProduct } from "@/lib/mock-data";

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

const SAMPLE_GALLERY = [
  {
    id: "g1",
    title: "Autonomous Ticket Resolution Engine",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop&q=80",
    caption: "Real-time AI resolution of 68% of enterprise support queries with zero human intervention.",
  },
  {
    id: "g2",
    title: "Knowledge Base Semantic Indexing",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop&q=80",
    caption: "Connects with Notion, Zendesk, Linear, and GitHub in under 5 minutes.",
  },
  {
    id: "g3",
    title: "Retention & Churn Analytics Dashboard",
    url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=675&fit=crop&q=80",
    caption: "Automatic cohort retention signals delivered weekly directly to your executive Slack channel.",
  },
];

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: "c1",
    author: {
      name: "Elena Rostova",
      handle: "@erostova",
      avatar: "ER",
      role: "CTO @ VectorFlow",
    },
    text: "Congrats on the launch Austin! We just integrated Cortex with our internal Discord docs channel this morning. The retrieval latency is sub-200ms and the hallucinations are basically zero. What embedding model are you running behind the scenes?",
    timestamp: "2 hours ago",
    upvotes: 18,
    isUpvoted: true,
    replies: [
      {
        id: "c1-r1",
        author: {
          name: "Austin Miller",
          handle: "@austinm",
          avatar: "AM",
          isMaker: true,
          role: "Maker",
        },
        text: "Thanks Elena! We're using a fine-tuned hybrid of Claude 3.5 Sonnet for reasoning coupled with an in-memory vector index running on quantized text-embedding-3-large. Sub-200ms was our exact P99 target!",
        timestamp: "1 hour ago",
        upvotes: 14,
        isUpvoted: false,
      },
    ],
  },
  {
    id: "c2",
    author: {
      name: "Marcus Chen",
      handle: "@marcus_builds",
      avatar: "MC",
      role: "Founder @ SaaSForge",
    },
    text: "Massive congratulations on hitting #1 today! Really love how clean the Slack bot UI is. Upvoted and rooting for you all day.",
    timestamp: "3 hours ago",
    upvotes: 9,
    isUpvoted: false,
    replies: [
      {
        id: "c2-r1",
        author: {
          name: "Austin Miller",
          handle: "@austinm",
          avatar: "AM",
          isMaker: true,
          role: "Maker",
        },
        text: "Appreciate the love Marcus! Feel free to DM me on X if you want early access to our custom Zapier triggers.",
        timestamp: "2 hours ago",
        upvotes: 6,
        isUpvoted: false,
      },
    ],
  },
  {
    id: "c3",
    author: {
      name: "Sarah Jenkins",
      handle: "@sarah_growth",
      avatar: "SJ",
      role: "Growth Lead",
    },
    text: "Does Cortex support multi-language customer tickets out of the box (e.g. Spanish, German, Japanese)?",
    timestamp: "4 hours ago",
    upvotes: 5,
    isUpvoted: false,
    replies: [
      {
        id: "c3-r1",
        author: {
          name: "Austin Miller",
          handle: "@austinm",
          avatar: "AM",
          isMaker: true,
          role: "Maker",
        },
        text: "Yes! 42 languages are supported natively. It automatically detects customer language and responds in their native dialect while filing the internal summary in English.",
        timestamp: "3 hours ago",
        upvotes: 7,
        isUpvoted: false,
      },
    ],
  },
];

export interface ProductDetailViewProps {
  productId?: string;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ productId = "p-1" }) => {
  const product: LaunchProduct =
    MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];

  const [upvotes, setUpvotes] = useState(product.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(product.isUpvoted || false);
  const [activeTab, setActiveTab] = useState<"about" | "comments" | "alternatives">("about");
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [shareUrl, setShareUrl] = useState(`https://launchos.com/p/${product.id}`);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState("");
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

  const badgeSnippet = `<a href="https://launchos.com/p/${product.id}" target="_blank" rel="noopener noreferrer">
  <img src="https://api.launchos.com/badges/${product.id}-1st.svg" alt="${product.name} on LaunchOS" width="220" height="54" />
</a>`;

  const handleCopyBadge = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(badgeSnippet);
      setCopiedBadge(true);
      setTimeout(() => setCopiedBadge(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: {
        name: "You (Maker)",
        handle: "@founder",
        avatar: "YO",
        role: "Community Founder",
      },
      text: newCommentText.trim(),
      timestamp: "Just now",
      upvotes: 1,
      isUpvoted: true,
      replies: [],
    };

    setComments([newComment, ...comments]);
    setNewCommentText("");
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

  const similarProducts = MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F0F10] selection:bg-[#5B5BF0]/15 selection:text-[#5B5BF0]">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#66666B]">
            <Link href="/" className="hover:text-[#5B5BF0] transition-colors flex items-center gap-1 font-semibold">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Leaderboard</span>
            </Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-[#5B5BF0] transition-colors">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-[#0F0F10] font-bold">{product.name}</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* HEADER: BIG LOGO, NAME, TAGLINE, CATEGORY PILLS & ACTION CTAs     */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-[18px] border border-[#E8E8E3] bg-white p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Big Logo & Titles */}
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Big Logo Squircle (72px) */}
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[16px] bg-linear-to-br from-[#EEF0FE] to-[#D5D8FC] border border-[#D5D8FC] shadow-[0_4px_16px_rgba(91,91,240,0.12)] shrink-0 flex items-center justify-center font-heading font-black text-2xl text-[#5B5BF0]">
                {product.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Title & Tagline */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#0F0F10] tracking-[-0.03em]">
                    {product.name}
                  </h1>

                  {/* Rank Badge */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-[#FEF3C7] to-[#FDE68A] border border-[#FCD34D] px-2.5 py-0.5 text-xs font-bold text-[#B45309] shadow-xs">
                    <Crown className="h-3.5 w-3.5 text-[#F59E0B]" />
                    #1 Product of the Day
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 text-xs font-bold text-[#059669]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    DR 72+ Verified
                  </span>
                </div>

                <p className="text-sm sm:text-base text-[#47474F] max-w-2xl font-normal leading-relaxed">
                  {product.tagline}
                </p>

                {/* Category & Pricing Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2.5 py-0.5 text-xs font-semibold text-[#66666B]">
                    {product.category}
                  </span>
                  <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2.5 py-0.5 text-xs font-semibold text-[#66666B]">
                    {product.pricing}
                  </span>
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#EEF0FE] text-[#5B5BF0] px-2 py-0.5 text-[11px] font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Large Upvote Button & "Visit Website" CTA */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
              {/* Large Upvote Button */}
              <button
                type="button"
                onClick={toggleUpvote}
                className={`flex items-center gap-2.5 rounded-[12px] px-5 py-3 font-heading font-extrabold text-sm sm:text-base transition-all duration-200 cursor-pointer shadow-xs ${
                  isUpvoted
                    ? "bg-[#5B5BF0] text-white shadow-[0_4px_16px_rgba(91,91,240,0.3)] scale-[1.02]"
                    : "bg-[#EEF0FE] text-[#5B5BF0] hover:bg-[#E0E3FD] hover:scale-[1.01]"
                }`}
              >
                <ArrowBigUp className={`h-5 w-5 ${isUpvoted ? "fill-current" : ""}`} />
                <span>UPVOTE</span>
                <span className="font-mono text-sm px-2 py-0.5 rounded-full bg-white/20">
                  {upvotes}
                </span>
              </button>

              {/* Visit Website CTA */}
              <a
                href="https://example.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-[12px] border border-[#E8E8E3] bg-white hover:bg-[#FAFAF7] px-5 py-3 text-sm font-bold text-[#0F0F10] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#D5D5CE] transition-all"
              >
                <span>Visit website</span>
                <ExternalLink className="h-4 w-4 text-[#8E8E93]" />
              </a>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* SCREENSHOTS CAROUSEL GALLERY                                       */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-[18px] border border-[#E8E8E3] bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="relative rounded-[12px] overflow-hidden border border-[#E8E8E3] bg-black aspect-16/9 max-h-[500px]">
            <img
              src={SAMPLE_GALLERY[activeGalleryIdx].url}
              alt={SAMPLE_GALLERY[activeGalleryIdx].title}
              className="w-full h-full object-cover"
            />

            {/* Next / Prev Controls */}
            <button
              onClick={() =>
                setActiveGalleryIdx((prev) => (prev > 0 ? prev - 1 : SAMPLE_GALLERY.length - 1))
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                setActiveGalleryIdx((prev) => (prev < SAMPLE_GALLERY.length - 1 ? prev + 1 : 0))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Caption Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-5 text-white">
              <div className="font-heading font-bold text-sm sm:text-base">
                {SAMPLE_GALLERY[activeGalleryIdx].title}
              </div>
              <p className="text-xs text-white/80 line-clamp-1">
                {SAMPLE_GALLERY[activeGalleryIdx].caption}
              </p>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="grid grid-cols-3 gap-3">
            {SAMPLE_GALLERY.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveGalleryIdx(idx)}
                className={`relative rounded-[8px] overflow-hidden border-2 aspect-16/9 transition-all cursor-pointer ${
                  activeGalleryIdx === idx
                    ? "border-[#5B5BF0] ring-2 ring-[#5B5BF0]/20 shadow-xs"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 2-COLUMN MAIN: TABS (LEFT) + SIDEBAR (RIGHT)                       */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: TABS (8 COLS ON LG) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tab Switcher */}
            <div className="flex items-center gap-2 border-b border-[#E8E8E3] pb-3">
              <button
                onClick={() => setActiveTab("about")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "about"
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10] hover:bg-[#FAFAF7]"
                }`}
              >
                About Product
              </button>

              <button
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "comments"
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10] hover:bg-[#FAFAF7]"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Comments ({comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)})
              </button>

              <button
                onClick={() => setActiveTab("alternatives")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "alternatives"
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10] hover:bg-[#FAFAF7]"
                }`}
              >
                Alternatives
              </button>
            </div>

            {/* TAB 1: ABOUT */}
            {activeTab === "about" && (
              <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-200">
                <div className="space-y-3">
                  <h3 className="font-heading font-extrabold text-xl text-[#0F0F10] tracking-tight">
                    Product Overview
                  </h3>
                  <p className="text-sm text-[#47474F] leading-relaxed">
                    {product.description} Built specifically for high-velocity software teams, Cortex eliminates support backlogs by understanding the nuances of modern B2B SaaS architecture.
                  </p>
                </div>

                {/* Key Features Checklist */}
                <div className="space-y-3 border-t border-[#E8E8E3] pt-5">
                  <h4 className="font-heading font-bold text-sm text-[#0F0F10] uppercase tracking-wider font-mono">
                    Core Capabilities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Real-time Zendesk & Slack sync",
                      "Sub-200ms semantic knowledge lookup",
                      "Multi-language response in 42 languages",
                      "Automated churn risk alerting",
                      "SOC2 Type II & GDPR compliant",
                      "No-code 5 minute setup wizard",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-[#47474F]">
                        <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="border-t border-[#E8E8E3] pt-5 space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E8E93] block">
                    Built With
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Next.js 16", "TypeScript", "Tailwind CSS", "pgvector", "Claude 3.5", "Stripe API"].map(
                      (tech) => (
                        <span
                          key={tech}
                          className="rounded-[6px] bg-[#FAFAF7] border border-[#E8E8E3] px-2.5 py-1 text-xs font-mono font-medium text-[#0F0F10]"
                        >
                          {tech}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COMMENTS WITH NESTED REPLIES UI */}
            {activeTab === "comments" && (
              <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#E8E8E3] pb-4">
                  <h3 className="font-heading font-extrabold text-xl text-[#0F0F10] tracking-tight">
                    Discussion & Maker AMA
                  </h3>
                  <p className="text-xs sm:text-sm text-[#66666B]">
                    Leave real founder feedback, ask technical questions, and congratulate the makers.
                  </p>
                </div>

                {/* Add Comment Input Form */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Ask a question or share your feedback on Cortex AI..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full rounded-[10px] border border-[#E8E8E3] bg-[#FAFAF7] p-3.5 text-xs sm:text-sm text-[#0F0F10] placeholder:text-[#8E8E93] focus:bg-white focus:border-[#5B5BF0] focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      rightIcon={<Send className="h-3.5 w-3.5" />}
                    >
                      Post Comment
                    </Button>
                  </div>
                </form>

                {/* Comments Thread List with Nested Replies */}
                <div className="space-y-6 pt-2 divide-y divide-[#E8E8E3]">
                  {comments.map((comment) => (
                    <div key={comment.id} className="pt-5 space-y-3.5 first:pt-0">
                      {/* Top Comment Item */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#5B5BF0] text-white flex items-center justify-center font-heading font-bold text-xs shrink-0 shadow-xs">
                            {comment.author.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-heading font-bold text-sm text-[#0F0F10]">
                                {comment.author.name}
                              </span>
                              {comment.author.isMaker && (
                                <span className="rounded-full bg-[#EEF0FE] text-[#5B5BF0] px-2 py-0.2 text-[10px] font-bold">
                                  Maker
                                </span>
                              )}
                              <span className="text-xs font-mono text-[#8E8E93]">
                                {comment.author.handle}
                              </span>
                              <span className="text-xs text-[#E8E8E3]">•</span>
                              <span className="text-xs font-mono text-[#8E8E93]">
                                {comment.timestamp}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#47474F] mt-1 leading-relaxed">
                              {comment.text}
                            </p>
                          </div>
                        </div>

                        {/* Comment Upvote Pill */}
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-full border border-[#E8E8E3] bg-[#FAFAF7] hover:bg-[#EEF0FE] hover:text-[#5B5BF0] px-2.5 py-1 text-xs font-mono font-bold text-[#66666B] transition-colors shrink-0"
                        >
                          <ArrowBigUp className="h-3.5 w-3.5" />
                          <span>{comment.upvotes}</span>
                        </button>
                      </div>

                      {/* Reply Button Trigger */}
                      <div className="pl-12 flex items-center gap-3 text-xs">
                        <button
                          onClick={() =>
                            setReplyingToId(replyingToId === comment.id ? null : comment.id)
                          }
                          className="text-[#5B5BF0] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <CornerDownRight className="h-3 w-3" />
                          Reply
                        </button>
                      </div>

                      {/* Nested Reply Input */}
                      {replyingToId === comment.id && (
                        <div className="pl-12 space-y-2 pt-1">
                          <textarea
                            rows={2}
                            placeholder={`Reply to ${comment.author.name}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full rounded-[8px] border border-[#E8E8E3] bg-white p-2.5 text-xs text-[#0F0F10] placeholder:text-[#8E8E93] focus:border-[#5B5BF0] focus:outline-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingToId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAddReply(comment.id)}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Nested Replies Thread */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-6 sm:pl-10 space-y-3 border-l-2 border-[#E8E8E3] ml-4 pt-1">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <div className="h-7 w-7 rounded-full bg-[#10B981] text-white flex items-center justify-center font-heading font-bold text-[10px] shrink-0 shadow-xs">
                                  {reply.author.avatar}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-heading font-bold text-xs text-[#0F0F10]">
                                      {reply.author.name}
                                    </span>
                                    {reply.author.isMaker && (
                                      <span className="rounded-full bg-[#EEF0FE] text-[#5B5BF0] px-1.5 py-0.2 text-[9px] font-bold">
                                        Maker
                                      </span>
                                    )}
                                    <span className="text-[11px] font-mono text-[#8E8E93]">
                                      {reply.author.handle}
                                    </span>
                                    <span className="text-xs text-[#E8E8E3]">•</span>
                                    <span className="text-[11px] font-mono text-[#8E8E93]">
                                      {reply.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#47474F] mt-0.5 leading-relaxed">
                                    {reply.text}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                className="flex items-center gap-1 rounded-full border border-[#E8E8E3] bg-[#FAFAF7] px-2 py-0.5 text-[11px] font-mono font-bold text-[#66666B]"
                              >
                                <ArrowBigUp className="h-3 w-3" />
                                <span>{reply.upvotes}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ALTERNATIVES */}
            {activeTab === "alternatives" && (
              <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-[#E8E8E3] pb-3">
                  <h3 className="font-heading font-extrabold text-xl text-[#0F0F10] tracking-tight">
                    Top Alternatives to {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#66666B]">
                    Looking for comparable tools? Check out other high-ranked community launches.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {[
                    {
                      name: "Intercom Fin AI",
                      pricing: "Enterprise ($99/mo)",
                      differentiator: "Built for massive teams; high seat pricing",
                    },
                    {
                      name: "Zendesk AI Agents",
                      pricing: "Paid addon",
                      differentiator: "Complex configuration, takes days to deploy",
                    },
                    {
                      name: "Chatbase",
                      pricing: "Freemium ($19/mo)",
                      differentiator: "Simpler chatbot without deep two-way ticketing sync",
                    },
                  ].map((alt, i) => (
                    <div
                      key={i}
                      className="rounded-[12px] border border-[#E8E8E3] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAF7]"
                    >
                      <div>
                        <div className="font-heading font-bold text-sm text-[#0F0F10]">
                          {alt.name}
                        </div>
                        <div className="text-xs text-[#66666B] mt-0.5">{alt.differentiator}</div>
                      </div>
                      <span className="font-mono text-xs text-[#8E8E93] shrink-0 font-medium">
                        {alt.pricing}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (4 COLS ON LG) */}
          <div className="lg:col-span-4 space-y-5 sticky top-24">
            {/* 1. MAKER CARD */}
            <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#8E8E93] block">
                Maker Credentials
              </span>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#5B5BF0] text-white flex items-center justify-center font-heading font-extrabold text-sm shadow-xs shrink-0">
                  {product.founder.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="font-heading font-bold text-sm sm:text-base text-[#0F0F10] leading-snug">
                    {product.founder.name}
                  </div>
                  <div className="text-xs text-[#66666B]">{product.founder.role}</div>
                  <div className="text-xs font-mono text-[#5B5BF0] font-medium">
                    {product.founder.handle}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E8E8E3] pt-3 flex items-center justify-between text-xs font-mono text-[#8E8E93]">
                <span>2nd Product Launched</span>
                <span className="text-[#10B981] font-semibold">100% Verified</span>
              </div>
            </div>

            {/* 2. LAUNCH STATS & RANK CARD */}
            <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#8E8E93] block">
                Leaderboard Stats
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8E8E93] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Launch Date:
                  </span>
                  <span className="font-bold text-[#0F0F10]">Nov 9, 2026 (Today)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8E8E93] flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-[#F59E0B]" /> Leaderboard Rank:
                  </span>
                  <span className="font-bold text-[#B45309]">#1 Daily Champion</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8E8E93] flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" /> Backlink Status:
                  </span>
                  <span className="font-bold text-[#10B981]">rel="dofollow" DR 72+</span>
                </div>
              </div>
            </div>

            {/* 3. SHARE ROW */}
            <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#8E8E93] block">
                Share Launch
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-[8px] border border-[#E8E8E3] bg-[#FAFAF7] hover:bg-[#EEF0FE] hover:text-[#5B5BF0] py-2 text-xs font-semibold text-[#0F0F10] transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-[#10B981]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out ${product.name} on @LaunchOS today! Upvote and support: ${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-black text-white hover:bg-black/80 transition-colors"
                  aria-label="Share on X"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* 4. EMBED BADGE BOX */}
            <div className="rounded-[16px] border border-[#D5D8FC] bg-[#FAF9FF] p-5 shadow-[0_2px_8px_rgba(91,91,240,0.06)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-[#0F0F10] flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#5B5BF0]" />
                  Embed Winner Badge
                </span>
                <button
                  type="button"
                  onClick={handleCopyBadge}
                  className="text-[11px] font-semibold text-[#5B5BF0] hover:underline cursor-pointer flex items-center gap-1"
                >
                  {copiedBadge ? <Check className="h-3 w-3 text-[#10B981]" /> : <Copy className="h-3 w-3" />}
                  {copiedBadge ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Visual Badge Display */}
              <div className="p-3 bg-white rounded-[10px] border border-[#E8E8E3] flex items-center justify-center">
                <div className="flex items-center gap-2.5 px-3 py-1 rounded-[6px] bg-linear-to-r from-[#FEF3C7] to-white border border-[#FCD34D]">
                  <span className="text-base">🏆</span>
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-bold text-[#B45309]">#1 Product of the Day</div>
                    <div className="text-xs font-black text-[#0F0F10] font-heading">{product.name}</div>
                  </div>
                  <div className="h-5 w-[1px] bg-[#E8E8E3] ml-1" />
                  <div className="font-mono text-[10px] font-bold text-[#5B5BF0]">
                    ▲ {upvotes}
                  </div>
                </div>
              </div>

              <pre className="text-[10px] font-mono text-[#66666B] bg-white p-2 rounded-[6px] border border-[#E8E8E3] truncate">
                {badgeSnippet}
              </pre>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* BELOW: "SIMILAR PRODUCTS" GRID                                     */}
        {/* ------------------------------------------------------------------ */}
        <div className="border-t border-[#E8E8E3] pt-10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F0F10] tracking-tight">
                Similar Products in {product.category}
              </h3>
              <p className="text-xs sm:text-sm text-[#66666B]">
                Discover other high-authority SaaS launches in this category.
              </p>
            </div>
            <Link href="/" className="text-xs font-semibold text-[#5B5BF0] hover:underline flex items-center gap-1">
              <span>View all launches</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similarProducts.map((p) => (
              <ProductCard
                key={p.id}
                variant="grid"
                product={{
                  id: p.id,
                  name: p.name,
                  tagline: p.tagline,
                  category: p.category,
                  upvotes: p.upvotes,
                  isUpvoted: p.isUpvoted,
                  rank: p.rank,
                  commentsCount: p.commentsCount,
                  url: `/product/${p.id}`,
                  initials: p.name.slice(0, 2).toUpperCase(),
                  avatarGradient: "from-[#5B5BF0] to-[#7E7EF6]",
                  maker: {
                    name: p.founder.name,
                    avatarInitials: p.founder.name.split(" ").map((n) => n[0]).join(""),
                    avatarColor: "bg-[#5B5BF0]",
                    role: p.founder.role,
                  },
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
