import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";
import { emitListingApproved, emitListingRejected } from "@/lib/events";

/**
 * PATCH /api/admin/listings/[id]
 * Approves or rejects a listing in the moderation queue:
 * - approve -> status = 'approved', approved_at = now(), emits 'listing_approved'
 * - reject  -> status = 'rejected', approved_at = null, emits 'listing_rejected'
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json(
      { ok: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    const listingId = Number(id);
    if (!Number.isInteger(listingId) || listingId <= 0) {
      return NextResponse.json(
        { ok: false, message: "Invalid listing ID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const action =
      typeof body?.action === "string" ? body.action.trim().toLowerCase() : "";

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid moderation action. Must be 'approve' or 'reject'.",
        },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const updatePayload =
      action === "approve"
        ? {
            status: "approved" as const,
            approved_at: nowIso,
            updated_at: nowIso,
          }
        : {
            status: "rejected" as const,
            approved_at: null,
            updated_at: nowIso,
          };

    const { data: updatedListing, error } = await db
      .from("listings")
      .update(updatePayload)
      .eq("id", listingId)
      .select(
        "id, slug, name, tagline, description_short, description_long, website_url, logo_url, category_id, pricing_model, status, submitted_by_email, created_at, updated_at, approved_at"
      )
      .single();

    if (error || !updatedListing) {
      return NextResponse.json(
        {
          ok: false,
          message: error?.message || "Listing not found.",
        },
        { status: error ? 500 : 404 }
      );
    }

    // Emit corresponding lifecycle event
    const eventResult =
      action === "approve"
        ? await emitListingApproved({
            listing_id: updatedListing.id,
            name: updatedListing.name,
            slug: updatedListing.slug,
            submitted_by_email: updatedListing.submitted_by_email,
            category_id: updatedListing.category_id,
            pricing_model: updatedListing.pricing_model,
            website_url: updatedListing.website_url,
            approved_at: updatedListing.approved_at || nowIso,
          })
        : await emitListingRejected({
            listing_id: updatedListing.id,
            name: updatedListing.name,
            slug: updatedListing.slug,
            submitted_by_email: updatedListing.submitted_by_email,
            category_id: updatedListing.category_id,
            pricing_model: updatedListing.pricing_model,
            website_url: updatedListing.website_url,
            rejected_at: nowIso,
          });

    return NextResponse.json({
      ok: true,
      message: `Listing '${updatedListing.name}' marked as ${updatedListing.status}.`,
      listing: updatedListing,
      event: eventResult,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to moderate listing";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

