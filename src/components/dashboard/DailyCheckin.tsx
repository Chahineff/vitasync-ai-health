import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import {
  Sun, Moon, Lightning, Brain,
  SmileyWink, Smiley, SmileyMeh, SmileySad, SmileyXEyes,
  ThumbsUp, Minus, ThumbsDown,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useDailyCheckin } from "@/hooks/useDailyCheckin";
import { useSupplementTracking } from "@/hooks/useSupplementTracking";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Confetti, SuccessCheckmark } from "@/components/ui/Confetti";

interface DailyCheckinProps {
  onComplete?: () => void;
}

// Color scales for each metric
const sleepColors = ["text-red-400", "text-orange-400", "text-yellow-400", "text-green-400", "text-indigo-400"];
const sleepBgs = ["bg-red-500/15", "bg-orange-500/15", "bg-yellow-500/15", "bg-green-500/15", "bg-indigo-500/15"];
const energyColors = ["text-red-400", "text-orange-400", "text-yellow-400", "text-amber-400", "text-emerald-400"];
const energyBgs = ["bg-red-500/15", "bg-orange-500/15", "bg-yellow-500/15", "bg-amber-500/15", "bg-emerald-500/15"];
const stressColors = ["text-emerald-400", "text-green-400", "text-yellow-400", "text-orange-400", "text-red-400"];
const stressBgs = ["bg-emerald-500/15", "bg-green-500/15", "bg-yellow-500/15", "bg-orange-500/15", "bg-red-500/15"];

const stepTransition = {
  initial: { opacity: 0, x: 40, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -40, filter: "blur(4px)" },
};

