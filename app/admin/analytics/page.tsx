import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { isAdminServerSession } from "@/lib/admin-auth";
import { getDashboardAnalytics } from "@/lib/analytics";
import {
  AdminAnalyticsClient,
  type AdminAnalyticsListingItem,
} from "@/components/AdminAnalyticsClient";

export const dynamic = "force-dynamic";

/**
 * Auth-gated /admin/analytics page.
 * Non-admins receive an immediate 404 response so the admin surface remains hidden.
 */
export default async function AdminAnalyticsPage() {
  const isAdmin = await isAdminServerSession();
  if (!isAdmin) {
    notFound();
  }

  const [listingsRes, initialAnalytics] = await Promise.all([
    db
      .from("listings")
      .select("id, name, slug, status, submitted_by_email, created_at")
      .order("name", { ascending: true }),
    getDashboardAnalytics({
      timeRange: "30d",
      filterByEmail: null, // Full directory aggregate
    }),
  ]);

  const allListings: AdminAnalyticsListingItem[] = (listingsRes.data || []).map(
    (item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      status: item.status,
      submitted_by_email: item.submitted_by_email,
      created_at: item.created_at,
    })
  );

  return (
    <AdminAnalyticsClient
      initialAnalytics={initialAnalytics}
      allListings={allListings}
    />
  );
}

