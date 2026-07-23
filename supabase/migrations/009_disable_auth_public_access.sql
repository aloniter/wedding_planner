-- Temporarily disable auth requirement: anyone with a wedding link can view and edit.
-- Reverses the member-scoped policies from 006_auth_rls_policies.sql back to
-- permissive public access (same approach as 005_public_dashboard.sql, extended
-- to cover venue_attachments which didn't exist yet at that point).

-- =====================
-- 1. Drop all member-scoped policies from 006
-- =====================
DROP POLICY IF EXISTS "wedding_select" ON weddings;
DROP POLICY IF EXISTS "wedding_update" ON weddings;
DROP POLICY IF EXISTS "wedding_insert" ON weddings;
DROP POLICY IF EXISTS "wedding_delete" ON weddings;

DROP POLICY IF EXISTS "members_select" ON project_members;
DROP POLICY IF EXISTS "members_insert" ON project_members;
DROP POLICY IF EXISTS "members_update" ON project_members;
DROP POLICY IF EXISTS "members_delete" ON project_members;

DROP POLICY IF EXISTS "guests_member_access" ON guests;
DROP POLICY IF EXISTS "vendors_member_access" ON vendors;
DROP POLICY IF EXISTS "tables_member_access" ON wedding_tables;
DROP POLICY IF EXISTS "categories_member_access" ON guest_categories;
DROP POLICY IF EXISTS "venues_member_access" ON venues;
DROP POLICY IF EXISTS "venue_attachments_member_access" ON venue_attachments;

-- =====================
-- 2. Re-create permissive public-access policies (anon + authenticated)
-- =====================
CREATE POLICY "public_access" ON weddings
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_access" ON project_members
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_access" ON guests
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_access" ON vendors
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_access" ON wedding_tables
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_access" ON guest_categories
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_access" ON venues
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_access" ON venue_attachments
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =====================
-- 3. Storage: allow anon uploads/replaces/deletes of wedding images too
--    (008_save_the_date_image.sql scoped these to authenticated project members)
-- =====================
DROP POLICY IF EXISTS "wedding_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "wedding_images_update" ON storage.objects;
DROP POLICY IF EXISTS "wedding_images_delete" ON storage.objects;

CREATE POLICY "wedding_images_insert"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'wedding-images');

CREATE POLICY "wedding_images_update"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (bucket_id = 'wedding-images');

CREATE POLICY "wedding_images_delete"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id = 'wedding-images');
