import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_CATEGORIES = [
  { slug: "artificial-intelligence", name: "Artificial Intelligence", description: "Machine learning, neural networks, LLMs, and foundation models" },
  { slug: "productivity", name: "Productivity", description: "Workflow automation, task management, notes, and focus utilities" },
  { slug: "marketing", name: "Marketing", description: "Growth, advertising, funnel optimization, and acquisition tools" },
  { slug: "ai-agents", name: "AI Agents", description: "Autonomous agents, multi-agent frameworks, and AI workflows" },
  { slug: "developer-tools", name: "Developer Tools", description: "CLIs, SDKs, dev infrastructure, testing, and debugging utilities" },
  { slug: "writing", name: "Writing", description: "AI copywriters, grammar checkers, technical docs, and storytelling" },
  { slug: "building-products", name: "Building Products", description: "Product management, roadmaps, customer feedback, and shipping tools" },
  { slug: "directories", name: "Directories", description: "Product launch boards, curated lists, and niche directory platforms" },
  { slug: "video", name: "Video", description: "Video editing, screen recording, streaming, and generative video tools" },
  { slug: "seo", name: "SEO", description: "Backlink checkers, keyword intelligence, rank trackers, and SERP tooling" },
  { slug: "social-media", name: "Social Media", description: "Post schedulers, audience growth, engagement bots, and social analytics" },
  { slug: "chatbots", name: "Chatbots", description: "Conversational AI, custom knowledge bots, and customer live chat" },
  { slug: "education", name: "Education", description: "EdTech, online courses, flashcards, and student learning software" },
  { slug: "analytics", name: "Analytics", description: "Web analytics, product telemetry, dashboards, and data visualization" },
  { slug: "no-code", name: "No Code", description: "Visual app builders, workflow triggers, and rapid prototyping tools" },
  { slug: "automation", name: "Automation", description: "Zapier alternatives, robotic process automation, and webhook runners" },
  { slug: "design", name: "Design", description: "UI/UX components, vector graphics, prototyping, and design systems" },
  { slug: "fintech", name: "Fintech", description: "Invoicing, billing, accounting, payments, and financial management" },
  { slug: "image", name: "Image", description: "AI image generators, background removers, and photo enhancement tools" },
  { slug: "sales", name: "Sales", description: "CRMs, lead enrichment, cold email outreach, and pipeline tracking" },
  { slug: "website-builders", name: "Website Builders", description: "Landing page generators, static site builders, and portfolio tools" },
  { slug: "customer-support", name: "Customer Support", description: "Help desks, ticket routing, feedback widgets, and support portals" },
  { slug: "freelancer-tools", name: "Freelancer Tools", description: "Contracts, time tracking, proposal generators, and client portals" },
  { slug: "audio-music", name: "Audio & Music", description: "Voice cloning, podcast mastering, AI music generation, and audio editors" },
  { slug: "community", name: "Community", description: "Forums, community moderation, memberships, and discussion platforms" },
  { slug: "content-creation", name: "Content Creation", description: "Multi-channel publishing, content repurposing, and media generation" },
  { slug: "e-commerce", name: "E-commerce", description: "Online storefronts, inventory, checkout, and merchant tooling" },
  { slug: "email-marketing", name: "Email Marketing", description: "Newsletter delivery, campaign sequences, deliverability, and warmups" },
  { slug: "health-fitness", name: "Health & Fitness", description: "Wellness trackers, workout planners, mental health, and nutrition apps" },
  { slug: "remote-work", name: "Remote Work", description: "HR, distributed workforce, asynchronous collaboration, and team operations" },
  { slug: "chrome-extensions", name: "Chrome Extensions", description: "Browser utilities, web scrapers, and sidebar productivity add-ons" },
  { slug: "developer-apis", name: "Developer APIs", description: "Public REST/GraphQL APIs, webhooks, authentication, and data feeds" },
  { slug: "ios", name: "iOS", description: "Native iOS, iPadOS, and macOS apps crafted for Apple platforms" },
  { slug: "monitoring", name: "Monitoring", description: "Uptime monitoring, error tracing, server health, and log aggregation" },
  { slug: "pdf-documents", name: "PDF & Documents", description: "PDF editors, digital signatures, optical character recognition, and docs" }
];

/**
 * GET /api/categories
 * Returns all categories from public.categories for populating the SubmitForm <select>.
 */
export async function GET() {
  try {
    let queryRes: any = await db
      .from("categories")
      .select("id, slug, name, description, parent_id, created_at")
      .order("name", { ascending: true });

    if (
      queryRes.error &&
      (queryRes.error.message.includes("parent_id") || queryRes.error.code === "42703")
    ) {
      queryRes = await db
        .from("categories")
        .select("id, slug, name, description, created_at")
        .order("name", { ascending: true });
    }

    const { data, error } = queryRes;

    if (error) {
      console.warn("[/api/categories] Supabase query notice:", error.message);
      return NextResponse.json({
        ok: true,
        categories: DEFAULT_CATEGORIES.map((cat, idx) => ({
          id: idx + 1,
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          created_at: new Date().toISOString(),
        })),
      });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        ok: true,
        categories: DEFAULT_CATEGORIES.map((cat, idx) => ({
          id: idx + 1,
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          count: 0,
          tool_count: 0,
          created_at: new Date().toISOString(),
        })),
      });
    }

    // Query approved listings to calculate real tool counts per category (strictly no fake numbers)
    const countMap = new Map<number, number>();
    try {
      const { data: listings } = await db
        .from("listings")
        .select("category_id")
        .eq("status", "approved");

      if (Array.isArray(listings)) {
        for (const item of listings) {
          const cid = Number(item.category_id);
          if (cid) {
            countMap.set(cid, (countMap.get(cid) || 0) + 1);
          }
        }
      }
    } catch {}

    const categoriesWithCounts = (data || []).map((cat: any) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description || "",
      parent_id: cat.parent_id || null,
      count: countMap.get(Number(cat.id)) || 0,
      tool_count: countMap.get(Number(cat.id)) || 0,
      created_at: cat.created_at,
    }));

    return NextResponse.json({
      ok: true,
      categories: categoriesWithCounts,
    });
  } catch (err: unknown) {
    console.warn(
      "[/api/categories] Unexpected catch, falling back to defaults:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({
      ok: true,
      categories: DEFAULT_CATEGORIES.map((cat, idx) => ({
        id: idx + 1,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        count: 0,
        tool_count: 0,
        created_at: new Date().toISOString(),
      })),
    });
  }
}
