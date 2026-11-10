export type PlanId = "free" | "freemium" | "paid" | "one_time";

export interface LaunchPlanConfig {
  id: PlanId;
  name: string;
  price: number; // Major currency units (e.g. 59 -> ₹59, automatically converted to 5900 paise)
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
 * Single Source of Truth for LaunchOS Site & Pricing Configuration.
 * Change any `price` here (e.g., 59 -> 99) and both the Frontend UI
 * and Backend Razorpay Order creation (`price * 100` minor units) update automatically.
 */
export const SITE_CONFIG = {
  name: "LaunchOS",
  tagline: "Product Launch Directory for AI & SaaS Makers",
  currency: "INR",
  currencySymbol: "₹",
  plans: [
    {
      id: "free",
      name: "Free Launch",
      price: 0,
      currency: "INR",
      currencySymbol: "₹",
      period: "forever",
      badge: "Standard",
      popular: false,
      description:
        "For bootstrapped indie makers testing early product-market traction.",
      ctaText: "Submit for Free",
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
      id: "freemium",
      name: "Freemium Launch",
      price: 59,
      currency: "INR",
      currencySymbol: "₹",
      period: "one-time",
      badge: "Starter Boost",
      popular: false,
      description:
        "Fast-track editorial review and verified badge for freemium tools.",
      ctaText: "Get Freemium Launch",
      ctaVariant: "secondary",
      reviewSla: "< 48 hours",
      features: [
        "Everything in Free, plus:",
        "Fast-track 48-hour editorial review",
        "Verified Maker badge on launch cards",
        "Highlighted in category directory",
      ],
    },
    {
      id: "paid",
      name: "Paid Pro Launch",
      price: 149,
      currency: "INR",
      currencySymbol: "₹",
      period: "one-time",
      badge: "Most Popular",
      popular: true,
      description:
        "Guaranteed launch within 24h and permanent DR 72+ dofollow backlink.",
      ctaText: "Get Paid Pro Launch",
      ctaVariant: "primary",
      reviewSla: "< 24 hours",
      features: [
        "Everything in Freemium, plus:",
        "Guaranteed launch date within 24 hours",
        "Permanent guaranteed dofollow backlink (DR 72+)",
        "Featured in daily founder newsletter",
        "Instant Google Indexing API ping",
      ],
    },
    {
      id: "one_time",
      name: "One-Time Spotlight",
      price: 299,
      currency: "INR",
      currencySymbol: "₹",
      period: "one-time",
      badge: "Maximum Reach",
      popular: false,
      description:
        "7-day pinned homepage sponsor placement and priority 1-hour approval.",
      ctaText: "Reserve Spotlight",
      ctaVariant: "secondary",
      reviewSla: "< 1 hour priority",
      features: [
        "Everything in Paid Pro, plus:",
        "7 days pinned homepage sponsor slot",
        "#1 Leaderboard hero sponsor placement",
        "Dedicated shoutout on X & newsletter blast",
        "Priority 1-hour expedited audit",
      ],
    },
  ] satisfies LaunchPlanConfig[],
} as const;

export interface ResolvedLaunchPlan extends LaunchPlanConfig {
  price_minor: number;
  formattedPrice: string;
}

export function getAllPlans(): ResolvedLaunchPlan[] {
  return SITE_CONFIG.plans.map((plan) => ({
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

