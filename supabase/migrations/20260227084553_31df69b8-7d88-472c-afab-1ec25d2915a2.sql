CREATE POLICY "Users can view their own shopify tokens"
ON public.shopify_customer_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);