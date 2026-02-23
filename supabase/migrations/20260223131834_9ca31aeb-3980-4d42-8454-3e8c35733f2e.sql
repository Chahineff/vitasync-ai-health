
-- Table to store Shopify Customer Account API OAuth tokens per user
CREATE TABLE public.shopify_customer_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  shopify_customer_id TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  id_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scopes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopify_customer_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tokens
CREATE POLICY "Users can view their own shopify tokens"
ON public.shopify_customer_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own tokens
CREATE POLICY "Users can insert their own shopify tokens"
ON public.shopify_customer_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update their own shopify tokens"
ON public.shopify_customer_tokens
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete their own shopify tokens"
ON public.shopify_customer_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_shopify_customer_tokens_updated_at
BEFORE UPDATE ON public.shopify_customer_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
