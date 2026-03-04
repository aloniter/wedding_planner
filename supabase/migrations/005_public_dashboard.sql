-- =====================
-- 1. Add slug column to weddings
-- =====================
ALTER TABLE weddings ADD COLUMN slug TEXT UNIQUE;
UPDATE weddings SET slug = substr(id::text, 1, 8) WHERE slug IS NULL;
ALTER TABLE weddings ALTER COLUMN slug SET NOT NULL;
CREATE INDEX weddings_slug_idx ON weddings (slug);

-- Auto-generate slug on new inserts
CREATE OR REPLACE FUNCTION generate_wedding_slug()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_wedding_slug
  BEFORE INSERT ON weddings
  FOR EACH ROW EXECUTE FUNCTION generate_wedding_slug();

-- =====================
-- 2. Drop all auth-based RLS policies
-- =====================

-- weddings
DROP POLICY IF EXISTS "wedding_select" ON weddings;
DROP POLICY IF EXISTS "wedding_update" ON weddings;
DROP POLICY IF EXISTS "wedding_insert" ON weddings;

-- project_members
DROP POLICY IF EXISTS "members_select" ON project_members;
DROP POLICY IF EXISTS "members_insert" ON project_members;
DROP POLICY IF EXISTS "members_delete" ON project_members;
DROP POLICY IF EXISTS "members_update" ON project_members;

-- data tables
DROP POLICY IF EXISTS "guests_all" ON guests;
DROP POLICY IF EXISTS "vendors_all" ON vendors;
DROP POLICY IF EXISTS "tables_all" ON wedding_tables;
DROP POLICY IF EXISTS "categories_all" ON guest_categories;

-- =====================
-- 3. Create permissive public-access policies
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

-- venues table: enable RLS + public policy
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON venues
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =====================
-- 4. Add venues to realtime publication (skip if already added)
-- =====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'venues'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE venues;
  END IF;
END $$;
