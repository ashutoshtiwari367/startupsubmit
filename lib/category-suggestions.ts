import "server-only";
import { db } from "@/lib/db";
import { toBaseSlug, resolveUniqueSlug } from "@/lib/slug";

export type SuggestionStatus = "pending" | "approved" | "rejected";
export type SuggestionActionType =
  | "create_new"
  | "add_to_existing"
  | "rename_existing"
  | "reject";

export interface CategorySuggestionRow {
  id: string;
  suggested_name: string;
  suggested_slug: string;
  suggested_by: string | null;
  listing_id: number | string | null;
  status: SuggestionStatus;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolved_category_id: number | null;
  action_type: SuggestionActionType | null;
  created_at: string;
  updated_at: string;
  listings?: {
    id: number;
    slug: string;
    name: string;
    logo_url?: string | null;
  } | null;
  categories?: {
    id: number;
    slug: string;
    name: string;
  } | null;
}

export interface CategoryAuditLogRow {
  id: number;
  category_id: number | null;
  suggestion_id: string | null;
  action: string;
  performed_by: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Ensures the static fallback container 'Other' category exists in public.categories.
 * This is used to satisfy the foreign key constraint on listings.category_id while a
 * user's custom category suggestion awaits administrative review.
 */
export async function getOrCreateFallbackOtherCategory(): Promise<{
  id: number;
  slug: string;
  name: string;
}> {
  const { data: existing } = await db
    .from("categories")
    .select("id, slug, name")
    .eq("slug", "other")
    .maybeSingle();

  if (existing?.id) {
    return {
      id: Number(existing.id),
      slug: String(existing.slug),
      name: String(existing.name),
    };
  }

  const { data: created, error } = await db
    .from("categories")
    .upsert(
      {
        slug: "other",
        name: "Other",
        description:
          "Community suggested and uncategorized listings pending admin review.",
      },
      { onConflict: "slug" }
    )
    .select("id, slug, name")
    .single();

  if (error || !created) {
    // If conflict or concurrent race, fetch again
    const { data: fallback } = await db
      .from("categories")
      .select("id, slug, name")
      .limit(1)
      .single();

    return {
      id: Number(fallback?.id ?? 1),
      slug: String(fallback?.slug ?? "other"),
      name: String(fallback?.name ?? "Other"),
    };
  }

  return {
    id: Number(created.id),
    slug: String(created.slug),
    name: String(created.name),
  };
}

/**
 * Creates a pending category suggestion.
 * Users NEVER directly insert into or publish through public.categories.
 */
export async function createCategorySuggestion(params: {
  suggestedName: string;
  suggestedBy?: string | null;
  listingId?: number | string | null;
}): Promise<CategorySuggestionRow> {
  const cleanName = String(params.suggestedName || "").trim();
  if (cleanName.length < 2) {
    throw new Error("Category suggestion must be at least 2 characters.");
  }
  if (cleanName.length > 60) {
    throw new Error("Category suggestion cannot exceed 60 characters.");
  }

  const baseSlug = toBaseSlug(cleanName);
  const nowIso = new Date().toISOString();

  const insertPayload = {
    suggested_name: cleanName,
    suggested_slug: baseSlug,
    suggested_by: params.suggestedBy || null,
    listing_id: params.listingId ? Number(params.listingId) : null,
    status: "pending" as const,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const { data, error } = await db
    .from("category_suggestions")
    .insert(insertPayload as any)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message || "Failed to record category suggestion."
    );
  }

  return data as unknown as CategorySuggestionRow;
}

/**
 * Fetches category suggestions with status filters and search for the Admin Panel.
 */
