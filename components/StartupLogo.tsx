// components/StartupLogo.tsx
'use client';

import { useState, useEffect } from 'react';
import { hexToRgba } from '@/lib/image-utils';

interface StartupLogoProps {
  name: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  websiteUrl?: string | null;
  size?: number; // px
  className?: string;
}

function cleanDomain(url?: string | null): string | null {
  if (!url) return null;
  try {
    const withProto = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const parsed = new URL(withProto);
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return null;
  }
}

/**
 * Robust StartupLogo component that ALWAYS displays a high-quality brand image.
 * Never falls back to a plain text letter.
 * Fallback priority:
 * 1. User uploaded logoUrl
 * 2. High-res Google Favicon API for domain
 * 3. DuckDuckGo Favicon API for domain
 * 4. DiceBear Brand Shapes Vector Avatar (unique per startup name)
 * 5. Elegant inline SVG brand emblem
 */
export default function StartupLogo({
  name,
  logoUrl,
  brandColor,
  websiteUrl,
  size = 48,
  className = '',
}: StartupLogoProps) {
  const domain = cleanDomain(websiteUrl);
  const brand = brandColor || '#f97316';
  const radius = Math.round(size * 0.28);

  // Build candidate image sources
  const candidateUrls: string[] = [];
  if (logoUrl && typeof logoUrl === 'string' && logoUrl.trim() !== '') {
    candidateUrls.push(logoUrl.trim());
  }
  if (domain) {
    candidateUrls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    candidateUrls.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }
  // High-res modern vector brand shape (deterministic per name)
  const safeName = encodeURIComponent(name?.trim() || 'startup');
  candidateUrls.push(`https://api.dicebear.com/9.x/shapes/svg?seed=${safeName}&backgroundColor=0f172a,1e1b4b,271c35,18181b`);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  // Reset when props change
  useEffect(() => {
    setCurrentIndex(0);
    setAllFailed(false);
  }, [logoUrl, websiteUrl, name]);

  const handleImageError = () => {
    if (currentIndex + 1 < candidateUrls.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  const currentSrc = candidateUrls[currentIndex];

  const isSvgData = Boolean(currentSrc?.startsWith('data:image/svg+xml'));

  return (
    <div
      className={`relative shrink-0 overflow-hidden flex items-center justify-center transition-all select-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: isSvgData ? 'transparent' : '#ffffff',
        border: isSvgData ? 'none' : `1.5px solid ${hexToRgba(brand, 0.4)}`,
        boxShadow: `0 6px 18px -4px ${hexToRgba(brand, 0.35)}`,
      }}
    >
      {!allFailed && currentSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={currentSrc}
          src={currentSrc}
          alt={`${name} brand logo`}
          loading="lazy"
          onError={handleImageError}
          className={`w-full h-full transition-opacity duration-200 ${
            isSvgData ? 'object-cover' : 'object-contain p-[10%]'
          }`}
        />
      ) : (
        /* Final fallback: A stylized modern SVG brand emblem with gradient background (an IMAGE, not a plain text letter) */
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-2.5"
        >
          <defs>
            <linearGradient id={`grad-${safeName}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={brand} />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id={`glow-${safeName}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={brand} floodOpacity="0.4" />
            </filter>
          </defs>
          <rect width="64" height="64" rx="18" fill="#0d0d12" />
          <path
            d="M32 10L50 20V44L32 54L14 44V20L32 10Z"
            fill={`url(#grad-${safeName})`}
            filter={`url(#glow-${safeName})`}
            opacity="0.95"
          />
          <path
            d="M32 18L44 25V39L32 46L20 39V25L32 18Z"
            fill="#ffffff"
            opacity="0.3"
          />
          <circle cx="32" cy="32" r="6" fill="#ffffff" />
        </svg>
      )}
    </div>
  );
}
