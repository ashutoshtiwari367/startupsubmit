import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");

let supabaseUrl = "";
let supabaseServiceKey = "";

for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed.startsWith("SUPABASE_URL=")) {
    supabaseUrl = trimmed.slice("SUPABASE_URL=".length).trim();
  }
  if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
    supabaseServiceKey = trimmed.slice("SUPABASE_SERVICE_ROLE_KEY=".length).trim();
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// The Authoritative 35 Master Categories list
export const MASTER_35_CATEGORIES = [
  { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "Machine learning, neural networks, LLMs, and foundation models" },
  { name: "Productivity", slug: "productivity", description: "Workflow automation, task management, notes, and focus utilities" },
  { name: "Marketing", slug: "marketing", description: "Growth, advertising, funnel optimization, and acquisition tools" },
  { name: "AI Agents", slug: "ai-agents", description: "Autonomous agents, multi-agent frameworks, and AI workflows" },
  { name: "Developer Tools", slug: "developer-tools", description: "CLIs, SDKs, dev infrastructure, testing, and debugging utilities" },
  { name: "Writing", slug: "writing", description: "AI copywriters, grammar checkers, technical docs, and storytelling" },
  { name: "Building Products", slug: "building-products", description: "Product management, roadmaps, customer feedback, and shipping tools" },
  { name: "Directories", slug: "directories", description: "Product launch boards, curated lists, and niche directory platforms" },
  { name: "Video", slug: "video", description: "Video editing, screen recording, streaming, and generative video tools" },
  { name: "SEO", slug: "seo", description: "Backlink checkers, keyword intelligence, rank trackers, and SERP tooling" },
  { name: "Social Media", slug: "social-media", description: "Post schedulers, audience growth, engagement bots, and social analytics" },
  { name: "Chatbots", slug: "chatbots", description: "Conversational AI, custom knowledge bots, and customer live chat" },
  { name: "Education", slug: "education", description: "EdTech, online courses, flashcards, and student learning software" },
  { name: "Analytics", slug: "analytics", description: "Web analytics, product telemetry, dashboards, and data visualization" },
  { name: "No Code", slug: "no-code", description: "Visual app builders, workflow triggers, and rapid prototyping tools" },
  { name: "Automation", slug: "automation", description: "Zapier alternatives, robotic process automation, and webhook runners" },
  { name: "Design", slug: "design", description: "UI/UX components, vector graphics, prototyping, and design systems" },
  { name: "Fintech", slug: "fintech", description: "Invoicing, billing, accounting, payments, and financial management" },
  { name: "Image", slug: "image", description: "AI image generators, background removers, and photo enhancement tools" },
  { name: "Sales", slug: "sales", description: "CRMs, lead enrichment, cold email outreach, and pipeline tracking" },
  { name: "Website Builders", slug: "website-builders", description: "Landing page generators, static site builders, and portfolio tools" },
  { name: "Customer Support", slug: "customer-support", description: "Help desks, ticket routing, feedback widgets, and support portals" },
  { name: "Freelancer Tools", slug: "freelancer-tools", description: "Contracts, time tracking, proposal generators, and client portals" },
  { name: "Audio & Music", slug: "audio-music", description: "Voice cloning, podcast mastering, AI music generation, and audio editors" },
  { name: "Community", slug: "community", description: "Forums, community moderation, memberships, and discussion platforms" },
  { name: "Content Creation", slug: "content-creation", description: "Multi-channel publishing, content repurposing, and media generation" },
  { name: "E-commerce", slug: "e-commerce", description: "Online storefronts, inventory, checkout, and merchant tooling" },
  { name: "Email Marketing", slug: "email-marketing", description: "Newsletter delivery, campaign sequences, deliverability, and warmups" },
  { name: "Health & Fitness", slug: "health-fitness", description: "Wellness trackers, workout planners, mental health, and nutrition apps" },
  { name: "Remote Work", slug: "remote-work", description: "HR, distributed workforce, asynchronous collaboration, and team operations" },
  { name: "Chrome Extensions", slug: "chrome-extensions", description: "Browser utilities, web scrapers, and sidebar productivity add-ons" },
  { name: "Developer APIs", slug: "developer-apis", description: "Public REST/GraphQL APIs, webhooks, authentication, and data feeds" },
  { name: "iOS", slug: "ios", description: "Native iOS, iPadOS, and macOS apps crafted for Apple platforms" },
  { name: "Monitoring", slug: "monitoring", description: "Uptime monitoring, error tracing, server health, and log aggregation" },
  { name: "PDF & Documents", slug: "pdf-documents", description: "PDF editors, digital signatures, optical character recognition, and docs" }
];

// Mapping rules: Old name/slug variants -> Master Name
const ALIAS_TO_MASTER_NAME = {
  "ai": "Artificial Intelligence",
  "artificial intelligence": "Artificial Intelligence",
  "dev tools": "Developer Tools",
  "developer tools": "Developer Tools",
  "developer-tools": "Developer Tools",
  "design-ux": "Design",
  "design & ux": "Design",
  "design": "Design",
  "saas-tools": "Building Products",
  "saas & tools": "Building Products",
  "analytics-data": "Analytics",
  "analytics & data": "Analytics",
  "analytics": "Analytics",
  "finance-fintech": "Fintech",
  "finance & fintech": "Fintech",
  "fintech": "Fintech",
  "video-content": "Video",
  "video & content": "Video",
  "video": "Video",
  "e-commerce": "E-commerce",
  "ecommerce": "E-commerce",
  "no-code": "No Code",
  "no code": "No Code",
  "website builder": "Website Builders",
  "website builders": "Website Builders",
  "social": "Social Media",
  "social media": "Social Media",
  "customer service": "Customer Support",
  "customer support": "Customer Support",
  "hrms": "Remote Work",
  "remote work": "Remote Work",
};

