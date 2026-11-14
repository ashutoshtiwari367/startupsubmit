import "server-only";
import { db } from "@/lib/db";
import { getListingUpvoteCountsMap } from "@/lib/upvotes";

export type WinnerPeriodType = "weekly" | "monthly" | "quarterly" | "yearly" | "all";

export interface WinnerListingItem {
  id: string;
  listingId: number;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  categorySlug: string;
  logoUrl: string | null;
  websiteUrl: string;
  websiteDomain: string;
  rank: number;
  placeLabel: string;
  badgeColor: string;
  upvotes: number;
  winnerPeriod: string;
  founder: string;
  founderHandle: string;
  url: string;
  approvedAt: string | null;
  createdAt: string;
}

export interface AvailableMonthOption {
  slug: string; // e.g. "2026-11"
  label: string; // e.g. "November 2026"
  year: number;
  month: number;
  isCurrent: boolean;
}

export interface WinnersResponse {
  ok: boolean;
  period: WinnerPeriodType;
  periodLabel: string;
  selectedMonth?: string;
  availableMonths: AvailableMonthOption[];
  winners: WinnerListingItem[];
  totalWinners: number;
  error?: string;
}

/**
 * Returns available past and current months for the Hall of Winners dropdown & filters.
 */
export function getAvailableMonths(count: number = 6): AvailableMonthOption[] {
  const result: AvailableMonthOption[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const slug = `${year}-${String(month).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    result.push({
      slug,
      label,
      year,
      month,
      isCurrent: i === 0,
    });
  }

  return result;
}

/**
 * Extracts clean domain string from a website URL.
 */
export function extractCleanDomain(url?: string | null): string {
  if (!url) return "";
  try {
    const trimmed = url.trim();
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return (url || "").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

/**
 * Computes date boundaries [startDate, endDate] and user-facing period label.
 */
export function resolvePeriodDateRange(params: {
  period?: WinnerPeriodType | string;
  month?: string | null;
  year?: string | null;
}): {
  period: WinnerPeriodType;
  startDate: Date;
  endDate: Date;
  periodLabel: string;
  selectedMonth: string;
} {
  const now = new Date();
  const rawPeriod = (params.period || "monthly").toLowerCase();
  const period: WinnerPeriodType =
    rawPeriod === "weekly" || rawPeriod === "week"
      ? "weekly"
      : rawPeriod === "quarterly" || rawPeriod === "quarter"
      ? "quarterly"
      : rawPeriod === "yearly" || rawPeriod === "year"
      ? "yearly"
      : rawPeriod === "all" || rawPeriod === "all-time"
      ? "all"
      : "monthly";

  // Default month slug is current month e.g. "2026-11"
  const currentMonthSlug = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  let selectedMonth = params.month ? params.month.trim() : currentMonthSlug;

  if (period === "weekly") {
    // Last 7 days
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      period: "weekly",
      startDate: start,
      endDate: now,
      periodLabel: "Winner of the Week",
      selectedMonth,
    };
  }

  if (period === "quarterly") {
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const startMonth = currentQuarter * 3;
    const start = new Date(now.getFullYear(), startMonth, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), startMonth + 3, 0, 23, 59, 59, 999);
    const qNum = currentQuarter + 1;
    return {
      period: "quarterly",
      startDate: start,
      endDate: end,
      periodLabel: `Winner of the Quarter (Q${qNum} ${now.getFullYear()})`,
      selectedMonth,
    };
  }

  if (period === "yearly") {
    const yr = Number(params.year) || now.getFullYear();
    const start = new Date(yr, 0, 1, 0, 0, 0, 0);
    const end = new Date(yr, 11, 31, 23, 59, 59, 999);
    return {
      period: "yearly",
      startDate: start,
      endDate: end,
      periodLabel: `Winner of the Year (${yr})`,
      selectedMonth,
    };
  }

  if (period === "all") {
    const start = new Date(2020, 0, 1, 0, 0, 0, 0);
    const end = new Date(2099, 11, 31, 23, 59, 59, 999);
    return {
      period: "all",
      startDate: start,
      endDate: end,
      periodLabel: "All-Time Hall of Fame Champions",
      selectedMonth,
    };
  }

  // Monthly Period
  const monthMatch = selectedMonth.match(/^(\d{4})-(\d{1,2})$/);
  let yearNum = now.getFullYear();
  let monthNum = now.getMonth() + 1;

  if (monthMatch) {
    yearNum = parseInt(monthMatch[1], 10);
    monthNum = parseInt(monthMatch[2], 10);
  } else {
    selectedMonth = currentMonthSlug;
  }

  const start = new Date(yearNum, monthNum - 1, 1, 0, 0, 0, 0);
  const end = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

  const monthDateObj = new Date(yearNum, monthNum - 1, 1);
  const monthName = monthDateObj.toLocaleString("en-US", { month: "long", year: "numeric" });
  const isCurrent = selectedMonth === currentMonthSlug;

  return {
    period: "monthly",
    startDate: start,
    endDate: end,
    periodLabel: isCurrent ? `Winner of the Month (${monthName})` : `${monthName} Winners`,
    selectedMonth,
  };
}

/**
 * Authoritatively calculates winning products from database upvotes.
 * Strict Rule:
 * 1. Sabke upvote check honge - NO arbitrary rank assignments or dummy numbers.
 * 2. Rank #1 ALWAYS has the highest upvotes.
 * 3. Sorting is purely b.upvotes - a.upvotes.
 */
export async function calculateWinners(params: {
  period?: WinnerPeriodType | string;
  month?: string | null;
  year?: string | null;
  limit?: number;
}): Promise<WinnersResponse> {
  const { period, startDate, endDate, periodLabel, selectedMonth } = resolvePeriodDateRange(params);
  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 100);
  const availableMonths = getAvailableMonths(6);

  try {
    // 1. Fetch approved listings from database
    const { data: listings, error: listingsError } = await db
      .from("listings")
      .select(
        "id, slug, name, tagline, description_short, website_url, logo_url, category_id, pricing_model, upvotes_count, created_at, approved_at, submitted_by_email, categories(id, slug, name)"
      )
      .eq("status", "approved");

    if (listingsError) {
      return {
        ok: false,
        period,
        periodLabel,
        selectedMonth,
        availableMonths,
        winners: [],
        totalWinners: 0,
        error: listingsError.message,
      };
    }

    const approvedListings = listings || [];
    if (approvedListings.length === 0) {
      return {
        ok: true,
        period,
        periodLabel,
        selectedMonth,
        availableMonths,
        winners: [],
        totalWinners: 0,
      };
    }

    const listingIds = approvedListings.map((l: any) => Number(l.id)).filter(Boolean);

    // 2. Fetch period-scoped upvotes from listing_upvotes table
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    const periodVotesMap = new Map<number, number>();
    try {
      let upvotesQuery = db
        .from("listing_upvotes")
        .select("listing_id, created_at");

      if (period !== "all") {
        upvotesQuery = upvotesQuery
          .gte("created_at", startIso)
          .lte("created_at", endIso);
      }

      const { data: upvotesRows, error: upvotesError } = await upvotesQuery;

      if (!upvotesError && Array.isArray(upvotesRows)) {
        for (const row of upvotesRows) {
          const lId = Number(row.listing_id);
          periodVotesMap.set(lId, (periodVotesMap.get(lId) || 0) + 1);
        }
      }
    } catch {
      // Fall through to bulk map fallback
    }

    // Also get all-time counts map as reliable fallback if timestamped upvotes were not recorded yet
    const allTimeCountsMap = await getListingUpvoteCountsMap(listingIds);

    // 3. Compute exact verified upvotes for each listing
    const candidates = approvedListings.map((l: any) => {
      const listingId = Number(l.id);
      const categoryName = (l.categories as any)?.name || "SaaS";
      const categorySlug = (l.categories as any)?.slug || "saas";
      const emailUser = (l.submitted_by_email || "").split("@")[0].trim();
      const founder = emailUser
        ? emailUser.replace(/[._+-]+/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()).trim()
        : "Maker";

      // Verified Upvotes calculation:
      // A: If listing_upvotes has rows in this period, use them
      // B: For all-time or when period votes are empty, use max of allTimeCountsMap and column upvotes_count
      let calculatedVotes = 0;
      if (periodVotesMap.has(listingId)) {
        calculatedVotes = periodVotesMap.get(listingId) || 0;
      } else if (period === "all" || periodVotesMap.size === 0) {
        // Fallback to table counter or all-time upvotes map
        calculatedVotes = Math.max(
          allTimeCountsMap.get(listingId) || 0,
          Number(l.upvotes_count || 0)
        );
      } else {
        // Specific past period where this tool had 0 votes in that specific window
        calculatedVotes = periodVotesMap.get(listingId) || 0;
      }

      const websiteUrl = l.website_url || "https://launchos.io";
      const websiteDomain = extractCleanDomain(websiteUrl);

      return {
        id: String(l.id),
        listingId,
        name: l.name || "Untitled Product",
        slug: l.slug || String(l.id),
        tagline: l.tagline || l.description_short || "",
        category: categoryName,
        categorySlug,
        logoUrl: l.logo_url || null,
        websiteUrl,
        websiteDomain,
        upvotes: calculatedVotes,
        winnerPeriod: periodLabel,
        founder,
        founderHandle: `@${(l.slug || "maker").replace(/[^a-zA-Z0-9]/g, "").slice(0, 15)}`,
        url: `/product/${l.slug || l.id}`,
        approvedAt: l.approved_at || null,
        createdAt: l.created_at || new Date().toISOString(),
      };
    });

    // 4. CRITICAL: Strict descending sort by upvotes (Highest upvotes ALWAYS #1)
    // No dummy date or hardcoded indices!
    candidates.sort((a, b) => {
      if (b.upvotes !== a.upvotes) {
        return b.upvotes - a.upvotes; // Highest upvotes FIRST!
      }
      // Deterministic tie-breaker: newest approved or created date
      const bTs = Date.parse(b.approvedAt || b.createdAt) || 0;
      const aTs = Date.parse(a.approvedAt || a.createdAt) || 0;
      if (bTs !== aTs) return bTs - aTs;
      return b.listingId - a.listingId;
    });

    // 5. Assign sequential 1-based ranks
    const rankedWinners: WinnerListingItem[] = candidates.slice(0, limit).map((c, index) => {
      const rank = index + 1;
      const placeLabel =
        rank === 1
          ? "1st Place Winner"
          : rank === 2
          ? "2nd Place Winner"
          : rank === 3
          ? "3rd Place Winner"
          : `Rank #${rank}`;

      const badgeColor =
        rank === 1
          ? "from-[#FFF1D6] to-[#FDE68A] text-[#7A4E00] border-[#FCD34D]"
          : rank === 2
          ? "from-[#F1F5F9] to-[#E2E8F0] text-[#475569] border-[#CBD5E1]"
          : rank === 3
          ? "from-[#FFF7ED] to-[#FFEDD5] text-[#9A3412] border-[#FDBA74]"
          : "from-[#F6F6FB] to-[#F1F1F8] text-[#55556E] border-[#E6E6F0]";

      return {
        ...c,
        rank,
        placeLabel,
        badgeColor,
      };
    });

    return {
      ok: true,
      period,
      periodLabel,
      selectedMonth,
      availableMonths,
      winners: rankedWinners,
      totalWinners: candidates.length,
    };
  } catch (err) {
    return {
      ok: false,
      period,
      periodLabel,
      selectedMonth,
      availableMonths,
      winners: [],
      totalWinners: 0,
      error: err instanceof Error ? err.message : "Failed to calculate winners",
    };
  }
}

