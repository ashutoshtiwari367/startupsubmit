import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/**
 * Lightweight, accessible Next.js loading skeleton for /product/[id].
 * Matches the actual listing detail page layout pixel-for-pixel:
 * - Breadcrumbs
 * - Header card with logo squircle, title, badges, and action buttons
 * - 16:9 Gallery placeholder
 * - 2-Column layout: Tabs + overview skeleton (8 cols) and Sidebar skeleton (4 cols)
 */
export default function ProductDetailLoading() {
  return (
    <div
      role="status"
      aria-label="Loading product details..."
      className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5]"
    >
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-6 py-8 sm:py-12 space-y-10">
        <span className="sr-only">Loading product details...</span>

        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-20 rounded-md bg-[#E6E6F0] animate-pulse" />
          <span className="text-[#E6E6F0]">/</span>
          <div className="h-3.5 w-24 rounded-md bg-[#E6E6F0] animate-pulse" />
          <span className="text-[#E6E6F0]">/</span>
          <div className="h-3.5 w-32 rounded-md bg-[#D4D4E4] animate-pulse" />
        </div>

        {/* Header Card Skeleton */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 flex-1">
              {/* Logo Squircle Skeleton */}
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#F7F6FF] animate-pulse shrink-0 border border-[#E0DEFC]" />

              {/* Title & Tagline Skeleton */}
              <div className="space-y-3 flex-1 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="h-7 sm:h-8 w-48 sm:w-64 rounded-md bg-[#E6E6F0] animate-pulse" />
                  <div className="h-5 w-28 rounded-full bg-[#FFF1D6] animate-pulse" />
                </div>
                <div className="h-4 w-full sm:w-4/5 rounded-md bg-[#E6E6F0] animate-pulse" />
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-5 w-20 rounded-full bg-[#F6F6FB] border border-[#E6E6F0] animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-[#F6F6FB] border border-[#E6E6F0] animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-[#F7F6FF] animate-pulse" />
                </div>
              </div>
            </div>

            {/* CTAs Skeleton */}
            <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
              <div className="h-12 w-32 rounded-[12px] bg-[#F7F6FF] animate-pulse" />
              <div className="h-12 w-32 rounded-[12px] bg-[#E6E6F0] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Gallery Skeleton */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-6 space-y-4">
          <div className="relative rounded-[12px] overflow-hidden bg-[#E6E6F0] aspect-16/9 max-h-[500px] animate-pulse" />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-[10px] bg-[#E6E6F0] aspect-16/9 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* 2-Column Main Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tabs & Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-[#E6E6F0] pb-3">
              <div className="h-8 w-28 rounded-full bg-[#4F46E5]/20 animate-pulse" />
              <div className="h-8 w-28 rounded-full bg-[#E6E6F0] animate-pulse" />
              <div className="h-8 w-28 rounded-full bg-[#E6E6F0] animate-pulse" />
            </div>

            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-7 space-y-4">
              <div className="h-5 w-40 rounded-md bg-[#E6E6F0] animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full rounded-md bg-[#E6E6F0] animate-pulse" />
                <div className="h-4 w-full rounded-md bg-[#E6E6F0] animate-pulse" />
                <div className="h-4 w-3/4 rounded-md bg-[#E6E6F0] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Sidebar: Maker & Stats (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4">
              <div className="h-3 w-28 rounded-md bg-[#E6E6F0] animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#F7F6FF] animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 rounded-md bg-[#E6E6F0] animate-pulse" />
                  <div className="h-3 w-20 rounded-md bg-[#E6E6F0] animate-pulse" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-3">
              <div className="h-3 w-28 rounded-md bg-[#E6E6F0] animate-pulse" />
              <div className="space-y-2.5 pt-1">
                <div className="h-3.5 w-full rounded-md bg-[#E6E6F0] animate-pulse" />
                <div className="h-3.5 w-full rounded-md bg-[#E6E6F0] animate-pulse" />
                <div className="h-3.5 w-full rounded-md bg-[#E6E6F0] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

