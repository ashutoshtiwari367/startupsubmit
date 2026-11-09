import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_CATEGORIES = [
  {
    slug: "ai",
    name: "AI",
    description: "Artificial intelligence, LLM agents, and machine learning tools",
  },
  {
    slug: "productivity",
    name: "Productivity",
    description: "Workflow automation, workspace, and time-saving apps",
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "SEO, growth, content creation, and sales enablement tools",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    description: "APIs, SDKs, cloud infrastructure, and coding utilities",
  },
  {
    slug: "design-ux",
    name: "Design & UX",
    description: "UI kits, prototyping, graphics, and creative suites",
  },
  {
    slug: "saas-tools",
    name: "SaaS & Tools",
    description: "B2B software and business operations platforms",
  },
  {
    slug: "analytics-data",
    name: "Analytics & Data",
    description: "Business intelligence, metrics, and data pipelines",
  },
  {
    slug: "finance-fintech",
    name: "Finance & FinTech",
    description: "Billing, accounting, payments, and financial tools",
  },
  {
    slug: "video-content",
    name: "Video & Content",
    description: "Video editing, audio generation, and creator tools",
  },
  {
    slug: "e-commerce",
    name: "E-commerce",
    description: "Online store builders, conversion, and retail tools",
  },
];

/**
 * GET /api/categories
 * Returns all categories from public.categories for populating the SubmitForm <select>.
 */
export async function GET() {
  try {
    const { data, error } = await db
      .from("categories")
      .select("id, slug, name, description, created_at")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message, categories: [] },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await db
        .from("categories")
        .upsert(DEFAULT_CATEGORIES, { onConflict: "slug" })
        .select("id, slug, name, description, created_at")
        .order("name", { ascending: true });

      if (!seedError && seeded) {
        return NextResponse.json({ ok: true, categories: seeded });
      }
    }

    return NextResponse.json({
      ok: true,
      categories: data || [],
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load categories";
    return NextResponse.json(
      { ok: false, message, categories: [] },
      { status: 500 }
    );
  }
}

