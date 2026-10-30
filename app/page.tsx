// app/page.tsx
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Check,
  Globe,
  Link2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { HeroLaunchForm } from '@/components/home/HeroLaunchForm';
import { HomeLeaderboard } from '@/components/home/HomeLeaderboard';
import { HeroRails } from '@/components/tiers/HeroRails';
import { NewsletterForm } from '@/components/home/NewsletterForm';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section, SectionHeader } from '@/components/ui/container';
import { formatNumber, isoWeek } from '@/lib/format';
import { categories, categoryHref } from '@/lib/site-config';
import { getApprovedStartups, getHeroRails } from '@/lib/startups';

export const revalidate = 60;

const WHY_CARDS = [
  {
    icon: Globe,
    title: 'Permanent product page',
    description:
      'Every submission gets a fast, indexable profile page that keeps sending founders and buyers long after launch week ends.',
  },
  {
    icon: Link2,
    title: 'High-signal dofollow backlink',
    description:
      'Embed our launch badge on your site (or pick Instant Boost/Featured) to unlock a clean dofollow link that builds domain authority.',
  },
  {
    icon: Bot,
    title: 'Structured for AI search',
    description:
      'Listings ship with SoftwareApplication JSON-LD and are published to our live /llms.txt index for ChatGPT, Perplexity and Gemini.',
  },
];

const HOME_FAQS = [
  {
    q: 'How does the weekly launch leaderboard work?',
    a: 'Submit your startup any day of the week. Community members discover and upvote products they find useful, and the highest-upvoted products earn top-3 medals and placement in our Best of the Year index.',
  },
  {
    q: 'Is it really free to launch?',
    a: 'Yes. Free Launch costs ₹0 and gives you a permanent product page, community upvotes and inclusion in /llms.txt. Embedding our verification badge on your website activates your dofollow backlink.',
  },
  {
    q: 'What is the difference between Featured and Premium Launch?',
    a: 'Featured listings get prominent placement in dedicated rails across the home and directory, plus priority category placement. Premium Launch guarantees top placement above all others, verified status, and inclusion in our in-list sponsored banner row.',
  },
  {
    q: 'How does /llms.txt help my startup get cited by AI?',
    a: 'Answer engines like ChatGPT, Perplexity, Claude and Gemini use structured feeds and schema.org markup to ground product recommendations. Every approved startup is automatically written into our machine-readable /llms.txt endpoint.',
  },
];

