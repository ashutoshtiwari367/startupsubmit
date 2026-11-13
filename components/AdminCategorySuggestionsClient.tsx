"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  FolderPlus,
  Tag,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Globe,
  ExternalLink,
  ShieldAlert,
  Inbox,
  AlertCircle,
  X,
  Sparkles,
  GitFork,
  Pencil,
  RefreshCw,
  PanelLeftOpen,
} from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import type {
  CategorySuggestionRow,
  SuggestionStatus,
} from "@/lib/category-suggestions";

interface AdminCategoryItem {
  id: number;
  slug: string;
  name: string;
  parent_id?: number | null;
}

interface AdminCategorySuggestionsClientProps {
  initialSuggestions: CategorySuggestionRow[];
  initialCounts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  allCategories: AdminCategoryItem[];
}

export function AdminCategorySuggestionsClient({
  initialSuggestions,
  initialCounts,
  allCategories,
}: AdminCategorySuggestionsClientProps) {
  const [suggestions, setSuggestions] = useState<CategorySuggestionRow[]>(
    initialSuggestions
  );
  const [categories, setCategories] = useState<AdminCategoryItem[]>(allCategories);
  const [counts, setCounts] = useState(initialCounts);
  const [statusFilter, setStatusFilter] = useState<SuggestionStatus | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Review Modal State
  const [activeSuggestion, setActiveSuggestion] =
    useState<CategorySuggestionRow | null>(null);
  const [approvalTab, setApprovalTab] = useState<
    "create_new" | "add_to_existing" | "rename_existing"
  >("create_new");

  // Form Fields for Modal
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formParentId, setFormParentId] = useState<string>("");
  const [formDescription, setFormDescription] = useState("");
  const [formTargetCategoryId, setFormTargetCategoryId] = useState<string>("");
  const [rejectReason, setRejectReason] = useState("");

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Open modal pre-filling suggestion values
  const openReviewModal = (suggestion: CategorySuggestionRow) => {
    setActiveSuggestion(suggestion);
    setApprovalTab("create_new");
    setFormName(suggestion.suggested_name);
    setFormSlug(suggestion.suggested_slug);
    setFormParentId("");
    setFormDescription(
      `Community suggested category for ${suggestion.suggested_name}`
    );
    setFormTargetCategoryId(
      categories.length > 0 ? String(categories[0].id) : ""
    );
    setRejectReason("");
    setFeedback(null);
  };

  const closeModal = () => {
    setActiveSuggestion(null);
    setFeedback(null);
  };

  // Filter and search
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => {
      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        s.suggested_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.suggested_slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.listings?.name &&
          s.listings.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [suggestions, statusFilter, searchQuery]);

  // Execute Approval Actions
  const handleApprove = async () => {
    if (!activeSuggestion) return;
    setFeedback(null);

    let payload: Record<string, unknown> = {
      action_type: approvalTab,
    };

    if (approvalTab === "create_new") {
      if (!formName.trim()) {
        setFeedback({ type: "error", message: "Category name is required." });
        return;
      }
      payload = {
        action_type: "create_new",
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        parent_id: formParentId ? Number(formParentId) : null,
        description: formDescription.trim() || undefined,
      };
    } else if (approvalTab === "add_to_existing") {
      if (!formParentId) {
        setFeedback({
          type: "error",
          message: "Please select an existing parent category.",
        });
        return;
      }
      if (!formName.trim()) {
        setFeedback({ type: "error", message: "Subcategory name is required." });
        return;
      }
      payload = {
        action_type: "add_to_existing",
        name: formName.trim(),
        parent_id: Number(formParentId),
        slug: formSlug.trim() || undefined,
        description: formDescription.trim() || undefined,
      };
    } else if (approvalTab === "rename_existing") {
      if (!formTargetCategoryId) {
        setFeedback({
          type: "error",
          message: "Please select the target category to rename.",
        });
        return;
      }
      if (!formName.trim()) {
        setFeedback({ type: "error", message: "New category name is required." });
        return;
      }
      payload = {
        action_type: "rename_existing",
        target_category_id: Number(formTargetCategoryId),
        new_name: formName.trim(),
        new_slug: formSlug.trim() || undefined,
      };
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/categories/suggestions/${activeSuggestion.id}/approve`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setFeedback({
            type: "error",
            message: data.message || "Failed to approve category suggestion.",
          });
          return;
        }

        // Optimistically update suggestion in state
        setSuggestions((prev) =>
          prev.map((s) =>
            s.id === activeSuggestion.id
              ? {
                  ...s,
                  status: "approved",
                  action_type: approvalTab,
                  resolved_category_id: data.category?.id ?? s.resolved_category_id,
                  reviewed_at: new Date().toISOString(),
                }
              : s
          )
        );
        setCounts((c) => ({
          ...c,
          pending: Math.max(0, c.pending - 1),
          approved: c.approved + 1,
        }));

        // If new category created or renamed, refresh categories list
        if (data.category) {
          if (approvalTab === "rename_existing") {
            setCategories((prev) =>
              prev.map((c) =>
                c.id === data.category.id
                  ? { ...c, name: data.category.name, slug: data.category.slug }
                  : c
              )
            );
          } else {
            setCategories((prev) => [
              ...prev,
              {
                id: data.category.id,
                name: data.category.name,
                slug: data.category.slug,
                parent_id: formParentId ? Number(formParentId) : null,
              },
            ]);
          }
        }

        closeModal();
      } catch (err: unknown) {
        setFeedback({
          type: "error",
          message:
            err instanceof Error
              ? err.message
              : "Network error during approval.",
        });
      }
    });
  };

  // Execute Rejection
  const handleReject = async () => {
    if (!activeSuggestion) return;
    setFeedback(null);

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/categories/suggestions/${activeSuggestion.id}/reject`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ admin_note: rejectReason.trim() || undefined }),
          }
        );
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setFeedback({
            type: "error",
            message: data.message || "Failed to reject suggestion.",
          });
          return;
        }

        setSuggestions((prev) =>
          prev.map((s) =>
            s.id === activeSuggestion.id
              ? {
                  ...s,
                  status: "rejected",
                  action_type: "reject",
                  admin_note: rejectReason.trim() || null,
                  reviewed_at: new Date().toISOString(),
                }
              : s
          )
        );
        setCounts((c) => ({
          ...c,
          pending: Math.max(0, c.pending - 1),
          rejected: c.rejected + 1,
        }));

        closeModal();
      } catch (err: unknown) {
        setFeedback({
          type: "error",
          message:
            err instanceof Error
              ? err.message
              : "Network error during rejection.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] flex flex-col lg:flex-row antialiased font-sans">
      {/* ─── UNIFIED LIGHT SIDEBAR ─── */}
      <AdminSidebar
        currentRoute="categories"
        pendingSuggestionsCount={counts.pending}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((prev) => !prev)}
      />

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-[#E6E6F0] bg-white/85 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl border border-[#E6E6F0] bg-[#F6F6FB] text-[#55556E] hover:text-[#14142B] lg:hidden"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#71717A]">
                <span>Category Management</span>
                <span>/</span>
                <span className="text-[#4F46E5] font-semibold">
                  Category Suggestions
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-heading font-extrabold text-[#14142B] tracking-tight">
                Suggestion Review &amp; Approval Queue
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Admin Verified</span>
            </span>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Summary Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 shadow-xs">
              <span className="text-[11px] font-mono uppercase text-[#71717A] tracking-wider block mb-1">
                Total Suggestions
              </span>
              <span className="text-2xl font-heading font-extrabold font-mono text-[#14142B]">
                {counts.all}
              </span>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs">
              <span className="text-[11px] font-mono uppercase text-amber-800 tracking-wider block mb-1 font-bold">
                Pending Review
              </span>
              <span className="text-2xl font-heading font-extrabold font-mono text-amber-900">
                {counts.pending}
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs">
              <span className="text-[11px] font-mono uppercase text-emerald-800 tracking-wider block mb-1 font-bold">
                Approved
              </span>
              <span className="text-2xl font-heading font-extrabold font-mono text-emerald-900">
                {counts.approved}
              </span>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-xs">
              <span className="text-[11px] font-mono uppercase text-rose-800 tracking-wider block mb-1 font-bold">
                Rejected
              </span>
              <span className="text-2xl font-heading font-extrabold font-mono text-rose-900">
                {counts.rejected}
              </span>
            </div>
          </div>

          {/* Controls: Search & Status Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="inline-flex rounded-xl bg-white border border-[#E6E6F0] p-1 gap-1 shadow-2xs">
              {(
                [
                  { id: "all", label: "All", count: counts.all },
                  { id: "pending", label: "Pending", count: counts.pending },
                  { id: "approved", label: "Approved", count: counts.approved },
                  { id: "rejected", label: "Rejected", count: counts.rejected },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === tab.id
                      ? "bg-[#4F46E5] text-white shadow-xs font-bold"
                      : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                      statusFilter === tab.id
                        ? "bg-white/20 text-white font-bold"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="h-4 w-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search category name..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-[#E6E6F0] text-xs text-[#14142B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 shadow-2xs"
              />
            </div>
          </div>

          {/* Suggestions List Table */}
          <div className="rounded-2xl border border-[#E6E6F0] bg-white overflow-hidden shadow-xs">
            {filteredSuggestions.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center mx-auto text-[#4F46E5]">
                  <Inbox className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#14142B]">
                  No category suggestions found
                </h3>
                <p className="text-xs text-[#55556E] max-w-sm mx-auto">
                  {statusFilter !== "all"
                    ? `No suggestions currently in '${statusFilter}' status.`
                    : "No category suggestions have been submitted by users yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E6E6F0]">
                {filteredSuggestions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors"
                  >
                    {/* Left: Name, Slug, Submitter, Listing */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-heading font-extrabold text-base text-[#14142B]">
                          {item.suggested_name}
                        </span>

                        <span className="font-mono text-[11px] text-[#4F46E5] bg-[#EEF2FF] border border-[#E0E7FF] px-2 py-0.5 rounded-md font-semibold">
                          /{item.suggested_slug}
                        </span>

                        {/* Status Badge */}
                        {item.status === "pending" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            Pending Review
                          </span>
                        ) : item.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Approved (
                            {item.action_type === "create_new"
                              ? "New Category"
                              : item.action_type === "add_to_existing"
                              ? "Subcategory"
                              : "Renamed"}
                            )
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5">
                            <XCircle className="h-2.5 w-2.5" />
                            Rejected
                          </span>
                        )}
                      </div>

                      {/* Associated Listing & Submitter Details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#55556E]">
                        {item.listings ? (
                          <span className="flex items-center gap-1.5">
                            <span className="text-[#71717A]">For Listing:</span>
                            <Link
                              href={`/product/${item.listings.slug}`}
                              target="_blank"
                              className="text-[#14142B] hover:text-[#4F46E5] font-semibold underline inline-flex items-center gap-1"
                            >
                              <span>{item.listings.name}</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </span>
                        ) : (
                          <span className="text-[#71717A]">
                            Listing: Standalone suggestion
                          </span>
                        )}

                        <span>•</span>

                        <span>
                          Submitted:{" "}
                          <strong className="text-[#14142B]">
                            {new Date(item.created_at).toLocaleDateString()}
                          </strong>
                        </span>

                        {item.suggested_by && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[11px] text-[#71717A]">
                              User: {item.suggested_by.slice(0, 8)}...
                            </span>
                          </>
                        )}
                      </div>

                      {/* Rejection / Note display if available */}
                      {item.admin_note && (
                        <p className="text-xs text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md inline-block font-medium">
                          Admin note: {item.admin_note}
                        </p>
                      )}
                    </div>

                    {/* Right: Review Action */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {item.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => openReviewModal(item)}
                          className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-heading font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <FolderPlus className="h-3.5 w-3.5" />
                          <span>Review Suggestion</span>
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-[#71717A]">
                          Reviewed {new Date(item.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── REVIEW & APPROVAL MODAL ─── */}
      {activeSuggestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#E6E6F0] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E6E6F0] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#4F46E5] font-bold">
                  Admin Review Action
                </span>
                <h3 className="font-heading font-extrabold text-base text-[#14142B]">
                  Review: &ldquo;{activeSuggestion.suggested_name}&rdquo;
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="h-8 w-8 rounded-lg bg-white hover:bg-[#E6E6F0] text-[#55556E] hover:text-[#14142B] border border-[#E6E6F0] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Feedback Alert */}
            {feedback && (
              <div
                className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedback.type === "error"
                    ? "bg-rose-50 border border-rose-200 text-rose-900 font-medium"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium"
                }`}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Modal Body: Tabs */}
            <div className="p-6 space-y-5">
              {/* Context Summary */}
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E6E6F0] p-3 text-xs flex flex-wrap items-center justify-between gap-2 text-[#55556E]">
                <span>
                  Suggested:{" "}
                  <strong className="text-[#14142B]">
                    {activeSuggestion.suggested_name}
                  </strong>{" "}
                  (slug: <code>{activeSuggestion.suggested_slug}</code>)
                </span>
                {activeSuggestion.listings && (
                  <span>
                    Linked tool:{" "}
                    <strong className="text-[#14142B]">
                      {activeSuggestion.listings.name}
                    </strong>
                  </span>
                )}
              </div>

              {/* 3 Approval Tabs (Option A, B, C) */}
              <div className="space-y-3">
                <span className="text-xs font-heading font-bold text-[#14142B] block">
                  Select Approval Action:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setApprovalTab("create_new")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      approvalTab === "create_new"
                        ? "bg-[#EEF2FF] border-[#4F46E5] text-[#14142B] shadow-2xs ring-1 ring-[#4F46E5]"
                        : "bg-[#F8FAFC] border-[#E6E6F0] text-[#55556E] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-[#4F46E5]" />
                      <span>Option A</span>
                    </div>
                    <span className="font-heading font-bold text-xs block text-[#14142B]">
                      Create New Category
                    </span>
                    <span className="text-[11px] text-[#71717A] mt-0.5 block">
                      Standalone top-level category
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApprovalTab("add_to_existing")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      approvalTab === "add_to_existing"
                        ? "bg-[#EEF2FF] border-[#4F46E5] text-[#14142B] shadow-2xs ring-1 ring-[#4F46E5]"
                        : "bg-[#F8FAFC] border-[#E6E6F0] text-[#55556E] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                      <GitFork className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Option B</span>
                    </div>
                    <span className="font-heading font-bold text-xs block text-[#14142B]">
                      Add to Existing
                    </span>
                    <span className="text-[11px] text-[#71717A] mt-0.5 block">
                      Subcategory with parent_id
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApprovalTab("rename_existing")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      approvalTab === "rename_existing"
                        ? "bg-[#EEF2FF] border-[#4F46E5] text-[#14142B] shadow-2xs ring-1 ring-[#4F46E5]"
                        : "bg-[#F8FAFC] border-[#E6E6F0] text-[#55556E] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                      <Pencil className="h-3.5 w-3.5 text-amber-600" />
                      <span>Option C</span>
                    </div>
                    <span className="font-heading font-bold text-xs block text-[#14142B]">
                      Rename Existing
                    </span>
                    <span className="text-[11px] text-[#71717A] mt-0.5 block">
                      Preserve ID &amp; relations
                    </span>
                  </button>
                </div>
              </div>

              {/* Dynamic Action Fields */}
              <div className="space-y-3 pt-2">
                {/* Target Category for Rename (Option C) */}
                {approvalTab === "rename_existing" && (
                  <div>
                    <label className="block text-xs font-heading font-bold text-[#14142B] mb-1.5">
                      Select Existing Category to Rename{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formTargetCategoryId}
                      onChange={(e) => setFormTargetCategoryId(e.target.value)}
                      className="w-full h-10 rounded-xl bg-white border border-[#E6E6F0] px-3 text-xs text-[#14142B] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 cursor-pointer shadow-2xs"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} (/{cat.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Parent Category for Subcategory (Option B) or Optional Parent for Option A */}
                {(approvalTab === "add_to_existing" ||
                  approvalTab === "create_new") && (
                  <div>
                    <label className="block text-xs font-heading font-bold text-[#14142B] mb-1.5">
                      {approvalTab === "add_to_existing" ? (
                        <>
                          Select Parent Category{" "}
                          <span className="text-rose-500">*</span>
                        </>
                      ) : (
                        "Parent Category (Optional)"
                      )}
                    </label>
                    <select
                      value={formParentId}
                      onChange={(e) => setFormParentId(e.target.value)}
                      className="w-full h-10 rounded-xl bg-white border border-[#E6E6F0] px-3 text-xs text-[#14142B] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 cursor-pointer shadow-2xs"
                    >
                      <option value="">
                        {approvalTab === "add_to_existing"
                          ? "-- Select parent category --"
                          : "-- None (Top-level category) --"}
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} (/{cat.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Category Name */}
                <div>
                  <label className="block text-xs font-heading font-bold text-[#14142B] mb-1.5">
                    {approvalTab === "rename_existing"
                      ? "New Category Name"
                      : "Category Name"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. HRMS"
                    className="w-full h-10 rounded-xl bg-white border border-[#E6E6F0] px-3 text-xs text-[#14142B] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 shadow-2xs"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-heading font-bold text-[#14142B] mb-1.5">
                    Category Slug (Auto-generated or custom)
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. hrms"
                    className="w-full h-10 rounded-xl bg-white border border-[#E6E6F0] px-3 text-xs text-[#14142B] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 font-mono shadow-2xs"
                  />
                </div>

                {/* Description (Option A & B) */}
                {approvalTab !== "rename_existing" && (
                  <div>
                    <label className="block text-xs font-heading font-bold text-[#14142B] mb-1.5">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full rounded-xl bg-white border border-[#E6E6F0] p-3 text-xs text-[#14142B] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 shadow-2xs"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons for Approval */}
              <div className="pt-2 flex items-center justify-between border-t border-[#E6E6F0]">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {approvalTab === "create_new"
                      ? "Approve & Create Category"
                      : approvalTab === "add_to_existing"
                      ? "Approve & Add as Subcategory"
                      : "Approve & Rename Category"}
                  </span>
                </button>
              </div>

              {/* Rejection Alternative Section */}
              <div className="pt-4 border-t border-[#E6E6F0] space-y-2">
                <span className="text-xs font-heading font-bold text-[#55556E] block">
                  Or Reject Suggestion:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Optional rejection reason (e.g. duplicate or inappropriate)..."
                    className="flex-1 h-10 rounded-xl bg-white border border-[#E6E6F0] px-3 text-xs text-[#14142B] focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isPending}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-xs font-heading font-bold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
