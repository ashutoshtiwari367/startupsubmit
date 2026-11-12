import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log("Checking tables in database...");
  const tables = [
    "categories",
    "listings",
    "listing_screenshots",
    "listing_analytics",
    "listing_reviews",
    "listing_comments",
  ];

  for (const t of tables) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`Table '${t}': NOT FOUND or error (${error.message})`);
    } else {
      console.log(`Table '${t}': OK (row count: ${count})`);
    }
  }
}

check().catch(console.error);

