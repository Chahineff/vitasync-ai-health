
CREATE TABLE public.product_compatibility_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_handle TEXT NOT NULL,
  product_title TEXT NOT NULL,
  compatibility_score INTEGER NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  insight_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_handle)
);

ALTER TABLE public.product_compatibility_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses"
ON public.product_compatibility_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
ON public.product_compatibility_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
ON public.product_compatibility_analyses FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_product_compatibility_updated_at
BEFORE UPDATE ON public.product_compatibility_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
