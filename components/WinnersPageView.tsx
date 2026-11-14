"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Sparkles,
  Calendar,
  ArrowRight,
  ExternalLink,
  Flame,
  ChevronUp,
  RotateCw,
  Globe,
  Layers,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FinalCTA } from "./FinalCTA";
import { Badge } from "./Badge";
import { Button } from "./Button";
import type { WinnerListingItem, AvailableMonthOption } from "@/lib/winners";

export const WinnersPageView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const periodParam = (searchParams.get("period") || "monthly").toLowerCase();
  const monthParam = searchParams.get("month") || "";

  const [period, setPeriod] = useState<string>(periodParam);
  const [selectedMonth, setSelectedMonth] = useState<string>(monthParam);
  const [winners, setWinners] = useState<WinnerListingItem[]>([]);
  const [periodLabel, setPeriodLabel] = useState<string>("Winner of the Month");
  const [availableMonths, setAvailableMonths] = useState<AvailableMonthOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Sync state with URL search params
  useEffect(() => {
    const urlPeriod = (searchParams.get("period") || "monthly").toLowerCase();
    const urlMonth = searchParams.get("month") || "";
    setPeriod(urlPeriod);
    setSelectedMonth(urlMonth);
  }, [searchParams]);

  // Fetch winners authoritatively from backend API
  useEffect(() => {
    setIsLoading(true);
    const query = new URLSearchParams();
    if (period) query.set("period", period);
    if (selectedMonth && period === "monthly") query.set("month", selectedMonth);

    fetch(`/api/winners?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setWinners(data.winners || []);
          setPeriodLabel(data.periodLabel || "Hall of Winners");
          if (Array.isArray(data.availableMonths)) {
            setAvailableMonths(data.availableMonths);
          }
          if (data.selectedMonth && !selectedMonth) {
            setSelectedMonth(data.selectedMonth);
          }
        } else {
          setWinners([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load winners:", err);
        setWinners([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [period, selectedMonth]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    const params = new URLSearchParams();
    params.set("period", newPeriod);
    if (newPeriod === "monthly" && selectedMonth) {
      params.set("month", selectedMonth);
    }
    router.push(`/winners?${params.toString()}`);
  };

  const handleMonthChange = (monthSlug: string) => {
    setSelectedMonth(monthSlug);
    setPeriod("monthly");
    router.push(`/winners?period=monthly&month=${monthSlug}`);
  };

  const top3 = winners.slice(0, 3);
  const remaining = winners.slice(3);

  const renderLogo = (item: WinnerListingItem, sizeClass = "h-14 w-14") => {
    const hasError = imgErrors[item.id];
    const initials = (item.name || "TL").slice(0, 2).toUpperCase();

    if (item.logoUrl && !hasError) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.logoUrl}
          alt={item.name}
          onError={() => setImgErrors((prev) => ({ ...prev, [item.id]: true }))}
          className={`${sizeClass} rounded-2xl object-cover border border-[#E6E6F0] bg-white shrink-0 shadow-2xs`}
        />
      );
    }

    return (
      <div
        className={`${sizeClass} rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#818CF8] text-white flex items-center justify-center font-heading font-extrabold text-base border border-[#E6E6F0] shrink-0 shadow-2xs`}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5]">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-5 pb-12 sm:pt-6 sm:pb-16 space-y-6 sm:space-y-8">
        {/* ======================================================== */}
        {/* ULTRA-PREMIUM COMPACT HEADER & CONTROLS                  */}
        {/* ======================================================== */}
        <div className="relative rounded-2xl sm:rounded-3xl border border-[#E6E6F0] bg-gradient-to-b from-white via-[#FCFCFE] to-[#F7F6FF]/70 p-5 sm:p-7 shadow-[0_4px_24px_rgba(20,20,43,0.03)] space-y-4 overflow-hidden">
          {/* Ambient subtle glow background */}
          <div className="absolute -top-12 -right-12 w-80 h-40 bg-[#4F46E5]/6 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-60 h-32 bg-[#FCD34D]/10 blur-2xl pointer-events-none rounded-full" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            {/* Title, Badge & Subtitle */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="accent" size="sm" icon={<Trophy className="h-3 w-3 text-[#D97706]" />}>
                  HALL OF WINNERS
                </Badge>
                <span className="text-[11px] font-mono text-[#0F8A5F] font-bold bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                  ● Verified Community Upvotes
                </span>
              </div>

              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#14142B] tracking-tight">
                {periodLabel}
              </h1>

              <p className="text-xs sm:text-sm text-[#55556E] max-w-xl">
                Official maker leaderboard authoritatively ranked by community upvotes.
                Top 3 champions earn permanent spotlight and verified backlink attribution.
              </p>
            </div>

            {/* Segmented Period Tabs */}
            <div className="inline-flex flex-wrap items-center gap-1 bg-[#F1F1F8]/90 p-1.5 rounded-2xl border border-[#E6E6F0] shrink-0 self-start lg:self-center shadow-2xs">
              <button
                type="button"
                onClick={() => handlePeriodChange("monthly")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  period === "monthly"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>Month</span>
              </button>

              <button
                type="button"
                onClick={() => handlePeriodChange("weekly")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  period === "weekly"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Week</span>
              </button>

              <button
                type="button"
                onClick={() => handlePeriodChange("quarterly")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  period === "quarterly"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                <Crown className="h-3.5 w-3.5" />
                <span>Quarter</span>
              </button>

              <button
                type="button"
                onClick={() => handlePeriodChange("yearly")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  period === "yearly"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Year</span>
              </button>

              <button
                type="button"
                onClick={() => handlePeriodChange("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  period === "all"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "text-[#55556E] hover:text-[#14142B]"
                }`}
              >
                <Medal className="h-3.5 w-3.5" />
                <span>All-Time</span>
              </button>
            </div>
          </div>

          {/* Monthly Archives Pills (when period === "monthly") */}
          {period === "monthly" && availableMonths.length > 0 && (
            <div className="pt-2.5 border-t border-[#E6E6F0]/80 flex flex-wrap items-center gap-2 relative z-10 animate-in fade-in duration-150">
              <span className="text-[11px] font-mono font-bold text-[#55556E] flex items-center gap-1 mr-1">
                <Calendar className="h-3.5 w-3.5 text-[#4F46E5]" />
                Monthly Archives:
              </span>
              {availableMonths.map((m) => {
                const isSelected = selectedMonth === m.slug;
                return (
                  <button
                    key={m.slug}
                    type="button"
                    onClick={() => handleMonthChange(m.slug)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs"
                        : "bg-white text-[#55556E] border-[#E6E6F0] hover:border-[#4F46E5] hover:text-[#14142B]"
                    }`}
                  >
                    <span>{m.label}</span>
                    {m.isCurrent && (
                      <span
                        className={`ml-1.5 text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected ? "bg-white/20 text-white" : "bg-[#FFF1D6] text-[#7A4E00]"
                        }`}
                      >
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* LOADING STATE                                            */}
        {/* ======================================================== */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <RotateCw className="h-8 w-8 text-[#4F46E5] animate-spin mx-auto" />
            <p className="text-sm font-mono text-[#55556E]">
              Calculating community rankings from verified upvotes...
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* EMPTY STATE                                              */}
        {/* ======================================================== */}
        {!isLoading && winners.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#E6E6F0] bg-white p-10 sm:p-14 text-center max-w-xl mx-auto space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-[#F7F6FF] text-[#4F46E5] flex items-center justify-center mx-auto">
              <Trophy className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-xl text-[#14142B]">
                No Winning Products for {periodLabel}
              </h3>
              <p className="text-xs sm:text-sm text-[#55556E]">
                No approved tools with verified upvotes were recorded for this timeframe.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePeriodChange("monthly")}
              >
                View Current Month Winners
              </Button>
              <Link href="/submit">
                <Button variant="primary" size="sm">
                  Submit Your Tool
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TOP 3 PODIUM HERO CARDS                                  */}
        {/* ======================================================== */}
        {!isLoading && top3.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E6F0] pb-2">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#D97706]" />
                <h2 className="font-heading font-extrabold text-xl text-[#14142B]">
                  Leaderboard Podium (Top 3 Champions)
                </h2>
              </div>
              <span className="text-xs font-mono text-[#55556E]">
                Sorted strictly by verified upvotes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {top3.map((w) => (
                <div
                  key={w.id}
                  className={`relative rounded-2xl border bg-white p-6 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between ${
                    w.rank === 1
                      ? "border-[#FCD34D] ring-2 ring-[#FFF1D6] shadow-[0_6px_24px_rgba(252,211,77,0.18)] hover:shadow-[0_10px_32px_rgba(252,211,77,0.25)]"
                      : w.rank === 2
                      ? "border-[#CBD5E1] shadow-[0_4px_20px_rgba(203,213,225,0.25)] hover:shadow-[0_8px_28px_rgba(203,213,225,0.35)]"
                      : "border-[#FDBA74] shadow-[0_4px_20px_rgba(253,186,116,0.2)] hover:shadow-[0_8px_28px_rgba(253,186,116,0.3)]"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Rank Badge & Winner Month */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-gradient-to-r border ${w.badgeColor}`}
                      >
                        {w.rank === 1 && <Crown className="h-3.5 w-3.5 text-[#7A4E00]" />}
                        {w.rank === 2 && <Medal className="h-3.5 w-3.5 text-[#475569]" />}
                        {w.rank === 3 && <Award className="h-3.5 w-3.5 text-[#9A3412]" />}
                        <span>{w.placeLabel}</span>
                      </span>

                      {/* Verified Upvotes Pill */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F7F6FF] text-[#4F46E5] font-mono font-bold text-xs border border-[#E0DEFC]">
                        <ChevronUp className="h-3.5 w-3.5" />
                        <span>{w.upvotes} upvotes</span>
                      </span>
                    </div>

                    {/* Logo + Product Name + Category */}
                    <div className="flex items-start gap-3.5">
                      {renderLogo(w, "h-14 w-14")}

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link href={w.url} className="group/title">
                            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#14142B] group-hover/title:text-[#4F46E5] transition-colors truncate">
                              {w.name}
                            </h3>
                          </Link>
                        </div>
                        <span className="inline-block rounded-md bg-[#F1F1F8] text-[#55556E] text-[10px] font-semibold px-2 py-0.5">
                          {w.category}
                        </span>
                      </div>
                    </div>

                    {/* 2-line Tagline (line-clamp-2) */}
                    <p className="text-xs sm:text-sm text-[#55556E] leading-relaxed line-clamp-2">
                      {w.tagline}
                    </p>

                    {/* Winner Metadata: Winner Month, Website Link, Launched By */}
                    <div className="rounded-xl bg-[#F6F6FB] p-3 text-xs space-y-2 font-mono text-[#55556E] border border-[#E6E6F0]/60">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#8E8E93]">Winner Period:</span>
                        <span className="font-sans font-bold text-[#14142B]">
                          ★ {w.winnerPeriod}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#8E8E93]">Launched By:</span>
                        <span className="font-sans font-semibold text-[#4F46E5]">
                          {w.founder} ({w.founderHandle})
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#8E8E93]">Website Link:</span>
                        <a
                          href={w.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#4F46E5] hover:underline font-bold max-w-[170px] truncate"
                          title={`Visit ${w.name}`}
                        >
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="truncate">{w.websiteDomain}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA: Inspect Launch */}
                  <div className="pt-4 border-t border-[#E6E6F0] mt-4">
                    <Link href={w.url} className="w-full block">
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full font-bold text-xs justify-between"
                      >
                        <span>Inspect Winning Launch</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* FULL RANKED WINNERS DIRECTORY (Ranks 4+)                  */}
        {/* ======================================================== */}
        {!isLoading && remaining.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="border-b border-[#E6E6F0] pb-3">
              <h2 className="font-heading font-extrabold text-xl text-[#14142B] tracking-tight">
                All Ranked Winners ({remaining.length} Additional Products)
              </h2>
              <p className="text-xs text-[#55556E]">
                Every verified product ranked by actual upvotes in this timeframe.
              </p>
            </div>

            <div className="space-y-3">
              {remaining.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#D4D4E4] transition-all"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Rank Badge */}
                    <div className="h-10 w-10 rounded-xl bg-[#F6F6FB] border border-[#E6E6F0] text-[#14142B] flex items-center justify-center font-mono font-extrabold text-sm shrink-0">
                      #{item.rank}
                    </div>

                    {/* Logo */}
                    {renderLogo(item, "h-11 w-11")}

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={item.url} className="group/itemTitle">
                          <h3 className="font-heading font-bold text-base text-[#14142B] group-hover/itemTitle:text-[#4F46E5] transition-colors truncate">
                            {item.name}
                          </h3>
                        </Link>
                        <span className="rounded-md bg-[#F1F1F8] border border-[#E6E6F0] px-2 py-0.5 text-[10px] font-semibold text-[#55556E]">
                          {item.category}
                        </span>
                        <span className="text-xs font-mono text-[#55556E]">
                          ★ {item.winnerPeriod}
                        </span>
                      </div>

                      {/* 2-line Tagline */}
                      <p className="text-xs text-[#55556E] line-clamp-2 leading-relaxed">
                        {item.tagline}
                      </p>

                      {/* Website Link */}
                      <div className="pt-0.5">
                        <a
                          href={item.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#4F46E5] hover:underline"
                        >
                          <Globe className="h-3 w-3" />
                          <span>{item.websiteDomain}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right: Upvotes + View Launch */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F7F6FF] text-[#4F46E5] font-mono font-bold text-xs border border-[#E0DEFC]">
                      <ChevronUp className="h-3.5 w-3.5" />
                      <span>{item.upvotes} upvotes</span>
                    </span>

                    <Link href={item.url}>
                      <Button variant="secondary" size="sm" className="font-semibold text-xs">
                        View Launch
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <FinalCTA />
      <Footer />
    </div>
  );
};
