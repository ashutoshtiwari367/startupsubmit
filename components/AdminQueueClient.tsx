"use client";

import React, { useOptimistic, useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  FolderPlus,
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
import { AdminSidebar } from "@/components/AdminSidebar";
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "approved") {
        setCurrentTab("approved");
      } else if (tabParam === "pending") {
        setCurrentTab("pending");
      }
    }
  }, []);

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
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] flex flex-col lg:flex-row antialiased font-sans">
      {/* ─── UNIFIED LIGHT SIDEBAR ─── */}
      <AdminSidebar
        currentRoute={currentTab}
        pendingQueueCount={optimisticListings.length}
        approvedQueueCount={approvedListings.length}
        onTabChange={(tab) => setCurrentTab(tab)}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* ─── MAIN CONTENT CANVAS ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#E6E6F0] px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl border border-[#E6E6F0] bg-[#F6F6FB] text-[#55556E] hover:text-[#14142B] lg:hidden"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#71717A] mb-1">
                <span>LaunchOS</span>
                <span>/</span>
                <span className="text-[#55556E]">Admin</span>
                <span>/</span>
                <span className="text-[#4F46E5] font-semibold capitalize">
                  {currentTab === "pending" ? "Pending Queue" : "Approved Directory"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#14142B] tracking-tight flex items-center gap-2.5">
                <span>
                  {currentTab === "pending"
                    ? "Pending Moderation Queue"
                    : "Approved & Published Tools"}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono border ${
                    currentTab === "pending"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border-emerald-200"
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
                className="w-full h-9 rounded-xl border border-[#E6E6F0] bg-white pl-10 pr-3.5 text-xs text-[#14142B] placeholder:text-[#94A3B8] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10 shadow-2xs"
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
              className={`p-4 rounded-xl border text-sm flex items-center justify-between shadow-2xs ${
                actionFeedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {actionFeedback.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{actionFeedback.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionFeedback(null)}
                className="text-xs underline opacity-80 hover:opacity-100 ml-4 font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Tab Switcher & Pricing Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E6F0] pb-4">
            {/* View Switcher Tabs */}
            <div className="inline-flex rounded-xl bg-white p-1 border border-[#E6E6F0] shadow-2xs">
              <button
                type="button"
                onClick={() => setCurrentTab("pending")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === "pending"
                    ? "bg-[#4F46E5] text-white shadow-2xs"
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                <span>Pending Review</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    currentTab === "pending"
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {optimisticListings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab("approved")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === "approved"
                    ? "bg-[#4F46E5] text-white shadow-2xs"
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                <span>Approved Listings</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    currentTab === "approved"
                      ? "bg-white/20 text-white"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {approvedListings.length}
                </span>
              </button>
            </div>

            {/* Pricing Model Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-[#55556E] font-semibold uppercase flex items-center gap-1.5 mr-1">
                <Filter className="h-3.5 w-3.5 text-[#71717A]" />
                <span>Pricing:</span>
              </span>
              {["all", "free", "freemium", "paid", "one_time"].map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setPricingFilter(model)}
                  className={`px-3 py-1 rounded-lg text-xs font-heading font-semibold capitalize transition-all cursor-pointer ${
                    pricingFilter === model
                      ? "bg-[#4F46E5] text-white shadow-xs font-bold"
                      : "bg-white text-[#55556E] hover:text-[#14142B] hover:bg-[#F8FAFC] border border-[#E6E6F0]"
                  }`}
                >
                  {model === "one_time" ? "One-Time" : model}
                </button>
              ))}
            </div>
          </div>

          {/* List Cards */}
          {filteredListings.length === 0 ? (
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-12 text-center space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center mx-auto text-[#4F46E5]">
                {currentTab === "pending" ? (
                  <Inbox className="h-6 w-6" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-[#10B981]" />
                )}
              </div>
              <h3 className="text-base font-heading font-bold text-[#14142B]">
                {currentTab === "pending"
                  ? "All caught up! No pending submissions."
                  : "No approved listings match this filter."}
              </h3>
              <p className="text-xs text-[#55556E] max-w-sm mx-auto">
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
                    className="rounded-2xl border border-[#E6E6F0] bg-white hover:border-[#CBD5E1] transition-all shadow-xs hover:shadow-md p-5 sm:p-6 space-y-4"
                  >
                    {/* Header Row: Logo, Name, Meta Pills & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        {safeLogo ? (
                          <img
                            src={safeLogo}
                            alt={`${item.name} logo`}
                            className="w-14 h-14 rounded-2xl object-cover border border-[#E6E6F0] bg-[#F8FAFC] shrink-0 shadow-2xs"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl border border-[#E6E6F0] bg-[#F8FAFC] flex items-center justify-center text-[10px] text-[#71717A] shrink-0 font-medium">
                            No Logo
                          </div>
                        )}

                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-heading font-extrabold text-[#14142B] tracking-tight truncate">
                              {item.name}
                            </h2>

                            {isApprovedItem ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>Published &amp; Indexed</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Pending Review</span>
                              </span>
                            )}

                            {item.reference_code && (
                              <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] text-[11px] font-mono font-semibold">
                                Ref: {item.reference_code}
                              </span>
                            )}

                            <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#55556E] border border-[#E6E6F0] text-[11px] font-medium">
                              {resolveCategoryLabel(item)}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                                item.pricing_model === "free"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : item.pricing_model === "freemium"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-purple-100 text-purple-800 border border-purple-200"
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
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                                item.listing_plan === "featured"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold"
                                  : item.listing_plan === "premium"
                                  ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF]"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {item.listing_plan === "featured"
                                ? "Featured ($49)"
                                : item.listing_plan === "premium"
                                ? "Premium ($29)"
                                : "Free Listing ($0)"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#55556E]">
                            <span className="font-mono text-[#71717A]">
                              slug: <strong className="text-[#14142B]">{item.slug}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              By:{" "}
                              <strong className="text-[#14142B]">
                                {item.submitted_by_email}
                              </strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#71717A]" />
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
                              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E6E6F0] text-[#14142B] text-xs font-heading font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                            >
                              <span>View Public Page</span>
                              <ExternalLink className="h-3.5 w-3.5 text-[#4F46E5]" />
                            </Link>

                            <button
                              type="button"
                              disabled={isRowBusy}
                              onClick={() => handleModeration(item, "reject")}
                              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-heading font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
                              className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-heading font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                              <span>Reject</span>
                            </button>

                            <button
                              type="button"
                              disabled={isRowBusy}
                              onClick={() => handleModeration(item, "approve")}
                              className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-heading font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
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
                    <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E6E6F0] space-y-2">
                      <div className="text-sm font-heading font-bold text-[#14142B]">
                        {item.tagline}
                      </div>

                      <p className="text-xs text-[#55556E] leading-relaxed">
                        {item.description_short}
                      </p>

                      {item.description_long && (
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedItemId(isExpanded ? null : item.id)
                            }
                            className="text-[11px] font-heading font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 mt-1 transition-colors cursor-pointer"
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
                            <div className="mt-2 pt-2 border-t border-[#E6E6F0] text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">
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
                          className="inline-flex items-center gap-1.5 text-xs text-[#4F46E5] hover:text-[#4338CA] font-medium"
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
                                className="relative rounded-lg overflow-hidden border border-[#E6E6F0] hover:border-[#4F46E5] transition-all shrink-0 group cursor-pointer"
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
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl border border-[#E6E6F0] overflow-hidden shadow-2xl p-2"
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
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
