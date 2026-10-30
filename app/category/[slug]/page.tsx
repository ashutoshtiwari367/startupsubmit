// app/category/[slug]/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import StartupCard from '@/components/StartupCard';
import { EmptySlotCard } from '@/components/tiers/EmptySlotCard';
import { Badge } from '@/components/ui/badge';
import { Container, SectionHeader } from '@/components/ui/container';
import { categories, categoryHref, getCategoryBySlug, tierConfig } from '@/lib/site-config';
import { getEffectiveTier, getStartupsByCategory } from '@/lib/startups';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  const label = cat ? cat.name : decodeURIComponent(slug).toUpperCase();
  return {
    title: `Best ${label} Startups & Software Tools`,
    description:
      cat?.description || `Curated directory of verified ${label} startups and software tools.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  const label = cat ? cat.name : decodeURIComponent(slug).toUpperCase();
  const startups = await getStartupsByCategory(slug);

  // Split into category featured/premium and remaining standard listings
  const categoryFeatured = startups
    .filter(
      (s) => getEffectiveTier(s) === 'featured' || getEffectiveTier(s) === 'premium'
    )
    .slice(0, 3);

  const regularListings = startups.filter(
    (s) => !categoryFeatured.some((f) => f.id === s.id)
  );

  const relatedCategories = categories.filter((c) => c.slug !== slug.toLowerCase());

  return (
    <main className="py-10 sm:py-14">
      <Container className="space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/directory" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Directory</span>
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="font-medium text-foreground">{label}</span>
        </nav>

        {/* Header: title, description, tool count */}
        <SectionHeader
          as="h1"
          eyebrow={`Category · ${startups.length} products listed`}
          title={`${label} Startups`}
          description={
            cat?.description ||
            `Curated list of verified software products and tools in the ${label} space.`
          }
        />

        {/* Top of category list: up to 2-3 featured/premium products for THAT category */}
        {categoryFeatured.length > 0 && (
          <section aria-labelledby="category-featured-heading" className="space-y-3.5 rounded-2xl border border-primary/20 bg-primary-soft/15 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                </span>
                <h2 id="category-featured-heading" className="text-sm font-semibold text-foreground">
                  Featured in {label}
                </h2>
              </div>
              <Link
                href={`/submit?plan=featured&category=${encodeURIComponent(label)}`}
                className="text-xs font-medium text-primary hover:underline"
              >
                Feature your product here →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categoryFeatured.map((item) => (
                <StartupCard key={item.id} startup={item} variant="grid" />
              ))}
            </div>
          </section>
        )}

        {/* 2-Column layout: listings on left, right sidebar on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground">
                All {label} Products ({startups.length})
              </h3>
              <span className="text-xs text-muted-foreground">
                Ranked by community upvotes
              </span>
            </div>

            {startups.length > 0 ? (
              <div className="space-y-3">
                {(regularListings.length > 0 ? regularListings : startups).map((item, idx) => (
                  <StartupCard
                    key={item.id}
                    startup={item}
                    variant="list"
                    rank={idx + 1}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border-strong bg-subtle p-8 text-center space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  No products listed in {label} yet.
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Be the first maker to submit an innovative {label} tool to the directory.
                </p>
                <Link
                  href="/submit"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-xs"
                >
                  Submit first {label} startup
                </Link>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Featured in this category box */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Featured in {label}</span>
                </h4>
                <Badge variant="outline" size="sm">
                  {tierConfig.featured.priceDisplay}
                </Badge>
              </div>

              {categoryFeatured.length > 0 ? (
                <div className="space-y-2">
                  {categoryFeatured.map((f) => (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-xl border border-border bg-subtle/50 space-y-1"
                    >
                      <Link
                        href={`/products/${f.slug}`}
                        className="text-xs font-semibold text-foreground hover:text-primary block truncate"
                      >
                        {f.name}
                      </Link>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {f.tagline}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <EmptySlotCard
                tier="featured"
                title={`Feature your ${label} product`}
                subtitle="Top category placement + permanent link"
                compact
              />
            </div>

            {/* Related categories chips */}
            <div className="rounded-2xl border border-border bg-subtle p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Related Categories
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {relatedCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={categoryHref(c.slug)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <span>{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
