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
 * Auth-gated /admin page.
 * Non-admins immediately receive a 404 response so the admin surface stays hidden.
 */
export default async function AdminPage() {
  const isAdmin = await isAdminServerSession();
  if (!isAdmin) {
    notFound();
  }

  const [pendingRes, approvedRes] = await Promise.all([
    db
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
      .order("created_at", { ascending: false }),
    db
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
      .eq("status", "approved")
      .order("approved_at", { ascending: false }),
  ]);

  const mapRows = (rows: any[] | null): PendingQueueItem[] =>
    (rows ?? []).map((row) => ({
      ...row,
      listing_screenshots: Array.isArray(row.listing_screenshots)
        ? [...row.listing_screenshots].sort((a, b) => a.position - b.position)
        : [],
    }));

  const pendingListings = mapRows(pendingRes.data);
  const approvedListings = mapRows(approvedRes.data);

  return (
    <AdminQueueClient
      initialListings={pendingListings}
      initialApprovedListings={approvedListings}
    />
  );
}
