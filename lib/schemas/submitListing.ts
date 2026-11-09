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
  MAX_SCREENSHOTS: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
} as const;

export const submitListingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tool name is required."),
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
  website_url: z
    .string()
    .trim()
    .min(1, "Website URL is required.")
    .refine((val) => {
      try {
        const parsed = new URL(val);
        return parsed.protocol === "https:" && parsed.hostname.includes(".");
      } catch {
        return false;
      }
    }, "Website URL must be a valid HTTPS URL (e.g. https://example.com)."),
  category_id: z
    .string()
    .trim()
    .min(1, "Category is required."),
  pricing_model: z.enum(PRICING_MODELS, {
    message: "Please select a valid pricing model.",
  }),
  submitted_by_email: z
    .string()
    .trim()
    .min(1, "Submitter email is required.")
    .email("Please enter a valid email address."),
  company_website_hp: z.string().optional(),
});

export type SubmitListingFormValues = z.infer<typeof submitListingSchema>;
