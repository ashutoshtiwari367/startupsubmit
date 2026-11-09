"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Sparkles,
  TrendingUp,
  Award,
  Link2,
  CheckCircle2,
  Users,
  Rocket,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Badge } from "./Badge";

interface StatItem {
  id: string;
  label: string;
  target: number;
  prefix?: string;
  suffix: string;
  subtext: string;
}

const STATS_DATA: StatItem[] = [
  {
    id: "users",
    label: "Active Makers",
    target: 30000,
    suffix: "+",
    subtext: "Founders & early adopters",
  },
  {
    id: "launches",
    label: "Total Launches",
    target: 5000,
    suffix: "+",
    subtext: "Vetted SaaS & AI products",
  },
  {
    id: "dr",
    label: "Domain Rating",
    prefix: "DR ",
    target: 72,
    suffix: "+",
    subtext: "Ahrefs authority score",
  },
  {
    id: "visits",
    label: "Monthly Visits",
    target: 1,
    suffix: "M+",
    subtext: "High-intent buyer traffic",
  },
];

interface TweetCardData {
  id: string;
  name: string;
  handle: string;
  avatarText: string;
  avatarBg: string;
  quote: string;
  highlightTag?: string;
  statsTag?: string;
  date: string;
}

const TWEETS_DATA: TweetCardData[] = [
  {
    id: "t1",
    name: "Alex Rivera",
    handle: "@arivera_dev",
    avatarText: "AR",
    avatarBg: "bg-[#5B5BF0]",
    quote:
      "Launched our developer tool on LaunchOS yesterday. Ended up at #1 Product of the Day — woke up to 1,400+ targeted visitors, 48 signups, and our DR 72 dofollow backlink is already indexed in Google Search Console! 🚀",
    highlightTag: "+1,400 visitors",
    statsTag: "DR 72 Dofollow",
    date: "2 days ago",
  },
  {
    id: "t2",
    name: "Elena Rostova",
    handle: "@elena_saas",
    avatarText: "ER",
    avatarBg: "bg-[#059669]",
    quote:
      "Most launch platforms give you temporary bot clicks. LaunchOS gave us real founders who actually bought our annual plan. The permanent editorial backlink alone is worth 10x what we spent preparing the launch.",
    highlightTag: "12 annual customers",
    statsTag: "High Retention",
    date: "1 week ago",
  },
  {
    id: "t3",
    name: "Marcus Chen",
    handle: "@marcus_builds",
    avatarText: "MC",
    avatarBg: "bg-[#D97706]",
    quote:
      "The 24h voting period was intense but super fair. No shady bot manipulation. Finished 2nd place and got our winner badge proudly embedded on our homepage now. The referral traffic hasn't stopped.",
    highlightTag: "2nd Place Winner",
    statsTag: "Embed Badge",
    date: "3 days ago",
  },
  {
    id: "t4",
    name: "Sarah Jenkins",
    handle: "@sarah_growth",
    avatarText: "SJ",
    avatarBg: "bg-[#DB2777]",
    quote:
      "If you're an indie founder wondering where to get your first 100 users + strong initial SEO signals, LaunchOS is the no-brainer launchpad. Ranked on page 1 for our core feature within 3 weeks of winning the daily badge.",
    highlightTag: "Page 1 on Google",
    statsTag: "Organic SEO",
    date: "5 days ago",
  },
  {
    id: "t5",
    name: "David K.",
    handle: "@davidk_ai",
    avatarText: "DK",
    avatarBg: "bg-[#0284C7]",
    quote:
      "Our AI video generator was discovered by two angel investors directly through the LaunchOS leaderboard. This isn't just a backlink directory, it's genuine distribution for serious software builders.",
    highlightTag: "Investor Inbound",
    statsTag: "Founder Visibility",
    date: "Yesterday",
  },
  {
    id: "t6",
    name: "Chloe Vance",
    handle: "@chloevance_ux",
    avatarText: "CV",
    avatarBg: "bg-[#9333EA]",
    quote:
      "Simple 2-minute submission, zero friction, and instant founder validation. The comment section brought us critical UX feedback that solved our onboarding drop-off. 10/10 recommend LaunchOS to any maker.",
    highlightTag: "Zero onboarding churn",
    statsTag: "Maker Feedback",
    date: "4 days ago",
  },
];

