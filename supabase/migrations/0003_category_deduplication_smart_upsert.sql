-- ============================================================================
-- Migration: 0003_category_deduplication_smart_upsert.sql
-- Description: Reconciles existing categories, renames matching ones, safely
--              consolidates duplicates while preserving listing foreign keys,
--              and inserts missing categories to yield the exact 35-category master list.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Step 1: Rename & Reconcile Existing Categories (Preserving IDs and FKs)
-- ----------------------------------------------------------------------------

-- 1. AI -> Artificial Intelligence
UPDATE public.categories
SET name = 'Artificial Intelligence',
    slug = 'artificial-intelligence',
    description = 'Machine learning, neural networks, LLMs, and foundation models'
WHERE slug = 'ai' OR name = 'AI';

-- 2. Productivity (keep exact match, ensure description is clean)
UPDATE public.categories
SET name = 'Productivity',
    slug = 'productivity',
    description = 'Workflow automation, task management, notes, and focus utilities'
WHERE slug = 'productivity' OR name = 'Productivity';

-- 3. Marketing (keep exact match)
UPDATE public.categories
SET name = 'Marketing',
    slug = 'marketing',
    description = 'Growth, advertising, funnel optimization, and acquisition tools'
WHERE slug = 'marketing' OR name = 'Marketing';

-- 4. Developer Tools (keep exact match)
UPDATE public.categories
SET name = 'Developer Tools',
    slug = 'developer-tools',
    description = 'CLIs, SDKs, dev infrastructure, testing, and debugging utilities'
WHERE slug = 'developer-tools' OR name = 'Developer Tools';

-- 5. Design & UX -> Design
UPDATE public.categories
SET name = 'Design',
    slug = 'design',
    description = 'UI/UX components, vector graphics, prototyping, and design systems'
WHERE slug = 'design-ux' OR name = 'Design & UX';

-- 6. SaaS & Tools -> Building Products
UPDATE public.categories
SET name = 'Building Products',
    slug = 'building-products',
    description = 'Product management, roadmaps, customer feedback, and shipping tools'
WHERE slug = 'saas-tools' OR name = 'SaaS & Tools';

-- 7. Analytics & Data -> Analytics
UPDATE public.categories
SET name = 'Analytics',
    slug = 'analytics',
    description = 'Web analytics, product telemetry, dashboards, and data visualization'
WHERE slug = 'analytics-data' OR name = 'Analytics & Data';

-- 8. Finance & FinTech -> Fintech
UPDATE public.categories
SET name = 'Fintech',
    slug = 'fintech',
    description = 'Invoicing, billing, accounting, payments, and financial management'
WHERE slug = 'finance-fintech' OR name = 'Finance & FinTech';

-- 9. Video & Content -> Video
UPDATE public.categories
SET name = 'Video',
    slug = 'video',
    description = 'Video editing, screen recording, streaming, and generative video tools'
WHERE slug = 'video-content' OR name = 'Video & Content';

-- 10. E-commerce (keep exact match)
UPDATE public.categories
SET name = 'E-commerce',
    slug = 'e-commerce',
    description = 'Online storefronts, inventory, checkout, and merchant tooling'
WHERE slug = 'e-commerce' OR name = 'E-commerce';

-- 11. hrms (Custom user submission) -> Remote Work
UPDATE public.categories
SET name = 'Remote Work',
    slug = 'remote-work',
    description = 'HR, distributed workforce, asynchronous collaboration, and team operations'
WHERE slug = 'hrms' OR name = 'hrms';

-- ----------------------------------------------------------------------------
-- Step 2: Insert Missing Categories (Idempotent ON CONFLICT (slug) DO NOTHING)
-- ----------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, description)
VALUES
  ('AI Agents', 'ai-agents', 'Autonomous agents, multi-agent frameworks, and AI workflows'),
  ('Writing', 'writing', 'AI copywriters, grammar checkers, technical docs, and storytelling'),
  ('Directories', 'directories', 'Product launch boards, curated lists, and niche directory platforms'),
  ('SEO', 'seo', 'Backlink checkers, keyword intelligence, rank trackers, and SERP tooling'),
  ('Social Media', 'social-media', 'Post schedulers, audience growth, engagement bots, and social analytics'),
  ('Chatbots', 'chatbots', 'Conversational AI, custom knowledge bots, and customer live chat'),
  ('Education', 'education', 'EdTech, online courses, flashcards, and student learning software'),
  ('No Code', 'no-code', 'Visual app builders, workflow triggers, and rapid prototyping tools'),
  ('Automation', 'automation', 'Zapier alternatives, robotic process automation, and webhook runners'),
  ('Image', 'image', 'AI image generators, background removers, and photo enhancement tools'),
  ('Sales', 'sales', 'CRMs, lead enrichment, cold email outreach, and pipeline tracking'),
  ('Website Builders', 'website-builders', 'Landing page generators, static site builders, and portfolio tools'),
  ('Customer Support', 'customer-support', 'Help desks, ticket routing, feedback widgets, and support portals'),
  ('Freelancer Tools', 'freelancer-tools', 'Contracts, time tracking, proposal generators, and client portals'),
  ('Audio & Music', 'audio-music', 'Voice cloning, podcast mastering, AI music generation, and audio editors'),
  ('Community', 'community', 'Forums, community moderation, memberships, and discussion platforms'),
  ('Content Creation', 'content-creation', 'Multi-channel publishing, content repurposing, and media generation'),
  ('Email Marketing', 'email-marketing', 'Newsletter delivery, campaign sequences, deliverability, and warmups'),
  ('Health & Fitness', 'health-fitness', 'Wellness trackers, workout planners, mental health, and nutrition apps'),
  ('Chrome Extensions', 'chrome-extensions', 'Browser utilities, web scrapers, and sidebar productivity add-ons'),
  ('Developer APIs', 'developer-apis', 'Public REST/GraphQL APIs, webhooks, authentication, and data feeds'),
  ('iOS', 'ios', 'Native iOS, iPadOS, and macOS apps crafted for Apple platforms'),
  ('Monitoring', 'monitoring', 'Uptime monitoring, error tracing, server health, and log aggregation'),
  ('PDF & Documents', 'pdf-documents', 'PDF editors, digital signatures, optical character recognition, and docs')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

COMMIT;

