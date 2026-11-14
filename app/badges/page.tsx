import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSiteUrl } from "@/lib/seo";
import { Award, ArrowLeft, ArrowRight, Copy, Check, Sparkles, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Official Embed Badges & Widgets | LaunchOS",
  description: "Showcase your LaunchOS daily ranking, champion awards, and verified maker badges directly on your SaaS landing page or GitHub README.",
  alternates: {
    canonical: `${getSiteUrl()}/badges`,
  },
};

export default function EmbedBadgesPage() {
  const sampleSlug = "your-product";
  const championBadge = `<a href="https://launchos.com/product/${sampleSlug}" target="_blank" rel="noopener noreferrer">
  <img src="https://api.launchos.com/badges/${sampleSlug}-1st.svg" alt="Featured on LaunchOS" width="220" height="54" />
</a>`;

  const voteBadge = `<a href="https://launchos.com/product/${sampleSlug}" target="_blank" rel="noopener noreferrer">
  <img src="https://api.launchos.com/badges/upvote.svg" alt="Upvote on LaunchOS" width="180" height="44" />
</a>`;

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] font-sans antialiased">
      <Navbar />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] text-xs font-mono font-bold uppercase tracking-wider">
            <Award className="h-3.5 w-3.5" />
            <span>FOUNDER ASSETS</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
            Official LaunchOS Embed Badges
          </h1>
          <p className="text-sm sm:text-base text-[#55556E] leading-relaxed">
            Showcase your launch achievements, build trust with early adopters, and drive live community upvotes from your website.
          </p>
        </div>

        {/* Badge 1: #1 Product of the Day */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#F59E0B] bg-[#FFF1D6] px-2.5 py-0.5 rounded-full border border-[#FCD34D]">
                CHAMPION BADGE
              </span>
              <h2 className="font-heading font-extrabold text-xl text-[#14142B] mt-2">
                #1 Product of the Day Award
              </h2>
              <p className="text-xs sm:text-sm text-[#55556E] mt-1">
                For daily winners and top-voted community launches.
              </p>
            </div>

            {/* Visual Preview */}
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFF1D6] to-white border border-[#FCD34D] flex items-center gap-3 shadow-2xs self-start sm:self-auto">
              <span className="text-xl">🏆</span>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-[#7A4E00]">#1 Product of the Day</div>
                <div className="text-xs font-extrabold text-[#14142B] font-heading">Your SaaS Name</div>
              </div>
              <div className="h-6 w-px bg-[#E6E6F0] ml-1" />
              <span className="font-mono text-[11px] font-bold text-[#4F46E5]">Verified</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-[#55556E] block">
              HTML EMBED CODE:
            </span>
            <pre className="text-xs font-mono text-[#55556E] bg-[#F6F6FB] p-3.5 rounded-xl border border-[#E6E6F0] overflow-x-auto">
              {championBadge}
            </pre>
          </div>
        </div>

        {/* Badge 2: Upvote Us on LaunchOS */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4F46E5] bg-[#F7F6FF] px-2.5 py-0.5 rounded-full border border-[#E0DEFC]">
                LAUNCH CAMPAIGN BADGE
              </span>
              <h2 className="font-heading font-extrabold text-xl text-[#14142B] mt-2">
                &quot;Upvote Us on LaunchOS&quot; Button
              </h2>
              <p className="text-xs sm:text-sm text-[#55556E] mt-1">
                Add to your landing page hero or announcement bar during your launch week.
              </p>
            </div>

            {/* Visual Preview */}
            <div className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white flex items-center gap-2.5 shadow-2xs self-start sm:self-auto">
              <Sparkles className="h-4 w-4" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-medium text-white/80">Support our launch</div>
                <div className="text-xs font-extrabold font-heading">Upvote on LaunchOS</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-[#55556E] block">
              HTML EMBED CODE:
            </span>
            <pre className="text-xs font-mono text-[#55556E] bg-[#F6F6FB] p-3.5 rounded-xl border border-[#E6E6F0] overflow-x-auto">
              {voteBadge}
            </pre>
          </div>
        </div>

        {/* Footer Link back */}
        <div className="text-center pt-4">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-heading font-bold transition-all shadow-xs"
          >
            <span>Launch Your Tool &amp; Claim Badges</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

