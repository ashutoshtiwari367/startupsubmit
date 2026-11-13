import { NextRequest, NextResponse } from "next/server";
import { isAdminServerSession } from "@/lib/admin-auth";
import { getDashboardAnalytics, TimeRangeFilter } from "@/lib/analytics";

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
    const rawRange = searchParams.get("range") || "30d";
    const validRanges: TimeRangeFilter[] = ["today", "7d", "30d", "all"];
    const timeRange: TimeRangeFilter = validRanges.includes(rawRange as TimeRangeFilter)
      ? (rawRange as TimeRangeFilter)
      : "30d";

    const listingIdParam = searchParams.get("listingId");
    const listingId =
      listingIdParam && !isNaN(Number(listingIdParam))
        ? Number(listingIdParam)
        : null;

    const data = await getDashboardAnalytics({
      timeRange,
      filterByEmail: null, // Full directory scope
      listingId,
    });

    return NextResponse.json({
      ok: true,
      analytics: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

