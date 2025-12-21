-- Unify charity content into global keys
-- This removes redundant charity percentage/text entries across footer and cart

-- Create unified global charity content
INSERT INTO site_content (content_key, content_type, content, default_value, description, category, sort_order) VALUES
('global.charity.percentage', 'text', '70%', '70%', 'Charity percentage (used site-wide)', 'global', 1),
('global.charity.short', 'text', 'of every purchase goes to Hawaii STEM education', 'of every purchase goes to Hawaii STEM education', 'Short charity text for banners', 'global', 2),
('global.charity.full', 'text', '70% of every purchase supports Hawaii youth robotics education', '70% of every purchase supports Hawaii youth robotics education', 'Full charity message for certificates etc', 'global', 3)
ON CONFLICT (content_key) DO UPDATE SET
  content = EXCLUDED.content,
  default_value = EXCLUDED.default_value,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order;

-- Clean up redundant entries (mark as deprecated by updating description)
-- Keep the data but update category so they can be cleaned up later
UPDATE site_content SET
  description = 'DEPRECATED: Use global.charity.percentage instead',
  category = 'deprecated'
WHERE content_key IN ('footer.charity.percentage', 'cart.charity.percentage');

UPDATE site_content SET
  description = 'DEPRECATED: Use global.charity.short instead',
  category = 'deprecated'
WHERE content_key = 'footer.charity.text';

UPDATE site_content SET
  description = 'DEPRECATED: Use global.charity.full instead',
  category = 'deprecated'
WHERE content_key = 'cart.charity.notice';

-- Clean up page content that has placeholder-like values
-- Update with sensible defaults

-- Clear empty/placeholder values in homepage content if they exist
UPDATE site_content SET
  content = 'StarterSpark Robotics',
  default_value = 'StarterSpark Robotics'
WHERE content_key = 'home.hero.headline' AND (content = '' OR content IS NULL OR content LIKE '%placeholder%');

UPDATE site_content SET
  content = 'Open-source robotics education for Hawaii''s next generation of engineers.',
  default_value = 'Open-source robotics education for Hawaii''s next generation of engineers.'
WHERE content_key = 'home.hero.subheadline' AND (content = '' OR content IS NULL OR content LIKE '%placeholder%');
