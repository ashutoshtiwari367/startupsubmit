-- ============================================================================
-- Migration: 0007_featured_placement_window.sql
-- Description:
--   1. Adds featured_until TIMESTAMPTZ to public.listings for explicit 7-day
--      homepage header placement tracking.
--   2. Automatically sets featured_until = COALESCE(approved_at, NOW()) + 7 days
--      whenever a 'featured' listing is approved, and clears it on reject/free.
--   3. Adds composite homepage sorting index so newly approved listings always
--      appear first (#1) within their tier.
-- ============================================================================

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ NULL;

-- Backfill existing approved featured listings with their 7-day window
UPDATE public.listings
SET featured_until = COALESCE(approved_at, created_at) + INTERVAL '7 days'
WHERE listing_plan IN ('featured', 'one_time')
  AND status = 'approved'
  AND featured_until IS NULL;

-- Trigger: auto-compute 7-day featured_until when listing transitions to approved
CREATE OR REPLACE FUNCTION public.sync_featured_until_window()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.listing_plan IN ('featured', 'one_time') THEN
    IF NEW.featured_until IS NULL
       OR OLD.status IS DISTINCT FROM NEW.status
       OR OLD.listing_plan IS DISTINCT FROM NEW.listing_plan THEN
      NEW.featured_until := COALESCE(NEW.approved_at, NOW()) + INTERVAL '7 days';
    END IF;
  ELSIF NEW.status <> 'approved' OR NEW.listing_plan NOT IN ('featured', 'one_time') THEN
    NEW.featured_until := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listings_sync_featured_until ON public.listings;
CREATE TRIGGER trg_listings_sync_featured_until
  BEFORE INSERT OR UPDATE OF status, listing_plan, approved_at
  ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_featured_until_window();

-- Composite index matching homepage & category ordering:
-- active/approved listings ordered newest-approved first
CREATE INDEX IF NOT EXISTS idx_listings_homepage_ranking
  ON public.listings (status, listing_plan, approved_at DESC NULLS LAST, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listings_featured_until
  ON public.listings (featured_until DESC)
  WHERE status = 'approved' AND listing_plan = 'featured';

