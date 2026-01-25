import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  sleep_quality: number | null;
  energy_level: number | null;
  stress_level: number | null;
  pain_areas: string[];
  mood: string | null;
  supplement_feedback: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
}

export interface SupplementFeedback {
  supplement_id: string;
  supplement_name: string;
  effect: "positive" | "neutral" | "negative";
  notes?: string;
}

interface DailyCheckinContextType {
  todayCheckin: DailyCheckin | null;
  recentCheckins: DailyCheckin[];
  loading: boolean;
  showCheckinModal: boolean;
  submitCheckin: (checkin: Partial<DailyCheckin>) => Promise<{ error: Error | null; data: any }>;
  dismissCheckin: () => void;
  openCheckinModal: () => void;
  getTrends: () => { avgSleep: number; avgEnergy: number; avgStress: number; checkinCount: number } | null;
  refetch: () => Promise<void>;
}

const DailyCheckinContext = createContext<DailyCheckinContextType | null>(null);

export function DailyCheckinProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckinModal, setShowCheckinModal] = useState(false);

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const fetchTodayCheckin = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const today = getTodayDate();

    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("checkin_date", today)
      .maybeSingle();

    if (error) {
      console.error("Error fetching today's checkin:", error);
    } else {
      setTodayCheckin(data as DailyCheckin | null);
      // Only show modal if no checkin exists for today
      if (!data) {
        setShowCheckinModal(true);
      }
    }

    setLoading(false);
  }, [user]);

  const fetchRecentCheckins = useCallback(
    async (days: number = 7) => {
      if (!user) return;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", user.id)
        .gte("checkin_date", startDate.toISOString().split("T")[0])
        .order("checkin_date", { ascending: false });

      if (error) {
        console.error("Error fetching recent checkins:", error);
      } else {
        setRecentCheckins((data || []) as DailyCheckin[]);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) {
      fetchTodayCheckin();
      fetchRecentCheckins();
    }
  }, [user, fetchTodayCheckin, fetchRecentCheckins]);

  const submitCheckin = async (checkin: Partial<DailyCheckin>) => {
    if (!user) return { error: new Error("Not authenticated"), data: null };

    const today = getTodayDate();

    const checkinData: Record<string, unknown> = {
      user_id: user.id,
      checkin_date: today,
      sleep_quality: checkin.sleep_quality,
      energy_level: checkin.energy_level,
      stress_level: checkin.stress_level,
      mood: checkin.mood,
      pain_areas: checkin.pain_areas,
      notes: checkin.notes,
      supplement_feedback: checkin.supplement_feedback ?? {},
    };

    const { data, error } = await supabase
      .from("daily_checkins")
      .upsert(checkinData as any, { onConflict: "user_id,checkin_date" })
      .select()
      .single();

    if (!error && data) {
      setTodayCheckin(data as DailyCheckin);
      setShowCheckinModal(false);
      fetchRecentCheckins();
    }

    return { error: error ? new Error(error.message) : null, data };
  };

  const dismissCheckin = () => {
    setShowCheckinModal(false);
  };

  const openCheckinModal = () => {
    setShowCheckinModal(true);
  };

  const getTrends = () => {
    if (recentCheckins.length === 0) return null;

    const validCheckins = recentCheckins.filter(
      (c) => c.sleep_quality !== null || c.energy_level !== null || c.stress_level !== null
    );

    if (validCheckins.length === 0) return null;

    const avgSleep =
      validCheckins.reduce((acc, c) => acc + (c.sleep_quality || 0), 0) /
      validCheckins.filter((c) => c.sleep_quality !== null).length;

    const avgEnergy =
      validCheckins.reduce((acc, c) => acc + (c.energy_level || 0), 0) /
      validCheckins.filter((c) => c.energy_level !== null).length;

    const avgStress =
      validCheckins.reduce((acc, c) => acc + (c.stress_level || 0), 0) /
      validCheckins.filter((c) => c.stress_level !== null).length;

    return {
      avgSleep: isNaN(avgSleep) ? 0 : avgSleep,
      avgEnergy: isNaN(avgEnergy) ? 0 : avgEnergy,
      avgStress: isNaN(avgStress) ? 0 : avgStress,
      checkinCount: validCheckins.length,
    };
  };

  return (
    <DailyCheckinContext.Provider
      value={{
        todayCheckin,
        recentCheckins,
        loading,
        showCheckinModal,
        submitCheckin,
        dismissCheckin,
        openCheckinModal,
        getTrends,
        refetch: fetchTodayCheckin,
      }}
    >
      {children}
    </DailyCheckinContext.Provider>
  );
}

export function useDailyCheckin() {
  const context = useContext(DailyCheckinContext);
  if (!context) {
    throw new Error("useDailyCheckin must be used within a DailyCheckinProvider");
  }
  return context;
}
