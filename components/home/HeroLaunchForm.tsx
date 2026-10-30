'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroLaunchForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = url.trim();
    if (!raw) {
      router.push('/submit');
      return;
    }
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    router.push(`/submit?url=${encodeURIComponent(normalized)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-xl flex-col gap-2 rounded-xl border border-border-strong bg-card p-1.5 shadow-sm transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15 sm:flex-row sm:items-center"
    >
      <div className="relative flex flex-1 items-center">
        <Globe
          aria-hidden="true"
          className="pointer-events-none ml-3 size-4 shrink-0 text-muted-foreground"
        />
        <label htmlFor="hero-launch-url" className="sr-only">
          Your startup website URL
        </label>
        <input
          id="hero-launch-url"
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourstartup.com"
          className="h-10 w-full bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      <Button type="submit" size="md" className="w-full sm:w-auto sm:px-5">
        <span>Launch your startup</span>
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}

