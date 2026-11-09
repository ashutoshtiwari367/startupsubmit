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

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Today's Launches", href: "/" },
    { label: "Hall of Winners", href: "/winners" },
    { label: "Categories", href: "/categories" },
    { label: "Pricing", href: "/pricing" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#E8E8E3] bg-[#FAFAF7]/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          {/* Brand Logo & Tag */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#5B5BF0] text-white shadow-[0_2px_8px_rgba(91,91,240,0.3)] group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-extrabold tracking-tight text-[#0F0F10]">
                  LaunchOS
                </span>
                <span className="rounded-full bg-[#EEF0FE] px-2 py-0.5 text-[10px] font-bold text-[#5B5BF0]">
                  [BRAND]
                </span>
              </div>
              <p className="text-[11px] text-[#66666B] font-mono leading-none">
                Product Launch Directory
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Routes */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-[#E8E8E3] bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    active
                      ? "bg-[#5B5BF0] text-white shadow-[0_2px_8px_rgba(91,91,240,0.25)]"
                      : "text-[#66666B] hover:text-[#0F0F10] hover:bg-[#FAFAF7]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action CTAs & Controls */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAuthModal(true)}
              className="text-xs font-semibold"
            >
              Sign In
            </Button>

            <Link href="/submit">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                className="font-bold text-xs shadow-[0_2px_8px_rgba(91,91,240,0.25)]"
              >
                Submit Product
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-[8px] border border-[#E8E8E3] bg-white text-[#0F0F10]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#E8E8E3] bg-white px-4 py-4 space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-[8px] text-sm font-bold flex items-center justify-between ${
                    isActive(link.href)
                      ? "bg-[#EEF0FE] text-[#5B5BF0]"
                      : "text-[#66666B] hover:bg-[#FAFAF7]"
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="h-4 w-4 opacity-40" />
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E8E8E3] flex flex-col gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowAuthModal(true);
                }}
                className="w-full text-xs font-semibold justify-center"
              >
                Sign In
              </Button>

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
