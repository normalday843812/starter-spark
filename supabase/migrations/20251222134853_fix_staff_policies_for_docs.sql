-- Ensure staff/admin doc policies do not evaluate is_staff()/is_admin() for anonymous roles.

-- doc_categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.doc_categories;
CREATE POLICY "Admins can manage categories"
  ON public.doc_categories
  FOR ALL TO authenticated
  USING ((SELECT is_admin((SELECT auth.uid()))))
  WITH CHECK ((SELECT is_admin((SELECT auth.uid()))));

DROP POLICY IF EXISTS "Staff can view all categories" ON public.doc_categories;
CREATE POLICY "Staff can view all categories"
  ON public.doc_categories
  FOR SELECT TO authenticated
  USING ((SELECT is_staff((SELECT auth.uid()))));

-- doc_pages
DROP POLICY IF EXISTS "Admins can manage pages" ON public.doc_pages;
CREATE POLICY "Admins can manage pages"
  ON public.doc_pages
  FOR ALL TO authenticated
  USING ((SELECT is_admin((SELECT auth.uid()))))
  WITH CHECK ((SELECT is_admin((SELECT auth.uid()))));

DROP POLICY IF EXISTS "Staff can view all pages" ON public.doc_pages;
CREATE POLICY "Staff can view all pages"
  ON public.doc_pages
  FOR SELECT TO authenticated
  USING ((SELECT is_staff((SELECT auth.uid()))));

-- doc_attachments
DROP POLICY IF EXISTS "Admins can manage attachments" ON public.doc_attachments;
CREATE POLICY "Admins can manage attachments"
  ON public.doc_attachments
  FOR ALL TO authenticated
  USING ((SELECT is_admin((SELECT auth.uid()))))
  WITH CHECK ((SELECT is_admin((SELECT auth.uid()))));

DROP POLICY IF EXISTS "Staff can view all attachments" ON public.doc_attachments;
CREATE POLICY "Staff can view all attachments"
  ON public.doc_attachments
  FOR SELECT TO authenticated
  USING ((SELECT is_staff((SELECT auth.uid()))));
