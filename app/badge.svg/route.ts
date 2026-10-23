// app/badge.svg/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="50" viewBox="0 0 230 50" fill="none">
    <rect width="230" height="50" rx="12" fill="#0d0d12"/>
    <rect x="0.5" y="0.5" width="229" height="49" rx="11.5" stroke="#f97316" stroke-opacity="0.3"/>
    
    <!-- Flag / Emoji Accent -->
    <circle cx="25" cy="25" r="14" fill="#f97316" fill-opacity="0.15"/>
    <text x="18" y="30" font-size="14">🇮🇳</text>
    
    <!-- Text Labels -->
    <text x="48" y="21" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="9" font-weight="600" letter-spacing="1">FEATURED ON</text>
    <text x="48" y="36" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="13" font-weight="800">Vinay <tspan fill="#f97316">Startup</tspan></text>
    
    <!-- Mini Rocket Accent -->
    <path d="M210 25L215 20M215 20L215 24M215 20L211 20" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}