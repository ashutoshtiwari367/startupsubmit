"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Plus,
  Trophy,
  Crown,
  Flame,
  Calendar,
  ChevronDown,
  Award,
  Medal,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "./Button";
import { AuthModal } from "./AuthModal";
import { UserProfileDropdown } from "./UserProfileDropdown";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [winnersDropdownOpen, setWinnersDropdownOpen] = useState(false);
  const [mobileWinnersOpen, setMobileWinnersOpen] = useState(false);
  const winnersRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (winnersRef.current && !winnersRef.current.contains(event.target as Node)) {
        setWinnersDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isWinnersActive = pathname?.startsWith("/winners");

  const standardNavLinks = [
    { label: "Live Directory", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: "Pricing", href: "/pricing" },
  ];

  const pastMonths = [
    { label: "October 2026", href: "/winners?period=monthly&month=2026-10" },
    { label: "September 2026", href: "/winners?period=monthly&month=2026-09" },
    { label: "August 2026", href: "/winners?period=monthly&month=2026-08" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/categories") return pathname?.startsWith("/categories") || pathname?.startsWith("/category");
    return pathname?.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#E6E6F0] bg-white/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-6">
          {/* Brand Logo / Domain Name (Hard reload & navigate to /) */}
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/";
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46E5] text-white group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-[#14142B]">
              LaunchOS
            </span>
          </Link>

          {/* Desktop Navigation Routes */}
          <nav className="hidden md:flex items-center gap-1.5">
            {/* 1. Live Directory */}
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive("/")
                  ? "bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC]"
                  : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F1F1F8] border border-transparent"
              }`}
            >
              Live Directory
            </Link>

            {/* 2. Hall of Winners (Direct Link + Hover Dropdown) */}
            <div
              ref={winnersRef}
              className="relative"
              onMouseEnter={() => setWinnersDropdownOpen(true)}
              onMouseLeave={() => setWinnersDropdownOpen(false)}
            >
              <div
                className={`flex items-center rounded-xl transition-all duration-150 ${
                  isWinnersActive
                    ? "bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC]"
                    : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F1F1F8] border border-transparent"
                }`}
              >
                <Link
                  href="/winners"
                  onClick={() => setWinnersDropdownOpen(false)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold cursor-pointer"
                >
                  <Trophy className="h-4 w-4 text-[#4F46E5]" />
                  <span>Hall of Winners</span>
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setWinnersDropdownOpen((prev) => !prev);
                  }}
                  aria-label="Toggle Hall of Winners menu"
                  className="pr-2.5 pl-0.5 py-1.5 text-[#55556E] hover:text-[#14142B] cursor-pointer"
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      winnersDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {winnersDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-68 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="rounded-2xl border border-[#E6E6F0] bg-white p-2 shadow-[0_12px_32px_rgba(20,20,43,0.08)] space-y-1">
                    {/* Primary Period Champions */}
                    <div className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider text-[#55556E] uppercase">
                      Current Champions
                    </div>

                    <Link
                      href="/winners?period=monthly"
                      onClick={() => setWinnersDropdownOpen(false)}
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-[#14142B] hover:bg-[#F7F6FF] hover:text-[#4F46E5] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-[#D97706]" />
                        <span>Winner of the Month</span>
                      </div>
                      <span className="rounded-full bg-[#FFF1D6] text-[#7A4E00] text-[9px] font-bold px-1.5 py-0.2 uppercase">
                        Current
                      </span>
                    </Link>

                    <Link
                      href="/winners?period=weekly"
                      onClick={() => setWinnersDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#14142B] hover:bg-[#F7F6FF] hover:text-[#4F46E5] transition-colors"
                    >
                      <Flame className="h-4 w-4 text-[#EF4444]" />
                      <span>Winner of the Week</span>
                    </Link>

                    <Link
                      href="/winners?period=quarterly"
                      onClick={() => setWinnersDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#14142B] hover:bg-[#F7F6FF] hover:text-[#4F46E5] transition-colors"
                    >
                      <Crown className="h-4 w-4 text-[#8B5CF6]" />
                      <span>Winner of the Quarter</span>
                    </Link>

                    <Link
                      href="/winners?period=yearly"
                      onClick={() => setWinnersDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#14142B] hover:bg-[#F7F6FF] hover:text-[#4F46E5] transition-colors"
                    >
                      <Award className="h-4 w-4 text-[#10B981]" />
                      <span>Winner of the Year</span>
                    </Link>

                    {/* Monthly Archives */}
                    <div className="pt-1.5 mt-1 border-t border-[#E6E6F0]">
                      <div className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider text-[#55556E] uppercase">
                        Monthly Archives
                      </div>

                      {pastMonths.map((m) => (
                        <Link
                          key={m.href}
                          href={m.href}
                          onClick={() => setWinnersDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#55556E] hover:bg-[#F6F6FB] hover:text-[#14142B] transition-colors"
                        >
                          <Calendar className="h-3.5 w-3.5 text-[#55556E]" />
                          <span>{m.label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* All Time */}
                    <div className="pt-1 border-t border-[#E6E6F0]">
                      <Link
                        href="/winners?period=all"
                        onClick={() => setWinnersDropdownOpen(false)}
                        className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#4F46E5] hover:bg-[#F7F6FF] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Medal className="h-4 w-4 text-[#4F46E5]" />
                          <span>All-Time Champions</span>
                        </div>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Categories */}
            <Link
              href="/categories"
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive("/categories")
                  ? "bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC]"
                  : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F1F1F8] border border-transparent"
              }`}
            >
              Categories
            </Link>

            {/* 4. Pricing */}
            <Link
              href="/pricing"
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive("/pricing")
                  ? "bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC]"
                  : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F1F1F8] border border-transparent"
              }`}
            >
              Pricing
            </Link>
          </nav>

          {/* Desktop Action CTAs & Controls */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/submit">
              <button
                type="button"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  pathname === "/submit"
                    ? "bg-[#4338CA] ring-2 ring-[#4F46E5] ring-offset-2"
                    : "bg-[#4F46E5] hover:bg-[#4338CA]"
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Submit Product</span>
              </button>
            </Link>

            <UserProfileDropdown onSignInClick={() => setShowAuthModal(true)} />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-[10px] border border-[#E6E6F0] bg-white text-[#14142B]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#E6E6F0] bg-white px-4 py-4 space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-col space-y-1">
              {/* Directory */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                  isActive("/")
                    ? "bg-[#F7F6FF] text-[#4F46E5] font-bold border border-[#E0DEFC]"
                    : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F1F1F8]"
                }`}
              >
                <span>Live Directory</span>
                <ArrowRight className={`h-4 w-4 ${isActive("/") ? "text-[#4F46E5]" : "opacity-40"}`} />
              </Link>

              {/* Hall of Winners Direct Link + Expandable Chevron */}
              <div
                className={`rounded-xl border transition-colors overflow-hidden ${
                  isWinnersActive
                    ? "border-[#E0DEFC] bg-[#F7F6FF]"
                    : "border-[#E6E6F0] bg-white"
                }`}
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <Link
                    href="/winners"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold flex-1 cursor-pointer"
                  >
                    <Trophy className="h-4 w-4 text-[#4F46E5]" />
                    <span className={isWinnersActive ? "text-[#4F46E5] font-bold" : "text-[#14142B]"}>
                      Hall of Winners
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileWinnersOpen(!mobileWinnersOpen)}
                    aria-label="Toggle Hall of Winners options"
                    className="p-1.5 text-[#55556E] hover:text-[#14142B] rounded-lg hover:bg-[#F1F1F8] cursor-pointer"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        mobileWinnersOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {mobileWinnersOpen && (
                  <div className="bg-[#FAFAFD] px-3 py-2 space-y-1 border-t border-[#E6E6F0]">
                    <Link
                      href="/winners?period=monthly"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 text-xs font-semibold text-[#14142B] hover:text-[#4F46E5]"
                    >
                      🏆 Winner of the Month (Current)
                    </Link>
                    <Link
                      href="/winners?period=weekly"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 text-xs font-semibold text-[#14142B] hover:text-[#4F46E5]"
                    >
                      ⚡ Winner of the Week
                    </Link>
                    <Link
                      href="/winners?period=quarterly"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 text-xs font-semibold text-[#14142B] hover:text-[#4F46E5]"
                    >
                      👑 Winner of the Quarter
                    </Link>
                    <Link
                      href="/winners?period=yearly"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 text-xs font-semibold text-[#14142B] hover:text-[#4F46E5]"
                    >
                      🌟 Winner of the Year
                    </Link>

                    <div className="pt-1.5 mt-1 border-t border-[#E6E6F0] text-[10px] font-bold font-mono text-[#55556E] uppercase px-2.5">
                      Monthly Archives
                    </div>
                    {pastMonths.map((m) => (
                      <Link
                        key={m.href}
                        href={m.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-2.5 py-1 text-xs text-[#55556E] hover:text-[#14142B]"
                      >
                        📅 {m.label}
                      </Link>
                    ))}

                    <Link
                      href="/winners?period=all"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 text-xs font-bold text-[#4F46E5] border-t border-[#E6E6F0] mt-1"
                    >
                      🏅 All-Time Champions →
                    </Link>
                  </div>
                )}
              </div>

              {/* Categories */}
              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                  isActive("/categories")
                    ? "bg-[#F7F6FF] text-[#4F46E5] font-bold border border-[#E0DEFC]"
                    : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F1F1F8]"
                }`}
              >
                <span>Categories</span>
                <ArrowRight className={`h-4 w-4 ${isActive("/categories") ? "text-[#4F46E5]" : "opacity-40"}`} />
              </Link>

              {/* Pricing */}
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                  isActive("/pricing")
                    ? "bg-[#F7F6FF] text-[#4F46E5] font-bold border border-[#E0DEFC]"
                    : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F1F1F8]"
                }`}
              >
                <span>Pricing</span>
                <ArrowRight className={`h-4 w-4 ${isActive("/pricing") ? "text-[#4F46E5]" : "opacity-40"}`} />
              </Link>
            </div>

            <div className="pt-2 border-t border-[#E6E6F0] flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full text-xs font-semibold justify-center"
                >
                  Sign In
                </Button>
              </Link>

              <Link href="/submit" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Plus className="h-4 w-4" />}
                  className="w-full font-bold text-xs justify-center"
                >
                  Submit Product
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};
