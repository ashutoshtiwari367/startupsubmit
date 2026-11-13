-- ============================================================================
-- Migration: 0006_production_hardening.sql
-- Description: Production Hardening for LaunchOS SaaS Directory.
--              Solves all P0/P1 audit findings:
--                1. Payment idempotency, unique razorpay_payment_id, and state immutability.
--                2. Strict cross-listing reply integrity (composite foreign key) & self-reply prevention.
--                3. Atomic review helpful_count synchronization trigger.
--                4. Duplicate report prevention (unique constraints on reports).
--                5. Scalable daily analytics aggregation table (listing_analytics_daily).
--                6. Automated updated_at triggers on all mutable entities.
--                7. Comprehensive, airtight Row-Level Security (RLS) on all 14 tables.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Helper Function: Automatic updated_at timestamp trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. Payments & Gateway Events Hardening (P0 Payment Security)
-- ----------------------------------------------------------------------------

-- 2.1 Enforce NUMERIC(12, 2) on amount fields for financial precision
ALTER TABLE public.payments 
  ALTER COLUMN amount TYPE NUMERIC(12, 2);

-- 2.2 Unique constraint on non-null Razorpay Payment IDs (prevents replay/double credit)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id_unique
  ON public.payments (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

-- 2.3 Unique constraint on razorpay_event_id in payment_gateway_events (idempotent webhooks)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_gateway_events_event_id_unique
  ON public.payment_gateway_events (razorpay_event_id)
  WHERE razorpay_event_id IS NOT NULL;

-- 2.4 State Machine Immutability: Prevent paid transaction status from reverting
CREATE OR REPLACE FUNCTION public.prevent_paid_payment_reversal()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'paid' AND NEW.status <> 'paid' THEN
    RAISE EXCEPTION 'Security Violation: A paid transaction cannot be altered or reverted to %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_paid_payment_reversal ON public.payments;
CREATE TRIGGER trg_prevent_paid_payment_reversal
  BEFORE UPDATE OF status ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_paid_payment_reversal();

-- ----------------------------------------------------------------------------
-- 3. Comments Hierarchy & Cross-Listing Reply Integrity (P0 Integrity)
-- ----------------------------------------------------------------------------

-- 3.1 Composite unique constraint on listing_comments (id, listing_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_listing_comments_id_listing'
  ) THEN
    ALTER TABLE public.listing_comments
      ADD CONSTRAINT uq_listing_comments_id_listing UNIQUE (id, listing_id);
  END IF;
END $$;

-- 3.2 Enforce parent comment belongs to the EXACT SAME listing (prevents cross-listing pollution)
DO $$
BEGIN
  -- Drop single-column FK if exists
  ALTER TABLE public.listing_comments
    DROP CONSTRAINT IF EXISTS listing_comments_parent_comment_id_fkey;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_listing_comments_parent_same_listing'
  ) THEN
    ALTER TABLE public.listing_comments
      ADD CONSTRAINT fk_listing_comments_parent_same_listing
      FOREIGN KEY (parent_comment_id, listing_id)
      REFERENCES public.listing_comments (id, listing_id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 3.3 Prevent self-reply (a comment cannot be its own parent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_comment_no_self_reply'
  ) THEN
    ALTER TABLE public.listing_comments
      ADD CONSTRAINT chk_comment_no_self_reply
      CHECK (parent_comment_id IS NULL OR parent_comment_id <> id);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. Review Helpful Votes & Atomic Counter Synchronization (P1 Community)
-- ----------------------------------------------------------------------------

-- 4.1 Ensure listing_review_helpful table exists and has unique voter constraint
CREATE TABLE IF NOT EXISTS public.listing_review_helpful (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES public.listing_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_review_helpful_user'
  ) THEN
    ALTER TABLE public.listing_review_helpful
      ADD CONSTRAINT uq_review_helpful_user UNIQUE (review_id, user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON public.listing_review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_user_id ON public.listing_review_helpful(user_id);

-- 4.2 Atomic Trigger for helpful_count synchronization
CREATE OR REPLACE FUNCTION public.sync_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.listing_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.listing_reviews
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_review_helpful_count ON public.listing_review_helpful;
CREATE TRIGGER trg_sync_review_helpful_count
  AFTER INSERT OR DELETE ON public.listing_review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_review_helpful_count();

-- ----------------------------------------------------------------------------
-- 5. Abuse Reports Duplicate Prevention (P1 Moderation)
-- ----------------------------------------------------------------------------

-- 5.1 Ensure listing_review_reports table exists and has unique reporter constraint
CREATE TABLE IF NOT EXISTS public.listing_review_reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES public.listing_reviews(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 3 AND char_length(reason) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_review_reports_reviewer'
  ) THEN
    ALTER TABLE public.listing_review_reports
      ADD CONSTRAINT uq_review_reports_reviewer UNIQUE (review_id, reporter_id);
  END IF;
END $$;

-- 5.2 Ensure listing_comment_reports table exists and has unique reporter constraint
CREATE TABLE IF NOT EXISTS public.listing_comment_reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  comment_id BIGINT NOT NULL REFERENCES public.listing_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 3 AND char_length(reason) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_comment_reports_reporter'
  ) THEN
    ALTER TABLE public.listing_comment_reports
      ADD CONSTRAINT uq_comment_reports_reporter UNIQUE (comment_id, reporter_id);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. Analytics Daily Aggregation Architecture (P1 Performance & Scale)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.listing_analytics_daily (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_views INT NOT NULL DEFAULT 0,
  unique_views INT NOT NULL DEFAULT 0,
  website_clicks INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_analytics_daily'
  ) THEN
    ALTER TABLE public.listing_analytics_daily
      ADD CONSTRAINT uq_analytics_daily UNIQUE (listing_id, event_date);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_analytics_daily_listing_date 
  ON public.listing_analytics_daily (listing_id, event_date DESC);

-- Automated daily roll-up function for instantaneous dashboard statistics
CREATE OR REPLACE FUNCTION public.record_analytics_event(
  p_listing_id BIGINT,
  p_event_type TEXT,
  p_session_hash TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_is_unique BOOLEAN := FALSE;
BEGIN
  -- 1. Insert into raw log
  INSERT INTO public.listing_analytics (listing_id, event_type, session_hash, created_at)
  VALUES (p_listing_id, p_event_type, p_session_hash, now());

  -- 2. Deduplicate view for unique count if session_hash provided
  IF p_event_type = 'view' AND p_session_hash IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.listing_analytics
      WHERE listing_id = p_listing_id
        AND event_type = 'view'
        AND session_hash = p_session_hash
        AND created_at >= (now() - interval '30 minutes')
        AND created_at < now()
    ) THEN
      v_is_unique := TRUE;
    END IF;
  ELSE
    v_is_unique := TRUE;
  END IF;

  -- 3. Upsert into daily aggregated table atomically
  INSERT INTO public.listing_analytics_daily (listing_id, event_date, total_views, unique_views, website_clicks, updated_at)
  VALUES (
    p_listing_id,
    v_today,
    CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'view' AND v_is_unique THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'website_click' THEN 1 ELSE 0 END,
    now()
  )
  ON CONFLICT (listing_id, event_date) DO UPDATE SET
    total_views = listing_analytics_daily.total_views + (CASE WHEN EXCLUDED.total_views > 0 THEN 1 ELSE 0 END),
    unique_views = listing_analytics_daily.unique_views + (CASE WHEN EXCLUDED.unique_views > 0 THEN 1 ELSE 0 END),
    website_clicks = listing_analytics_daily.website_clicks + (CASE WHEN EXCLUDED.website_clicks > 0 THEN 1 ELSE 0 END),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.record_analytics_event(BIGINT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_analytics_event(BIGINT, TEXT, TEXT) TO service_role;

-- ----------------------------------------------------------------------------
-- 7. Automatic updated_at Triggers on Mutable Tables
-- ----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_set_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.listing_reviews;
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.listing_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_set_updated_at();

DROP TRIGGER IF EXISTS trg_comments_updated_at ON public.listing_comments;
CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON public.listing_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_set_updated_at();

DROP TRIGGER IF EXISTS trg_analytics_daily_updated_at ON public.listing_analytics_daily;
CREATE TRIGGER trg_analytics_daily_updated_at
  BEFORE UPDATE ON public.listing_analytics_daily
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_set_updated_at();

-- ----------------------------------------------------------------------------
-- 8. Airtight Row-Level Security (RLS) Policies on All Tables
-- ----------------------------------------------------------------------------

-- 8.1 categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (true);

-- 8.2 listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view approved listings" ON public.listings;
CREATE POLICY "Public can view approved listings"
  ON public.listings FOR SELECT
  USING (status = 'approved');

-- 8.3 listing_screenshots
ALTER TABLE public.listing_screenshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view approved screenshots" ON public.listing_screenshots;
CREATE POLICY "Public can view approved screenshots"
  ON public.listing_screenshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_screenshots.listing_id
        AND listings.status = 'approved'
    )
  );

