import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAnalytics, TimeRangeFilter } from "@/lib/analytics";
import { isEmailAllowlisted } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawRange = searchParams.get("range") || "30d";
    const validRanges: TimeRangeFilter[] = ["today", "7d", "30d", "all"];
    const timeRange: TimeRangeFilter = validRanges.includes(rawRange as TimeRangeFilter)
      ? (rawRange as TimeRangeFilter)
      : "30d";

    // Customer dashboard analytics strictly scopes to the authenticated user's submitted tools
    const data = await getDashboardAnalytics({
      timeRange,
      filterByEmail: user.email,
    });

    return NextResponse.json({
      ok: true,
      analytics: data,
      isAdmin: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

