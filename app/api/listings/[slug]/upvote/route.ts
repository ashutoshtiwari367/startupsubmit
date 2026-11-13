import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publicDb, db } from "@/lib/db";
import {
  toggleListingUpvote,
  getListingUpvoteState,
} from "@/lib/upvotes";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ slug: string }>;
}

async function resolveListing(
  slugOrId: string
): Promise<{ id: number; slug: string; name: string } | null> {
  const clean = String(slugOrId || "").trim();
  if (!clean) return null;

  const num = Number(clean);
  if (Number.isFinite(num) && num > 0) {
    const { data } = await db
      .from("listings")
      .select("id, slug, name")
      .eq("id", num)
      .maybeSingle();
    if (data) return data;
  }

  const { data } = await db
    .from("listings")
    .select("id, slug, name")
    .eq("slug", clean.toLowerCase())
    .maybeSingle();

  return data || null;
}

/**
 * GET /api/listings/[slug]/upvote
 * Returns upvote count and current user's vote status
 */
export async function GET(req: NextRequest, props: RouteProps) {
  try {
    const { slug } = await props.params;
    const listing = await resolveListing(slug);

    if (!listing) {
      return NextResponse.json(
        { ok: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const state = await getListingUpvoteState({
      listingId: listing.id,
      userId: user?.id || null,
    });

    return NextResponse.json({
      ok: true,
      listingId: listing.id,
      ...state,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/listings/[slug]/upvote
 * Toggles an upvote on a listing.
 * Strictly requires authentication: only signed-in users can upvote.
 */
export async function POST(req: NextRequest, props: RouteProps) {
  try {
    const { slug } = await props.params;
    const listing = await resolveListing(slug);

    if (!listing) {
      return NextResponse.json(
        { ok: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Strict Rule: Unauthenticated users CANNOT upvote.
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please sign in to upvote tools.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const result = await toggleListingUpvote({
      listingId: listing.id,
      userId: user.id,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Failed to update upvote" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      listingId: listing.id,
      isUpvoted: result.isUpvoted,
      upvotesCount: result.upvotesCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

