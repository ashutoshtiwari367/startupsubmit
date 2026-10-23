// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Rocket, 
  ShieldCheck, 
  Zap, 
  Loader2, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  TrendingUp, 
  LayoutGrid, 
  List,
  Crown
} from 'lucide-react';
import { supabase, normalizeStartup } from '@/lib/supabase';
import StartupCard, { StartupItem } from '@/components/StartupCard';
import { DEMO_STARTUPS } from '@/lib/demo-startups';

export default function HomePage() {
  const [startups, setStartups] = useState<StartupItem[]>(DEMO_STARTUPS);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch approved startups from Supabase and merge with demo dataset
  useEffect(() => {
    async function fetchHomeStartups() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('status', 'approved')
          .order('upvotes', { ascending: false });

        if (error) {
          console.error('Home page fetch error:', error.message);
          setStartups(DEMO_STARTUPS);
        } else if (data && data.length > 0) {
          const dbNormalized = data.map(normalizeStartup) as StartupItem[];
          const dbSlugs = new Set(dbNormalized.map((s) => s.slug));
          const remainingDemos = DEMO_STARTUPS.filter((d) => !dbSlugs.has(d.slug));
          setStartups([...dbNormalized, ...remainingDemos]);
        } else {
          setStartups(DEMO_STARTUPS);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setStartups(DEMO_STARTUPS);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeStartups();
  }, []);

  // Real-time Upvote logic
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

  const featuredStartups = startups.filter((s) => s.is_featured);
  const regularStartups = startups.filter((s) => !s.is_featured);

  return (
    <main className="min-h-screen bg-[#070709] text-white pt-6 pb-24 px-4 font-sans relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-orange-600/20 via-amber-600/10 to-transparent blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 pt-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400 shadow-sm">
            <Sparkles className="w-4 h-4" /> Premier Indian Startup Launchpad & AI Search Index
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            List your SaaS. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500">
              Get discovered.
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            List free, or go live today with Premium. Every listing gets its own page, a dofollow backlink to your site, and founders finding you long after launch day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-bold text-sm text-white shadow-xl shadow-orange-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              <span>Submit Your SaaS (Free) &rarr;</span>
            </Link>

            <Link
              href="/directory"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Browse Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Checklist Proof Badges matching reference design */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 pt-4 text-xs text-slate-300 flex-wrap font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-orange-400 font-bold">✓</span>
              <span>Free to list</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-orange-400 font-bold">✓</span>
              <span>AI fills in your listing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-orange-400 font-bold">✓</span>
              <span>{startups.length}+ SaaS listed</span>
            </div>
          </div>
        </div>

        {/* Featured Launches (Top sponsored & featured items) */}
        {featuredStartups.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-orange-400">
                <Zap className="w-4 h-4" /> // featured launches
              </div>
              <Link
                href="/directory"
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
              >
                <span>View all in directory</span>
                <ArrowRight className="w-3 h-3 text-orange-400" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredStartups.slice(0, 4).map((item) => (
                <StartupCard
                  key={item.id}
                  startup={item}
                  variant="grid"
                  onUpvote={handleUpvote}
                />
              ))}
            </div>
          </div>
        )}

        {/* Today's Trending Products Grid */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              <Flame className="w-4 h-4 text-orange-500" /> // just listed & trending products
            </div>

            <div className="flex items-center gap-3">
              {/* Layout Switcher */}
              <div className="hidden sm:flex items-center bg-[#121218] p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <Link
                href="/directory"
                className="text-xs font-semibold text-orange-400 hover:underline flex items-center gap-1"
              >
                <span>View All ({startups.length})</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d0d12] rounded-3xl border border-white/5">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-xs text-slate-400">Fetching live Indian launches...</p>
            </div>
          )}

          {!loading && regularStartups.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {regularStartups.map((item, index) => (
                    <StartupCard
                      key={item.id}
                      startup={item}
                      variant="grid"
                      rank={index + 1}
                      onUpvote={handleUpvote}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {regularStartups.map((item, index) => (
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
            </>
          )}
        </div>

      </div>
    </main>
  );
}