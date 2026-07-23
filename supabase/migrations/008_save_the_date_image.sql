-- Add save_the_date_image_url column to weddings
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS save_the_date_image_url TEXT;

-- Create wedding-images storage bucket (public for guest viewing)
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-images', 'wedding-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: anyone can view wedding images (public bucket, guests need access)
CREATE POLICY "wedding_images_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'wedding-images');

-- RLS: only wedding members can upload
CREATE POLICY "wedding_images_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'wedding-images'
  AND EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.wedding_id = (storage.foldername(name))[1]::uuid
      AND pm.user_id = auth.uid()
  )
);

-- RLS: only wedding members can update (replace)
CREATE POLICY "wedding_images_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'wedding-images'
  AND EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.wedding_id = (storage.foldername(name))[1]::uuid
      AND pm.user_id = auth.uid()
  )
);

-- RLS: only wedding members can delete
CREATE POLICY "wedding_images_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'wedding-images'
  AND EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.wedding_id = (storage.foldername(name))[1]::uuid
      AND pm.user_id = auth.uid()
  )
);
