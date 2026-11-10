import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";
import type { ListingStatus } from "@/types/db";

const VALID_STATUSES: readonly ListingStatus[] = [
  "pending",
  "approved",
  "rejected",
];

/**
 * GET /api/admin/listings
 * Admin-only endpoint to retrieve the moderation queue with all fields & screenshots.
 */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json(
      { ok: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") || "pending";

    let query = db
      .from("listings")
      .select(
        "id, slug, name, tagline, description_short, description_long, website_url, logo_url, category_id, pricing_model, status, submitted_by_email, created_at, updated_at, approved_at, categories(id, slug, name), listing_screenshots(id, url, position)"
      )
      .order("created_at", { ascending: false });

    if (
      statusParam !== "all" &&
      VALID_STATUSES.includes(statusParam as ListingStatus)
    ) {
      query = query.eq("status", statusParam as ListingStatus);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    // Sort screenshots by position ascending
    const normalized = (data || []).map((item) => {
      const rawShots = Array.isArray(item.listing_screenshots)
        ? [...item.listing_screenshots]
        : [];
      rawShots.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      return {
        ...item,
        listing_screenshots: rawShots,
      };
    });

    return NextResponse.json({
      ok: true,
      listings: normalized,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load admin queue";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

