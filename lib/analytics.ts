import "server-only";
import crypto from "node:crypto";
import { db, publicDb } from "@/lib/db";
import type { AnalyticsEventType } from "@/types/db";

// In-memory fallback event store if Supabase table is not yet provisioned in hosted database
interface LocalAnalyticsEvent {
  id: number;
  listing_id: number;
  event_type: AnalyticsEventType;
  session_hash: string | null;
  created_at: string;
}

const localAnalyticsStore: LocalAnalyticsEvent[] = [];
let localEventIdCounter = 1;

/**
 * List of known bot, crawler, and scraper user-agent signatures.
 */
const BOT_USER_AGENTS = [
  "bot",
  "crawler",
  "spider",
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "sogou",
  "exabot",
  "facebookexternalhit",
  "ia_archiver",
  "headlesschrome",
  "puppeteer",
  "playwright",
  "phantomjs",
  "curl",
  "wget",
  "python-requests",
  "axios",
  "postman",
  "node-fetch",
  "go-http-client",
];

export function isBotTraffic(userAgent: string | undefined | null): boolean {
  if (!userAgent || typeof userAgent !== "string") return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

/**
 * Generates a privacy-safe one-way SHA-256 session hash.
 * Combines IP, User-Agent, and hourly salt so visitor raw IPs are never stored.
 */
export function generateSessionHash(
  ip: string | undefined | null,
  userAgent: string | undefined | null,
  saltDate: Date = new Date()
): string {
  const cleanIp = String(ip || "127.0.0.1").trim();
  const cleanUa = String(userAgent || "unknown-ua").trim();
  // Hour-based salt: changes every 60 minutes for temporal privacy
  const hourBucket = `${saltDate.getUTCFullYear()}-${saltDate.getUTCMonth()}-${saltDate.getUTCDate()}-${saltDate.getUTCHours()}`;
  return crypto
    .createHash("sha256")
    .update(`${cleanIp}::${cleanUa}::${hourBucket}`)
    .digest("hex")
    .slice(0, 32);
}

export interface RecordViewOptions {
  listingId: number;
  ip?: string | null;
  userAgent?: string | null;
  dedupWindowMinutes?: number;
}

export interface RecordViewResult {
  ok: boolean;
  deduplicated?: boolean;
  isBot?: boolean;
  error?: string;
}

/**
 * Records a page view event for an approved listing.
 * Enforces session deduplication (default 30 minutes) and excludes obvious bot traffic.
 */
export async function recordListingView(
  options: RecordViewOptions
): Promise<RecordViewResult> {
  const { listingId, ip, userAgent, dedupWindowMinutes = 30 } = options;

  if (!Number.isFinite(listingId) || listingId <= 0) {
    return { ok: false, error: "Invalid listing ID" };
  }

  // 1. Bot traffic filter
  if (isBotTraffic(userAgent)) {
    return { ok: true, isBot: true, deduplicated: true };
  }

  // 2. Verify listing exists and is approved
  const { data: listing } = await publicDb
    .from("listings")
    .select("id, status")
    .eq("id", listingId)
    .eq("status", "approved")
    .maybeSingle();

  if (!listing) {
    return { ok: false, error: "Listing not found or not approved" };
  }

  const sessionHash = generateSessionHash(ip, userAgent);
  const cutoffTime = new Date(Date.now() - dedupWindowMinutes * 60 * 1000).toISOString();

  // 3. Deduplication Check: Attempt checking in Supabase listing_analytics
  try {
    const { data: existing, error: checkErr } = await db
      .from("listing_analytics")
      .select("id")
      .eq("listing_id", listingId)
      .eq("event_type", "view")
      .eq("session_hash", sessionHash)
      .gte("created_at", cutoffTime)
      .limit(1);

    if (!checkErr && existing && existing.length > 0) {
      return { ok: true, deduplicated: true };
    }

    if (!checkErr) {
      const { error: insertErr } = await db.from("listing_analytics").insert({
        listing_id: listingId,
        event_type: "view",
        session_hash: sessionHash,
      });

      if (!insertErr) {
        return { ok: true, deduplicated: false };
      }
    }
  } catch {
    // Supabase listing_analytics table not available in current environment; fall through to local store
  }

  // Local in-memory deduplication fallback
  const cutoffMs = Date.now() - dedupWindowMinutes * 60 * 1000;
  const recentLocal = localAnalyticsStore.find(
    (ev) =>
      ev.listing_id === listingId &&
      ev.event_type === "view" &&
      ev.session_hash === sessionHash &&
      new Date(ev.created_at).getTime() >= cutoffMs
  );

  if (recentLocal) {
    return { ok: true, deduplicated: true };
  }

  localAnalyticsStore.push({
    id: localEventIdCounter++,
    listing_id: listingId,
    event_type: "view",
    session_hash: sessionHash,
    created_at: new Date().toISOString(),
  });

  return { ok: true, deduplicated: false };
}

export interface RecordClickOptions {
  listingId: number;
  ip?: string | null;
  userAgent?: string | null;
}

export interface RecordClickResult {
  ok: boolean;
  destinationUrl?: string;
  error?: string;
}

/**
 * Records an outbound website click and authoritatively returns the verified destination URL.
 * NEVER accepts user-supplied destination URLs, eliminating open redirect vulnerabilities.
 */
export async function recordWebsiteClick(
  options: RecordClickOptions
): Promise<RecordClickResult> {
  const { listingId, ip, userAgent } = options;

  if (!Number.isFinite(listingId) || listingId <= 0) {
    return { ok: false, error: "Invalid listing ID" };
  }

  // 1. Authoritatively fetch destination URL from approved listing
  const { data: listing } = await publicDb
    .from("listings")
    .select("id, website_url, status")
    .eq("id", listingId)
    .eq("status", "approved")
    .maybeSingle();

  if (!listing || !listing.website_url) {
    return { ok: false, error: "Listing not found, unapproved, or missing website URL" };
  }

  const destinationUrl = listing.website_url.trim();

  // Validate URL protocol strictly (only http/https)
  try {
    const parsed = new URL(destinationUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: "Invalid listing website protocol" };
    }
  } catch {
    return { ok: false, error: "Invalid listing website URL format" };
  }

  const sessionHash = generateSessionHash(ip, userAgent);

  // 2. Insert click event
  try {
    const { error: insertErr } = await db.from("listing_analytics").insert({
      listing_id: listingId,
      event_type: "website_click",
      session_hash: sessionHash,
    });

    if (!insertErr) {
      return { ok: true, destinationUrl };
    }
  } catch {
    // Fall through to local fallback
  }

  localAnalyticsStore.push({
    id: localEventIdCounter++,
    listing_id: listingId,
    event_type: "website_click",
    session_hash: sessionHash,
    created_at: new Date().toISOString(),
  });

  return { ok: true, destinationUrl };
}

