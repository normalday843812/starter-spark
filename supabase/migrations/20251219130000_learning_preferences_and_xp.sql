-- Phase 21.7 + 21.8: Learning Preferences + XP/Streak Tracking

-------------------------------------------------
-- Profiles: learning preferences
-------------------------------------------------

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skill_level text DEFAULT 'beginner';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skip_basics boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_learning_style text DEFAULT 'guided';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_skill_level_check') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_skill_level_check
      CHECK (skill_level IN ('beginner', 'intermediate', 'advanced'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_learning_style_check') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_learning_style_check
      CHECK (preferred_learning_style IN ('guided', 'explorer'));
  END IF;
END $$;

-------------------------------------------------
-- User learning stats (XP, level, streak)
-------------------------------------------------

CREATE TABLE IF NOT EXISTS user_learning_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak_days integer NOT NULL DEFAULT 0,
  last_streak_date date,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_learning_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_learning_stats'
      AND policyname = 'Users can view own learning stats'
  ) THEN
    CREATE POLICY "Users can view own learning stats"
      ON user_learning_stats FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_learning_stats'
      AND policyname = 'Users can upsert own learning stats'
  ) THEN
    CREATE POLICY "Users can upsert own learning stats"
      ON user_learning_stats FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own learning stats"
      ON user_learning_stats FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_learning_stats_xp ON user_learning_stats(xp DESC);

-------------------------------------------------
-- Atomic XP increment + streak update helper
-------------------------------------------------

CREATE OR REPLACE FUNCTION apply_learning_xp(
  p_user_id uuid,
  p_xp integer,
  p_completed_at timestamptz DEFAULT now()
)
RETURNS TABLE (xp integer, level integer, streak_days integer, last_streak_date date)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_date date := (p_completed_at AT TIME ZONE 'UTC')::date;
BEGIN
  INSERT INTO user_learning_stats (user_id, xp, level, streak_days, last_streak_date, updated_at)
  VALUES (
    p_user_id,
    GREATEST(p_xp, 0),
    (FLOOR(GREATEST(p_xp, 0) / 100.0) + 1)::int,
    CASE WHEN GREATEST(p_xp, 0) > 0 THEN 1 ELSE 0 END,
    CASE WHEN GREATEST(p_xp, 0) > 0 THEN v_date ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET
      xp = user_learning_stats.xp + GREATEST(p_xp, 0),
      level = (FLOOR((user_learning_stats.xp + GREATEST(p_xp, 0)) / 100.0) + 1)::int,
      streak_days = CASE
        WHEN user_learning_stats.last_streak_date IS NULL AND GREATEST(p_xp, 0) > 0 THEN 1
        WHEN user_learning_stats.last_streak_date = v_date THEN user_learning_stats.streak_days
        WHEN user_learning_stats.last_streak_date = (v_date - 1) THEN user_learning_stats.streak_days + 1
        WHEN GREATEST(p_xp, 0) > 0 THEN 1
        ELSE user_learning_stats.streak_days
      END,
      last_streak_date = CASE
        WHEN user_learning_stats.last_streak_date = v_date THEN user_learning_stats.last_streak_date
        WHEN GREATEST(p_xp, 0) > 0 THEN v_date
        ELSE user_learning_stats.last_streak_date
      END,
      updated_at = now()
  RETURNING user_learning_stats.xp, user_learning_stats.level, user_learning_stats.streak_days, user_learning_stats.last_streak_date
  INTO xp, level, streak_days, last_streak_date;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION apply_learning_xp TO authenticated;
GRANT EXECUTE ON FUNCTION apply_learning_xp TO service_role;

