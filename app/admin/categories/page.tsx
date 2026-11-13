import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { isAdminServerSession } from "@/lib/admin-auth";
import { getCategorySuggestions } from "@/lib/category-suggestions";
import { AdminCategorySuggestionsClient } from "@/components/AdminCategorySuggestionsClient";

export const dynamic = "force-dynamic";

/**
 * Auth-gated /admin/categories page.
 * Non-admins receive a 404 response so the admin surface remains hidden.
 */
export default async function AdminCategoriesPage() {
  const isAdmin = await isAdminServerSession();
  if (!isAdmin) {
    notFound();
  }

  const [suggestionsData, categoriesRes] = await Promise.all([
    getCategorySuggestions({ status: "all", limit: 100 }),
    db
      .from("categories")
      .select("id, slug, name, parent_id")
      .order("name", { ascending: true }),
  ]);

  let allCategories: {
    id: number;
    slug: string;
    name: string;
    parent_id?: number | null;
  }[] = (categoriesRes.data as any) || [];

  // Gracefully handle if parent_id column does not exist yet
  if (categoriesRes.error) {
    const fallbackRes = await db
      .from("categories")
      .select("id, slug, name")
      .order("name", { ascending: true });
    allCategories = (fallbackRes.data as any) || [];
  }

  return (
    <AdminCategorySuggestionsClient
      initialSuggestions={suggestionsData.suggestions}
      initialCounts={suggestionsData.counts}
      allCategories={allCategories}
    />
  );
}

