-- Phase 21: Enhanced Learning Platform Schema
-- Adds admin management policies and enhanced lesson content support

-------------------------------------------------
-- PART 1: Add Admin RLS Policies (CRITICAL)
-- These are MISSING and required for admin dashboard
-------------------------------------------------

-- Courses: Admin/staff can manage
CREATE POLICY "Admin can insert courses"
  ON courses FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin can update courses"
  ON courses FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin can delete courses"
  ON courses FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Modules: Admin/staff can manage
CREATE POLICY "Admin can insert modules"
  ON modules FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin can update modules"
  ON modules FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin can delete modules"
  ON modules FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Lessons: Admin/staff can manage
CREATE POLICY "Admin can insert lessons"
  ON lessons FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin can update lessons"
  ON lessons FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin can delete lessons"
  ON lessons FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-------------------------------------------------
-- PART 2: Enhance Courses Table
-------------------------------------------------

ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS icon text DEFAULT 'book-open';

CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_slug_unique
ON courses(slug) WHERE slug IS NOT NULL;

-------------------------------------------------
-- PART 3: Enhance Modules Table
-------------------------------------------------

ALTER TABLE modules ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS icon text DEFAULT 'folder';
ALTER TABLE modules ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_modules_course_slug_unique
ON modules(course_id, slug) WHERE slug IS NOT NULL;

-------------------------------------------------
-- PART 4: Enhance Lessons Table
-------------------------------------------------

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_type text DEFAULT 'content';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_blocks jsonb DEFAULT '[]'::jsonb;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'beginner';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS estimated_minutes integer DEFAULT 15;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS prerequisites uuid[] DEFAULT '{}';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_optional boolean DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS code_starter text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS code_solution text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS visual_blocks jsonb;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS downloads jsonb DEFAULT '[]'::jsonb;

-- Add check constraints (idempotent with DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lessons_lesson_type_check') THEN
    ALTER TABLE lessons ADD CONSTRAINT lessons_lesson_type_check
      CHECK (lesson_type IN ('content', 'code_challenge', 'visual_challenge', 'quiz', 'project'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lessons_difficulty_check') THEN
    ALTER TABLE lessons ADD CONSTRAINT lessons_difficulty_check
      CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
  END IF;
END $$;

-------------------------------------------------
-- PART 5: Add Indexes for Performance
-------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons(lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_modules_published ON modules(is_published) WHERE is_published = true;

-------------------------------------------------
-- PART 6: Documentation Comments
-------------------------------------------------

COMMENT ON COLUMN lessons.content_blocks IS 'JSON array of content blocks: [{type: "text"|"heading"|"image"|"video"|"code"|"callout"|"quiz"|"download", ...}]';
COMMENT ON COLUMN lessons.lesson_type IS 'Type: content, code_challenge, visual_challenge, quiz, project';
COMMENT ON COLUMN lessons.visual_blocks IS 'ReactFlow state for visual/block programming';
COMMENT ON COLUMN lessons.code_starter IS 'Starter code for code challenges';
COMMENT ON COLUMN lessons.code_solution IS 'Solution code (hidden from students)';
COMMENT ON COLUMN lessons.downloads IS 'Array of downloadable files: [{url, filename, description, size}]';
