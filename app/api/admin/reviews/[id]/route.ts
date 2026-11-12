import { NextRequest, NextResponse } from "next/server";
import { isAdminServerSession } from "@/lib/admin-auth";
import { moderateReview, deleteListingReview } from "@/lib/reviews-comments";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, props: RouteProps) {
  try {
    const isAdmin = await isAdminServerSession();
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { id } = await props.params;
    const reviewId = Number(id);
    const body = await req.json().catch(() => ({}));
    const status = body.status; // 'approved' | 'rejected' | 'pending'

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Invalid status value." },
        { status: 400 }
      );
    }

    await moderateReview(reviewId, status);
    return NextResponse.json({ ok: true, status });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, props: RouteProps) {
  try {
    const isAdmin = await isAdminServerSession();
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { id } = await props.params;
    const reviewId = Number(id);

    await deleteListingReview({
      userId: "",
      reviewId,
      isAdmin: true,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