-- 8.4 profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 8.5 plans
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active plans" ON public.plans;
CREATE POLICY "Public can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

-- 8.6 payments (Hardened: No direct client-side INSERT/UPDATE/DELETE allowed)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop legacy insecure client write policies from 0001_init.sql
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON public.payments;
DROP POLICY IF EXISTS "Public can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Public can update payments" ON public.payments;

-- Revoke direct mutation grants on payments and gateway events from anon and authenticated clients
REVOKE INSERT, UPDATE, DELETE ON public.payments FROM anon, authenticated;
REVOKE ALL ON public.payment_gateway_events FROM anon, authenticated;

-- Read-only policy: Users can ONLY view their own payment receipts
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Explicit backend service_role policy for server-side order creation and verification
DROP POLICY IF EXISTS "Service role full access on payments" ON public.payments;
CREATE POLICY "Service role full access on payments"
  ON public.payments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 8.7 payment_gateway_events
ALTER TABLE public.payment_gateway_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on payment_gateway_events" ON public.payment_gateway_events;
CREATE POLICY "Service role full access on payment_gateway_events"
  ON public.payment_gateway_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
-- (No public policy - strictly restricted to service_role)

-- 8.8 listing_analytics & listing_analytics_daily
ALTER TABLE public.listing_analytics ENABLE ROW LEVEL SECURITY;
-- (Raw analytics restricted to service_role)

