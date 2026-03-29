
-- Drop existing public-role policies on shopify_customer_tokens
DROP POLICY IF EXISTS "Users can insert their own shopify tokens" ON public.shopify_customer_tokens;
DROP POLICY IF EXISTS "Users can update their own shopify tokens" ON public.shopify_customer_tokens;
DROP POLICY IF EXISTS "Users can delete their own shopify tokens" ON public.shopify_customer_tokens;

-- Recreate with authenticated role
CREATE POLICY "Users can insert their own shopify tokens"
ON public.shopify_customer_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopify tokens"
ON public.shopify_customer_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopify tokens"
ON public.shopify_customer_tokens
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
