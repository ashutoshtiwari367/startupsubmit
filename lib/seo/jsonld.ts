import type { ApprovedListing } from "@/lib/listings";

/**
 * Maps database category slugs/names to standardized Schema.org application categories.
 * SoftwareApplication schema guidelines recommend recognizable software category types.
 */
export function mapApplicationCategory(
  categorySlug?: string | null,
  categoryName?: string | null
): string {
  const normalized = (categorySlug || categoryName || "").toLowerCase().trim();

  switch (normalized) {
    case "ai":
    case "artificial intelligence":
      return "ArtificialIntelligenceApplication";
    case "productivity":
      return "ProductivityApplication";
    case "developer-tools":
    case "developer tools":
    case "dev tools":
      return "DeveloperApplication";
    case "design-ux":
    case "design & ux":
    case "design":
      return "DesignApplication";
    case "finance-fintech":
    case "finance & fintech":
    case "finance":
      return "FinanceApplication";
    case "video-content":
    case "video & content":
    case "video":
      return "MultimediaApplication";
    case "marketing":
      return "MarketingApplication";
    case "analytics-data":
    case "analytics & data":
    case "analytics":
      return "BusinessApplication";
    case "e-commerce":
    case "ecommerce":
      return "BusinessApplication";
    case "saas-tools":
    case "saas & tools":
    case "saas":
      return "BusinessApplication";
    default:
      return "WebApplication";
  }
}

export interface SoftwareAppOffer {
  "@type": "Offer";
  price: string;
  priceCurrency: string;
  description?: string;
}

export interface SoftwareAppJsonLd {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  image?: string;
  sameAs?: string;
  offers?: SoftwareAppOffer;
}

/**
 * Builds Schema.org SoftwareApplication structured data for an approved listing.
 *
 * Pricing / Offers Integrity:
 * - 'free': Verified $0 price tier.
 * - 'freemium': Verified free tier available with optional premium upgrades.
 * - 'paid' / 'one_time': Because the listings table only stores the pricing model enum
 *   and does not store third-party software catalog subscription prices or currencies,
 *   we strictly omit the 'offers' property to adhere to Google Rich Results guidelines
 *   and prevent misleading price penalties.
 */
export function buildSoftwareAppJsonLd(
  listing: ApprovedListing,
  siteUrl: string
): SoftwareAppJsonLd {
  const cleanSiteUrl = siteUrl.replace(/\/+$/, "");
  const canonicalUrl = `${cleanSiteUrl}/product/${listing.slug}`;
  const categoryStr = mapApplicationCategory(
    listing.categories?.slug,
    listing.categories?.name
  );

  let offers: SoftwareAppOffer | undefined;

  if (listing.pricing_model === "free") {
    offers = {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    };
  } else if (listing.pricing_model === "freemium") {
    offers = {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier available",
    };
  }
  // Note: For 'paid' and 'one_time', third-party prices are not stored in public.listings.
  // Google guidelines prohibit fabricating prices, so offers is deliberately omitted.

  const jsonLd: SoftwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: listing.name,
    description: listing.description_short || listing.tagline,
    url: canonicalUrl,
    applicationCategory: categoryStr,
    operatingSystem: "Web, Cloud, All",
  };

  if (listing.logo_url) {
    jsonLd.image = listing.logo_url;
  }

  if (listing.website_url) {
    jsonLd.sameAs = listing.website_url;
  }

  if (offers) {
    jsonLd.offers = offers;
  }

  return jsonLd;
}

/**
 * Safely serializes JSON-LD structured data for injection into an HTML <script> tag.
 * Replaces '<', '>', '&', '\u2028', and '\u2029' with unicode escape sequences
 * to prevent Cross-Site Scripting (XSS) and script tag breakout.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

