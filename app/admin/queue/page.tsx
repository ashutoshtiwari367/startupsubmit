import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { isAdminServerSession } from "@/lib/admin-auth";
import {
  AdminQueueClient,
  type PendingQueueItem,
} from "@/components/AdminQueueClient";

export const dynamic = "force-dynamic";

/**
 * Server Component: /admin/queue
 * - Verifies caller is an authenticated allowlisted admin server-side
 * - Fetches all listings where status = 'pending' along with category + screenshots
 * - Renders <AdminQueueClient /> wired to approveListing / rejectListing server actions
 */
export default async function AdminQueuePage() {
  const isAdmin = await isAdminServerSession();
  if (!isAdmin) {
    notFound();
  }

  const { data, error } = await db
    .from("listings")
    .select(
      `
      id,
      slug,
      name,
      tagline,
      description_short,
      description_long,
      website_url,
      logo_url,
      category_id,
      pricing_model,
      status,
      submitted_by_email,
      created_at,
      updated_at,
      approved_at,
      categories (
        id,
        slug,
        name
      ),
      listing_screenshots (
        id,
        url,
        position
      )
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const pendingListings: PendingQueueItem[] = ((data as PendingQueueItem[] | null) ?? []).map(
    (row) => ({
      ...row,
      listing_screenshots: Array.isArray(row.listing_screenshots)
        ? [...row.listing_screenshots].sort((a, b) => a.position - b.position)
        : [],
    })
  );

  if (error) {
    console.error("[/admin/queue] Failed to load pending listings:", error.message);
  }

  return <AdminQueueClient initialListings={pendingListings} />;
}

