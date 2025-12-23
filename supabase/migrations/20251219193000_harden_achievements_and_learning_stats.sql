-- Phase 21 Security Hardening (follow-up)
-- - Prevent privacy leaks in achievements
-- - Prevent client-side tampering of learning XP/stats

-------------------------------------------------
-- 1) Achievements: remove "public can count" leak
-------------------------------------------------

-- This policy exposed *all* user_achievements rows (including user_id + metadata)
-- to anon/authenticated. Leaderboards should use an aggregated view/function instead.
DROP POLICY IF EXISTS "Public can count achievements" ON public.user_achievements;

-- Ensure anon cannot read the raw table.
REVOKE ALL ON TABLE public.user_achievements FROM anon;
REVOKE ALL ON TABLE public.user_achievements FROM PUBLIC;

-- Authenticated users can read via RLS ("Users can view own achievements").
GRANT SELECT ON TABLE public.user_achievements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_achievements TO service_role;

-- Optional: admin/staff can view all user achievements in admin tooling.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_achievements'
      AND policyname = 'Admin/staff can view all user achievements'
  ) THEN
    CREATE POLICY "Admin/staff can view all user achievements"
      ON public.user_achievements FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
      );
  END IF;
END $$;

-------------------------------------------------
-- 2) Learning stats: make XP server-authoritative
-------------------------------------------------

-- Users should be able to READ their stats, but not write xp/level/streak directly.
DROP POLICY IF EXISTS "Users can upsert own learning stats" ON public.user_learning_stats;
DROP POLICY IF EXISTS "Users can update own learning stats" ON public.user_learning_stats;

-- Ensure only server code (service_role / SECURITY DEFINER functions & triggers) writes.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.user_learning_stats FROM authenticated;
REVOKE ALL ON TABLE public.user_learning_stats FROM anon;

GRANT SELECT ON TABLE public.user_learning_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_learning_stats TO service_role;

