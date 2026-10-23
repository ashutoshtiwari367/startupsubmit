// app/directory/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  Filter, 
  ArrowRight, 
  Loader2, 
  LayoutGrid, 
  List, 
  Rocket,
  Flame,
  CheckCircle2,
  X,
  Crown,
  Zap,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { supabase, normalizeStartup } from '@/lib/supabase';
import StartupCard, { StartupItem } from '@/components/StartupCard';
import { DEMO_STARTUPS } from '@/lib/demo-startups';

const categories = ['All', 'SaaS', 'AI', 'Fintech', 'Marketing', 'DevTools', 'Productivity', 'E-Commerce'];

export default function DirectoryPage() {
  const [startups, setStartups] = useState<StartupItem[]>(DEMO_STARTUPS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'upvotes' | 'name' | 'newest'>('upvotes');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch approved startups from Supabase and merge with demo dataset
  useEffect(() => {
    async function fetchStartups() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('status', 'approved')
          .order('upvotes', { ascending: false });

        if (error) {
          console.error('Error fetching startups from DB:', error.message);
          setStartups(DEMO_STARTUPS);
        } else if (data && data.length > 0) {
          const dbNormalized = data.map(normalizeStartup) as StartupItem[];
          // Merge database items first, then deduplicate demo items
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

    fetchStartups();
  }, []);

  // Real-time Upvote Handler
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
      console.error('Upvote failed:', err);
    }
  };

  // Sponsored & Featured Startups (top featured items)
  const sponsoredStartups = useMemo(() => {
    return startups.filter((s) => s.is_featured).slice(0, 3);
  }, [startups]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: startups.length };
    startups.forEach((s) => {
      const cat = s.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [startups]);

  // Client-side Search, Filtering & Sorting
  const filteredStartups = useMemo(() => {
    return startups
      .filter((startup) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          startup.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch =
          startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          startup.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (startup.description && startup.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [startups, selectedCategory, searchQuery, sortBy]);

  return (
    <main className="min-h-screen bg-[#070709] text-white pt-6 pb-24 px-4 font-sans relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-orange-600/15 via-amber-600/5 to-transparent blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400">
            <Sparkles className="w-3.5 h-3.5" /> Curated Indian Startup Directory
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Discover Top Indian Startups & SaaS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Browse verified tech products built by Indian entrepreneurs. Filter by category, test-drive products, and support top makers.
          </p>
        </div>

        {/* ================================================================= */}
        {/* SPONSORED & FEATURED SHOWCASE SECTION                             */}
        {/* ================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-orange-400 tracking-wider">
                // sponsored
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Promoted launches & high-visibility SaaS placements
              </span>
            </div>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
            >
              <span>Promote Your SaaS Here</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sponsored Startup Cards */}
            {sponsoredStartups.map((item, idx) => (
              <StartupCard
                key={item.id}
                startup={item}
                variant="grid"
                rank={idx + 1}
                onUpvote={handleUpvote}
                className="ring-1 ring-orange-500/20 shadow-orange-500/5 hover:ring-orange-500/40"
              />
            ))}

            {/* "Your Product Here" Sponsor Slot (Matching Reference Design) */}
            <div className="relative overflow-hidden flex flex-col justify-between rounded-3xl bg-[#0c0c12] border-2 border-dashed border-orange-500/30 hover:border-orange-500/60 p-6 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl">
              <div 
                className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.3), transparent 75%)'
                }}
              />

              <div className="relative space-y-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto sm:mx-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Crown className="w-6 h-6 fill-orange-400/20" />
                </div>

                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Available Slot
                  </div>
                  <h3 className="text-base font-black text-white group-hover:text-orange-400 transition-colors">
                    Your Product Here
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Get featured placement at the top of the directory. Drive targeted founder traffic, boost AI citations, and get dofollow links.
                  </p>
                </div>
              </div>

              <div className="relative pt-6">
                <Link
                  href="/submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all group-hover:scale-[1.02]"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Get Featured Placement</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* ALL PRODUCTS: SEARCH, FILTERS & CONTROLS                          */}
        {/* ================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="font-mono text-xs font-bold text-slate-300 tracking-wider">
              // all directory products
            </span>
            <span className="text-xs text-slate-400">
              Showing <strong className="text-white">{filteredStartups.length}</strong> startups
            </span>
          </div>

          {/* Search, Filter & Layout Controls Bar */}
          <div className="space-y-4 p-4 sm:p-5 rounded-3xl bg-[#0d0d12] border border-white/10 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search Input */}
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search startups by name, keyword, or pitch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sorting & Layout Switcher */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Filter className="w-3.5 h-3.5 text-orange-400" />
                  <span>Sort:</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setSortBy('upvotes')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      sortBy === 'upvotes'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Most Upvoted
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      sortBy === 'name'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    A to Z
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Grid Cards"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Compact List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-white/5">
              {categories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <span>{cat}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-500'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-xs text-slate-400">Loading verified Indian startups...</p>
            </div>
          )}

          {/* Product Cards: Grid View vs List View */}
          {!loading && filteredStartups.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredStartups.map((item, index) => (
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
                  {filteredStartups.map((item, index) => (
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

          {/* Empty State */}
          {!loading && filteredStartups.length === 0 && (
            <div className="text-center py-20 bg-[#0d0d12] rounded-3xl border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No startups found</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  No approved startups match your current category or search criteria.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                >
                  Clear Filters
                </button>
                <Link
                  href="/submit"
                  className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
                >
                  Submit Startup
                </Link>
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}