import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSiteUrl } from "@/lib/seo";
import { RotateCcw, Calendar, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy | LaunchOS",
  description: "Official refund policy for LaunchOS directory listing plans, review turnarounds, and promotional placements.",
  alternates: {
    canonical: `${getSiteUrl()}/refund`,
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] font-sans antialiased">
      <Navbar />

      <main className="max-w-[880px] mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#55556E] hover:text-[#4F46E5] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Live Directory</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#F7F6FF] text-[#4F46E5]">
              <RotateCcw className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              BILLING &amp; GUARANTEES
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
            Refund Policy
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-[#55556E]">
            <Calendar className="h-3.5 w-3.5 text-[#4F46E5]" />
            <span>Effective Date: November 14, 2026</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base text-[#3A3A52] leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              1. Overview of Promotional Services
            </h2>
            <p>
              LaunchOS offers optional paid directory plans (&quot;Verified Maker&quot; and &quot;Featured Spotlight&quot;) that provide expedited 24-hour review turnarounds, permanent dofollow backlink indexing, and featured homepage leaderboard placement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              2. 24-Hour Review Turnaround SLA Guarantee
            </h2>
            <p>
              When purchasing a promotional listing plan, our editorial team commits to reviewing your submission within <strong>24 hours</strong> of submission. If we fail to review your submission within this turnaround window, you are entitled to a full 100% refund upon request, while your product remains in the queue for expedited publication.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              3. Editorial Rejections &amp; Refunds
            </h2>
            <p>
              If our moderation team rejects a paid submission because the product violates security policies, contains malware, or is determined to be non-functional, we will issue a full refund minus any non-refundable payment processor gateway fees (if applicable), along with specific feedback on why the tool was not approved.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              4. Non-Refundable Scenarios
            </h2>
            <p>
              Refunds are not granted once a listing has been approved and its promotional placement (Featured Spotlight or Verified Maker badge) has gone live on the public directory, as promotional impressions and search indexation begin immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              5. How to Request a Refund
            </h2>
            <p>
              To request a refund under our SLA guarantee or discuss a billing concern, please email our support desk at{" "}
              <a href="mailto:billing@launchos.com" className="text-[#4F46E5] font-semibold hover:underline">
                billing@launchos.com
              </a>{" "}
              with your order ID, listing name, and submitter email. Valid requests are processed within 3-5 business days.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

