-- Idempotent migration: ensure pending-invite support and correct RLS policies.
-- Safe to run even if migration 003 was already applied.

-- Ensure user_id is nullable for pending invites (no-op if already nullable)
ALTER TABLE project_members ALTER COLUMN user_id DROP NOT NULL;

-- Unique index for pending invites: one per wedding + email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_members_pending_invite_unique
  ON project_members (wedding_id, lower(invited_email))
  WHERE user_id IS NULL AND invited_email IS NOT NULL;

-- =====================
-- Recreate project_members policies (fully idempotent)
-- =====================

-- SELECT: self, any member of that wedding, or matching pending invite by JWT email
DROP POLICY IF EXISTS "members_select" ON project_members;
CREATE POLICY "members_select" ON project_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_wedding_member(project_members.wedding_id)
    OR (
      user_id IS NULL
      AND invited_email IS NOT NULL
      AND lower(invited_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
    )
  );

-- INSERT: inserter is the user_id being inserted, OR inserter is owner of that wedding
DROP POLICY IF EXISTS "members_insert" ON project_members;
CREATE POLICY "members_insert" ON project_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.wedding_id = project_members.wedding_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
    )
  );

-- DELETE: self OR owner of the wedding
DROP POLICY IF EXISTS "members_delete" ON project_members;
CREATE POLICY "members_delete" ON project_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.wedding_id = project_members.wedding_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
    )
  );

-- UPDATE: self, pending-invite claimant (JWT email match), or owner of wedding
--   WITH CHECK: after update, new row must have user_id = caller OR caller is owner
DROP POLICY IF EXISTS "members_update" ON project_members;
CREATE POLICY "members_update" ON project_members
  FOR UPDATE USING (
    user_id = auth.uid()
    OR (
      user_id IS NULL
      AND invited_email IS NOT NULL
      AND lower(invited_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
    )
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.wedding_id = project_members.wedding_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.wedding_id = project_members.wedding_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
    )
  );
