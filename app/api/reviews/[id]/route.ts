import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isEmailAllowlisted } from "@/lib/admin-auth";
import {
  updateListingReview,
  deleteListingReview,
} from "@/lib/reviews-comments";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, props: RouteProps) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    const reviewId = Number(id);
    if (!Number.isFinite(reviewId) || reviewId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid review ID." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rating = Number(body.rating);
    const reviewText = String(body.review_text || body.reviewText || "");
    const isAdmin = isEmailAllowlisted(user.email);

    const result = await updateListingReview({
      userId: user.id,
      reviewId,
      rating,
      reviewText,
      isAdmin,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.error?.includes("Unauthorized") ? 403 : 400 }
      );
    }

    return NextResponse.json({ ok: true, review: result.review });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, props: RouteProps) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    const reviewId = Number(id);
    if (!Number.isFinite(reviewId) || reviewId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid review ID." },
        { status: 400 }
      );
    }

    const isAdmin = isEmailAllowlisted(user.email);
    const result = await deleteListingReview({
      userId: user.id,
      reviewId,
      isAdmin,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.error?.includes("Unauthorized") ? 403 : 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

