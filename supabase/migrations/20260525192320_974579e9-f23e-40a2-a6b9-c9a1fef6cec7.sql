
CREATE TABLE IF NOT EXISTS public.product_research (
  product_id text PRIMARY KEY,
  name text NOT NULL,
  category text,
  source_url text,
  product_handle text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_research_handle ON public.product_research(product_handle);

ALTER TABLE public.product_research ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product research is publicly readable" ON public.product_research;
CREATE POLICY "Product research is publicly readable"
ON public.product_research FOR SELECT
USING (true);

DROP TRIGGER IF EXISTS update_product_research_updated_at ON public.product_research;
CREATE TRIGGER update_product_research_updated_at
BEFORE UPDATE ON public.product_research
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
