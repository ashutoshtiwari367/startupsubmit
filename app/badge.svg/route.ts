// app/badge.svg/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="50" viewBox="0 0 230 50" fill="none">
    <rect width="230" height="50" rx="10" fill="#ffffff"/>
    <rect x="0.5" y="0.5" width="229" height="49" rx="9.5" stroke="#e5e7eb"/>
    <rect x="12" y="11" width="28" height="28" rx="7" fill="#4f46e5"/>
    <path d="M26 18L30 26H22L26 18Z" fill="#ffffff"/>
    <circle cx="26" cy="30" r="2" fill="#c7d2fe"/>
    <text x="50" y="21" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Inter, sans-serif" font-size="9" font-weight="600" letter-spacing="0.9">FEATURED ON</text>
    <text x="50" y="36" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Inter, sans-serif" font-size="13" font-weight="700">Vinay <tspan fill="#4f46e5">Startup</tspan></text>
    <path d="M208 27L213 22M213 22V26.5M213 22H208.5" stroke="#4f46e5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
