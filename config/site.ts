export type PlanId = "free" | "premium" | "featured" | "freemium" | "paid" | "one_time";

export interface LaunchPlanConfig {
  id: PlanId;
  name: string;
  price: number; // Major currency units (e.g. 29 -> $29, automatically converted to 2900 cents)
  currency: string;
  currencySymbol: string;
  period: string;
  badge?: string;
  popular: boolean;
  description: string;
  ctaText: string;
  ctaVariant: "primary" | "secondary" | "ghost";
  reviewSla: string;
  features: string[];
}

/**
 * Single Source of Truth for LaunchOS Site & Directory Listing Plans.
 * Change any `price` here (e.g., 29 -> 49) and both the Frontend UI
 * and Backend Razorpay/Stripe Order creation (`price * 100` minor units) update automatically.
 * Configured in USD ($) as authoritative directory listing tiers.
 */
export const SITE_CONFIG = {
  name: "LaunchOS",
  tagline: "Product Launch Directory for AI & SaaS Makers",
  currency: "USD",
  currencySymbol: "$",
  plans: [
    {
      id: "free",
      name: "Free Listing",
      price: 0,
      currency: "USD",
      currencySymbol: "$",
      period: "forever",
      badge: "Standard",
      popular: false,
      description:
        "For bootstrapped indie makers testing early product-market traction.",
      ctaText: "Submit Free Listing",
      ctaVariant: "secondary",
      reviewSla: "3-5 business days",
      features: [
        "Standard 24h launch leaderboard queue",
        "Community upvotes & feedback thread",
        "Permanent searchable product listing",
        "Dofollow backlink if you finish in Top 3",
      ],
    },
    {
      id: "premium",
      name: "Premium Listing",
      price: 29,
      currency: "USD",
      currencySymbol: "$",
      period: "one-time",
      badge: "Fast Track",
      popular: true,
      description:
        "Fast-track 24h review, verified Maker badge, and permanent DR 72+ dofollow backlink.",
      ctaText: "Get Premium Listing",
      ctaVariant: "primary",
      reviewSla: "< 24 hours",
      features: [
        "Everything in Free, plus:",
        "Guaranteed review & launch within 24 hours",
        "Permanent guaranteed dofollow backlink",
        "Verified Maker badge on launch cards",
        "Priority category directory ranking",
      ],
    },
    {
      id: "featured",
      name: "Featured Listing",
      price: 49,
      currency: "USD",
      currencySymbol: "$",
      period: "one-time",
      badge: "Maximum Visibility",
      popular: false,
      description:
        "Homepage spotlight for 7 days, newsletter inclusion, and priority audit.",
      ctaText: "Get Featured Listing",
      ctaVariant: "secondary",
      reviewSla: "< 12 hours priority",
      features: [
        "Everything in Premium, plus:",
        "7 days pinned homepage spotlight",
        "Featured in daily founder newsletter",
        "Top-row hero placement in category",
        "Instant social shoutout",
      ],
    },
    // Legacy tier compatibility (mapped to directory plans)
    {
      id: "freemium",
      name: "Free Listing",
      price: 0,
      currency: "USD",
      currencySymbol: "$",
      period: "forever",
      badge: "Standard",
      popular: false,
      description: "Legacy alias for Free Listing.",
      ctaText: "Submit Free Listing",
      ctaVariant: "secondary",
      reviewSla: "3-5 business days",
      features: ["Standard review queue", "Permanent listing"],
    },
    {
      id: "paid",
      name: "Premium Listing",
      price: 29,
      currency: "USD",
      currencySymbol: "$",
      period: "one-time",
      badge: "Fast Track",
      popular: true,
      description: "Legacy alias for Premium Listing.",
      ctaText: "Get Premium Listing",
      ctaVariant: "primary",
      reviewSla: "< 24 hours",
      features: ["Fast-track review", "Verified Maker badge"],
    },
    {
      id: "one_time",
      name: "Featured Listing",
      price: 49,
      currency: "USD",
      currencySymbol: "$",
      period: "one-time",
      badge: "Maximum Visibility",
      popular: false,
      description: "Legacy alias for Featured Listing.",
      ctaText: "Get Featured Listing",
      ctaVariant: "secondary",
      reviewSla: "< 12 hours priority",
      features: ["Homepage spotlight", "Newsletter inclusion"],
    },
  ] satisfies LaunchPlanConfig[],
} as const;

export const DIRECTORY_LISTING_PLANS: readonly PlanId[] = [
  "free",
  "premium",
  "featured",
];

export interface ResolvedLaunchPlan extends LaunchPlanConfig {
  price_minor: number;
  formattedPrice: string;
}

export function getAllPlans(): ResolvedLaunchPlan[] {
  return SITE_CONFIG.plans
    .filter((plan) => DIRECTORY_LISTING_PLANS.includes(plan.id))
    .map((plan) => ({
      ...plan,
      price_minor: Math.round(plan.price * 100),
      formattedPrice: `${plan.currencySymbol}${plan.price}`,
    }));
}

export function getPlanById(planId: string): ResolvedLaunchPlan | null {
  const found = SITE_CONFIG.plans.find((p) => p.id === planId);
  if (!found) return null;
  return {
    ...found,
    price_minor: Math.round(found.price * 100),
    formattedPrice: `${found.currencySymbol}${found.price}`,
  };
}

