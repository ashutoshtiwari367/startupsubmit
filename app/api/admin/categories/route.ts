import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/categories
 * Returns all categories in public.categories for admin dropdown selection (Option B & C).
 * Strictly admin-only.
 */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json(
      { ok: false, message: "Forbidden: Admin access required." },
      { status: 403 }
    );
  }

  try {
    let queryRes: any = await db
      .from("categories")
      .select("id, slug, name, description, parent_id, created_at")
      .order("name", { ascending: true });

    if (
      queryRes.error &&
      (queryRes.error.message.includes("parent_id") || queryRes.error.code === "42703")
    ) {
      queryRes = await db
        .from("categories")
        .select("id, slug, name, description, created_at")
        .order("name", { ascending: true });
    }

    const { data, error } = queryRes;
    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      categories: data || [],
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch admin categories";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

