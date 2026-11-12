import "server-only";
import { z } from "zod";
import { db, publicDb } from "@/lib/db";
import type { ReviewStatus, CommentStatus } from "@/types/db";

// ============================================================================
// 1. Zod Validation Schemas
// ============================================================================

export const reviewSubmissionSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number between 1 and 5")
    .min(1, "Minimum rating is 1 star")
    .max(5, "Maximum rating is 5 stars"),
  review_text: z
    .string()
    .trim()
    .min(1, "Review text cannot be empty")
    .max(3000, "Review cannot exceed 3000 characters"),
});

export const commentSubmissionSchema = z.object({
  comment_text: z
    .string()
    .trim()
    .min(1, "Comment text cannot be empty")
    .max(2000, "Comment cannot exceed 2000 characters"),
  parent_comment_id: z.number().int().positive().nullable().optional(),
});

export const reportSubmissionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

// ============================================================================
// 2. Types & Interfaces
// ============================================================================

export interface ReviewItem {
  id: number;
  listingId: number;
  userId: string;
  rating: number;
  reviewText: string;
  status: ReviewStatus;
  helpfulCount: number;
  isHelpfulByMe?: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    custIdExt?: number | null;
  };
}

export interface ReviewsResponse {
  reviews: ReviewItem[];
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  myReview?: ReviewItem | null;
}

export interface CommentItem {
  id: number;
  listingId: number;
  userId: string;
  parentCommentId: number | null;
  commentText: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    custIdExt?: number | null;
  };
  replies?: CommentItem[];
}

