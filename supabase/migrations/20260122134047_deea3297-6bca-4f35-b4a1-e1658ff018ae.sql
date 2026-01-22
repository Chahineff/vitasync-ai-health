-- Create user health profile table for onboarding data
CREATE TABLE public.user_health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  -- Onboarding questions
  health_goals TEXT[] DEFAULT '{}',
  current_issues TEXT[] DEFAULT '{}',
  activity_level TEXT,
  diet_type TEXT,
  sleep_quality TEXT,
  stress_level TEXT,
  supplements_experience TEXT,
  allergies TEXT[] DEFAULT '{}',
  medical_conditions TEXT[] DEFAULT '{}',
  age_range TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_health_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_health_profiles
CREATE POLICY "Users can view their own health profile"
ON public.user_health_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health profile"
ON public.user_health_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health profile"
ON public.user_health_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_health_profiles_updated_at
BEFORE UPDATE ON public.user_health_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create supplement tracking table
CREATE TABLE public.supplement_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  shopify_product_id TEXT,
  product_name TEXT NOT NULL,
  dosage TEXT,
  time_of_day TEXT DEFAULT 'morning',
  recommended_by_ai BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.supplement_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for supplement_tracking
CREATE POLICY "Users can view their own supplement tracking"
ON public.supplement_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own supplement tracking"
ON public.supplement_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement tracking"
ON public.supplement_tracking FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplement tracking"
ON public.supplement_tracking FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_supplement_tracking_updated_at
BEFORE UPDATE ON public.supplement_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create supplement logs table for daily tracking
CREATE TABLE public.supplement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id UUID NOT NULL REFERENCES public.supplement_tracking(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  taken BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.supplement_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for supplement_logs (through tracking ownership)
CREATE POLICY "Users can view logs for their supplements"
ON public.supplement_logs FOR SELECT
USING (tracking_id IN (
  SELECT id FROM public.supplement_tracking WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create logs for their supplements"
ON public.supplement_logs FOR INSERT
WITH CHECK (tracking_id IN (
  SELECT id FROM public.supplement_tracking WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete logs for their supplements"
ON public.supplement_logs FOR DELETE
USING (tracking_id IN (
  SELECT id FROM public.supplement_tracking WHERE user_id = auth.uid()
));

-- Create function to auto-create health profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_health_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_health_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create health profile
CREATE TRIGGER on_auth_user_created_health_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_health_profile();