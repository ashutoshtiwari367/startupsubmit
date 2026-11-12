"use client";

import React, { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Globe,
  FileCode,
  LogOut,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  Clock,
  Sparkles,
  Inbox,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileText,
  Laptop,
  CheckCircle,
} from "lucide-react";
import { approveListing, rejectListing } from "@/app/admin/actions";
import type { PricingModel, ListingStatus, BigIntId } from "@/types/db";

export interface QueueScreenshot {
  id: BigIntId;
  url: string;
  position: number;
}

export interface QueueCategory {
  id: BigIntId;
  slug: string;
  name: string;
}

export interface PendingQueueItem {
  id: BigIntId;
  reference_code?: string;
  slug: string;
  name: string;
  tagline: string;
  description_short: string;
  description_long: string;
  website_url: string;
  logo_url: string;
  category_id: BigIntId;
  pricing_model: PricingModel;
  starting_price?: number | null;
  currency?: string;
  billing_period?: string | null;
  listing_plan?: string;
  listing_plan_price?: number;
  status: ListingStatus;
  submitted_by_email: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  categories?: QueueCategory | QueueCategory[] | null;
  listing_screenshots?: QueueScreenshot[];
}

/**
 * Strict URL sanitizer for user-submitted URLs (website_url, logo_url, screenshot URLs).
 * Blocks javascript:, data:, vbscript:, file:, and non-HTTPS schemes to guarantee XSS-safe href/src attributes.
 */
export function safeHttpsUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

interface AdminQueueClientProps {
  initialListings: PendingQueueItem[];
  initialApprovedListings?: PendingQueueItem[];
}

