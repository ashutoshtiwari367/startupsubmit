-- ============================================================================
-- Migration: 0008_category_suggestions.sql
-- Description:
--   1. Adds parent_id to public.categories for hierarchy (Option B: subcategories).
--   2. Ensures fallback 'other' category exists in public.categories.
--   3. Creates public.category_suggestions table for admin review workflow.
--   4. Creates public.category_audit_logs table for category change auditing.
--   5. Applies Row Level Security (RLS) & revocations for full defense-in-depth.
-- ============================================================================

-- 1. Hierarchy support on public.categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- 2. Fallback 'other' category container
INSERT INTO public.categories (slug, name, description)
VALUES ('other', 'Other', 'Community suggested and uncategorized listings pending admin classification')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 3. Category Suggestions Table
CREATE TABLE IF NOT EXISTS public.category_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggested_name TEXT NOT NULL,
  suggested_slug TEXT NOT NULL,
  suggested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  listing_id BIGINT REFERENCES public.listings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolved_category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
  action_type TEXT CHECK (action_type IS NULL OR action_type IN ('create_new', 'add_to_existing', 'rename_existing', 'reject')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_category_suggestions_status
  ON public.category_suggestions(status);

CREATE INDEX IF NOT EXISTS idx_category_suggestions_suggested_slug
  ON public.category_suggestions(suggested_slug);

CREATE INDEX IF NOT EXISTS idx_category_suggestions_created_at
  ON public.category_suggestions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_category_suggestions_listing_id
  ON public.category_suggestions(listing_id);

-- 4. Category Change Audit Logs Table
CREATE TABLE IF NOT EXISTS public.category_audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
  suggestion_id UUID REFERENCES public.category_suggestions(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('create_new', 'add_to_existing', 'rename_existing', 'reject', 'created', 'updated', 'deleted')),
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_category_audit_logs_category_id
  ON public.category_audit_logs(category_id);

CREATE INDEX IF NOT EXISTS idx_category_audit_logs_created_at
  ON public.category_audit_logs(created_at DESC);

-- 5. Row Level Security & Privileges
ALTER TABLE public.category_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_audit_logs ENABLE ROW LEVEL SECURITY;

-- Revoke dangerous direct mutations from client roles
REVOKE INSERT, UPDATE, DELETE ON public.category_suggestions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.category_audit_logs FROM PUBLIC, anon, authenticated;

-- Grant service role full operational control
GRANT ALL ON public.category_suggestions TO service_role;
GRANT ALL ON public.category_audit_logs TO service_role;

-- Authenticated users can view their own submitted suggestions
GRANT SELECT ON public.category_suggestions TO authenticated;

DROP POLICY IF EXISTS "Users can read own category suggestions" ON public.category_suggestions;
CREATE POLICY "Users can read own category suggestions"
  ON public.category_suggestions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = suggested_by);

