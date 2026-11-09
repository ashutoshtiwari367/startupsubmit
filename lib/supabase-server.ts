import "server-only";
import { db, getDb, ensureMediaBucket } from "@/lib/db";

export { db, getDb as getSupabaseAdmin, ensureMediaBucket };
