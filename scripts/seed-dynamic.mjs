import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Checking Supabase connection to:", supabaseUrl);

  // 1. Check existing categories
  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, slug, name");

  if (catErr) {
    console.error("Error fetching categories:", catErr);
    return;
  }

  console.log(`Found ${categories.length} categories.`);
  const catMap = new Map();
  categories.forEach((c) => {
    catMap.set(c.slug, c.id);
  });
  const fallbackCatId = categories[0]?.id || 1;

  // 2. Seed Listings definition
  const listingsToSeed = [
    {
      slug: "cortex-ai",
      name: "Cortex AI",
      tagline: "Autonomous customer success agents for modern B2B SaaS teams.",
      description_short: "Cortex ingests docs, issue trackers, and ticketing history to autonomously resolve 68% of enterprise support tickets in real-time.",
      description_long: "Cortex AI empowers high-velocity SaaS teams to deliver 24/7 autonomous customer support with human-grade empathy and deep product reasoning. It connects natively to Linear, GitHub, Zendesk, and Stripe to diagnose user issues, run database lookups, and execute remediation workflows without manual human intervention. Backed by state-of-the-art reasoning models and fine-tuned on over 10M SaaS support conversations.",
      website_url: "https://cortexflow.ai",
      logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("ai-agents") || fallbackCatId,
      pricing_model: "freemium",
      starting_price: 29,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "featured",
      listing_plan_price: 49,
      status: "approved",
      submitted_by_email: "austin.miller@cortex.ai",
    },
    {
      slug: "vector-flow",
      name: "VectorFlow",
      tagline: "Instant vector database deployment with zero cold starts.",
      description_short: "Serverless embedding indexer engineered for real-time semantic search and low-latency RAG applications at scale.",
      description_long: "VectorFlow gives developers ultra-low-latency vector search without the burden of managing dedicated cluster infrastructure. Featuring instant cold-start indexing, native hybrid keyword-vector querying, and millisecond ANN searches across hundreds of millions of embeddings. Integrated with OpenAI, Cohere, Anthropic, and Hugging Face with one-click SDK setup for TypeScript and Python.",
      website_url: "https://vectorflow.io",
      logo_url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("developer-tools") || fallbackCatId,
      pricing_model: "paid",
      starting_price: 49,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "featured",
      listing_plan_price: 49,
      status: "approved",
      submitted_by_email: "elena.rostova@vectorflow.io",
    },
    {
      slug: "prism-studio",
      name: "Prism Studio",
      tagline: "Turn design system tokens into production React code.",
      description_short: "A bi-directional sync engine connecting Figma styles, Tailwind v4 theme variables, and shadcn component libraries.",
      description_long: "Prism Studio bridges the gap between designers and software engineers by synchronizing design tokens directly from Figma into ready-to-ship TypeScript code. When design variables update in Figma, Prism automatically opens pull requests with validated CSS custom properties, Tailwind v4 themes, and accessible UI primitives.",
      website_url: "https://prismstudio.dev",
      logo_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("design") || fallbackCatId,
      pricing_model: "freemium",
      starting_price: 19,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "featured",
      listing_plan_price: 49,
      status: "approved",
      submitted_by_email: "steven.vance@prismstudio.dev",
    },
    {
      slug: "supaship",
      name: "Supaship",
      tagline: "Ship your Next.js SaaS in days. Auth, Stripe and DB ready.",
      description_short: "The production Next.js boilerplate trusted by 2,400+ indie makers to launch profitable SaaS applications.",
      description_long: "Supaship comes pre-configured with Supabase authentication, server actions, Stripe & LemonSqueezy subscriptions, transactional Resend emails, and responsive Tailwind components. Spend less time wrestling with auth configs and more time validating your product idea.",
      website_url: "https://supaship.io",
      logo_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("building-products") || fallbackCatId,
      pricing_model: "paid",
      starting_price: 79,
      currency: "USD",
      billing_period: "one_time",
      listing_plan: "featured",
      listing_plan_price: 49,
      status: "approved",
      submitted_by_email: "alex.hunt@supaship.io",
    },
    {
      slug: "aether-db",
      name: "AetherDB",
      tagline: "Serverless Postgres with instant branching.",
      description_short: "Instant copy-on-write database branches for every preview environment, PR, and staging deployment.",
      description_long: "AetherDB gives engineering teams isolated database branches that spin up in under 500ms. Perfect for CI/CD test automation, ephemeral PR previews, and local schema migrations without polluting production data.",
      website_url: "https://aetherdb.com",
      logo_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("developer-tools") || fallbackCatId,
      pricing_model: "freemium",
      starting_price: 25,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "featured",
      listing_plan_price: 49,
      status: "approved",
      submitted_by_email: "marcus.chen@aetherdb.com",
    },
    {
      slug: "agent-flow",
      name: "AgentFlow",
      tagline: "Visual canvas for multi-agent workflows.",
      description_short: "Drag-and-drop node graph builder for orchestrating autonomous AI agent swarms and tool calling.",
      description_long: "AgentFlow makes building autonomous multi-agent pipelines as simple as connecting nodes on a canvas. Combine Claude, GPT-4, and custom tool endpoints with visual loopers, guardrail filters, and memory state checkpoints.",
      website_url: "https://agentflow.ai",
      logo_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("ai-agents") || fallbackCatId,
      pricing_model: "freemium",
      starting_price: 39,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "featured",
      listing_plan_price: 49,
      status: "approved",
      submitted_by_email: "sarah.jenkins@agentflow.ai",
    },
    {
      slug: "pulse-grid",
      name: "PulseGrid",
      tagline: "Minimalist server health and cron monitoring for indie teams.",
      description_short: "Real-time heartbeat monitoring, ping latency tracking, and dead-man switch alerts via Telegram, Slack and SMS.",
      description_long: "PulseGrid was built for bootstrapped developers who need reliable infrastructure monitoring without enterprise Bloatware. Set up 1-minute HTTP, TCP, SSL, and Cron checks with gorgeous public status pages.",
      website_url: "https://pulsegrid.net",
      logo_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("monitoring") || fallbackCatId,
      pricing_model: "freemium",
      starting_price: 15,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "premium",
      listing_plan_price: 29,
      status: "approved",
      submitted_by_email: "david.k@pulsegrid.net",
    },
    {
      slug: "prompt-smith",
      name: "PromptSmith",
      tagline: "Automated prompt regression testing and cost optimization for LLMs.",
      description_short: "Continuous integration for AI prompts. Catch regressions, optimize token usage, and evaluate outputs automatically.",
      description_long: "PromptSmith runs automated assertion suites on every prompt revision to prevent hallucination regressions before shipping to production. Compare provider costs between Anthropic, OpenAI, and open-source models with automated batch benchmarks.",
      website_url: "https://promptsmith.ai",
      logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("artificial-intelligence") || fallbackCatId,
      pricing_model: "paid",
      starting_price: 35,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "premium",
      listing_plan_price: 29,
      status: "approved",
      submitted_by_email: "kevin.t@promptsmith.ai",
    },
    {
      slug: "supaship-native",
      name: "Supaship Native",
      tagline: "Ship Next.js web apps directly to production iOS and Android.",
      description_short: "Zero-config Capacitor and React Native bridges wrapping your existing Next.js web app into native app store packages.",
      description_long: "Supaship Native enables Next.js founders to publish to the Apple App Store and Google Play Store without rewriting a single line of React code. Includes in-app purchases, push notifications, biometric FaceID, and deep link routing.",
      website_url: "https://supaship.io/native",
      logo_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("building-products") || fallbackCatId,
      pricing_model: "paid",
      starting_price: 99,
      currency: "USD",
      billing_period: "one_time",
      listing_plan: "premium",
      listing_plan_price: 29,
      status: "approved",
      submitted_by_email: "alex.hunt@supaship.io",
    },
    {
      slug: "trace-kit",
      name: "TraceKit",
      tagline: "Distributed OpenTelemetry logging with zero-instrumentation config.",
      description_short: "Lightweight trace collector and APM dashboard designed specifically for edge functions and serverless runtimes.",
      description_long: "TraceKit automatically maps waterfall execution times across edge worker invocations, database queries, and third-party API calls. Identify cold-start bottlenecks and SQL latency outliers without slowing down your app.",
      website_url: "https://tracekit.io",
      logo_url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("developer-tools") || fallbackCatId,
      pricing_model: "freemium",
      starting_price: 20,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "premium",
      listing_plan_price: 29,
      status: "approved",
      submitted_by_email: "rachel.m@tracekit.io",
    },
    {
      slug: "docu-morph",
      name: "DocuMorph",
      tagline: "Instant AI-powered PDF extraction, OCR and structured JSON export.",
      description_short: "Extract tables, receipts, invoices, and contracts into typed JSON schemas with 99.4% field accuracy.",
      description_long: "DocuMorph eliminates manual document data entry. Simply upload any scanned PDF or image, define your desired JSON schema, and receive parsed, validated structured data via webhooks in seconds.",
      website_url: "https://documorph.io",
      logo_url: "https://images.unsplash.com/photo-1568667256549-094345857637?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("pdf-documents") || fallbackCatId,
      pricing_model: "free",
      starting_price: null,
      currency: "USD",
      billing_period: null,
      listing_plan: "free",
      listing_plan_price: 0,
      status: "approved",
      submitted_by_email: "lisa.w@documorph.io",
    },
    {
      slug: "mail-craft",
      name: "MailCraft",
      tagline: "Beautiful drag-and-drop newsletter builder with React email components.",
      description_short: "Craft bulletproof responsive marketing emails that render pixel-perfect across Gmail, Outlook, and Apple Mail.",
      description_long: "MailCraft combines the visual flexibility of a canvas builder with the maintainability of React Email. Export ready-to-send HTML templates or trigger automated broadcasts through SendGrid, Postmark, or AWS SES.",
      website_url: "https://mailcraft.email",
      logo_url: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("email-marketing") || fallbackCatId,
      pricing_model: "freemium",
      starting_price: 29,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "premium",
      listing_plan_price: 29,
      status: "approved",
      submitted_by_email: "chris.b@mailcraft.email",
    },
    {
      slug: "seo-engine",
      name: "SEOEngine",
      tagline: "Programmatic keyword clustering and landing page generation.",
      description_short: "Scale high-intent programmatic SEO content targeting long-tail queries without keyword cannibalization.",
      description_long: "SEOEngine analyzes SERP competitors and clusters keywords into semantic content hubs. Generates Next.js ISR page templates with verified schema markup, canonical links, and OpenGraph social cards.",
      website_url: "https://seoengine.app",
      logo_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("seo") || fallbackCatId,
      pricing_model: "paid",
      starting_price: 49,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "premium",
      listing_plan_price: 29,
      status: "approved",
      submitted_by_email: "sam.seo@seoengine.app",
    },
    {
      slug: "omni-chat",
      name: "OmniChat",
      tagline: "Omnichannel customer support widget syncing WhatsApp, Telegram and email.",
      description_short: "One unified inbox for all inbound customer inquiries with AI auto-drafts and team assignments.",
      description_long: "OmniChat centralizes conversations across web chat, WhatsApp Business, Apple Messages, and Telegram into a single collaborative workspace for customer service teams.",
      website_url: "https://omnichat.co",
      logo_url: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("chatbots") || fallbackCatId,
      pricing_model: "freemium",
      starting_price: 19,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "free",
      listing_plan_price: 0,
      status: "approved",
      submitted_by_email: "victor.p@omnichat.co",
    },
    {
      slug: "fin-track-pro",
      name: "FinTrack Pro",
      tagline: "Subscription analytics, churn prediction and automated dunning for SaaS.",
      description_short: "Track real-time MRR, net revenue retention (NRR), and recover failed credit card payments automatically.",
      description_long: "FinTrack Pro connects directly to Stripe, Paddle, and Razorpay to deliver deep SaaS financial metrics. Automated smart dunning retries failed subscription invoices, recovering up to 64% of involuntary churn.",
      website_url: "https://fintrack.finance",
      logo_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&h=200&fit=crop&q=80",
      category_id: catMap.get("fintech") || fallbackCatId,
      pricing_model: "freemium",
      starting_price: 49,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "premium",
      listing_plan_price: 29,
      status: "approved",
      submitted_by_email: "emma.c@fintrack.finance",
    },
  ];

  console.log(`Upserting ${listingsToSeed.length} listings...`);
  for (const item of listingsToSeed) {
    const { data: upserted, error: upErr } = await supabase
      .from("listings")
      .upsert(
        {
          ...item,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select("id, slug, name")
      .single();

    if (upErr) {
      console.error(`Failed to upsert listing ${item.slug}:`, upErr.message);
    } else {
      console.log(`✓ Seeded listing: ${upserted.name} (id: ${upserted.id}, slug: ${upserted.slug})`);

      // Add screenshot
      await supabase.from("listing_screenshots").delete().eq("listing_id", upserted.id);
      await supabase.from("listing_screenshots").insert([
        {
          listing_id: upserted.id,
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop&q=80",
          position: 0,
        },
      ]);
    }
  }

  console.log("Seeding finished successfully!");
}

main().catch(console.error);

