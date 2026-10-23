// app/best/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ArrowLeft, Loader2, Sparkles, Rocket } from 'lucide-react';
import { supabase, normalizeStartup } from '@/lib/supabase';
import StartupCard, { StartupItem } from '@/components/StartupCard';

export default function BestOfYearPage() {
  const [startups, setStartups] = useState<StartupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    async function fetchTopStartups() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('status', 'approved')
          .order('upvotes', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching best startups:', error.message);
        } else if (data) {
          setStartups(data.map(normalizeStartup) as StartupItem[]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopStartups();
  }, []);

  const handleUpvote = async (id: string, currentUpvotes: number) => {
    setStartups((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    );

    try {
      await supabase
        .from('startups')
        .update({ upvotes: currentUpvotes + 1 })
        .eq('id', id);
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#070709] text-white pt-8 pb-24 px-4 font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-gradient-to-b from-amber-500/15 via-orange-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Breadcrumb Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" /> Back to Home
        </Link>

        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
            <Trophy className="w-3.5 h-3.5" /> Annual Hall of Fame
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Best Indian Startups of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300">
              {currentYear}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            The highest-rated and most upvoted Indian SaaS tools, AI products, and developer utilities launched this year.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-[#0d0d12] rounded-3xl border border-white/5">
            <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading Hall of Fame rankings...</p>
          </div>
        )}

        {/* Ranked Leaderboard Cards */}
        {!loading && (
          <div className="space-y-3">
            {startups.map((item, index) => (
              <StartupCard
                key={item.id}
                startup={item}
                variant="list"
                rank={index + 1}
                onUpvote={handleUpvote}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && startups.length === 0 && (
          <div className="text-center py-16 bg-[#0d0d12] rounded-3xl border border-white/5 space-y-3">
            <p className="text-slate-400 text-sm">Abhi koi approved startup listed nahi hai.</p>
            <Link href="/submit" className="inline-block text-xs font-bold text-orange-400 hover:underline">
              Pehle ban kar submit karein →
            </Link>
          </div>
        )}

        {/* Bottom CTA Box */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 text-center space-y-4">
          <h3 className="font-black text-lg text-white">
            Think your product belongs on the {currentYear} leaderboard?
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Submit your startup today, start collecting community upvotes, and win visibility on global AI engines.
          </p>
          <Link
            href="/submit"
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-xl shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            Submit for Best of {currentYear} 🚀
          </Link>
        </div>
      </div>
    </main>
  );
}