export function AdminQueueClient({
  initialListings,
  initialApprovedListings = [],
}: AdminQueueClientProps) {
  const [listings, setListings] = useState<PendingQueueItem[]>(initialListings);
  const [approvedListings, setApprovedListings] =
    useState<PendingQueueItem[]>(initialApprovedListings);
  const [currentTab, setCurrentTab] = useState<"pending" | "approved">(
    initialListings.length > 0 ? "pending" : "approved"
  );

  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pendingActionId, setPendingActionId] = useState<BigIntId | null>(null);
  const [isPending, startTransition] = useTransition();

  // Navigation & UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pricingFilter, setPricingFilter] = useState<string>("all");
  const [expandedItemId, setExpandedItemId] = useState<BigIntId | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Optimistic state: removes the item immediately from the pending queue when Approve/Reject is clicked
  const [optimisticListings, removeOptimisticListing] = useOptimistic(
    listings,
    (currentListings: PendingQueueItem[], removedId: BigIntId) =>
      currentListings.filter((item) => String(item.id) !== String(removedId))
  );

  function resolveCategoryLabel(item: PendingQueueItem): string {
    if (!item.categories) return String(item.category_id);
    if (Array.isArray(item.categories)) {
      return item.categories[0]?.name || String(item.category_id);
    }
    return item.categories.name || String(item.category_id);
  }

  function handleModeration(
    item: PendingQueueItem,
    decision: "approve" | "reject"
  ) {
    setActionFeedback(null);
    setPendingActionId(item.id);

    startTransition(async () => {
      // 1. Optimistically remove from visible pending list
      removeOptimisticListing(item.id);

      try {
        const result =
          decision === "approve"
            ? await approveListing(item.id)
            : await rejectListing(item.id);

        // 2. Commit removal to local baseline state
        setListings((prev) => prev.filter((row) => row.id !== item.id));

        // 3. If approved, add to approved listings list
        if (decision === "approve") {
          setApprovedListings((prev) => [
            {
              ...item,
              status: "approved",
              approved_at: new Date().toISOString(),
            },
            ...prev,
          ]);
        }

        setActionFeedback({
          type: "success",
          text:
            result?.message ||
            `Listing "${item.name}" was ${
              decision === "approve" ? "approved & indexed" : "rejected"
            } successfully.`,
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : `Failed to ${decision} listing "${item.name}".`;
        setActionFeedback({
          type: "error",
          text: message,
        });
      } finally {
        setPendingActionId(null);
      }
    });
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
    } catch {
      // Ignore
    }
    window.location.href = "/admin/login";
  };

  // Determine active dataset based on current tab
  const activeDataset =
    currentTab === "pending" ? optimisticListings : approvedListings;

  // Filter active dataset by search query and pricing model
  const filteredListings = activeDataset.filter((item) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submitted_by_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resolveCategoryLabel(item).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPricing =
      pricingFilter === "all" || item.pricing_model === pricingFilter;

    return matchesSearch && matchesPricing;
  });

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#ECECF1] flex flex-col lg:flex-row antialiased font-sans">
      {/* ─── SIDEBAR (ChatGPT Style) ─── */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0 lg:w-20"
        } transition-all duration-300 ease-in-out shrink-0 bg-[#171717] border-r border-[#262626] flex flex-col justify-between overflow-hidden relative z-30`}
      >
        <div className="p-4 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-3 overflow-hidden group"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#5B5BF0] to-[#818CF8] flex items-center justify-center text-white shrink-0 shadow-[0_2px_10px_rgba(91,91,240,0.35)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <div className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                    <span>LaunchOS</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-[#5B5BF0]/20 text-[#818CF8] rounded border border-[#5B5BF0]/30 font-semibold">
                      Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] truncate">
                    Moderation Suite
                  </p>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#262626] transition-colors"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* New Submission Button */}
          {sidebarOpen ? (
            <Link
              href="/submit"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[#262626] hover:bg-[#303030] border border-[#383838] text-xs font-semibold text-white transition-all shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-[#818CF8]" />
              <span>Submit New Tool</span>
              <ExternalLink className="h-3 w-3 text-[#71717A] ml-auto" />
            </Link>
          ) : (
            <Link
              href="/submit"
              target="_blank"
              className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl bg-[#262626] hover:bg-[#303030] text-white"
              title="Submit New Tool"
            >
              <Sparkles className="h-4 w-4 text-[#818CF8]" />
            </Link>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#71717A]">
              {sidebarOpen && "Directory Management"}
            </div>

            {/* Pending Queue Tab Button */}
            <button
              type="button"
              onClick={() => setCurrentTab("pending")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                currentTab === "pending"
                  ? "bg-[#262626] text-white border border-[#383838] shadow-sm"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#212121]"
              }`}
            >
              <Inbox
                className={`h-4 w-4 shrink-0 ${
                  currentTab === "pending" ? "text-[#818CF8]" : "text-[#71717A]"
                }`}
              />
              {sidebarOpen && <span>Pending Queue</span>}
              {sidebarOpen && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px] font-bold">
                  {optimisticListings.length}
                </span>
              )}
            </button>

            {/* Approved Tools Tab Button */}
            <button
              type="button"
              onClick={() => setCurrentTab("approved")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                currentTab === "approved"
                  ? "bg-[#262626] text-white border border-[#383838] shadow-sm"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#212121]"
              }`}
            >
              <CheckCircle
                className={`h-4 w-4 shrink-0 ${
                  currentTab === "approved" ? "text-[#10B981]" : "text-[#71717A]"
                }`}
              />
              {sidebarOpen && <span>Approved Tools</span>}
              {sidebarOpen && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] font-bold">
                  {approvedListings.length}
                </span>
              )}
            </button>

            {/* Reviews & Comments Moderation */}
            <Link
              href="/admin/moderation"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-[#212121] transition-all"
            >
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
              {sidebarOpen && <span>Reviews &amp; Comments</span>}
            </Link>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#212121] text-xs font-medium transition-colors"
            >
              <Globe className="h-4 w-4 shrink-0 text-[#71717A]" />
              {sidebarOpen && <span>Live Directory</span>}
              {sidebarOpen && (
                <ExternalLink className="h-3 w-3 text-[#52525B] ml-auto" />
              )}
            </Link>

            <Link
              href="/categories"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#212121] text-xs font-medium transition-colors"
            >
              <Layers className="h-4 w-4 shrink-0 text-[#71717A]" />
              {sidebarOpen && <span>Categories</span>}
              {sidebarOpen && (
                <ExternalLink className="h-3 w-3 text-[#52525B] ml-auto" />
              )}
            </Link>

            <div className="pt-4 px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#71717A]">
              {sidebarOpen && "SEO & Sitemaps"}
            </div>

            <Link
              href="/sitemap.xml"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#212121] text-xs font-medium transition-colors"
            >
              <FileCode className="h-4 w-4 shrink-0 text-[#10B981]" />
              {sidebarOpen && <span>Root Sitemap Index</span>}
            </Link>

            <Link
              href="/sitemap/0.xml"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#212121] text-xs font-medium transition-colors"
            >
              <FileText className="h-4 w-4 shrink-0 text-[#3B82F6]" />
              {sidebarOpen && <span>Chunk 0: Static &amp; Cats</span>}
            </Link>

            <Link
              href="/sitemap/1.xml"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#212121] text-xs font-medium transition-colors"
            >
              <Laptop className="h-4 w-4 shrink-0 text-[#8B5CF6]" />
              {sidebarOpen && <span>Chunk 1: Approved Tools</span>}
            </Link>

            <Link
              href="/llms.txt"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#212121] text-xs font-medium transition-colors"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
              {sidebarOpen && <span>AI Endpoint (/llms.txt)</span>}
            </Link>

            <Link
              href="/robots.txt"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#212121] text-xs font-medium transition-colors"
            >
              <FileText className="h-4 w-4 shrink-0 text-[#71717A]" />
              {sidebarOpen && <span>Robots.txt</span>}
            </Link>
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-[#262626] bg-[#121212]">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#1A1A1A] border border-[#2B2B2B]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#5B5BF0] to-[#EC4899] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                VO
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    vinay.olis3@gmail.com
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#10B981]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span>Verified Admin</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#262626] transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT CANVAS ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-[#121212]/90 backdrop-blur border-b border-[#262626] px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl border border-[#2B2B2B] bg-[#1A1A1A] text-[#A1A1AA] hover:text-white lg:hidden"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#71717A] mb-1">
                <span>LaunchOS</span>
                <span>/</span>
                <span className="text-[#A1A1AA]">Admin</span>
                <span>/</span>
                <span className="text-[#818CF8] font-medium capitalize">
                  {currentTab === "pending" ? "Pending Queue" : "Approved Directory"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <span>
                  {currentTab === "pending"
                    ? "Pending Moderation Queue"
                    : "Approved & Published Tools"}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold font-mono border ${
                    currentTab === "pending"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {currentTab === "pending"
                    ? `${optimisticListings.length} Pending`
                    : `${approvedListings.length} Approved`}
                </span>
              </h1>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, slugs, emails..."
                className="w-full h-9 rounded-xl border border-[#2B2B2B] bg-[#1A1A1A] pl-10 pr-3.5 text-xs text-white placeholder:text-[#71717A] focus:border-[#5B5BF0] focus:outline-none"
              />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div
              role="status"
              className={`p-4 rounded-xl border text-sm flex items-center justify-between shadow-lg ${
                actionFeedback.type === "success"
                  ? "bg-[#064E3B]/40 border-[#059669]/50 text-[#A7F3D0]"
                  : "bg-[#7F1D1D]/40 border-[#DC2626]/50 text-[#FECACA]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {actionFeedback.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-[#34D399]" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-[#F87171]" />
                )}
                <span className="font-medium">{actionFeedback.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionFeedback(null)}
                className="text-xs underline opacity-80 hover:opacity-100 ml-4 font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Tab Switcher & Pricing Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
            {/* View Switcher Tabs */}
            <div className="inline-flex rounded-xl bg-[#1A1A1A] p-1 border border-[#2B2B2B]">
              <button
                type="button"
                onClick={() => setCurrentTab("pending")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  currentTab === "pending"
                    ? "bg-[#2B2B2B] text-white shadow-sm"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                <span>Pending Review</span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                  {optimisticListings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab("approved")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  currentTab === "approved"
                    ? "bg-[#2B2B2B] text-white shadow-sm"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                <span>Approved Listings</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  {approvedListings.length}
                </span>
              </button>
            </div>

            {/* Pricing Model Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-[#71717A] font-semibold uppercase flex items-center gap-1.5 mr-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Pricing:</span>
              </span>
              {["all", "free", "freemium", "paid", "one_time"].map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setPricingFilter(model)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    pricingFilter === model
                      ? "bg-[#5B5BF0] text-white shadow-[0_2px_8px_rgba(91,91,240,0.3)] font-bold"
                      : "bg-[#1A1A1A] text-[#A1A1AA] hover:text-white hover:bg-[#262626] border border-[#2B2B2B]"
                  }`}
                >
                  {model === "one_time" ? "One-Time" : model}
                </button>
              ))}
            </div>
          </div>

          {/* List Cards */}
          {filteredListings.length === 0 ? (
            <div className="rounded-2xl border border-[#262626] bg-[#141414] p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-[#1F1F1F] border border-[#2B2B2B] flex items-center justify-center mx-auto text-[#71717A]">
                {currentTab === "pending" ? (
                  <Inbox className="h-6 w-6" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-[#10B981]" />
                )}
              </div>
              <h3 className="text-base font-bold text-white">
                {currentTab === "pending"
                  ? "All caught up! No pending submissions."
                  : "No approved listings match this filter."}
              </h3>
              <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                {searchQuery || pricingFilter !== "all"
                  ? "No listings matched your active search or pricing filter. Try clearing the filter."
                  : currentTab === "pending"
                  ? "New tools submitted by creators will appear here for review and one-click publishing."
                  : "When you approve a listing from the Pending Queue, it will appear here and in the live directory."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((item) => {
                const safeWebsite = safeHttpsUrl(item.website_url);
                const safeLogo = safeHttpsUrl(item.logo_url);
                const screenshots = [...(item.listing_screenshots || [])].sort(
                  (a, b) => a.position - b.position
                );
                const isRowBusy = isPending && pendingActionId === item.id;
                const isExpanded = expandedItemId === item.id;
                const isApprovedItem = currentTab === "approved";

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-[#262626] bg-[#171717] hover:border-[#333333] transition-all shadow-md overflow-hidden p-5 sm:p-6 space-y-4"
                  >
                    {/* Header Row: Logo, Name, Meta Pills & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        {safeLogo ? (
                          <img
                            src={safeLogo}
                            alt={`${item.name} logo`}
                            className="w-14 h-14 rounded-2xl object-cover border border-[#333333] bg-[#0E0E10] shrink-0 shadow-sm"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl border border-[#2B2B2B] bg-[#1F1F1F] flex items-center justify-center text-[10px] text-[#71717A] shrink-0 font-medium">
                            No Logo
                          </div>
                        )}

                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-white tracking-tight truncate">
                              {item.name}
                            </h2>

                            {isApprovedItem ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>Published &amp; Indexed</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Pending Review</span>
                              </span>
                            )}

                            {item.reference_code && (
                              <span className="px-2 py-0.5 rounded-md bg-[#5B5BF0]/15 text-[#818CF8] border border-[#5B5BF0]/30 text-[11px] font-mono font-semibold">
                                Ref: {item.reference_code}
                              </span>
                            )}

                            <span className="px-2 py-0.5 rounded-md bg-[#262626] text-[#D4D4D8] border border-[#333333] text-[11px] font-medium">
                              {resolveCategoryLabel(item)}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                                item.pricing_model === "free"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : item.pricing_model === "freemium"
                                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                  : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                              }`}
                            >
                              {item.pricing_model}
                              {item.starting_price
                                ? ` • $${item.starting_price}/${
                                    item.billing_period === "one_time"
                                      ? "once"
                                      : item.billing_period === "yearly"
                                      ? "yr"
                                      : "mo"
                                  }`
                                : ""}
                            </span>

                            {/* Directory Listing Plan Badge */}
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase bg-[#5B5BF0]/15 text-[#818CF8] border border-[#5B5BF0]/30">
                              {item.listing_plan === "featured"
                                ? "Featured ($49)"
                                : item.listing_plan === "premium"
                                ? "Premium ($29)"
                                : "Free Listing ($0)"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#71717A]">
                            <span className="font-mono text-[#A1A1AA]">
                              slug: <strong className="text-white">{item.slug}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              By:{" "}
                              <strong className="text-[#D4D4D8]">
                                {item.submitted_by_email}
                              </strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {isApprovedItem && item.approved_at
                                  ? `Approved: ${new Date(
                                      item.approved_at
                                    ).toLocaleDateString()}`
                                  : `Submitted: ${new Date(
                                      item.created_at
                                    ).toLocaleDateString()}`}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                        {isApprovedItem ? (
                          <>
                            <Link
                              href={`/product/${item.slug}`}
                              target="_blank"
                              className="px-3.5 py-2 rounded-xl bg-[#262626] hover:bg-[#303030] border border-[#383838] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <span>View Public Page</span>
                              <ExternalLink className="h-3.5 w-3.5 text-[#818CF8]" />
                            </Link>

                            <button
                              type="button"
                              disabled={isRowBusy}
                              onClick={() => handleModeration(item, "reject")}
                              className="px-3 py-2 rounded-xl border border-[#7F1D1D]/70 bg-[#450A0A]/40 text-[#F87171] hover:bg-[#7F1D1D]/60 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                              title="Revoke approval / unpublish listing"
                            >
                              <X className="h-4 w-4" />
                              <span>Take Down</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={isRowBusy}
                              onClick={() => handleModeration(item, "reject")}
                              className="px-3.5 py-2 rounded-xl border border-[#7F1D1D]/70 bg-[#450A0A]/40 text-[#F87171] hover:bg-[#7F1D1D]/60 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                              <span>Reject</span>
                            </button>

                            <button
                              type="button"
                              disabled={isRowBusy}
                              onClick={() => handleModeration(item, "approve")}
                              className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#10B981] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(5,150,105,0.3)] disabled:opacity-50"
                            >
                              {isRowBusy ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              <span>Approve &amp; Publish</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Tagline & Descriptions */}
                    <div className="bg-[#121212] rounded-xl p-4 border border-[#222222] space-y-2">
                      <div className="text-sm font-semibold text-white">
                        {item.tagline}
                      </div>

                      <p className="text-xs text-[#A1A1AA] leading-relaxed">
                        {item.description_short}
                      </p>

                      {item.description_long && (
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedItemId(isExpanded ? null : item.id)
                            }
                            className="text-[11px] font-semibold text-[#818CF8] hover:text-[#A5B4FC] flex items-center gap-1 mt-1 transition-colors"
                          >
                            <span>
                              {isExpanded ? "Hide Full Copy" : "Read Full Copy"}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 pt-2 border-t border-[#262626] text-xs text-[#D4D4D8] leading-relaxed whitespace-pre-wrap">
                              {item.description_long}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Website Link & Screenshots Gallery */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                      {safeWebsite ? (
                        <a
                          href={safeWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#818CF8] hover:text-[#A5B4FC] font-medium"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="truncate max-w-xs">{safeWebsite}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-[#71717A]">
                          No HTTPS Website Provided
                        </span>
                      )}

                      {screenshots.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto">
                          <span className="text-[11px] text-[#71717A] font-semibold uppercase">
                            Screenshots ({screenshots.length}):
                          </span>
                          {screenshots.map((shot, idx) => {
                            const safeShot = safeHttpsUrl(shot.url);
                            if (!safeShot) return null;
                            return (
                              <button
                                key={shot.id}
                                type="button"
                                onClick={() => setPreviewImage(safeShot)}
                                className="relative rounded-lg overflow-hidden border border-[#333333] hover:border-[#818CF8] transition-all shrink-0 group"
                              >
                                <img
                                  src={safeShot}
                                  alt={`Screenshot ${idx + 1}`}
                                  className="w-14 h-9 object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="h-3 w-3 text-white" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ─── FULL RESOLUTION SCREENSHOT LIGHTBOX MODAL ─── */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-[#18181B] rounded-2xl border border-[#333333] overflow-hidden shadow-2xl p-2"
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt="Screenshot Preview"
              className="w-full h-auto max-h-[82vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
