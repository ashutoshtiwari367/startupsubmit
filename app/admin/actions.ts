"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";
import { emitListingApproved, emitListingRejected } from "@/lib/events";

/**
 * Server Action: approveListing(id)
 * 1. Re-verifies caller is an authenticated allowlisted admin on the server
 * 2. Updates listing status = 'approved' and approved_at = now()
 * 3. Emits 'listing_approved' event
 */
export async function approveListing(id: string) {
  // Authoritative server-side admin check (enforced inside the action itself)
  const admin = await requireAdminUser();

  const listingId = String(id || "").trim();
  if (!listingId) {
    throw new Error("Listing ID is required.");
  }

  const nowIso = new Date().toISOString();

  const { data: updatedListing, error } = await db
    .from("listings")
    .update({
      status: "approved",
      approved_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", listingId)
    .select(
      "id, slug, name, tagline, description_short, description_long, website_url, logo_url, category_id, pricing_model, status, submitted_by_email, created_at, updated_at, approved_at"
    )
    .single();

  if (error || !updatedListing) {
    throw new Error(error?.message || "Listing not found.");
  }

  const eventResult = await emitListingApproved({
    listing_id: updatedListing.id,
    name: updatedListing.name,
    slug: updatedListing.slug,
    submitted_by_email: updatedListing.submitted_by_email,
    category_id: updatedListing.category_id,
    pricing_model: updatedListing.pricing_model,
    website_url: updatedListing.website_url,
    approved_at: updatedListing.approved_at || nowIso,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/queue");
  revalidatePath("/");
  revalidatePath(`/product/${updatedListing.slug}`);

  return {
    ok: true,
    message: `Listing '${updatedListing.name}' approved by ${admin.email}.`,
    listing: updatedListing,
    event: eventResult,
  };
}

/**
 * Server Action: rejectListing(id)
 * 1. Re-verifies caller is an authenticated allowlisted admin on the server
 * 2. Updates listing status = 'rejected' and approved_at = null
 * 3. Emits 'listing_rejected' event
 */
export async function rejectListing(id: string) {
  // Authoritative server-side admin check (enforced inside the action itself)
  const admin = await requireAdminUser();

  const listingId = String(id || "").trim();
  if (!listingId) {
    throw new Error("Listing ID is required.");
  }

  const nowIso = new Date().toISOString();

  const { data: updatedListing, error } = await db
    .from("listings")
    .update({
      status: "rejected",
      approved_at: null,
      updated_at: nowIso,
    })
    .eq("id", listingId)
    .select(
      "id, slug, name, tagline, description_short, description_long, website_url, logo_url, category_id, pricing_model, status, submitted_by_email, created_at, updated_at, approved_at"
    )
    .single();

  if (error || !updatedListing) {
    throw new Error(error?.message || "Listing not found.");
  }

  const eventResult = await emitListingRejected({
    listing_id: updatedListing.id,
    name: updatedListing.name,
    slug: updatedListing.slug,
    submitted_by_email: updatedListing.submitted_by_email,
    category_id: updatedListing.category_id,
    pricing_model: updatedListing.pricing_model,
    website_url: updatedListing.website_url,
    rejected_at: nowIso,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/queue");
  revalidatePath("/");

  return {
    ok: true,
    message: `Listing '${updatedListing.name}' rejected by ${admin.email}.`,
    listing: updatedListing,
    event: eventResult,
  };
}

