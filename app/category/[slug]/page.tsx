// app/category/[slug]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag, Loader2, Rocket } from 'lucide-react';
import { supabase, normalizeStartup } from '@/lib/supabase';
import StartupCard, { StartupItem } from '@/components/StartupCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams.slug;
  const currentYear = new Date().getFullYear();

  const [startups, setStartups] = useState<StartupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategoryStartups() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('status', 'approved')
          .ilike('category', rawSlug)
          .order('upvotes', { ascending: false });

        if (error) {
          console.error('Category fetch error:', error.message);
        } else if (data) {
          setStartups(data.map(normalizeStartup) as StartupItem[]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryStartups();
  }, [rawSlug]);

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

  const formattedCategory = rawSlug.toUpperCase();

  return (
    <main className="min-h-screen bg-[#070709] text-white pt-8 pb-24 px-4 font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-gradient-to-b from-orange-600/15 via-amber-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Back Link */}
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" /> Back to All Categories
        </Link>

        {/* Category Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400">
            <Tag className="w-3.5 h-3.5" /> Category Showcase • {currentYear}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            {formattedCategory} Startups
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Curated list of verified Indian tech products and tools in the{' '}
            <span className="text-white font-semibold">{formattedCategory}</span> space.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-[#0d0d12] rounded-3xl border border-white/5">
            <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading {formattedCategory} products...</p>
          </div>
        )}

        {/* Listings */}
        {!loading && (
          <div className="space-y-3">
            {startups.length > 0 ? (
              startups.map((item, index) => (
                <StartupCard
                  key={item.id}
                  startup={item}
                  variant="list"
                  rank={index + 1}
                  onUpvote={handleUpvote}
                />
              ))
            ) : (
              <div className="text-center py-16 bg-[#0d0d12] rounded-3xl border border-white/10 space-y-4">
                <p className="text-slate-400 text-sm">
                  Is category me abhi koi approved startup nahi mila.
                </p>
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Apna startup submit karein</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}