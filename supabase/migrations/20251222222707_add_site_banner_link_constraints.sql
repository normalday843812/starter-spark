-- Normalize blank link URLs
UPDATE site_banners
SET link_url = NULL
WHERE link_url IS NOT NULL
  AND btrim(link_url) = '';

-- Enforce safe link URL formats (relative or http/https)
ALTER TABLE site_banners
  ADD CONSTRAINT site_banners_link_url_format
  CHECK (
    link_url IS NULL
    OR link_url ~* '^(https?://|/)'
  );
