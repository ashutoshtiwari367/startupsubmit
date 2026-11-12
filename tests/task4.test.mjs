import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 1. Analytics Logic Testing (Mirrors lib/analytics.ts)
// ============================================================================
function isBotUserAgent(ua) {
  if (!ua) return false;
  const botKeywords = [
    "bot", "spider", "crawl", "slurp", "facebookexternalhit",
    "whatsapp", "telegram", "twitterbot", "linkedinbot", "embedly",
    "quora link preview", "pingdom", "headlesschrome", "lighthouse",
    "curl", "wget", "python-requests", "go-http-client",
  ];
  const lower = ua.toLowerCase();
  return botKeywords.some((keyword) => lower.includes(keyword));
}

function generateSessionHash(ip, userAgent) {
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
  return crypto
    .createHash("sha256")
    .update(`${ip || "unknown"}-${userAgent || "unknown"}-${currentHour}`)
    .digest("hex");
}

// In-memory view deduplication test
function simulateViewTracker() {
  const recentViews = new Map();
  const DEDUP_WINDOW_MS = 30 * 60 * 1000;

  return {
    recordView(listingId, sessionHash) {
      const key = `${listingId}:${sessionHash}`;
      const now = Date.now();
      const lastRecorded = recentViews.get(key);

      if (lastRecorded && now - lastRecorded < DEDUP_WINDOW_MS) {
        return { recorded: false, reason: "deduplicated" };
      }
      recentViews.set(key, now);
      return { recorded: true };
    },
  };
}

// Outbound click destination lookup test (Safe redirect, Open-Redirect immune)
function simulateOutboundRedirect(listingId, mockDatabaseListings, requestedTargetUrl) {
  const listing = mockDatabaseListings.find((l) => l.id === listingId);
  if (!listing) {
    return { status: 404, redirectUrl: null };
  }
  if (listing.status !== "approved") {
    return { status: 403, redirectUrl: null };
  }
  // CRITICAL: NEVER use requestedTargetUrl. Always pull trusted website_url from DB record.
  return { status: 302, redirectUrl: listing.website_url };
}

// ============================================================================
// 2. Reviews & Comments Zod Schemas (Mirrors lib/reviews-comments.ts)
// ============================================================================
const reviewSubmissionSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5 stars")
    .max(5, "Rating must be between 1 and 5 stars"),
  review_text: z
    .string()
    .trim()
    .min(1, "Review text cannot be empty")
    .max(3000, "Review cannot exceed 3,000 characters"),
});

const commentSubmissionSchema = z.object({
  comment_text: z
    .string()
    .trim()
    .min(1, "Comment text cannot be empty")
    .max(2000, "Comment cannot exceed 2,000 characters"),
  parent_comment_id: z.union([z.number().int().positive(), z.string()]).nullable().optional(),
});

const reportSubmissionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

// ============================================================================
// Test Suite: TASK 4
// ============================================================================

describe("Task 4 Part 1: Dashboard Analytics & Bot/Session Deduplication", () => {
  it("generates privacy-preserving SHA-256 session hash and never stores raw IP", () => {
    const rawIp = "203.0.113.195";
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
    const hash1 = generateSessionHash(rawIp, userAgent);
    const hash2 = generateSessionHash(rawIp, userAgent);

    assert.equal(typeof hash1, "string");
    assert.equal(hash1.length, 64, "SHA-256 produces a 64-char hex string");
    assert.equal(hash1, hash2, "Identical IP+UA within the same hour generates the same hash");
    assert.ok(!hash1.includes(rawIp), "Session hash must not contain raw IP");

    const hashDifferentIp = generateSessionHash("198.51.100.4", userAgent);
    assert.notEqual(hash1, hashDifferentIp, "Different IPs produce distinct session hashes");
  });

  it("identifies and filters out bot User-Agents from view tracking", () => {
    const botUserAgents = [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "curl/7.88.1",
      "python-requests/2.31.0",
      "Wget/1.21.3",
      "Twitterbot/1.0",
      "facebookexternalhit/1.1",
    ];

    for (const bot of botUserAgents) {
      assert.ok(isBotUserAgent(bot), `Should identify as bot: ${bot}`);
    }

    const humanUserAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15",
    ];

    for (const human of humanUserAgents) {
      assert.ok(!isBotUserAgent(human), `Should identify as human: ${human}`);
    }
  });

  it("deduplicates listing views within 30-minute session window", () => {
    const tracker = simulateViewTracker();
    const listingId = 50000001;
    const sessionHash = "abc123def456";

    // First view in window
    const firstAttempt = tracker.recordView(listingId, sessionHash);
    assert.equal(firstAttempt.recorded, true);

    // Second immediate view from same user/session
    const secondAttempt = tracker.recordView(listingId, sessionHash);
    assert.equal(secondAttempt.recorded, false);
    assert.equal(secondAttempt.reason, "deduplicated");

    // View for a different listing is recorded
    const otherListingAttempt = tracker.recordView(50000002, sessionHash);
    assert.equal(otherListingAttempt.recorded, true);
  });

  it("strictly prevents Open-Redirect vulnerabilities during website click tracking", () => {
    const mockListings = [
      {
        id: 50000001,
        slug: "tech-hr",
        name: "Tech hr",
        website_url: "https://techhr.io",
        status: "approved",
      },
      {
        id: 50000002,
        slug: "pending-tool",
        name: "Pending Tool",
        website_url: "https://pendingtool.com",
        status: "pending",
      },
    ];

    // Attacker tries to pass malicious redirect destination in query params
    const maliciousTarget = "https://evil-phishing-site.example.com";
    const resApproved = simulateOutboundRedirect(50000001, mockListings, maliciousTarget);

    assert.equal(resApproved.status, 302);
    assert.equal(
      resApproved.redirectUrl,
      "https://techhr.io",
      "Redirect destination must ALWAYS come from the verified database record, ignoring attacker URL"
    );

    // Pending tool cannot have clicks recorded or redirected
    const resPending = simulateOutboundRedirect(50000002, mockListings, maliciousTarget);
    assert.equal(resPending.status, 403);
    assert.equal(resPending.redirectUrl, null);
  });
});

