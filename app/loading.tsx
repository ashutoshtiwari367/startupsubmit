// app/loading.tsx
import { Container } from '@/components/ui/container';
import { ProductRowSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="py-12">
      <Container className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-80 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductRowSkeleton key={i} />
          ))}
        </div>
      </Container>
    </main>
  );
}

