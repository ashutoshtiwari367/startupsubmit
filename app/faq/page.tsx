import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | LaunchOS",
  description:
    "Everything you need to know about launching your SaaS on LaunchOS: submission process, voting mechanics, winner badges, and review turnaround times.",
  alternates: {
    canonical: `${getSiteUrl()}/faq`,
  },
  openGraph: {
    title: "LaunchOS FAQ & Knowledge Base",
    description: "Common questions about launching and promoting SaaS products on LaunchOS.",
    url: `${getSiteUrl()}/faq`,
    type: "website",
  },
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] font-sans antialiased">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}

