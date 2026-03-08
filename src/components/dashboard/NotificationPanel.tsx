import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Pill, TestTube, Sparkle } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Notification {
  id: string;
  type: "supplement" | "analysis" | "recommendation";
  title: string;
  message: string;
  time: string;
}

export function NotificationPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const items: Notification[] = [];

    // Missed supplements today
    const [suppsRes, logsRes] = await Promise.all([
      supabase.from("supplement_tracking").select("id, product_name, time_of_day").eq("user_id", user.id).eq("active", true),
      supabase.from("supplement_logs").select("tracking_id").gte("taken_at", `${today}T00:00:00`).eq("taken", true),
    ]);

    const taken = new Set((logsRes.data || []).map((l: any) => l.tracking_id));
    const hour = new Date().getHours();
    const missed = (suppsRes.data || []).filter((s: any) => {
      if (taken.has(s.id)) return false;
      if (s.time_of_day === "morning" && hour >= 12) return true;
      if (s.time_of_day === "noon" && hour >= 17) return true;
      return false;
    });

    missed.forEach((s: any) => {
      items.push({
        id: `supp-${s.id}`,
        type: "supplement",
        title: "Complément manqué",
        message: `${s.product_name} — ${s.time_of_day === "morning" ? "Matin" : "Midi"}`,
        time: "Aujourd'hui",
      });
    });

    // Recent completed analyses
    const { data: analyses } = await supabase
      .from("blood_test_analyses")
      .select("id, file_name, analyzed_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("analyzed_at", { ascending: false })
      .limit(3);

    (analyses || []).forEach((a: any) => {
      const date = a.analyzed_at ? new Date(a.analyzed_at) : new Date();
      const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 7) {
        items.push({
          id: `analysis-${a.id}`,
          type: "analysis",
          title: "Analyse terminée",
          message: a.file_name,
          time: daysDiff === 0 ? "Aujourd'hui" : daysDiff === 1 ? "Hier" : `Il y a ${daysDiff}j`,
        });
      }
    });

    setNotifications(items);
  };

  const unreadCount = notifications.length;
  const iconsByType = {
    supplement: Pill,
    analysis: TestTube,
    recommendation: Sparkle,
  };
  const colorsByType = {
    supplement: "text-yellow-500 bg-yellow-500/10",
    analysis: "text-primary bg-primary/10",
    recommendation: "text-purple-500 bg-purple-500/10",
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-muted/50 transition-colors">
          <Bell weight="light" className="w-5 h-5 text-foreground/60" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96 bg-background/95 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="text-lg font-medium">Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell weight="light" className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-foreground/40">Aucune notification</p>
            </div>
          )}
          <AnimatePresence>
            {notifications.map((notif, i) => {
              const Icon = iconsByType[notif.type];
              const colors = colorsByType[notif.type];
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors}`}>
                    <Icon weight="fill" className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{notif.title}</p>
                    <p className="text-xs text-foreground/50 truncate">{notif.message}</p>
                    <p className="text-[10px] text-foreground/30 mt-0.5">{notif.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
