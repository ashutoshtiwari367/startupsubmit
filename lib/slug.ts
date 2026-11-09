import { db } from "@/lib/db";

/**
 * Converts a tool name into a clean URL-friendly base slug.
 * Strips HTML tags/punctuation and collapses whitespace/hyphens.
 * Example: "WritePro" -> "writepro", "AI Writer 2.0!" -> "ai-writer-2-0"
 */
export function slugify(name: string): string {
  const cleaned = String(name || "")
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, "-") // Strip any HTML tags cleanly in URL slug
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "tool";
}

export const toBaseSlug = slugify;

/**
 * Pure deterministic function that picks the next available unique slug
 * given a baseSlug and a list/set of existing slugs.
 *
 * Example for "WritePro":
 * - existing: [] -> "writepro"
 * - existing: ["writepro"] -> "writepro-2"
 * - existing: ["writepro", "writepro-2"] -> "writepro-3"
 */
export function resolveUniqueSlug(
  baseNameOrSlug: string,
  existingSlugs: Iterable<string>
): string {
  const baseSlug = slugify(baseNameOrSlug);
  const normalizedSet = new Set<string>();

  for (const s of existingSlugs) {
    if (typeof s === "string") {
      normalizedSet.add(s.toLowerCase().trim());
    }
  }

  if (!normalizedSet.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (normalizedSet.has(`${baseSlug}-${counter}`)) {
    counter++;
  }

  return `${baseSlug}-${counter}`;
}

/**
 * Queries the 'listings' table on the server and returns a guaranteed unique slug.
 */
export async function generateUniqueSlug(
  name: string,
  extraTakenSlugs: string[] = []
): Promise<string> {
  const baseSlug = slugify(name);

  const { data: existingRows, error } = await db
    .from("listings")
    .select("slug")
    .ilike("slug", `${baseSlug}%`);

  const dbSlugs =
    !error && existingRows ? existingRows.map((row) => row.slug) : [];

  return resolveUniqueSlug(baseSlug, [...dbSlugs, ...extraTakenSlugs]);
}
