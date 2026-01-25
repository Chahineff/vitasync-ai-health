import { useState } from "react";
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
  const { showCheckinModal, submitCheckin, dismissCheckin } = useDailyCheckin();
  const { supplements } = useSupplementTracking();
  
  const [step, setStep] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [mood, setMood] = useState<string | null>(null);
  const [supplementFeedback, setSupplementFeedback] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-foreground">
                Comment ça va aujourd'hui ?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {step + 1}/{totalSteps} - Suivi quotidien
              </p>
            </div>
            <button
              onClick={dismissCheckin}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Sleep Quality */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-primary" />
                      <span className="font-medium">Comment as-tu dormi ?</span>
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
                      <span className="text-2xl">
                        {["😫", "😕", "😐", "😊", "😴"][sleepQuality - 1]}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Très mal</span>
                      <span>Très bien</span>
                    </div>
                  </div>

                  {/* Energy Level */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Battery className="w-5 h-5 text-primary" />
                      <span className="font-medium">Ton niveau d'énergie ?</span>
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
                      <span className="text-2xl">
                        {["🔋", "🪫", "⚡", "💪", "🚀"][energyLevel - 1]}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Épuisé</span>
                      <span>En forme</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Stress Level */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <span className="font-medium">Ton niveau de stress ?</span>
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
                      <span className="text-2xl">
                        {["😌", "🙂", "😐", "😰", "🤯"][stressLevel - 1]}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Zen</span>
                      <span>Très stressé</span>
                    </div>
                  </div>

                  {/* Mood */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-primary" />
                      <span className="font-medium">Comment te sens-tu globalement ?</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {moods.map((m) => (
                        <button
                          key={m.value}
                          onClick={() => setMood(m.value)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2",
                            mood === m.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          <span>{m.emoji}</span>
                          <span>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && supplementsToAsk.length > 0 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <p className="text-sm text-muted-foreground">
                    Ressentez-vous des effets de vos compléments ?
                  </p>
                  
                  {supplementsToAsk.slice(0, 3).map((supplement) => (
                    <div key={supplement.id} className="space-y-3">
                      <p className="font-medium">{supplement.product_name}</p>
                      <div className="flex gap-2">
                        {[
                          { value: "positive", label: "Positif", emoji: "👍" },
                          { value: "neutral", label: "Aucun", emoji: "😐" },
                          { value: "negative", label: "Négatif", emoji: "👎" },
                        ].map((effect) => (
                          <button
                            key={effect.value}
                            onClick={() => handleSupplementFeedback(supplement.id, effect.value)}
                            className={cn(
                              "flex-1 px-3 py-2 rounded-xl text-sm transition-all flex flex-col items-center gap-1",
                              supplementFeedback[supplement.id] === effect.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            )}
                          >
                            <span>{effect.emoji}</span>
                            <span>{effect.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex gap-3">
            <Button
              variant="outline"
              onClick={dismissCheckin}
              className="flex-1"
            >
              Plus tard
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1"
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
