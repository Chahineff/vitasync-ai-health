import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignOut, X, Moon, Sun, Lightning, Heart } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { cn } from "@/lib/utils";

const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

interface SessionStats {
  supplementsTaken: number;
  supplementsTotal: number;
  conversationsToday: number;
}

interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function useSessionStats(): SessionStats {
  const { user } = useAuth();
  const [stats, setStats] = useState<SessionStats>({ supplementsTaken: 0, supplementsTotal: 0, conversationsToday: 0 });

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      supabase
        .from("supplement_tracking")
        .select("id")
        .eq("user_id", user.id)
        .eq("active", true),
      supabase
        .from("supplement_logs")
        .select("id, tracking_id")
        .gte("taken_at", `${today}T00:00:00`)
        .eq("taken", true),
      supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .gte("updated_at", `${today}T00:00:00`),
    ]).then(([supps, logs, convs]) => {
      setStats({
        supplementsTotal: supps.data?.length || 0,
        supplementsTaken: logs.data?.length || 0,
        conversationsToday: convs.data?.length || 0,
      });
    });
  }, [user]);

  return stats;
}

function getMotivationalMessage(stats: SessionStats): string {
  const hour = new Date().getHours();
  if (stats.supplementsTaken === stats.supplementsTotal && stats.supplementsTotal > 0) {
    return "Bravo, tous tes compléments sont pris ! 🏆";
  }
  if (hour < 12) return "Bonne matinée, à très vite ! ☀️";
  if (hour < 18) return "Belle après-midi, prends soin de toi 💚";
  if (stats.supplementsTotal > stats.supplementsTaken) {
    return "N'oublie pas tes compléments du soir ! 🌙";
  }
  return "Belle soirée, à demain pour ta routine ! 💪";
}

export function LogoutConfirmModal({ open, onClose, onConfirm }: LogoutConfirmModalProps) {
  const { profile } = useAuth();
  const { signedUrl: avatarUrl } = useAvatarUrl(profile?.avatar_url);
  const stats = useSessionStats();
  const displayName = profile?.first_name || "Utilisateur";
  const message = getMotivationalMessage(stats);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
            >
              <X weight="bold" className="w-4 h-4 text-foreground/50" />
            </button>

            <div className="p-6 pt-8 flex flex-col items-center text-center">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 ring-4 ring-primary/10"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-primary-foreground font-semibold text-xl">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </motion.div>

              <h2 className="text-lg font-medium text-foreground mb-1">
                À bientôt, {displayName} !
              </h2>
              <p className="text-sm text-foreground/50 mb-6">{message}</p>

              {/* Session Summary */}
              <div className="w-full grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-2xl bg-muted/30 border border-border/30 p-3 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart weight="fill" className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    {stats.supplementsTaken}/{stats.supplementsTotal}
                  </span>
                  <span className="text-xs text-foreground/40">Compléments</span>
                </div>
                <div className="rounded-2xl bg-muted/30 border border-border/30 p-3 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Lightning weight="fill" className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    {stats.conversationsToday}
                  </span>
                  <span className="text-xs text-foreground/40">Conversations</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="w-full space-y-2">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Rester connecté
                </button>
                <button
                  onClick={onConfirm}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 text-foreground/60 text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center gap-2"
                >
                  <SignOut weight="light" className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Farewell overlay shown after confirming logout */
export function LogoutFarewellOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[70] bg-background flex flex-col items-center justify-center gap-4"
        >
          <motion.img
            src={vitasyncLogo}
            alt="VitaSync"
            className="w-14 h-14"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 0.6, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeIn" }}
          />
          <motion.p
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-foreground/50 text-sm font-light"
          >
            À très bientôt…
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
