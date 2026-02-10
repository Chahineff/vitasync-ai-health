
CREATE TABLE public.product_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_id text,
  product_name text NOT NULL,
  product_handle text,
  tldr text,
  key_findings jsonb DEFAULT '[]',
  ingredients_analysis jsonb DEFAULT '[]',
  clinical_references jsonb DEFAULT '[]',
  safety_warnings jsonb DEFAULT '[]',
  regulatory_status jsonb DEFAULT '{}',
  efficacy_score text,
  synergies jsonb DEFAULT '[]',
  raw_content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read product knowledge"
  ON public.product_knowledge FOR SELECT
  TO authenticated USING (true);

CREATE UNIQUE INDEX idx_product_knowledge_handle
  ON public.product_knowledge(product_handle);

CREATE TRIGGER update_product_knowledge_updated_at
  BEFORE UPDATE ON public.product_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
