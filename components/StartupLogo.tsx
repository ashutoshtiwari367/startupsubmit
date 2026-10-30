// components/StartupLogo.tsx
'use client';

import { useState } from 'react';
import { cn } from 'cn';
import { cleanDomain, initials } from '@/lib/format';

interface StartupLogoProps {
  name: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  websiteUrl?: string | null;
  size?: number;
  className?: string;
}

/**
 * Product logo with a clean, crisp 1px border on a light surface.
 * Fallback priority:
 *   1. Uploaded logoUrl
 *   2. Google Favicon API for the product domain
 *   3. DuckDuckGo Favicon API
 *   4. Deterministic initials emblem
 */
export default function StartupLogo({
  name,
  logoUrl,
  websiteUrl,
  size = 48,
  className = '',
}: StartupLogoProps) {
  const domain = cleanDomain(websiteUrl);

  const candidateUrls: string[] = [];
  if (logoUrl && typeof logoUrl === 'string' && logoUrl.trim() !== '') {
    candidateUrls.push(logoUrl.trim());
  }
  if (domain) {
    candidateUrls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    candidateUrls.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }

  const [failedSrcs, setFailedSrcs] = useState<string[]>([]);
  const currentSrc = candidateUrls.find((u) => !failedSrcs.includes(u));
  const isSvgData = Boolean(currentSrc?.startsWith('data:image/svg+xml'));

  const sizeClass =
    size <= 36
      ? 'size-9 rounded-lg'
      : size <= 48
        ? 'size-12 rounded-xl'
        : size <= 64
          ? 'size-15 rounded-xl'
          : 'size-20 rounded-2xl';

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden border border-border bg-card shadow-xs select-none',
        sizeClass,
        className
      )}
    >
      {currentSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={currentSrc}
          src={currentSrc}
          alt={`${name} logo`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() =>
            setFailedSrcs((prev) => (prev.includes(currentSrc) ? prev : [...prev, currentSrc]))
          }
          className={cn(
            'size-full transition-opacity duration-150',
            isSvgData ? 'object-cover' : 'object-contain p-1.5'
          )}
        />
      ) : (
        <span className="flex size-full items-center justify-center bg-primary-soft text-xs font-bold text-primary-soft-foreground">
          {initials(name) || 'S'}
        </span>
      )}
    </div>
  );
}
