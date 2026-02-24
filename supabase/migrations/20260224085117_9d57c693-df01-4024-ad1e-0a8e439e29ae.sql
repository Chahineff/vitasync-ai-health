-- Remove the SELECT policy that exposes sensitive tokens to client-side
-- Tokens are only accessed server-side via edge functions using service role key
DROP POLICY IF EXISTS "Users can view their own shopify tokens" ON public.shopify_customer_tokens;