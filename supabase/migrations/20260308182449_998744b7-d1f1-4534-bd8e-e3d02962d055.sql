
CREATE TABLE public.user_wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_handle text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_handle)
);

ALTER TABLE public.user_wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlists" ON public.user_wishlists FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wishlists" ON public.user_wishlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlists" ON public.user_wishlists FOR DELETE TO authenticated USING (auth.uid() = user_id);
