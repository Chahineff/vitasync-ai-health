ALTER TABLE public.user_health_profiles 
  ADD COLUMN IF NOT EXISTS notify_supplement_reminders boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_analysis_ready boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_weekly_summary boolean DEFAULT false;