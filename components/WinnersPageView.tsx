"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Award,
  Sparkles,
  ShieldCheck,
  Calendar,
  ArrowRight,
  ExternalLink,
  Flame,
  ArrowBigUp,
  Copy,
  Check,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FinalCTA } from "./FinalCTA";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { ProductCard } from "./ProductCard";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export const WinnersPageView: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<"all" | "month" | "week">("month");

  const winnersList = [
    {
      id: "p-1",
      name: "Cortex AI",
      tagline: "Autonomous customer success agents for modern B2B SaaS teams",
      category: "AI & Agents",
      rank: 1,
      placeLabel: "1st Place Winner",
      badgeColor: "from-[#FEF3C7] to-[#FDE68A] text-[#B45309] border-[#FCD34D]",
      votes: 384,
      date: "Nov 9, 2026 (Today)",
      founder: "Austin Miller",
      founderHandle: "@austinm",
      url: "/product/p-1",
      backlinkDomain: "cortexflow.ai",
    },
    {
      id: "p-2",
      name: "VectorFlow",
      tagline: "Instant vector database deployment with zero cold starts",
      category: "Developer Tools",
      rank: 2,
      placeLabel: "2nd Place Winner",
      badgeColor: "from-[#F1F5F9] to-[#E2E8F0] text-[#475569] border-[#CBD5E1]",
      votes: 312,
      date: "Nov 9, 2026 (Today)",
      founder: "Elena Rostova",
      founderHandle: "@elena_dev",
      url: "/product/p-2",
      backlinkDomain: "vectorflow.io",
    },
    {
      id: "p-3",
      name: "OmniMetrics",
      tagline: "Privacy-first revenue analytics synced directly with your Stripe billing engine",
      category: "Analytics & Data",
      rank: 3,
      placeLabel: "3rd Place Winner",
      badgeColor: "from-[#FFF7ED] to-[#FFEDD5] text-[#9A3412] border-[#FDBA74]",
      votes: 279,
      date: "Nov 9, 2026 (Today)",
      founder: "Marcus Chen",
      founderHandle: "@mchen_saas",
      url: "/product/p-3",
      backlinkDomain: "omnirate.app",
    },
    {
      id: "p-4",
      name: "SuperTask",
      tagline: "Keyboard-first task management for engineers who hate Jira",
      category: "Productivity",
      rank: 1,
      placeLabel: "1st Place (Yesterday)",
      badgeColor: "from-[#FEF3C7] to-[#FDE68A] text-[#B45309] border-[#FCD34D]",
      votes: 418,
      date: "Nov 8, 2026",
      founder: "Liam Vance",
      founderHandle: "@liamv",
      url: "/product/p-1",
      backlinkDomain: "supertask.io",
    },
    {
      id: "p-5",
      name: "PulseBoard",
      tagline: "Public roadmap and user feedback widgets embedded in under 60 seconds",
      category: "Productivity",
      rank: 2,
      placeLabel: "2nd Place (Yesterday)",
      badgeColor: "from-[#F1F5F9] to-[#E2E8F0] text-[#475569] border-[#CBD5E1]",
      votes: 356,
      date: "Nov 8, 2026",
      founder: "Chloe Bennett",
      founderHandle: "@chloeb",
      url: "/product/p-2",
      backlinkDomain: "pulseboard.dev",
    },
    {
      id: "p-6",
      name: "Lumina Studio",
      tagline: "AI video generation studio with custom enterprise brand voice models",
      category: "Design & UX",
      rank: 3,
      placeLabel: "3rd Place (Yesterday)",
      badgeColor: "from-[#FFF7ED] to-[#FFEDD5] text-[#9A3412] border-[#FDBA74]",
      votes: 294,
      date: "Nov 8, 2026",
      founder: "Devon Reed",
      founderHandle: "@devonreed",
      url: "/product/p-3",
      backlinkDomain: "luminastudio.ai",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F0F10] selection:bg-[#5B5BF0]/15 selection:text-[#5B5BF0]">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="accent" size="sm" icon={<Trophy className="h-3 w-3" />}>
            HALL OF FAME
          </Badge>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#0F0F10] tracking-[-0.03em]">
            Daily & Weekly Winners
          </h1>
          <p className="text-sm sm:text-base text-[#66666B]">
            Every top 3 product earns an official embeddable winner badge and a permanent high-authority dofollow backlink (DR 72+).
          </p>

          {/* Timeframe Filter Pills */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center rounded-full border border-[#E8E8E3] bg-white p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setFilterPeriod("week")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterPeriod === "week"
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10]"
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod("month")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterPeriod === "month"
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10]"
                }`}
              >
                November 2026
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterPeriod === "all"
                    ? "bg-[#5B5BF0] text-white shadow-xs"
                    : "text-[#66666B] hover:text-[#0F0F10]"
                }`}
              >
                All-Time Champions
              </button>
            </div>
          </div>
        </div>

        {/* TOP 3 PODIUM HERO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {winnersList.slice(0, 3).map((w) => (
            <div
              key={w.id}
              className={`relative rounded-[16px] border bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 ${
                w.rank === 1
                  ? "border-[#FCD34D] ring-2 ring-[#FEF3C7]"
                  : w.rank === 2
                  ? "border-[#CBD5E1]"
                  : "border-[#FDBA74]"
              } flex flex-col justify-between`}
            >
              <div className="space-y-4">
                {/* Header Rank Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-gradient-to-r ${w.badgeColor}`}
                  >
                    {w.rank === 1 && <Crown className="h-3.5 w-3.5 text-[#B45309]" />}
                    {w.placeLabel}
                  </span>

                  <span className="text-xs font-mono font-bold text-[#10B981] flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    DR 72+ Indexed
                  </span>
                </div>

                {/* Product Name & Tagline */}
                <div>
                  <h3 className="font-heading font-black text-xl text-[#0F0F10] tracking-tight">
                    {w.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#47474F] mt-1 line-clamp-2">
                    {w.tagline}
                  </p>
                </div>

                {/* Meta details */}
                <div className="rounded-[10px] bg-[#FAFAF7] p-3 text-xs space-y-1.5 font-mono text-[#66666B]">
                  <div className="flex justify-between">
                    <span>Votes Received:</span>
                    <span className="font-bold text-[#0F0F10] font-sans flex items-center gap-0.5">
                      <ArrowBigUp className="h-3.5 w-3.5 text-[#5B5BF0] fill-current" />
                      {w.votes}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Launched by:</span>
                    <span className="font-sans font-semibold text-[#5B5BF0]">
                      {w.founder} ({w.founderHandle})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dofollow Link:</span>
                    <span className="text-[#10B981] truncate max-w-[140px] font-bold">
                      {w.backlinkDomain}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 border-t border-[#E8E8E3] mt-5">
                <Link href={w.url} className="w-full block">
                  <Button variant="secondary" size="md" className="w-full font-bold text-xs justify-between">
                    <span>Inspect Winning Launch</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FULL ARCHIVE LIST */}
        <div className="space-y-4 pt-6">
          <div className="border-b border-[#E8E8E3] pb-3">
            <h2 className="font-heading font-extrabold text-xl text-[#0F0F10] tracking-tight">
              Historical Hall of Fame Archive
            </h2>
            <p className="text-xs text-[#66666B]">
              Every verified champion product with permanent SEO attribution.
            </p>
          </div>

          <div className="space-y-3">
            {winnersList.map((item, idx) => (
              <div
                key={idx}
                className="rounded-[14px] border border-[#E8E8E3] bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#D5D5CE] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-[10px] flex items-center justify-center font-heading font-black text-sm shrink-0 border ${item.badgeColor}`}
                  >
                    #{item.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-base text-[#0F0F10]">
                        {item.name}
                      </h3>
                      <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.2 text-[10px] font-semibold text-[#66666B]">
                        {item.category}
                      </span>
                      <span className="text-xs font-mono text-[#8E8E93]">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#47474F] mt-0.5 line-clamp-1">
                      {item.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-[#0F0F10]">
                      {item.votes} votes
                    </div>
                    <div className="text-[10px] font-mono text-[#10B981]">rel="dofollow"</div>
                  </div>

                  <Link href={item.url}>
                    <Button variant="secondary" size="sm" className="font-semibold text-xs">
                      View Launch
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <FinalCTA />
      <Footer />
    </div>
  );
};
