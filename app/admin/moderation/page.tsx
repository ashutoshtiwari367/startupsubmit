import React from "react";
import { notFound } from "next/navigation";
import { isAdminServerSession } from "@/lib/admin-auth";
import { AdminModerationClient } from "@/components/AdminModerationClient";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const isAdmin = await isAdminServerSession();
  if (!isAdmin) {
    notFound();
  }

  return <AdminModerationClient />;
}

