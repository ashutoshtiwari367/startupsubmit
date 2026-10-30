// app/products/[slug]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import StartupLogo from '@/components/StartupLogo';
import StartupCard from '@/components/StartupCard';
import ProductDetailInteractive, {
  ProductActionBar,
} from '@/components/ProductDetailInteractive';
import { OwnerUpgradeCard } from '@/components/OwnerUpgradeCard';
import { TierBadge } from '@/components/tiers/TierBadge';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { cleanDomain, formatDate, outboundUrl, pricingTone } from '@/lib/format';
import { categoryHref, siteConfig } from '@/lib/site-config';
import { getEffectiveTier, getRelatedStartups, getStartupBySlug } from '@/lib/startups';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) {
    return { title: 'Product Not Found' };
  }

  return {
    title: `${startup.name} — ${startup.tagline}`,
    description: startup.description || startup.tagline,
    openGraph: {
      title: `${startup.name} — ${startup.tagline}`,
      description: startup.tagline,
      type: 'website',
      images: startup.logo_url ? [startup.logo_url] : undefined,
    },
  };
}

export default async function StartupDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) {
    notFound();
  }

  const related = await getRelatedStartups(startup.category, startup.id, 3);
  const domain = cleanDomain(startup.website_url);
  const launchedOn = formatDate(startup.created_at);
  const makerHandle = startup.twitter_handle
    ? `@${startup.twitter_handle.replace('@', '')}`
    : null;
  const effectiveTier = getEffectiveTier(startup);

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: startup.name,
    description: startup.description || startup.tagline,
    applicationCategory: startup.category,
    operatingSystem: 'Web',
    url: startup.website_url,
    offers: {
      '@type': 'Offer',
      price: startup.pricing_type === 'Free' ? '0' : '999',
      priceCurrency: 'INR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: Math.max(startup.upvotes || 1, 1),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: startup.category,
        item: `${siteConfig.url}${categoryHref(startup.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: startup.name,
        item: `${siteConfig.url}/products/${startup.slug}`,
      },
    ],
  };

  const badgeEmbedCode = `<a href="${siteConfig.url}/products/${startup.slug}?utm_source=badge" target="_blank" rel="noopener"><img src="${siteConfig.url}/badge.svg" alt="Featured on ${siteConfig.name}" width="230" height="50" /></a>`;

  return (
    <main className="py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Container className="space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Launches
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link href="/directory" className="hover:text-foreground">
            Directory
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link href={categoryHref(startup.category)} className="hover:text-foreground">
            {startup.category}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="truncate font-medium text-foreground">{startup.name}</span>
        </nav>

        {/* Product header */}
        <header className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4 sm:items-center sm:gap-5">
            <StartupLogo
              name={startup.name}
              logoUrl={startup.logo_url}
              websiteUrl={startup.website_url}
              size={72}
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-h1">{startup.name}</h1>
                {effectiveTier !== 'free' && (
                  <TierBadge
                    tier={effectiveTier}
                    isVerified={startup.is_verified}
                    size="md"
                  />
                )}
                {startup.is_verified && effectiveTier !== 'premium' && (
                  <Badge variant="success" size="md">
                    <ShieldCheck aria-hidden="true" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="max-w-2xl text-base text-muted-foreground">{startup.tagline}</p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <Link href={categoryHref(startup.category)}>
                  <Badge variant="outline" size="md" className="hover:border-border-strong">
                    {startup.category}
                  </Badge>
                </Link>
                <Badge variant={pricingTone(startup.pricing_type)} size="md">
                  {startup.pricing_type}
                </Badge>
                {domain && <span className="text-xs text-muted-foreground">· {domain}</span>}
              </div>
            </div>
          </div>

          <ProductActionBar
            id={startup.id}
            slug={startup.slug}
            name={startup.name}
            initialUpvotes={startup.upvotes || 1}
            websiteUrl={startup.website_url}
          />
        </header>

        {/* Main 2-column content + sticky sidebar */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left column: media preview, about, AI index note, badge/share */}
          <div className="space-y-8 lg:col-span-8">
            <Card className="p-6 sm:p-8 space-y-4">
              <h2 className="text-h3">About {startup.name}</h2>
              <div className="text-body whitespace-pre-line text-muted-foreground">
                {startup.description || startup.tagline}
              </div>
            </Card>

            <ProductDetailInteractive
              id={startup.id}
              slug={startup.slug}
              name={startup.name}
              tagline={startup.tagline}
              initialUpvotes={startup.upvotes || 1}
              websiteUrl={startup.website_url}
              bannerUrl={startup.banner_url}
              twitterHandle={startup.twitter_handle}
              badgeEmbedCode={badgeEmbedCode}
            />

            {/* AI index callout */}
            <div className="flex items-start gap-3.5 rounded-xl border border-border bg-subtle p-5">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground">Indexed for AI &amp; LLM search</p>
                <p>
                  This profile includes structured <code className="font-mono text-foreground">SoftwareApplication</code>{' '}
                  JSON-LD and is listed in our machine-readable{' '}
                  <a href="/llms.txt" className="font-mono font-medium text-primary hover:underline">
                    /llms.txt
                  </a>{' '}
                  feed so ChatGPT, Perplexity, Gemini and Claude can accurately cite {startup.name}.
                </p>
              </div>
            </div>
          </div>

          {/* Right sidebar: key info */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-4">
            <OwnerUpgradeCard
              slug={startup.slug}
              name={startup.name}
              tier={effectiveTier}
              expiresAt={startup.tier_expires_at}
            />

            <Card className="p-5 space-y-4">
              <h2 className="text-h4">Product information</h2>
              <dl className="divide-y divide-border text-sm">
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">Website</dt>
                  <dd>
                    <a
                      href={outboundUrl(startup.website_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <span>{domain || 'Visit'}</span>
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </dd>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd>
                    <Link
                      href={categoryHref(startup.category)}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {startup.category}
                    </Link>
                  </dd>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">Pricing</dt>
                  <dd>
                    <Badge variant={pricingTone(startup.pricing_type)} size="sm">
                      {startup.pricing_type}
                    </Badge>
                  </dd>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">Maker</dt>
                  <dd className="flex items-center gap-2">
                    <Avatar name={makerHandle || startup.name} size={24} />
                    {makerHandle ? (
                      <a
                        href={`https://twitter.com/${makerHandle.slice(1)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {makerHandle}
                      </a>
                    ) : (
                      <span className="font-medium text-foreground">Verified Founder</span>
                    )}
                  </dd>
                </div>

                {launchedOn && (
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-muted-foreground">Listed</dt>
                    <dd className="inline-flex items-center gap-1 text-foreground">
                      <Calendar className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      <span>{launchedOn}</span>
                    </dd>
                  </div>
                )}

                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">AI Index</dt>
                  <dd className="inline-flex items-center gap-1 font-medium text-success">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    <span>Indexed</span>
                  </dd>
                </div>
              </dl>
            </Card>

            <Card className="bg-subtle p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Building a SaaS or AI product?
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Submit your startup in under two minutes to get a permanent profile, community
                upvotes and a dofollow backlink.
              </p>
              <Link
                href="/submit"
                className={buttonVariants({ variant: 'primary', size: 'sm', className: 'w-full' })}
              >
                <span>Submit your product</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Card>
          </aside>
        </div>

        {/* Alternatives / similar products */}
        {related.length > 0 && (
          <section
            aria-labelledby="similar-heading"
            className="space-y-5 border-t border-border pt-10"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="similar-heading" className="text-h3">
                Alternatives &amp; similar products in {startup.category}
              </h2>
              <Link
                href={categoryHref(startup.category)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <span>View all in {startup.category}</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {related.map((item) => (
                <StartupCard key={item.id} startup={item} variant="grid" />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
