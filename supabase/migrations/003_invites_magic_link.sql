-- Allow pending email invites before the invited user has an auth.users id
ALTER TABLE project_members
  ALTER COLUMN user_id DROP NOT NULL;

-- Prevent duplicate pending invites for the same wedding + email
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_members_pending_invite_unique
  ON project_members (wedding_id, lower(invited_email))
  WHERE user_id IS NULL AND invited_email IS NOT NULL;

-- Recreate member policies with explicit wedding scoping on the target row
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
