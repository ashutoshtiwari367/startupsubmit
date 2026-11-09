import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { serverSecrets, config } from "@/lib/env/serverSecrets";
import type { Database } from "@/types/db";

/**
 * Typed Server-Side Supabase Client.
 * Uses Service Role credentials from lib/env/serverSecrets.ts.
 * Never exposed to client components.
 */
export const db: SupabaseClient<Database> = createClient<Database>(
  serverSecrets.supabaseUrl,
  serverSecrets.supabaseServiceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export function getDb(): SupabaseClient<Database> {
  return db;
}

/**
 * Ensures the media storage bucket exists for uploading logos & screenshots.
 */
export async function ensureMediaBucket(): Promise<string> {
  const bucketName = config.mediaBucket;
  const { data: buckets } = await db.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === bucketName || b.id === bucketName);

  if (!exists) {
    await db.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/svg+xml",
        "image/gif",
      ],
    });
  }

  return bucketName;
}