export type TimeRangeFilter = "today" | "7d" | "30d" | "all";

export interface AnalyticsSummary {
  timeRange: TimeRangeFilter;
  totalListings: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  totalViews: number;
  totalWebsiteClicks: number;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  timeSeries: {
    date: string;
    views: number;
    clicks: number;
    reviews: number;
  }[];
  topListings: {
    id: number;
    name: string;
    slug: string;
    views: number;
    clicks: number;
    rating: number;
    reviewsCount: number;
  }[];
}

export function getTimeRangeStartDate(range: TimeRangeFilter): Date | null {
  const now = new Date();
  switch (range) {
    case "today": {
      const d = new Date(now);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }
    case "7d": {
      return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    case "30d": {
      return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    case "all":
    default:
      return null;
  }
}

/**
 * Computes dashboard analytics metrics.
 * Supports filtering by a specific submitter email (maker view) or all listings (admin view).
 */
export async function getDashboardAnalytics(params: {
  timeRange?: TimeRangeFilter;
  filterByEmail?: string | null;
}): Promise<AnalyticsSummary> {
  const timeRange = params.timeRange || "30d";
  const startDate = getTimeRangeStartDate(timeRange);
  const startIso = startDate ? startDate.toISOString() : null;

  // 1. Fetch listings (with optional email filter)
  let listingsQuery = db
    .from("listings")
    .select("id, name, slug, status, submitted_by_email, created_at");

  if (params.filterByEmail) {
    listingsQuery = listingsQuery.eq("submitted_by_email", params.filterByEmail.toLowerCase().trim());
  }

  const { data: listings } = await listingsQuery;
  const safeListings = listings || [];

  // Group listings by status with distinct count
  const distinctListingIds = new Set(safeListings.map((l) => l.id));
  const approvedListings = safeListings.filter((l) => l.status === "approved");
  const pendingListings = safeListings.filter((l) => l.status === "pending");
  const rejectedListings = safeListings.filter((l) => l.status === "rejected");

  const approvedIds = new Set(approvedListings.map((l) => l.id));

  // 2. Fetch analytics events (views & clicks)
  let viewsCount = 0;
  let clicksCount = 0;
  const listingViewsMap = new Map<number, number>();
  const listingClicksMap = new Map<number, number>();
  const dateViewsMap = new Map<string, number>();
  const dateClicksMap = new Map<string, number>();

  try {
    let analyticsQuery = db
      .from("listing_analytics")
      .select("id, listing_id, event_type, created_at");

    if (startIso) {
      analyticsQuery = analyticsQuery.gte("created_at", startIso);
    }

    const { data: events, error } = await analyticsQuery;

    if (!error && events) {
      for (const ev of events) {
        if (distinctListingIds.has(ev.listing_id)) {
          const dayKey = ev.created_at.slice(0, 10);
          if (ev.event_type === "view") {
            viewsCount++;
            listingViewsMap.set(ev.listing_id, (listingViewsMap.get(ev.listing_id) || 0) + 1);
            dateViewsMap.set(dayKey, (dateViewsMap.get(dayKey) || 0) + 1);
          } else if (ev.event_type === "website_click") {
            clicksCount++;
            listingClicksMap.set(ev.listing_id, (listingClicksMap.get(ev.listing_id) || 0) + 1);
            dateClicksMap.set(dayKey, (dateClicksMap.get(dayKey) || 0) + 1);
          }
        }
      }
    }
  } catch {
    // Process from local memory store
    for (const ev of localAnalyticsStore) {
      if (distinctListingIds.has(ev.listing_id)) {
        if (!startIso || ev.created_at >= startIso) {
          const dayKey = ev.created_at.slice(0, 10);
          if (ev.event_type === "view") {
            viewsCount++;
            listingViewsMap.set(ev.listing_id, (listingViewsMap.get(ev.listing_id) || 0) + 1);
            dateViewsMap.set(dayKey, (dateViewsMap.get(dayKey) || 0) + 1);
          } else if (ev.event_type === "website_click") {
            clicksCount++;
            listingClicksMap.set(ev.listing_id, (listingClicksMap.get(ev.listing_id) || 0) + 1);
            dateClicksMap.set(dayKey, (dateClicksMap.get(dayKey) || 0) + 1);
          }
        }
      }
    }
  }

  // 3. Fetch approved reviews
  let reviewsCount = 0;
  let ratingSum = 0;
  const ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const listingReviewsCountMap = new Map<number, number>();
  const listingRatingSumMap = new Map<number, number>();
  const dateReviewsMap = new Map<string, number>();

  try {
    let reviewsQuery = db
      .from("listing_reviews")
      .select("id, listing_id, rating, created_at, status")
      .eq("status", "approved");

    if (startIso) {
      reviewsQuery = reviewsQuery.gte("created_at", startIso);
    }

    const { data: reviews, error } = await reviewsQuery;

    if (!error && reviews) {
      for (const rev of reviews) {
        if (distinctListingIds.has(rev.listing_id)) {
          reviewsCount++;
          ratingSum += rev.rating;
          const r = rev.rating as 1 | 2 | 3 | 4 | 5;
          if (ratingDistribution[r] !== undefined) {
            ratingDistribution[r]++;
          }
          const dayKey = rev.created_at.slice(0, 10);
          dateReviewsMap.set(dayKey, (dateReviewsMap.get(dayKey) || 0) + 1);

          listingReviewsCountMap.set(
            rev.listing_id,
            (listingReviewsCountMap.get(rev.listing_id) || 0) + 1
          );
          listingRatingSumMap.set(
            rev.listing_id,
            (listingRatingSumMap.get(rev.listing_id) || 0) + rev.rating
          );
        }
      }
    }
  } catch {
    // Reviews table in Supabase empty or not yet created
  }

  const averageRating = reviewsCount > 0 ? Number((ratingSum / reviewsCount).toFixed(1)) : 0;

  // 4. Construct 7 or 14-day chronological timeSeries for charts
  const timeSeriesDays = timeRange === "today" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 14 : 14;
  const timeSeries: AnalyticsSummary["timeSeries"] = [];

  for (let i = timeSeriesDays - 1; i >= 0; i--) {
    const dayDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayKey = dayDate.toISOString().slice(0, 10);
    timeSeries.push({
      date: dayKey,
      views: dateViewsMap.get(dayKey) || 0,
      clicks: dateClicksMap.get(dayKey) || 0,
      reviews: dateReviewsMap.get(dayKey) || 0,
    });
  }

  // 5. Construct Top Performing Listings
  const topListings = approvedListings
    .map((l) => {
      const v = listingViewsMap.get(l.id) || 0;
      const c = listingClicksMap.get(l.id) || 0;
      const revCount = listingReviewsCountMap.get(l.id) || 0;
      const rSum = listingRatingSumMap.get(l.id) || 0;
      const avg = revCount > 0 ? Number((rSum / revCount).toFixed(1)) : 0;
      return {
        id: l.id,
        name: l.name,
        slug: l.slug,
        views: v,
        clicks: c,
        rating: avg,
        reviewsCount: revCount,
      };
    })
    .sort((a, b) => b.views + b.clicks * 2 - (a.views + a.clicks * 2))
    .slice(0, 10);

  return {
    timeRange,
    totalListings: {
      total: distinctListingIds.size,
      approved: approvedListings.length,
      pending: pendingListings.length,
      rejected: rejectedListings.length,
    },
    totalViews: viewsCount,
    totalWebsiteClicks: clicksCount,
    totalReviews: reviewsCount,
    averageRating,
    ratingDistribution,
    timeSeries,
    topListings,
  };
}