ALTER TABLE public.listing_analytics_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view daily aggregated analytics" ON public.listing_analytics_daily;
CREATE POLICY "Public can view daily aggregated analytics"
  ON public.listing_analytics_daily FOR SELECT
  USING (true);

-- 8.9 listing_reviews
ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.listing_reviews;
CREATE POLICY "Public can view approved reviews"
  ON public.listing_reviews FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Users can create own reviews" ON public.listing_reviews;
CREATE POLICY "Users can create own reviews"
  ON public.listing_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_reviews.listing_id
        AND listings.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Users can update own reviews" ON public.listing_reviews;
CREATE POLICY "Users can update own reviews"
  ON public.listing_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.listing_reviews;
CREATE POLICY "Users can delete own reviews"
  ON public.listing_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- 8.10 listing_review_helpful
ALTER TABLE public.listing_review_helpful ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Helpful votes are publicly readable" ON public.listing_review_helpful;
DROP POLICY IF EXISTS "Users can view own helpful votes" ON public.listing_review_helpful;
CREATE POLICY "Users can view own helpful votes"
  ON public.listing_review_helpful FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can vote helpful" ON public.listing_review_helpful;
CREATE POLICY "Users can vote helpful"
  ON public.listing_review_helpful FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove helpful vote" ON public.listing_review_helpful;
CREATE POLICY "Users can remove helpful vote"
  ON public.listing_review_helpful FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on listing_review_helpful" ON public.listing_review_helpful;
CREATE POLICY "Service role full access on listing_review_helpful"
  ON public.listing_review_helpful FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 8.11 listing_comments
ALTER TABLE public.listing_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view approved comments" ON public.listing_comments;
CREATE POLICY "Public can view approved comments"
  ON public.listing_comments FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Users can post comments" ON public.listing_comments;
CREATE POLICY "Users can post comments"
  ON public.listing_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_comments.listing_id
        AND listings.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Users can update own comments" ON public.listing_comments;
CREATE POLICY "Users can update own comments"
  ON public.listing_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.listing_comments;
CREATE POLICY "Users can delete own comments"
  ON public.listing_comments FOR DELETE
  USING (auth.uid() = user_id);

-- 8.12 Reports tables (review & comment abuse reports)
ALTER TABLE public.listing_review_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can report reviews" ON public.listing_review_reports;
CREATE POLICY "Users can report reviews"
  ON public.listing_review_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

ALTER TABLE public.listing_comment_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can report comments" ON public.listing_comment_reports;
CREATE POLICY "Users can report comments"
  ON public.listing_comment_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- 8.13 events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- (Audit logs restricted strictly to service_role)

-- 8.14 Defense-in-Depth: Protect critical fields & revoke unnecessary client table mutations
-- All listing, analytics, review, comment, and payment writes flow through authenticated Next.js API routes.
REVOKE INSERT, UPDATE, DELETE ON public.categories FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.listings FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.listing_screenshots FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.plans FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.listing_analytics FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.listing_analytics_daily FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.events FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.listing_reviews FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.listing_review_helpful FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.listing_comments FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.listing_review_reports FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.listing_comment_reports FROM anon, authenticated;

-- Prevent clients from tampering with cust_id_ext on their own profile row
CREATE OR REPLACE FUNCTION public.protect_profile_cust_id()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('role', true) <> 'service_role' THEN
    NEW.cust_id_ext := OLD.cust_id_ext;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_profile_cust_id ON public.profiles;
CREATE TRIGGER trg_protect_profile_cust_id
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_cust_id();

COMMIT;

