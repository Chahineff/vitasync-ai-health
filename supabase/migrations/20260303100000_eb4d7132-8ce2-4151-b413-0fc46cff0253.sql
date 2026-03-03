-- Create a dedicated bucket for blood test uploads (user-scoped)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blood-tests', 'blood-tests', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own blood test PDFs
CREATE POLICY "Users can upload their own blood tests"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'blood-tests' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow users to read their own blood test files
CREATE POLICY "Users can read their own blood tests"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'blood-tests' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own blood test files
CREATE POLICY "Users can delete their own blood tests"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'blood-tests' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);