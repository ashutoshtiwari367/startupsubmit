import { z } from "zod";
import { config } from "@/lib/env/serverSecrets";
import type { PricingModel } from "@/types/db";

export const VALID_PRICING_MODELS: readonly [PricingModel, ...PricingModel[]] = [
  "free",
  "freemium",
  "premium",
  "paid",
  "one_time",
] as const;

export const VALID_BILLING_PERIODS = ["monthly", "yearly", "one_time"] as const;
export type BillingPeriod = (typeof VALID_BILLING_PERIODS)[number];

export const VALID_LISTING_PLANS = [
  "free",
  "premium",
  "featured",
  "freemium",
  "paid",
  "one_time",
] as const;
export type ListingPlan = (typeof VALID_LISTING_PLANS)[number];

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per image
export const MAX_TOTAL_SCREENSHOTS_SIZE_BYTES = 25 * 1024 * 1024; // 25MB total across all screenshots
export const MIN_SUBMIT_TIME_MS = config.minSubmitTimeMs || 2000; // Minimum 2 seconds to fill & submit form

export interface HoneypotCheckResult {
  triggered: boolean;
  reason?: "honeypot_filled" | "instant_submit";
}

/**
 * Checks hidden honeypot trap + minimum time-to-submit check.
 * - Real users never fill the hidden offscreen honeypot input (`tabIndex={-1}`, `aria-hidden="true"`).
 * - Real users take at least 2 seconds to fill out 8 required fields + logo file.
 * - Bots that fill hidden inputs or submit instantaneously (< 2000ms) trigger silent drop.
 */
export function checkHoneypotAndMinSubmitTime(input: {
  company_website_hp?: unknown;
  honeypot?: unknown;
  website_hp?: unknown;
  form_started_at?: unknown;
  started_at?: unknown;
  nowMs?: number;
  minSubmitTimeMs?: number;
}): HoneypotCheckResult {
  const hpValue =
    input.company_website_hp ?? input.honeypot ?? input.website_hp;
  if (typeof hpValue === "string" && hpValue.trim().length > 0) {
    return {
      triggered: true,
      reason: "honeypot_filled",
    };
  }

  const rawStartedAt = input.form_started_at ?? input.started_at;
  if (
    rawStartedAt !== undefined &&
    rawStartedAt !== null &&
    String(rawStartedAt).trim() !== ""
  ) {
    const startedAtMs = Number(rawStartedAt);
    const nowMs = input.nowMs ?? Date.now();
    const minElapsed = input.minSubmitTimeMs ?? MIN_SUBMIT_TIME_MS;

    if (!Number.isFinite(startedAtMs) || startedAtMs <= 0) {
      return {
        triggered: true,
        reason: "instant_submit",
      };
    }

    const elapsedMs = nowMs - startedAtMs;
    if (elapsedMs < minElapsed) {
      return {
        triggered: true,
        reason: "instant_submit",
      };
    }
  }

  return { triggered: false };
}

