import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SupplementTracking {
  id: string;
  user_id: string;
  shopify_product_id: string | null;
  product_name: string;
  dosage: string | null;
  time_of_day: string;
  recommended_by_ai: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplementLog {
  id: string;
  tracking_id: string;
  taken_at: string;
  taken: boolean;
}

export function useSupplementTracking() {
  const { user } = useAuth();
  const [supplements, setSupplements] = useState<SupplementTracking[]>([]);
  const [logs, setLogs] = useState<SupplementLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSupplements = useCallback(async () => {
    if (!user) {
      setSupplements([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      const { data: supplementsData, error: supplementsError } = await supabase
        .from("supplement_tracking" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("time_of_day", { ascending: true });

      if (supplementsError) throw supplementsError;

      const supplementsList = (supplementsData as unknown as SupplementTracking[]) || [];
      setSupplements(supplementsList);

      // Fetch today's logs
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const trackingIds = supplementsList.map((s) => s.id);
      if (trackingIds.length > 0) {
        const { data: logsData, error: logsError } = await supabase
          .from("supplement_logs" as any)
          .select("*")
          .in("tracking_id", trackingIds)
          .gte("taken_at", today.toISOString())
          .lt("taken_at", tomorrow.toISOString());

        if (logsError) throw logsError;

        setLogs((logsData as unknown as SupplementLog[]) || []);
      }
    } catch (error) {
      console.error("Error fetching supplements:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSupplements();
  }, [fetchSupplements]);

  const addSupplement = async (supplement: Omit<SupplementTracking, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { data, error } = await supabase
        .from("supplement_tracking" as any)
        .insert({
          user_id: user.id,
          ...supplement,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setSupplements((prev) => [...prev, data as unknown as SupplementTracking]);
      return { error: null, data };
    } catch (error) {
      console.error("Error adding supplement:", error);
      return { error: error as Error };
    }
  };

  const removeSupplement = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("supplement_tracking" as any)
        .update({ active: false } as any)
        .eq("id", id);

      if (error) throw error;

      setSupplements((prev) => prev.filter((s) => s.id !== id));
      return { error: null };
    } catch (error) {
      console.error("Error removing supplement:", error);
      return { error: error as Error };
    }
  };

  const toggleSupplementTaken = async (trackingId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const existingLog = logs.find((l) => l.tracking_id === trackingId);

    try {
      if (existingLog) {
        // Remove the log (mark as not taken)
        const { error } = await supabase
          .from("supplement_logs" as any)
          .delete()
          .eq("id", existingLog.id);

        if (error) throw error;

        setLogs((prev) => prev.filter((l) => l.id !== existingLog.id));
      } else {
        // Add a log (mark as taken)
        const { data, error } = await supabase
          .from("supplement_logs" as any)
          .insert({
            tracking_id: trackingId,
            taken: true,
          } as any)
          .select()
          .single();

        if (error) throw error;

        setLogs((prev) => [...prev, data as unknown as SupplementLog]);
      }
      return { error: null };
    } catch (error) {
      console.error("Error toggling supplement:", error);
      return { error: error as Error };
    }
  };

  const isSupplementTakenToday = (trackingId: string) => {
    return logs.some((l) => l.tracking_id === trackingId);
  };

  // Get weekly stats
  const getWeeklyStats = async () => {
    if (!user || supplements.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const trackingIds = supplements.map((s) => s.id);

    const { data, error } = await supabase
      .from("supplement_logs" as any)
      .select("*")
      .in("tracking_id", trackingIds)
      .gte("taken_at", weekAgo.toISOString())
      .lt("taken_at", new Date().toISOString());

    if (error) {
      console.error("Error fetching weekly stats:", error);
      return [];
    }

    const logsData = (data as unknown as SupplementLog[]) || [];

    // Group by day
    const stats: { day: string; count: number; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayLogs = logsData.filter((log) => {
        const logDate = new Date(log.taken_at);
        return logDate >= dayStart && logDate < dayEnd;
      });

      stats.push({
        day: date.toLocaleDateString("fr-FR", { weekday: "short" }),
        count: dayLogs.length,
        total: supplements.length,
      });
    }

    return stats;
  };

  // Get monthly stats
  const getMonthlyStats = async () => {
    if (!user || supplements.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const trackingIds = supplements.map((s) => s.id);

    const { data, error } = await supabase
      .from("supplement_logs" as any)
      .select("*")
      .in("tracking_id", trackingIds)
      .gte("taken_at", monthAgo.toISOString())
      .lt("taken_at", new Date().toISOString());

    if (error) {
      console.error("Error fetching monthly stats:", error);
      return [];
    }

    const logsData = (data as unknown as SupplementLog[]) || [];

    // Group by week
    const stats: { week: string; percentage: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekLogs = logsData.filter((log) => {
        const logDate = new Date(log.taken_at);
        return logDate >= weekStart && logDate < weekEnd;
      });

      const expectedLogs = supplements.length * 7;
      const percentage = expectedLogs > 0 ? Math.round((weekLogs.length / expectedLogs) * 100) : 0;

      stats.push({
        week: `Sem ${4 - i}`,
        percentage: Math.min(percentage, 100),
      });
    }

    return stats;
  };

  const takenCount = supplements.filter((s) => isSupplementTakenToday(s.id)).length;
  const progressPercent = supplements.length > 0 ? Math.round((takenCount / supplements.length) * 100) : 0;

  // Streak calculation
  const [streakDays, setStreakDays] = useState(0);

  const calculateStreak = useCallback(async () => {
    if (!user || supplements.length === 0) {
      setStreakDays(0);
      return;
    }

    const trackingIds = supplements.map((s) => s.id);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("supplement_logs" as any)
      .select("*")
      .in("tracking_id", trackingIds)
      .gte("taken_at", thirtyDaysAgo.toISOString());

    if (error) {
      console.error("Error calculating streak:", error);
      setStreakDays(0);
      return;
    }

    const logsData = (data as unknown as SupplementLog[]) || [];
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check each day backwards
    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayLogs = logsData.filter((log) => {
        const d = new Date(log.taken_at);
        return d >= dayStart && d < dayEnd;
      });

      // All supplements taken that day?
      const uniqueTracking = new Set(dayLogs.map((l) => l.tracking_id));
      if (uniqueTracking.size >= supplements.length) {
        streak++;
      } else if (i === 0) {
        // Today not yet complete is OK, skip
        continue;
      } else {
        break;
      }
    }

    setStreakDays(streak);
  }, [user, supplements]);

  useEffect(() => {
    calculateStreak();
  }, [calculateStreak, logs]);

  return {
    supplements,
    logs,
    loading,
    addSupplement,
    removeSupplement,
    toggleSupplementTaken,
    isSupplementTakenToday,
    getWeeklyStats,
    getMonthlyStats,
    refetch: fetchSupplements,
    takenCount,
    totalCount: supplements.length,
    progressPercent,
    streakDays,
  };
}
