// lib/demo-startups.ts
import type { StartupItem } from '@/lib/type';

// Clean, high-res SVG brand logos matching the user's reference design
const LOGO_BRANDREPLY = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#059669"/>
  <rect x="16" y="34" width="8" height="16" rx="4" fill="#ffffff"/>
  <rect x="28" y="24" width="8" height="26" rx="4" fill="#ffffff"/>
  <rect x="40" y="14" width="8" height="36" rx="4" fill="#ffffff"/>
</svg>
`)}`;

const LOGO_REWARDFUL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#0284c7"/>
  <circle cx="32" cy="32" r="20" stroke="#ffffff" stroke-width="5" fill="none"/>
  <circle cx="32" cy="32" r="11" stroke="#ffffff" stroke-width="4" fill="none"/>
  <circle cx="32" cy="32" r="4" fill="#ffffff"/>
</svg>
`)}`;

const LOGO_PHONECALL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#d97706"/>
  <path d="M22 18C20.8954 18 20 18.8954 20 20C20 34.3594 31.6406 46 46 46C47.1046 46 48 45.1046 48 44V38.5C48 37.9477 47.5523 37.5 47 37.5C44.5 37.5 42.1 36.9 39.9 35.8C39.4 35.5 38.8 35.6 38.4 36L35.7 38.7C31.5 36.5 28.1 33.1 25.9 28.9L28.6 26.2C29 25.8 29.1 25.2 28.8 24.7C27.7 22.5 27.1 20.1 27.1 17.6C27.1 17.05 26.65 16.6 26.1 16.6H22V18Z" fill="#ffffff"/>
</svg>
`)}`;

const LOGO_TRANSCLIPPER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#06b6d4"/>
  <rect x="18" y="18" width="28" height="28" rx="6" stroke="#ffffff" stroke-width="4" fill="none"/>
  <path d="M28 25L38 32L28 39V25Z" fill="#ffffff"/>
</svg>
`)}`;

const LOGO_HAIRSTYLE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#a855f7"/>
  <circle cx="24" cy="44" r="6" stroke="#ffffff" stroke-width="3" fill="none"/>
  <circle cx="40" cy="44" r="6" stroke="#ffffff" stroke-width="3" fill="none"/>
  <path d="M28 39L42 18" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  <path d="M36 39L22 18" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
</svg>
`)}`;

const LOGO_SNAPDUB = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#dc2626"/>
  <path d="M26 20L44 32L26 44V20Z" fill="#ffffff"/>
</svg>
`)}`;

const LOGO_POSTMAN = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#ff6c37"/>
  <circle cx="32" cy="26" r="8" fill="#ffffff"/>
  <path d="M20 44C20 37.3726 25.3726 32 32 32C38.6274 32 44 37.3726 44 44H20Z" fill="#ffffff"/>
</svg>
`)}`;

const LOGO_SPRINTO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#4f46e5"/>
  <path d="M32 16L44 21V31C44 40 38.5 45.5 32 48C25.5 45.5 20 40 20 31V21L32 16Z" fill="#ffffff"/>
</svg>
`)}`;

const LOGO_ZERODHA = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#387ed1"/>
  <path d="M32 16L46 32L32 48L18 32L32 16Z" fill="#ffffff"/>
</svg>
`)}`;

const LOGO_INVIDEO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#06b6d4"/>
  <circle cx="32" cy="32" r="14" stroke="#ffffff" stroke-width="4" fill="none"/>
  <path d="M29 25L38 32L29 39V25Z" fill="#ffffff"/>
</svg>
`)}`;

const LOGO_DUKAAN = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#f97316"/>
  <path d="M20 24H44L41 44H23L20 24Z" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none"/>
  <path d="M26 24V20C26 16.7 28.7 14 32 14C35.3 14 38 16.7 38 20V24" stroke="#ffffff" stroke-width="4"/>
</svg>
`)}`;

const LOGO_YELLOWAI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#eab308"/>
  <circle cx="32" cy="32" r="12" fill="#ffffff"/>
  <circle cx="28" cy="30" r="2.5" fill="#eab308"/>
  <circle cx="36" cy="30" r="2.5" fill="#eab308"/>
</svg>
`)}`;

