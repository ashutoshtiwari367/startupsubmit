'use client';

import { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { siteConfig } from '@/lib/site-config';

/**
 * Weekly digest signup. No newsletter table/endpoint exists in the repo, so if
 * NEXT_PUBLIC_NEWSLETTER_URL is not configured this records the subscription
 * state locally and shows a confirmation message.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (siteConfig.newsletterUrl) {
      window.open(
        `${siteConfig.newsletterUrl}?email=${encodeURIComponent(email.trim())}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <div
        role="status"
        className="inline-flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft px-4 py-2.5 text-sm font-medium text-success"
      >
        <CheckCircle2 className="size-4" aria-hidden="true" />
        <span>You&apos;re on the list — see you in next week&apos;s launch digest.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Mail
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="pl-9"
        />
      </div>
      <Button type="submit" variant="primary" size="md">
        Subscribe
      </Button>
    </form>
  );
}

