// app/directory/page.tsx
import type { Metadata } from 'next';
import { DirectoryBrowser } from '@/components/directory/DirectoryBrowser';
import { Container, SectionHeader } from '@/components/ui/container';
import { getCategoryBySlug } from '@/lib/site-config';
import { getApprovedStartups } from '@/lib/startups';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Startup & SaaS Directory',
  description:
    'Browse verified SaaS and AI startups. Filter by category or pricing model, test-drive products and upvote top makers.',
};

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const startups = await getApprovedStartups();

  const matchedCat = params.category ? getCategoryBySlug(params.category) : undefined;
  const initialCategory = matchedCat ? matchedCat.name : 'All';
  const initialQuery = params.q || '';

  return (
    <main className="py-10 sm:py-14">
      <Container className="space-y-10">
        <SectionHeader
          as="h1"
          eyebrow="Product Directory"
          title="Discover SaaS & AI startups"
          description="Browse verified software products built by founders across India and around the world. Filter by category, pricing model or popularity."
        />

        <DirectoryBrowser
          initialStartups={startups}
          initialCategory={initialCategory}
          initialQuery={initialQuery}
        />
      </Container>
    </main>
  );
}
