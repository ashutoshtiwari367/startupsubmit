import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env/publicEnv";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window === "undefined") {
    return createBrowserClient(
      publicEnv.supabaseUrl,
      publicEnv.supabaseAnonKey
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      publicEnv.supabaseUrl,
      publicEnv.supabaseAnonKey
    );
  }

  return browserClient;
}