export function DailyCheckin({ onComplete }: DailyCheckinProps) {
  const { showCheckinModal, todayCheckin, submitCheckin, dismissCheckin } = useDailyCheckin();
  const { supplements } = useSupplementTracking();
  
  const [step, setStep] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [mood, setMood] = useState<string | null>(null);
  const [supplementFeedback, setSupplementFeedback] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (todayCheckin && showCheckinModal) {
      setSleepQuality(todayCheckin.sleep_quality || 3);
      setEnergyLevel(todayCheckin.energy_level || 3);
      setStressLevel(todayCheckin.stress_level || 3);
      setMood(todayCheckin.mood);
      if (todayCheckin.supplement_feedback) {
        setSupplementFeedback(todayCheckin.supplement_feedback as Record<string, string>);
      }
    }
  }, [todayCheckin, showCheckinModal]);

  const supplementsToAsk = supplements.filter((s) => {
    if (!s.active) return false;
    const createdAt = new Date(s.created_at);
    const daysSince = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 7;
  });

  const totalSteps = supplementsToAsk.length > 0 ? 3 : 2;

  const moods = [
    { value: "great", label: "Super", icon: <SmileyWink weight="duotone" className="w-6 h-6" />, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/20" },
    { value: "good", label: "Bien", icon: <Smiley weight="duotone" className="w-6 h-6" />, color: "text-green-400", bg: "bg-green-500/15 border-green-500/20" },
    { value: "okay", label: "Bof", icon: <SmileyMeh weight="duotone" className="w-6 h-6" />, color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/20" },
    { value: "bad", label: "Pas top", icon: <SmileySad weight="duotone" className="w-6 h-6" />, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/20" },
    { value: "terrible", label: "Difficile", icon: <SmileyXEyes weight="duotone" className="w-6 h-6" />, color: "text-red-400", bg: "bg-red-500/15 border-red-500/20" },
  ];

  const feedbackOptions = [
    { value: "positive", label: "Positif", icon: <ThumbsUp weight="duotone" className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/20" },
    { value: "neutral", label: "Aucun", icon: <Minus weight="duotone" className="w-5 h-5" />, color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/20" },
    { value: "negative", label: "Négatif", icon: <ThumbsDown weight="duotone" className="w-5 h-5" />, color: "text-red-400", bg: "bg-red-500/15 border-red-500/20" },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { error } = await submitCheckin({
      sleep_quality: sleepQuality,
      energy_level: energyLevel,
      stress_level: stressLevel,
      mood,
      supplement_feedback: supplementFeedback,
    });

    if (error) {
      toast.error("Erreur lors de l'enregistrement");
      setIsSubmitting(false);
    } else {
      setShowSuccess(true);
      setTimeout(() => {
        toast.success("Check-in enregistré !", { description: "Merci pour votre suivi quotidien" });
        setShowSuccess(false);
        setIsSubmitting(false);
        onComplete?.();
      }, 2000);
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleSupplementFeedback = (supplementId: string, effect: string) => {
    setSupplementFeedback((prev) => ({ ...prev, [supplementId]: effect }));
  };

  if (!showCheckinModal) return null;

  return (
    <>
      <Confetti isActive={showSuccess} />
      <SuccessCheckmark isVisible={showSuccess} />
      
      <AnimatePresence>
        {showCheckinModal && (
          <motion.div
            key="checkin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="relative rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden border border-white/10"
              style={{
                background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.95) 100%)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              }}
            >
              {/* Decorative gradient orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="relative p-8 pb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          <Sun weight="duotone" className="w-3.5 h-3.5" />
                          Check-in du jour
                        </span>
                      </motion.div>
                      <h2 className="text-2xl font-semibold text-foreground tracking-tight">Comment ça va ?</h2>
                    </div>
                    <motion.button
                      onClick={dismissCheckin}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-border/50"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="flex items-center gap-3 mt-6">
                    <div className="flex gap-2 flex-1">
                      {Array.from({ length: totalSteps }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                          className={cn(
                            "h-1.5 rounded-full flex-1 origin-left transition-all duration-500",
                            i === step ? "bg-gradient-to-r from-primary to-primary/70" : i < step ? "bg-primary/40" : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium tabular-nums">{step + 1}/{totalSteps}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pb-6">
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="step-0" initial={stepTransition.initial} animate={stepTransition.animate} exit={stepTransition.exit} transition={{ duration: 0.35 }} className="space-y-5">
                      {/* Sleep Quality */}
                      <motion.div 
                        className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                            <Moon weight="duotone" className="w-5 h-5 text-indigo-400" />
                          </div>
                          <span className="font-medium text-foreground">Comment as-tu dormi ?</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <Slider value={[sleepQuality]} onValueChange={([v]) => setSleepQuality(v)} min={1} max={5} step={1} className="flex-1" />
                          <motion.div
                            key={sleepQuality}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className={cn("w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg", sleepBgs[sleepQuality - 1], sleepColors[sleepQuality - 1])}
                          >
                            {sleepQuality}
                          </motion.div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground/70 px-1">
                          <span>Très mal</span>
                          <span>Très bien</span>
                        </div>
                      </motion.div>

                      {/* Energy Level */}
                      <motion.div 
                        className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20">
                            <Lightning weight="duotone" className="w-5 h-5 text-amber-400" />
                          </div>
                          <span className="font-medium text-foreground">Ton niveau d'énergie ?</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <Slider value={[energyLevel]} onValueChange={([v]) => setEnergyLevel(v)} min={1} max={5} step={1} className="flex-1" />
                          <motion.div
                            key={energyLevel}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className={cn("w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg", energyBgs[energyLevel - 1], energyColors[energyLevel - 1])}
                          >
                            {energyLevel}
                          </motion.div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground/70 px-1">
                          <span>Épuisé</span>
                          <span>En forme</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div key="step-1" initial={stepTransition.initial} animate={stepTransition.animate} exit={stepTransition.exit} transition={{ duration: 0.35 }} className="space-y-5">
                      {/* Stress Level */}
                      <motion.div 
                        className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center border border-rose-500/20">
                            <Brain weight="duotone" className="w-5 h-5 text-rose-400" />
                          </div>
                          <span className="font-medium text-foreground">Ton niveau de stress ?</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <Slider value={[stressLevel]} onValueChange={([v]) => setStressLevel(v)} min={1} max={5} step={1} className="flex-1" />
                          <motion.div
                            key={stressLevel}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className={cn("w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg", stressBgs[stressLevel - 1], stressColors[stressLevel - 1])}
                          >
                            {stressLevel}
                          </motion.div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground/70 px-1">
                          <span>Zen</span>
                          <span>Très stressé</span>
                        </div>
                      </motion.div>

                      {/* Mood */}
                      <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center border border-cyan-500/20">
                            <Sun weight="duotone" className="w-5 h-5 text-cyan-400" />
                          </div>
                          <span className="font-medium text-foreground">Comment te sens-tu ?</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {moods.map((m, index) => (
                            <motion.button
                              key={m.value}
                              onClick={() => setMood(m.value)}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.25 + index * 0.05 }}
                              whileTap={{ scale: 0.92 }}
                              whileHover={{ scale: 1.05, y: -2 }}
                              className={cn(
                                "relative flex flex-col items-center gap-2 py-4 px-2 rounded-2xl text-sm transition-all duration-300",
                                mood === m.value
                                  ? cn("border-2 border-primary shadow-lg shadow-primary/20", m.bg)
                                  : "bg-muted/40 border-2 border-transparent hover:border-primary/30 hover:bg-muted/60"
                              )}
                            >
                              <div className={cn("transition-colors duration-200", mood === m.value ? m.color : "text-muted-foreground")}>
                                {m.icon}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium">{m.label}</span>
                              {mood === m.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg"
                                >
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                </motion.div>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {step === 2 && supplementsToAsk.length > 0 && (
                    <motion.div key="step-2" initial={stepTransition.initial} animate={stepTransition.animate} exit={stepTransition.exit} transition={{ duration: 0.35 }} className="space-y-5">
                      <motion.p 
                        className="text-sm text-muted-foreground text-center bg-muted/30 p-4 rounded-xl border border-border/40"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        Ressentez-vous des effets de vos compléments ?
                      </motion.p>
                      
                      {supplementsToAsk.slice(0, 3).map((supplement, index) => (
                        <motion.div 
                          key={supplement.id} 
                          className="space-y-3 p-5 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                        >
                          <p className="font-medium text-foreground">{supplement.product_name}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {feedbackOptions.map((effect) => (
                              <motion.button
                                key={effect.value}
                                onClick={() => handleSupplementFeedback(supplement.id, effect.value)}
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.02 }}
                                className={cn(
                                  "relative flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-sm transition-all duration-300",
                                  supplementFeedback[supplement.id] === effect.value
                                    ? cn("border-2 border-primary", effect.bg)
                                    : "bg-background/50 border-2 border-transparent hover:border-primary/30"
                                )}
                              >
                                <div className={cn("transition-colors", supplementFeedback[supplement.id] === effect.value ? effect.color : "text-muted-foreground")}>
                                  {effect.icon}
                                </div>
                                <span className="text-xs font-medium">{effect.label}</span>
                                {supplementFeedback[supplement.id] === effect.value && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                                  >
                                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                  </motion.div>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 pt-4 border-t border-border/30 bg-gradient-to-t from-muted/10 to-transparent flex gap-3">
                <Button
                  variant="outline"
                  onClick={dismissCheckin}
                  className="flex-1 rounded-xl h-12 border-border/60 bg-transparent hover:bg-muted/50 text-muted-foreground font-medium"
                >
                  Plus tard
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl h-12 bg-gradient-to-r from-primary via-primary to-primary/90 hover:opacity-90 shadow-lg shadow-primary/25 font-medium"
                >
                  {isSubmitting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Sun weight="duotone" className="w-4 h-4" />
                    </motion.div>
                  ) : step === totalSteps - 1 ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Terminer
                    </>
                  ) : (
                    "Suivant"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