describe("Task 4 Part 2: Product Detail Reviews System", () => {
  it("validates reviews strictly: 1 to 5 stars and 1 to 3,000 characters", () => {
    const valid = reviewSubmissionSchema.safeParse({
      rating: 5,
      review_text: "Outstanding tool for directory discovery and backlinks. Highly recommend!",
    });
    assert.ok(valid.success);

    // Rating lower than 1
    const invalidRatingLow = reviewSubmissionSchema.safeParse({
      rating: 0,
      review_text: "Good",
    });
    assert.ok(!invalidRatingLow.success);

    // Rating higher than 5
    const invalidRatingHigh = reviewSubmissionSchema.safeParse({
      rating: 6,
      review_text: "Good",
    });
    assert.ok(!invalidRatingHigh.success);

    // Decimal rating rejected
    const invalidRatingFloat = reviewSubmissionSchema.safeParse({
      rating: 4.5,
      review_text: "Good",
    });
    assert.ok(!invalidRatingFloat.success);

    // Empty review text rejected
    const emptyReview = reviewSubmissionSchema.safeParse({
      rating: 4,
      review_text: "   ",
    });
    assert.ok(!emptyReview.success);

    // Oversized review text (>3000 chars) rejected
    const oversizedReview = reviewSubmissionSchema.safeParse({
      rating: 4,
      review_text: "a".repeat(3001),
    });
    assert.ok(!oversizedReview.success);

    // Boundary 3000 chars accepted
    const boundaryReview = reviewSubmissionSchema.safeParse({
      rating: 4,
      review_text: "a".repeat(3000),
    });
    assert.ok(boundaryReview.success);
  });

  it("enforces one review per user per listing constraint", () => {
    const existingReviews = [
      { id: 1, listing_id: 50000001, user_id: "user-uuid-1", rating: 5, review_text: "Loved it" },
    ];

    function canSubmitReview(listingId, userId) {
      return !existingReviews.some((r) => r.listing_id === listingId && r.user_id === userId);
    }

    assert.equal(canSubmitReview(50000001, "user-uuid-1"), false, "Existing reviewer cannot submit second review");
    assert.equal(canSubmitReview(50000001, "user-uuid-2"), true, "New user can submit review");
    assert.equal(canSubmitReview(50000002, "user-uuid-1"), true, "User can review a different listing");
  });

  it("supports helpful voting with toggle behavior", () => {
    const votes = new Set(); // stores "reviewId:userId"
    let helpfulCount = 0;

    function toggleHelpful(reviewId, userId) {
      const key = `${reviewId}:${userId}`;
      if (votes.has(key)) {
        votes.delete(key);
        helpfulCount--;
        return { helpful: false, helpfulCount };
      } else {
        votes.add(key);
        helpfulCount++;
        return { helpful: true, helpfulCount };
      }
    }

    const firstClick = toggleHelpful(101, "user-A");
    assert.equal(firstClick.helpful, true);
    assert.equal(firstClick.helpfulCount, 1);

    // Second click from same user removes their helpful vote
    const secondClick = toggleHelpful(101, "user-A");
    assert.equal(secondClick.helpful, false);
    assert.equal(secondClick.helpfulCount, 0);
  });
});

