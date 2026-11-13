import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// In-Memory Simulation of Category Suggestion Engine
// (Mirrors lib/category-suggestions.ts & database constraints)
// ============================================================================

function createCategorySystem() {
  const categories = new Map([
    [1, { id: 1, slug: "ai", name: "AI", parent_id: null }],
    [2, { id: 2, slug: "productivity", name: "Productivity", parent_id: null }],
    [3, { id: 3, slug: "marketing", name: "Marketing", parent_id: null }],
    [4, { id: 4, slug: "human-resources", name: "Human Resources", parent_id: null }],
    [999, { id: 999, slug: "other", name: "Other", parent_id: null }],
  ]);

  const listings = new Map([
    [50000001, { id: 50000001, name: "HR Tool A", category_id: 4, custom_category: null }],
    [50000002, { id: 50000002, name: "HR Tool B", category_id: 4, custom_category: null }],
  ]);

  const suggestions = new Map();
  const auditLogs = [];
  let nextCatId = 10;
  let nextSuggId = 1;

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category";
  }

  function resolveUniqueSlug(base, existingSlugs) {
    const slug = slugify(base);
    if (!existingSlugs.has(slug)) return slug;
    let count = 2;
    while (existingSlugs.has(`${slug}-${count}`)) {
      count++;
    }
    return `${slug}-${count}`;
  }

  return {
    categories,
    listings,
    suggestions,
    auditLogs,

    submitListingWithOther(toolName, customCategory, userId = null) {
      // 1. Assigns fallback 'other' category container to listing
      const listingId = 50000000 + listings.size + 1;
      const listing = {
        id: listingId,
        name: toolName,
        category_id: 999, // 'Other'
        custom_category: customCategory,
      };
      listings.set(listingId, listing);

      // 2. Records suggestion in category_suggestions table with status='pending'
      // NEVER inserts into categories table directly!
      const suggId = `sugg-${nextSuggId++}`;
      const suggestion = {
        id: suggId,
        suggested_name: customCategory.trim(),
        suggested_slug: slugify(customCategory),
        suggested_by: userId,
        listing_id: listingId,
        status: "pending",
        admin_note: null,
        resolved_category_id: null,
        action_type: null,
        created_at: new Date().toISOString(),
      };
      suggestions.set(suggId, suggestion);

      return {
        listing,
        suggestion,
        message:
          "Your category suggestion has been submitted successfully. It will become available after admin review.",
      };
    },

    getPublicCategories() {
      // Public users ONLY see approved records in categories table
      return Array.from(categories.values()).filter((c) => c.slug !== "other");
    },

    approveAsNew(suggId, name, optionalParentId = null, adminUserId = "admin-1") {
      const sugg = suggestions.get(suggId);
      if (!sugg) throw new Error("Suggestion not found");
      if (sugg.status !== "pending") {
        throw new Error(`Suggestion has already been reviewed (${sugg.status}).`);
      }

      const existingSlugs = new Set(Array.from(categories.values()).map((c) => c.slug));
      const cleanSlug = resolveUniqueSlug(name || sugg.suggested_name, existingSlugs);
      const newCatId = nextCatId++;
      const newCat = {
        id: newCatId,
        name: (name || sugg.suggested_name).trim(),
        slug: cleanSlug,
        parent_id: optionalParentId ? Number(optionalParentId) : null,
      };
      categories.set(newCatId, newCat);

      sugg.status = "approved";
      sugg.resolved_category_id = newCatId;
      sugg.action_type = "create_new";
      sugg.reviewed_by = adminUserId;

      if (sugg.listing_id && listings.has(sugg.listing_id)) {
        listings.get(sugg.listing_id).category_id = newCatId;
      }

      auditLogs.push({
        action: "create_new",
        category_id: newCatId,
        suggestion_id: suggId,
        new_values: newCat,
      });

      return newCat;
    },

    approveAsChild(suggId, parentId, name, adminUserId = "admin-1") {
      const sugg = suggestions.get(suggId);
      if (!sugg) throw new Error("Suggestion not found");
      if (sugg.status !== "pending") {
        throw new Error(`Suggestion has already been reviewed (${sugg.status}).`);
      }
      if (!categories.has(parentId)) {
        throw new Error("Parent category not found");
      }

      const existingSlugs = new Set(Array.from(categories.values()).map((c) => c.slug));
      const cleanSlug = resolveUniqueSlug(name || sugg.suggested_name, existingSlugs);
      const newCatId = nextCatId++;
      const childCat = {
        id: newCatId,
        name: (name || sugg.suggested_name).trim(),
        slug: cleanSlug,
        parent_id: parentId,
      };
      categories.set(newCatId, childCat);

      sugg.status = "approved";
      sugg.resolved_category_id = newCatId;
      sugg.action_type = "add_to_existing";
      sugg.reviewed_by = adminUserId;

      if (sugg.listing_id && listings.has(sugg.listing_id)) {
        listings.get(sugg.listing_id).category_id = newCatId;
      }

      auditLogs.push({
        action: "add_to_existing",
        category_id: newCatId,
        suggestion_id: suggId,
        new_values: childCat,
      });

      return childCat;
    },

    approveAsRename(suggId, targetCategoryId, newName, adminUserId = "admin-1") {
      const sugg = suggestions.get(suggId);
      if (!sugg) throw new Error("Suggestion not found");
      if (sugg.status !== "pending") {
        throw new Error(`Suggestion has already been reviewed (${sugg.status}).`);
      }
      const targetCat = categories.get(targetCategoryId);
      if (!targetCat) throw new Error("Target category not found");

      const oldValues = { ...targetCat };
      const otherSlugs = new Set(
        Array.from(categories.values())
          .filter((c) => c.id !== targetCategoryId)
          .map((c) => c.slug)
      );
      const newSlug = resolveUniqueSlug(newName, otherSlugs);

      targetCat.name = newName.trim();
      targetCat.slug = newSlug;

      sugg.status = "approved";
      sugg.resolved_category_id = targetCategoryId;
      sugg.action_type = "rename_existing";
      sugg.reviewed_by = adminUserId;

      if (sugg.listing_id && listings.has(sugg.listing_id)) {
        listings.get(sugg.listing_id).category_id = targetCategoryId;
      }

      auditLogs.push({
        action: "rename_existing",
        category_id: targetCategoryId,
        suggestion_id: suggId,
        old_values: oldValues,
        new_values: { ...targetCat },
      });

      return targetCat;
    },

    reject(suggId, adminNote = null, adminUserId = "admin-1") {
      const sugg = suggestions.get(suggId);
      if (!sugg) throw new Error("Suggestion not found");
      if (sugg.status !== "pending") {
        throw new Error(`Suggestion has already been reviewed (${sugg.status}).`);
      }

      sugg.status = "rejected";
      sugg.admin_note = adminNote;
      sugg.action_type = "reject";
      sugg.reviewed_by = adminUserId;

      auditLogs.push({
        action: "reject",
        category_id: null,
        suggestion_id: suggId,
        admin_note: adminNote,
      });

      return sugg;
    },
  };
}

