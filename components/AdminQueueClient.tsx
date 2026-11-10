"use client";

import React, { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
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
}

export function AdminQueueClient({ initialListings }: AdminQueueClientProps) {
  const [listings, setListings] = useState<PendingQueueItem[]>(initialListings);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pendingActionId, setPendingActionId] = useState<BigIntId | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic state: removes the item immediately from the queue when Approve/Reject is clicked
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

  function handleModeration(item: PendingQueueItem, decision: "approve" | "reject") {
    setActionFeedback(null);
    setPendingActionId(item.id);

    startTransition(async () => {
      // 1. Optimistically remove from the visible pending list immediately
      removeOptimisticListing(item.id);

      try {
        const result =
          decision === "approve"
            ? await approveListing(item.id)
            : await rejectListing(item.id);

        // 2. Commit removal to local baseline state once server action succeeds
        setListings((prev) => prev.filter((row) => row.id !== item.id));
        setActionFeedback({
          type: "success",
          text:
            result?.message ||
            `Listing "${item.name}" was ${decision === "approve" ? "approved" : "rejected"}.`,
        });
      } catch (err) {
        // On failure, React automatically rolls back optimisticListings to `listings`
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

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium mb-2">
              Admin Moderation Queue • Server-Authoritative Actions
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Pending Submissions Queue
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Review every submitted field and screenshot before publishing to the indexable directory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300">
              Pending Count:
              <strong className="text-amber-400 font-semibold text-sm">
                {optimisticListings.length}
              </strong>
            </span>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition"
            >
              View Public Site
            </Link>
          </div>
        </div>

        {/* Status Toast / Banner */}
        {actionFeedback && (
          <div
            role="status"
            className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
              actionFeedback.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : "bg-red-950/40 border-red-500/40 text-red-200"
            }`}
          >
            <span>{actionFeedback.text}</span>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-xs underline ml-4 opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Empty State */}
        {optimisticListings.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-12 text-center">
            <p className="text-base font-medium text-zinc-300">
              All caught up! No pending submissions in the queue.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              New tool submissions with status=&apos;pending&apos; will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-800/90 bg-zinc-900/40 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/90 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4 min-w-[240px]">Tool &amp; Identity</th>
                  <th className="py-3.5 px-4 min-w-[320px]">Submitted Copy (Tagline / Short / Long)</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Metadata &amp; Submitter</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Screenshot Thumbnails</th>
                  <th className="py-3.5 px-4 text-right min-w-[170px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70 text-sm align-top">
                {optimisticListings.map((item) => {
                  const safeWebsite = safeHttpsUrl(item.website_url);
                  const safeLogo = safeHttpsUrl(item.logo_url);
                  const screenshots = [...(item.listing_screenshots || [])].sort(
                    (a, b) => a.position - b.position
                  );
                  const isRowBusy = isPending && pendingActionId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-900/60 transition-colors"
                    >
                      {/* Column 1: Logo, Name, Slug, ID, Website URL */}
                      <td className="py-5 px-4 space-y-2.5">
                        <div className="flex items-start gap-3">
                          {safeLogo ? (
                            <img
                              src={safeLogo}
                              alt={`${item.name} logo`}
                              className="w-12 h-12 rounded-xl object-cover border border-zinc-700 bg-zinc-950 shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center text-[10px] text-zinc-500 shrink-0">
                              No HTTPS
                            </div>
                          )}
                          <div className="min-w-0 space-y-1">
                            <div className="font-bold text-white text-base break-words">
                              {item.name}
                            </div>
                            {item.reference_code && (
                              <div className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
                                Ref: {item.reference_code}
                              </div>
                            )}
                            <div className="text-xs text-zinc-400 font-mono break-all">
                              slug: {item.slug}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono break-all">
                              id: {item.id}
                            </div>
                          </div>
                        </div>

                        <div className="pt-1 text-xs">
                          <span className="text-zinc-500 block mb-0.5">Website URL:</span>
                          {!item.website_url ? (
                            <span className="text-zinc-500 italic">
                              No website URL provided (Other category)
                            </span>
                          ) : safeWebsite ? (
                            <a
                              href={safeWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 underline break-all"
                            >
                              {item.website_url}
                            </a>
                          ) : (
                            <span className="text-red-400 font-mono break-all">
                              Blocked unsafe URL: {item.website_url}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 2: Tagline, Short Description, Long Description */}
                      <td className="py-5 px-4 space-y-3 max-w-md">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                            Tagline ({item.tagline.length}/60)
                          </span>
                          <p className="text-zinc-100 font-medium mt-0.5 break-words">
                            {item.tagline}
                          </p>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                            Short Description ({item.description_short.length}/250)
                          </span>
                          <p className="text-zinc-300 text-xs leading-relaxed mt-0.5 whitespace-pre-wrap break-words">
                            {item.description_short}
                          </p>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                            Long Description ({item.description_long.length}/2000)
                          </span>
                          <div className="mt-1 max-h-40 overflow-y-auto rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-2.5 text-xs text-zinc-300 whitespace-pre-wrap break-words">
                            {item.description_long}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Category, Pricing, Submitter Email, Created Timestamp */}
                      <td className="py-5 px-4 space-y-2 text-xs">
                        <div>
                          <span className="text-zinc-500">Status: </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                            {item.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Category: </span>
                          <span className="text-zinc-200 font-medium">
                            {resolveCategoryLabel(item)}
                          </span>
                          <div className="text-[11px] text-zinc-500 font-mono break-all">
                            category_id: {item.category_id}
                          </div>
                        </div>
                        <div>
                          <span className="text-zinc-500">Pricing Model: </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono">
                            {item.pricing_model}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Submitted By Email:</span>
                          <span className="text-zinc-200 font-mono break-all">
                            {item.submitted_by_email}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Submitted At:</span>
                          <span className="text-zinc-400 font-mono">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Screenshot Thumbnails */}
                      <td className="py-5 px-4">
                        {screenshots.length === 0 ? (
                          <span className="text-xs text-zinc-500 italic">
                            No screenshots uploaded
                          </span>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {screenshots.map((shot) => {
                              const safeShotUrl = safeHttpsUrl(shot.url);
                              return (
                                <div
                                  key={shot.id}
                                  className="group relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950"
                                >
                                  {safeShotUrl ? (
                                    <a
                                      href={safeShotUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={`Open screenshot #${shot.position + 1}`}
                                    >
                                      <img
                                        src={safeShotUrl}
                                        alt={`${item.name} screenshot ${shot.position + 1}`}
                                        className="w-28 h-20 object-cover group-hover:opacity-90 transition"
                                        loading="lazy"
                                      />
                                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-zinc-200">
                                        #{shot.position + 1}
                                      </span>
                                    </a>
                                  ) : (
                                    <div className="w-28 h-20 flex items-center justify-center text-[10px] text-red-400 p-1 text-center">
                                      Unsafe URL blocked
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Column 5: Approve / Reject Actions */}
                      <td className="py-5 px-4 text-right">
                        <div className="flex flex-col sm:items-end gap-2">
                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => handleModeration(item, "approve")}
                            className="w-full sm:w-32 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => handleModeration(item, "reject")}
                            className="w-full sm:w-32 px-3.5 py-2 rounded-xl bg-red-600/90 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
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
}

