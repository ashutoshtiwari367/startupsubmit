import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSiteUrl } from "@/lib/seo";
import { ShieldCheck, Calendar, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | LaunchOS",
  description: "Terms and conditions governing the use of LaunchOS SaaS directory, submissions, maker accounts, and promotional listing services.",
  alternates: {
    canonical: `${getSiteUrl()}/terms`,
  },
};

export default function TermsOfServicePage() {
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
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              LEGAL DOCUMENT
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
            Terms of Service
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-[#55556E]">
            <Calendar className="h-3.5 w-3.5 text-[#4F46E5]" />
            <span>Effective Date: November 14, 2026</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base text-[#3A3A52] leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing, browsing, or submitting software listings to LaunchOS (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access or use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              2. Platform Overview &amp; Listing Directory
            </h2>
            <p>
              LaunchOS is an authoritative discovery platform and directory for modern SaaS, artificial intelligence products, and developer tools. Makers may submit applications for review and publication. LaunchOS reserves the right to review, approve, reject, or delist any submission that fails to adhere to our quality guidelines or security policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              3. Maker Submissions &amp; Intellectual Property
            </h2>
            <p>
              When you submit a software tool to LaunchOS, you represent and warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#55556E]">
              <li>You are the creator, owner, or authorized representative of the tool.</li>
              <li>All information, logos, taglines, and screenshots provided are accurate, original, and do not infringe upon any third-party intellectual property rights.</li>
              <li>Your software adheres to security standards, uses verified HTTPS protocols, and contains no malicious code, malware, or phishing mechanisms.</li>
            </ul>
            <p>
              You grant LaunchOS a non-exclusive, worldwide, royalty-free license to display your submitted name, logo, screenshots, and descriptions for the purpose of listing and promoting your product on the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              4. Paid Directory Listing Plans &amp; Reviews
            </h2>
            <p>
              LaunchOS offers optional listing plans (such as Verified Maker and Featured Spotlight) designed to accelerate moderation turnaround and provide enhanced visibility. Payment of promotional fees guarantees review turnaround within our specified SLA (24 hours) but does not exempt listings from meeting safety and quality standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              5. Community Conduct, Voting &amp; Reviews
            </h2>
            <p>
              Users must authenticate via secure credentials before casting upvotes or posting product reviews. Any attempt to artificially manipulate ranking, use automated voting bots, or submit fraudulent reviews will result in immediate disqualification and permanent platform ban.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              6. Limitation of Liability
            </h2>
            <p>
              LaunchOS provides the directory on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no representations regarding third-party software products listed on the platform. In no event shall LaunchOS be liable for any indirect, consequential, or incidental damages arising out of your use of tools discovered through the directory.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B]">
              7. Contact Information
            </h2>
            <p>
              For legal inquiries, copyright notices, or terms clarification, please contact our administrative team at{" "}
              <a href="mailto:legal@launchos.com" className="text-[#4F46E5] font-semibold hover:underline">
                legal@launchos.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

