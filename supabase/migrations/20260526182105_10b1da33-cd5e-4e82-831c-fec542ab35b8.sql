ALTER TABLE public.user_health_profiles
  ADD COLUMN IF NOT EXISTS height_cm INTEGER,
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS biological_sex TEXT,
  ADD COLUMN IF NOT EXISTS medical_constraints TEXT[] DEFAULT '{}'::text[];