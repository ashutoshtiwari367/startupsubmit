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
  const [dynamicWinners, setDynamicWinners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetch("/api/listings?limit=12")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.listings && data.listings.length > 0) {
          setDynamicWinners(
            data.listings.map((l: any, idx: number) => {
              const rank = (idx % 3) + 1;
              return {
                id: l.id,
                name: l.name,
                tagline: l.tagline,
                category: l.category,
                rank,
                placeLabel:
                  rank === 1
                    ? "1st Place Winner"
                    : rank === 2
                    ? "2nd Place Winner"
                    : "3rd Place Winner",
                badgeColor:
                  rank === 1
                    ? "from-[#FFF1D6] to-[#FDE68A] text-[#7A4E00] border-[#FCD34D]"
                    : rank === 2
                    ? "from-[#F1F5F9] to-[#E2E8F0] text-[#475569] border-[#CBD5E1]"
                    : "from-[#FFF7ED] to-[#FFEDD5] text-[#9A3412] border-[#FDBA74]",
                votes: l.upvotes || 380 - idx * 25,
                date: "Nov 9, 2026",
                founder: l.author || "Maker",
                founderHandle: `@${(l.slug || "maker").replace(/[^a-zA-Z0-9]/g, "")}`,
                url: `/product/${l.slug || l.id}`,
                backlinkDomain: `${l.slug}.io`,
              };
            })
          );
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const winnersList = dynamicWinners.length > 0 ? dynamicWinners : [
    {
      id: "p-1",
      name: "Cortex AI",
      tagline: "Autonomous customer success agents for modern B2B SaaS teams",
      category: "AI & Agents",
      rank: 1,
      placeLabel: "1st Place Winner",
      badgeColor: "from-[#FFF1D6] to-[#FDE68A] text-[#7A4E00] border-[#FCD34D]",
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
      badgeColor: "from-[#FFF1D6] to-[#FDE68A] text-[#7A4E00] border-[#FCD34D]",
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
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5]">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-6 py-10 sm:py-16 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="accent" size="sm" icon={<Trophy className="h-3 w-3" />}>
            HALL OF FAME
          </Badge>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#14142B] tracking-[-0.03em]">
            Daily & Weekly Winners
          </h1>
          <p className="text-base text-[#55556E] leading-relaxed">
            Every top 3 product earns an official embeddable winner badge and a permanent high-authority dofollow backlink (DR 72+).
          </p>

          {/* Timeframe Filter Pills */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center rounded-full border border-[#E6E6F0] bg-white p-1">
              <button
                type="button"
                onClick={() => setFilterPeriod("week")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterPeriod === "week"
                    ? "bg-[#4F46E5] text-white "
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod("month")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterPeriod === "month"
                    ? "bg-[#4F46E5] text-white "
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                November 2026
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterPeriod === "all"
                    ? "bg-[#4F46E5] text-white "
                    : "text-[#55556E] hover:text-[#14142B]"
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
              className={`relative rounded-2xl border bg-white p-6  transition-all hover:-translate-y-1 ${
                w.rank === 1
                  ? "border-[#FCD34D] ring-2 ring-[#FFF1D6]"
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
                    {w.rank === 1 && <Crown className="h-3.5 w-3.5 text-[#7A4E00]" />}
                    {w.placeLabel}
                  </span>

                  <span className="text-xs font-mono font-bold text-[#0F8A5F] flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    DR 72+ Indexed
                  </span>
                </div>

                {/* Product Name & Tagline */}
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-[#14142B] tracking-tight">
                    {w.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55556E] mt-1 line-clamp-2">
                    {w.tagline}
                  </p>
                </div>

                {/* Meta details */}
                <div className="rounded-[10px] bg-[#F6F6FB] p-3 text-xs space-y-1.5 font-mono text-[#55556E]">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-bold text-[#0F8A5F] font-sans flex items-center gap-0.5">
                      ★ Hall of Fame
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Launched by:</span>
                    <span className="font-sans font-semibold text-[#4F46E5]">
                      {w.founder} ({w.founderHandle})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dofollow Link:</span>
                    <span className="text-[#0F8A5F] truncate max-w-[140px] font-bold">
                      {w.backlinkDomain}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 border-t border-[#E6E6F0] mt-5">
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
          <div className="border-b border-[#E6E6F0] pb-3">
            <h2 className="font-heading font-extrabold text-xl text-[#14142B] tracking-tight">
              Historical Hall of Fame Archive
            </h2>
            <p className="text-xs text-[#55556E]">
              Every verified champion product with permanent SEO attribution.
            </p>
          </div>

          <div className="space-y-3">
            {winnersList.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#D4D4E4] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-[10px] flex items-center justify-center font-heading font-extrabold text-sm shrink-0 border ${item.badgeColor}`}
                  >
                    #{item.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-base text-[#14142B]">
                        {item.name}
                      </h3>
                      <span className="rounded-full bg-[#F6F6FB] border border-[#E6E6F0] px-2 py-0.2 text-[10px] font-semibold text-[#55556E]">
                        {item.category}
                      </span>
                      <span className="text-xs font-mono text-[#55556E]">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#55556E] mt-0.5 line-clamp-1">
                      {item.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-[#4F46E5]">
                      ★ Winner
                    </div>
                    <div className="text-[10px] font-mono text-[#0F8A5F]">rel="dofollow"</div>
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
