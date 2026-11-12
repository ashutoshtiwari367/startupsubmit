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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function main() {
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("id", 50000001);

  console.log("Listing 50000001:", listings);
}

main().catch(console.error);
