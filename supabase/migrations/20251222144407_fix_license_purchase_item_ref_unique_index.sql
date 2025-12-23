-- Replace partial unique index with full unique index for purchase_item_ref.
-- ON CONFLICT (purchase_item_ref) requires a non-partial unique constraint/index.

DROP INDEX IF EXISTS public.licenses_purchase_item_ref_key;
ALTER TABLE public.licenses
  DROP CONSTRAINT IF EXISTS licenses_purchase_item_ref_key;

CREATE UNIQUE INDEX licenses_purchase_item_ref_key
  ON public.licenses (purchase_item_ref);
