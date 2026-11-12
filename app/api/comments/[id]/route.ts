import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isEmailAllowlisted } from "@/lib/admin-auth";
import {
  updateListingComment,
  deleteListingComment,
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
    const commentId = Number(id);
    if (!Number.isFinite(commentId) || commentId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid comment ID." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const commentText = String(body.comment_text || body.commentText || "");
    const isAdmin = isEmailAllowlisted(user.email);

    const result = await updateListingComment({
      userId: user.id,
      commentId,
      commentText,
      isAdmin,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.error?.includes("Unauthorized") ? 403 : 400 }
      );
    }

    return NextResponse.json({ ok: true, comment: result.comment });
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
    const commentId = Number(id);
    if (!Number.isFinite(commentId) || commentId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid comment ID." },
        { status: 400 }
      );
    }

    const isAdmin = isEmailAllowlisted(user.email);
    const result = await deleteListingComment({
      userId: user.id,
      commentId,
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

