import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, getAdminServerSession } from "@/lib/admin-auth";
import { rejectCategorySuggestion } from "@/lib/category-suggestions";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/categories/suggestions/[id]/reject
 * Rejects a category suggestion with an optional admin note.
 * The suggestion is permanently marked rejected and NEVER enters public.categories.
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
    const adminNote = body?.admin_note ? String(body.admin_note) : undefined;

    const updated = await rejectCategorySuggestion({
      suggestionId,
      adminNote,
      adminUserId: admin.userId,
    });

    return NextResponse.json({
      ok: true,
      message: "Category suggestion has been rejected.",
      suggestion: updated,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to reject category suggestion";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

