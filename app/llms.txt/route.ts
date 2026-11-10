import { NextResponse } from "next/server";
import { getSeoConfig, buildLlmsTxt } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * Route handler for /llms.txt (LLM & AI Web Crawler Discovery).
 * Consumed by modern AI search engines (Perplexity, ChatGPT, Claude, Gemini).
 */
export async function GET() {
  const config = await getSeoConfig();
  const text = buildLlmsTxt(config);

  return new NextResponse(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
