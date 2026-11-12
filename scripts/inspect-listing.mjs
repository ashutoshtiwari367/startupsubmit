import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  const { data: listing, error: lErr } = await supabase
    .from("listings")
    .select("*")
    .eq("id", 50000033)
    .maybeSingle();

  console.log("Listing 50000033:", listing);
  if (lErr) console.error("Listing error:", lErr);

  // Check the latest 5 listings
  const { data: latestListings } = await supabase
    .from("listings")
    .select("id, slug, name, pricing_model, listing_plan, listing_plan_price, status, created_at")
    .order("id", { ascending: false })
    .limit(5);

  console.log("Latest listings:", latestListings);

  // Check payments table
  const { data: payments, error: pErr } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  console.log("Payments:", payments);
  if (pErr) console.error("Payments error:", pErr);
}

inspect().catch(console.error);

