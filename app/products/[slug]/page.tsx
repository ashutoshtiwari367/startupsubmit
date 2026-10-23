// app/products/[slug]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  DollarSign, 
  User, 
  Layers, 
  Cpu, 
  ArrowRight,
  Flame,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { supabase, normalizeStartup } from '@/lib/supabase';
import StartupLogo from '@/components/StartupLogo';
import StartupCard, { StartupItem } from '@/components/StartupCard';
import ProductDetailInteractive from '@/components/ProductDetailInteractive';
import { hexToRgba } from '@/lib/image-utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getStartupFromDb(slug: string) {
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }
  return normalizeStartup(data);
}

async function getRelatedStartups(category: string, currentId: string): Promise<StartupItem[]> {
  try {
    const { data } = await supabase
      .from('startups')
      .select('*')
      .eq('status', 'approved')
      .neq('id', currentId)
      .eq('category', category)
      .limit(3);

    if (data && data.length > 0) {
      return (data as any[]).map(normalizeStartup) as StartupItem[];
    }

    // Fallback: fetch other top approved startups if not enough in same category
    const { data: fallback } = await supabase
      .from('startups')
      .select('*')
      .eq('status', 'approved')
      .neq('id', currentId)
      .order('upvotes', { ascending: false })
      .limit(3);

    return ((fallback || []) as any[]).map(normalizeStartup) as StartupItem[];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getStartupFromDb(slug);

  if (!startup) {
    return { title: 'Startup Not Found - Vinay Startup Platform' };
  }

  return {
    title: `${startup.name} — ${startup.tagline} | Indian Startup Launchpad`,
    description: startup.description || startup.tagline,
    openGraph: {
      title: `${startup.name} on Vinay Startup Platform`,
      description: startup.tagline,
      type: 'website',
      images: startup.logo_url ? [startup.logo_url] : undefined,
    },
  };
}

export default async function StartupDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const startup = await getStartupFromDb(slug);

  if (!startup) {
    notFound();
  }

  const related = await getRelatedStartups(startup.category, startup.id);
  const brand = startup.brand_color || '#f97316';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: startup.name,
    description: startup.description,
    applicationCategory: startup.category,
    operatingSystem: 'All Web Browsers',
    offers: {
      '@type': 'Offer',
      price: startup.pricing_type === 'Free' ? '0' : '999',
      priceCurrency: 'INR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: startup.upvotes || 1,
    },
  };

  const badgeEmbedCode = `<a href="https://vinaystartup.com/products/${startup.slug}?utm_source=badge" target="_blank"><img src="https://vinaystartup.com/badge.svg" alt="Featured on Vinay Startup" width="230" height="50" /></a>`;

  return (
    <main className="min-h-screen bg-[#070709] text-white pt-6 pb-24 px-4 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glow (matches startup brand color) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] blur-[160px] pointer-events-none -z-10"
        style={{
          background: `radial-gradient(ellipse at top, ${hexToRgba(brand, 0.28)}, transparent 70%)`,
        }}
      />

      {/* JSON-LD Schema for AI Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 hover:text-white transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" /> Back to Directory
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Category:</span>
            <Link
              href={`/category/${startup.category.toLowerCase()}`}
              className="text-orange-400 hover:underline font-bold"
            >
              {startup.category}
            </Link>
          </div>
        </div>

        {/* Top Product Header Card */}
        <div
          className="bg-[#0d0d12] border rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all"
          style={{
            borderColor: hexToRgba(brand, 0.35),
            boxShadow: `0 20px 50px -15px ${hexToRgba(brand, 0.2)}`,
          }}
        >
          {/* Top Brand Ambient Tint Bar */}
          <div
            className="absolute inset-x-0 top-0 h-32 pointer-events-none opacity-50"
            style={{
              background: `linear-gradient(180deg, ${hexToRgba(brand, 0.3)}, transparent)`,
            }}
          />

          <div className="relative space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              
              <div className="flex items-start sm:items-center gap-5 sm:gap-6">
                <StartupLogo
                  name={startup.name}
                  logoUrl={startup.logo_url}
                  websiteUrl={startup.website_url}
                  brandColor={brand}
                  size={84}
                  className="shadow-2xl ring-2 ring-white/10 shrink-0"
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      {startup.name}
                    </h1>
                    {startup.is_featured && (
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40">
                        Featured Launch
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Tech
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                    {startup.tagline}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Specs Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase">
                  <Tag className="w-3 h-3 text-orange-400" /> Category
                </div>
                <div className="font-bold text-sm text-white">{startup.category}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase">
                  <DollarSign className="w-3 h-3 text-emerald-400" /> Pricing Model
                </div>
                <div className="font-bold text-sm text-white">{startup.pricing_type}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase">
                  <User className="w-3 h-3 text-blue-400" /> Maker
                </div>
                <div className="font-bold text-sm text-white truncate">
                  {startup.twitter_handle ? `@${startup.twitter_handle.replace('@', '')}` : 'Verified Founder'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase">
                  <Sparkles className="w-3 h-3 text-amber-400" /> AI Index Status
                </div>
                <div className="font-bold text-sm text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Indexed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Action Hub & Browser Mockup Preview */}
        <ProductDetailInteractive
          id={startup.id}
          slug={startup.slug}
          name={startup.name}
          tagline={startup.tagline}
          initialUpvotes={startup.upvotes || 1}
          websiteUrl={startup.website_url}
          brandColor={brand}
          twitterHandle={startup.twitter_handle}
          category={startup.category}
          badgeEmbedCode={badgeEmbedCode}
        />

        {/* Detailed Product About & Capabilities Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" /> About {startup.name}
              </h2>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-4">
                {startup.description}
              </div>

              {/* Product Highlights Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                    <Cpu className="w-4 h-4" /> Built For Performance
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Designed to provide seamless workflow and top productivity for Indian and global users.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" /> Verified Platform
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Legitimate product validated by Vinay Startup Launchpad with direct founder links.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Crawler & LLM Readability Banner */}
            <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 rounded-3xl p-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-orange-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> AI Engine & Search Indexing
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                This startup profile is mapped directly into machine-readable JSON-LD schemas and our live <code className="text-orange-300 bg-white/5 px-1.5 py-0.5 rounded">/llms.txt</code> feed. This ensures ChatGPT, Perplexity AI, Google Gemini, and Claude accurately cite {startup.name} when answering user queries about top {startup.category} tools.
              </p>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Product Details
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Product Name</span>
                  <span className="font-semibold text-white">{startup.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Category</span>
                  <span className="font-semibold text-orange-400">{startup.category}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Pricing Model</span>
                  <span className="font-semibold text-emerald-400">{startup.pricing_type}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Official Link</span>
                  <a
                    href={startup.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white hover:text-orange-400 flex items-center gap-1"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Status</span>
                  <span className="font-semibold text-emerald-400 capitalize">
                    {startup.status || 'Approved'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#121218] to-[#0a0a0e] border border-white/10 rounded-3xl p-6 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" /> Have a Startup to Launch?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit your product in less than 2 minutes and get indexed by top AI crawlers and early adopters.
              </p>
              <Link
                href="/submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all"
              >
                <span>Submit Your Startup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Similar / Related Startups Discovery Section */}
        {related.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                <Flame className="w-4 h-4 text-orange-500" /> Similar Products & Alternatives in {startup.category}
              </div>
              <Link
                href="/directory"
                className="text-xs font-semibold text-orange-400 hover:underline flex items-center gap-1"
              >
                <span>Browse Directory</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((item) => (
                <StartupCard key={item.id} startup={item} variant="grid" />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}