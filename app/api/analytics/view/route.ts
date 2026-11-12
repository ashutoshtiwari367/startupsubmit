import { NextRequest, NextResponse } from "next/server";
import { recordListingView } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawListingId = body.listing_id ?? body.listingId;
    const listingId = Number(String(rawListingId ?? "").trim());

    if (!Number.isFinite(listingId) || listingId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Valid numeric listing_id is required." },
        { status: 400 }
      );
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const result = await recordListingView({
      listingId,
      ip,
      userAgent,
      dedupWindowMinutes: 30,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Failed to record view." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      deduplicated: result.deduplicated ?? false,
      isBot: result.isBot ?? false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

