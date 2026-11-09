"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Pill } from "@/components/Pill";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { Input } from "@/components/Input";
import { UpvoteButton } from "@/components/UpvoteButton";
import { SectionHeader } from "@/components/SectionHeader";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedSponsors } from "@/components/FeaturedSponsors";
import { TrendingSection } from "@/components/TrendingSection";
import { LaunchingNowSection } from "@/components/LaunchingNowSection";
import { ProductCard } from "@/components/ProductCard";
import { LatestWinnersSection } from "@/components/LatestWinnersSection";
import { BrowseByCategorySection } from "@/components/BrowseByCategorySection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { PricingSection } from "@/components/PricingSection";
import { FAQSection } from "@/components/FAQSection";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, LaunchProduct } from "@/lib/mock-data";
import {
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Copy,
  Layers,
  Palette,
  Type,
  Grid,
  Zap,
  Calendar,
  Filter,
  X,
  Compass,
  Code2,
  Check,
} from "lucide-react";

export default function DesignFoundationPreview() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"directory" | "components" | "tokens">("directory");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<LaunchProduct[]>(MOCK_PRODUCTS);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const directoryRef = useRef<HTMLDivElement>(null);

  // New product submit state for demo
  const [submitForm, setSubmitForm] = useState({
    name: "",
    tagline: "",
    url: "",
    category: "AI & Agents",
    pricing: "Free Trial" as const,
  });

  const copyToken = (val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedHex(val);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleUpvote = (productId: string, isUpvoted: boolean) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            upvotes: isUpvoted ? item.upvotes + 1 : item.upvotes - 1,
            isUpvoted,
          };
        }
        return item;
      })
    );
  };

  const scrollToDirectory = () => {
    setActiveTab("directory");
    setTimeout(() => {
      directoryRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === "all" || p.category === activeCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const todayProducts = useMemo(
    () => filteredProducts.filter((p) => p.launchDate === "today"),
    [filteredProducts]
  );

  const yesterdayProducts = useMemo(
    () => filteredProducts.filter((p) => p.launchDate === "yesterday"),
    [filteredProducts]
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F0F10] selection:bg-[#5B5BF0]/15 selection:text-[#5B5BF0]">
      {/* Brand Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E8E8E3] bg-[#FAFAF7]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#5B5BF0] text-white shadow-[0_2px_8px_rgba(91,91,240,0.3)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-extrabold tracking-tight text-[#0F0F10]">
                  LaunchOS
                </span>
                <span className="rounded-full bg-[#EEF0FE] px-2 py-0.5 text-[10px] font-bold text-[#4338CA]">
                  [BRAND]
                </span>
              </div>
              <p className="text-[11px] text-[#66666B] font-mono">Product Launch Directory</p>
            </div>
          </div>

          {/* Navigation Mode Switcher Pills */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-[#E8E8E3] bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <button
              onClick={() => setActiveTab("directory")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "directory"
                  ? "bg-[#5B5BF0] text-white shadow-[0_2px_8px_rgba(91,91,240,0.25)]"
                  : "text-[#66666B] hover:text-[#0F0F10]"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              Live Directory
            </button>
            <Link
              href="/winners"
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#66666B] hover:text-[#0F0F10] transition-colors"
            >
              Hall of Winners
            </Link>
            <Link
              href="/categories"
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#66666B] hover:text-[#0F0F10] transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#66666B] hover:text-[#0F0F10] transition-colors"
            >
              Pricing
            </Link>
            <button
              onClick={() => setActiveTab("components")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "components"
                  ? "bg-[#5B5BF0] text-white shadow-[0_2px_8px_rgba(91,91,240,0.25)]"
                  : "text-[#66666B] hover:text-[#0F0F10]"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Matrix
            </button>
            <button
              onClick={() => setActiveTab("tokens")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "tokens"
                  ? "bg-[#5B5BF0] text-white shadow-[0_2px_8px_rgba(91,91,240,0.25)]"
                  : "text-[#66666B] hover:text-[#0F0F10]"
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              Tokens
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
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
                className="font-bold text-xs"
              >
                Submit Product
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION FOR [BRAND] */}
      <HeroSection
        onSubmitClick={() => router.push("/submit")}
        onBrowseClick={scrollToDirectory}
      />

      {/* FEATURED SPONSORS SECTION */}
      <FeaturedSponsors
        onReserveClick={() => router.push("/submit")}
      />

      {/* TRENDING TODAY CAROUSEL SECTION */}
      <TrendingSection
        onViewAllClick={scrollToDirectory}
        onProductClick={() => router.push("/product/p-1")}
      />

      {/* Main Content Area (Max width 1200px, 8px grid) */}
      <main ref={directoryRef} className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12 space-y-12">
        {/* TAB 1: LIVE DIRECTORY EXPERIENCE */}
        {activeTab === "directory" && (
          <div className="space-y-12 animate-in fade-in duration-200">
            {/* MAIN LAUNCHING NOW LEADERBOARD SECTION */}
            <LaunchingNowSection />

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 border-t border-[#E8E8E3]">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
                {MOCK_CATEGORIES.map((cat) => (
                  <Pill
                    key={cat.id}
                    active={activeCategory === cat.id}
                    count={cat.count}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.label}
                  </Pill>
                ))}
              </div>

              {/* Search Box */}
              <div className="w-full md:w-72 shrink-0">
                <Input
                  placeholder="Filter launches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  showClear
                  onClear={() => setSearchQuery("")}
                />
              </div>
            </div>

            {/* TODAY'S LAUNCHES SECTION */}
            <div className="space-y-4">
              <SectionHeader
                badge={<Badge variant="live" size="sm">LIVE ARCHIVE FEED</Badge>}
                title="All Community Launches Today"
                description="Browse every product submitted today with instant founder links."
                action={
                  <div className="text-xs font-mono text-[#8E8E93] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Resets at midnight PST
                  </div>
                }
              />

              {todayProducts.length === 0 ? (
                <div className="rounded-[14px] border border-[#E8E8E3] bg-white p-8 text-center text-[#66666B]">
                  No products found matching "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-3">
                  {todayProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      variant="row"
                      product={{
                        id: product.id,
                        name: product.name,
                        tagline: product.tagline,
                        category: product.category,
                        upvotes: product.upvotes,
                        isUpvoted: product.isUpvoted,
                        rank: product.rank,
                        commentsCount: product.commentsCount,
                        url: `/product/${product.id}`,
                        initials: product.name.split(" ").map((n) => n[0]).join(""),
                        avatarGradient: "from-[#5B5BF0] to-[#7E7EF6]",
                        badgeEarned: product.rank === 1 ? "#1 Product of the Day" : undefined,
                        maker: {
                          name: product.founder.name,
                          avatarInitials: product.founder.name.split(" ").map((n) => n[0]).join(""),
                          avatarColor: "bg-[#5B5BF0]",
                          role: product.founder.role,
                        },
                      }}
                      onUpvoteToggle={(id, isVoted) => handleUpvote(id, isVoted)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* BROWSE BY CATEGORY SECTION (10 CATEGORIES GRID) */}
            <BrowseByCategorySection
              onCategorySelect={(catId) => {
                const mapping: Record<string, string> = {
                  "ai-ml": "AI & Agents",
                  "developer-tools": "Developer Tools",
                  "productivity": "Productivity",
                  "design-art": "Design & UX",
                  "finance-fintech": "Analytics & Data",
                };
                if (mapping[catId]) {
                  setActiveCategory(mapping[catId]);
                }
                scrollToDirectory();
              }}
            />

            {/* HOW IT WORKS SECTION (3 NUMBERED STEPS + BENTO BENEFITS GRID) */}
            <HowItWorksSection />

            {/* LATEST WINNERS SECTION (3-COLUMN TROPHY CARDS) */}
            <LatestWinnersSection
              onSeeAllWinnersClick={scrollToDirectory}
              onViewLaunchClick={() => router.push("/product/p-1")}
            />

            {/* TESTIMONIALS SECTION (STATS BAR COUNT-UP + MASONRY TWEET CARDS) */}
            <TestimonialsSection />

            {/* PRICING SECTION (3 PLANS: FREE, PREMIUM LAUNCH, FEATURED) */}
            <PricingSection
              onSelectPlan={() => router.push("/submit")}
            />

            {/* FAQ SECTION (6 QUESTIONS ACCORDION + CONTACT CARD) */}
            <FAQSection
              onContactClick={() => {
                alert("Editorial Team Support: team@launchos.com (Avg response: <2h)");
              }}
            />
          </div>
        )}

        {/* TAB 2: COMPONENT MATRIX PLAYGROUND */}
        {activeTab === "components" && (
          <section className="space-y-10 animate-in fade-in duration-200">
            <SectionHeader
              badge={<Badge variant="accent" size="sm" icon={<Layers className="h-3 w-3" />}>REUSABLE PRIMITIVES</Badge>}
              title="Component Library Matrix"
              description="Each primitive adheres to the 10px/14px radii, layered shadow system, and accessible contrast."
            />

            {/* 1. REUSABLE PRODUCTCARD (3 VARIANTS: PODIUM, GRID, ROW) */}
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>1. ProductCard Component (3 Variants)</CardTitle>
                  <span className="font-mono text-xs text-[#8E8E93]">components/ProductCard.tsx</span>
                </div>
                <CardDescription>
                  Podium (large), Row (compact), and Grid (medium) variants featuring rounded-xl logos, "by Maker" avatars, category pills, truncated 1-line taglines, upvote pills, comment counts, external link triggers, focus rings, and "Badge earned" winner ribbons. Tested on light cards and 360px mobile width.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Variant A: Podium (Large) */}
                <div>
                  <span className="text-xs font-mono text-[#8E8E93] block mb-3 uppercase tracking-wider font-semibold">
                    Variant 1: Podium (Large) with Gold Rank & "Badge Earned" Ribbon
                  </span>
                  <div className="max-w-md">
                    <ProductCard
                      variant="podium"
                      product={{
                        id: "demo-podium",
                        name: "Cortex AI",
                        tagline: "Autonomous customer success agents for modern B2B SaaS teams. Integrates with docs in 5 mins.",
                        category: "AI & Agents",
                        upvotes: 384,
                        isUpvoted: true,
                        rank: 1,
                        commentsCount: 42,
                        url: "https://cortex.ai",
                        initials: "CA",
                        avatarGradient: "from-[#5B5BF0] to-[#7E7EF6]",
                        badgeEarned: "#1 Product of the Day",
                        maker: {
                          name: "Austin Miller",
                          avatarInitials: "AM",
                          avatarColor: "bg-[#5B5BF0]",
                          role: "Founder",
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Variant B: Grid (Medium) */}
                <div>
                  <span className="text-xs font-mono text-[#8E8E93] block mb-3 uppercase tracking-wider font-semibold">
                    Variant 2: Grid (Medium) 2-Column Responsive Layout
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProductCard
                      variant="grid"
                      product={{
                        id: "demo-grid-1",
                        name: "VectorFlow",
                        tagline: "Instant vector database deployment with zero cold starts and real-time semantic caching.",
                        category: "Developer Tools",
                        upvotes: 279,
                        isUpvoted: false,
                        rank: 2,
                        commentsCount: 31,
                        url: "https://vectorflow.dev",
                        initials: "VF",
                        avatarGradient: "from-[#059669] to-[#34D399]",
                        badgeEarned: "2nd Place Winner",
                        maker: {
                          name: "Elena Rostova",
                          avatarInitials: "ER",
                          avatarColor: "bg-[#059669]",
                          role: "CTO",
                        },
                      }}
                    />
                    <ProductCard
                      variant="grid"
                      product={{
                        id: "demo-grid-2",
                        name: "Prism Studio",
                        tagline: "Turn design system tokens into production React code with bi-directional Figma sync.",
                        category: "Design & UX",
                        upvotes: 215,
                        isUpvoted: false,
                        rank: 3,
                        commentsCount: 19,
                        url: "https://prismstudio.design",
                        initials: "PS",
                        avatarGradient: "from-[#D97706] to-[#FBBF24]",
                        maker: {
                          name: "Devon Vance",
                          avatarInitials: "DV",
                          avatarColor: "bg-[#D97706]",
                          role: "Designer",
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Variant C: Row (Compact) + 360px Mobile Constraint Preview */}
                <div>
                  <span className="text-xs font-mono text-[#8E8E93] block mb-3 uppercase tracking-wider font-semibold">
                    Variant 3: Row (Compact) & Mobile (360px Width Simulation)
                  </span>
                  <div className="space-y-4">
                    {/* Desktop full width row */}
                    <ProductCard
                      variant="row"
                      product={{
                        id: "demo-row-1",
                        name: "PulseGrid Monitoring",
                        tagline: "Minimalist server health and cron monitoring with instant Slack and Telegram webhooks.",
                        category: "Productivity",
                        upvotes: 168,
                        rank: 4,
                        commentsCount: 14,
                        url: "https://pulsegrid.io",
                        initials: "PG",
                        avatarGradient: "from-[#4338CA] to-[#6366F1]",
                        badgeEarned: "Staff Pick",
                        maker: {
                          name: "Marcus Chen",
                          avatarInitials: "MC",
                          avatarColor: "bg-[#4338CA]",
                        },
                      }}
                    />

                    {/* 360px mobile preview container */}
                    <div className="p-4 rounded-[12px] border border-dashed border-[#E8E8E3] bg-[#FAFAF7]">
                      <span className="text-[11px] font-mono text-[#8E8E93] block mb-2">
                        📱 STRICT 360px MOBILE VIEWPORT CONSTRAINT TEST:
                      </span>
                      <div className="w-[360px] max-w-full">
                        <ProductCard
                          variant="row"
                          product={{
                            id: "demo-row-360",
                            name: "PromptSmith AI",
                            tagline: "Automated latency regression testing and cost optimization for LLM prompts.",
                            category: "AI & Agents",
                            upvotes: 142,
                            rank: 5,
                            commentsCount: 18,
                            url: "https://promptsmith.ai",
                            initials: "PM",
                            avatarGradient: "from-[#7C3AED] to-[#A78BFA]",
                            maker: {
                              name: "Sarah Jenkins",
                              avatarInitials: "SJ",
                              avatarColor: "bg-[#7C3AED]",
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. BUTTONS */}
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>2. Button Component</CardTitle>
                  <span className="font-mono text-xs text-[#8E8E93]">components/Button.tsx</span>
                </div>
                <CardDescription>
                  10px button radius, Electric Indigo (#5B5BF0) primary with hover lift, secondary with soft border, ghost, and loading states.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-xs font-mono text-[#8E8E93] block mb-2">VARIANTS:</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" size="md" leftIcon={<Sparkles className="h-4 w-4" />}>
                      Primary Button
                    </Button>
                    <Button variant="secondary" size="md">
                      Secondary Action
                    </Button>
                    <Button variant="ghost" size="md">
                      Ghost Button
                    </Button>
                    <Button variant="accent-soft" size="md">
                      Soft Indigo
                    </Button>
                    <Button variant="destructive" size="md">
                      Destructive
                    </Button>
                    <Button variant="primary" size="md" isLoading>
                      Loading
                    </Button>
                    <Button variant="secondary" size="md" disabled>
                      Disabled
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E8E3]">
                  <span className="text-xs font-mono text-[#8E8E93] block mb-2">SIZES (SM: 32px, MD: 40px, LG: 48px, ICON):</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" size="sm">Small (32px)</Button>
                    <Button variant="secondary" size="md">Medium (40px)</Button>
                    <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Large (48px)
                    </Button>
                    <Button variant="secondary" size="icon">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. UPVOTE BUTTON */}
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>3. UpvoteButton Component</CardTitle>
                  <span className="font-mono text-xs text-[#8E8E93]">components/UpvoteButton.tsx</span>
                </div>
                <CardDescription>
                  Signature product launch directory interaction. Click any button to test count increment and electric indigo illumination.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-3">
                    <span className="text-xs font-mono text-[#8E8E93] block">VERTICAL DIRECTORY CARD FORMAT (SM / MD / LG):</span>
                    <div className="flex items-end gap-4">
                      <div className="text-center">
                        <UpvoteButton count={94} size="sm" />
                        <span className="text-[10px] text-[#8E8E93] mt-1 block">Small</span>
                      </div>
                      <div className="text-center">
                        <UpvoteButton count={384} isUpvoted={true} size="md" />
                        <span className="text-[10px] text-[#5B5BF0] font-semibold mt-1 block">Active MD</span>
                      </div>
                      <div className="text-center">
                        <UpvoteButton count={1420} size="lg" />
                        <span className="text-[10px] text-[#8E8E93] mt-1 block">Large 1.4k</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-mono text-[#8E8E93] block">HORIZONTAL TABLE / COMPACT ROW FORMAT:</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <UpvoteButton count={42} orientation="horizontal" size="sm" />
                      <UpvoteButton count={215} orientation="horizontal" isUpvoted={true} size="md" />
                      <UpvoteButton count={890} orientation="horizontal" size="lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4 & 5. BADGES & PILLS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>4. Badge Component</CardTitle>
                  <CardDescription>
                    Full-round badges including the Gold/Silver/Bronze rank set.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="gold" rankNumber={1}>#1 Product of the Day</Badge>
                    <Badge variant="silver" rankNumber={2}>#2 Runner Up</Badge>
                    <Badge variant="bronze" rankNumber={3}>#3 Bronze Pick</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="live">Live Now</Badge>
                    <Badge variant="accent">Electric Indigo</Badge>
                    <Badge variant="neutral">Verified</Badge>
                    <Badge variant="dark">Founder</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle>5. Pill Component</CardTitle>
                  <CardDescription>
                    Category filters and interactive tags with counters.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill active count={42}>All Products</Pill>
                    <Pill count={18}>AI & Agents</Pill>
                    <Pill count={12}>Developer Tools</Pill>
                    <Pill size="sm" onRemove={() => alert("Tag dismissed")}>
                      Dismissible
                    </Pill>
                  </div>
                  <p className="text-xs text-[#8E8E93]">
                    Clickable, keyboard accessible, with dynamic count badges.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 6 & 7. AVATAR & INPUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>6. Avatar Component</CardTitle>
                  <CardDescription>
                    Squircle (10px) for SaaS apps; circle for founders.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar name="Cortex AI" shape="squircle" size="xl" status="online" />
                    <Avatar name="Vector Flow" shape="squircle" size="lg" />
                    <Avatar name="Austin Miller" shape="circle" size="md" status="online" />
                    <Avatar name="Elena Rostova" shape="circle" size="sm" />
                    <Avatar name="Marcus Chen" shape="circle" size="xs" />
                  </div>
                  <div className="text-xs text-[#66666B]">
                    Built-in deterministic gradient generator when no image URL is provided.
                  </div>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle>7. Input Component</CardTitle>
                  <CardDescription>
                    10px radius, Electric Indigo focus ring, search prefixes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Search AI agents, devtools, design systems..."
                    leftIcon={<Search className="h-4 w-4" />}
                    showClear
                    value="Vector database"
                  />
                  <Input
                    placeholder="https://yourproduct.com"
                    helperText="Enter a live URL for your SaaS or AI tool."
                  />
                </CardContent>
              </Card>
            </div>

            {/* 8. SECTION HEADER */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>8. SectionHeader Component</CardTitle>
                <CardDescription>
                  14px card container paired with tight letter-spacing section headers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-[10px] border border-[#E8E8E3] bg-[#FAFAF7] p-5">
                  <SectionHeader
                    badge={<Badge variant="accent" size="sm">HEADER DEMO</Badge>}
                    title="SectionHeader with Kicker Badge & Action"
                    description="Letter spacing set to -0.03em on headings for a modern, crisp feel."
                    action={
                      <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                        Explore
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* 9. BROWSE BY CATEGORY GRID */}
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>9. Browse by Category Grid (10 Ecosystem Cards)</CardTitle>
                  <span className="font-mono text-xs text-[#8E8E93]">components/BrowseByCategorySection.tsx</span>
                </div>
                <CardDescription>
                  4-col desktop / 2-col mobile grid. Each card features a colorful icon in a rounded square (rounded-[10px]), category name, tool count, subtle tint per category, and an animated hover arrow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrowseByCategorySection />
              </CardContent>
            </Card>

            {/* 10. HOW IT WORKS & BENTO BENEFITS GRID */}
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>10. How It Works & Bento Benefits Grid</CardTitle>
                  <span className="font-mono text-xs text-[#8E8E93]">components/HowItWorksSection.tsx</span>
                </div>
                <CardDescription>
                  3 numbered steps connected with dashed lines and illustration-style icon cards, plus a 6-card bento grid with a highlighted DR 72+ backlink benefit card.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HowItWorksSection />
              </CardContent>
            </Card>

            {/* 11. TESTIMONIALS & STATS BAR */}
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>11. Testimonials & Animated Stats Bar</CardTitle>
                  <span className="font-mono text-xs text-[#8E8E93]">components/TestimonialsSection.tsx</span>
                </div>
                <CardDescription>
                  Live count-up stats bar (30,000+ users, 5,000+ launches, DR 72+, 1M+ visits) with a responsive masonry grid of 6 tweet-style cards with subtle X icons and badges.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TestimonialsSection />
              </CardContent>
            </Card>

            {/* 12. PRICING TEASER MATRIX */}
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>12. Compact Pricing Plans</CardTitle>
                  <span className="font-mono text-xs text-[#8E8E93]">components/PricingSection.tsx</span>
                </div>
                <CardDescription>
                  3 plans (Free, Premium Launch [highlighted with Electric Indigo border & Most Popular badge], Featured Spotlight) with full feature checklist and CTAs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PricingSection />
              </CardContent>
            </Card>

            {/* 13. FAQ ACCORDION */}
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>13. FAQ Accordion & Contact Module</CardTitle>
                  <span className="font-mono text-xs text-[#8E8E93]">components/FAQSection.tsx</span>
                </div>
                <CardDescription>
                  Smooth open/close accordion with 6 key founder questions and two-column layout featuring a sticky direct editorial contact card.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FAQSection />
              </CardContent>
            </Card>
          </section>
        )}

        {/* TAB 3: DESIGN TOKEN SPECS */}
        {activeTab === "tokens" && (
          <section className="space-y-8 animate-in fade-in duration-200">
            <SectionHeader
              badge={<Badge variant="accent" size="sm" icon={<Palette className="h-3 w-3" />}>DESIGN TOKENS</Badge>}
              title="Design System Token Specifications"
              description="Click any swatch to copy its hex value or Tailwind class."
            />

            {/* Color Swatches Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: "Warm Canvas", hex: "#FAFAF7", tw: "bg-[#FAFAF7]", desc: "Main Background" },
                { name: "Card White", hex: "#FFFFFF", tw: "bg-white", desc: "Surface Elevation" },
                { name: "Near-Black Ink", hex: "#0F0F10", tw: "text-[#0F0F10]", desc: "Primary Text" },
                { name: "Electric Indigo", hex: "#5B5BF0", tw: "bg-[#5B5BF0]", desc: "Single Bold Accent" },
                { name: "Soft Border", hex: "#E8E8E3", tw: "border-[#E8E8E3]", desc: "Borders & Dividers" },
                { name: "Gold Rank", hex: "#B45309", tw: "text-[#B45309]", desc: "#1 Leaderboard" },
                { name: "Silver Rank", hex: "#475569", tw: "text-[#475569]", desc: "#2 Leaderboard" },
                { name: "Bronze Rank", hex: "#9A3412", tw: "text-[#9A3412]", desc: "#3 Leaderboard" },
                { name: "Live Emerald", hex: "#10B981", tw: "bg-[#10B981]", desc: "Live Indicator" },
                { name: "Muted Text", hex: "#66666B", tw: "text-[#66666B]", desc: "Subheadings" },
                { name: "Subtle Text", hex: "#8E8E93", tw: "text-[#8E8E93]", desc: "Metadata & Timestamps" },
                { name: "Border Hover", hex: "#D5D5CE", tw: "border-[#D5D5CE]", desc: "Interactive Hover" },
              ].map((token) => (
                <div
                  key={token.hex + token.name}
                  onClick={() => copyToken(token.hex)}
                  className="group cursor-pointer rounded-[14px] border border-[#E8E8E3] bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                >
                  <div
                    className="h-14 w-full rounded-[10px] border flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                    style={{
                      backgroundColor: token.hex,
                      borderColor: token.hex === "#FFFFFF" || token.hex === "#FAFAF7" ? "#E8E8E3" : token.hex,
                      color: token.hex === "#FFFFFF" || token.hex === "#FAFAF7" ? "#0F0F10" : "#FFFFFF",
                    }}
                  >
                    {copiedHex === token.hex ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold">
                        <Check className="h-3 w-3" /> Copied!
                      </span>
                    ) : (
                      <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-75 transition-opacity" />
                    )}
                  </div>
                  <div className="mt-2.5">
                    <span className="font-heading font-semibold text-xs text-[#0F0F10] truncate block">
                      {token.name}
                    </span>
                    <div className="flex items-center justify-between mt-0.5 font-mono text-[11px] text-[#66666B]">
                      <span>{token.hex}</span>
                      <span className="text-[10px] text-[#8E8E93]">{token.desc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Typography & Radii Specs Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>Typography Specimen</CardTitle>
                  <CardDescription>Plus Jakarta Sans (Headings) & Inter (Body)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-b border-[#E8E8E3] pb-3">
                    <span className="text-xs font-mono text-[#8E8E93]">H1 DISPLAY (36px–64px / -0.035em):</span>
                    <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0F0F10] tracking-[-0.035em]">
                      Launch your product. Get seen. Get backlinks.
                    </h1>
                  </div>
                  <div className="border-b border-[#E8E8E3] pb-3">
                    <span className="text-xs font-mono text-[#8E8E93]">H2 SECTION (24px–30px / -0.03em):</span>
                    <h2 className="font-heading text-xl font-bold text-[#0F0F10] tracking-[-0.03em]">
                      Curated Daily Product Directory
                    </h2>
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[#8E8E93]">BODY INTER (14px–16px / Relaxed):</span>
                    <p className="text-sm text-[#66666B] leading-relaxed">
                      Every founder deserves a fair, transparent launchpad. Community upvotes dictate rank, verified with fraud-resistant telemetry.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle>Radii & Elevation System</CardTitle>
                  <CardDescription>Organic curvature and very soft, layered shadows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between p-3 rounded-[10px] border border-[#E8E8E3] bg-[#FAFAF7]">
                    <span className="text-[#0F0F10] font-semibold">14px Radius (Cards)</span>
                    <span className="text-[#66666B]">rounded-[14px]</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[10px] border border-[#E8E8E3] bg-[#FAFAF7]">
                    <span className="text-[#0F0F10] font-semibold">10px Radius (Buttons & Inputs)</span>
                    <span className="text-[#66666B]">rounded-[10px]</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[10px] border border-[#E8E8E3] bg-[#FAFAF7]">
                    <span className="text-[#0F0F10] font-semibold">Full Round (Pills & Badges)</span>
                    <span className="text-[#66666B]">rounded-full</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[10px] border border-[#E8E8E3] bg-[#FAFAF7]">
                    <span className="text-[#0F0F10] font-semibold">Layered Shadow</span>
                    <span className="text-[#66666B]">0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.05)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* SUBMIT PRODUCT MODAL DEMO */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg rounded-[14px] border border-[#E8E8E3] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-[#8E8E93] hover:text-[#0F0F10] hover:bg-[#FAFAF7] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-4">
                <SectionHeader
                  badge={<Badge variant="accent" size="sm">FOUNDER SUBMISSION</Badge>}
                  title="Submit Product to [BRAND]"
                  description="Launch your SaaS or AI product to thousands of daily founders."
                />

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F0F10] mb-1">
                      Product Name
                    </label>
                    <Input
                      placeholder="e.g. Supaship"
                      value={submitForm.name}
                      onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F0F10] mb-1">
                      One-line Tagline
                    </label>
                    <Input
                      placeholder="e.g. Next.js boilerplate for SaaS founders"
                      value={submitForm.tagline}
                      onChange={(e) => setSubmitForm({ ...submitForm, tagline: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F0F10] mb-1">
                      Product URL
                    </label>
                    <Input
                      placeholder="https://yourproduct.com"
                      value={submitForm.url}
                      onChange={(e) => setSubmitForm({ ...submitForm, url: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F0F10] mb-1">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["AI & Agents", "Developer Tools", "Productivity", "Design & UX"].map((cat) => (
                        <Pill
                          key={cat}
                          size="sm"
                          active={submitForm.category === cat}
                          onClick={() => setSubmitForm({ ...submitForm, category: cat })}
                        >
                          {cat}
                        </Pill>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E8E8E3]">
                  <Button variant="ghost" size="sm" onClick={() => setShowSubmitModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (!submitForm.name) {
                        alert("Please enter a product name");
                        return;
                      }
                      const newProduct: LaunchProduct = {
                        id: `p-${Date.now()}`,
                        name: submitForm.name,
                        tagline: submitForm.tagline || "Freshly submitted SaaS product",
                        description: "New launch on the directory.",
                        category: submitForm.category as any,
                        upvotes: 1,
                        isUpvoted: true,
                        commentsCount: 0,
                        pricing: submitForm.pricing,
                        launchDate: "today",
                        founder: {
                          name: "You (Founder)",
                          handle: "@founder",
                          role: "Maker",
                        },
                        tags: [submitForm.category, "New"],
                      };
                      setProducts([newProduct, ...products]);
                      setShowSubmitModal(false);
                      setSubmitForm({ name: "", tagline: "", url: "", category: "AI & Agents", pricing: "Free Trial" });
                      setActiveTab("directory");
                    }}
                  >
                    Launch Today
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FULL-WIDTH FINAL CTA BAND */}
      <FinalCTA
        onSubmitClick={() => router.push("/submit")}
        onBrowseClick={scrollToDirectory}
      />

      {/* COMPREHENSIVE DIRECTORY FOOTER */}
      <Footer
        onSubmitClick={() => router.push("/submit")}
      />

      {/* SIGN IN / SIGN UP MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