function isValidHttpsUrl(val: string): boolean {
  try {
    const parsed = new URL(val);
    if (parsed.protocol !== "https:") return false;
    if (!parsed.hostname || !parsed.hostname.includes(".")) return false;
    if (/\s/.test(val)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Authoritative Server-Side Zod Schema for Listing Text Fields.
 * Supports "other" category with required custom_category and optional website_url.
 */
export const serverListingFieldsSchema = z
  .object({
    name: z
      .string({ message: "Tool name is required." })
      .trim()
      .min(1, "Tool name is required."),
    tagline: z
      .string({ message: "Tagline is required." })
      .trim()
      .min(1, "Tagline is required.")
      .max(
        config.maxTaglineChars,
        `Tagline cannot exceed ${config.maxTaglineChars} characters.`
      ),
    description_short: z
      .string({ message: "Short description is required." })
      .trim()
      .min(1, "Short description is required.")
      .max(
        config.maxShortDescChars,
        `Short description cannot exceed ${config.maxShortDescChars} characters.`
      ),
    description_long: z
      .string({ message: "Long description is required." })
      .trim()
      .min(1, "Long description is required.")
      .max(
        config.maxLongDescChars,
        `Long description cannot exceed ${config.maxLongDescChars} characters.`
      ),
    website_url: z.string().trim().optional().default(""),
    category_id: z
      .string({ message: "Category is required." })
      .trim()
      .min(1, "Category is required."),
    custom_category: z
      .string()
      .trim()
      .max(50, "Custom category cannot exceed 50 characters.")
      .optional()
      .default(""),
    pricing_model: z.enum(VALID_PRICING_MODELS, {
      message: `Invalid pricing_model. Must be one of: ${VALID_PRICING_MODELS.join(", ")}.`,
    }),
    starting_price: z.coerce.number().optional().nullable(),
    currency: z.string().trim().default("USD"),
    billing_period: z.enum(VALID_BILLING_PERIODS).optional().nullable(),
    listing_plan: z.enum(VALID_LISTING_PLANS).default("free"),
    listing_plan_price: z.coerce.number().optional().default(0),
    submitted_by_email: z
      .string({ message: "Submitter email is required." })
      .trim()
      .min(1, "Submitter email is required.")
      .email("Please provide a valid email address."),
  })
  .superRefine((data, ctx) => {
    const isOther = data.category_id.trim().toLowerCase() === "other";
    const customCat = (data.custom_category || "").trim();
    const website = (data.website_url || "").trim();

    if (isOther) {
      if (customCat.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["custom_category"],
          message: "Please specify your custom category (at least 2 characters).",
        });
      }
      if (website.length > 0 && !isValidHttpsUrl(website)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["website_url"],
          message:
            "Website URL must use HTTPS (https://) and have a valid domain.",
        });
      }
    } else {
      if (!website) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["website_url"],
          message: "Website URL is required.",
        });
      } else if (!isValidHttpsUrl(website)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["website_url"],
          message:
            "Website URL must use HTTPS (https://) and have a valid domain.",
        });
      }
    }

    // Conditional Software Pricing Model Validation
    const normPricing = (data.pricing_model || "").toLowerCase();
    if (
      normPricing === "freemium" ||
      normPricing === "premium" ||
      normPricing === "paid"
    ) {
      const priceVal = data.starting_price;
      if (
        priceVal === undefined ||
        priceVal === null ||
        isNaN(Number(priceVal)) ||
        Number(priceVal) <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["starting_price"],
          message:
            normPricing === "freemium"
              ? "Starting paid-plan price in USD ($) is required for freemium software."
              : "Software price in USD ($) is required for premium software.",
        });
      }
      const periodVal = (data.billing_period || "").toLowerCase();
      if (!VALID_BILLING_PERIODS.includes(periodVal as BillingPeriod)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["billing_period"],
          message:
            "Please select a valid billing period (Monthly, Yearly, or One-time).",
        });
      }
    }
  });

export interface ValidatedSubmissionFields {
  name: string;
  tagline: string;
  description_short: string;
  description_long: string;
  website_url: string;
  category: string;
  category_id: string;
  custom_category?: string;
  pricing_model: PricingModel;
  starting_price?: number | null;
  currency?: string;
  billing_period?: BillingPeriod | null;
  listing_plan?: ListingPlan;
  listing_plan_price?: number;
  submitted_by_email: string;
}

export interface ValidationResult {
  valid: boolean;
  isHoneypotTriggered?: boolean;
  honeypotReason?: "honeypot_filled" | "instant_submit";
  errors: Record<string, string>;
  data?: ValidatedSubmissionFields;
}

/**
 * Verifies image file magic bytes (binary signature) so disguised files
 * (e.g. HTML/JS/EXE renamed to .png) are rejected by the server.
 */
export function verifyImageMagicBytes(bytes: Uint8Array): boolean {
  if (!bytes || bytes.length < 4) return false;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return true;
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }

  // GIF: "GIF87a" or "GIF89a" (47 49 46 38)
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return true;
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return true;
  }

  return false;
}

/**
 * Validates all text fields, honeypot trap, and uploaded files on the server.
 * Never trusts client-side validation.
 */
