"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Plus,
  Compass,
  Trophy,
  Layers,
  Tag,
  DollarSign,
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

  const navLinks = [
    { label: "Live Directory", href: "/" },
    { label: "Hall of Winners", href: "/winners" },
    { label: "Categories", href: "/categories" },
    { label: "Pricing", href: "/pricing" },
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
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46E5] text-white group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-[#14142B]">
              LaunchOS
            </span>
          </Link>

          {/* Desktop Navigation Routes */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    active
                      ? "bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] "
                      : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F1F1F8] border border-transparent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action CTAs & Controls */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/submit">
              <button
                type="button"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold  transition-all cursor-pointer ${
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                    isActive(link.href)
                      ? "bg-[#F7F6FF] text-[#4F46E5] font-bold border border-[#E0DEFC]"
                      : "text-[#55556E] hover:text-[#14142B] hover:bg-[#F1F1F8]"
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className={`h-4 w-4 ${isActive(link.href) ? "text-[#4F46E5]" : "opacity-40"}`} />
                </Link>
              ))}
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
