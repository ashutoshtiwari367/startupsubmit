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

    const isAdmin = isEmailAllowlisted(user.email);
    const scope = searchParams.get("scope"); // "all" | "mine"

    // If admin and requested scope="all", show all directory analytics.
    // Otherwise filter by this maker's email.
    const filterByEmail = isAdmin && scope === "all" ? null : user.email;

    const data = await getDashboardAnalytics({
      timeRange,
      filterByEmail,
    });

    return NextResponse.json({
      ok: true,
      analytics: data,
      isAdmin,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