export async function getCategorySuggestions(params: {
  status?: string | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}): Promise<{
  suggestions: CategorySuggestionRow[];
  counts: { all: number; pending: number; approved: number; rejected: number };
}> {
  const limit = Math.min(Math.max(params.limit || 50, 1), 100);
  const offset = Math.max(params.offset || 0, 0);

  let query = db
    .from("category_suggestions")
    .select(
      `
      id,
      suggested_name,
      suggested_slug,
      suggested_by,
      listing_id,
      status,
      admin_note,
      reviewed_by,
      reviewed_at,
      resolved_category_id,
      action_type,
      created_at,
      updated_at,
      listings (
        id,
        slug,
        name,
        logo_url
      ),
      categories (
        id,
        slug,
        name
      )
    `
    )
    .order("created_at", { ascending: false });

  const cleanStatus = String(params.status || "all").toLowerCase().trim();
  if (
    cleanStatus === "pending" ||
    cleanStatus === "approved" ||
    cleanStatus === "rejected"
  ) {
    query = query.eq("status", cleanStatus);
  }

  const cleanSearch = String(params.search || "").trim();
  if (cleanSearch) {
    query = query.ilike("suggested_name", `%${cleanSearch}%`);
  }

  query = query.range(offset, offset + limit - 1);
  const { data, error } = await query;

  if (error) {
    console.warn("[lib/category-suggestions] Query notice:", error.message);
  }

  // Fetch summary counts for the admin tabs
  const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
    db.from("category_suggestions").select("id", { count: "exact", head: true }),
    db.from("category_suggestions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("category_suggestions").select("id", { count: "exact", head: true }).eq("status", "approved"),
    db.from("category_suggestions").select("id", { count: "exact", head: true }).eq("status", "rejected"),
  ]);

  const rows = (data || []).map((row: any) => ({
    ...row,
    listings: Array.isArray(row.listings) ? row.listings[0] : row.listings,
    categories: Array.isArray(row.categories) ? row.categories[0] : row.categories,
  }));

  return {
    suggestions: rows as CategorySuggestionRow[],
    counts: {
      all: allRes.count ?? rows.length,
      pending: pendingRes.count ?? 0,
      approved: approvedRes.count ?? 0,
      rejected: rejectedRes.count ?? 0,
    },
  };
}

/**
 * Option A: Approve category suggestion as a completely new category.
 */
