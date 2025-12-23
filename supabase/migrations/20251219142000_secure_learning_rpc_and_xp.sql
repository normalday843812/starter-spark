-- Security + Gamification hardening
-- - Lock down SECURITY DEFINER RPCs (no PUBLIC/authenticated execution)
-- - Add XP/streak award trigger on lesson completion
--
-- NOTE: These functions are intended to be called only from trusted server code
-- (service_role) or internal triggers.

-------------------------------------------------
-- 1) Lock down award_achievement (service_role only)
-------------------------------------------------

CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id uuid,
  p_achievement_key text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_achievement_id uuid;
  v_already_earned boolean;
  v_role text := current_setting('request.jwt.claim.role', true);
BEGIN
  -- Defense-in-depth: even if EXECUTE is accidentally granted, only allow service_role.
  IF v_role IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO v_achievement_id
  FROM achievements
  WHERE key = p_achievement_key;

  IF v_achievement_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM user_achievements
    WHERE user_id = p_user_id AND achievement_id = v_achievement_id
  ) INTO v_already_earned;

  IF v_already_earned THEN
    RETURN false;
  END IF;

  INSERT INTO user_achievements (user_id, achievement_id, metadata)
  VALUES (p_user_id, v_achievement_id, p_metadata)
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION award_achievement(uuid, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION award_achievement(uuid, text, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION award_achievement(uuid, text, jsonb) TO service_role;

-------------------------------------------------
-- 2) Lock down apply_learning_xp (service_role only)
-------------------------------------------------

ALTER FUNCTION apply_learning_xp(uuid, integer, timestamptz) SET search_path = public;
REVOKE ALL ON FUNCTION apply_learning_xp(uuid, integer, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION apply_learning_xp(uuid, integer, timestamptz) FROM authenticated;
GRANT EXECUTE ON FUNCTION apply_learning_xp(uuid, integer, timestamptz) TO service_role;

-------------------------------------------------
-- 3) Ensure user_learning_stats can be read by users
-------------------------------------------------

GRANT SELECT ON TABLE user_learning_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE user_learning_stats TO service_role;

-------------------------------------------------
-- 4) Award XP on first-time lesson completion
-------------------------------------------------

CREATE OR REPLACE FUNCTION award_xp_on_lesson_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_difficulty text;
  v_xp integer;
BEGIN
  SELECT difficulty INTO v_difficulty
  FROM lessons
  WHERE id = NEW.lesson_id;

  v_xp := CASE v_difficulty
    WHEN 'advanced' THEN 30
    WHEN 'intermediate' THEN 20
    ELSE 10
  END;

  PERFORM apply_learning_xp(NEW.user_id, v_xp, COALESCE(NEW.completed_at, now()));
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION award_xp_on_lesson_completion() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_award_xp_on_lesson_completion ON lesson_progress;
CREATE TRIGGER trg_award_xp_on_lesson_completion
AFTER INSERT ON lesson_progress
FOR EACH ROW
WHEN (NEW.completed_at IS NOT NULL)
EXECUTE FUNCTION award_xp_on_lesson_completion();
