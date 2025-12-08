-- Phase 15.5 continued: Add remaining homepage content keys
-- This adds all the missing dynamic content for homepage sections

INSERT INTO site_content (content_key, content_type, content, default_value, description, category, sort_order) VALUES
-- Hero section (additional fields)
('home.hero.tagline_top', 'text', 'Robotics Education from Hawaii', 'Robotics Education from Hawaii', 'Text above the headline', 'homepage', 0),
('home.hero.tagline_bottom', 'text', 'v1.0 • Open Source Hardware • 70% to STEM Charities', 'v1.0 • Open Source Hardware • 70% to STEM Charities', 'Text below the subheadline (version, badges)', 'homepage', 5),

-- Why StarterSpark (Differentiators) section
('home.differentiators.title', 'text', 'Why StarterSpark?', 'Why StarterSpark?', 'Differentiators section title', 'homepage', 10),
('home.differentiators.description', 'text', 'We built the kit we wished existed when we started learning robotics.', 'We built the kit we wished existed when we started learning robotics.', 'Differentiators section description', 'homepage', 11),
('home.differentiators.card1.title', 'text', 'Complete Package', 'Complete Package', 'First card title', 'homepage', 12),
('home.differentiators.card1.description', 'text', 'Everything you need in one box: pre-cut parts, electronics, fasteners, and our step-by-step digital curriculum. No hunting for components or compatibility issues.', 'Everything you need in one box', 'First card description', 'homepage', 13),
('home.differentiators.card2.title', 'text', 'Interactive Curriculum', 'Interactive Curriculum', 'Second card title', 'homepage', 14),
('home.differentiators.card2.description', 'text', 'Learn by doing with our web-based platform featuring interactive wiring diagrams, code editors with real-time feedback, and progress tracking across lessons.', 'Learn by doing with our web-based platform', 'Second card description', 'homepage', 15),
('home.differentiators.card3.title', 'text', 'Support for Schools and Clubs', 'Support for Schools and Clubs', 'Third card title', 'homepage', 16),
('home.differentiators.card3.description', 'text', 'We offer bulk discounts and classroom-ready kits to help educators bring hands-on STEM learning to their students. Whether you''re running a robotics club, teaching a STEM unit, or hosting a workshop, StarterSpark provides guidance, resources, and affordable tools to make it happen.', 'We offer bulk discounts and classroom-ready kits', 'Third card description', 'homepage', 17),
('home.differentiators.card4.title', 'text', 'Hawaii Roots', 'Hawaii Roots', 'Fourth card title', 'homepage', 18),
('home.differentiators.card4.description', 'text', 'Founded by students from Hawaii who wanted to give back. Every kit sold directly supports local STEM education programs and school robotics teams across the islands.', 'Founded by students from Hawaii', 'Fourth card description', 'homepage', 19),

-- Learn by Doing section
('home.learning.title', 'text', 'Learn by Doing', 'Learn by Doing', 'Learning preview section title', 'homepage', 20),
('home.learning.description', 'text', 'Our interactive platform guides you from unboxing to your first programmed movement.', 'Our interactive platform guides you from unboxing to your first programmed movement.', 'Learning preview section description', 'homepage', 21),
('home.learning.block1.title', 'text', 'Step-by-Step Digital Guides', 'Step-by-Step Digital Guides', 'First learning block title', 'homepage', 22),
('home.learning.block1.description1', 'text', 'Each lesson builds on the last, taking you from basic assembly through advanced programming. Our interactive diagrams show exactly where each wire connects, and you can hover over components to learn what they do.', 'Each lesson builds on the last', 'First learning block paragraph 1', 'homepage', 23),
('home.learning.block1.description2', 'text', 'The built-in code editor lets you write, test, and upload your programs directly from the browser. Real-time syntax highlighting and error checking help you learn proper coding practices from day one.', 'The built-in code editor lets you write and test', 'First learning block paragraph 2', 'homepage', 24),
('home.learning.block1.cta', 'text', 'Start Learning', 'Start Learning', 'First learning block CTA button', 'homepage', 25),
('home.learning.block2.title', 'text', 'Expert Support When You Need It', 'Expert Support When You Need It', 'Second learning block title', 'homepage', 26),
('home.learning.block2.description1', 'text', 'Stuck on a step? Our community forum, The Lab, connects you with fellow builders and our support team. Most questions get answered within hours, not days.', 'Stuck on a step? Our community forum connects you with fellow builders.', 'Second learning block paragraph 1', 'homepage', 27),
('home.learning.block2.description2', 'text', 'Staff members actively monitor discussions and provide verified solutions. Every question helps build our knowledge base for future builders.', 'Staff members actively monitor discussions', 'Second learning block paragraph 2', 'homepage', 28),
('home.learning.block2.cta', 'text', 'Visit The Lab', 'Visit The Lab', 'Second learning block CTA button', 'homepage', 29),

-- More Than a Kit (Mission) section
('home.mission.title', 'text', 'More Than a Kit', 'More Than a Kit', 'Mission section title', 'homepage', 30),
('home.mission.subtitle', 'text', 'We''re building the next generation of Hawaii''s engineers.', 'We''re building the next generation of Hawaii''s engineers.', 'Mission section subtitle', 'homepage', 31),
('home.mission.story1', 'text', 'StarterSpark started as a classroom project: students teaching students how to build robots with whatever parts we could find. We saw how hands-on learning sparked curiosity in ways textbooks never could.', 'StarterSpark started as a classroom project', 'Mission story paragraph 1', 'homepage', 32),
('home.mission.story2', 'text', 'Now we''re taking that experience and packaging it for anyone to access. Each kit represents hundreds of hours of curriculum development, testing with real students, and refinement based on their feedback.', 'Now we''re taking that experience and packaging it', 'Mission story paragraph 2', 'homepage', 33),
('home.mission.commitment.title', 'text', 'Our Commitment', 'Our Commitment', 'Commitment box title', 'homepage', 34),
('home.mission.commitment.text', 'text', '70% of every dollar goes directly to local STEM charities and school robotics programs. 30% funds new kit development and operations.', '70% of every dollar goes directly to local STEM charities', 'Commitment box main text', 'homepage', 35),
('home.mission.commitment.subtext', 'text', 'Your purchase directly impacts Hawaii''s next generation of engineers.', 'Your purchase directly impacts Hawaii''s next generation of engineers.', 'Commitment box subtext', 'homepage', 36),

-- Join Community section
('home.community.title', 'text', 'Join the Community', 'Join the Community', 'Community section title', 'homepage', 40),
('home.community.description', 'text', 'Learn together at our workshops or connect with builders in The Lab.', 'Learn together at our workshops or connect with builders in The Lab.', 'Community section description', 'homepage', 41)

ON CONFLICT (content_key) DO UPDATE SET
  content = EXCLUDED.content,
  default_value = EXCLUDED.default_value,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;