export const TestimonialsSection: React.FC = () => {
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    users: 0,
    launches: 0,
    dr: 0,
    visits: 0,
  });

  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 1600; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setCounts({
        users: Math.floor(easeProgress * 30000),
        launches: Math.floor(easeProgress * 5000),
        dr: Math.floor(easeProgress * 72),
        visits: parseFloat((easeProgress * 1).toFixed(1)),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCounts({
          users: 30000,
          launches: 5000,
          dr: 72,
          visits: 1,
        });
      }
    };

    requestAnimationFrame(animate);
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12"
    >
      {/* ------------------------------------------------------------------ */}
      {/* STATS BAR WITH COUNT-UP ANIMATION                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E8E8E3]">
          {/* STAT 1: 30,000+ USERS */}
          <div className="flex flex-col items-center text-center px-2 pt-2 md:pt-0">
            <span className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#0F0F10] tracking-tight">
              {counts.users.toLocaleString()}
              <span className="text-[#5B5BF0]">+</span>
            </span>
            <span className="mt-1 text-xs sm:text-sm font-bold text-[#0F0F10]">
              Active Makers
            </span>
            <span className="mt-0.5 text-[11px] font-mono text-[#8E8E93]">
              Founders & early adopters
            </span>
          </div>

          {/* STAT 2: 5,000+ LAUNCHES */}
          <div className="flex flex-col items-center text-center px-2 pt-4 md:pt-0">
            <span className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#0F0F10] tracking-tight">
              {counts.launches.toLocaleString()}
              <span className="text-[#5B5BF0]">+</span>
            </span>
            <span className="mt-1 text-xs sm:text-sm font-bold text-[#0F0F10]">
              Total Launches
            </span>
            <span className="mt-0.5 text-[11px] font-mono text-[#8E8E93]">
              Vetted SaaS & AI products
            </span>
          </div>

          {/* STAT 3: DR 72+ */}
          <div className="flex flex-col items-center text-center px-2 pt-4 md:pt-0">
            <span className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#5B5BF0] tracking-tight">
              DR {counts.dr}
              <span>+</span>
            </span>
            <span className="mt-1 text-xs sm:text-sm font-bold text-[#0F0F10]">
              Domain Rating
            </span>
            <span className="mt-0.5 text-[11px] font-mono text-[#8E8E93]">
              Ahrefs authority score
            </span>
          </div>

          {/* STAT 4: 1M+ MONTHLY VISITS */}
          <div className="flex flex-col items-center text-center px-2 pt-4 md:pt-0">
            <span className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#0F0F10] tracking-tight">
              {counts.visits}
              <span className="text-[#5B5BF0]">M+</span>
            </span>
            <span className="mt-1 text-xs sm:text-sm font-bold text-[#0F0F10]">
              Monthly Visits
            </span>
            <span className="mt-0.5 text-[11px] font-mono text-[#8E8E93]">
              High-intent buyer traffic
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION HEADER                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="accent" size="sm" icon={<Sparkles className="h-3 w-3" />}>
          REAL FOUNDER STORIES
        </Badge>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0F0F10] tracking-[-0.03em]">
          Loved by builders who ship & grow
        </h2>
        <p className="text-sm sm:text-base text-[#66666B]">
          See what happens when indie hackers and SaaS founders launch their tools into our high-authority community.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MASONRY GRID OF 6 TWEET-STYLE CARDS                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
        {TWEETS_DATA.map((tweet) => (
          <div
            key={tweet.id}
            className="break-inside-avoid group relative rounded-[14px] border border-[#E8E8E3] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#D5D5CE] transition-all duration-200 flex flex-col justify-between"
          >
            {/* Top row: Author Info & Subtle X Icon */}
            <div>
              <div className="flex items-start justify-between mb-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tweet.avatarBg} text-white font-heading font-bold text-xs shadow-xs`}
                  >
                    {tweet.avatarText}
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-[#0F0F10] flex items-center gap-1.5 leading-snug">
                      <span>{tweet.name}</span>
                      <span className="h-1 w-1 rounded-full bg-[#E8E8E3]" />
                      <span className="text-[11px] font-mono text-[#8E8E93] font-normal">
                        {tweet.date}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#8E8E93]">
                      {tweet.handle}
                    </div>
                  </div>
                </div>

                {/* Subtle X (Twitter) Icon */}
                <div
                  className="text-[#8E8E93] group-hover:text-[#0F0F10] transition-colors p-1"
                  aria-label="View on X"
                >
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
              </div>

              {/* Quote Body */}
              <p className="text-sm text-[#47474F] leading-relaxed mb-4">
                "{tweet.quote}"
              </p>
            </div>

            {/* Bottom Row Tags */}
            <div className="pt-3 border-t border-[#E8E8E3]/60 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF0FE] text-[#5B5BF0] px-2.5 py-0.5 text-[11px] font-semibold">
                <TrendingUp className="h-3 w-3" />
                {tweet.highlightTag}
              </span>
              <span className="font-mono text-[10px] text-[#8E8E93] bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 rounded-full">
                {tweet.statsTag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

