-- Add new columns to user_health_profiles for enhanced onboarding
ALTER TABLE public.user_health_profiles 
ADD COLUMN IF NOT EXISTS is_adult boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS shipping_country text,
ADD COLUMN IF NOT EXISTS sport_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sleep_hours text,
ADD COLUMN IF NOT EXISTS sleep_quality_score integer,
ADD COLUMN IF NOT EXISTS energy_level integer,
ADD COLUMN IF NOT EXISTS preferred_forms text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_daily_intakes text,
ADD COLUMN IF NOT EXISTS monthly_budget text,
ADD COLUMN IF NOT EXISTS budget_range_min integer,
ADD COLUMN IF NOT EXISTS budget_range_max integer,
ADD COLUMN IF NOT EXISTS medications_notes text;

-- Create daily_checkins table for daily tracking
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 5),
  pain_areas text[] DEFAULT '{}',
  mood text,
  supplement_feedback jsonb DEFAULT '{}',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

-- Enable RLS on daily_checkins
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_checkins
CREATE POLICY "Users can view their own checkins"
ON public.daily_checkins
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkins"
ON public.daily_checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins"
ON public.daily_checkins
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checkins"
ON public.daily_checkins
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date DESC);