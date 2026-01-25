import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  sleep_quality: number | null;
  energy_level: number | null;
  stress_level: number | null;
  pain_areas: string[];
  mood: string | null;
  supplement_feedback: Record<string, any>;
  notes: string | null;
  created_at: string;
}

export interface SupplementFeedback {
  supplement_id: string;
  supplement_name: string;
  effect: "positive" | "neutral" | "negative";
  notes?: string;
}

export function useDailyCheckin() {
  const { user } = useAuth();
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckinModal, setShowCheckinModal] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const fetchTodayCheckin = useCallback(async () => {
    if (!user) {
      setTodayCheckin(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("daily_checkins" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("checkin_date", today)
        .maybeSingle();

      if (error) {
        console.error("Error fetching today's checkin:", error);
        return;
      }

      setTodayCheckin(data as unknown as DailyCheckin | null);
      
      // Show modal if no checkin today
      if (!data) {
        setShowCheckinModal(true);
      }
    } catch (error) {
      console.error("Error fetching today's checkin:", error);
    } finally {
      setLoading(false);
    }
  }, [user, today]);

  const fetchRecentCheckins = useCallback(async (days: number = 7) => {
    if (!user) {
      setRecentCheckins([]);
      return;
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("daily_checkins" as any)
        .select("*")
        .eq("user_id", user.id)
        .gte("checkin_date", startDate.toISOString().split("T")[0])
        .order("checkin_date", { ascending: false });

      if (error) {
        console.error("Error fetching recent checkins:", error);
        return;
      }

      setRecentCheckins(data as unknown as DailyCheckin[]);
    } catch (error) {
      console.error("Error fetching recent checkins:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchTodayCheckin();
    fetchRecentCheckins();
  }, [fetchTodayCheckin, fetchRecentCheckins]);

  const submitCheckin = async (checkin: Partial<DailyCheckin>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { data, error } = await supabase
        .from("daily_checkins" as any)
        .upsert({
          user_id: user.id,
          checkin_date: today,
          ...checkin,
        } as any, {
          onConflict: "user_id,checkin_date",
        })
        .select()
        .single();

      if (error) throw error;

      setTodayCheckin(data as unknown as DailyCheckin);
      setShowCheckinModal(false);
      await fetchRecentCheckins();
      return { error: null, data };
    } catch (error) {
      console.error("Error submitting checkin:", error);
      return { error: error as Error };
    }
  };

  const dismissCheckin = () => {
    setShowCheckinModal(false);
  };

  // Calculate trends from recent checkins
  const getTrends = () => {
    if (recentCheckins.length < 2) return null;

    const avgSleep = recentCheckins.reduce((sum, c) => sum + (c.sleep_quality || 0), 0) / recentCheckins.length;
    const avgEnergy = recentCheckins.reduce((sum, c) => sum + (c.energy_level || 0), 0) / recentCheckins.length;
    const avgStress = recentCheckins.reduce((sum, c) => sum + (c.stress_level || 0), 0) / recentCheckins.length;

    return {
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgStress: Math.round(avgStress * 10) / 10,
      checkinCount: recentCheckins.length,
    };
  };

  return {
    todayCheckin,
    recentCheckins,
    loading,
    showCheckinModal,
    submitCheckin,
    dismissCheckin,
    getTrends,
    refetch: fetchTodayCheckin,
  };
}
