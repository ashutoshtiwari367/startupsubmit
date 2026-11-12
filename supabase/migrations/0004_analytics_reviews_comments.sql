-- ============================================================================
-- Migration: 0004_analytics_reviews_comments.sql
-- Description: Schema for Dashboard Analytics, Listing Views & Outbound Clicks,
--              Product Reviews & Helpful voting, Threaded Comments & Replies,
--              and Abuse Reports with complete Row-Level Security (RLS).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: listing_analytics (Event Tracking with Session Hash Deduplication)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listing_analytics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'website_click')),
  session_hash TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient aggregation and deduplication lookups
CREATE INDEX IF NOT EXISTS idx_listing_analytics_listing_id ON public.listing_analytics(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_analytics_event_type ON public.listing_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_listing_analytics_created_at ON public.listing_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_listing_analytics_dedup ON public.listing_analytics(listing_id, event_type, session_hash, created_at);

-- RLS: Raw event logs are restricted to server-side operations
ALTER TABLE public.listing_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on listing_analytics"
  ON public.listing_analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 2. Table: listing_reviews (Product Ratings & Written Reviews)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listing_reviews (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL CHECK (char_length(review_text) >= 1 AND char_length(review_text) <= 3000),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_listing_reviews_user UNIQUE (listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_reviews_listing_id ON public.listing_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reviews_user_id ON public.listing_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_reviews_status ON public.listing_reviews(status);
CREATE INDEX IF NOT EXISTS idx_listing_reviews_created_at ON public.listing_reviews(created_at);

-- Auto-update updated_at trigger for reviews
CREATE OR REPLACE FUNCTION public.set_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.listing_reviews;
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.listing_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_reviews_updated_at();

ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews are publicly readable"
  ON public.listing_reviews
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can read own reviews"
  ON public.listing_reviews
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own review"
  ON public.listing_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own review"
  ON public.listing_reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own review"
  ON public.listing_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on listing_reviews"
  ON public.listing_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 3. Table: listing_review_helpful (Unique helpful votes per user)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listing_review_helpful (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES public.listing_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_review_helpful_user UNIQUE (review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON public.listing_review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_user_id ON public.listing_review_helpful(user_id);

ALTER TABLE public.listing_review_helpful ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Helpful votes are publicly readable"
  ON public.listing_review_helpful
  FOR SELECT
  USING (true);

CREATE POLICY "Users can vote helpful"
  ON public.listing_review_helpful
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove helpful vote"
  ON public.listing_review_helpful
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on listing_review_helpful"
  ON public.listing_review_helpful
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 4. Table: listing_comments (Threaded Discussions & Replies)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listing_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id BIGINT NULL REFERENCES public.listing_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL CHECK (char_length(comment_text) >= 1 AND char_length(comment_text) <= 2000),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'hidden', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_comments_listing_id ON public.listing_comments(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_comments_parent_id ON public.listing_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_listing_comments_user_id ON public.listing_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_comments_status ON public.listing_comments(status);
CREATE INDEX IF NOT EXISTS idx_listing_comments_created_at ON public.listing_comments(created_at);

-- Auto-update updated_at trigger for comments
CREATE OR REPLACE FUNCTION public.set_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comments_updated_at ON public.listing_comments;
CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON public.listing_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_comments_updated_at();

ALTER TABLE public.listing_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved comments are publicly readable"
  ON public.listing_comments
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can read own comments"
  ON public.listing_comments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own comment"
  ON public.listing_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comment"
  ON public.listing_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment"
  ON public.listing_comments
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on listing_comments"
  ON public.listing_comments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 5. Table: listing_review_reports (Abuse / Flagged Reviews)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listing_review_reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES public.listing_reviews(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 3 AND char_length(reason) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_review_report_user UNIQUE (review_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON public.listing_review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_reporter_id ON public.listing_review_reports(reporter_id);

ALTER TABLE public.listing_review_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit review report"
  ON public.listing_review_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own review reports"
  ON public.listing_review_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Service role full access on listing_review_reports"
  ON public.listing_review_reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 6. Table: listing_comment_reports (Abuse / Flagged Comments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listing_comment_reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  comment_id BIGINT NOT NULL REFERENCES public.listing_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 3 AND char_length(reason) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_comment_report_user UNIQUE (comment_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON public.listing_comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_reporter_id ON public.listing_comment_reports(reporter_id);

ALTER TABLE public.listing_comment_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit comment report"
  ON public.listing_comment_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own comment reports"
  ON public.listing_comment_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Service role full access on listing_comment_reports"
  ON public.listing_comment_reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

