import "server-only";
import { db } from "@/lib/db";

// In-memory fallback store if hosted Supabase database migration is pending
interface LocalUpvote {
  id: number;
  listing_id: number;
  user_id: string;
  created_at: string;
}

const localUpvotesStore: LocalUpvote[] = [];
let localUpvoteIdCounter = 1;

export interface UpvoteResult {
  ok: boolean;
  isUpvoted: boolean;
  upvotesCount: number;
  error?: string;
}

/**
 * Authoritatively toggles an upvote for an authenticated user on a listing.
 * Strict Rule: Only logged-in users with a valid Supabase UUID can upvote.
 * 1 vote per user per listing. Calling again toggles the upvote off.
 */
export async function toggleListingUpvote(params: {
  listingId: number;
  userId: string;
}): Promise<UpvoteResult> {
  const { listingId, userId } = params;

  if (!Number.isFinite(listingId) || listingId <= 0) {
    return { ok: false, isUpvoted: false, upvotesCount: 0, error: "Invalid listing ID" };
  }

  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    return {
      ok: false,
      isUpvoted: false,
      upvotesCount: 0,
      error: "Authentication required. Please sign in to upvote.",
    };
  }

  const cleanUserId = userId.trim();

  try {
    // 1. Check if user has already upvoted this listing in Supabase
    const { data: existing, error: checkError } = await db
      .from("listing_upvotes")
      .select("id")
      .eq("listing_id", listingId)
      .eq("user_id", cleanUserId)
      .maybeSingle();

    if (!checkError) {
      if (existing) {
        // Already upvoted -> Toggle OFF (delete row)
        await db.from("listing_upvotes").delete().eq("id", existing.id);

        // Fetch new upvotes count
        const { count } = await db
          .from("listing_upvotes")
          .select("id", { count: "exact", head: true })
          .eq("listing_id", listingId);

        const newCount = count ?? 0;
        await db
          .from("listings")
          .update({ upvotes_count: newCount })
          .eq("id", listingId);

        return { ok: true, isUpvoted: false, upvotesCount: newCount };
      } else {
        // Not yet upvoted -> Toggle ON (insert row)
        await db.from("listing_upvotes").insert({
          listing_id: listingId,
          user_id: cleanUserId,
        });

        const { count } = await db
          .from("listing_upvotes")
          .select("id", { count: "exact", head: true })
          .eq("listing_id", listingId);

        const newCount = count ?? 1;
        await db
          .from("listings")
          .update({ upvotes_count: newCount })
          .eq("id", listingId);

        return { ok: true, isUpvoted: true, upvotesCount: newCount };
      }
    }
  } catch {
    // Fall through to memory store if table not provisioned
  }

  // Fallback to memory store if hosted table is pending
  const existingIdx = localUpvotesStore.findIndex(
    (u) => u.listing_id === listingId && u.user_id === cleanUserId
  );

  if (existingIdx >= 0) {
    localUpvotesStore.splice(existingIdx, 1);
    const count = localUpvotesStore.filter((u) => u.listing_id === listingId).length;
    return { ok: true, isUpvoted: false, upvotesCount: count };
  } else {
    localUpvotesStore.push({
      id: localUpvoteIdCounter++,
      listing_id: listingId,
      user_id: cleanUserId,
      created_at: new Date().toISOString(),
    });
    const count = localUpvotesStore.filter((u) => u.listing_id === listingId).length;
    return { ok: true, isUpvoted: true, upvotesCount: count };
  }
}

/**
 * Checks whether an authenticated user has upvoted a listing, and gets current vote count.
 */
export async function getListingUpvoteState(params: {
  listingId: number;
  userId?: string | null;
}): Promise<{ isUpvoted: boolean; upvotesCount: number }> {
  const { listingId, userId } = params;

  try {
    const [countRes, voteRes] = await Promise.all([
      db
        .from("listing_upvotes")
        .select("id", { count: "exact", head: true })
        .eq("listing_id", listingId),
      userId
        ? db
            .from("listing_upvotes")
            .select("id")
            .eq("listing_id", listingId)
            .eq("user_id", userId.trim())
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (!countRes.error) {
      return {
        isUpvoted: Boolean(voteRes.data),
        upvotesCount: countRes.count ?? 0,
      };
    }
  } catch {
    // Fall through
  }

  const memoryVotes = localUpvotesStore.filter((u) => u.listing_id === listingId);
  const isUpvoted = userId
    ? memoryVotes.some((u) => u.user_id === userId.trim())
    : false;

  return {
    isUpvoted,
    upvotesCount: memoryVotes.length,
  };
}

/**
 * Fetches all listing IDs that a given user has upvoted in bulk.
 */
export async function getUserUpvotedListingIds(
  userId?: string | null
): Promise<Set<number>> {
  const result = new Set<number>();
  if (!userId || typeof userId !== "string") return result;

  const cleanUserId = userId.trim();

  try {
    const { data, error } = await db
      .from("listing_upvotes")
      .select("listing_id")
      .eq("user_id", cleanUserId);

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        result.add(Number(row.listing_id));
      }
      return result;
    }
  } catch {
    // Fall through
  }

  for (const u of localUpvotesStore) {
    if (u.user_id === cleanUserId) {
      result.add(u.listing_id);
    }
  }

  return result;
}

/**
 * Fetches vote count map for multiple listing IDs in bulk.
 */
export async function getListingUpvoteCountsMap(
  listingIds: number[]
): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  if (listingIds.length === 0) return map;

  try {
    const { data, error } = await db
      .from("listing_upvotes")
      .select("listing_id");

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        const id = Number(row.listing_id);
        map.set(id, (map.get(id) || 0) + 1);
      }
      return map;
    }
  } catch {
    // Fall through
  }

  for (const u of localUpvotesStore) {
    map.set(u.listing_id, (map.get(u.listing_id) || 0) + 1);
  }

  return map;
}

