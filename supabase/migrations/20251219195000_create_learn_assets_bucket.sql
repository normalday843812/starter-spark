-- Phase 21.6: Learning content assets (private storage)
-- Bucket: learn-assets (private; served via signed URLs)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'learn-assets',
  'learn-assets',
  false,
  104857600, -- 100MB
  ARRAY[
    -- Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    -- Videos
    'video/mp4',
    'video/webm',
    'video/quicktime',
    -- Documents / downloads
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/zip',
    'application/octet-stream',
    'model/stl'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS policies for learn-assets bucket.
-- Uploads are server-side only (service role). Access is via signed URLs.

DROP POLICY IF EXISTS "Service role can insert learn assets" ON storage.objects;
DROP POLICY IF EXISTS "Service role can read learn assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read learn assets" ON storage.objects;

CREATE POLICY "Service role can insert learn assets"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'learn-assets');

CREATE POLICY "Service role can read learn assets"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'learn-assets');

CREATE POLICY "Admins can read learn assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'learn-assets'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
  )
);

