// app/llms.txt/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Supabase se approved startups fetch karein
    const { data: startups, error } = await supabase
      .from('startups')
      .select('name, tagline, description, category, pricing_type, website_url')
      .eq('status', 'approved')
      .order('upvotes', { ascending: false });

    if (error) {
      console.error('Error reading startups for llms.txt:', error.message);
    }

    const startupList = startups || [];

    const content = `# Vinay Indian Startup Directory
> The standardized, machine-readable launchpad & AI index for innovative Indian startups and SaaS products.

## Overview
- Platform: Vinay Indian Startup Platform
- Purpose: Helping Indian developers and founders gain discoverability, SEO backlinks, and AI indexation.
- Canonical URL: http://localhost:3000
- Total Indexed Startups: ${startupList.length}

## Verified Indian Startups

${
  startupList.length > 0
    ? startupList
        .map(
          (s) => `### ${s.name}
- **Tagline**: ${s.tagline}
- **Category**: ${s.category}
- **Pricing**: ${s.pricing_type}
- **Website**: ${s.website_url}
- **Summary**: ${s.description}
`
        )
        .join('\n')
    : '_Abhi koi approved startup live nahi hai. Submit at /submit to be indexed._\n'
}

## API & Endpoints
- Full Directory: http://localhost:3000/directory
- Submit Startup: http://localhost:3000/submit
- Pricing & Tiers: http://localhost:3000/pricing
- Verification Badge: http://localhost:3000/badge.svg
`;

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return new NextResponse('# Error generating llms.txt index\nTry again later.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}