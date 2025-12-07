-- Migration: Fix is_admin() no-param function missing SET search_path
-- Date: 2025-12-07
-- Description: The no-param version of is_admin was missing SET search_path

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;
