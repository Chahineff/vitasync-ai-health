-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;

-- Create a more restrictive policy - users can only view their own avatars
CREATE POLICY "Users can view their own avatars" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);