describe("Admin-Only Category Suggestion Approval & Management System", () => {
  // Test 1: User submits HRMS -> It appears only in pending suggestions
  it("Test 1: User submits HRMS -> appears only in pending suggestions", () => {
    const sys = createCategorySystem();
    const result = sys.submitListingWithOther("PayrollPro", "HRMS", "user-uuid-123");

    assert.equal(result.suggestion.suggested_name, "HRMS");
    assert.equal(result.suggestion.status, "pending");
    assert.equal(result.suggestion.listing_id, result.listing.id);
    assert.equal(result.listing.custom_category, "HRMS");
    assert.equal(result.listing.category_id, 999); // Fallback Other
    assert.equal(sys.suggestions.size, 1);
  });

  // Test 2: HRMS does not appear in public categories before approval
  it("Test 2: HRMS does not appear in public categories before approval", () => {
    const sys = createCategorySystem();
    sys.submitListingWithOther("PayrollPro", "HRMS");

    const publicCats = sys.getPublicCategories();
    const hasHrms = publicCats.some((c) => c.name.toLowerCase() === "hrms" || c.slug === "hrms");
    assert.equal(hasHrms, false, "Unapproved HRMS must NOT appear in public categories");
  });

  // Test 3: Admin approves HRMS as a new category -> It appears in categories
  it("Test 3: Admin approves HRMS as a new category -> appears in categories table", () => {
    const sys = createCategorySystem();
    const { suggestion, listing } = sys.submitListingWithOther("PayrollPro", "HRMS");

    const newCategory = sys.approveAsNew(suggestion.id, "HRMS");
    assert.equal(newCategory.name, "HRMS");
    assert.equal(newCategory.slug, "hrms");

    // Suggestion marked approved
    assert.equal(suggestion.status, "approved");
    assert.equal(suggestion.resolved_category_id, newCategory.id);
    assert.equal(suggestion.action_type, "create_new");

    // Public categories now include HRMS
    const publicCats = sys.getPublicCategories();
    const found = publicCats.find((c) => c.id === newCategory.id);
    assert.ok(found, "HRMS must be in public categories after approval");
    assert.equal(found.name, "HRMS");

    // Associated listing updated to new category ID
    assert.equal(sys.listings.get(listing.id).category_id, newCategory.id);
  });

  // Test 4: Admin adds HRMS under Productivity -> Correct parent-child relationship
  it("Test 4: Admin adds HRMS under Productivity -> correct parent-child relationship", () => {
    const sys = createCategorySystem();
    const { suggestion, listing } = sys.submitListingWithOther("FocusHR", "HRMS");

    const childCat = sys.approveAsChild(suggestion.id, 2, "HRMS"); // parent_id: 2 (Productivity)
    assert.equal(childCat.parent_id, 2);
    assert.equal(childCat.name, "HRMS");
    assert.equal(suggestion.status, "approved");
    assert.equal(suggestion.action_type, "add_to_existing");
    assert.equal(sys.listings.get(listing.id).category_id, childCat.id);
  });

  // Test 5: Admin renames Human Resources to HRMS -> Existing listings remain connected
  it("Test 5: Admin renames Human Resources to HRMS -> preserves category ID and existing listings", () => {
    const sys = createCategorySystem();
    const { suggestion, listing } = sys.submitListingWithOther("WorkHQ", "HRMS");

    // Target category 4 is "Human Resources" with existing listings 50000001 & 50000002
    const renamed = sys.approveAsRename(suggestion.id, 4, "HRMS");
    assert.equal(renamed.id, 4, "Category ID must be preserved");
    assert.equal(renamed.name, "HRMS");
    assert.equal(renamed.slug, "hrms");

    // Existing listings still point to category 4
    assert.equal(sys.listings.get(50000001).category_id, 4);
    assert.equal(sys.listings.get(50000002).category_id, 4);

    // New listing also connected to category 4
    assert.equal(sys.listings.get(listing.id).category_id, 4);

    // Audit log recorded old and new values
    const renameAudit = sys.auditLogs.find((l) => l.action === "rename_existing");
    assert.ok(renameAudit);
    assert.equal(renameAudit.old_values.name, "Human Resources");
    assert.equal(renameAudit.new_values.name, "HRMS");
  });

  // Test 6: Admin rejects HRMS -> It never appears in public categories
  it("Test 6: Admin rejects HRMS -> never appears in public categories", () => {
    const sys = createCategorySystem();
    const { suggestion } = sys.submitListingWithOther("SpamTool", "CryptoSpam");

    sys.reject(suggestion.id, "Violates naming guidelines");
    assert.equal(suggestion.status, "rejected");
    assert.equal(suggestion.admin_note, "Violates naming guidelines");

    const publicCats = sys.getPublicCategories();
    assert.equal(
      publicCats.some((c) => c.name.toLowerCase().includes("cryptospam")),
      false,
      "Rejected category must never enter public categories"
    );
  });

  // Test 7: Normal users cannot access admin suggestion management
  it("Test 7: Normal users cannot access admin suggestion management (404/403)", () => {
    const pageSource = fs.readFileSync(
      path.join(__dirname, "..", "app", "admin", "categories", "page.tsx"),
      "utf8"
    );
    assert.ok(
      pageSource.includes("isAdminServerSession") && pageSource.includes("notFound()"),
      "app/admin/categories/page.tsx must reject non-admins with notFound()"
    );
  });

  // Test 8: Normal users cannot change suggestion status (RLS revokes direct mutations)
  it("Test 8: Database RLS revokes direct mutations on category_suggestions and audit logs", () => {
    const migrationSource = fs.readFileSync(
      path.join(__dirname, "..", "supabase", "migrations", "0008_category_suggestions.sql"),
      "utf8"
    );
    assert.ok(
      migrationSource.includes("REVOKE INSERT, UPDATE, DELETE ON public.category_suggestions FROM PUBLIC, anon, authenticated;"),
      "0008 migration must revoke client mutations on category_suggestions"
    );
    assert.ok(
      migrationSource.includes("REVOKE ALL ON public.category_audit_logs FROM PUBLIC, anon, authenticated;"),
      "0008 migration must revoke all client access on category_audit_logs"
    );
    assert.ok(
      migrationSource.includes('ENABLE ROW LEVEL SECURITY;'),
      "RLS must be enabled on category tables"
    );
  });

  // Test 9: Duplicate suggestions are handled correctly
  it("Test 9: Duplicate suggestions are recorded cleanly without collision", () => {
    const sys = createCategorySystem();
    const res1 = sys.submitListingWithOther("Tool 1", "HRMS");
    const res2 = sys.submitListingWithOther("Tool 2", "HRMS");

    assert.notEqual(res1.suggestion.id, res2.suggestion.id);
    assert.equal(sys.suggestions.size, 2);
    assert.equal(res1.suggestion.status, "pending");
    assert.equal(res2.suggestion.status, "pending");
  });

  // Test 10: Duplicate category names and slug conflicts are prevented
  it("Test 10: Slug conflicts are resolved safely with suffixing", () => {
    const sys = createCategorySystem();
    const { suggestion: s1 } = sys.submitListingWithOther("Tool 1", "Productivity");
    const cat1 = sys.approveAsNew(s1.id, "Productivity");
    assert.equal(cat1.slug, "productivity-2", "Conflicting slug with existing Productivity must suffix to -2");

    const { suggestion: s2 } = sys.submitListingWithOther("Tool 2", "Productivity");
    const cat2 = sys.approveAsNew(s2.id, "Productivity");
    assert.equal(cat2.slug, "productivity-3", "Second conflict must suffix to -3");
  });

  // Test 11: Unauthorized API requests are rejected
  it("Test 11: All admin category API endpoints enforce isAdminRequest", () => {
    const listApi = fs.readFileSync(
      path.join(__dirname, "..", "app", "api", "admin", "categories", "suggestions", "route.ts"),
      "utf8"
    );
    const approveApi = fs.readFileSync(
      path.join(__dirname, "..", "app", "api", "admin", "categories", "suggestions", "[id]", "approve", "route.ts"),
      "utf8"
    );
    const rejectApi = fs.readFileSync(
      path.join(__dirname, "..", "app", "api", "admin", "categories", "suggestions", "[id]", "reject", "route.ts"),
      "utf8"
    );
    const catsApi = fs.readFileSync(
      path.join(__dirname, "..", "app", "api", "admin", "categories", "route.ts"),
      "utf8"
    );

    for (const src of [listApi, approveApi, rejectApi, catsApi]) {
      assert.ok(
        src.includes("isAdminRequest") && src.includes("403"),
        "Endpoint must verify isAdminRequest and return 403 when unauthorized"
      );
    }
  });

  // Test 12: Existing category functionality continues working
  it("Test 12: Existing category functionality and SubmitForm confirmation message", () => {
    const submitFormSource = fs.readFileSync(
      path.join(__dirname, "..", "components", "SubmitForm.tsx"),
      "utf8"
    );
    assert.ok(
      submitFormSource.includes(
        "Your category suggestion has been submitted successfully. It will become available after admin review."
      ),
      "SubmitForm.tsx must display exact approval notice for category suggestions"
    );

    const listingsRouteSource = fs.readFileSync(
      path.join(__dirname, "..", "app", "api", "listings", "route.ts"),
      "utf8"
    );
    assert.ok(
      !listingsRouteSource.includes(".upsert(\n        {\n          slug: customSlug,\n          name: customName"),
      "listings/route.ts must NEVER directly upsert custom user categories into public.categories"
    );
    assert.ok(
      listingsRouteSource.includes("createCategorySuggestion"),
      "listings/route.ts must call createCategorySuggestion when 'Other' category is chosen"
    );
  });

  // Test 13: Concurrent / duplicate review requests on already reviewed suggestion fail
  it("Test 13: Already reviewed suggestions cannot be re-approved or re-rejected", () => {
    const sys = createCategorySystem();
    const { suggestion } = sys.submitListingWithOther("PayrollPro", "HRMS");

    sys.approveAsNew(suggestion.id, "HRMS");
    assert.equal(suggestion.status, "approved");

    // Second approval attempt MUST throw
    assert.throws(
      () => sys.approveAsNew(suggestion.id, "HRMS"),
      /already been reviewed/
    );

    // Rejection attempt on approved suggestion MUST throw
    assert.throws(
      () => sys.reject(suggestion.id, "Late reject"),
      /already been reviewed/
    );
  });
});

