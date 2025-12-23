-- Ensure purchase_item_ref exists and is uniquely indexed for idempotent license inserts.

ALTER TABLE public.licenses
  ADD COLUMN IF NOT EXISTS purchase_item_ref text;

CREATE UNIQUE INDEX IF NOT EXISTS licenses_purchase_item_ref_key
  ON public.licenses (purchase_item_ref)
  WHERE purchase_item_ref IS NOT NULL;
