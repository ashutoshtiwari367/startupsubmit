import { NextRequest, NextResponse } from "next/server";
import { isAdminServerSession } from "@/lib/admin-auth";
import { getAdminReviews } from "@/lib/reviews-comments";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminServerSession();
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "all") as any;

    const reviews = await getAdminReviews(status);
    return NextResponse.json({ ok: true, reviews });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

