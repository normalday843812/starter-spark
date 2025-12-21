-- Phase 21 Security: Lock down learning content access
-- - Split sensitive lesson content into `lesson_content`
-- - Restrict public SELECT to published metadata only
-- - Require ownership (license) for lesson content

-------------------------------------------------
-- 1) Split lesson content into its own table
-------------------------------------------------

CREATE TABLE IF NOT EXISTS public.lesson_content (
  lesson_id uuid PRIMARY KEY REFERENCES public.lessons(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  content_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text,
  code_starter text,
  code_solution text,
  visual_blocks jsonb,
  downloads jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;

-- Backfill from legacy columns (if present) and keep idempotent.
INSERT INTO public.lesson_content (
  lesson_id,
  content,
  content_blocks,
  video_url,
  code_starter,
  code_solution,
  visual_blocks,
  downloads,
  updated_at
)
SELECT
  l.id,
  COALESCE(l.content, ''),
  COALESCE(l.content_blocks, '[]'::jsonb),
  l.video_url,
  l.code_starter,
  l.code_solution,
  l.visual_blocks,
  COALESCE(l.downloads, '[]'::jsonb),
  COALESCE(l.updated_at, now())
FROM public.lessons l
ON CONFLICT (lesson_id) DO UPDATE SET
  content = EXCLUDED.content,
  content_blocks = EXCLUDED.content_blocks,
  video_url = EXCLUDED.video_url,
  code_starter = EXCLUDED.code_starter,
  code_solution = EXCLUDED.code_solution,
  visual_blocks = EXCLUDED.visual_blocks,
  downloads = EXCLUDED.downloads,
  updated_at = EXCLUDED.updated_at;

-- Remove sensitive columns from lessons (metadata-only).
ALTER TABLE public.lessons DROP COLUMN IF EXISTS content;
ALTER TABLE public.lessons DROP COLUMN IF EXISTS content_blocks;
ALTER TABLE public.lessons DROP COLUMN IF EXISTS video_url;
ALTER TABLE public.lessons DROP COLUMN IF EXISTS code_starter;
ALTER TABLE public.lessons DROP COLUMN IF EXISTS code_solution;
ALTER TABLE public.lessons DROP COLUMN IF EXISTS visual_blocks;
ALTER TABLE public.lessons DROP COLUMN IF EXISTS downloads;

-------------------------------------------------
-- 2) Tighten public visibility for courses/modules/lessons
-------------------------------------------------

-- Replace overly-permissive "viewable by everyone" policies with published-only.
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Modules are viewable by everyone" ON public.modules;
DROP POLICY IF EXISTS "Lesson metadata is viewable by everyone" ON public.lessons;

-- Courses: public can read published, admin/staff can read all.
CREATE POLICY "Published courses are viewable by everyone"
  ON public.courses FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admin/staff can view all courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
  );

-- Modules: public can read published modules for published courses, admin/staff can read all.
CREATE POLICY "Published modules are viewable by everyone"
  ON public.modules FOR SELECT
  TO anon, authenticated
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = modules.course_id
        AND c.is_published = true
    )
  );

CREATE POLICY "Admin/staff can view all modules"
  ON public.modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
  );

-- Lessons (metadata): public can read published lessons for published modules/courses, admin/staff can read all.
CREATE POLICY "Published lesson metadata is viewable by everyone"
  ON public.lessons FOR SELECT
  TO anon, authenticated
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1
      FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = lessons.module_id
        AND m.is_published = true
        AND c.is_published = true
    )
  );

CREATE POLICY "Admin/staff can view all lessons"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
  );

-------------------------------------------------
-- 3) Lesson content access control
-------------------------------------------------

REVOKE ALL ON TABLE public.lesson_content FROM PUBLIC;
REVOKE ALL ON TABLE public.lesson_content FROM anon;

-- Admin/staff can manage all lesson content.
CREATE POLICY "Admin/staff can manage lesson content"
  ON public.lesson_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
  );

-- Owners (licensed users) can read published lesson content.
CREATE POLICY "Owners can view published lesson content"
  ON public.lesson_content
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      JOIN public.licenses lic ON lic.product_id = c.product_id
      WHERE l.id = lesson_content.lesson_id
        AND l.is_published = true
        AND m.is_published = true
        AND c.is_published = true
        AND lic.owner_id = auth.uid()
    )
  );

-- Privileges (RLS still applies)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.lesson_content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.lesson_content TO service_role;

-------------------------------------------------
-- 4) Prevent progress spoofing (lesson_progress)
-------------------------------------------------

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.lesson_progress;

-- Keep the existing SELECT policy name if present; replace with clearer rule.
DROP POLICY IF EXISTS "Users can view their own progress" ON public.lesson_progress;

CREATE POLICY "Users can view their own progress"
  ON public.lesson_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert progress for owned lessons"
  ON public.lesson_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      JOIN public.licenses lic ON lic.product_id = c.product_id
      WHERE l.id = lesson_progress.lesson_id
        AND l.is_published = true
        AND m.is_published = true
        AND c.is_published = true
        AND lic.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update progress for owned lessons"
  ON public.lesson_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      JOIN public.licenses lic ON lic.product_id = c.product_id
      WHERE l.id = lesson_progress.lesson_id
        AND l.is_published = true
        AND m.is_published = true
        AND c.is_published = true
        AND lic.owner_id = auth.uid()
    )
  );
