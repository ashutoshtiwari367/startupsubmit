import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/ProductDetailView";
import { getApprovedListingBySlug, getSimilarApprovedListings } from "@/lib/listings";
import { getSiteUrl, buildSoftwareAppJsonLd, serializeJsonLd } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

/**
 * Incremental Static Regeneration (ISR)
 * Revalidates listing page at most once every hour.
 */
export const revalidate = 3600;

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generates dynamic SEO metadata for individual product listing pages.
 * - Extracts listing authoritative data from database via getApprovedListingBySlug()
 * - Generates absolute canonical URLs avoiding relative or undefined endpoints
 * - Attaches OpenGraph and Twitter card metadata
 * - Defends against indexing unapproved/pending/rejected/missing tools with noindex
 */
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const slug = String(id || "").trim();

  if (!slug) {
    return {
      title: "Product Not Found | LaunchOS",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const listing = await getApprovedListingBySlug(slug);

  if (!listing) {
    return {
      title: "Product Not Found | LaunchOS",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/product/${listing.slug}`;
  const title = `${listing.name} - ${listing.tagline} | LaunchOS`;
  const description = listing.description_short;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "LaunchOS",
      images: listing.logo_url
        ? [
            {
              url: listing.logo_url,
              alt: `${listing.name} logo`,
            },
          ]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: listing.logo_url ? [listing.logo_url] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Dynamic Server Component for Individual Tool Listing Pages.
 * Follows existing route parameter convention [id] (which receives the slug).
 * Authoritatively retrieves approved listings and returns HTTP 404 for
 * non-existent, pending, or rejected submissions.
 * Renders SoftwareApplication JSON-LD structured data safely escaped against XSS.
 */
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const slug = String(id || "").trim();

  if (!slug) {
    notFound();
  }

  const listing = await getApprovedListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const similarListings = await getSimilarApprovedListings(
    listing.category_id,
    listing.slug,
    4
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const siteUrl = getSiteUrl();
  const jsonLd = buildSoftwareAppJsonLd(listing, siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ProductDetailView
        listing={listing}
        similarListings={similarListings}
        currentUserId={user?.id || null}
      />
    </>
  );
}
