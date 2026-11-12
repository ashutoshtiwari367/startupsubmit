"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  Flag,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";
import type { ReviewItem, ReviewsResponse } from "@/lib/reviews-comments";
import { Button } from "./Button";
import { AuthModal } from "./AuthModal";

interface ProductReviewsSectionProps {
  listingId: number;
  listingSlug: string;
  listingName: string;
  currentUserId?: string | null;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  listingId,
  listingSlug,
  listingName,
  currentUserId,
}) => {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/listings/${listingSlug}/reviews`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok) {
          setData(json);
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [listingSlug]);

  const handleOpenReviewForm = (reviewToEdit?: ReviewItem) => {
    if (!currentUserId) {
      setShowAuthModal(true);
      return;
    }
    if (reviewToEdit) {
      setEditingReviewId(reviewToEdit.id);
      setRating(reviewToEdit.rating);
      setReviewText(reviewToEdit.reviewText);
    } else {
      setEditingReviewId(null);
      setRating(5);
      setReviewText("");
    }
    setFormError("");
    setShowSubmitModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setFormError("Please write your review thoughts.");
      return;
    }
    setIsSubmitting(true);
    setFormError("");

    try {
      if (editingReviewId) {
        // Edit existing review
        const res = await fetch(`/api/reviews/${editingReviewId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, review_text: reviewText.trim() }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setFormError(json.error || "Failed to update review.");
          setIsSubmitting(false);
          return;
        }
      } else {
        // Create new review
        const res = await fetch(`/api/listings/${listingSlug}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, review_text: reviewText.trim() }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setFormError(json.error || "Failed to submit review.");
          setIsSubmitting(false);
          return;
        }
      }

      setShowSubmitModal(false);
      setReviewText("");
      setEditingReviewId(null);
      await fetchReviews();
    } catch (err: any) {
      setFormError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete your review?")) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchReviews();
      }
    } catch {
      // Ignore
    }
  };

  const handleToggleHelpful = async (reviewId: number) => {
    if (!currentUserId) {
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.ok) {
          setData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              reviews: prev.reviews.map((r) =>
                r.id === reviewId
                  ? {
                      ...r,
                      helpfulCount: json.helpful_count,
                      isHelpfulByMe: json.is_helpful,
                    }
                  : r
              ),
            };
          });
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleReportReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReportModal || !reportReason.trim()) return;

    try {
      const res = await fetch(`/api/reviews/${showReportModal}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (res.ok) {
        alert("Thank you. The review has been reported for editorial review.");
      }
    } catch {
      // Ignore
    } finally {
      setShowReportModal(null);
      setReportReason("");
    }
  };

  const totalReviews = data?.totalReviews || 0;
  const averageRating = data?.averageRating || 0;

  return (
    <div className="space-y-6 pt-6 border-t border-[#E6E6F0]" id="reviews-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#4F46E5] block mb-0.5">
            COMMUNITY RATINGS
          </span>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14142B] tracking-tight">
            Customer Reviews &amp; Ratings
          </h2>
          <p className="text-xs text-[#55556E] mt-0.5">
            Verified ratings and experiences from founders using {listingName}
          </p>
        </div>

        {data?.myReview ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenReviewForm(data.myReview!)}
            leftIcon={<Edit2 className="h-3.5 w-3.5" />}
          >
            Edit Your Review
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenReviewForm()}
            leftIcon={<Star className="h-3.5 w-3.5 fill-white" />}
          >
            Write a Review
          </Button>
        )}
      </div>

      {/* Rating Summary & Distribution Breakdown */}
      <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Big Average Star Score */}
        <div className="md:col-span-4 text-center md:border-r border-[#E6E6F0] md:pr-6 space-y-1.5">
          <div className="font-heading font-extrabold text-5xl text-[#14142B]">
            {averageRating > 0 ? averageRating.toFixed(1) : "—"}
          </div>
          <div className="flex items-center justify-center gap-1 text-[#CA8A04]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-[#CA8A04] text-[#CA8A04]"
                    : "text-[#D4D4E4]"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-[#55556E] font-medium">
            Based on {totalReviews} approved review{totalReviews === 1 ? "" : "s"}
          </p>
        </div>

        {/* Right: Distribution Bars (5 to 1 star) */}
        <div className="md:col-span-8 space-y-2">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = data?.ratingDistribution[star] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-mono font-medium text-[#55556E] flex items-center gap-1 shrink-0">
                  <span>{star}</span>
                  <Star className="h-3 w-3 fill-[#CA8A04] text-[#CA8A04]" />
                </span>
                <div className="flex-1 h-2.5 bg-[#F1F1F8] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-[#CA8A04] rounded-full transition-all duration-300"
                  ></div>
                </div>
                <span className="w-10 text-right font-mono text-[11px] text-[#55556E] shrink-0">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-10 text-center text-xs text-[#55556E]">
            Loading reviews...
          </div>
        ) : !data?.reviews || data.reviews.length === 0 ? (
          <div className="rounded-2xl border border-[#E6E6F0] bg-white p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FEFCE8] text-[#CA8A04] flex items-center justify-center mx-auto">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-[#14142B]">
              Be the first to review {listingName}!
            </h3>
            <p className="text-xs text-[#55556E] max-w-sm mx-auto">
              Share your feedback, pricing satisfaction, and tips to help other founders discover great software.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenReviewForm()}
            >
              Write First Review
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.reviews.map((rev) => {
              const isOwner = currentUserId && rev.userId === currentUserId;

              return (
                <div
                  key={rev.id}
                  className="rounded-2xl border border-[#E6E6F0] bg-white p-5 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Author & Rating info */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-xs font-bold uppercase shrink-0 overflow-hidden">
                        {rev.author.avatarUrl ? (
                          <img
                            src={rev.author.avatarUrl}
                            alt={rev.author.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          rev.author.name.slice(0, 2)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#14142B]">
                            {rev.author.name}
                          </span>
                          {rev.author.custIdExt && (
                            <span className="font-mono text-[10px] text-[#55556E]">
                              #{rev.author.custIdExt}
                            </span>
                          )}
                          {isOwner && (
                            <span className="bg-[#F7F6FF] text-[#4F46E5] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#E0DEFC]">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center text-[#CA8A04]">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3 w-3 ${
                                  s <= rev.rating
                                    ? "fill-[#CA8A04] text-[#CA8A04]"
                                    : "text-[#D4D4E4]"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-mono text-[#55556E]">
                            • {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Edit/Delete if owner, or Report */}
                    <div className="flex items-center gap-1 text-xs">
                      {isOwner ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenReviewForm(rev)}
                            className="p-1.5 text-[#55556E] hover:text-[#4F46E5] hover:bg-[#F6F6FB] rounded-lg transition-colors cursor-pointer"
                            title="Edit Review"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 text-[#55556E] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentUserId) {
                              setShowAuthModal(true);
                              return;
                            }
                            setShowReportModal(rev.id);
                          }}
                          className="p-1.5 text-[#55556E] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                          title="Report Review"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-[#14142B] leading-relaxed whitespace-pre-wrap">
                    {rev.reviewText}
                  </p>

                  {/* Review Footer with Helpful button */}
                  <div className="pt-2 border-t border-[#F1F1F8] flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleHelpful(rev.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                        rev.isHelpfulByMe
                          ? "bg-[#4F46E5] text-white"
                          : "bg-[#F6F6FB] text-[#55556E] hover:text-[#14142B] hover:bg-[#E6E6F0]"
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal: Write or Edit */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E6E6F0] bg-white p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-lg text-[#14142B]">
                {editingReviewId ? "Edit Your Review" : `Review ${listingName}`}
              </h3>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-[#55556E] hover:text-[#14142B] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#55556E] mb-1.5">
                  Your Overall Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= (hoverRating || rating)
                            ? "fill-[#CA8A04] text-[#CA8A04]"
                            : "text-[#D4D4E4]"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-mono text-xs font-bold text-[#14142B] ml-2">
                    {hoverRating || rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Written Review */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#55556E] mb-1.5">
                  Written Feedback (1 to 3000 chars) *
                </label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What do you like most about this product? How is the pricing and customer support?"
                  className="w-full rounded-xl border border-[#D4D4E4] p-3 text-xs sm:text-sm text-[#14142B] focus:border-[#4F46E5] focus:outline-none"
                  maxLength={3000}
                  required
                />
                <div className="flex justify-between text-[11px] font-mono text-[#55556E] mt-1">
                  <span>Honest, constructive reviews help the community</span>
                  <span>{reviewText.length} / 3000</span>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626]">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : editingReviewId
                    ? "Save Changes"
                    : "Post Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#E6E6F0] bg-white p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-[#14142B]">
                Report Inappropriate Review
              </h3>
              <button
                type="button"
                onClick={() => setShowReportModal(null)}
                className="text-[#55556E] hover:text-[#14142B] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReportReview} className="space-y-3">
              <p className="text-xs text-[#55556E]">
                Please explain why this review violates community guidelines (spam, offensive language, or competitor sabotage).
              </p>
              <textarea
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason for reporting..."
                className="w-full rounded-xl border border-[#D4D4E4] p-3 text-xs text-[#14142B] focus:border-[#4F46E5] focus:outline-none"
                maxLength={500}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowReportModal(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Submit Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal Trigger */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="signin"
        />
      )}
    </div>
  );
};
