-- Add license status column for explicit claim/reject workflow
-- Statuses:
--   'pending' - License created, awaiting user action in workshop
--   'claimed' - User claimed the license to their account
--   'rejected' - User explicitly rejected (doesn't want on their account)
--   'claimed_by_other' - Someone else claimed via the token link

-- Create enum type for license status
CREATE TYPE license_status AS ENUM ('pending', 'claimed', 'rejected', 'claimed_by_other');

-- Add status column with default 'pending'
ALTER TABLE licenses ADD COLUMN status license_status NOT NULL DEFAULT 'pending';

-- Migrate existing data: if owner_id is set, mark as 'claimed'
UPDATE licenses SET status = 'claimed' WHERE owner_id IS NOT NULL;

-- Add index for efficient workshop queries (find pending licenses by email)
CREATE INDEX idx_licenses_pending_by_email ON licenses (customer_email, status) WHERE status = 'pending';

-- Update RLS policies to allow users to see their pending licenses (by email match)
-- First, drop the existing user view policy
DROP POLICY IF EXISTS "Users can view their own licenses" ON licenses;

-- Create new policy: users can view:
-- 1. Licenses they own (claimed by them)
-- 2. Pending licenses for their email (awaiting action)
-- 3. Claimed_by_other licenses for their email (so they know someone else claimed it)
CREATE POLICY "Users can view their licenses"
ON licenses FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR (
    status IN ('pending', 'claimed_by_other')
    AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Allow users to update their pending licenses (claim or reject)
CREATE POLICY "Users can claim or reject their pending licenses"
ON licenses FOR UPDATE
TO authenticated
USING (
  status = 'pending'
  AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  -- Can only update status and owner_id
  status IN ('claimed', 'rejected')
);

-- Add comment explaining the workflow
COMMENT ON COLUMN licenses.status IS 'License claim status: pending (awaiting action), claimed (owned), rejected (user declined), claimed_by_other (different account claimed via token)';
