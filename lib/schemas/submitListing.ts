import { z } from "zod";
import type { PricingModel } from "@/types/db";

export const PRICING_MODELS: readonly [PricingModel, ...PricingModel[]] = [
  "free",
  "freemium",
  "paid",
  "one_time",
];

export const SUBMIT_LIMITS = {
  TAGLINE_MAX: 60,
  SHORT_DESC_MAX: 250,
  LONG_DESC_MAX: 2000,
  CUSTOM_CATEGORY_MAX: 50,
  MAX_SCREENSHOTS: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
} as const;

export function isValidHttpsWebsiteUrl(val: string): boolean {
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

export const submitListingSchema = z
  .object({
    name: z.string().trim().min(1, "Tool name is required."),
    category_id: z.string().trim().min(1, "Category is required."),
    custom_category: z
      .string()
      .trim()
      .max(
        SUBMIT_LIMITS.CUSTOM_CATEGORY_MAX,
        `Custom category cannot exceed ${SUBMIT_LIMITS.CUSTOM_CATEGORY_MAX} characters.`
      )
      .optional(),
    pricing_model: z.enum(PRICING_MODELS, {
      message: "Please select a valid pricing model.",
    }),
    website_url: z.string().trim().optional(),
    tagline: z
      .string()
      .trim()
      .min(1, "Tagline is required.")
      .max(
        SUBMIT_LIMITS.TAGLINE_MAX,
        `Tagline cannot exceed ${SUBMIT_LIMITS.TAGLINE_MAX} characters.`
      ),
    description_short: z
      .string()
      .trim()
      .min(1, "Short description is required.")
      .max(
        SUBMIT_LIMITS.SHORT_DESC_MAX,
        `Short description cannot exceed ${SUBMIT_LIMITS.SHORT_DESC_MAX} characters.`
      ),
    description_long: z
      .string()
      .trim()
      .min(1, "Long description is required.")
      .max(
        SUBMIT_LIMITS.LONG_DESC_MAX,
        `Long description cannot exceed ${SUBMIT_LIMITS.LONG_DESC_MAX} characters.`
      ),
    submitted_by_email: z
      .string()
      .trim()
      .min(1, "Submitter email is required.")
      .email("Please enter a valid email address."),
    company_website_hp: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isOtherCategory =
      data.category_id.trim().toLowerCase() === "other";
    const customCat = (data.custom_category || "").trim();
    const website = (data.website_url || "").trim();

    if (isOtherCategory) {
      if (customCat.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["custom_category"],
          message: "Please specify your custom category (at least 2 characters).",
        });
      }
      // When category is 'other', website_url is optional; if provided, must be HTTPS
      if (website.length > 0 && !isValidHttpsWebsiteUrl(website)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["website_url"],
          message:
            "Website URL must be a valid HTTPS URL (e.g. https://example.com).",
        });
      }
    } else {
      // Standard category: website_url is required and must be HTTPS
      if (!website) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["website_url"],
          message: "Website URL is required.",
        });
      } else if (!isValidHttpsWebsiteUrl(website)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["website_url"],
          message:
            "Website URL must be a valid HTTPS URL (e.g. https://example.com).",
        });
      }
    }
  });

export type SubmitListingFormValues = z.infer<typeof submitListingSchema>;