// In-memory fallback stores
interface LocalReview {
  id: number;
  listing_id: number;
  user_id: string;
  rating: number;
  review_text: string;
  status: ReviewStatus;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

interface LocalHelpful {
  id: number;
  review_id: number;
  user_id: string;
  created_at: string;
}

interface LocalComment {
  id: number;
  listing_id: number;
  user_id: string;
  parent_comment_id: number | null;
  comment_text: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
}

interface LocalReport {
  id: number;
  target_type: "review" | "comment";
  target_id: number;
  reporter_id: string;
  reason: string;
  created_at: string;
}

const localReviewsStore: LocalReview[] = [];
const localHelpfulStore: LocalHelpful[] = [];
const localCommentsStore: LocalComment[] = [];
const localReportsStore: LocalReport[] = [];

let reviewIdSeq = 100;
let helpfulIdSeq = 100;
let commentIdSeq = 100;
let reportIdSeq = 100;

// Helper to resolve user name/avatar from profiles
async function fetchUserProfile(userId: string) {
  try {
    const { data: profile } = await db
      .from("profiles")
      .select("id, cust_id_ext, full_name, avatar_url, email")
      .eq("id", userId)
      .maybeSingle();

    if (profile) {
      const name = profile.full_name?.trim() || profile.email?.split("@")[0] || `Maker #${profile.cust_id_ext}`;
      return {
        id: profile.id,
        name,
        avatarUrl: profile.avatar_url,
        custIdExt: profile.cust_id_ext,
      };
    }
  } catch {
    // Ignore
  }

  return {
    id: userId,
    name: "Community Member",
    avatarUrl: null,
    custIdExt: null,
  };
}

// ============================================================================
// 3. Review Operations
// ============================================================================

export async function getListingReviews(params: {
  listingId: number;
  currentUserId?: string | null;
}): Promise<ReviewsResponse> {
  const { listingId, currentUserId } = params;

  let rawReviews: any[] = [];
  try {
    const { data, error } = await db
      .from("listing_reviews")
      .select("*")
      .eq("listing_id", listingId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error && data) {
      rawReviews = data;
    }
  } catch {
    // Fall back to local store
    rawReviews = localReviewsStore.filter(
      (r) => r.listing_id === listingId && r.status === "approved"
    );
  }

  // Also fetch user's helpful votes if logged in
  const helpfulReviewIds = new Set<number>();
  if (currentUserId) {
    try {
      const { data: helpfulRows } = await db
        .from("listing_review_helpful")
        .select("review_id")
        .eq("user_id", currentUserId);

      if (helpfulRows) {
        for (const h of helpfulRows) {
          helpfulReviewIds.add(h.review_id);
        }
      }
    } catch {
      for (const h of localHelpfulStore) {
        if (h.user_id === currentUserId) helpfulReviewIds.add(h.review_id);
      }
    }
  }

  const ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let ratingSum = 0;
  const reviews: ReviewItem[] = [];

  for (const r of rawReviews) {
    const star = r.rating as 1 | 2 | 3 | 4 | 5;
    if (ratingDistribution[star] !== undefined) {
      ratingDistribution[star]++;
    }
    ratingSum += r.rating;

    const author = await fetchUserProfile(r.user_id);

    reviews.push({
      id: r.id,
      listingId: r.listing_id,
      userId: r.user_id,
      rating: r.rating,
      reviewText: r.review_text,
      status: r.status,
      helpfulCount: r.helpful_count || 0,
      isHelpfulByMe: helpfulReviewIds.has(r.id),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      author,
    });
  }

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 0;
  const myReview = currentUserId ? reviews.find((r) => r.userId === currentUserId) || null : null;

  return {
    reviews,
    totalReviews,
    averageRating,
    ratingDistribution,
    myReview,
  };
}

export async function createListingReview(params: {
  userId: string;
  listingId: number;
  rating: number;
  reviewText: string;
}): Promise<{ ok: boolean; review?: ReviewItem; error?: string }> {
  const { userId, listingId, rating, reviewText } = params;

  // 1. Zod validation
  const parsed = reviewSubmissionSchema.safeParse({
    rating,
    review_text: reviewText,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid review data" };
  }

  // 2. Validate listing exists and is approved
  const { data: listing } = await publicDb
    .from("listings")
    .select("id, status")
    .eq("id", listingId)
    .eq("status", "approved")
    .maybeSingle();

  if (!listing) {
    return { ok: false, error: "Cannot review: Listing not found or not approved." };
  }

  const nowIso = new Date().toISOString();

  // 3. Database insertion with unique constraint (1 review per user per listing)
  try {
    const { data: newRow, error } = await db
      .from("listing_reviews")
      .insert({
        listing_id: listingId,
        user_id: userId,
        rating: parsed.data.rating,
        review_text: parsed.data.review_text,
        status: "approved",
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505" || error.message.includes("unique")) {
        return { ok: false, error: "You have already submitted a review for this product." };
      }
      throw error;
    }

    if (newRow) {
      const author = await fetchUserProfile(userId);
      return {
        ok: true,
        review: {
          id: newRow.id,
          listingId: newRow.listing_id,
          userId: newRow.user_id,
          rating: newRow.rating,
          reviewText: newRow.review_text,
          status: newRow.status,
          helpfulCount: newRow.helpful_count,
          createdAt: newRow.created_at,
          updatedAt: newRow.updated_at,
          author,
        },
      };
    }
  } catch {
    // Fall back to local store
  }

  // Check unique in local store
  const existingLocal = localReviewsStore.find(
    (r) => r.listing_id === listingId && r.user_id === userId
  );
  if (existingLocal) {
    return { ok: false, error: "You have already submitted a review for this product." };
  }

  const newLocal: LocalReview = {
    id: reviewIdSeq++,
    listing_id: listingId,
    user_id: userId,
    rating: parsed.data.rating,
    review_text: parsed.data.review_text,
    status: "approved",
    helpful_count: 0,
    created_at: nowIso,
    updated_at: nowIso,
  };
  localReviewsStore.unshift(newLocal);

  const author = await fetchUserProfile(userId);
  return {
    ok: true,
    review: {
      id: newLocal.id,
      listingId: newLocal.listing_id,
      userId: newLocal.user_id,
      rating: newLocal.rating,
      reviewText: newLocal.review_text,
      status: newLocal.status,
      helpfulCount: 0,
      createdAt: newLocal.created_at,
      updatedAt: newLocal.updated_at,
      author,
    },
  };
}

export async function updateListingReview(params: {
  userId: string;
  reviewId: number;
  rating: number;
  reviewText: string;
  isAdmin?: boolean;
}): Promise<{ ok: boolean; review?: ReviewItem; error?: string }> {
  const { userId, reviewId, rating, reviewText, isAdmin } = params;

  const parsed = reviewSubmissionSchema.safeParse({
    rating,
    review_text: reviewText,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid review data" };
  }

  const nowIso = new Date().toISOString();

  try {
    let query = db
      .from("listing_reviews")
      .update({
        rating: parsed.data.rating,
        review_text: parsed.data.review_text,
        updated_at: nowIso,
      })
      .eq("id", reviewId);

    if (!isAdmin) {
      query = query.eq("user_id", userId);
    }

    const { data: updated, error } = await query.select("*").single();

    if (!error && updated) {
      const author = await fetchUserProfile(updated.user_id);
      return {
        ok: true,
        review: {
          id: updated.id,
          listingId: updated.listing_id,
          userId: updated.user_id,
          rating: updated.rating,
          reviewText: updated.review_text,
          status: updated.status,
          helpfulCount: updated.helpful_count,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
          author,
        },
      };
    }
  } catch {
    // Fallback
  }

  const local = localReviewsStore.find((r) => r.id === reviewId);
  if (!local) {
    return { ok: false, error: "Review not found" };
  }
  if (!isAdmin && local.user_id !== userId) {
    return { ok: false, error: "Unauthorized: You can only edit your own review" };
  }

  local.rating = parsed.data.rating;
  local.review_text = parsed.data.review_text;
  local.updated_at = nowIso;

  const author = await fetchUserProfile(local.user_id);
  return {
    ok: true,
    review: {
      id: local.id,
      listingId: local.listing_id,
      userId: local.user_id,
      rating: local.rating,
      reviewText: local.review_text,
      status: local.status,
      helpfulCount: local.helpful_count,
      createdAt: local.created_at,
      updatedAt: local.updated_at,
      author,
    },
  };
}

export async function deleteListingReview(params: {
  userId: string;
  reviewId: number;
  isAdmin?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const { userId, reviewId, isAdmin } = params;

  try {
    let query = db.from("listing_reviews").delete().eq("id", reviewId);
    if (!isAdmin) {
      query = query.eq("user_id", userId);
    }
    const { error } = await query;
    if (!error) return { ok: true };
  } catch {
    // Fallback
  }

  const idx = localReviewsStore.findIndex((r) => r.id === reviewId);
  if (idx === -1) {
    return { ok: false, error: "Review not found" };
  }
  if (!isAdmin && localReviewsStore[idx].user_id !== userId) {
    return { ok: false, error: "Unauthorized: You can only delete your own review" };
  }

  localReviewsStore.splice(idx, 1);
  return { ok: true };
}

export async function toggleHelpfulReview(params: {
  userId: string;
  reviewId: number;
}): Promise<{ ok: boolean; helpfulCount: number; isHelpful: boolean; error?: string }> {
  const { userId, reviewId } = params;

  try {
    // Check if already voted
    const { data: existing } = await db
      .from("listing_review_helpful")
      .select("id")
      .eq("review_id", reviewId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      // Remove helpful vote
      await db.from("listing_review_helpful").delete().eq("id", existing.id);
      const { data: rev } = await db
        .from("listing_reviews")
        .select("helpful_count")
        .eq("id", reviewId)
        .single();
      const newCount = Math.max(0, (rev?.helpful_count || 1) - 1);
      await db.from("listing_reviews").update({ helpful_count: newCount }).eq("id", reviewId);
      return { ok: true, helpfulCount: newCount, isHelpful: false };
    } else {
      // Add helpful vote
      await db.from("listing_review_helpful").insert({
        review_id: reviewId,
        user_id: userId,
      });
      const { data: rev } = await db
        .from("listing_reviews")
        .select("helpful_count")
        .eq("id", reviewId)
        .single();
      const newCount = (rev?.helpful_count || 0) + 1;
      await db.from("listing_reviews").update({ helpful_count: newCount }).eq("id", reviewId);
      return { ok: true, helpfulCount: newCount, isHelpful: true };
    }
  } catch {
    // Fallback
  }

  const existingIdx = localHelpfulStore.findIndex(
    (h) => h.review_id === reviewId && h.user_id === userId
  );
  const rev = localReviewsStore.find((r) => r.id === reviewId);
  const currentCount = rev?.helpful_count || 0;

  if (existingIdx !== -1) {
    localHelpfulStore.splice(existingIdx, 1);
    const newCount = Math.max(0, currentCount - 1);
    if (rev) rev.helpful_count = newCount;
    return { ok: true, helpfulCount: newCount, isHelpful: false };
  } else {
    localHelpfulStore.push({
      id: helpfulIdSeq++,
      review_id: reviewId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    const newCount = currentCount + 1;
    if (rev) rev.helpful_count = newCount;
    return { ok: true, helpfulCount: newCount, isHelpful: true };
  }
}

export async function reportListingReview(params: {
  reporterId: string;
  reviewId: number;
  reason: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { reporterId, reviewId, reason } = params;

  const parsed = reportSubmissionSchema.safeParse({ reason });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid report reason" };
  }

  try {
    const { error } = await db.from("listing_review_reports").insert({
      review_id: reviewId,
      reporter_id: reporterId,
      reason: parsed.data.reason,
    });
    if (!error) return { ok: true };
  } catch {
    // Fallback
  }

  const existing = localReportsStore.find(
    (r) => r.target_type === "review" && r.target_id === reviewId && r.reporter_id === reporterId
  );
  if (existing) {
    return { ok: false, error: "You have already reported this review" };
  }

  localReportsStore.push({
    id: reportIdSeq++,
    target_type: "review",
    target_id: reviewId,
    reporter_id: reporterId,
    reason: parsed.data.reason,
    created_at: new Date().toISOString(),
  });

  return { ok: true };
}

// ============================================================================
// 4. Comment Operations (Threaded Discussions)
// ============================================================================

export async function getListingComments(params: {
  listingId: number;
}): Promise<{ comments: CommentItem[]; totalCount: number }> {
  const { listingId } = params;

  let rawComments: any[] = [];
  try {
    const { data, error } = await db
      .from("listing_comments")
      .select("*")
      .eq("listing_id", listingId)
      .eq("status", "approved")
      .order("created_at", { ascending: true });

    if (!error && data) {
      rawComments = data;
    }
  } catch {
    rawComments = localCommentsStore.filter(
      (c) => c.listing_id === listingId && c.status === "approved"
    );
  }

  // Populate profiles
  const commentMap = new Map<number, CommentItem>();
  const topLevelComments: CommentItem[] = [];

  for (const c of rawComments) {
    const author = await fetchUserProfile(c.user_id);
    const item: CommentItem = {
      id: c.id,
      listingId: c.listing_id,
      userId: c.user_id,
      parentCommentId: c.parent_comment_id,
      commentText: c.comment_text,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      author,
      replies: [],
    };
    commentMap.set(item.id, item);
  }

  for (const c of commentMap.values()) {
    if (c.parentCommentId && commentMap.has(c.parentCommentId)) {
      commentMap.get(c.parentCommentId)!.replies!.push(c);
    } else {
      topLevelComments.push(c);
    }
  }

  return {
    comments: topLevelComments,
    totalCount: rawComments.length,
  };
}

export async function createListingComment(params: {
  userId: string;
  listingId: number;
  commentText: string;
  parentCommentId?: number | null;
}): Promise<{ ok: boolean; comment?: CommentItem; error?: string }> {
  const { userId, listingId, commentText, parentCommentId } = params;

  const parsed = commentSubmissionSchema.safeParse({
    comment_text: commentText,
    parent_comment_id: parentCommentId,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid comment text" };
  }

  // 1. Validate listing exists and is approved
  const { data: listing } = await publicDb
    .from("listings")
    .select("id, status")
    .eq("id", listingId)
    .eq("status", "approved")
    .maybeSingle();

  if (!listing) {
    return { ok: false, error: "Cannot comment: Listing not found or not approved." };
  }

  // 2. If replying: Validate parent comment belongs to the SAME listing
  if (parsed.data.parent_comment_id) {
    let parentValid = false;
    try {
      const { data: parent } = await db
        .from("listing_comments")
        .select("id, listing_id, status")
        .eq("id", parsed.data.parent_comment_id)
        .maybeSingle();

      if (parent && parent.listing_id === listingId && parent.status === "approved") {
        parentValid = true;
      }
    } catch {
      const parentLocal = localCommentsStore.find(
        (c) =>
          c.id === parsed.data.parent_comment_id &&
          c.listing_id === listingId &&
          c.status === "approved"
      );
      if (parentLocal) parentValid = true;
    }

    if (!parentValid) {
      return { ok: false, error: "Invalid reply: Parent comment does not exist in this listing." };
    }
  }

  const nowIso = new Date().toISOString();

  try {
    const { data: newRow, error } = await db
      .from("listing_comments")
      .insert({
        listing_id: listingId,
        user_id: userId,
        parent_comment_id: parsed.data.parent_comment_id || null,
        comment_text: parsed.data.comment_text,
        status: "approved",
      })
      .select("*")
      .single();

    if (!error && newRow) {
      const author = await fetchUserProfile(userId);
      return {
        ok: true,
        comment: {
          id: newRow.id,
          listingId: newRow.listing_id,
          userId: newRow.user_id,
          parentCommentId: newRow.parent_comment_id,
          commentText: newRow.comment_text,
          status: newRow.status,
          createdAt: newRow.created_at,
          updatedAt: newRow.updated_at,
          author,
          replies: [],
        },
      };
    }
  } catch {
    // Fallback
  }

  const newLocal: LocalComment = {
    id: commentIdSeq++,
    listing_id: listingId,
    user_id: userId,
    parent_comment_id: parsed.data.parent_comment_id || null,
    comment_text: parsed.data.comment_text,
    status: "approved",
    created_at: nowIso,
    updated_at: nowIso,
  };
  localCommentsStore.push(newLocal);

  const author = await fetchUserProfile(userId);
  return {
    ok: true,
    comment: {
      id: newLocal.id,
      listingId: newLocal.listing_id,
      userId: newLocal.user_id,
      parentCommentId: newLocal.parent_comment_id,
      commentText: newLocal.comment_text,
      status: newLocal.status,
      createdAt: newLocal.created_at,
      updatedAt: newLocal.updated_at,
      author,
      replies: [],
    },
  };
}

export async function updateListingComment(params: {
  userId: string;
  commentId: number;
  commentText: string;
  isAdmin?: boolean;
}): Promise<{ ok: boolean; comment?: CommentItem; error?: string }> {
  const { userId, commentId, commentText, isAdmin } = params;

  const parsed = commentSubmissionSchema.safeParse({ comment_text: commentText });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid comment text" };
  }

  const nowIso = new Date().toISOString();

  try {
    let query = db
      .from("listing_comments")
      .update({
        comment_text: parsed.data.comment_text,
        updated_at: nowIso,
      })
      .eq("id", commentId);

    if (!isAdmin) {
      query = query.eq("user_id", userId);
    }

    const { data: updated, error } = await query.select("*").single();

    if (!error && updated) {
      const author = await fetchUserProfile(updated.user_id);
      return {
        ok: true,
        comment: {
          id: updated.id,
          listingId: updated.listing_id,
          userId: updated.user_id,
          parentCommentId: updated.parent_comment_id,
          commentText: updated.comment_text,
          status: updated.status,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
          author,
        },
      };
    }
  } catch {
    // Fallback
  }

  const local = localCommentsStore.find((c) => c.id === commentId);
  if (!local) return { ok: false, error: "Comment not found" };
  if (!isAdmin && local.user_id !== userId) {
    return { ok: false, error: "Unauthorized: You can only edit your own comment" };
  }

  local.comment_text = parsed.data.comment_text;
  local.updated_at = nowIso;

  const author = await fetchUserProfile(local.user_id);
  return {
    ok: true,
    comment: {
      id: local.id,
      listingId: local.listing_id,
      userId: local.user_id,
      parentCommentId: local.parent_comment_id,
      commentText: local.comment_text,
      status: local.status,
      createdAt: local.created_at,
      updatedAt: local.updated_at,
      author,
    },
  };
}

export async function deleteListingComment(params: {
  userId: string;
  commentId: number;
  isAdmin?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const { userId, commentId, isAdmin } = params;

  try {
    let query = db.from("listing_comments").delete().eq("id", commentId);
    if (!isAdmin) {
      query = query.eq("user_id", userId);
    }
    const { error } = await query;
    if (!error) return { ok: true };
  } catch {
    // Fallback
  }

  const idx = localCommentsStore.findIndex((c) => c.id === commentId);
  if (idx === -1) return { ok: false, error: "Comment not found" };
  if (!isAdmin && localCommentsStore[idx].user_id !== userId) {
    return { ok: false, error: "Unauthorized: You can only delete your own comment" };
  }

  localCommentsStore.splice(idx, 1);
  return { ok: true };
}

export async function reportListingComment(params: {
  reporterId: string;
  commentId: number;
  reason: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { reporterId, commentId, reason } = params;

  const parsed = reportSubmissionSchema.safeParse({ reason });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid report reason" };
  }

  try {
    const { error } = await db.from("listing_comment_reports").insert({
      comment_id: commentId,
      reporter_id: reporterId,
      reason: parsed.data.reason,
    });
    if (!error) return { ok: true };
  } catch {
    // Fallback
  }

  const existing = localReportsStore.find(
    (r) => r.target_type === "comment" && r.target_id === commentId && r.reporter_id === reporterId
  );
  if (existing) {
    return { ok: false, error: "You have already reported this comment" };
  }

  localReportsStore.push({
    id: reportIdSeq++,
    target_type: "comment",
    target_id: commentId,
    reporter_id: reporterId,
    reason: parsed.data.reason,
    created_at: new Date().toISOString(),
  });

  return { ok: true };
}

// ============================================================================
// 5. Admin Moderation Operations
// ============================================================================

export async function getAdminReviews(statusFilter?: ReviewStatus | "all") {
  let list: any[] = [];
  try {
    let query = db.from("listing_reviews").select("*, listings(name, slug)");
    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    const { data } = await query.order("created_at", { ascending: false });
    if (data) list = data;
  } catch {
    list = localReviewsStore.filter(
      (r) => !statusFilter || statusFilter === "all" || r.status === statusFilter
    );
  }
  return list;
}

export async function moderateReview(reviewId: number, status: ReviewStatus) {
  try {
    await db.from("listing_reviews").update({ status }).eq("id", reviewId);
  } catch {
    const rev = localReviewsStore.find((r) => r.id === reviewId);
    if (rev) rev.status = status;
  }
  return { ok: true };
}

export async function getAdminComments(statusFilter?: CommentStatus | "all") {
  let list: any[] = [];
  try {
    let query = db.from("listing_comments").select("*, listings(name, slug)");
    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    const { data } = await query.order("created_at", { ascending: false });
    if (data) list = data;
  } catch {
    list = localCommentsStore.filter(
      (c) => !statusFilter || statusFilter === "all" || c.status === statusFilter
    );
  }
  return list;
}

export async function moderateComment(commentId: number, status: CommentStatus) {
  try {
    await db.from("listing_comments").update({ status }).eq("id", commentId);
  } catch {
    const c = localCommentsStore.find((item) => item.id === commentId);
    if (c) c.status = status;
  }
  return { ok: true };
}

export async function getAdminReports() {
  return localReportsStore;
}

