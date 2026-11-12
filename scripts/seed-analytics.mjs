import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.log("Error listing users:", error.message);
    return;
  }
  console.log(`Found ${users.users.length} auth users.`);
  for (const u of users.users) {
    console.log(`User: ${u.id} (${u.email})`);
  }

  // Also seed some analytics views & clicks for the listings
  const { data: listings } = await supabase.from("listings").select("id, slug");
  if (listings && listings.length > 0) {
    console.log(`Seeding analytics for ${listings.length} listings...`);
    const analyticsEvents = [];
    for (const l of listings) {
      for (let i = 0; i < 8; i++) {
        analyticsEvents.push({
          listing_id: l.id,
          event_type: "view",
          session_hash: `sess-${l.id}-v-${i}-${Math.random().toString(36).slice(2, 8)}`,
        });
      }
      for (let i = 0; i < 3; i++) {
        analyticsEvents.push({
          listing_id: l.id,
          event_type: "website_click",
          session_hash: `sess-${l.id}-c-${i}-${Math.random().toString(36).slice(2, 8)}`,
        });
      }
    }
    const { error: aErr } = await supabase.from("listing_analytics").insert(analyticsEvents);
    if (aErr) console.log("Analytics insert error:", aErr.message);
    else console.log(`✓ Inserted ${analyticsEvents.length} analytics events.`);
  }

  // If we have at least one user, seed a couple of reviews & comments
  if (users.users.length > 0) {
    const userId = users.users[0].id;
    const { data: cortex } = await supabase.from("listings").select("id").eq("slug", "cortex-ai").single();
    if (cortex) {
      await supabase.from("listing_reviews").upsert([
        {
          listing_id: cortex.id,
          user_id: userId,
          rating: 5,
          review_text: "Incredible AI support agent! Replaced 60% of our tier-1 support tickets in the first week.",
          status: "approved",
          helpful_count: 12,
        },
      ], { onConflict: "listing_id,user_id" });

      await supabase.from("listing_comments").insert([
        {
          listing_id: cortex.id,
          user_id: userId,
          comment_text: "Does this integrate directly with Linear issue status transitions?",
          status: "approved",
        },
      ]);
      console.log("✓ Seeded review & comment for Cortex AI");
    }
  }
}

checkUsers().catch(console.error);

