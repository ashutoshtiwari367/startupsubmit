import { NextRequest, NextResponse } from "next/server";
import { recordWebsiteClick } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get("id") || searchParams.get("listing_id");
  const listingId = Number(String(rawId ?? "").trim());

  if (!Number.isFinite(listingId) || listingId <= 0) {
    return NextResponse.json(
      { ok: false, error: "Valid numeric listing ID is required." },
      { status: 400 }
    );
  }

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";

  const result = await recordWebsiteClick({
    listingId,
    ip,
    userAgent,
  });

  if (!result.ok || !result.destinationUrl) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect to verified destination URL from database
  return NextResponse.redirect(result.destinationUrl, { status: 302 });
}