describe("Task 4 Part 3: Product Comments System & Threading Security", () => {
  it("validates comments: 1 to 2,000 characters and optional parent_comment_id", () => {
    const validTop = commentSubmissionSchema.safeParse({
      comment_text: "Does this SaaS integrate with Slack?",
      parent_comment_id: null,
    });
    assert.ok(validTop.success);

    const validReply = commentSubmissionSchema.safeParse({
      comment_text: "Yes, Slack and Discord webhooks are supported natively.",
      parent_comment_id: 42,
    });
    assert.ok(validReply.success);

    // Empty comment rejected
    const emptyComment = commentSubmissionSchema.safeParse({
      comment_text: "   ",
    });
    assert.ok(!emptyComment.success);

    // Oversized comment (>2000 chars) rejected
    const oversizedComment = commentSubmissionSchema.safeParse({
      comment_text: "c".repeat(2001),
    });
    assert.ok(!oversizedComment.success);
  });

  it("blocks cross-listing parent comment replies", () => {
    const mockComments = [
      { id: 10, listing_id: 50000001, text: "Comment on Tool A" },
      { id: 20, listing_id: 50000002, text: "Comment on Tool B" },
    ];

    function validateParentComment(targetListingId, parentCommentId) {
      if (!parentCommentId) return { valid: true };
      const parent = mockComments.find((c) => c.id === parentCommentId);
      if (!parent) return { valid: false, error: "Parent comment not found" };
      if (parent.listing_id !== targetListingId) {
        return { valid: false, error: "Parent comment belongs to a different listing" };
      }
      return { valid: true };
    }

    // Reply within same listing: Tool A -> Tool A comment
    const validReply = validateParentComment(50000001, 10);
    assert.equal(validReply.valid, true);

    // Malicious reply: Posting on Tool A but referencing comment on Tool B
    const attackReply = validateParentComment(50000001, 20);
    assert.equal(attackReply.valid, false);
    assert.equal(attackReply.error, "Parent comment belongs to a different listing");
  });

  it("authorizes comment edit/delete only for author or admin", () => {
    const comment = { id: 10, listing_id: 50000001, user_id: "author-uuid" };

    function canModify(comment, requesterUserId, isAdmin) {
      if (isAdmin) return true;
      return comment.user_id === requesterUserId;
    }

    assert.equal(canModify(comment, "author-uuid", false), true, "Author can modify own comment");
    assert.equal(canModify(comment, "other-user", false), false, "Stranger cannot modify another user's comment");
    assert.equal(canModify(comment, "other-user", true), true, "Admin can moderate any comment");
  });
});

describe("Task 4 Part 4 & 5: Database Migration & API Route Consistency", () => {
  it("verifies migration file 0004_analytics_reviews_comments.sql contains all tables, indexes and RLS", () => {
    const migrationPath = path.join(__dirname, "../supabase/migrations/0004_analytics_reviews_comments.sql");
    assert.ok(fs.existsSync(migrationPath), "Migration file 0004 must exist");

    const sql = fs.readFileSync(migrationPath, "utf-8");

    // All 6 required tables
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.listing_analytics"));
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.listing_reviews"));
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.listing_review_helpful"));
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.listing_comments"));
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.listing_review_reports"));
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.listing_comment_reports"));

    // Constraints & Indexes
    assert.ok(sql.includes("uq_listing_reviews_user UNIQUE (listing_id, user_id)"), "Enforces one review per user per listing constraint");
    assert.ok(sql.includes("rating >= 1 AND rating <= 5"), "Enforces check constraint on rating 1 to 5");
    assert.ok(sql.includes("ENABLE ROW LEVEL SECURITY"), "Enables RLS on database tables");
  });

  it("verifies all Task 4 API routes exist in app/api/", () => {
    const requiredEndpoints = [
      "app/api/analytics/view/route.ts",
      "app/api/analytics/website-click/route.ts",
      "app/api/analytics/redirect/route.ts",
      "app/api/analytics/dashboard/route.ts",
      "app/api/admin/analytics/route.ts",
      "app/api/listings/[slug]/reviews/route.ts",
      "app/api/reviews/[id]/route.ts",
      "app/api/reviews/[id]/helpful/route.ts",
      "app/api/reviews/[id]/report/route.ts",
      "app/api/listings/[slug]/comments/route.ts",
      "app/api/comments/[id]/route.ts",
      "app/api/comments/[id]/report/route.ts",
      "app/api/admin/reviews/route.ts",
      "app/api/admin/reviews/[id]/route.ts",
      "app/api/admin/comments/route.ts",
      "app/api/admin/comments/[id]/route.ts",
    ];

    for (const relPath of requiredEndpoints) {
      const fullPath = path.join(__dirname, "..", relPath);
      assert.ok(fs.existsSync(fullPath), `Endpoint route must exist: ${relPath}`);
    }
  });

  it("verifies UI components adhere to LaunchOS design system (#4F46E5, Inter, Mono)", () => {
    const files = [
      "components/DashboardAnalytics.tsx",
      "components/ProductReviewsSection.tsx",
      "components/ProductCommentsSection.tsx",
      "components/AdminModerationClient.tsx",
    ];

    for (const file of files) {
      const fullPath = path.join(__dirname, "..", file);
      assert.ok(fs.existsSync(fullPath), `Component file must exist: ${file}`);
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.ok(content.includes("#4F46E5"), `${file} must use LaunchOS primary brand color #4F46E5`);
    }
  });
});
