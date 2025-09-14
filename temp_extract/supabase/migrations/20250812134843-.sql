-- Create room photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'room-photos', 
  'room-photos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create RLS policies for room photos
CREATE POLICY "Public read access for room photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-photos');

CREATE POLICY "Organizations can upload their room photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'room-photos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = get_current_user_org_id()::text
);

CREATE POLICY "Organizations can update their room photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'room-photos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = get_current_user_org_id()::text
);

CREATE POLICY "Organizations can delete their room photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'room-photos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = get_current_user_org_id()::text
);