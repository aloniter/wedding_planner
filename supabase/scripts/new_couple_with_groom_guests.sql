-- Create a NEW, clean wedding for a new couple, keeping only the groom-side
-- (חתן) guests from the existing wedding. The existing wedding is not touched.
--
-- New link: https://<your-site>/wedding/3ca8bdf8
--
-- How to run: Supabase dashboard -> SQL Editor -> paste this file -> Run.
-- If you have more than one wedding in the database, set source_slug below to
-- the slug of the existing wedding (the part after /wedding/ in its link).
-- Safe to re-run: if the new wedding already exists it stops without changes.

DO $$
DECLARE
  source_slug  TEXT := NULL;        -- e.g. 'a1b2c3d4'; NULL = the only existing wedding
  new_slug     TEXT := '3ca8bdf8';
  source_id    UUID;
  new_id       UUID;
  copied_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM weddings WHERE slug = new_slug) THEN
    RAISE NOTICE 'Wedding % already exists, nothing to do', new_slug;
    RETURN;
  END IF;

  IF source_slug IS NOT NULL THEN
    SELECT id INTO source_id FROM weddings WHERE slug = source_slug;
  ELSIF (SELECT count(*) FROM weddings) = 1 THEN
    SELECT id INTO source_id FROM weddings;
  ELSE
    RAISE EXCEPTION 'More than one wedding exists: set source_slug at the top of this script';
  END IF;

  IF source_id IS NULL THEN
    RAISE EXCEPTION 'Source wedding % not found', source_slug;
  END IF;

  -- Clean wedding: placeholder names (editable from the dashboard), no date,
  -- venue, budget, save-the-date image or message templates.
  INSERT INTO weddings (groom_name, bride_name, slug)
  VALUES ('חתן', 'כלה', new_slug)
  RETURNING id INTO new_id;

  -- Categories used by the copied guests, so their groups keep their colors
  INSERT INTO guest_categories (wedding_id, name, color)
  SELECT DISTINCT new_id, c.name, c.color
  FROM guest_categories c
  JOIN guests g ON g.wedding_id = c.wedding_id AND g.group_name = c.name
  WHERE c.wedding_id = source_id
    AND g.side = 'חתן';

  -- Groom-side guests only, with a fresh RSVP state: pending, no table,
  -- no gift, not invited yet, and a new RSVP token (default).
  INSERT INTO guests (wedding_id, full_name, phone, side, group_name,
                      adults_count, kids_count, notes)
  SELECT new_id, full_name, phone, side, group_name,
         adults_count, kids_count, notes
  FROM guests
  WHERE wedding_id = source_id
    AND side = 'חתן'
  ORDER BY created_at;

  GET DIAGNOSTICS copied_count = ROW_COUNT;
  RAISE NOTICE 'Created wedding % with % groom guests', new_slug, copied_count;
END $$;
