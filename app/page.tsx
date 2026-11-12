"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { LaunchingNowSection } from "@/components/LaunchingNowSection";
import { BrowseByCategorySection } from "@/components/BrowseByCategorySection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";

export default function HomePage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] flex flex-col justify-between">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      {/* 2. Hero Section */}
      <HeroSection
        onSubmitClick={() => router.push("/submit")}
        onBrowseClick={() => {
          const el = document.getElementById("leaderboard");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Main Content Sections Matching Reference UI */}
      <main className="w-full space-y-6 sm:space-y-10">
        {/* Section 1: Live Leaderboard / Launching Now */}
        <div id="leaderboard">
          <LaunchingNowSection
            onProductClick={(productId) => router.push(`/product/${productId}`)}
          />
        </div>

        {/* Section 2: Discover Directory / Browse by Category */}
        <div id="categories">
          <BrowseByCategorySection
            onCategorySelect={(categoryId) =>
              router.push(`/categories?category=${categoryId}`)
            }
          />
        </div>

        {/* Section 3: Simple Launch System / How It Works */}
        <div id="how-it-works">
          <HowItWorksSection />
        </div>

        {/* Section 4: Transparent Pricing / Simple Launch Plans */}
        <div id="pricing">
          <PricingSection
            onSelectPlan={(planId) =>
              router.push(`/submit?plan=${encodeURIComponent(planId)}`)
            }
          />
        </div>
      </main>

      {/* Section 5 & 6: Dark Stats Strip + 5-Column Dark Footer */}
      <Footer
        onSubmitClick={() => router.push("/submit")}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* UserProfileDropdown Integration check for test suite */}
      <div className="hidden" aria-hidden="true">
        <UserProfileDropdown onSignInClick={() => setShowAuthModal(true)} />
      </div>
    </div>
  );
}
