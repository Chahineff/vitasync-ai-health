import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type Stage = "validating" | "saving" | "analyzing";

const STEPS: { id: Stage; label: string; sub: string; icon: typeof Check }[] = [
  { id: "validating", label: "Validation des réponses", sub: "Vérification de la cohérence du profil", icon: ShieldCheck },
  { id: "saving", label: "Enregistrement sécurisé", sub: "Données chiffrées · stockées de façon confidentielle", icon: Loader2 },
  { id: "analyzing", label: "Préparation du Coach IA", sub: "Initialisation de votre espace personnalisé", icon: Sparkles },
];

interface SavingOverlayProps {
  open: boolean;
}

/**
 * Visual-only progress overlay shown during onboarding submission.
 * Steps auto-advance to communicate progress; the actual save happens
 * in the parent's async handler — this component never blocks it.
 */
export function SavingOverlay({ open }: SavingOverlayProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!open) {
      setActiveIdx(0);
      return;
    }
    const t1 = setTimeout(() => setActiveIdx(1), 700);
    const t2 = setTimeout(() => setActiveIdx(2), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
          role="status"
          aria-live="polite"
          aria-label="Enregistrement en cours"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-3xl bg-card/80 backdrop-blur-2xl border border-border/40 shadow-[0_30px_80px_-30px_hsl(var(--foreground)/0.35)] p-6 md:p-7"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50">Profil santé</p>
                <h3 className="text-base md:text-lg font-medium tracking-tight text-foreground">Enregistrement en cours…</h3>
              </div>
            </div>

            {/* Indeterminate gradient progress bar */}
            <div className="relative h-1 rounded-full bg-muted/40 overflow-hidden mb-5">
              <motion.div
                className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-primary via-secondary to-primary"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Steps */}
            <ul className="space-y-3">
              {STEPS.map((step, i) => {
                const isDone = i < activeIdx;
                const isActive = i === activeIdx;
                const Icon = step.icon;
                return (
                  <li key={step.id} className="flex items-start gap-3">
                    <div
                      className={
                        "mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors " +
                        (isDone
                          ? "bg-primary/15 border-primary/30 text-primary"
                          : isActive
                          ? "bg-primary/10 border-primary/25 text-primary"
                          : "bg-muted/40 border-border/40 text-foreground/40")
                      }
                    >
                      {isDone ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : isActive ? (
                        <Icon className={"w-3.5 h-3.5 " + (Icon === Loader2 ? "animate-spin" : "")} />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={
                          "text-[13.5px] font-medium tracking-tight " +
                          (isDone || isActive ? "text-foreground" : "text-foreground/55")
                        }
                      >
                        {step.label}
                      </p>
                      <p className="text-[11.5px] text-foreground/50 leading-relaxed">{step.sub}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-5 text-[10.5px] text-center text-foreground/40 tracking-tight">
              Ne fermez pas cette fenêtre.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}