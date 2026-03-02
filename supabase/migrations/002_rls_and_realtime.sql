-- =====================
-- Enable RLS on all tables
-- =====================
ALTER TABLE weddings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_tables   ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_categories ENABLE ROW LEVEL SECURITY;

-- =====================
-- Helper: check if current user is a member of a wedding
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
-- weddings policies
-- =====================
CREATE POLICY "wedding_select" ON weddings
  FOR SELECT USING (is_wedding_member(id));

CREATE POLICY "wedding_update" ON weddings
  FOR UPDATE USING (is_wedding_member(id));

CREATE POLICY "wedding_insert" ON weddings
  FOR INSERT WITH CHECK (true);

-- =====================
-- project_members policies
-- =====================
CREATE POLICY "members_select" ON project_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_wedding_member(wedding_id)
  );

CREATE POLICY "members_insert" ON project_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.wedding_id = wedding_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
    )
  );

CREATE POLICY "members_delete" ON project_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.wedding_id = wedding_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
    )
  );

-- =====================
-- guests, vendors, wedding_tables, guest_categories: full CRUD for members
-- =====================
CREATE POLICY "guests_all" ON guests
  FOR ALL USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

CREATE POLICY "vendors_all" ON vendors
  FOR ALL USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

CREATE POLICY "tables_all" ON wedding_tables
  FOR ALL USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

CREATE POLICY "categories_all" ON guest_categories
  FOR ALL USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

-- =====================
-- Enable Realtime on synced tables
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE guests;
ALTER PUBLICATION supabase_realtime ADD TABLE vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE wedding_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE guest_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE weddings;
