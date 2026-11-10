import { db } from "@/lib/db";

/**
 * Unambiguous 32-character Crockford-style alphabet:
 * Strictly excludes '0' (zero), 'O' (letter O), '1' (one), and 'I' (letter I)
 * so human-readable reference codes like 'L-7K2M9Q' never cause confusion.
 */
export const REFERENCE_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export const REFERENCE_CODE_REGEX =
  /^L-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;

/**
 * Generates a human-readable reference code like 'L-7K2M9Q'
 * (prefix 'L-' + 6 characters with no 0/O/1/I ambiguity).
 */
export function generateReferenceCode(
  prefix: string = "L",
  length: number = 6
): string {
  const bytes = new Uint8Array(length);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let body = "";
  for (let i = 0; i < length; i++) {
    // 32 is an exact divisor of 256, so modulo 32 has zero modulo bias
    body += REFERENCE_CODE_ALPHABET[bytes[i] % REFERENCE_CODE_ALPHABET.length];
  }

  return `${prefix}-${body}`;
}

/**
 * Validates that a reference code matches 'L-XXXXXX' (6 unambiguous chars, no 0/O/1/I).
 */
export function isValidReferenceCode(code: unknown): code is string {
  if (typeof code !== "string") return false;
  return REFERENCE_CODE_REGEX.test(code.trim());
}

/**
 * Resolves a unique reference_code against an existing set of codes (pure helper for unit tests & retries).
 */
export function resolveUniqueReferenceCode(
  existingCodes: Iterable<string> = [],
  generator: () => string = () => generateReferenceCode("L", 6)
): string {
  const normalized = new Set<string>();
  for (const c of existingCodes) {
    if (typeof c === "string") {
      normalized.add(c.trim().toUpperCase());
    }
  }

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = generator().toUpperCase();
    if (!normalized.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique reference code after 50 attempts.");
}

/**
 * Queries public.listings to ensure the generated reference_code is unique.
 */
export async function generateUniqueReferenceCode(
  additionalTaken: string[] = []
): Promise<string> {
  const takenSet = new Set(additionalTaken.map((c) => c.toUpperCase()));

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateReferenceCode("L", 6);
    if (takenSet.has(candidate)) continue;

    const { data, error } = await db
      .from("listings")
      .select("reference_code")
      .eq("reference_code", candidate)
      .maybeSingle();

    if (error || !data) {
      return candidate;
    }

    takenSet.add(candidate);
  }

  return generateReferenceCode("L", 6);
}

