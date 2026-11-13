"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/AdminSidebar";
import type { AnalyticsSummary, TimeRangeFilter } from "@/lib/analytics";
import {
  BarChart3,
  Eye,
  ExternalLink,
  TrendingUp,
  Star,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Menu,
  Globe,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";

export interface AdminAnalyticsListingItem {
  id: number;
  name: string;
  slug: string;
  status: string;
  submitted_by_email?: string | null;
  created_at?: string;
}

interface AdminAnalyticsClientProps {
  initialAnalytics: AnalyticsSummary;
  allListings: AdminAnalyticsListingItem[];
}

export function AdminAnalyticsClient({
  initialAnalytics,
  allListings,
}: AdminAnalyticsClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>("30d");
  const [selectedListingId, setSelectedListingId] = useState<string>("all");
  const [tableSearch, setTableSearch] = useState("");
  const [data, setData] = useState<AnalyticsSummary>(initialAnalytics);
  const [isLoading, setIsLoading] = useState(false);

  const selectedTool =
    selectedListingId !== "all"
      ? allListings.find((l) => String(l.id) === selectedListingId)
      : null;

  const fetchAnalytics = async (range: TimeRangeFilter, listingIdVal: string) => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/analytics", window.location.origin);
      url.searchParams.set("range", range);
      if (listingIdVal !== "all") {
        url.searchParams.set("listingId", listingIdVal);
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.analytics) {
          setData(json.analytics);
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (range: TimeRangeFilter) => {
    setTimeRange(range);
    fetchAnalytics(range, selectedListingId);
  };

  const handleListingSelectChange = (newListingId: string) => {
    setSelectedListingId(newListingId);
    fetchAnalytics(timeRange, newListingId);
  };

  const handleInspectListing = (id: number) => {
    const strId = String(id);
    setSelectedListingId(strId);
    fetchAnalytics(timeRange, strId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetToAll = () => {
    setSelectedListingId("all");
    fetchAnalytics(timeRange, "all");
  };

  // Safe CTR computation
  const ctrPercent =
    data.totalViews > 0
      ? ((data.totalWebsiteClicks / data.totalViews) * 100).toFixed(1)
      : "0.0";

  // Filter listings for the table
  const filteredListings = allListings.filter((l) => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase().trim();
    return (
      l.name.toLowerCase().includes(q) ||
      l.slug.toLowerCase().includes(q) ||
      (l.submitted_by_email && l.submitted_by_email.toLowerCase().includes(q))
    );
  });

  // Calculate top values for chart scaling
  const maxDayValue = Math.max(
    1,
    ...data.timeSeries.map((d) => Math.max(d.views, d.clicks, d.reviews))
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#14142B] flex flex-col lg:flex-row antialiased font-sans">
      {/* Unified Light Sidebar */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar currentRoute="analytics" />
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 bg-white h-full shadow-2xl flex flex-col">
            <AdminSidebar currentRoute="analytics" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#E6E6F0] px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#55556E] hover:bg-[#F1F1F8] border border-[#E6E6F0]"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14142B] tracking-tight">
                  Analytics &amp; Performance Reports
                </h1>
              </div>
              <p className="text-xs text-[#55556E] mt-0.5">
                Directory-wide telemetry, outbound link conversions, reviews, and tool drilldown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E6E6F0] bg-white text-xs font-semibold text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB] transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-[#71717A]" />
              <span>Public Directory</span>
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 sm:p-8 max-w-[1300px] w-full mx-auto space-y-6">
          {/* Controls Bar: Filter by Tool + Filter by Range */}
          <div className="rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tool Selection Dropdown */}
            <div className="flex-1 max-w-xl space-y-1.5">
              <label
                htmlFor="tool-selector"
                className="block text-xs font-heading font-bold text-[#14142B] uppercase tracking-wider"
              >
                Inspect Scope / Individual Tool
              </label>
              <div className="relative">
                <select
                  id="tool-selector"
                  value={selectedListingId}
                  onChange={(e) => handleListingSelectChange(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#D7D7E6] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#14142B] shadow-2xs focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 cursor-pointer pr-10"
                >
                  <option value="all">
                    🌐 All Directory (Platform Aggregate — {allListings.length} Tools)
                  </option>
                  <optgroup label="Individual Directory Tools">
                    {allListings.map((tool) => (
                      <option key={tool.id} value={String(tool.id)}>
                        [{tool.status.toUpperCase()}] {tool.name} — {tool.submitted_by_email || "No email"}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#71717A]">
                  <Filter className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Time Range Filter & Refresh */}
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <span className="block text-xs font-heading font-bold text-[#14142B] uppercase tracking-wider">
                  Time Period
                </span>
                <div className="flex items-center bg-[#F1F1F8] p-1 rounded-xl border border-[#E6E6F0] text-xs">
                  {(
                    [
                      { label: "Today", value: "today" },
                      { label: "7 Days", value: "7d" },
                      { label: "30 Days", value: "30d" },
                      { label: "All Time", value: "all" },
                    ] as const
                  ).map((pill) => (
                    <button
                      key={pill.value}
                      type="button"
                      onClick={() => handleTimeRangeChange(pill.value)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        timeRange === pill.value
                          ? "bg-white text-[#14142B] shadow-xs"
                          : "text-[#55556E] hover:text-[#14142B]"
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchAnalytics(timeRange, selectedListingId)}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-[#E6E6F0] bg-white hover:bg-[#F6F6FB] text-[#55556E] hover:text-[#14142B] transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh Analytics"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin text-[#4F46E5]" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Active Individual Tool Banner (when inspecting single tool) */}
          {selectedTool && (
            <div className="rounded-2xl border border-[#4F46E5]/20 bg-gradient-to-r from-[#F7F6FF] to-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#4F46E5] text-white">
                    Inspecting Individual Tool
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedTool.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : selectedTool.status === "pending"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {selectedTool.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
                    {selectedTool.status === "pending" && <Clock className="h-3 w-3" />}
                    {selectedTool.status === "rejected" && <XCircle className="h-3 w-3" />}
                    {selectedTool.status.toUpperCase()}
                  </span>
                </div>
                <h2 className="font-heading font-extrabold text-2xl text-[#14142B]">
                  {selectedTool.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#55556E]">
                  <span>
                    Submitter: <strong className="text-[#14142B]">{selectedTool.submitted_by_email || "Anonymous"}</strong>
                  </span>
                  <span>
                    Slug: <code className="font-mono bg-[#E0E7FF]/40 text-[#4F46E5] px-1.5 py-0.5 rounded">{selectedTool.slug}</code>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/listing/${selectedTool.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E6E6F0] hover:border-[#4F46E5] text-xs font-semibold text-[#14142B] transition-colors shadow-2xs"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#55556E]" />
                </Link>
                <button
                  type="button"
                  onClick={handleResetToAll}
                  className="px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white transition-colors shadow-xs"
                >
                  View All Directory
                </button>
              </div>
            </div>
          )}

          {/* Key KPI Metric Cards (Views, Clicks, CTR, Reviews) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* 1. Total Page Views */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#55556E]">
                <span className="font-heading font-semibold uppercase tracking-wider">
                  Page Views
                </span>
                <div className="p-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold font-heading text-[#14142B]">
                  {data.totalViews.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#55556E] mt-1">
                  Verified 30-min unique sessions
                </p>
              </div>
            </div>

            {/* 2. Outbound Website Clicks */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#55556E]">
                <span className="font-heading font-semibold uppercase tracking-wider">
                  Outbound Clicks
                </span>
                <div className="p-2 rounded-xl bg-[#ECFDF5] text-[#10B981]">
                  <ExternalLink className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold font-heading text-[#14142B]">
                  {data.totalWebsiteClicks.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#55556E] mt-1">
                  Direct visits to external websites
                </p>
              </div>
            </div>

            {/* 3. Conversion Rate (CTR %) */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#55556E]">
                <span className="font-heading font-semibold uppercase tracking-wider">
                  Click-Through Rate
                </span>
                <div className="p-2 rounded-xl bg-[#F5F3FF] text-[#7C3AED]">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold font-heading text-[#14142B]">
                  {ctrPercent}%
                </div>
                <p className="text-[11px] text-[#55556E] mt-1">
                  Visitor-to-outbound conversion
                </p>
              </div>
            </div>

            {/* 4. Total Reviews & Rating */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#55556E]">
                <span className="font-heading font-semibold uppercase tracking-wider">
                  Reviews &amp; Ratings
                </span>
                <div className="p-2 rounded-xl bg-[#FFFBEB] text-[#F59E0B]">
                  <Star className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold font-heading text-[#14142B]">
                    {data.averageRating > 0 ? data.averageRating.toFixed(1) : "—"}
                  </span>
                  {data.averageRating > 0 && (
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i <= Math.round(data.averageRating)
                              ? "fill-current"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#55556E] mt-1">
                  {data.totalReviews} approved review{data.totalReviews === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Timeline & Rating Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Timeline (2 cols) */}
            <div className="lg:col-span-2 rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#14142B]">
                    Traffic &amp; Conversion Activity
                  </h3>
                  <p className="text-xs text-[#55556E]">
                    Chronological distribution of views vs. outbound clicks
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#4F46E5]" />
                    <span className="text-[#55556E]">Views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#10B981]" />
                    <span className="text-[#55556E]">Clicks</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Visual */}
              <div className="pt-6 pb-2">
                {data.timeSeries.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-xs text-[#55556E]">
                    No traffic activity recorded in this time range.
                  </div>
                ) : (
                  <div className="h-48 flex items-end gap-2 sm:gap-4 px-2">
                    {data.timeSeries.map((day) => {
                      const viewHeight = Math.max(
                        4,
                        Math.round((day.views / maxDayValue) * 100)
                      );
                      const clickHeight = Math.max(
                        day.clicks > 0 ? 4 : 0,
                        Math.round((day.clicks / maxDayValue) * 100)
                      );
                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                        >
                          {/* Tooltip on Hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-12 z-20 bg-[#14142B] text-white text-[10px] rounded-lg py-1 px-2 whitespace-nowrap shadow-lg">
                            <div className="font-mono">{day.date}</div>
                            <div>Views: {day.views} | Clicks: {day.clicks}</div>
                          </div>

                          {/* Bars */}
                          <div className="w-full flex items-end justify-center gap-1 h-36">
                            <div
                              style={{ height: `${viewHeight}%` }}
                              className="w-1/2 max-w-[14px] bg-[#4F46E5] rounded-t-sm transition-all group-hover:bg-[#4338CA]"
                              title={`${day.date}: ${day.views} views`}
                            />
                            <div
                              style={{ height: `${clickHeight}%` }}
                              className="w-1/2 max-w-[14px] bg-[#10B981] rounded-t-sm transition-all group-hover:bg-[#059669]"
                              title={`${day.date}: ${day.clicks} clicks`}
                            />
                          </div>

                          {/* Date Label */}
                          <span className="text-[10px] font-mono text-[#71717A] truncate max-w-[42px]">
                            {day.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Rating Distribution (1 col) */}
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4 shadow-2xs">
              <div>
                <h3 className="font-heading font-bold text-base text-[#14142B]">
                  Rating Breakdown
                </h3>
                <p className="text-xs text-[#55556E]">
                  Approved customer reviews distribution
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const count = data.ratingDistribution[star] || 0;
                  const pct =
                    data.totalReviews > 0
                      ? Math.round((count / data.totalReviews) * 100)
                      : 0;
                  return (
                    <div key={star} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-amber-500 font-semibold font-mono">
                          <span>{star}</span>
                          <Star className="h-3 w-3 fill-current" />
                        </div>
                        <div className="text-[11px] text-[#55556E] font-mono">
                          {count} ({pct}%)
                        </div>
                      </div>
                      <div className="h-2 w-full bg-[#F1F1F8] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-amber-400 rounded-full transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {data.totalReviews === 0 && (
                <div className="text-center py-6 text-xs text-[#55556E]">
                  No reviews submitted for this selection yet.
                </div>
              )}
            </div>
          </div>

          {/* Directory Listings Drilldown Table (Always visible for easy navigation) */}
          <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E6F0] pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#14142B]">
                  All Directory Tools Performance &amp; Drilldown
                </h3>
                <p className="text-xs text-[#55556E]">
                  Select &quot;Inspect Tool&quot; on any tool to load its individual report
                </p>
              </div>

              {/* Table Search */}
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
                <input
                  type="text"
                  placeholder="Search tool or submitter..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D7D7E6] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E6F0] text-[#55556E] font-heading font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Tool Name</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Submitter Email</th>
                    <th className="py-3 px-3 text-right">Views</th>
                    <th className="py-3 px-3 text-right">Clicks</th>
                    <th className="py-3 px-3 text-right">Rating</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E6F0]">
                  {filteredListings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#55556E]">
                        No directory tools found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredListings.map((tool) => {
                      const toolStats = data.topListings.find((tl) => tl.id === tool.id);
                      const isCurrentlyInspected = String(tool.id) === selectedListingId;

                      return (
                        <tr
                          key={tool.id}
                          className={`hover:bg-[#F9FAFB] transition-colors ${
                            isCurrentlyInspected ? "bg-[#EEF2FF]/40 font-semibold" : ""
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-heading font-bold text-[#14142B]">
                              {tool.name}
                            </div>
                            <div className="text-[11px] font-mono text-[#55556E]">
                              /{tool.slug}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                tool.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : tool.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {tool.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#55556E]">
                            {tool.submitted_by_email || "—"}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-[#14142B]">
                            {toolStats ? toolStats.views.toLocaleString() : "—"}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-[#10B981]">
                            {toolStats ? toolStats.clicks.toLocaleString() : "—"}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {toolStats && toolStats.reviewsCount > 0 ? (
                              <div className="inline-flex items-center gap-1 font-mono text-amber-600 font-bold">
                                <span>{toolStats.rating.toFixed(1)}</span>
                                <Star className="h-3 w-3 fill-current" />
                                <span className="text-[10px] text-[#71717A]">
                                  ({toolStats.reviewsCount})
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#94A3B8]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleInspectListing(tool.id)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                isCurrentlyInspected
                                  ? "bg-[#4F46E5] text-white"
                                  : "bg-[#F1F1F8] hover:bg-[#E0E7FF] text-[#4F46E5]"
                              }`}
                            >
                              <span>{isCurrentlyInspected ? "Inspecting" : "Inspect Tool"}</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

