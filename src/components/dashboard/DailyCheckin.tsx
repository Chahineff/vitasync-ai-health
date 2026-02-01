import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, Moon, Battery, Brain, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useDailyCheckin } from "@/hooks/useDailyCheckin";
import { useSupplementTracking } from "@/hooks/useSupplementTracking";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DailyCheckinProps {
  onComplete?: () => void;
}

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

  // Pre-fill values if editing existing check-in
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

  // Get supplements taken for at least 7 days
  const supplementsToAsk = supplements.filter((s) => {
    if (!s.active) return false;
    const createdAt = new Date(s.created_at);
    const daysSince = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 7;
  });

  const totalSteps = supplementsToAsk.length > 0 ? 3 : 2;

  const moods = [
    { value: "great", label: "Super", emoji: "😄" },
    { value: "good", label: "Bien", emoji: "😊" },
    { value: "okay", label: "Bof", emoji: "😐" },
    { value: "bad", label: "Pas top", emoji: "😔" },
    { value: "terrible", label: "Difficile", emoji: "😫" },
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
    } else {
      toast.success("Check-in enregistré !", {
        description: "Merci pour votre suivi quotidien",
      });
      onComplete?.();
    }
    
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSupplementFeedback = (supplementId: string, effect: string) => {
    setSupplementFeedback((prev) => ({
      ...prev,
      [supplementId]: effect,
    }));
  };

  if (!showCheckinModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="glass-card-premium rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-border/50"
        >
          {/* Header with gradient background */}
          <div className="relative p-6 border-b border-border/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-foreground">
                  Comment ça va aujourd'hui ?
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/50" : "w-3 bg-muted"
                        )}
                        layoutId={`step-${i}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    Étape {step + 1}/{totalSteps}
                  </span>
                </div>
              </div>
              <button
                onClick={dismissCheckin}
                className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors glass-card"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Sleep Quality */}
                  <div className="space-y-4 p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Moon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">Comment as-tu dormi ?</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[sleepQuality]}
                        onValueChange={([v]) => setSleepQuality(v)}
                        min={1}
                        max={5}
                        step={1}
                        className="flex-1"
                      />
                      <motion.span 
                        key={sleepQuality}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-3xl"
                      >
                        {["😫", "😕", "😐", "😊", "😴"][sleepQuality - 1]}
                      </motion.span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Très mal</span>
                      <span>Très bien</span>
                    </div>
                  </div>

                  {/* Energy Level */}
                  <div className="space-y-4 p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <Battery className="w-5 h-5 text-secondary" />
                      </div>
                      <span className="font-medium text-foreground">Ton niveau d'énergie ?</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[energyLevel]}
                        onValueChange={([v]) => setEnergyLevel(v)}
                        min={1}
                        max={5}
                        step={1}
                        className="flex-1"
                      />
                      <motion.span 
                        key={energyLevel}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-3xl"
                      >
                        {["🔋", "🪫", "⚡", "💪", "🚀"][energyLevel - 1]}
                      </motion.span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Épuisé</span>
                      <span>En forme</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Stress Level */}
                  <div className="space-y-4 p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-accent" />
                      </div>
                      <span className="font-medium text-foreground">Ton niveau de stress ?</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[stressLevel]}
                        onValueChange={([v]) => setStressLevel(v)}
                        min={1}
                        max={5}
                        step={1}
                        className="flex-1"
                      />
                      <motion.span 
                        key={stressLevel}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-3xl"
                      >
                        {["😌", "🙂", "😐", "😰", "🤯"][stressLevel - 1]}
                      </motion.span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Zen</span>
                      <span>Très stressé</span>
                    </div>
                  </div>

                  {/* Mood */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Sun className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">Comment te sens-tu globalement ?</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {moods.map((m) => (
                        <motion.button
                          key={m.value}
                          onClick={() => setMood(m.value)}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.05 }}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl text-sm transition-all duration-200 border-2",
                            mood === m.value
                              ? "bg-primary/10 border-primary shadow-lg shadow-primary/20"
                              : "bg-muted/30 border-transparent hover:border-primary/30 hover:bg-muted/50"
                          )}
                        >
                          <span className="text-2xl">{m.emoji}</span>
                          <span className="text-xs text-muted-foreground">{m.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && supplementsToAsk.length > 0 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <p className="text-sm text-muted-foreground text-center bg-muted/30 p-3 rounded-xl border border-border/30">
                    Ressentez-vous des effets de vos compléments ?
                  </p>
                  
                  {supplementsToAsk.slice(0, 3).map((supplement, index) => (
                    <motion.div 
                      key={supplement.id} 
                      className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <p className="font-medium text-foreground">{supplement.product_name}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "positive", label: "Positif", emoji: "👍" },
                          { value: "neutral", label: "Aucun", emoji: "😐" },
                          { value: "negative", label: "Négatif", emoji: "👎" },
                        ].map((effect) => (
                          <motion.button
                            key={effect.value}
                            onClick={() => handleSupplementFeedback(supplement.id, effect.value)}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-sm transition-all duration-200 border-2",
                              supplementFeedback[supplement.id] === effect.value
                                ? "bg-primary/10 border-primary"
                                : "bg-background/50 border-transparent hover:border-primary/30"
                            )}
                          >
                            <span className="text-xl">{effect.emoji}</span>
                            <span className="text-xs">{effect.label}</span>
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
          <div className="p-6 border-t border-border/30 bg-gradient-to-t from-muted/20 to-transparent flex gap-3">
            <Button
              variant="outline"
              onClick={dismissCheckin}
              className="flex-1 rounded-xl h-12 border-border/50 hover:bg-muted/50"
            >
              Plus tard
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 rounded-xl h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sun className="w-4 h-4" />
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
    </AnimatePresence>
  );
}
