import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, getAdminServerSession } from "@/lib/admin-auth";
import {
  approveCategorySuggestionAsNew,
  approveCategorySuggestionAsChild,
  approveCategorySuggestionAsRename,
} from "@/lib/category-suggestions";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/categories/suggestions/[id]/approve
 * Executes one of 3 admin approval actions:
 * - create_new: creates a new top-level category in public.categories
 * - add_to_existing: creates a subcategory under an existing parent category
 * - rename_existing: renames an existing category while preserving its ID & listing relations
 * Strictly admin-only; verifies admin session server-side.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json(
      { ok: false, message: "Forbidden: Admin access required." },
      { status: 403 }
    );
  }

  try {
    const { id: suggestionId } = await context.params;
    if (!suggestionId || typeof suggestionId !== "string") {
      return NextResponse.json(
        { ok: false, message: "Valid suggestion ID is required." },
        { status: 400 }
      );
    }

    const admin = await getAdminServerSession();
    const body = await req.json().catch(() => ({}));
    const actionType = String(body.action_type || "create_new").trim().toLowerCase();

    if (actionType === "create_new") {
      const result = await approveCategorySuggestionAsNew({
        suggestionId,
        name: body.name,
        slug: body.slug,
        parentId: body.parent_id ? Number(body.parent_id) : null,
        description: body.description,
        adminUserId: admin.userId,
      });

      return NextResponse.json({
        ok: true,
        message: `Category '${result.category.name}' created and suggestion approved.`,
        ...result,
      });
    }

    if (actionType === "add_to_existing") {
      if (!body.parent_id) {
        return NextResponse.json(
          { ok: false, message: "Parent category ID is required for subcategory." },
          { status: 400 }
        );
      }

      const result = await approveCategorySuggestionAsChild({
        suggestionId,
        name: body.name,
        parentId: Number(body.parent_id),
        slug: body.slug,
        description: body.description,
        adminUserId: admin.userId,
      });

      return NextResponse.json({
        ok: true,
        message: `Subcategory '${result.category.name}' added under parent and suggestion approved.`,
        ...result,
      });
    }

    if (actionType === "rename_existing") {
      if (!body.target_category_id) {
        return NextResponse.json(
          { ok: false, message: "Target category ID to rename is required." },
          { status: 400 }
        );
      }
      if (!body.new_name) {
        return NextResponse.json(
          { ok: false, message: "New category name is required." },
          { status: 400 }
        );
      }

      const result = await approveCategorySuggestionAsRename({
        suggestionId,
        targetCategoryId: Number(body.target_category_id),
        newName: String(body.new_name),
        newSlug: body.new_slug,
        adminUserId: admin.userId,
      });

      return NextResponse.json({
        ok: true,
        message: `Category #${result.category.id} renamed from '${result.previous.name}' to '${result.category.name}'.`,
        ...result,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          "Invalid action_type. Must be 'create_new', 'add_to_existing', or 'rename_existing'.",
      },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to approve category suggestion";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

