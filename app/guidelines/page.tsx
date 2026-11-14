import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSiteUrl } from "@/lib/seo";
import { CheckCircle2, AlertTriangle, ArrowLeft, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Community & Submission Guidelines | LaunchOS",
  description: "Official listing criteria, review policies, and community conduct guidelines for makers submitting software to LaunchOS.",
  alternates: {
    canonical: `${getSiteUrl()}/guidelines`,
  },
};

export default function GuidelinesPage() {
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
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              STANDARDS &amp; QUALITY
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
            Community Guidelines
          </h1>
          <p className="text-sm sm:text-base text-[#55556E] leading-relaxed">
            Our mission is to maintain the most trustworthy, high-signal SaaS directory on the web. Here is what we expect from every maker and launch.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base text-[#3A3A52] leading-relaxed">
          {/* What We Welcome */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-base font-heading font-bold text-[#0F8A5F]">
              <CheckCircle2 className="h-5 w-5" />
              <span>What We Approve &amp; Celebrate</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#55556E]">
              <li className="flex items-start gap-2">
                <span className="text-[#0F8A5F] font-bold">&bull;</span>
                <span><strong>Functional Software:</strong> Working web applications, desktop tools, developer APIs, mobile apps, or browser extensions with active signups or demos.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0F8A5F] font-bold">&bull;</span>
                <span><strong>Secure Landing Pages:</strong> HTTPS websites with clear value propositions, transparent pricing, and functional contact links.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0F8A5F] font-bold">&bull;</span>
                <span><strong>Genuine Founder Engagement:</strong> Makers who interact respectfully in comment threads, welcome user feedback, and promptly patch reported issues.</span>
              </li>
            </ul>
          </section>

          {/* What We Reject */}
          <section className="space-y-4 pt-6 border-t border-[#F1F1F8]">
            <div className="flex items-center gap-2 text-base font-heading font-bold text-[#E11D48]">
              <AlertTriangle className="h-5 w-5" />
              <span>What We Strictly Reject &amp; Remove</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#55556E]">
              <li className="flex items-start gap-2">
                <span className="text-[#E11D48] font-bold">&bull;</span>
                <span><strong>Vaporware &amp; Non-Functional Concepts:</strong> Landing pages with broken links, non-functional waitlists, or coming-soon placeholders with no MVP.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E11D48] font-bold">&bull;</span>
                <span><strong>Clones, Scams &amp; Malicious Content:</strong> Repackaged template clones, cryptojackers, phishing sites, or unlicensed software.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E11D48] font-bold">&bull;</span>
                <span><strong>Vote Manipulation &amp; Review Fraud:</strong> Scripted bot upvoting, purchasing votes, or leaving retaliatory reviews on competitor tools will result in immediate delisting.</span>
              </li>
            </ul>
          </section>

          {/* Moderation Review Process */}
          <section className="space-y-3 pt-6 border-t border-[#F1F1F8]">
            <h2 className="font-heading font-bold text-lg text-[#14142B]">
              Moderation Review Process
            </h2>
            <p>
              Every submitted tool enters our administrative review queue. Our human curation team validates domain ownership, scans the website for security compliance, and verifies product screenshots. Free submissions are reviewed within 48-72 hours, while Verified and Featured submissions receive priority 24-hour turnaround.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

