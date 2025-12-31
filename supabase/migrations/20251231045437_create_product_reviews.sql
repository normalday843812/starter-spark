-- Create product reviews system (US compliance-minded)
-- Migration created: 2025-12-31

-- =============================================================================
-- 1) Types
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'product_review_status'
  ) THEN
    CREATE TYPE public.product_review_status AS ENUM (
      'published',
      'flagged',
      'hidden',
      'pending'
    );
  END IF;
END
$$;

-- =============================================================================
-- 2) Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating smallint NOT NULL,
  title text,
  body text NOT NULL,
  incentive_disclosure text,
  is_verified_purchase boolean NOT NULL DEFAULT true,
  status public.product_review_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  moderated_at timestamptz,
  moderated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderation_reason text,
  CONSTRAINT product_reviews_rating_check CHECK (rating >= 1 AND rating <= 5)
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS product_reviews_product_id_author_id_key
  ON public.product_reviews (product_id, author_id);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_status_created
  ON public.product_reviews (product_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_reviews_author_created
  ON public.product_reviews (author_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.product_review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_review_reports ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS product_review_reports_review_id_reporter_id_key
  ON public.product_review_reports (review_id, reporter_id);

CREATE INDEX IF NOT EXISTS idx_product_review_reports_review_id
  ON public.product_review_reports (review_id);

CREATE INDEX IF NOT EXISTS idx_product_review_reports_reporter_id
  ON public.product_review_reports (reporter_id);

-- =============================================================================
-- 3) Policies (RLS)
-- =============================================================================

-- Reviews
DROP POLICY IF EXISTS "Published reviews are viewable by everyone" ON public.product_reviews;
CREATE POLICY "Published reviews are viewable by everyone"
  ON public.product_reviews
  FOR SELECT
  TO public
  USING (status IN ('published', 'flagged'));

DROP POLICY IF EXISTS "Users can view own reviews" ON public.product_reviews;
CREATE POLICY "Users can view own reviews"
  ON public.product_reviews
  FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can create reviews for owned products" ON public.product_reviews;
CREATE POLICY "Users can create reviews for owned products"
  ON public.product_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND public.user_owns_product(product_id)
    AND is_verified_purchase = true
    AND status IN ('published', 'pending')
  );

DROP POLICY IF EXISTS "Users can update own reviews" ON public.product_reviews;
CREATE POLICY "Users can update own reviews"
  ON public.product_reviews
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (
    author_id = auth.uid()
    AND public.user_owns_product(product_id)
    AND is_verified_purchase = true
  );

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.product_reviews;
CREATE POLICY "Users can delete own reviews"
  ON public.product_reviews
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Admin and staff can manage product reviews" ON public.product_reviews;
CREATE POLICY "Admin and staff can manage product reviews"
  ON public.product_reviews
  FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()) OR (SELECT public.is_staff()))
  WITH CHECK ((SELECT public.is_admin()) OR (SELECT public.is_staff()));

-- Review reports
DROP POLICY IF EXISTS "Users can report reviews" ON public.product_review_reports;
CREATE POLICY "Users can report reviews"
  ON public.product_review_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins and staff can view review reports" ON public.product_review_reports;
CREATE POLICY "Admins and staff can view review reports"
  ON public.product_review_reports
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()) OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS "Admins and staff can delete review reports" ON public.product_review_reports;
CREATE POLICY "Admins and staff can delete review reports"
  ON public.product_review_reports
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()) OR (SELECT public.is_staff()));

-- =============================================================================
-- 4) Triggers (defense-in-depth)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_product_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_product_reviews_updated_at ON public.product_reviews;
CREATE TRIGGER trg_update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_reviews_updated_at();

CREATE OR REPLACE FUNCTION public.restrict_authenticated_product_review_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := current_setting('request.jwt.claim.role', true);
BEGIN
  -- Only restrict normal authenticated clients. service_role/admin tooling should be able
  -- to perform administrative updates without being blocked by this trigger.
  IF v_role IS DISTINCT FROM 'authenticated' THEN
    RETURN NEW;
  END IF;

  -- Allow admin/staff updates when using a normal user session.
  IF (SELECT public.is_admin()) OR (SELECT public.is_staff()) THEN
    RETURN NEW;
  END IF;

  -- Block tampering with immutable fields.
  IF NEW.author_id IS DISTINCT FROM OLD.author_id THEN
    RAISE EXCEPTION 'Cannot modify review author' USING ERRCODE = '42501';
  END IF;
  IF NEW.product_id IS DISTINCT FROM OLD.product_id THEN
    RAISE EXCEPTION 'Cannot modify review product' USING ERRCODE = '42501';
  END IF;
  IF NEW.is_verified_purchase IS DISTINCT FROM OLD.is_verified_purchase THEN
    RAISE EXCEPTION 'Cannot modify review verification' USING ERRCODE = '42501';
  END IF;

  -- Prevent users from self-publishing after moderation.
  IF OLD.status IN ('hidden', 'flagged') AND NEW.status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'Cannot self-publish a moderated review' USING ERRCODE = '42501';
  END IF;
  IF OLD.status = 'pending' AND NEW.status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'Pending reviews require moderation' USING ERRCODE = '42501';
  END IF;
  IF OLD.status = 'published' AND NEW.status NOT IN ('published', 'pending') THEN
    RAISE EXCEPTION 'Invalid review status transition' USING ERRCODE = '42501';
  END IF;

  -- Block tampering with moderation-only fields.
  IF NEW.moderated_at IS DISTINCT FROM OLD.moderated_at THEN
    RAISE EXCEPTION 'Cannot modify moderation timestamp' USING ERRCODE = '42501';
  END IF;
  IF NEW.moderated_by IS DISTINCT FROM OLD.moderated_by THEN
    RAISE EXCEPTION 'Cannot modify moderation author' USING ERRCODE = '42501';
  END IF;
  IF NEW.moderation_reason IS DISTINCT FROM OLD.moderation_reason THEN
    RAISE EXCEPTION 'Cannot modify moderation reason' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_restrict_authenticated_product_review_updates ON public.product_reviews;
CREATE TRIGGER trg_restrict_authenticated_product_review_updates
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.restrict_authenticated_product_review_updates();

-- =============================================================================
-- 5) Profiles RLS tweak (show review authors to anon without exposing email)
-- =============================================================================

DROP POLICY IF EXISTS "Anon can view author profiles" ON public.profiles;
CREATE POLICY "Anon can view author profiles" ON public.profiles
  FOR SELECT TO anon
  USING (
    id IN (SELECT DISTINCT author_id FROM public.posts WHERE status IN ('open', 'solved', 'unanswered'))
    OR id IN (SELECT DISTINCT author_id FROM public.comments)
    OR id IN (SELECT DISTINCT author_id FROM public.product_reviews WHERE status IN ('published', 'flagged'))
  );
