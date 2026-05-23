-- 1. Add UPDATE policy on user_wishlists (consistency)
CREATE POLICY "Users can update their own wishlists"
ON public.user_wishlists
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Explicit deny-by-default policies on vitasyncdata bucket
-- (private bucket, only service-role should access)
CREATE POLICY "vitasyncdata service-role only - select"
ON storage.objects
FOR SELECT
TO authenticated, anon
USING (bucket_id = 'vitasyncdata' AND false);

CREATE POLICY "vitasyncdata service-role only - insert"
ON storage.objects
FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'vitasyncdata' AND false);

CREATE POLICY "vitasyncdata service-role only - update"
ON storage.objects
FOR UPDATE
TO authenticated, anon
USING (bucket_id = 'vitasyncdata' AND false);

CREATE POLICY "vitasyncdata service-role only - delete"
ON storage.objects
FOR DELETE
TO authenticated, anon
USING (bucket_id = 'vitasyncdata' AND false);

-- 3. Revoke EXECUTE on SECURITY DEFINER helper functions from public API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_health_profile() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;