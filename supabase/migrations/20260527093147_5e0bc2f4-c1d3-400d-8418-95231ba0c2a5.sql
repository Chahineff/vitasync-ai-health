
-- Restrict blog_posts writes to admins only
DROP POLICY IF EXISTS "Authors can insert their own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can view their own drafts" ON public.blog_posts;

CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = author_id);

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all blog posts"
ON public.blog_posts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Restrict avatars storage policies to authenticated users only
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatars" ON storage.objects;

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own avatars"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