export default async function HomePage() {
  const startups = await getApprovedStartups();
  const weekNumber = isoWeek();
  const heroRails = getHeroRails(startups);

  // Real counts computed directly from the dataset
  const totalUpvotes = startups.reduce((sum, s) => sum + (s.upvotes || 0), 0);
  const categoryCounts = startups.reduce<Record<string, number>>((acc, s) => {
    const key = s.category.toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <main>
      {/* 1. HERO AREA WITH RAILS */}
      <section className="border-b border-border bg-subtle/70 pt-12 pb-14 sm:pt-16 sm:pb-20">
        <Container className="space-y-10">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <Badge variant="primary" size="md" className="mx-auto">
              <Sparkles aria-hidden="true" />
              <span>Week {weekNumber} launches are live</span>
            </Badge>

            <h1 className="text-display text-foreground">
              Launch your startup.{' '}
              <span className="text-primary">Get discovered.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              The launch platform and permanent directory for SaaS &amp; AI products. Go live in
              minutes, collect community upvotes, earn a dofollow backlink and get indexed by AI
              search engines.
            </p>

            <div className="pt-2">
              <HeroLaunchForm />
            </div>

            {/* Trust chips */}
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs font-medium text-muted-foreground">
              <li className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-success" aria-hidden="true" />
                <span>Free to launch</span>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-success" aria-hidden="true" />
                <span>Permanent product page + dofollow link</span>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-success" aria-hidden="true" />
                <span>{startups.length}+ SaaS &amp; AI tools listed</span>
              </li>
            </ul>
          </div>

          {/* Left Rail (Featured) & Right Rail (Just Listed) */}
          <HeroRails featured={heroRails.featured} justListed={heroRails.justListed} />
        </Container>
      </section>

      {/* 2–4. LEADERBOARD WITH PREMIUM PINNED, SPONSORED ROW & RIGHT SIDEBAR */}
      <Section>
        <Container>
          <HomeLeaderboard initialStartups={startups} weekNumber={weekNumber} />
        </Container>
      </Section>

      {/* 5. EXPLORE FULL DIRECTORY BY CATEGORY */}
      <Section className="border-y border-border bg-subtle">
        <Container className="space-y-8">
          <SectionHeader
            eyebrow="Directory"
            title="Explore the full directory"
            description="Browse vetted SaaS and AI startups by category, pricing model or popularity."
            action={
              <Link
                href="/directory"
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                <span>View all {startups.length} products</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const count = categoryCounts[cat.name.toLowerCase()] || 0;
              // Check if category has any featured/premium listings
              const hasFeatured = startups.some(
                (s) =>
                  s.category.toLowerCase() === cat.name.toLowerCase() &&
                  (s.tier === 'featured' || s.tier === 'premium' || s.is_featured)
              );

              return (
                <Link
                  key={cat.slug}
                  href={categoryHref(cat.slug)}
                  className="group flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-150 hover:border-primary/50 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary">
                        {cat.name}
                      </span>
                      {hasFeatured && (
                        <span className="size-1.5 rounded-full bg-primary" title="Featured launches available" />
                      )}
                    </div>
                    <Badge variant="neutral" size="sm">
                      {count}
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                </Link>
              );
            })}

            <Link
              href="/best"
              className="group flex flex-col justify-between gap-3 rounded-xl border border-primary/25 bg-primary-soft/40 p-4 transition-[border-color,box-shadow] duration-150 hover:border-primary/60 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-primary-soft-foreground">
                  Best of 2026
                </span>
                <TrendingUp className="size-4 text-primary" aria-hidden="true" />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                The top-ranked launches of the year, voted by the community.
              </p>
            </Link>
          </div>
        </Container>
      </Section>

      {/* 6. STATS STRIP */}
      <section aria-label="Platform statistics" className="border-b border-border py-12">
        <Container>
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <dt className="text-xs font-medium text-muted-foreground">Products launched</dt>
              <dd className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
                {formatNumber(startups.length)}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <dt className="text-xs font-medium text-muted-foreground">Community upvotes</dt>
              <dd className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
                {formatNumber(totalUpvotes)}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <dt className="text-xs font-medium text-muted-foreground">Curated categories</dt>
              <dd className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
                {categories.length}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <dt className="text-xs font-medium text-muted-foreground">AI search index</dt>
              <dd className="mt-1 flex items-baseline gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                <span>100%</span>
                <a
                  href="/llms.txt"
                  className="font-mono text-xs font-medium text-primary hover:underline"
                >
                  /llms.txt
                </a>
              </dd>
            </div>
          </dl>
        </Container>
      </section>

      {/* 7. WHY LAUNCH HERE */}
      <Section>
        <Container className="space-y-10">
          <SectionHeader
            align="center"
            eyebrow="Built for makers"
            title="Why founders launch here"
            description="Launch day spike plus compounding SEO and AI search visibility."
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {WHY_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="p-6">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-h4">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* 8. FAQ ACCORDION */}
      <Section className="border-t border-border bg-subtle">
        <Container className="max-w-3xl space-y-8">
          <SectionHeader
            align="center"
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Everything you need to know about launching and ranking your product."
          />

          <Accordion>
            {HOME_FAQS.map((item, idx) => (
              <AccordionItem key={item.q} question={item.q} defaultOpen={idx === 0}>
                {item.a}
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Section>

      {/* 9. NEWSLETTER SIGNUP */}
      <Section className="border-t border-border">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-subtle p-6 sm:p-10 lg:flex-row lg:items-center">
            <div className="max-w-xl space-y-2">
              <p className="text-eyebrow text-primary">Weekly launch digest</p>
              <h2 className="text-h2">Never miss a breakout SaaS launch</h2>
              <p className="text-sm text-muted-foreground">
                Get the top-upvoted products of the week delivered every Monday. No spam, one-click
                unsubscribe.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </Container>
      </Section>
    </main>
  );
}
