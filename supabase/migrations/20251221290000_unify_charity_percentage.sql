-- Unify all charity percentage content to single source of truth: global.charity.percentage
-- This migration:
-- 1. Ensures global.charity.percentage exists with correct value
-- 2. Removes duplicate/redundant charity percentage keys
-- 3. Updates any text content that had percentage hardcoded

-- Set the canonical charity percentage (keeping whatever value is currently set)
-- If it doesn't exist, create it with 67%
INSERT INTO site_content (content_key, content, category, content_type, description, sort_order)
VALUES ('global.charity.percentage', '67%', 'global', 'text', 'Charity percentage (used site-wide)', 1)
ON CONFLICT (content_key) DO NOTHING;

-- Remove duplicate percentage keys - we only need global.charity.percentage
DELETE FROM site_content WHERE content_key IN (
  'cart.charity.percentage',
  'footer.charity.percentage'
);

-- Update global.charity.full to not include hardcoded percentage
-- It should just be the message template, components will insert the percentage
UPDATE site_content
SET content = 'of every purchase supports Hawaii youth robotics education'
WHERE content_key = 'global.charity.full';

-- Update global.charity.short if it exists
UPDATE site_content
SET content = 'of every purchase goes to Hawaii STEM education'
WHERE content_key = 'global.charity.short';
