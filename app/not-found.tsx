// app/not-found.tsx
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';

export default function NotFound() {
  return (
    <main className="py-20">
      <Container className="max-w-xl">
        <EmptyState
          icon={<Compass />}
          title="Page not found"
          description="The page or startup profile you are looking for doesn't exist or has been moved."
        >
          <Link href="/" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
            Back to leaderboard
          </Link>
          <Link href="/directory" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
            Browse directory
          </Link>
        </EmptyState>
      </Container>
    </main>
  );
}

