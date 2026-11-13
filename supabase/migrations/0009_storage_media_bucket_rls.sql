-- ==============================================================================
-- Migration: 0009_storage_media_bucket_rls.sql
-- Description: Configure 'listings-media' storage bucket and enterprise-grade
--              Row Level Security (RLS) policies on storage.objects.
-- Security:
--   1. Ensures bucket 'listings-media' exists, is public-readable, has strict 5MB limit.
--   2. Enforces allowed raster image MIME types (PNG, JPEG, WebP, GIF).
--   3. Explicitly disallows executable / dangerous MIME types (NO SVG to prevent Stored XSS).
--   4. Grants public SELECT access for public viewing of approved tool media.
--   5. Grants strict INSERT access scoped ONLY to bucket 'listings-media' and folders 'logos/' / 'screenshots/'.
--   6. Revokes public UPDATE and DELETE to prevent asset tampering or asset deletion (IDOR).
--   7. Grants full administrative access to service_role.
-- ==============================================================================

-- 1. Ensure the 'listings-media' bucket exists with strict size and MIME constraints
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings-media',
  'listings-media',
  true,
  5242880, -- 5 MB limit per object
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

-- 2. Drop any legacy/conflicting policies on storage.objects for listings-media
DROP POLICY IF EXISTS "Public media files are readable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Allow validated uploads to listings-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access on storage.objects" ON storage.objects;
DROP POLICY IF EXISTS "Disallow public updates on listings-media" ON storage.objects;
DROP POLICY IF EXISTS "Disallow public deletes on listings-media" ON storage.objects;

-- 3. Policy: Public Read Access (SELECT)
-- Anyone can view tool logos and screenshots in listings-media
CREATE POLICY "Public media files are readable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings-media');

-- 4. Policy: Scoped Insert Access (INSERT)
-- Restricts uploads strictly to:
-- - Bucket 'listings-media' only
-- - Folder paths 'logos/%' or 'screenshots/%' only
CREATE POLICY "Allow validated uploads to listings-media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listings-media'
  AND (
    name LIKE 'logos/%'
    OR name LIKE 'screenshots/%'
  )
);

-- 5. Policy: Full Administrative Access for service_role
CREATE POLICY "Allow service role full access on storage.objects"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

