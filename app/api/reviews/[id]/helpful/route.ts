import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleHelpfulReview } from "@/lib/reviews-comments";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, props: RouteProps) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to mark review as helpful." },
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

    const result = await toggleHelpfulReview({
      userId: user.id,
      reviewId,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      helpful_count: result.helpfulCount,
      is_helpful: result.isHelpful,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

