import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSiteUrl } from "@/lib/seo";
import { Lock, Calendar, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | LaunchOS",
  description: "Learn how LaunchOS handles your data, ensures privacy-preserving session analytics, and protects your information.",
  alternates: {
    canonical: `${getSiteUrl()}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
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
              <Lock className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              DATA PROTECTION
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
            Privacy Policy
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-[#55556E]">
            <Calendar className="h-3.5 w-3.5 text-[#4F46E5]" />
            <span>Last Updated: November 14, 2026</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base text-[#3A3A52] leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              1. Information We Collect
            </h2>
            <p>
              LaunchOS collects only the minimum necessary information to provide our SaaS discovery and verification services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#55556E]">
              <li><strong>Account Information:</strong> When signing in via Supabase Auth (Google, Email OTP, or Magic Link), we store your verified email address and unique identifier.</li>
              <li><strong>Submission Data:</strong> Tool name, tagline, description, category, pricing details, logo URL, screenshots, and website domain.</li>
              <li><strong>Maker Identity Sanitization:</strong> Submitter email addresses are publicly sanitized into maker handles (e.g., <code>founder@company.com</code> is presented as <code>@founder</code>) to protect makers from unsolicited scraping.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              2. Privacy-Preserving Analytics (No Raw IP Tracking)
            </h2>
            <p>
              We believe in respectful analytics. Our view count and website click tracking mechanisms utilize privacy-preserving cryptographic hashes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#55556E]">
              <li>We <strong>never</strong> store raw IP addresses in our database.</li>
              <li>Incoming visits generate an anonymous SHA-256 session hash combined with a daily salt for 30-minute deduplication windows, making reverse identification impossible.</li>
              <li>Known search bot User-Agents are automatically filtered out from maker analytics.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              3. Payment Information
            </h2>
            <p>
              Promotional listing payments are handled through PCI-DSS compliant payment gateways (Razorpay / Stripe). LaunchOS never stores or transmits complete credit card numbers on our servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              4. Cookies &amp; Local Storage
            </h2>
            <p>
              We utilize essential session tokens and cookies strictly required to keep authenticated makers logged in and remember your upvoted tools. We do not use third-party behavioral ad trackers or cross-site surveillance networks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              5. Your Rights &amp; Data Deletion
            </h2>
            <p>
              You have the right to request access to your personal data, rectify inaccurate tool information, or delete your account and listings. To initiate a data request, please email{" "}
              <a href="mailto:privacy@launchos.com" className="text-[#4F46E5] font-semibold hover:underline">
                privacy@launchos.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

