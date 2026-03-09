-- =====================
-- 1. Drop all public_access policies
-- =====================
DROP POLICY IF EXISTS "public_access" ON weddings;
DROP POLICY IF EXISTS "public_access" ON project_members;
DROP POLICY IF EXISTS "public_access" ON guests;
DROP POLICY IF EXISTS "public_access" ON vendors;
DROP POLICY IF EXISTS "public_access" ON wedding_tables;
DROP POLICY IF EXISTS "public_access" ON guest_categories;
DROP POLICY IF EXISTS "public_access" ON venues;
DROP POLICY IF EXISTS "public_access" ON venue_attachments;

-- =====================
-- 2. Ensure RLS is enabled on all tables
-- =====================
ALTER TABLE weddings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_tables   ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues           ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_attachments ENABLE ROW LEVEL SECURITY;

-- =====================
-- 3. Ensure helper function exists
-- =====================
CREATE OR REPLACE FUNCTION is_wedding_member(p_wedding_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_members
    WHERE wedding_id = p_wedding_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================
-- 4. Weddings policies
-- =====================
CREATE POLICY "wedding_select" ON weddings
  FOR SELECT TO authenticated
  USING (is_wedding_member(id));

CREATE POLICY "wedding_update" ON weddings
  FOR UPDATE TO authenticated
  USING (is_wedding_member(id))
  WITH CHECK (is_wedding_member(id));

CREATE POLICY "wedding_insert" ON weddings
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "wedding_delete" ON weddings
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE wedding_id = id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- =====================
-- 5. Project members policies
-- NOTE: use project_members.wedding_id to reference the current row
--       inside subqueries that also select from project_members
-- =====================
CREATE POLICY "members_select" ON project_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR invited_email = auth.email()
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.wedding_id = project_members.wedding_id
        AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "members_insert" ON project_members
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Creating own membership (for new wedding setup)
    user_id = auth.uid()
    OR
    -- Owner inviting someone (user_id is null, invited_email is set)
    (
      user_id IS NULL
      AND invited_email IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.wedding_id = project_members.wedding_id
          AND pm.user_id = auth.uid()
          AND pm.role = 'owner'
      )
    )
  );

CREATE POLICY "members_update" ON project_members
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR invited_email = auth.email()
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.wedding_id = project_members.wedding_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
    )
  );

CREATE POLICY "members_delete" ON project_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.wedding_id = project_members.wedding_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
    )
  );

-- =====================
-- 6. Data tables: full CRUD for wedding members
-- =====================
CREATE POLICY "guests_member_access" ON guests
  FOR ALL TO authenticated
  USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

CREATE POLICY "vendors_member_access" ON vendors
  FOR ALL TO authenticated
  USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

CREATE POLICY "tables_member_access" ON wedding_tables
  FOR ALL TO authenticated
  USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

CREATE POLICY "categories_member_access" ON guest_categories
  FOR ALL TO authenticated
  USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

CREATE POLICY "venues_member_access" ON venues
  FOR ALL TO authenticated
  USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

-- =====================
-- 7. Venue attachments: access via venue's wedding membership
-- =====================
CREATE POLICY "venue_attachments_member_access" ON venue_attachments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM venues v
      WHERE v.id = venue_id
        AND is_wedding_member(v.wedding_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM venues v
      WHERE v.id = venue_id
        AND is_wedding_member(v.wedding_id)
    )
  );
