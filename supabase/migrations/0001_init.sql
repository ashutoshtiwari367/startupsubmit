-- ============================================================================
-- Migration: 0001_init.sql
-- Description: Complete schema for categories, listings (ID starting at 50000000),
--              listing_screenshots, profiles (1:1 with auth.users + cust_id_ext
--              starting at 50000000 + auto-trigger), and events.
-- ============================================================================

-- Drop any previous table definitions so the schema applies cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.generate_listing_reference_code() CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.listing_screenshots CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

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
-- 2. Table: listings (Simple numeric ID starting from 50000000)
-- ----------------------------------------------------------------------------
CREATE TABLE public.listings (
  id BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 50000000 INCREMENT BY 1) PRIMARY KEY,
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
-- 4. Table: profiles (Linked 1:1 with auth.users + cust_id_ext starting at 50000000)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cust_id_ext BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 50000000 INCREMENT BY 1) UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: User can only view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: User can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Trigger Function: Auto-create profile row (with cust_id_ext >= 50000000) on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.profiles.avatar_url),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

-- Bind trigger with auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 5. Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_slug ON public.listings(slug);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_profiles_cust_id_ext ON public.profiles(cust_id_ext);

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
-- 7. Row Level Security (RLS) on Directory Tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_screenshots ENABLE ROW LEVEL SECURITY;

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

-- ----------------------------------------------------------------------------
-- 10. Launch Plans Catalog Table ('free', 'freemium', 'paid', 'one_time')
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.payment_gateway_events CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;

CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY CHECK (id IN ('free', 'freemium', 'paid', 'one_time')),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  price_minor INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.plans (id, name, description, price, price_minor, currency, is_active)
VALUES
  ('free', 'Free Launch', 'For bootstrapped indie makers testing early product-market traction.', 0, 0, 'INR', true),
  ('freemium', 'Freemium Launch', 'Fast-track editorial review and verified badge for freemium tools.', 59, 5900, 'INR', true),
  ('paid', 'Paid Pro Launch', 'Guaranteed launch within 24h and permanent DR 72+ dofollow backlink.', 149, 14900, 'INR', true),
  ('one_time', 'One-Time Spotlight', '7-day pinned homepage sponsor placement and priority 1-hour approval.', 299, 29900, 'INR', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  price_minor = EXCLUDED.price_minor,
  currency = EXCLUDED.currency,
  is_active = EXCLUDED.is_active;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON public.plans
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role full access on plans"
  ON public.plans
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 11. Payments / Orders Tracking Table (BIGINT PK starting at 50000000)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 50000000 INCREMENT BY 1) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id TEXT REFERENCES public.plans(id) ON DELETE SET NULL,
  listing_id BIGINT REFERENCES public.listings(id) ON DELETE SET NULL,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  status TEXT DEFAULT 'created' NOT NULL CHECK (status IN ('created', 'paid', 'failed')),
  payer_email TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON public.payments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on payments"
  ON public.payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 12. Immutable Payment Gateway Events Table (Append-Only Audit Log)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_gateway_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  razorpay_event_id TEXT NULL,
  event_type TEXT NOT NULL,
  razorpay_order_id TEXT NULL,
  razorpay_payment_id TEXT NULL,
  payment_id BIGINT NULL,
  signature_valid BOOLEAN NOT NULL,
  payload JSONB NOT NULL,
  processing_result TEXT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_events_pkey PRIMARY KEY (id),
  CONSTRAINT payment_events_razorpay_event_id_key UNIQUE (razorpay_event_id),
  CONSTRAINT payment_events_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id)
) TABLESPACE pg_default;

ALTER TABLE public.payment_gateway_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on payment_gateway_events"
  ON public.payment_gateway_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_payment_gateway_events_payment
  ON public.payment_gateway_events USING btree (razorpay_payment_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_payment_gateway_events_order
  ON public.payment_gateway_events USING btree (razorpay_order_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_payment_events_payment
  ON public.payment_gateway_events USING btree (razorpay_payment_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_payment_events_order
  ON public.payment_gateway_events USING btree (razorpay_order_id) TABLESPACE pg_default;

CREATE OR REPLACE FUNCTION public.payment_gateway_events_append_only()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'payment_gateway_events table is append-only; UPDATE and DELETE are not allowed';
END;
$$;

DROP TRIGGER IF EXISTS trg_payment_gateway_events_append_only ON public.payment_gateway_events;

CREATE TRIGGER trg_payment_gateway_events_append_only
  BEFORE DELETE OR UPDATE ON public.payment_gateway_events
  FOR EACH ROW
  EXECUTE FUNCTION public.payment_gateway_events_append_only();

ALTER TABLE public.payment_gateway_events ENABLE ROW LEVEL SECURITY;