export function validateSubmissionServer(input: {
  name?: unknown;
  tagline?: unknown;
  description_short?: unknown;
  short_description?: unknown;
  description_long?: unknown;
  long_description?: unknown;
  website_url?: unknown;
  category?: unknown;
  category_id?: unknown;
  custom_category?: unknown;
  other_category?: unknown;
  pricing_model?: unknown;
  starting_price?: unknown;
  currency?: unknown;
  billing_period?: unknown;
  listing_plan?: unknown;
  listing_plan_price?: unknown;
  submitted_by_email?: unknown;
  submitter_email?: unknown;
  company_website_hp?: unknown;
  honeypot?: unknown;
  website_hp?: unknown;
  form_started_at?: unknown;
  started_at?: unknown;
  nowMs?: number;
  minSubmitTimeMs?: number;
  logo?: File | { type: string; size: number; name?: string } | null;
  screenshots?: Array<File | { type: string; size: number; name?: string }>;
}): ValidationResult {
  // 0. Honeypot + Minimum Time-to-Submit check: real users leave hidden honeypot empty and take >= 2s
  const trap = checkHoneypotAndMinSubmitTime(input);
  if (trap.triggered) {
    return {
      valid: false,
      isHoneypotTriggered: true,
      honeypotReason: trap.reason,
      errors: {
        form: "Spam submission detected.",
      },
    };
  }

  const errors: Record<string, string> = {};

  const normalizedInput = {
    name: typeof input.name === "string" ? input.name : "",
    tagline: typeof input.tagline === "string" ? input.tagline : "",
    description_short:
      typeof (input.description_short ?? input.short_description) === "string"
        ? String(input.description_short ?? input.short_description)
        : "",
    description_long:
      typeof (input.description_long ?? input.long_description) === "string"
        ? String(input.description_long ?? input.long_description)
        : "",
    website_url: typeof input.website_url === "string" ? input.website_url : "",
    category_id:
      typeof (input.category_id ?? input.category) === "string"
        ? String(input.category_id ?? input.category)
        : "",
    custom_category:
      typeof (input.custom_category ?? input.other_category) === "string"
        ? String(input.custom_category ?? input.other_category)
        : "",
    pricing_model:
      typeof input.pricing_model === "string"
        ? input.pricing_model.trim().toLowerCase()
        : "",
    starting_price:
      input.starting_price !== undefined && input.starting_price !== null && input.starting_price !== ""
        ? Number(input.starting_price)
        : null,
    currency:
      typeof input.currency === "string" && input.currency.trim().length > 0
        ? input.currency.trim().toUpperCase()
        : "USD",
    billing_period:
      typeof input.billing_period === "string" && input.billing_period.trim().length > 0
        ? input.billing_period.trim().toLowerCase()
        : null,
    listing_plan:
      typeof input.listing_plan === "string" && input.listing_plan.trim().length > 0
        ? input.listing_plan.trim().toLowerCase()
        : "free",
    listing_plan_price:
      input.listing_plan_price !== undefined && input.listing_plan_price !== null && input.listing_plan_price !== ""
        ? Number(input.listing_plan_price)
        : 0,
    submitted_by_email:
      typeof (input.submitted_by_email ?? input.submitter_email) === "string"
        ? String(input.submitted_by_email ?? input.submitter_email)
        : "",
  };

  // 1. Validate text fields with Server Zod Schema
  const parsed = serverListingFieldsSchema.safeParse(normalizedInput);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] || "form");
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
  }

  // 2. Validate Logo (Required, safe raster image MIME type, <= 5MB)
  const logo = input.logo;
  if (!logo || typeof logo === "string" || logo.size === 0) {
    errors.logo = "Tool logo image is required.";
  } else {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(logo.type)) {
      errors.logo =
        "Logo must be a valid image file (PNG, JPG, WebP, or GIF).";
    } else if (logo.size > MAX_FILE_SIZE_BYTES) {
      errors.logo = "Logo image size cannot exceed 5MB.";
    }
  }

  // 3. Validate Screenshots (Max 5, safe raster image MIME types, <= 5MB each, total <= 25MB)
  const screenshots = input.screenshots || [];
  if (screenshots.length > config.maxScreenshots) {
    errors.screenshots = `You can upload a maximum of ${config.maxScreenshots} screenshots (received ${screenshots.length}).`;
  } else {
    let totalScreenshotsBytes = 0;
    for (let i = 0; i < screenshots.length; i++) {
      const file = screenshots[i];
      if (!file || !ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
        errors.screenshots = `Screenshot #${i + 1} must be a valid image (PNG, JPG, WebP, or GIF).`;
        break;
      }
      if (file.size === 0 || file.size > MAX_FILE_SIZE_BYTES) {
        errors.screenshots = `Screenshot #${i + 1} must be between 1 byte and 5MB.`;
        break;
      }
      totalScreenshotsBytes += file.size;
    }
    if (!errors.screenshots && totalScreenshotsBytes > MAX_TOTAL_SCREENSHOTS_SIZE_BYTES) {
      errors.screenshots = `Total screenshots size cannot exceed 25MB (received ${(totalScreenshotsBytes / (1024 * 1024)).toFixed(1)}MB).`;
    }
  }

  if (Object.keys(errors).length > 0 || !parsed.success) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    data: {
      ...parsed.data,
      category: parsed.data.category_id,
    },
  };
}