export const DEMO_STARTUPS: StartupItem[] = [
  {
    id: 'demo-brandreply',
    name: 'BrandReply',
    slug: 'brandreply',
    tagline: 'Track and improve your brand visibility in AI answers (ChatGPT, Perplexity, Gemini).',
    category: 'AI',
    pricing_type: 'Freemium',
    upvotes: 489,
    website_url: 'https://brandreply.ai',
    tier: 'premium',
    is_featured: true,
    is_verified: true,
    banner_title: 'Scale your AI Answer Engine Optimization (AEO)',
    banner_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    tier_starts_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    tier_expires_at: new Date(Date.now() + 86400000 * 28).toISOString(),
    logo_url: LOGO_BRANDREPLY,
    banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    brand_color: '#059669',
    description: 'BrandReply helps founders, growth marketers, and brands monitor their visibility and citation frequency across major LLMs including ChatGPT, Perplexity, Claude, and Google Gemini with actionable optimization tips.',
    twitter_handle: '@brandreply',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    views: 1840,
    clicks: 420,
  },
  {
    id: 'demo-rewardful',
    name: 'Rewardful Inc.',
    slug: 'rewardful-inc',
    tagline: 'Affiliate and referral tracking software built specifically for SaaS companies.',
    category: 'SaaS',
    pricing_type: 'Paid',
    upvotes: 432,
    website_url: 'https://rewardful.com',
    tier: 'premium',
    is_featured: true,
    is_verified: true,
    banner_title: 'Turn SaaS customers into an army of high-converting affiliates',
    banner_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
    tier_starts_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    tier_expires_at: new Date(Date.now() + 86400000 * 25).toISOString(),
    logo_url: LOGO_REWARDFUL,
    banner_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    brand_color: '#0284c7',
    description: 'Rewardful connects with Stripe and Paddle in minutes to automatically track affiliate referrals, commissions, and revenue growth with zero headache.',
    twitter_handle: '@rewardful',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    views: 1420,
    clicks: 310,
  },
  {
    id: 'demo-phonecall',
    name: 'Phonecall AI',
    slug: 'phonecall-ai',
    tagline: 'Make international AI calls to landlines and mobiles worldwide directly from browser.',
    category: 'AI',
    pricing_type: 'Freemium',
    upvotes: 378,
    website_url: 'https://phonecall.bot',
    tier: 'featured',
    is_featured: true,
    is_verified: false,
    tier_starts_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    tier_expires_at: new Date(Date.now() + 86400000 * 10).toISOString(),
    logo_url: LOGO_PHONECALL,
    banner_url: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=800&auto=format&fit=crop',
    brand_color: '#d97706',
    description: 'An AI-powered voice agent that can call phones, confirm bookings, handle inbound inquiries, and conduct qualification calls with human-like latency.',
    twitter_handle: '@phonecallai',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    views: 980,
    clicks: 215,
  },
  {
    id: 'demo-transclipper',
    name: 'TransClipper',
    slug: 'transclipper',
    tagline: 'Analyze viral short videos and generate automated high-converting content ideas.',
    category: 'Marketing',
    pricing_type: 'Free',
    upvotes: 351,
    website_url: 'https://transclipper.io',
    tier: 'featured',
    is_featured: true,
    is_verified: false,
    tier_starts_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    tier_expires_at: new Date(Date.now() + 86400000 * 8).toISOString(),
    logo_url: LOGO_TRANSCLIPPER,
    banner_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop',
    brand_color: '#06b6d4',
    description: 'TransClipper transcribes, detects hooks, and analyzes virality metrics across TikTok, Reels, and YouTube Shorts to help content creators script winners.',
    twitter_handle: '@transclipper',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    views: 890,
    clicks: 195,
  },
  {
    id: 'demo-hairstylechanger',
    name: 'HairStyleChanger.AI',
    slug: 'hairstylechanger-ai',
    tagline: 'Try on any hairstyle and hair color instantly with realistic diffusion models.',
    category: 'AI',
    pricing_type: 'Freemium',
    upvotes: 310,
    website_url: 'https://hairstylechanger.ai',
    tier: 'free',
    is_featured: false,
    logo_url: LOGO_HAIRSTYLE,
    banner_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    brand_color: '#a855f7',
    description: 'Upload a selfie and preview dozens of barber cuts, salon styles, beard designs, and hair shades photorealistically before sitting in the salon chair.',
    twitter_handle: '@hairstyleai',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    views: 650,
    clicks: 130,
  },
  {
    id: 'demo-snapdub',
    name: 'SnapDub',
    slug: 'snapdub',
    tagline: 'Paste a long video, get viral vertical clips with active speaker auto-framing.',
    category: 'AI',
    pricing_type: 'Freemium',
    upvotes: 295,
    website_url: 'https://snapdub.co',
    tier: 'featured',
    is_featured: true,
    is_verified: false,
    tier_starts_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    tier_expires_at: new Date(Date.now() + 86400000 * 12).toISOString(),
    logo_url: LOGO_SNAPDUB,
    banner_url: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=800&auto=format&fit=crop',
    brand_color: '#dc2626',
    description: 'Convert 1-hour podcasts, webinars, and interviews into 10 viral Shorts with animated captions, face tracking, and dynamic b-roll inserts.',
    twitter_handle: '@snapdub',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    views: 720,
    clicks: 160,
  },
  {
    id: 'demo-postman',
    name: 'Postman Platform',
    slug: 'postman-platform',
    tagline: 'The complete API platform for building, testing, and collaborating on APIs.',
    category: 'DevTools',
    pricing_type: 'Freemium',
    upvotes: 520,
    website_url: 'https://www.postman.com',
    tier: 'premium',
    is_featured: true,
    is_verified: true,
    banner_title: 'The complete API platform for building and testing software',
    banner_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    tier_starts_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    tier_expires_at: new Date(Date.now() + 86400000 * 22).toISOString(),
    logo_url: LOGO_POSTMAN,
    banner_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    brand_color: '#ff6c37',
    description: 'Founded in Bengaluru, Postman simplifies each step of the API lifecycle and streamlines collaboration so you can create better APIs faster.',
    twitter_handle: '@getpostman',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    views: 2450,
    clicks: 680,
  },
  {
    id: 'demo-sprinto',
    name: 'Sprinto Security',
    slug: 'sprinto-security',
    tagline: 'Automated SOC2, ISO 27001, and GDPR compliance platform for SaaS.',
    category: 'SaaS',
    pricing_type: 'Paid',
    upvotes: 268,
    website_url: 'https://sprinto.com',
    tier: 'featured',
    is_featured: true,
    tier_starts_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    tier_expires_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    logo_url: LOGO_SPRINTO,
    banner_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop',
    brand_color: '#4f46e5',
    description: 'Sprinto helps fast-growing tech companies achieve infosec compliance and win enterprise deals without slowing down engineering momentum.',
    twitter_handle: '@sprintohq',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    views: 590,
    clicks: 120,
  },
  {
    id: 'demo-zerodha',
    name: 'Zerodha Kite',
    slug: 'zerodha-kite',
    tagline: 'Ultra-fast flagship trading platform with streaming market data and charts.',
    category: 'Fintech',
    pricing_type: 'Free',
    upvotes: 615,
    website_url: 'https://kite.zerodha.com',
    tier: 'free',
    is_featured: false,
    logo_url: LOGO_ZERODHA,
    banner_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
    brand_color: '#387ed1',
    description: 'The pioneering Indian fintech powerhouse offering zero brokerage on equity investments and an intuitive, lightning-fast web and mobile trading UI.',
    twitter_handle: '@zerodhaonline',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    views: 3100,
    clicks: 740,
  },
  {
    id: 'demo-invideo',
    name: 'InVideo Studio',
    slug: 'invideo-studio',
    tagline: 'Turn text prompts and scripts into studio-grade video productions instantly.',
    category: 'AI',
    pricing_type: 'Freemium',
    upvotes: 384,
    website_url: 'https://invideo.io',
    tier: 'free',
    is_featured: false,
    logo_url: LOGO_INVIDEO,
    banner_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop',
    brand_color: '#06b6d4',
    description: 'Empowers over 7 million creators and brands worldwide to produce cinematic videos with AI scriptwriting, voice clone narrations, and premium b-roll.',
    twitter_handle: '@InVideoOfficial',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 11).toISOString(),
    views: 920,
    clicks: 210,
  },
  {
    id: 'demo-dukaan',
    name: 'Dukaan Store',
    slug: 'dukaan-store',
    tagline: 'Launch your high-speed global e-commerce storefront in 30 seconds.',
    category: 'E-Commerce',
    pricing_type: 'Freemium',
    upvotes: 247,
    website_url: 'https://mydukaan.io',
    tier: 'free',
    is_featured: false,
    logo_url: LOGO_DUKAAN,
    banner_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop',
    brand_color: '#f97316',
    description: 'Dukaan gives merchants, D2C brands, and creators an all-in-one e-commerce platform with automated logistics, instant checkout, and marketing integrations.',
    twitter_handle: '@mydukaan',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    views: 480,
    clicks: 95,
  },
  {
    id: 'demo-yellowai',
    name: 'Yellow.ai Agentic CX',
    slug: 'yellow-ai',
    tagline: 'Enterprise dynamic conversational AI agents for automated customer experience.',
    category: 'AI',
    pricing_type: 'Paid',
    upvotes: 312,
    website_url: 'https://yellow.ai',
    tier: 'free',
    is_featured: false,
    logo_url: LOGO_YELLOWAI,
    banner_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    brand_color: '#eab308',
    description: 'Automating billions of interactions across voice and chat channels in 135+ languages for Fortune 500 enterprises with generative AI agents.',
    twitter_handle: '@yellowaboriginal',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 13).toISOString(),
    views: 710,
    clicks: 140,
  }
];
