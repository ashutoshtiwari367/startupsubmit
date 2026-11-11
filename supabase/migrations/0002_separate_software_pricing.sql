-- ============================================================================
-- Migration: 0002_separate_software_pricing.sql
-- Description: Separate Software Pricing (business model of submitted tool)
--              from Directory Listing Plans (platform monetization tiers).
-- ============================================================================

-- 1. Add Software Pricing and Listing Plan fields to public.listings
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS starting_price NUMERIC NULL,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS billing_period TEXT NULL,
  ADD COLUMN IF NOT EXISTS listing_plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS listing_plan_price NUMERIC NOT NULL DEFAULT 0;

-- 2. Add validation check constraints if not already present
DO $$
BEGIN
  -- Allow 'free', 'freemium', 'premium', 'paid', 'one_time' in pricing_model
  ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_pricing_model_check;
  ALTER TABLE public.listings ADD CONSTRAINT listings_pricing_model_check
    CHECK (pricing_model IN ('free', 'freemium', 'premium', 'paid', 'one_time'));

  -- Validate billing_period (monthly, yearly, one_time, or null for free software)
  ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_billing_period_check;
  ALTER TABLE public.listings ADD CONSTRAINT listings_billing_period_check
    CHECK (billing_period IS NULL OR billing_period IN ('monthly', 'yearly', 'one_time'));

  -- Validate listing_plan ('free', 'premium', 'featured')
  ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_listing_plan_check;
  ALTER TABLE public.listings ADD CONSTRAINT listings_listing_plan_check
    CHECK (listing_plan IN ('free', 'premium', 'featured', 'paid', 'one_time'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Constraint update notice: %', SQLERRM;
END $$;

-- 3. Upsert Directory Listing Plans in public.plans table
DO $$
BEGIN
  -- Drop check constraint on plans(id) if needed to allow 'premium' and 'featured'
  ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_id_check;
  ALTER TABLE public.plans ADD CONSTRAINT plans_id_check
    CHECK (id IN ('free', 'premium', 'featured', 'freemium', 'paid', 'one_time'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Plans constraint notice: %', SQLERRM;
END $$;

INSERT INTO public.plans (id, name, description, price, price_minor, currency, is_active)
VALUES
  ('free', 'Free Listing', 'Standard directory listing with community launch visibility.', 0, 0, 'USD', true),
  ('premium', 'Premium Listing', 'Fast-track 24h editorial review, Verified Maker badge, and permanent dofollow backlink.', 29, 2900, 'USD', true),
  ('featured', 'Featured Listing', 'Homepage spotlight for 7 days, category priority ranking, and newsletter inclusion.', 49, 4900, 'USD', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  price_minor = EXCLUDED.price_minor,
  currency = EXCLUDED.currency,
  is_active = EXCLUDED.is_active;

-- 4. Create index for listing_plan filtering in directory/admin
CREATE INDEX IF NOT EXISTS idx_listings_listing_plan ON public.listings(listing_plan);

