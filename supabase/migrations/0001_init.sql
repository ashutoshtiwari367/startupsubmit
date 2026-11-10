-- ============================================================================
-- Migration: 0001_init.sql
-- Description: Initial schema with BIGINT GENERATED ALWAYS AS IDENTITY PKs,
--              human-readable reference_code (L-XXXXXX, no 0/O/1/I),
--              slug for public SEO pages, and UUID PK only on customers.
-- ============================================================================

-- Drop any previous table definitions so the schema applies cleanly
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.listing_screenshots CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;

-- ----------------------------------------------------------------------------
-- Helper Function: Generate human-readable reference_code (e.g. 'L-7K2M9Q')
-- Excludes 0, O, 1, I to prevent visual ambiguity
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_listing_reference_code()
RETURNS TEXT AS $$
DECLARE
  alphabet CONSTANT TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  result TEXT := 'L-';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(alphabet, floor(random() * 32 + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ----------------------------------------------------------------------------
-- 1. Table: categories (BIGINT IDENTITY PK)
-- ----------------------------------------------------------------------------
CREATE TABLE public.categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. Table: listings (BIGINT IDENTITY PK + slug + human-readable reference_code)
-- ----------------------------------------------------------------------------
CREATE TABLE public.listings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE DEFAULT public.generate_listing_reference_code()
    CHECK (reference_code ~ '^L-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$'),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description_short TEXT NOT NULL,
  description_long TEXT NOT NULL,
  website_url TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL,
  category_id BIGINT NOT NULL REFERENCES public.categories(id),
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('free', 'freemium', 'paid', 'one_time')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 3. Table: listing_screenshots (BIGINT IDENTITY PK)
-- ----------------------------------------------------------------------------
CREATE TABLE public.listing_screenshots (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. Table: customers (The ONLY table keeping a UUID PK = auth.users.id)
-- ----------------------------------------------------------------------------
CREATE TABLE public.customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_slug ON public.listings(slug);
CREATE INDEX idx_listings_reference_code ON public.listings(reference_code);
CREATE INDEX idx_categories_slug ON public.categories(slug);

-- ----------------------------------------------------------------------------
-- 6. Auto-update updated_at trigger for listings
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_listings_updated_at();

-- ----------------------------------------------------------------------------
-- 7. Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON public.categories
  FOR SELECT
  USING (true);

CREATE POLICY "Only approved listings are publicly readable"
  ON public.listings
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Screenshots of approved listings are publicly readable"
  ON public.listing_screenshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_screenshots.listing_id
        AND l.status = 'approved'
    )
  );

-- ----------------------------------------------------------------------------
-- 8. Seed Default Categories (Idempotent)
-- ----------------------------------------------------------------------------
INSERT INTO public.categories (slug, name, description)
VALUES
  ('ai', 'AI', 'Artificial intelligence, LLM agents, and machine learning tools'),
  ('productivity', 'Productivity', 'Workflow automation, workspace, and time-saving apps'),
  ('marketing', 'Marketing', 'SEO, growth, content creation, and sales enablement tools'),
  ('developer-tools', 'Developer Tools', 'APIs, SDKs, cloud infrastructure, and coding utilities'),
  ('design-ux', 'Design & UX', 'UI kits, prototyping, graphics, and creative suites'),
  ('saas-tools', 'SaaS & Tools', 'B2B software and business operations platforms'),
  ('analytics-data', 'Analytics & Data', 'Business intelligence, metrics, and data pipelines'),
  ('finance-fintech', 'Finance & FinTech', 'Billing, accounting, payments, and financial tools'),
  ('video-content', 'Video & Content', 'Video editing, audio generation, and creator tools'),
  ('e-commerce', 'E-commerce', 'Online store builders, conversion, and retail tools')
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. System Events Table (BIGINT IDENTITY PK)
-- ----------------------------------------------------------------------------
CREATE TABLE public.events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_name TEXT NOT NULL,
  listing_id BIGINT REFERENCES public.listings(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
