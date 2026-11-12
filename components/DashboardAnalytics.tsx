"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  ExternalLink,
  Star,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Globe,
} from "lucide-react";
import type { AnalyticsSummary, TimeRangeFilter } from "@/lib/analytics";

interface DashboardAnalyticsProps {
  initialData?: AnalyticsSummary | null;
  isAdmin?: boolean;
  userEmail?: string;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  initialData,
  isAdmin = false,
  userEmail,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>("30d");
  const [scope, setScope] = useState<"all" | "mine">(isAdmin ? "all" : "mine");
  const [data, setData] = useState<AnalyticsSummary | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);

  const fetchAnalytics = async (range: TimeRangeFilter, currentScope: "all" | "mine") => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/analytics/dashboard?range=${range}&scope=${currentScope}`
      );
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.analytics) {
          setData(json.analytics);
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange, scope);
  }, [timeRange, scope]);

  const maxChartValue = Math.max(
    1,
    ...(data?.timeSeries.map((d) => Math.max(d.views, d.clicks, d.reviews)) || [1])
  );

  return (
    <div className="space-y-6">
      {/* Header with Title & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E6F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-[#14142B] tracking-tight">
              Performance Analytics
            </h2>
            {isLoading && (
              <RefreshCw className="h-3.5 w-3.5 text-[#4F46E5] animate-spin" />
            )}
          </div>
          <p className="text-xs text-[#55556E] mt-0.5">
            {scope === "all"
              ? "Platform-wide directory telemetry, views and reviews"
              : `Telemetry for tools submitted by ${userEmail || "your account"}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Admin Scope Toggle */}
          {isAdmin && (
            <div className="flex items-center bg-[#F1F1F8] p-1 rounded-xl border border-[#E6E6F0] text-xs">
              <button
                type="button"
                onClick={() => setScope("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  scope === "all"
                    ? "bg-white text-[#14142B] shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                All Directory
              </button>
              <button
                type="button"
                onClick={() => setScope("mine")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  scope === "mine"
                    ? "bg-white text-[#14142B] shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                My Tools
              </button>
            </div>
          )}

          {/* Time Range Filter Pills */}
          <div className="flex items-center bg-[#F1F1F8] p-1 rounded-xl border border-[#E6E6F0] text-xs">
            {(
              [
                { label: "Today", value: "today" },
                { label: "7 Days", value: "7d" },
                { label: "30 Days", value: "30d" },
                { label: "All Time", value: "all" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setTimeRange(tab.value)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  timeRange === tab.value
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Listings */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#55556E]">
              Total Listings
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#F7F6FF] text-[#4F46E5] flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-heading font-extrabold text-3xl text-[#14142B]">
              {data?.totalListings.total ?? 0}
            </div>
            <p className="text-[11px] text-[#55556E] mt-0.5">
              Unique submitted products
            </p>
          </div>
          <div className="pt-2 border-t border-[#F1F1F8] flex items-center gap-2 text-[11px] font-mono">
            <span className="text-[#0F8A5F] flex items-center gap-1 font-bold">
              <CheckCircle2 className="h-3 w-3" />
              {data?.totalListings.approved ?? 0}
            </span>
            <span className="text-[#7A4E00] flex items-center gap-1 font-bold">
              <Clock className="h-3 w-3" />
              {data?.totalListings.pending ?? 0}
            </span>
            <span className="text-[#DC2626] flex items-center gap-1 font-bold">
              <AlertTriangle className="h-3 w-3" />
              {data?.totalListings.rejected ?? 0}
            </span>
          </div>
        </div>

        {/* Card 2: Listing Views */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#55556E]">
              Listing Views
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-heading font-extrabold text-3xl text-[#14142B]">
              {data?.totalViews.toLocaleString() ?? 0}
            </div>
            <p className="text-[11px] text-[#55556E] mt-0.5">
              Verified product page visits
            </p>
          </div>
          <div className="pt-2 border-t border-[#F1F1F8] text-[11px] text-[#55556E] flex items-center gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F8A5F]"></span>
            <span>Deduplicated • Bot filtered</span>
          </div>
        </div>

        {/* Card 3: Website Clicks */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#55556E]">
              Website Clicks
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#ECFDF5] text-[#0F8A5F] flex items-center justify-center">
              <ExternalLink className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-heading font-extrabold text-3xl text-[#14142B]">
              {data?.totalWebsiteClicks.toLocaleString() ?? 0}
            </div>
            <p className="text-[11px] text-[#55556E] mt-0.5">
              Outbound founder referral clicks
            </p>
          </div>
          <div className="pt-2 border-t border-[#F1F1F8] text-[11px] text-[#55556E] flex items-center justify-between font-mono">
            <span>CTR:</span>
            <span className="font-bold text-[#14142B]">
              {data && data.totalViews > 0
                ? `${((data.totalWebsiteClicks / data.totalViews) * 100).toFixed(1)}%`
                : "0.0%"}
            </span>
          </div>
        </div>

        {/* Card 4: Total Reviews */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#55556E]">
              Total Reviews
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#FEFCE8] text-[#CA8A04] flex items-center justify-center">
              <Star className="h-4 w-4 fill-[#CA8A04]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-3xl text-[#14142B]">
                {data?.totalReviews ?? 0}
              </span>
              {data && data.averageRating > 0 && (
                <span className="text-sm font-bold text-[#CA8A04] flex items-center gap-0.5">
                  ★ {data.averageRating}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#55556E] mt-0.5">
              Approved community ratings
            </p>
          </div>
          <div className="pt-2 border-t border-[#F1F1F8] text-[11px] text-[#55556E] flex items-center justify-between font-mono">
            <span>Average:</span>
            <span className="font-bold text-[#14142B]">
              {data?.averageRating ? `${data.averageRating} / 5.0` : "No ratings yet"}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Chart: Activity over time */}
      <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-heading font-bold text-base text-[#14142B]">
              Activity &amp; Engagement Over Time
            </h3>
            <p className="text-xs text-[#55556E]">
              Daily views (indigo), outbound website clicks (green), and reviews (amber)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-[#55556E]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#4F46E5]"></span>
              Views
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0F8A5F]"></span>
              Clicks
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#CA8A04]"></span>
              Reviews
            </span>
          </div>
        </div>

        {/* Lightweight SVG Bar / Columns visualization */}
        {!data?.timeSeries || data.timeSeries.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-xs text-[#55556E]">
            No activity recorded for this date range yet.
          </div>
        ) : (
          <div className="pt-4">
            <div className="grid grid-flow-col auto-cols-fr gap-2 sm:gap-3 items-end h-44 border-b border-[#E6E6F0] pb-2">
              {data.timeSeries.map((item) => {
                const viewsHeight = Math.max(4, (item.views / maxChartValue) * 100);
                const clicksHeight = Math.max(4, (item.clicks / maxChartValue) * 100);
                const reviewsHeight = Math.max(4, (item.reviews / maxChartValue) * 100);

                return (
                  <div
                    key={item.date}
                    className="flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-[#14142B] text-white text-[10px] rounded-lg p-2 shadow-lg z-20 whitespace-nowrap pointer-events-none">
                      <span className="font-bold border-b border-white/20 pb-0.5 mb-1">
                        {item.date}
                      </span>
                      <span>Views: {item.views}</span>
                      <span>Clicks: {item.clicks}</span>
                      <span>Reviews: {item.reviews}</span>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      {/* Views bar */}
                      <div
                        style={{ height: `${viewsHeight}%` }}
                        className="w-1/3 max-w-[12px] bg-[#4F46E5] rounded-t-sm transition-all group-hover:bg-[#4338CA]"
                      ></div>
                      {/* Clicks bar */}
                      <div
                        style={{ height: `${clicksHeight}%` }}
                        className="w-1/3 max-w-[12px] bg-[#0F8A5F] rounded-t-sm transition-all group-hover:bg-[#0d7550]"
                      ></div>
                      {/* Reviews bar */}
                      <div
                        style={{ height: `${reviewsHeight}%` }}
                        className="w-1/3 max-w-[12px] bg-[#CA8A04] rounded-t-sm transition-all group-hover:bg-[#b07803]"
                      ></div>
                    </div>

                    <span className="text-[10px] font-mono text-[#55556E] mt-2 truncate w-full text-center">
                      {item.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Top Performing Listings Table */}
      <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E6E6F0] pb-3">
          <div>
            <h3 className="font-heading font-bold text-base text-[#14142B]">
              Top Performing Listings
            </h3>
            <p className="text-xs text-[#55556E]">
              Ranked by total page views and outbound website clicks
            </p>
          </div>
        </div>

        {!data?.topListings || data.topListings.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#55556E]">
            No approved listings with performance traffic recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6E6F0] font-mono uppercase text-[#55556E] tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Views</th>
                  <th className="py-2.5 px-3 text-right">Website Clicks</th>
                  <th className="py-2.5 px-3 text-right">CTR</th>
                  <th className="py-2.5 px-3 text-right">Rating</th>
                  <th className="py-2.5 px-3 text-right">Reviews</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1F8]">
                {data.topListings.map((item) => {
                  const ctr =
                    item.views > 0
                      ? `${((item.clicks / item.views) * 100).toFixed(1)}%`
                      : "0.0%";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F6F6FB] transition-colors"
                    >
                      <td className="py-3 px-3 font-bold text-[#14142B]">
                        <Link
                          href={`/product/${item.slug}`}
                          className="hover:text-[#4F46E5] transition-colors flex items-center gap-1.5"
                        >
                          <span>{item.name}</span>
                          <span className="font-mono text-[10px] text-[#55556E] font-normal">
                            #{item.id}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#14142B]">
                        {item.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#0F8A5F] font-bold">
                        {item.clicks.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#55556E]">
                        {ctr}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {item.rating > 0 ? (
                          <span className="text-[#CA8A04] font-bold flex items-center justify-end gap-0.5">
                            ★ {item.rating}
                          </span>
                        ) : (
                          <span className="text-[#55556E]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#14142B]">
                        {item.reviewsCount}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-[#4F46E5] hover:underline font-semibold inline-flex items-center gap-0.5"
                        >
                          <span>View</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

