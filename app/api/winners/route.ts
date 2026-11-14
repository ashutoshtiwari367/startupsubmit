import { NextRequest, NextResponse } from "next/server";
import { calculateWinners } from "@/lib/winners";

export const dynamic = "force-dynamic";

/**
 * GET /api/winners
 * Returns verified community champions authoritatively calculated from upvotes.
 * Query Parameters:
 * - period: "weekly" | "monthly" | "quarterly" | "yearly" | "all" (default: "monthly")
 * - month: "YYYY-MM" (e.g. "2026-10" for October 2026, defaults to current month)
 * - year: "YYYY" (e.g. "2026")
 * - limit: number of winners to return (default 20, max 100)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "monthly";
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const limit = Number(searchParams.get("limit")) || 20;

    const result = await calculateWinners({
      period,
      month,
      year,
      limit,
    });

    if (!result.ok && result.error) {
      return NextResponse.json(
        { ok: false, message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : "Internal server error calculating winners",
      },
      { status: 500 }
    );
  }
}

