"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Reply,
  Edit2,
  Trash2,
  Flag,
  Send,
  X,
  CornerDownRight,
  ShieldAlert,
} from "lucide-react";
import type { CommentItem } from "@/lib/reviews-comments";
import { Button } from "./Button";
import { AuthModal } from "./AuthModal";

interface ProductCommentsSectionProps {
  listingId: number;
  listingSlug: string;
  listingName: string;
  currentUserId?: string | null;
}

export const ProductCommentsSection: React.FC<ProductCommentsSectionProps> = ({
  listingId,
  listingSlug,
  listingName,
  currentUserId,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Reply state
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  // Edit state
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  // Report state
  const [showReportModal, setShowReportModal] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<string>("");

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/listings/${listingSlug}/comments`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok) {
          setComments(json.comments || []);
          setTotalCount(json.totalCount || 0);
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [listingSlug]);

  const handlePostTopComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      setShowAuthModal(true);
      return;
    }
    if (!newCommentText.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/listings/${listingSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: newCommentText.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrorMessage(json.error || "Failed to post comment.");
        setIsSubmitting(false);
        return;
      }

      setNewCommentText("");
      await fetchComments();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (parentCommentId: number) => {
    if (!currentUserId) {
      setShowAuthModal(true);
      return;
    }
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/listings/${listingSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_text: replyText.trim(),
          parent_comment_id: parentCommentId,
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setReplyText("");
        setReplyingToId(null);
        await fetchComments();
      } else {
        alert(json.error || "Failed to submit reply.");
      }
    } catch {
      // Ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: editingText.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setEditingCommentId(null);
        setEditingText("");
        await fetchComments();
      } else {
        alert(json.error || "Failed to update comment.");
      }
    } catch {
      // Ignore
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchComments();
      }
    } catch {
      // Ignore
    }
  };

  const handleReportComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReportModal || !reportReason.trim()) return;

    try {
      const res = await fetch(`/api/comments/${showReportModal}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (res.ok) {
        alert("Comment reported for moderator review.");
      }
    } catch {
      // Ignore
    } finally {
      setShowReportModal(null);
      setReportReason("");
    }
  };

  const renderCommentCard = (comment: CommentItem, isReply = false) => {
    const isOwner = currentUserId && comment.userId === currentUserId;
    const isEditing = editingCommentId === comment.id;

    return (
      <div
        key={comment.id}
        className={`rounded-2xl border ${
          isReply
            ? "border-[#E6E6F0] bg-[#FAFAFE] ml-6 sm:ml-10 p-4"
            : "border-[#E6E6F0] bg-white p-5"
        } space-y-3 shadow-xs`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Author avatar & meta */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#14142B] text-white flex items-center justify-center text-xs font-bold uppercase shrink-0 overflow-hidden">
              {comment.author.avatarUrl ? (
                <img
                  src={comment.author.avatarUrl}
                  alt={comment.author.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                comment.author.name.slice(0, 2)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-[#14142B]">
                  {comment.author.name}
                </span>
                {comment.author.custIdExt && (
                  <span className="font-mono text-[10px] text-[#55556E]">
                    #{comment.author.custIdExt}
                  </span>
                )}
                {isOwner && (
                  <span className="bg-[#F7F6FF] text-[#4F46E5] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#E0DEFC]">
                    You
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-[#55556E] block">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 text-xs">
            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommentId(comment.id);
                    setEditingText(comment.commentText);
                  }}
                  className="p-1.5 text-[#55556E] hover:text-[#4F46E5] rounded-lg transition-colors cursor-pointer"
                  title="Edit Comment"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-1.5 text-[#55556E] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                  title="Delete Comment"
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
                  setShowReportModal(comment.id);
                }}
                className="p-1.5 text-[#55556E] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                title="Report Comment"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Comment Body or Inline Editor */}
        {isEditing ? (
          <div className="space-y-2 pt-1">
            <textarea
              rows={3}
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full rounded-xl border border-[#D4D4E4] p-2.5 text-xs sm:text-sm text-[#14142B] focus:border-[#4F46E5] focus:outline-none"
              maxLength={2000}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCommentId(null)}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-[#55556E] hover:bg-[#F1F1F8] cursor-pointer"
              >
                Cancel
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSaveEdit(comment.id)}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-[#14142B] leading-relaxed whitespace-pre-wrap">
            {comment.commentText}
          </p>
        )}

        {/* Reply trigger button */}
        {!isReply && (
          <div className="pt-2 border-t border-[#F1F1F8] flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                if (!currentUserId) {
                  setShowAuthModal(true);
                  return;
                }
                setReplyingToId(replyingToId === comment.id ? null : comment.id);
                setReplyText("");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
            >
              <Reply className="h-3.5 w-3.5" />
              <span>Reply</span>
            </button>
          </div>
        )}

        {/* Inline Reply Form */}
        {replyingToId === comment.id && (
          <div className="pt-3 border-t border-[#F1F1F8] space-y-2">
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#55556E]">
              <CornerDownRight className="h-3 w-3 text-[#4F46E5]" />
              <span>Replying to {comment.author.name}</span>
            </div>
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a constructive reply..."
              className="w-full rounded-xl border border-[#D4D4E4] p-2.5 text-xs text-[#14142B] focus:border-[#4F46E5] focus:outline-none"
              maxLength={2000}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplyingToId(null)}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-[#55556E] hover:bg-[#F1F1F8] cursor-pointer"
              >
                Cancel
              </button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                onClick={() => handlePostReply(comment.id)}
              >
                Post Reply
              </Button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 pt-2">
            {comment.replies.map((reply) => renderCommentCard(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-6 border-t border-[#E6E6F0]" id="comments-section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#4F46E5] block mb-0.5">
            COMMUNITY DISCUSSIONS
          </span>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14142B] tracking-tight flex items-center gap-2">
            <span>Comments</span>
            <span className="rounded-full bg-[#F1F1F8] border border-[#E6E6F0] px-2.5 py-0.5 text-xs font-mono font-bold text-[#4F46E5]">
              {totalCount}
            </span>
          </h2>
          <p className="text-xs text-[#55556E] mt-0.5">
            Ask questions, exchange setup advice, and share workflows with {listingName}
          </p>
        </div>
      </div>

      {/* Main Comment Input Box */}
      <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 space-y-3 shadow-xs">
        <form onSubmit={handlePostTopComment} className="space-y-3">
          <textarea
            rows={3}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={
              currentUserId
                ? "Leave a comment, ask the maker a question, or share your tips..."
                : "Sign in to join the discussion and post comments..."
            }
            onClick={() => {
              if (!currentUserId) setShowAuthModal(true);
            }}
            className="w-full rounded-xl border border-[#D4D4E4] p-3 text-xs sm:text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:border-[#4F46E5] focus:outline-none"
            maxLength={2000}
          />

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626]">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-[#55556E]">
              {newCommentText.length} / 2000 characters
            </span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !newCommentText.trim()}
              leftIcon={<Send className="h-3.5 w-3.5" />}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#55556E]">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-2xl border border-[#E6E6F0] bg-white p-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#F6F6FB] text-[#55556E] flex items-center justify-center mx-auto">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#14142B]">
              No comments yet
            </h3>
            <p className="text-xs text-[#55556E]">
              Start the conversation by asking the maker a question or sharing your experience.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => renderCommentCard(comment, false))}
          </div>
        )}
      </div>

      {/* Report Comment Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#E6E6F0] bg-white p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-[#14142B]">
                Report Inappropriate Comment
              </h3>
              <button
                type="button"
                onClick={() => setShowReportModal(null)}
                className="text-[#55556E] hover:text-[#14142B] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReportComment} className="space-y-3">
              <p className="text-xs text-[#55556E]">
                Why are you reporting this comment? (Spam, harassment, hate speech, or abuse)
              </p>
              <textarea
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason for report..."
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
