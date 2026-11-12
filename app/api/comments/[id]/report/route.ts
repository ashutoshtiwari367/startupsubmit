import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportListingComment } from "@/lib/reviews-comments";

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
        { ok: false, error: "Authentication required to report comment." },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    const commentId = Number(id);
    if (!Number.isFinite(commentId) || commentId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid comment ID." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = String(body.reason || "");

    const result = await reportListingComment({
      reporterId: user.id,
      commentId,
      reason,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, message: "Comment reported successfully." });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

