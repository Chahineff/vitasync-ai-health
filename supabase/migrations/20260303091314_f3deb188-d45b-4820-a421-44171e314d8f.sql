-- Create blood test analyses table
CREATE TABLE public.blood_test_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  analysis_text TEXT,
  suggested_supplements JSONB DEFAULT '[]'::jsonb,
  deficiencies JSONB DEFAULT '[]'::jsonb,
  abnormal_values JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.blood_test_analyses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analyses
CREATE POLICY "Users can view their own analyses"
ON public.blood_test_analyses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
ON public.blood_test_analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
ON public.blood_test_analyses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
ON public.blood_test_analyses
FOR DELETE
USING (auth.uid() = user_id);