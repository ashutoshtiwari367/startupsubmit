// components/layout/Footer.tsx
import Link from 'next/link';
import { ArrowUpRight, Rocket } from 'lucide-react';
import { categories, categoryHref, siteConfig } from '@/lib/site-config';
import { Container } from '@/components/ui/container';

export function Footer() {
  const year = 2026;

  return (
    <footer className="mt-20 border-t border-border bg-subtle text-sm text-muted-foreground">
      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand column */}
          <div className="space-y-4 md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <Rocket className="size-4" aria-hidden="true" />
              </span>
              <span className="text-base font-bold tracking-tight text-foreground">
                {siteConfig.name}
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={siteConfig.social.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on X (Twitter)"
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on LinkedIn"
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.91 0-1.64.73-1.64 1.64s.73 1.64 1.64 1.64 1.64-.73 1.64-1.64-.73-1.64-1.64-1.64" />
                </svg>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3 md:col-span-3">
            <h3 className="text-eyebrow text-foreground">Categories</h3>
            <ul className="space-y-2 text-sm">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={categoryHref(cat.slug)}
                    className="transition-colors hover:text-foreground"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-3 md:col-span-2">
            <h3 className="text-eyebrow text-foreground">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">
                  Launch Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/directory" className="transition-colors hover:text-foreground">
                  Product Directory
                </Link>
              </li>
              <li>
                <Link href="/best" className="transition-colors hover:text-foreground">
                  Best of {year}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-colors hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/submit" className="transition-colors hover:text-foreground">
                  Submit a Product
                </Link>
              </li>
            </ul>
          </div>

          {/* AI & SEO */}
          <div className="space-y-3 md:col-span-3">
            <h3 className="text-eyebrow text-foreground">AI &amp; SEO Index</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <span>llms.txt (Machine Readable)</span>
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="/badge.svg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Official Launch Badge
                </a>
              </li>
              <li>
                <Link href="/pricing" className="transition-colors hover:text-foreground">
                  Dofollow Backlinks
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {siteConfig.legalName}. Built for SaaS &amp; AI makers.
          </p>
          <p className="flex items-center gap-4">
            <span>Permanent product pages</span>
            <span aria-hidden="true">·</span>
            <span>Dofollow backlinks</span>
            <span aria-hidden="true">·</span>
            <a href="/llms.txt" className="hover:text-foreground">
              AI-indexed
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
