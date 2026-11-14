import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSiteUrl } from "@/lib/seo";
import { Globe, ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "SaaS Launch SEO & AI Discovery Guide | LaunchOS",
  description: "Learn how LaunchOS directory listings boost your domain authority, provide dofollow backlinks, and index your software into AI answer engines via /llms.txt.",
  alternates: {
    canonical: `${getSiteUrl()}/seo-guide`,
  },
};

export default function SeoGuidePage() {
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
              <Globe className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              SEO &amp; DISCOVERABILITY
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#14142B] tracking-tight">
            SaaS Launch SEO &amp; AI Discovery Guide
          </h1>
          <p className="text-sm sm:text-base text-[#55556E] leading-relaxed">
            How submitting to LaunchOS strengthens your search engine rankings, builds domain authority, and indexes your software into modern AI research engines.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-10 shadow-xs space-y-8 text-sm sm:text-base text-[#3A3A52] leading-relaxed">
          {/* Pillar 1: High-Authority Dofollow Backlinks */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B] flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#4F46E5]" />
              <span>1. Permanent Dofollow Backlinks</span>
            </h2>
            <p>
              Search engines like Google rely heavily on backlink signals to determine a new website&apos;s trustworthiness and authority. When your software is approved on LaunchOS, your product detail page provides a permanent, clean, dofollow link directly to your domain. This jumpstarts your domain authority and helps Google index your primary landing page faster.
            </p>
          </section>

          {/* Pillar 2: SoftwareApplication JSON-LD Schema */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B] flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#4F46E5]" />
              <span>2. Rich SoftwareApplication JSON-LD Schema</span>
            </h2>
            <p>
              Every public listing on LaunchOS automatically generates structured data conforming to schema.org standards (<code>SoftwareApplication</code>, <code>AggregateRating</code>, and <code>Offers</code>). This allows search engines to render rich snippet stars, pricing brackets, and category badges directly in organic search results.
            </p>
          </section>

          {/* Pillar 3: AI Discovery via /llms.txt */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#14142B] flex items-center gap-2">
              <Cpu className="h-5 w-5 text-[#4F46E5]" />
              <span>3. AI Engine Discovery via /llms.txt</span>
            </h2>
            <p>
              In 2026, millions of founders and technical buyers discover software through AI assistants such as Perplexity, ChatGPT, and Claude. LaunchOS generates a centralized, continuously updated <code>/llms.txt</code> endpoint that indexes all approved tools with concise machine-readable summaries. When users ask AI models for tool recommendations in your niche, your product is directly citeable.
            </p>
          </section>

          {/* Launch CTA */}
          <div className="pt-4 border-t border-[#F1F1F8] text-center space-y-3">
            <p className="text-xs sm:text-sm text-[#55556E]">
              Get your SaaS indexed and start building search authority today.
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-heading font-bold transition-all shadow-xs"
            >
              <span>Submit Your Product</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