export async function approveCategorySuggestionAsNew(params: {
  suggestionId: string;
  name: string;
  slug?: string;
  parentId?: number | null;
  description?: string | null;
  adminUserId?: string | null;
}): Promise<{
  suggestion: CategorySuggestionRow;
  category: { id: number; name: string; slug: string };
}> {
  const { data: suggestion, error: fetchErr } = await db
    .from("category_suggestions")
    .select("*")
    .eq("id", params.suggestionId)
    .single();

  if (fetchErr || !suggestion) {
    throw new Error("Category suggestion not found.");
  }

  if (suggestion.status !== "pending") {
    throw new Error(
      `Suggestion has already been reviewed (${suggestion.status}).`
    );
  }

  const cleanName = String(params.name || suggestion.suggested_name || "").trim();
  if (cleanName.length < 2) {
    throw new Error("Category name must be at least 2 characters.");
  }

  // Resolve unique slug
  const { data: existingCategories } = await db
    .from("categories")
    .select("slug");
  const existingSlugs = (existingCategories || []).map((c) => c.slug);
  const targetBaseSlug = params.slug ? toBaseSlug(params.slug) : toBaseSlug(cleanName);
  const resolvedSlug = resolveUniqueSlug(targetBaseSlug, existingSlugs);

  const parentId =
    params.parentId && Number.isFinite(Number(params.parentId))
      ? Number(params.parentId)
      : null;

  // Insert newly approved category into public.categories
  const nowIso = new Date().toISOString();
  const { data: newCategory, error: catErr } = await db
    .from("categories")
    .insert({
      name: cleanName,
      slug: resolvedSlug,
      parent_id: parentId,
      description: params.description?.trim() || `Approved category for ${cleanName}`,
      created_at: nowIso,
    })
    .select("id, name, slug, parent_id")
    .single();

  if (catErr || !newCategory) {
    throw new Error(
      catErr?.message || "Failed to insert new category."
    );
  }

  const categoryId = Number(newCategory.id);

  // Update suggestion status to approved
  const { data: updatedSuggestion, error: suggErr } = await db
    .from("category_suggestions")
    .update({
      status: "approved",
      resolved_category_id: categoryId,
      action_type: "create_new",
      reviewed_by: params.adminUserId || null,
      reviewed_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", suggestion.id)
    .select("*")
    .single();

  if (suggErr || !updatedSuggestion) {
    throw new Error(suggErr?.message || "Failed to update suggestion status.");
  }

  // Update associated listing if present
  if (suggestion.listing_id) {
    await db
      .from("listings")
      .update({
        category_id: categoryId,
        updated_at: nowIso,
      })
      .eq("id", suggestion.listing_id);
  }

  // Record category change audit log
  await db.from("category_audit_logs").insert({
    category_id: categoryId,
    suggestion_id: suggestion.id,
    action: "create_new",
    performed_by: params.adminUserId || null,
    old_values: null,
    new_values: {
      id: categoryId,
      name: newCategory.name,
      slug: newCategory.slug,
      parent_id: parentId,
    },
    created_at: nowIso,
  });

  return {
    suggestion: updatedSuggestion as unknown as CategorySuggestionRow,
    category: {
      id: categoryId,
      name: newCategory.name,
      slug: newCategory.slug,
    },
  };
}

/**
 * Option B: Approve category suggestion as a child/subcategory of an existing category.
 */
export async function approveCategorySuggestionAsChild(params: {
  suggestionId: string;
  name: string;
  parentId: number;
  slug?: string;
  description?: string | null;
  adminUserId?: string | null;
}): Promise<{
  suggestion: CategorySuggestionRow;
  category: { id: number; name: string; slug: string; parent_id: number };
}> {
  const { data: suggestion, error: fetchErr } = await db
    .from("category_suggestions")
    .select("*")
    .eq("id", params.suggestionId)
    .single();

  if (fetchErr || !suggestion) {
    throw new Error("Category suggestion not found.");
  }

  if (suggestion.status !== "pending") {
    throw new Error(
      `Suggestion has already been reviewed (${suggestion.status}).`
    );
  }

  const parentId = Number(params.parentId);
  if (!Number.isFinite(parentId) || parentId <= 0) {
    throw new Error("Valid parent category ID is required.");
  }

  const { data: parentCategory } = await db
    .from("categories")
    .select("id, name, slug")
    .eq("id", parentId)
    .maybeSingle();

  if (!parentCategory) {
    throw new Error("Selected parent category does not exist.");
  }

  const cleanName = String(params.name || suggestion.suggested_name || "").trim();
  if (cleanName.length < 2) {
    throw new Error("Subcategory name must be at least 2 characters.");
  }

  // Resolve unique slug
  const { data: existingCategories } = await db
    .from("categories")
    .select("slug");
  const existingSlugs = (existingCategories || []).map((c) => c.slug);
  const targetBaseSlug = params.slug ? toBaseSlug(params.slug) : toBaseSlug(cleanName);
  const resolvedSlug = resolveUniqueSlug(targetBaseSlug, existingSlugs);

  const nowIso = new Date().toISOString();
  const { data: childCategory, error: catErr } = await db
    .from("categories")
    .insert({
      name: cleanName,
      slug: resolvedSlug,
      parent_id: parentId,
      description:
        params.description?.trim() ||
        `${cleanName} (sub-category under ${parentCategory.name})`,
      created_at: nowIso,
    })
    .select("id, name, slug, parent_id")
    .single();

  if (catErr || !childCategory) {
    throw new Error(catErr?.message || "Failed to create subcategory.");
  }

  const categoryId = Number(childCategory.id);

  // Update suggestion status
  const { data: updatedSuggestion, error: suggErr } = await db
    .from("category_suggestions")
    .update({
      status: "approved",
      resolved_category_id: categoryId,
      action_type: "add_to_existing",
      reviewed_by: params.adminUserId || null,
      reviewed_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", suggestion.id)
    .select("*")
    .single();

  if (suggErr || !updatedSuggestion) {
    throw new Error(suggErr?.message || "Failed to update suggestion status.");
  }

  // Update associated listing if present
  if (suggestion.listing_id) {
    await db
      .from("listings")
      .update({
        category_id: categoryId,
        updated_at: nowIso,
      })
      .eq("id", suggestion.listing_id);
  }

  // Record audit log
  await db.from("category_audit_logs").insert({
    category_id: categoryId,
    suggestion_id: suggestion.id,
    action: "add_to_existing",
    performed_by: params.adminUserId || null,
    old_values: { parent_category: parentCategory },
    new_values: {
      id: categoryId,
      name: childCategory.name,
      slug: childCategory.slug,
      parent_id: parentId,
    },
    created_at: nowIso,
  });

  return {
    suggestion: updatedSuggestion as unknown as CategorySuggestionRow,
    category: {
      id: categoryId,
      name: childCategory.name,
      slug: childCategory.slug,
      parent_id: parentId,
    },
  };
}

/**
 * Option C: Rename an existing category based on the suggestion.
 * Preserves category ID and all existing listing relationships.
 */
export async function approveCategorySuggestionAsRename(params: {
  suggestionId: string;
  targetCategoryId: number;
  newName: string;
  newSlug?: string;
  adminUserId?: string | null;
}): Promise<{
  suggestion: CategorySuggestionRow;
  category: { id: number; name: string; slug: string };
  previous: { name: string; slug: string };
}> {
  const { data: suggestion, error: fetchErr } = await db
    .from("category_suggestions")
    .select("*")
    .eq("id", params.suggestionId)
    .single();

  if (fetchErr || !suggestion) {
    throw new Error("Category suggestion not found.");
  }

  if (suggestion.status !== "pending") {
    throw new Error(
      `Suggestion has already been reviewed (${suggestion.status}).`
    );
  }

  const targetCategoryId = Number(params.targetCategoryId);
  if (!Number.isFinite(targetCategoryId) || targetCategoryId <= 0) {
    throw new Error("Valid target category ID is required.");
  }

  const { data: existingCategory } = await db
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("id", targetCategoryId)
    .maybeSingle();

  if (!existingCategory) {
    throw new Error("Target category to rename does not exist.");
  }

  const cleanName = String(params.newName || "").trim();
  if (cleanName.length < 2) {
    throw new Error("New category name must be at least 2 characters.");
  }

  // Resolve unique slug excluding the current category's slug
  const { data: otherCategories } = await db
    .from("categories")
    .select("slug")
    .neq("id", targetCategoryId);

  const otherSlugs = (otherCategories || []).map((c) => c.slug);
  const targetBaseSlug = params.newSlug ? toBaseSlug(params.newSlug) : toBaseSlug(cleanName);
  const resolvedSlug = resolveUniqueSlug(targetBaseSlug, otherSlugs);

  const nowIso = new Date().toISOString();

  // Rename category in public.categories
  const { data: updatedCategory, error: catErr } = await db
    .from("categories")
    .update({
      name: cleanName,
      slug: resolvedSlug,
    })
    .eq("id", targetCategoryId)
    .select("id, name, slug")
    .single();

  if (catErr || !updatedCategory) {
    throw new Error(catErr?.message || "Failed to rename category.");
  }

  // Update suggestion status
  const { data: updatedSuggestion, error: suggErr } = await db
    .from("category_suggestions")
    .update({
      status: "approved",
      resolved_category_id: targetCategoryId,
      action_type: "rename_existing",
      reviewed_by: params.adminUserId || null,
      reviewed_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", suggestion.id)
    .select("*")
    .single();

  if (suggErr || !updatedSuggestion) {
    throw new Error(suggErr?.message || "Failed to update suggestion status.");
  }

  // Associate the suggestion's listing if present
  if (suggestion.listing_id) {
    await db
      .from("listings")
      .update({
        category_id: targetCategoryId,
        updated_at: nowIso,
      })
      .eq("id", suggestion.listing_id);
  }

  // Record audit log capturing old and new names
  await db.from("category_audit_logs").insert({
    category_id: targetCategoryId,
    suggestion_id: suggestion.id,
    action: "rename_existing",
    performed_by: params.adminUserId || null,
    old_values: {
      id: existingCategory.id,
      name: existingCategory.name,
      slug: existingCategory.slug,
    },
    new_values: {
      id: targetCategoryId,
      name: updatedCategory.name,
      slug: updatedCategory.slug,
    },
    created_at: nowIso,
  });

  return {
    suggestion: updatedSuggestion as unknown as CategorySuggestionRow,
    category: {
      id: targetCategoryId,
      name: updatedCategory.name,
      slug: updatedCategory.slug,
    },
    previous: {
      name: existingCategory.name,
      slug: existingCategory.slug,
    },
  };
}

/**
 * Rejects a category suggestion with an optional admin note.
 * The suggested category is NEVER inserted into or published through public.categories.
 */
export async function rejectCategorySuggestion(params: {
  suggestionId: string;
  adminNote?: string | null;
  adminUserId?: string | null;
}): Promise<CategorySuggestionRow> {
  const { data: suggestion, error: fetchErr } = await db
    .from("category_suggestions")
    .select("*")
    .eq("id", params.suggestionId)
    .single();

  if (fetchErr || !suggestion) {
    throw new Error("Category suggestion not found.");
  }

  if (suggestion.status !== "pending") {
    throw new Error(
      `Suggestion has already been reviewed (${suggestion.status}).`
    );
  }

  const nowIso = new Date().toISOString();
  const cleanNote = params.adminNote ? String(params.adminNote).trim() : null;

  const { data: updatedSuggestion, error: suggErr } = await db
    .from("category_suggestions")
    .update({
      status: "rejected",
      admin_note: cleanNote,
      action_type: "reject",
      reviewed_by: params.adminUserId || null,
      reviewed_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", suggestion.id)
    .select("*")
    .single();

  if (suggErr || !updatedSuggestion) {
    throw new Error(suggErr?.message || "Failed to reject suggestion.");
  }

  // Record audit log
  await db.from("category_audit_logs").insert({
    category_id: null,
    suggestion_id: suggestion.id,
    action: "reject",
    performed_by: params.adminUserId || null,
    old_values: {
      suggested_name: suggestion.suggested_name,
      suggested_slug: suggestion.suggested_slug,
    },
    new_values: {
      status: "rejected",
      admin_note: cleanNote,
    },
    created_at: nowIso,
  });

  return updatedSuggestion as unknown as CategorySuggestionRow;
}

