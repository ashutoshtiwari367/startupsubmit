'use client';

import Link from 'next/link';
import { Rocket } from 'lucide-react';
import StartupCard from '@/components/StartupCard';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useStartupList } from '@/lib/upvote';
import type { StartupItem } from '@/lib/type';

export function BestLeaderboardClient({
  initialStartups,
}: {
  initialStartups: StartupItem[];
}) {
  const { startups, handleUpvote } = useStartupList(initialStartups);

  if (startups.length === 0) {
    return (
      <EmptyState
        icon={<Rocket />}
        title="No approved startups yet"
        description="Be the first founder to launch and claim the #1 spot on the annual leaderboard."
      >
        <Link href="/submit" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
          Submit your startup
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-2.5">
      {startups.map((item, idx) => (
        <StartupCard
          key={item.id}
          startup={item}
          variant="list"
          rank={idx + 1}
          onUpvote={handleUpvote}
        />
      ))}
    </div>
  );
}

