"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Trash2,
  Filter,
  Search,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Check,
  X,
  Flag,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "./Button";
import { AdminSidebar } from "./AdminSidebar";

interface ReviewItem {
  id: number | string;
  listing_id: number;
  user_id: string;
  rating: number;
  review_text: string;
  status: "pending" | "approved" | "rejected";
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    full_name?: string | null;
    email?: string | null;
  };
  listing?: {
    id: number;
    name: string;
    slug: string;
  };
  reports_count?: number;
}

interface CommentItem {
  id: number | string;
  listing_id: number;
  user_id: string;
  parent_comment_id?: number | string | null;
  comment_text: string;
  status: "pending" | "approved" | "hidden" | "rejected";
  created_at: string;
  updated_at: string;
  user?: {
    full_name?: string | null;
    email?: string | null;
  };
  listing?: {
    id: number;
    name: string;
    slug: string;
  };
  reports_count?: number;
}

export function AdminModerationClient() {
  const [activeTab, setActiveTab] = useState<"reviews" | "comments" | "reports">("reviews");
  const [reviewsStatus, setReviewsStatus] = useState<string>("all");
  const [commentsStatus, setCommentsStatus] = useState<string>("all");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const url = reviewsStatus === "all" ? "/api/admin/reviews" : `/api/admin/reviews?status=${reviewsStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.reviews || []);
      }
    } catch (e) {
      console.error("Error fetching reviews:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const url = commentsStatus === "all" ? "/api/admin/comments" : `/api/admin/comments?status=${commentsStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setComments(json.comments || []);
      }
    } catch (e) {
      console.error("Error fetching comments:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reviews" || activeTab === "reports") {
      fetchReviews();
    }
    if (activeTab === "comments" || activeTab === "reports") {
      fetchComments();
    }
  }, [activeTab, reviewsStatus, commentsStatus]);

  const handleReviewStatus = async (id: number | string, status: "approved" | "rejected") => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/reviews/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          setActionFeedback({ type: "success", text: `Review marked as ${status}` });
          setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        } else {
          const err = await res.json();
          setActionFeedback({ type: "error", text: err.error || "Failed to update review" });
        }
      } catch (err: any) {
        setActionFeedback({ type: "error", text: err.message });
      }
    });
  };

  const handleDeleteReview = async (id: number | string) => {
    if (!confirm("Permanently delete this review?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
        if (res.ok) {
          setActionFeedback({ type: "success", text: "Review deleted successfully" });
          setReviews((prev) => prev.filter((r) => r.id !== id));
        } else {
          const err = await res.json();
          setActionFeedback({ type: "error", text: err.error || "Failed to delete review" });
        }
      } catch (err: any) {
        setActionFeedback({ type: "error", text: err.message });
      }
    });
  };

  const handleCommentStatus = async (id: number | string, status: "approved" | "hidden" | "rejected") => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/comments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          setActionFeedback({ type: "success", text: `Comment marked as ${status}` });
          setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
        } else {
          const err = await res.json();
          setActionFeedback({ type: "error", text: err.error || "Failed to update comment" });
        }
      } catch (err: any) {
        setActionFeedback({ type: "error", text: err.message });
      }
    });
  };

  const handleDeleteComment = async (id: number | string) => {
    if (!confirm("Permanently delete this comment?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
        if (res.ok) {
          setActionFeedback({ type: "success", text: "Comment deleted successfully" });
          setComments((prev) => prev.filter((c) => c.id !== id));
        } else {
          const err = await res.json();
          setActionFeedback({ type: "error", text: err.error || "Failed to delete comment" });
        }
      } catch (err: any) {
        setActionFeedback({ type: "error", text: err.message });
      }
    });
  };

  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.review_text.toLowerCase().includes(query) ||
      (r.user?.full_name && r.user.full_name.toLowerCase().includes(query)) ||
      (r.user?.email && r.user.email.toLowerCase().includes(query)) ||
      (r.listing?.name && r.listing.name.toLowerCase().includes(query))
    );
  });

  const filteredComments = comments.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.comment_text.toLowerCase().includes(query) ||
      (c.user?.full_name && c.user.full_name.toLowerCase().includes(query)) ||
      (c.user?.email && c.user.email.toLowerCase().includes(query)) ||
      (c.listing?.name && c.listing.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] flex flex-col lg:flex-row antialiased font-sans">
      {/* ─── UNIFIED LIGHT SIDEBAR ─── */}
      <AdminSidebar
        currentRoute="moderation"
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((prev) => !prev)}
      />

      {/* ─── MAIN CONTENT CANVAS ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#E6E6F0] px-4 sm:px-8 py-3.5 flex items-center justify-between">
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
                <span className="text-[#4F46E5] font-semibold">Moderation Center</span>
              </div>
              <h1 className="font-heading font-extrabold text-base sm:text-lg text-[#14142B] flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-[#4F46E5]" />
                <span>Reviews &amp; Comments Moderation</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab === "reviews") fetchReviews();
                if (activeTab === "comments") fetchComments();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold text-[#55556E] hover:text-[#14142B] bg-[#F6F6FB] hover:bg-[#E6E6F0] transition-colors cursor-pointer border border-[#E6E6F0]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-[#4F46E5]" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

      {/* Main Container */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Banner Feedback */}
        {actionFeedback && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-medium animate-in fade-in duration-200 ${
              actionFeedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{actionFeedback.text}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E6F0] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "bg-white text-[#55556E] hover:text-[#14142B] border border-[#E6E6F0]"
              }`}
            >
              <Star className="h-4 w-4" />
              <span>Reviews ({reviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("comments")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
                activeTab === "comments"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "bg-white text-[#55556E] hover:text-[#14142B] border border-[#E6E6F0]"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Comments ({comments.length})</span>
            </button>
          </div>

          {/* Search bar & filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-[#55556E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search text or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D4D4E4] rounded-lg focus:outline-none focus:border-[#4F46E5] w-48 sm:w-60"
              />
            </div>

            {activeTab === "reviews" && (
              <select
                value={reviewsStatus}
                onChange={(e) => setReviewsStatus(e.target.value)}
                className="text-xs bg-white border border-[#D4D4E4] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}

            {activeTab === "comments" && (
              <select
                value={commentsStatus}
                onChange={(e) => setCommentsStatus(e.target.value)}
                className="text-xs bg-white border border-[#D4D4E4] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="all">All statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="hidden">Hidden</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>
        </div>

        {/* REVIEWS LIST */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-12 text-center text-xs font-mono text-[#55556E]">
                Loading reviews...
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D4D4E4] bg-white p-12 text-center space-y-2">
                <Star className="h-8 w-8 text-[#55556E] mx-auto opacity-30" />
                <p className="text-sm font-medium text-[#55556E]">No reviews found matching criteria.</p>
              </div>
            ) : (
              filteredReviews.map((review) => {
                const statusStyles = {
                  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  pending: "bg-amber-50 text-amber-700 border-amber-200",
                  rejected: "bg-rose-50 text-rose-700 border-rose-200",
                }[review.status];

                return (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4 hover:border-[#D4D4E4] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6F0] pb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${statusStyles}`}
                        >
                          {review.status}
                        </span>
                        {review.listing && (
                          <Link
                            href={`/product/${review.listing.slug}`}
                            target="_blank"
                            className="text-xs font-bold font-heading text-[#4F46E5] hover:underline flex items-center gap-1"
                          >
                            <span>{review.listing.name}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        <span className="text-xs text-[#55556E]">
                          by <strong className="text-[#14142B]">{review.user?.full_name || review.user?.email || "Anonymous"}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating ? "fill-amber-400" : "text-[#D4D4E4]"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-mono text-[#55556E]">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-[#14142B] leading-relaxed whitespace-pre-line">
                      {review.review_text}
                    </p>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="text-xs font-mono text-[#55556E]">
                        Helpful count: <strong className="text-[#14142B]">{review.helpful_count}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {review.status !== "approved" && (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleReviewStatus(review.id, "approved")}
                            className="bg-[#0F8A5F] hover:bg-[#0c704d] text-white flex items-center gap-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </Button>
                        )}

                        {review.status !== "rejected" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleReviewStatus(review.id, "rejected")}
                            className="text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </Button>
                        )}

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 rounded-lg text-[#55556E] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete review permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* COMMENTS LIST */}
        {activeTab === "comments" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-12 text-center text-xs font-mono text-[#55556E]">
                Loading comments...
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D4D4E4] bg-white p-12 text-center space-y-2">
                <MessageSquare className="h-8 w-8 text-[#55556E] mx-auto opacity-30" />
                <p className="text-sm font-medium text-[#55556E]">No comments found matching criteria.</p>
              </div>
            ) : (
              filteredComments.map((comment) => {
                const statusStyles = {
                  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  pending: "bg-amber-50 text-amber-700 border-amber-200",
                  hidden: "bg-purple-50 text-purple-700 border-purple-200",
                  rejected: "bg-rose-50 text-rose-700 border-rose-200",
                }[comment.status];

                return (
                  <div
                    key={comment.id}
                    className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4 hover:border-[#D4D4E4] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6F0] pb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${statusStyles}`}
                        >
                          {comment.status}
                        </span>
                        {comment.listing && (
                          <Link
                            href={`/product/${comment.listing.slug}`}
                            target="_blank"
                            className="text-xs font-bold font-heading text-[#4F46E5] hover:underline flex items-center gap-1"
                          >
                            <span>{comment.listing.name}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        <span className="text-xs text-[#55556E]">
                          by <strong className="text-[#14142B]">{comment.user?.full_name || comment.user?.email || "Anonymous"}</strong>
                        </span>
                        {comment.parent_comment_id && (
                          <span className="text-[10px] font-mono bg-[#F6F6FB] px-2 py-0.5 rounded-md border border-[#E6E6F0] text-[#55556E]">
                            Reply to #{comment.parent_comment_id}
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-mono text-[#55556E]">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-[#14142B] leading-relaxed whitespace-pre-line">
                      {comment.comment_text}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      {comment.status !== "approved" && (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleCommentStatus(comment.id, "approved")}
                          className="bg-[#0F8A5F] hover:bg-[#0c704d] text-white flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </Button>
                      )}

                      {comment.status !== "hidden" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleCommentStatus(comment.id, "hidden")}
                          className="text-purple-600 border-purple-200 hover:bg-purple-50 flex items-center gap-1"
                        >
                          <span>Hide</span>
                        </Button>
                      )}

                      {comment.status !== "rejected" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleCommentStatus(comment.id, "rejected")}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </Button>
                      )}

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-2 rounded-lg text-[#55556E] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete comment permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