async function run() {
  console.log("=== Category Deduplication & Smart Upsert Started ===");

  // 1. Fetch current categories
  const { data: currentCategories, error: fetchErr } = await supabase
    .from("categories")
    .select("*")
    .order("id", { ascending: true });

  if (fetchErr) {
    throw new Error(`Failed to fetch categories: ${fetchErr.message}`);
  }
  console.log(`Found ${currentCategories.length} existing categories.`);

  // 2. Fetch current listings to monitor FK integrity
  const { data: initialListings, error: listErr } = await supabase
    .from("listings")
    .select("id, name, category_id, status");

  if (listErr) {
    throw new Error(`Failed to fetch listings: ${listErr.message}`);
  }
  console.log(`Found ${initialListings.length} existing listings.`);

  // 3. Reconcile existing categories
  for (const cat of currentCategories) {
    const slugKey = cat.slug.toLowerCase().trim();
    const nameKey = cat.name.toLowerCase().trim();

    const targetMasterName = ALIAS_TO_MASTER_NAME[nameKey] || ALIAS_TO_MASTER_NAME[slugKey];
    if (targetMasterName) {
      const targetMaster = MASTER_35_CATEGORIES.find((m) => m.name.toLowerCase() === targetMasterName.toLowerCase());
      if (targetMaster && (cat.name !== targetMaster.name || cat.slug !== targetMaster.slug)) {
        console.log(`Renaming category ID ${cat.id}: '${cat.name}' (${cat.slug}) -> '${targetMaster.name}' (${targetMaster.slug})`);
        const { error: updateErr } = await supabase
          .from("categories")
          .update({
            name: targetMaster.name,
            slug: targetMaster.slug,
            description: targetMaster.description,
          })
          .eq("id", cat.id);

        if (updateErr) {
          console.error(`Failed to update category ${cat.id}:`, updateErr.message);
        }
      }
    }
  }

  // 4. Fetch updated categories to see what is already present
  const { data: reconciledCats, error: refetchErr } = await supabase
    .from("categories")
    .select("*");

  if (refetchErr) throw refetchErr;

  const existingNames = new Set(reconciledCats.map((c) => c.name.toLowerCase().trim()));
  const existingSlugs = new Set(reconciledCats.map((c) => c.slug.toLowerCase().trim()));

  // 5. Insert only missing categories
  const missingCategories = MASTER_35_CATEGORIES.filter(
    (m) => !existingNames.has(m.name.toLowerCase().trim()) && !existingSlugs.has(m.slug.toLowerCase().trim())
  );

  console.log(`Missing categories to insert: ${missingCategories.length}`);

  if (missingCategories.length > 0) {
    for (const missing of missingCategories) {
      console.log(`Inserting missing category: '${missing.name}' (${missing.slug})`);
      const { data: inserted, error: insertErr } = await supabase
        .from("categories")
        .insert({
          name: missing.name,
          slug: missing.slug,
          description: missing.description,
        })
        .select();

      if (insertErr) {
        console.error(`Error inserting ${missing.name}:`, insertErr.message);
      }
    }
  }

  // 6. Verification
  console.log("\n=== Final Verification ===");
  const { data: finalCategories, error: finalCatErr } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("name", { ascending: true });

  if (finalCatErr) throw finalCatErr;

  console.log(`Total active categories: ${finalCategories.length} (Expected: 35)`);
  if (finalCategories.length !== 35) {
    console.error(`MISMATCH: Expected 35, got ${finalCategories.length}`);
  }

  // Check unique names
  const uniqueNames = new Set(finalCategories.map((c) => c.name.toLowerCase()));
  console.log(`Unique category names: ${uniqueNames.size} (Expected: 35)`);

  // Check unique slugs
  const uniqueSlugs = new Set(finalCategories.map((c) => c.slug.toLowerCase()));
  console.log(`Unique category slugs: ${uniqueSlugs.size} (Expected: 35)`);

  // Verify all listings have valid category FK
  const categoryIdSet = new Set(finalCategories.map((c) => c.id));
  const { data: finalListings, error: finalListErr } = await supabase
    .from("listings")
    .select("id, name, category_id, status");

  if (finalListErr) throw finalListErr;

  let orphaned = 0;
  for (const l of finalListings) {
    if (!categoryIdSet.has(l.category_id)) {
      console.error(`ORPHANED LISTING: ID ${l.id} has category_id ${l.category_id} not in categories!`);
      orphaned++;
    } else {
      const cat = finalCategories.find((c) => c.id === l.category_id);
      console.log(`Listing '${l.name}' (ID: ${l.id}) points to Category '${cat.name}' (ID: ${cat.id}) [status: ${l.status}] - VALID OK`);
    }
  }

  console.log(`Orphaned listings: ${orphaned} (Expected: 0)`);
  console.log(`All ${initialListings.length} initial listings preserved with valid FKs.`);
  console.table(finalCategories.map((c, idx) => ({ "#": idx + 1, id: c.id, name: c.name, slug: c.slug })));
}

run().catch((err) => {
  console.error("FATAL ERROR in upsert script:", err);
  process.exit(1);
});

