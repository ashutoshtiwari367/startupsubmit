"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Mail,
  Tag,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  Loader2,
  LogOut,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "./Button";
import { approveListing, rejectListing } from "@/app/admin/actions";
import type { PricingModel, ListingStatus, BigIntId } from "@/types/db";

interface AdminScreenshotItem {
  id: BigIntId;
  url: string;
  position: number;
}

interface AdminCategoryInfo {
  id: BigIntId;
  slug: string;
  name: string;
}

export interface AdminListingItem {
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
  status: ListingStatus;
  submitted_by_email: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  categories?: AdminCategoryInfo | AdminCategoryInfo[] | null;
  listing_screenshots?: AdminScreenshotItem[];
}

export const AdminModerationQueue: React.FC = () => {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("pending");
  const [listings, setListings] = useState<AdminListingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<BigIntId | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    eventName?: string;
    type: "approve" | "reject";
  } | null>(null);

  const fetchQueue = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/listings?status=${encodeURIComponent(status)}`
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Failed to load moderation queue.");
      } else {
        setListings(data.listings || []);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Network error loading queue."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue(filterStatus);
  }, [filterStatus, fetchQueue]);

  const handleModeration = async (
    listingId: BigIntId,
    action: "approve" | "reject"
  ) => {
    setActionLoadingId(listingId);
    setError(null);

    try {
      const data =
        action === "approve"
          ? await approveListing(listingId)
          : await rejectListing(listingId);

      setToastMessage({
        text: data.message,
        eventName: data.event?.event_name,
        type: action,
      });

      // Remove from list if viewing a filtered tab, or update in place if viewing 'all'
      if (filterStatus === "all") {
        setListings((prev) =>
          prev.map((item) =>
            item.id === listingId
              ? {
                  ...item,
                  status: data.listing.status,
                  approved_at: data.listing.approved_at,
                }
              : item
          )
        );
      } else {
        setListings((prev) => prev.filter((item) => item.id !== listingId));
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : `Failed to ${action} listing.`
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  const resolveCategoryName = (item: AdminListingItem): string => {
    if (!item.categories) return String(item.category_id);
    if (Array.isArray(item.categories)) {
      return item.categories[0]?.name || String(item.category_id);
    }
    return item.categories.name || String(item.category_id);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F0F10]">
      {/* Top Admin Header */}
      <header className="border-b border-[#E8E8E3] bg-white sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-[#5B5BF0] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-base sm:text-lg text-[#0F0F10]">
                  LaunchOS Admin Moderation
                </h1>
                <span className="rounded-full bg-[#ECFDF5] text-[#059669] px-2 py-0.5 text-[10px] font-mono font-bold">
                  Auth-Gated
                </span>
              </div>
              <p className="text-[11px] text-[#66666B] font-mono">
                Approve or reject pending directory submissions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/submit">
              <Button variant="secondary" size="sm">
                + Submit Page
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Status Filter Tabs & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex rounded-[12px] border border-[#E8E8E3] bg-white p-1 shadow-xs">
            {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterStatus(tab)}
                className={`px-3.5 py-1.5 rounded-[8px] text-xs font-bold capitalize transition-all cursor-pointer ${
                  filterStatus === tab
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchQueue(filterStatus)}
            leftIcon={
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
            }
          >
            Refresh Queue
          </Button>
        </div>

        {/* Toast Event Feedback */}
        {toastMessage && (
          <div
            className={`rounded-[12px] border p-4 flex items-center justify-between text-xs sm:text-sm ${
              toastMessage.type === "approve"
                ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]"
                : "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toastMessage.type === "approve" ? (
                <CheckCircle2 className="h-5 w-5 text-[#059669] shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-[#DC2626] shrink-0" />
              )}
              <div>
                <span className="font-bold">{toastMessage.text}</span>
                {toastMessage.eventName && (
                  <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded bg-white/80 border border-current/20">
                    Event emitted: {toastMessage.eventName}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-xs font-bold underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="rounded-[12px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 flex items-center gap-3 text-xs sm:text-sm text-[#DC2626]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Queue Listings */}
        {loading ? (
          <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-12 text-center space-y-3">
            <Loader2 className="h-7 w-7 animate-spin text-[#5B5BF0] mx-auto" />
            <p className="text-xs font-mono text-[#66666B]">
              Loading {filterStatus} submissions...
            </p>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-12 text-center space-y-2">
            <Clock className="h-8 w-8 text-[#8E8E93] mx-auto" />
            <h2 className="font-heading font-bold text-lg text-[#0F0F10]">
              No {filterStatus === "all" ? "" : filterStatus} listings in queue
            </h2>
            <p className="text-xs text-[#66666B]">
              When makers submit tools at /submit, they will appear here with pending status.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {listings.map((item) => {
              const isBusy = actionLoadingId === item.id;
              const screenshots = item.listing_screenshots || [];

              return (
                <article
                  key={item.id}
                  className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5"
                >
                  {/* Top Row: Logo, Name, Slug, Status & Action Buttons */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#E8E8E3] pb-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-[12px] border border-[#E8E8E3] bg-[#FAFAF7] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.logo_url ? (
                          <img
                            src={item.logo_url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-[#8E8E93]" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-heading font-extrabold text-xl text-[#0F0F10]">
                            {item.name}
                          </h2>
                          <span className="font-mono text-xs text-[#5B5BF0] bg-[#EEF0FE] px-2 py-0.5 rounded">
                            /{item.slug}
                          </span>
                          <span
                            className={`font-mono text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              item.status === "approved"
                                ? "bg-[#ECFDF5] text-[#059669]"
                                : item.status === "rejected"
                                ? "bg-[#FEF2F2] text-[#DC2626]"
                                : "bg-[#FEF3C7] text-[#D97706]"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-[#47474F]">
                          {item.tagline}
                        </p>

                        <div className="flex items-center gap-4 flex-wrap text-xs text-[#66666B] pt-1">
                          <a
                            href={item.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[#5B5BF0] hover:underline"
                          >
                            <span>{item.website_url}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <span className="inline-flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5 text-[#8E8E93]" />
                            {resolveCategoryName(item)}
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono">
                            <DollarSign className="h-3.5 w-3.5 text-[#8E8E93]" />
                            {item.pricing_model}
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Mail className="h-3.5 w-3.5 text-[#8E8E93]" />
                            {item.submitted_by_email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Approve / Reject Controls */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isBusy || item.status === "approved"}
                        onClick={() => handleModeration(item.id, "approve")}
                        leftIcon={
                          isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )
                        }
                        className="bg-[#059669] hover:bg-[#047857] text-white font-bold"
                      >
                        Approve
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isBusy || item.status === "rejected"}
                        onClick={() => handleModeration(item.id, "reject")}
                        leftIcon={
                          isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 text-[#DC2626]" />
                          )
                        }
                        className="border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] font-bold"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>

                  {/* Descriptions (Short & Long) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="rounded-[12px] bg-[#FAFAF7] border border-[#E8E8E3] p-4 space-y-1.5">
                      <span className="text-[11px] font-mono font-bold uppercase text-[#8E8E93] block">
                        Short Description ({item.description_short.length}/250)
                      </span>
                      <p className="text-[#0F0F10] leading-relaxed whitespace-pre-wrap">
                        {item.description_short}
                      </p>
                    </div>

                    <div className="rounded-[12px] bg-[#FAFAF7] border border-[#E8E8E3] p-4 space-y-1.5">
                      <span className="text-[11px] font-mono font-bold uppercase text-[#8E8E93] block">
                        Long Description ({item.description_long.length}/2000)
                      </span>
                      <p className="text-[#0F0F10] leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {item.description_long}
                      </p>
                    </div>
                  </div>

                  {/* Screenshots Gallery */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase text-[#8E8E93] block">
                      Submitted Screenshots ({screenshots.length})
                    </span>
                    {screenshots.length === 0 ? (
                      <p className="text-xs text-[#8E8E93] italic">
                        No screenshots attached.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {screenshots.map((shot) => (
                          <a
                            key={shot.id}
                            href={shot.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative rounded-[10px] border border-[#E8E8E3] overflow-hidden bg-[#FAFAF7] aspect-video block"
                          >
                            <img
                              src={shot.url}
                              alt={`Screenshot ${shot.position + 1}`}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1.5 left-1.5 rounded bg-[#0F0F10]/75 px-1.5 py-0.5 text-[10px] font-mono text-white">
                              #{shot.position + 1}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metadata Footer */}
                  <div className="pt-3 border-t border-[#E8E8E3] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#8E8E93]">
                    <span>UUID: {item.id}</span>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Submitted: {new Date(item.created_at).toLocaleString()}
                      </span>
                      {item.approved_at && (
                        <span className="text-[#059669] font-semibold">
                          Approved: {new Date(item.approved_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

