-- ============================================================================
-- Migration: 0005_seed_dynamic_listings.sql
-- Description: Rich feature-complete seed listings for LaunchOS.
--              Powers:
--                1. Live Leaderboard Podium (1st, 2nd, 3rd place Daily Winners)
--                2. Featured Today / Sponsors (HeroSection 3 slots)
--                3. Premium & Regular Launches (LaunchingNowSection rows)
--                4. Screenshots for each listing in listing_screenshots
--                5. Realistic view and click analytics in listing_analytics
-- ============================================================================

-- Helper: resolve category ID safely by slug with fallback
-- ----------------------------------------------------------------------------
-- 1. Insert/Upsert Rich Master Listings
-- ----------------------------------------------------------------------------

-- 1. Cortex AI (Rank #1 Daily Champion, Featured)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'cortex-ai',
  'Cortex AI',
  'Autonomous customer success agents for modern B2B SaaS teams.',
  'Cortex ingests docs, issue trackers, and ticketing history to autonomously resolve 68% of enterprise support tickets in real-time.',
  'Cortex AI empowers high-velocity SaaS teams to deliver 24/7 autonomous customer support with human-grade empathy and deep product reasoning. It connects natively to Linear, GitHub, Zendesk, and Stripe to diagnose user issues, run database lookups, and execute remediation workflows without manual human intervention. Backed by state-of-the-art reasoning models and fine-tuned on over 10M SaaS support conversations.',
  'https://cortexflow.ai',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'ai-agents' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'freemium', 29, 'USD', 'monthly', 'featured', 49,
  'approved', 'austin.miller@cortex.ai', now() - interval '2 hours', now() - interval '2 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description_short = EXCLUDED.description_short,
  description_long = EXCLUDED.description_long,
  website_url = EXCLUDED.website_url,
  logo_url = EXCLUDED.logo_url,
  category_id = EXCLUDED.category_id,
  pricing_model = EXCLUDED.pricing_model,
  starting_price = EXCLUDED.starting_price,
  billing_period = EXCLUDED.billing_period,
  listing_plan = EXCLUDED.listing_plan,
  status = 'approved',
  approved_at = now();

-- 2. VectorFlow (Rank #2 Daily Champion, Featured)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'vector-flow',
  'VectorFlow',
  'Instant vector database deployment with zero cold starts.',
  'Serverless embedding indexer engineered for real-time semantic search and low-latency RAG applications at scale.',
  'VectorFlow gives developers ultra-low-latency vector search without the burden of managing dedicated cluster infrastructure. Featuring instant cold-start indexing, native hybrid keyword-vector querying, and millisecond ANN searches across hundreds of millions of embeddings. Integrated with OpenAI, Cohere, Anthropic, and Hugging Face with one-click SDK setup for TypeScript and Python.',
  'https://vectorflow.io',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'developer-tools' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'paid', 49, 'USD', 'monthly', 'featured', 49,
  'approved', 'elena.rostova@vectorflow.io', now() - interval '4 hours', now() - interval '4 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 3. Prism Studio (Rank #3 Daily Champion, Featured)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'prism-studio',
  'Prism Studio',
  'Turn design system tokens into production React code.',
  'A bi-directional sync engine connecting Figma styles, Tailwind v4 theme variables, and shadcn component libraries.',
  'Prism Studio bridges the gap between designers and software engineers by synchronizing design tokens directly from Figma into ready-to-ship TypeScript code. When design variables update in Figma, Prism automatically opens pull requests with validated CSS custom properties, Tailwind v4 themes, and accessible UI primitives.',
  'https://prismstudio.dev',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'design' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'freemium', 19, 'USD', 'monthly', 'featured', 49,
  'approved', 'steven.vance@prismstudio.dev', now() - interval '6 hours', now() - interval '6 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 4. Supaship (Hero Featured Sponsor #1)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'supaship',
  'Supaship',
  'Ship your Next.js SaaS in days. Auth, Stripe and DB ready.',
  'The production Next.js boilerplate trusted by 2,400+ indie makers to launch profitable SaaS applications.',
  'Supaship comes pre-configured with Supabase authentication, server actions, Stripe & LemonSqueezy subscriptions, transactional Resend emails, and responsive Tailwind components. Spend less time wrestling with auth configs and more time validating your product idea.',
  'https://supaship.io',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'developer-tools' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'paid', 79, 'USD', 'one_time', 'featured', 49,
  'approved', 'alex.hunt@supaship.io', now() - interval '8 hours', now() - interval '8 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 5. AetherDB (Hero Featured Sponsor #2)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'aether-db',
  'AetherDB',
  'Serverless Postgres with instant branching.',
  'Instant copy-on-write database branches for every preview environment, PR, and staging deployment.',
  'AetherDB gives engineering teams isolated database branches that spin up in under 500ms. Perfect for CI/CD test automation, ephemeral PR previews, and local schema migrations without polluting production data.',
  'https://aetherdb.com',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'developer-tools' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'freemium', 25, 'USD', 'monthly', 'featured', 49,
  'approved', 'marcus.chen@aetherdb.com', now() - interval '10 hours', now() - interval '10 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 6. AgentFlow (Hero Featured Sponsor #3)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'agent-flow',
  'AgentFlow',
  'Visual canvas for multi-agent workflows.',
  'Drag-and-drop node graph builder for orchestrating autonomous AI agent swarms and tool calling.',
  'AgentFlow makes building autonomous multi-agent pipelines as simple as connecting nodes on a canvas. Combine Claude, GPT-4, and custom tool endpoints with visual loopers, guardrail filters, and memory state checkpoints.',
  'https://agentflow.ai',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'ai-agents' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'freemium', 39, 'USD', 'monthly', 'featured', 49,
  'approved', 'sarah.jenkins@agentflow.ai', now() - interval '12 hours', now() - interval '12 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 7. PulseGrid (Live Leaderboard Rank #4, Premium)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'pulse-grid',
  'PulseGrid',
  'Minimalist server health and cron monitoring for indie teams.',
  'Real-time heartbeat monitoring, ping latency tracking, and dead-man switch alerts via Telegram, Slack and SMS.',
  'PulseGrid was built for bootstrapped developers who need reliable infrastructure monitoring without enterprise Bloatware. Set up 1-minute HTTP, TCP, SSL, and Cron checks with gorgeous public status pages.',
  'https://pulsegrid.net',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'monitoring' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'freemium', 15, 'USD', 'monthly', 'premium', 29,
  'approved', 'david.k@pulsegrid.net', now() - interval '14 hours', now() - interval '14 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 8. PromptSmith (Live Leaderboard Rank #5, Premium)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'prompt-smith',
  'PromptSmith',
  'Automated prompt regression testing and cost optimization for LLMs.',
  'Continuous integration for AI prompts. Catch regressions, optimize token usage, and evaluate outputs automatically.',
  'PromptSmith runs automated assertion suites on every prompt revision to prevent hallucination regressions before shipping to production. Compare provider costs between Anthropic, OpenAI, and open-source models with automated batch benchmarks.',
  'https://promptsmith.ai',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'artificial-intelligence' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'paid', 35, 'USD', 'monthly', 'premium', 29,
  'approved', 'kevin.t@promptsmith.ai', now() - interval '16 hours', now() - interval '16 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 9. Supaship Native (Live Leaderboard Rank #6, Premium)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'supaship-native',
  'Supaship Native',
  'Ship Next.js web apps directly to production iOS and Android.',
  'Zero-config Capacitor and React Native bridges wrapping your existing Next.js web app into native app store packages.',
  'Supaship Native enables Next.js founders to publish to the Apple App Store and Google Play Store without rewriting a single line of React code. Includes in-app purchases, push notifications, biometric FaceID, and deep link routing.',
  'https://supaship.io/native',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'building-products' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'paid', 99, 'USD', 'one_time', 'premium', 29,
  'approved', 'alex.hunt@supaship.io', now() - interval '18 hours', now() - interval '18 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 10. TraceKit (Live Leaderboard Rank #7, Premium)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'trace-kit',
  'TraceKit',
  'Distributed OpenTelemetry logging with zero-instrumentation config.',
  'Lightweight trace collector and APM dashboard designed specifically for edge functions and serverless runtimes.',
  'TraceKit automatically maps waterfall execution times across edge worker invocations, database queries, and third-party API calls. Identify cold-start bottlenecks and SQL latency outliers without slowing down your app.',
  'https://tracekit.io',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'developer-tools' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'freemium', 20, 'USD', 'monthly', 'premium', 29,
  'approved', 'rachel.m@tracekit.io', now() - interval '20 hours', now() - interval '20 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 11. DocuMorph (Rank #8, PDF & Documents)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'docu-morph',
  'DocuMorph',
  'Instant AI-powered PDF extraction, OCR and structured JSON export.',
  'Extract tables, receipts, invoices, and contracts into typed JSON schemas with 99.4% field accuracy.',
  'DocuMorph eliminates manual document data entry. Simply upload any scanned PDF or image, define your desired JSON schema, and receive parsed, validated structured data via webhooks in seconds.',
  'https://documorph.io',
  'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'pdf-documents' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'free', NULL, 'USD', NULL, 'free', 0,
  'approved', 'lisa.w@documorph.io', now() - interval '22 hours', now() - interval '22 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 12. MailCraft (Rank #9, Email Marketing)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'mail-craft',
  'MailCraft',
  'Beautiful drag-and-drop newsletter builder with React email components.',
  'Craft bulletproof responsive marketing emails that render pixel-perfect across Gmail, Outlook, and Apple Mail.',
  'MailCraft combines the visual flexibility of a canvas builder with the maintainability of React Email. Export ready-to-send HTML templates or trigger automated broadcasts through SendGrid, Postmark, or AWS SES.',
  'https://mailcraft.email',
  'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'email-marketing' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'freemium', 29, 'USD', 'monthly', 'premium', 29,
  'approved', 'chris.b@mailcraft.email', now() - interval '24 hours', now() - interval '24 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 13. SEOEngine (Rank #10, SEO)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'seo-engine',
  'SEOEngine',
  'Programmatic keyword clustering and landing page generation.',
  'Scale high-intent programmatic SEO content targeting long-tail queries without keyword cannibalization.',
  'SEOEngine analyzes SERP competitors and clusters keywords into semantic content hubs. Generates Next.js ISR page templates with verified schema markup, canonical links, and OpenGraph social cards.',
  'https://seoengine.app',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'seo' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'paid', 49, 'USD', 'monthly', 'premium', 29,
  'approved', 'sam.seo@seoengine.app', now() - interval '26 hours', now() - interval '26 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 14. OmniChat (Rank #11, Chatbots)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'omni-chat',
  'OmniChat',
  'Omnichannel customer support widget syncing WhatsApp, Telegram and email.',
  'One unified inbox for all inbound customer inquiries with AI auto-drafts and team assignments.',
  'OmniChat centralizes conversations across web chat, WhatsApp Business, Apple Messages, and Telegram into a single collaborative workspace for customer service teams.',
  'https://omnichat.co',
  'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'chatbots' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'freemium', 19, 'USD', 'monthly', 'free', 0,
  'approved', 'victor.p@omnichat.co', now() - interval '28 hours', now() - interval '28 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- 15. FinTrack Pro (Rank #12, Fintech)
INSERT INTO public.listings (
  slug, name, tagline, description_short, description_long,
  website_url, logo_url, category_id, pricing_model, starting_price,
  currency, billing_period, listing_plan, listing_plan_price,
  status, submitted_by_email, created_at, approved_at
) VALUES (
  'fin-track-pro',
  'FinTrack Pro',
  'Subscription analytics, churn prediction and automated dunning for SaaS.',
  'Track real-time MRR, net revenue retention (NRR), and recover failed credit card payments automatically.',
  'FinTrack Pro connects directly to Stripe, Paddle, and Razorpay to deliver deep SaaS financial metrics. Automated smart dunning retries failed subscription invoices, recovering up to 64% of involuntary churn.',
  'https://fintrack.finance',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&h=200&fit=crop&q=80',
  COALESCE((SELECT id FROM public.categories WHERE slug = 'fintech' LIMIT 1), (SELECT id FROM public.categories LIMIT 1)),
  'freemium', 49, 'USD', 'monthly', 'premium', 29,
  'approved', 'emma.c@fintrack.finance', now() - interval '30 hours', now() - interval '30 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  status = 'approved';

-- ----------------------------------------------------------------------------
-- 2. Insert Screenshots for Every Listing
-- ----------------------------------------------------------------------------
DELETE FROM public.listing_screenshots WHERE listing_id IN (
  SELECT id FROM public.listings WHERE slug IN (
    'cortex-ai', 'vector-flow', 'prism-studio', 'supaship', 'aether-db',
    'agent-flow', 'pulse-grid', 'prompt-smith', 'supaship-native', 'trace-kit',
    'docu-morph', 'mail-craft', 'seo-engine', 'omni-chat', 'fin-track-pro'
  )
);

INSERT INTO public.listing_screenshots (listing_id, url, position)
SELECT l.id, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop&q=80', 0
FROM public.listings l WHERE l.slug IN ('cortex-ai', 'vector-flow', 'prism-studio', 'supaship', 'aether-db', 'agent-flow');

INSERT INTO public.listing_screenshots (listing_id, url, position)
SELECT l.id, 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=675&fit=crop&q=80', 1
FROM public.listings l WHERE l.slug IN ('cortex-ai', 'vector-flow', 'prism-studio', 'supaship', 'aether-db', 'agent-flow');

INSERT INTO public.listing_screenshots (listing_id, url, position)
SELECT l.id, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop&q=80', 0
FROM public.listings l WHERE l.slug IN ('pulse-grid', 'prompt-smith', 'supaship-native', 'trace-kit', 'docu-morph', 'mail-craft', 'seo-engine', 'omni-chat', 'fin-track-pro');

-- ----------------------------------------------------------------------------
-- 3. Insert Initial Analytics Views and Clicks (If analytics table exists)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'listing_analytics'
  ) THEN
    INSERT INTO public.listing_analytics (listing_id, event_type, session_hash, created_at)
    SELECT l.id, 'view', 'hash-' || l.id || '-view-' || generate_series, now() - (generate_series || ' minutes')::interval
    FROM public.listings l, generate_series(1, 15)
    WHERE l.slug IN ('cortex-ai', 'vector-flow', 'prism-studio', 'supaship', 'tech-hr')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.listing_analytics (listing_id, event_type, session_hash, created_at)
    SELECT l.id, 'website_click', 'hash-' || l.id || '-click-' || generate_series, now() - (generate_series || ' hours')::interval
    FROM public.listings l, generate_series(1, 6)
    WHERE l.slug IN ('cortex-ai', 'vector-flow', 'prism-studio', 'supaship', 'tech-hr')
    ON CONFLICT DO NOTHING;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Analytics seeding notice: %', SQLERRM;
END $$;

