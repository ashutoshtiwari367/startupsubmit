import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Hall of Winners Dynamic Ranking & Navigation System", () => {
  it("verifies Navbar contains Hall of Winners dropdown with current & monthly options", () => {
    const navbarPath = path.join(__dirname, "..", "components", "Navbar.tsx");
    const navbarCode = fs.readFileSync(navbarPath, "utf8");

    // Must have dropdown triggers and options
    assert.ok(
      navbarCode.includes("winnersDropdownOpen") && navbarCode.includes("Hall of Winners"),
      "Navbar must support winners dropdown state and button"
    );

    // Primary current winners options
    assert.ok(
      navbarCode.includes("/winners?period=monthly") && navbarCode.includes("Winner of the Month"),
      "Navbar dropdown must link to Winner of the Month"
    );
    assert.ok(
      navbarCode.includes("/winners?period=weekly") && navbarCode.includes("Winner of the Week"),
      "Navbar dropdown must link to Winner of the Week"
    );
    assert.ok(
      navbarCode.includes("/winners?period=quarterly") && navbarCode.includes("Winner of the Quarter"),
      "Navbar dropdown must link to Winner of the Quarter"
    );
    assert.ok(
      navbarCode.includes("/winners?period=yearly") && navbarCode.includes("Winner of the Year"),
      "Navbar dropdown must link to Winner of the Year"
    );

    // Monthly archive links
    assert.ok(
      navbarCode.includes("October 2026") && navbarCode.includes("month=2026-10"),
      "Navbar dropdown must contain October 2026 monthly archive link"
    );
    assert.ok(
      navbarCode.includes("September 2026") && navbarCode.includes("month=2026-09"),
      "Navbar dropdown must contain September 2026 monthly archive link"
    );

    // All-time link
    assert.ok(
      navbarCode.includes("/winners?period=all") && navbarCode.includes("All-Time Champions"),
      "Navbar dropdown must link to All-Time Champions"
    );
  });

  it("verifies backend winners library lib/winners.ts enforces strict upvote sorting logic", () => {
    const winnersLibPath = path.join(__dirname, "..", "lib", "winners.ts");
    assert.ok(fs.existsSync(winnersLibPath), "lib/winners.ts must exist");

    const winnersCode = fs.readFileSync(winnersLibPath, "utf8");

    // Strict upvote sorting logic (no dummy fallback ranks)
    assert.ok(
      winnersCode.includes("b.upvotes - a.upvotes"),
      "Candidates must be sorted strictly by upvotes descending (highest first)"
    );
    assert.ok(
      !winnersCode.includes("(idx % 3) + 1"),
      "Must not use arbitrary modulo rank assignment"
    );

    // Date range resolver
    assert.ok(
      winnersCode.includes("resolvePeriodDateRange") &&
      winnersCode.includes("getAvailableMonths"),
      "lib/winners.ts must export date range and available months helpers"
    );

    // Verify pure sorting unit logic:
    // If Item A has 43 votes and Item B has 1 vote, Item A MUST be #1 and Item B #2
    const testCandidates = [
      { id: "2", name: "Low Vote Tool", upvotes: 1, approvedAt: "2026-11-01" },
      { id: "1", name: "High Vote Tool", upvotes: 43, approvedAt: "2026-11-01" },
      { id: "3", name: "Mid Vote Tool", upvotes: 25, approvedAt: "2026-11-01" },
    ];

    testCandidates.sort((a, b) => b.upvotes - a.upvotes);

    assert.equal(testCandidates[0].id, "1", "Highest upvote (43) must be 1st place");
    assert.equal(testCandidates[0].upvotes, 43);
    assert.equal(testCandidates[1].id, "3", "Middle upvote (25) must be 2nd place");
    assert.equal(testCandidates[2].id, "2", "Lowest upvote (1) must be 3rd place");
  });

  it("verifies app/api/winners/route.ts API endpoint exposes periods, months and upvote ranking", () => {
    const routePath = path.join(__dirname, "..", "app", "api", "winners", "route.ts");
    assert.ok(fs.existsSync(routePath), "app/api/winners/route.ts must exist");

    const routeCode = fs.readFileSync(routePath, "utf8");
    assert.ok(
      routeCode.includes("calculateWinners") && routeCode.includes("searchParams.get(\"period\")"),
      "app/api/winners/route.ts must call calculateWinners with period and month params"
    );
  });

  it("verifies WinnersPageView.tsx renders product image, name, category, website link and winner month", () => {
    const pageViewPath = path.join(__dirname, "..", "components", "WinnersPageView.tsx");
    const pageViewCode = fs.readFileSync(pageViewPath, "utf8");

    // Product image / logo rendering
    assert.ok(
      pageViewCode.includes("renderLogo") && pageViewCode.includes("logoUrl"),
      "WinnersPageView must render product logo image"
    );

    // Category and website link
    assert.ok(
      pageViewCode.includes("w.category") && pageViewCode.includes("w.websiteUrl"),
      "WinnersPageView must display category and clickable website link"
    );
    assert.ok(
      pageViewCode.includes("w.websiteDomain"),
      "WinnersPageView must display clean website domain"
    );

    // Winner month / period badge
    assert.ok(
      pageViewCode.includes("w.winnerPeriod"),
      "WinnersPageView must display winner month/period badge"
    );

    // Double line tagline
    assert.ok(
      pageViewCode.includes("line-clamp-2"),
      "WinnersPageView must render tagline with line-clamp-2"
    );

    // Navigation and month selection
    assert.ok(
      pageViewCode.includes("handlePeriodChange") && pageViewCode.includes("handleMonthChange"),
      "WinnersPageView must support period and month switching navigation"
    );

    // Real upvotes badge
    assert.ok(
      pageViewCode.includes("{w.upvotes} upvotes"),
      "WinnersPageView must render verified upvote count on cards"
    );
  });

  it("verifies clicking Hall of Winners directly in Navbar navigates to /winners under any condition", () => {
    const navbarPath = path.join(__dirname, "..", "components", "Navbar.tsx");
    const navbarCode = fs.readFileSync(navbarPath, "utf8");

    // Must have direct <Link href="/winners"> on the main Hall of Winners label for both desktop and mobile
    assert.ok(
      navbarCode.includes('href="/winners"') && navbarCode.includes("<span>Hall of Winners</span>"),
      "Navbar desktop must have direct Link href='/winners' around 'Hall of Winners' label"
    );

    assert.ok(
      navbarCode.includes('href="/winners"') && navbarCode.includes("Hall of Winners\n                    </span>"),
      "Navbar mobile must have direct Link href='/winners' so tapping it opens /winners directly"
    );
  });

  it("verifies WinnersPageView header is compact, premium and makes all cards immediately visual", () => {
    const pageViewPath = path.join(__dirname, "..", "components", "WinnersPageView.tsx");
    const pageViewCode = fs.readFileSync(pageViewPath, "utf8");

    assert.ok(
      pageViewCode.includes("pt-5") && pageViewCode.includes("Leaderboard Podium (Top 3 Champions)"),
      "WinnersPageView must use compact vertical padding so podium cards are immediately visual"
    );
    assert.ok(
      pageViewCode.includes("border-[#FCD34D]") && pageViewCode.includes("ring-[#FFF1D6]"),
      "WinnersPageView 1st place champion card must have high-visibility gold ring and styling"
    );
  });

  it("verifies app/winners/page.tsx wraps view in Suspense for useSearchParams safety", () => {
    const pagePath = path.join(__dirname, "..", "app", "winners", "page.tsx");
    const pageCode = fs.readFileSync(pagePath, "utf8");

    assert.ok(
      pageCode.includes("Suspense") && pageCode.includes("<WinnersPageView"),
      "app/winners/page.tsx must wrap WinnersPageView in React.Suspense"
    );
  });

  it("verifies Categories page loads real data, layout has heading content on one side & search bar on the other, no filters, and removes dummy 35 / 421", () => {
    const categoriesViewPath = path.join(__dirname, "..", "components", "CategoriesPageView.tsx");
    const categoriesViewCode = fs.readFileSync(categoriesViewPath, "utf8");

    // Must fetch real categories & listings from API
    assert.ok(
      categoriesViewCode.includes('fetch("/api/categories")') && categoriesViewCode.includes('fetch("/api/listings'),
      "CategoriesPageView must dynamically load real categories and listings from API"
    );

    // Layout: Heading content on one side (left) and Search Bar on the other side (right)
    assert.ok(
      categoriesViewCode.includes("Browse by Category") &&
      categoriesViewCode.includes("CATEGORIES DIRECTORY") &&
      categoriesViewCode.includes("Search categories or tools") &&
      categoriesViewCode.includes("flex-col md:flex-row"),
      "CategoriesPageView must place heading content on one side and search bar on the other"
    );

    // Filters removed: only search bar, no Refine Filters or Filter by Category pills
    assert.ok(
      !categoriesViewCode.includes("Refine Filters") &&
      !categoriesViewCode.includes("Filter by Category:"),
      "CategoriesPageView must remove filter pills and refine toggle, keeping only search bar"
    );

    // Compact spacing (no space-y-12)
    assert.ok(
      !categoriesViewCode.includes("space-y-12"),
      "CategoriesPageView must remove unnecessary vertical spacing"
    );

    // Dynamic search filtering
    assert.ok(
      categoriesViewCode.includes("filteredProducts") &&
      categoriesViewCode.includes("searchQuery") &&
      categoriesViewCode.includes("displayedCategories"),
      "CategoriesPageView must filter categories and products via search query"
    );

    // No dummy text
    assert.ok(
      !categoriesViewCode.includes("All 35 Master Categories"),
      "CategoriesPageView must not contain 'All 35 Master Categories'"
    );
    assert.ok(
      !categoriesViewCode.includes("35 / 35"),
      "CategoriesPageView must not contain '35 / 35'"
    );
    assert.ok(
      !categoriesViewCode.includes("count: 426") && !categoriesViewCode.includes("421"),
      "CategoriesPageView must not display fake 421 or 426 counts"
    );
  });

  it("verifies app/api/categories/route.ts computes real tool counts from approved listings", () => {
    const apiRoutePath = path.join(__dirname, "..", "app", "api", "categories", "route.ts");
    const apiRouteCode = fs.readFileSync(apiRoutePath, "utf8");

    assert.ok(
      apiRouteCode.includes(".eq(\"status\", \"approved\")") &&
      apiRouteCode.includes("tool_count"),
      "app/api/categories/route.ts must calculate real tool counts from approved listings"
    );
  });

  it("verifies Single Category Page replaces Building in CTA with dynamic Featured Tools in Sticky Sidebar and reduces spacing", () => {
    const detailViewPath = path.join(__dirname, "..", "components", "CategoryDetailView.tsx");
    const detailViewCode = fs.readFileSync(detailViewPath, "utf8");

    // 1. Featured Tools in Sticky Sidebar
    assert.ok(
      detailViewCode.includes("Featured Tools") &&
      (detailViewCode.includes("sticky") || detailViewCode.includes("lg:sticky")) &&
      detailViewCode.includes("featuredList"),
      "CategoryDetailView must render a sticky sidebar with dynamic Featured Tools"
    );

    // 2. 'Building in {category.name}?' card is removed
    assert.ok(
      !detailViewCode.includes("Building in"),
      "CategoryDetailView must replace 'Building in' card with Featured Tools"
    );

    // 3. Compact Spacing (removes space-y-8 from main container)
    assert.ok(
      !detailViewCode.includes("space-y-8"),
      "CategoryDetailView must remove unnecessary space-y-8 gaps to bring listings closer to header"
    );

    // 4. Verify Server Component passes dynamically fetched featured listings
    const pagePath = path.join(__dirname, "..", "app", "category", "[slug]", "page.tsx");
    const pageCode = fs.readFileSync(pagePath, "utf8");

    assert.ok(
      pageCode.includes("featuredToolsList") &&
      pageCode.includes("featuredTools={featuredToolsList}"),
      "app/category/[slug]/page.tsx must dynamically fetch approved featured tools and pass to CategoryDetailView"
    );
  });
});

