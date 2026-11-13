import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSchema() {
  console.log("Checking current DB constraints and tables...");

  // Check payments constraints
  const { data: paymentsSample } = await supabase.from("payments").select("*").limit(1);
  console.log("Payments sample:", paymentsSample);

  // Check listing_comments sample
  const { data: commentsSample } = await supabase.from("listing_comments").select("*").limit(1);
  console.log("Comments sample:", commentsSample);

  // Check listing_reviews sample
  const { data: reviewsSample } = await supabase.from("listing_reviews").select("*").limit(1);
  console.log("Reviews sample:", reviewsSample);

  // Check listing_review_helpful_votes
  const { data: helpfulSample, error: hErr } = await supabase.from("listing_review_helpful_votes").select("*").limit(1);
  console.log("Helpful votes table exists?:", !hErr);

  // Check listing_review_reports
  const { data: reportsSample, error: rErr } = await supabase.from("listing_review_reports").select("*").limit(1);
  console.log("Review reports table exists?:", !rErr);

  // Check listing_analytics_daily
  const { data: dailySample, error: dErr } = await supabase.from("listing_analytics_daily").select("*").limit(1);
  console.log("Daily analytics table exists?:", !dErr);
}

inspectSchema().catch(console.error);

