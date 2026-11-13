-- Migration: 0010_upvotes_ranking_system.sql
-- Description: Community Upvote System, 1 vote per authenticated user, atomic toggle & real-time ranking

-- 1. Create public.listing_upvotes table
CREATE TABLE IF NOT EXISTS public.listing_upvotes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_listing_upvote_user UNIQUE (listing_id, user_id)
);

-- 2. Add upvotes_count column to public.listings if not exists
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS upvotes_count INT NOT NULL DEFAULT 0;

-- 3. Create high-performance indexes
CREATE INDEX IF NOT EXISTS idx_listing_upvotes_listing_id ON public.listing_upvotes(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_upvotes_user_id ON public.listing_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_upvotes_count ON public.listings(upvotes_count DESC);

-- 4. Atomic Counter Trigger Function
CREATE OR REPLACE FUNCTION public.handle_listing_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.listings
    SET upvotes_count = COALESCE(upvotes_count, 0) + 1
    WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.listings
    SET upvotes_count = GREATEST(0, COALESCE(upvotes_count, 0) - 1)
    WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger
DROP TRIGGER IF EXISTS trg_listing_upvotes_count ON public.listing_upvotes;
CREATE TRIGGER trg_listing_upvotes_count
AFTER INSERT OR DELETE ON public.listing_upvotes
FOR EACH ROW
EXECUTE FUNCTION public.handle_listing_upvote_count();

-- 5. Row Level Security (RLS)
ALTER TABLE public.listing_upvotes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can read upvotes to view vote counts
DROP POLICY IF EXISTS "Public read listing_upvotes" ON public.listing_upvotes;
CREATE POLICY "Public read listing_upvotes"
ON public.listing_upvotes
FOR SELECT
USING (true);

-- Policy 2: Authenticated users can insert an upvote strictly under their own user ID
DROP POLICY IF EXISTS "Authenticated users can insert upvote" ON public.listing_upvotes;
CREATE POLICY "Authenticated users can insert upvote"
ON public.listing_upvotes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Authenticated users can delete (toggle off) their own upvote only
DROP POLICY IF EXISTS "Authenticated users can delete own upvote" ON public.listing_upvotes;
CREATE POLICY "Authenticated users can delete own upvote"
ON public.listing_upvotes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

