import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publicDb } from "@/lib/db";
import {
  getListingReviews,
  createListingReview,
} from "@/lib/reviews-comments";

interface RouteProps {
  params: Promise<{ slug: string }>;
}

async function resolveListingId(slugOrId: string): Promise<number | null> {
  const clean = String(slugOrId || "").trim();
  if (!clean) return null;

  const num = Number(clean);
  if (Number.isFinite(num) && num > 0) {
    const { data } = await publicDb
      .from("listings")
      .select("id")
      .eq("id", num)
      .eq("status", "approved")
      .maybeSingle();
    if (data) return data.id;
  }

  const { data } = await publicDb
    .from("listings")
    .select("id")
    .eq("slug", clean.toLowerCase())
    .eq("status", "approved")
    .maybeSingle();

  return data ? data.id : null;
}

export async function GET(req: NextRequest, props: RouteProps) {
  try {
    const { slug } = await props.params;
    const listingId = await resolveListingId(slug);

    if (!listingId) {
      return NextResponse.json(
        { ok: false, error: "Listing not found or not approved" },
        { status: 404 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const data = await getListingReviews({
      listingId,
      currentUserId: user?.id || null,
    });

    return NextResponse.json({ ok: true, ...data });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, props: RouteProps) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to submit a review." },
        { status: 401 }
      );
    }

    const { slug } = await props.params;
    const listingId = await resolveListingId(slug);

    if (!listingId) {
      return NextResponse.json(
        { ok: false, error: "Cannot review: Listing not found or not approved." },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rating = Number(body.rating);
    const reviewText = String(body.review_text || body.reviewText || "");

    const result = await createListingReview({
      userId: user.id,
      listingId,
      rating,
      reviewText,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, review: result.review }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

