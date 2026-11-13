import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Authenticated Upvote & Dynamic Community Ranking System", () => {
  it("verifies migration 0010_upvotes_ranking_system.sql creates listing_upvotes table and RLS policies", () => {
    const migrationPath = path.join(
      __dirname,
      "..",
      "supabase",
      "migrations",
      "0010_upvotes_ranking_system.sql"
    );
    assert.ok(fs.existsSync(migrationPath), "Migration 0010 file must exist");

    const sql = fs.readFileSync(migrationPath, "utf8");
    assert.ok(
      sql.includes("CREATE TABLE IF NOT EXISTS public.listing_upvotes"),
      "Must create public.listing_upvotes table"
    );
    assert.ok(
      sql.includes("uq_listing_upvote_user UNIQUE"),
      "Must enforce 1 vote per user per listing via UNIQUE(listing_id, user_id)"
    );
    assert.ok(
      sql.includes("ENABLE ROW LEVEL SECURITY"),
      "Must enable RLS on listing_upvotes"
    );
    assert.ok(
      sql.includes("auth.uid() = user_id"),
      "Must restrict insert/delete to authenticated user owning the row"
    );
  });

  it("verifies app/api/listings/[slug]/upvote/route.ts strictly gates unauthenticated users with 401", () => {
    const routePath = path.join(
      __dirname,
      "..",
      "app",
      "api",
      "listings",
      "[slug]",
      "upvote",
      "route.ts"
    );
    assert.ok(fs.existsSync(routePath), "Upvote API route must exist");

    const code = fs.readFileSync(routePath, "utf8");
    assert.ok(
      code.includes("requiresAuth: true") && code.includes("status: 401"),
      "POST /api/listings/[slug]/upvote must return 401 and requiresAuth: true for unauthenticated users"
    );
    assert.ok(
      code.includes("toggleListingUpvote"),
      "Must call toggleListingUpvote to atomically toggle upvote"
    );
  });

  it("verifies app/api/listings/route.ts integrates dynamic upvotes and sorts podium by upvotes DESC", () => {
    const listingsRoutePath = path.join(
      __dirname,
      "..",
      "app",
      "api",
      "listings",
      "route.ts"
    );
    const code = fs.readFileSync(listingsRoutePath, "utf8");

    assert.ok(
      code.includes("getUserUpvotedListingIds") &&
        code.includes("getListingUpvoteCountsMap"),
      "GET /api/listings must query upvote counts and caller's upvoted set"
    );
    assert.ok(
      code.includes("sortedByUpvotes") && code.includes("b.upvotes - a.upvotes"),
      "Podium champions must be sorted by live upvotes in descending order"
    );
  });

  it("verifies ProductCard and ProductDetailView render authenticated Upvote buttons wired to /api", () => {
    const cardPath = path.join(
      __dirname,
      "..",
      "components",
      "ProductCard.tsx"
    );
    const cardCode = fs.readFileSync(cardPath, "utf8");
    assert.ok(
      cardCode.includes("/api/listings/") && cardCode.includes("/upvote"),
      "ProductCard must trigger POST /api/listings/[id]/upvote"
    );
    assert.ok(
      cardCode.includes("/login?next="),
      "ProductCard must redirect unauthenticated users to login"
    );

    const detailPath = path.join(
      __dirname,
      "..",
      "components",
      "ProductDetailView.tsx"
    );
    const detailCode = fs.readFileSync(detailPath, "utf8");
    assert.ok(
      detailCode.includes("UpvoteButton") && detailCode.includes("handleUpvoteToggle"),
      "ProductDetailView hero must include UpvoteButton wired to handleUpvoteToggle"
    );
    assert.ok(
      detailCode.includes("AuthModal"),
      "ProductDetailView must render AuthModal for non-logged in upvoters"
    );
  });

  it("verifies Admin Queue button is completely removed from normal user dashboard and pages", () => {
    const dashboardPath = path.join(
      __dirname,
      "..",
      "app",
      "dashboard",
      "page.tsx"
    );
    const dashboardCode = fs.readFileSync(dashboardPath, "utf8");
    assert.ok(
      !dashboardCode.includes("Admin Queue"),
      "Dashboard page must not contain 'Admin Queue' button"
    );

    const loginAdminPath = path.join(
      __dirname,
      "..",
      "app",
      "admin",
      "login",
      "page.tsx"
    );
    const loginAdminCode = fs.readFileSync(loginAdminPath, "utf8");
    assert.ok(
      !loginAdminCode.includes("Sign In to Admin Queue"),
      "Admin login button must not say 'Sign In to Admin Queue'"
    );
  });
});
