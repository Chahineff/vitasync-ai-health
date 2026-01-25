import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface HealthProfile {
  id: string;
  user_id: string;
  health_goals: string[];
  current_issues: string[];
  activity_level: string | null;
  diet_type: string | null;
  sleep_quality: string | null;
  stress_level: string | null;
  supplements_experience: string | null;
  allergies: string[];
  medical_conditions: string[];
  age_range: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  // New onboarding fields
  is_adult: boolean | null;
  shipping_country: string | null;
  sport_types: string[];
  sleep_hours: string | null;
  sleep_quality_score: number | null;
  energy_level: number | null;
  preferred_forms: string[];
  max_daily_intakes: string | null;
  monthly_budget: string | null;
  budget_range_min: number | null;
  budget_range_max: number | null;
  medications_notes: string | null;
}

export function useHealthProfile() {
  const { user } = useAuth();
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealthProfile = useCallback(async () => {
    if (!user) {
      setHealthProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_health_profiles" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching health profile:", error);
        return;
      }

      setHealthProfile(data as unknown as HealthProfile | null);
    } catch (error) {
      console.error("Error fetching health profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHealthProfile();
  }, [fetchHealthProfile]);

  const updateHealthProfile = async (updates: Partial<HealthProfile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("user_health_profiles" as any)
        .update(updates as any)
        .eq("user_id", user.id);

      if (error) throw error;

      setHealthProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return { error: null };
    } catch (error) {
      console.error("Error updating health profile:", error);
      return { error: error as Error };
    }
  };

  const createHealthProfile = async (profile: Partial<HealthProfile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { data, error } = await supabase
        .from("user_health_profiles" as any)
        .insert({
          user_id: user.id,
          ...profile,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setHealthProfile(data as unknown as HealthProfile);
      return { error: null, data };
    } catch (error) {
      console.error("Error creating health profile:", error);
      return { error: error as Error };
    }
  };

  const completeOnboarding = async (answers: Partial<HealthProfile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    const updates = {
      ...answers,
      onboarding_completed: true,
    };

    // Check if profile exists
    if (healthProfile) {
      return updateHealthProfile(updates);
    } else {
      return createHealthProfile(updates);
    }
  };

  return {
    healthProfile,
    loading,
    updateHealthProfile,
    completeOnboarding,
    refetch: fetchHealthProfile,
  };
}
