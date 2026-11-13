import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getCategorySuggestions } from "@/lib/category-suggestions";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/categories/suggestions
 * Returns category suggestions filtered by status and search for the Admin Panel.
 * Strictly auth-gated for allowlisted admins only.
 */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json(
      { ok: false, message: "Forbidden: Admin access required." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : 50;
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 0;

    const data = await getCategorySuggestions({
      status,
      search,
      limit,
      offset,
    });

    return NextResponse.json({
      ok: true,
      ...data,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch category suggestions";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

