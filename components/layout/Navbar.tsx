// components/layout/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Sparkles, Trophy, Menu, X } from 'lucide-react';

export function Navbar() {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Dynamic year calculation
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <header className="sticky top-6 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 mb-8 font-sans">
      <div className="w-full flex items-center justify-between h-16 px-6 sm:px-8 rounded-full bg-[#121216]/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80">
        
        {/* Left Side: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 flex items-center justify-center font-bold text-sm shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform shrink-0">
              🇮🇳
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-none whitespace-nowrap">
                Vinay<span className="text-orange-500"> Startup</span>
              </span>
              <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-1 hidden sm:block">
                Launchpad & AI Index
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links with Generous Spacing */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-400 px-4">
          <Link href="/" className="text-white hover:text-orange-400 transition-colors whitespace-nowrap">
            Launches
          </Link>
          <Link href="/directory" className="hover:text-white transition-colors whitespace-nowrap">
            Directory
          </Link>
          <Link 
            href="/best" 
            className="flex items-center gap-1.5 hover:text-amber-400 text-slate-300 transition-colors whitespace-nowrap"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Best of {currentYear}</span>
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors whitespace-nowrap">
            Pricing
          </Link>
          <Link 
            href="/llms.txt" 
            target="_blank" 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>llms.txt</span>
          </Link>
        </nav>

        {/* Right Side: Search Shortcut, Submit CTA & Mobile Toggle */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Quick Search Shortcut (Desktop) */}
          <Link 
            href="/directory"
            className="hidden lg:flex items-center gap-3 px-4 py-2 text-xs text-slate-400 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Search...</span>
            <kbd className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-300 bg-white/10 rounded border border-white/10">
              ⌘K
            </kbd>
          </Link>

          {/* Submit Action Button */}
          <Link 
            href="/submit" 
            className="inline-flex items-center gap-2 text-xs font-bold px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Submit Startup</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 p-5 rounded-3xl bg-[#121216]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-300">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-orange-400 py-1"
            >
              Launches
            </Link>
            <Link 
              href="/directory" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-orange-400 py-1"
            >
              Directory
            </Link>
            <Link 
              href="/best" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:text-amber-400 py-1 text-amber-400/90"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Best of {currentYear}</span>
            </Link>
            <Link 
              href="/pricing" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-orange-400 py-1"
            >
              Pricing
            </Link>
            <Link 
              href="/llms.txt" 
              target="_blank"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 py-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>llms.txt (AI Index)</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}