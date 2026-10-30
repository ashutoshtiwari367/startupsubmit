// app/best/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Trophy } from 'lucide-react';
import { BestLeaderboardClient } from '@/components/best/BestLeaderboardClient';
import { buttonVariants } from '@/components/ui/button';
import { Container, SectionHeader } from '@/components/ui/container';
import { getTopStartups } from '@/lib/startups';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Best Startups of 2026 — Annual Hall of Fame',
  description:
    'The highest-rated and most upvoted SaaS tools, AI products and developer utilities launched this year.',
};

export default async function BestOfYearPage() {
  const currentYear = 2026;
  const startups = await getTopStartups(10);

  return (
    <main className="py-10 sm:py-14">
      <Container className="max-w-4xl space-y-10">
        <SectionHeader
          as="h1"
          eyebrow={
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="size-3.5 text-gold" aria-hidden="true" />
              <span>Annual Hall of Fame</span>
            </span>
          }
          title={`Best Startups of ${currentYear}`}
          description="The top 10 most upvoted SaaS tools, AI products and developer utilities launched on the platform this year."
        />

        <BestLeaderboardClient initialStartups={startups} />

        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-subtle p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="space-y-1">
            <h2 className="text-h3">
              Think your product belongs on the {currentYear} leaderboard?
            </h2>
            <p className="text-sm text-muted-foreground">
              Submit your startup today, collect community upvotes and earn permanent visibility.
            </p>
          </div>
          <Link
            href="/submit"
            className={buttonVariants({ variant: 'primary', size: 'md', className: 'shrink-0' })}
          >
            <span>Submit your startup</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </main>
  );
}
