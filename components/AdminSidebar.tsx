"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Inbox,
  CheckCircle2,
  FolderPlus,
  ShieldAlert,
  BarChart3,
  Globe,
  Layers,
  Sparkles,
  ExternalLink,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  FileCode,
  FileText,
} from "lucide-react";

export type AdminRoute = "pending" | "approved" | "categories" | "moderation" | "analytics";

export interface AdminSidebarProps {
  currentRoute: AdminRoute;
  pendingQueueCount?: number;
  approvedQueueCount?: number;
  pendingSuggestionsCount?: number;
  onTabChange?: (tab: "pending" | "approved") => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

export function AdminSidebar({
  currentRoute,
  pendingQueueCount,
  approvedQueueCount,
  pendingSuggestionsCount,
  onTabChange,
  isOpen,
  onToggleOpen,
}: AdminSidebarProps) {
  const [internalOpen, setInternalOpen] = useState(true);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const toggle = onToggleOpen || (() => setInternalOpen((prev) => !prev));

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
    } catch {
      // Ignore network errors
    }
    window.location.href = "/admin/login";
  };

  return (
    <aside
      className={`${
        open ? "w-64" : "w-0 lg:w-20"
      } transition-all duration-300 ease-in-out shrink-0 bg-white border-r border-[#E6E6F0] flex flex-col justify-between overflow-hidden relative z-30 select-none`}
    >
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {open && (
              <div className="min-w-0">
                <div className="font-heading font-extrabold text-sm text-[#14142B] tracking-tight flex items-center gap-1.5">
                  <span>LaunchOS</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#EEF2FF] text-[#4F46E5] rounded border border-[#E0E7FF] font-bold">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-[#55556E] truncate">
                  Control Center
                </p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={toggle}
            className="p-1.5 rounded-lg text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB] transition-colors"
            title={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Quick Submit New Tool Action */}
        {open ? (
          <Link
            href="/submit"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-heading font-bold text-white transition-all shadow-xs"
          >
            <Sparkles className="h-4 w-4 text-white" />
            <span>Submit New Tool</span>
            <ExternalLink className="h-3 w-3 text-indigo-200 ml-auto" />
          </Link>
        ) : (
          <Link
            href="/submit"
            target="_blank"
            className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white"
            title="Submit New Tool"
          >
            <Sparkles className="h-4 w-4 text-white" />
          </Link>
        )}

        {/* Navigation Sections */}
        <nav className="space-y-1">
          {open && (
            <div className="px-2 py-1 text-[10px] font-mono font-bold tracking-wider uppercase text-[#71717A]">
              Management
            </div>
          )}

          {/* 1. Pending Queue */}
          {onTabChange ? (
            <button
              type="button"
              onClick={() => onTabChange("pending")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
                currentRoute === "pending"
                  ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] shadow-2xs"
                  : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB]"
              }`}
            >
              <Inbox
                className={`h-4 w-4 shrink-0 ${
                  currentRoute === "pending" ? "text-[#4F46E5]" : "text-[#71717A]"
                }`}
              />
              {open && <span>Pending Queue</span>}
              {open && pendingQueueCount !== undefined && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold">
                  {pendingQueueCount}
                </span>
              )}
            </button>
          ) : (
            <Link
              href="/admin"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
                currentRoute === "pending"
                  ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] shadow-2xs"
                  : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB]"
              }`}
            >
              <Inbox
                className={`h-4 w-4 shrink-0 ${
                  currentRoute === "pending" ? "text-[#4F46E5]" : "text-[#71717A]"
                }`}
              />
              {open && <span>Pending Queue</span>}
              {open && pendingQueueCount !== undefined && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold">
                  {pendingQueueCount}
                </span>
              )}
            </Link>
          )}

          {/* 2. Approved Directory */}
          {onTabChange ? (
            <button
              type="button"
              onClick={() => onTabChange("approved")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
                currentRoute === "approved"
                  ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] shadow-2xs"
                  : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB]"
              }`}
            >
              <CheckCircle2
                className={`h-4 w-4 shrink-0 ${
                  currentRoute === "approved" ? "text-[#10B981]" : "text-[#71717A]"
                }`}
              />
              {open && <span>Approved Directory</span>}
              {open && approvedQueueCount !== undefined && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                  {approvedQueueCount}
                </span>
              )}
            </button>
          ) : (
            <Link
              href="/admin?tab=approved"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
                currentRoute === "approved"
                  ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] shadow-2xs"
                  : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB]"
              }`}
            >
              <CheckCircle2
                className={`h-4 w-4 shrink-0 ${
                  currentRoute === "approved" ? "text-[#10B981]" : "text-[#71717A]"
                }`}
              />
              {open && <span>Approved Directory</span>}
              {open && approvedQueueCount !== undefined && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                  {approvedQueueCount}
                </span>
              )}
            </Link>
          )}

          {/* 3. Category Suggestions */}
          <Link
            href="/admin/categories"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
              currentRoute === "categories"
                ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] shadow-2xs"
                : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB]"
            }`}
          >
            <FolderPlus
              className={`h-4 w-4 shrink-0 ${
                currentRoute === "categories"
                  ? "text-[#4F46E5]"
                  : "text-[#71717A]"
              }`}
            />
            {open && <span>Category Suggestions</span>}
            {open &&
              pendingSuggestionsCount !== undefined &&
              pendingSuggestionsCount > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold">
                  {pendingSuggestionsCount}
                </span>
              )}
          </Link>

          {/* 4. Reviews & Moderation Center */}
          <Link
            href="/admin/moderation"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
              currentRoute === "moderation"
                ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] shadow-2xs"
                : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB]"
            }`}
          >
            <ShieldAlert
              className={`h-4 w-4 shrink-0 ${
                currentRoute === "moderation"
                  ? "text-amber-600"
                  : "text-[#71717A]"
              }`}
            />
            {open && <span>Reviews &amp; Ratings</span>}
          </Link>

          {/* 5. Analytics & Reports */}
          <Link
            href="/admin/analytics"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
              currentRoute === "analytics"
                ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] shadow-2xs"
                : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB]"
            }`}
          >
            <BarChart3
              className={`h-4 w-4 shrink-0 ${
                currentRoute === "analytics"
                  ? "text-[#4F46E5]"
                  : "text-[#71717A]"
              }`}
            />
            {open && <span>Analytics &amp; Reports</span>}
          </Link>

          {/* Public Surfaces */}
          <div className="pt-3 border-t border-[#E6E6F0] space-y-1">
            {open && (
              <div className="px-2 py-1 text-[10px] font-mono font-bold tracking-wider uppercase text-[#71717A]">
                Public Surfaces
              </div>
            )}

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB] text-xs font-heading font-medium transition-colors"
            >
              <Globe className="h-4 w-4 shrink-0 text-[#71717A]" />
              {open && <span>Live Directory</span>}
              {open && (
                <ExternalLink className="h-3 w-3 text-[#94A3B8] ml-auto" />
              )}
            </Link>

            <Link
              href="/categories"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB] text-xs font-heading font-medium transition-colors"
            >
              <Layers className="h-4 w-4 shrink-0 text-[#71717A]" />
              {open && <span>Categories</span>}
              {open && (
                <ExternalLink className="h-3 w-3 text-[#94A3B8] ml-auto" />
              )}
            </Link>
          </div>

          {/* SEO & Feeds */}
          <div className="pt-3 border-t border-[#E6E6F0] space-y-1">
            {open && (
              <div className="px-2 py-1 text-[10px] font-mono font-bold tracking-wider uppercase text-[#71717A]">
                SEO &amp; Sitemaps
              </div>
            )}

            <Link
              href="/sitemap.xml"
              target="_blank"
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB] text-xs font-heading font-medium transition-colors"
            >
              <FileCode className="h-4 w-4 shrink-0 text-[#10B981]" />
              {open && <span>Sitemap Index</span>}
            </Link>

            <Link
              href="/llms.txt"
              target="_blank"
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB] text-xs font-heading font-medium transition-colors"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
              {open && <span>AI Feed (/llms.txt)</span>}
            </Link>
          </div>
        </nav>
      </div>

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-[#E6E6F0] bg-[#FAFAFC]">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-[#E6E6F0] shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#EC4899] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              VO
            </div>
            {open && (
              <div className="min-w-0">
                <div className="text-xs font-heading font-bold text-[#14142B] truncate">
                  vinay.olis3@gmail.com
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#10B981] font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Verified Admin</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#55556E] hover:text-[#DC2626] hover:bg-rose-50 transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

