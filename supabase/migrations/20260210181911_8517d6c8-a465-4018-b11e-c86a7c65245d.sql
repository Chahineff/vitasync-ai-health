
-- Table for enriched product data extracted from PDFs
CREATE TABLE public.product_enriched_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_product_title TEXT NOT NULL UNIQUE,
  pdf_filename TEXT,
  summary TEXT,
  key_benefits JSONB DEFAULT '[]'::jsonb,
  ingredients_detailed JSONB DEFAULT '[]'::jsonb,
  suggested_use JSONB DEFAULT '{}'::jsonb,
  science_data JSONB DEFAULT '{}'::jsonb,
  safety_warnings JSONB DEFAULT '{}'::jsonb,
  best_for_tags TEXT[] DEFAULT '{}'::text[],
  quality_info JSONB DEFAULT '{}'::jsonb,
  faq JSONB DEFAULT '[]'::jsonb,
  coach_tip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_enriched_data ENABLE ROW LEVEL SECURITY;

-- Public read access (product data is visible to everyone)
CREATE POLICY "Product enriched data is publicly readable"
ON public.product_enriched_data
FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_product_enriched_data_updated_at
BEFORE UPDATE ON public.product_enriched_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
