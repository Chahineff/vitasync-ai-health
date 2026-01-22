import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useHealthProfile, HealthProfile } from "@/hooks/useHealthProfile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface OnboardingQuestion {
  id: keyof Partial<HealthProfile>;
  title: string;
  subtitle: string;
  type: "single" | "multi";
  options: { value: string; label: string; emoji?: string }[];
}

const questions: OnboardingQuestion[] = [
  {
    id: "health_goals",
    title: "Quels sont vos objectifs santé ?",
    subtitle: "Sélectionnez tous ceux qui vous concernent",
    type: "multi",
    options: [
      { value: "energy", label: "Plus d'énergie", emoji: "⚡" },
      { value: "sleep", label: "Meilleur sommeil", emoji: "😴" },
      { value: "muscle", label: "Développer mes muscles", emoji: "💪" },
      { value: "weight_loss", label: "Perte de poids", emoji: "🏃" },
      { value: "immunity", label: "Renforcer l'immunité", emoji: "🛡️" },
      { value: "focus", label: "Concentration", emoji: "🧠" },
      { value: "stress", label: "Réduire le stress", emoji: "🧘" },
      { value: "skin", label: "Belle peau", emoji: "✨" },
    ],
  },
  {
    id: "current_issues",
    title: "Quels problèmes rencontrez-vous ?",
    subtitle: "Cela nous aidera à personnaliser vos recommandations",
    type: "multi",
    options: [
      { value: "fatigue", label: "Fatigue chronique", emoji: "😓" },
      { value: "insomnia", label: "Troubles du sommeil", emoji: "🌙" },
      { value: "digestion", label: "Problèmes digestifs", emoji: "🤢" },
      { value: "anxiety", label: "Anxiété", emoji: "😰" },
      { value: "joint_pain", label: "Douleurs articulaires", emoji: "🦴" },
      { value: "brain_fog", label: "Brouillard mental", emoji: "🌫️" },
      { value: "none", label: "Aucun problème particulier", emoji: "👍" },
    ],
  },
  {
    id: "activity_level",
    title: "Quel est votre niveau d'activité ?",
    subtitle: "Soyez honnête, c'est important pour les recommandations",
    type: "single",
    options: [
      { value: "sedentary", label: "Sédentaire", emoji: "🪑" },
      { value: "light", label: "Activité légère (1-2x/sem)", emoji: "🚶" },
      { value: "moderate", label: "Modéré (3-4x/sem)", emoji: "🏋️" },
      { value: "active", label: "Très actif (5+x/sem)", emoji: "🔥" },
    ],
  },
  {
    id: "diet_type",
    title: "Quel est votre régime alimentaire ?",
    subtitle: "Cela influence les compléments recommandés",
    type: "single",
    options: [
      { value: "omnivore", label: "Omnivore", emoji: "🍖" },
      { value: "vegetarian", label: "Végétarien", emoji: "🥗" },
      { value: "vegan", label: "Végétalien", emoji: "🌱" },
      { value: "keto", label: "Cétogène", emoji: "🥑" },
      { value: "other", label: "Autre", emoji: "🍽️" },
    ],
  },
  {
    id: "sleep_quality",
    title: "Comment qualifiez-vous votre sommeil ?",
    subtitle: "Le sommeil est la base de la santé",
    type: "single",
    options: [
      { value: "poor", label: "Mauvais", emoji: "😫" },
      { value: "average", label: "Moyen", emoji: "😐" },
      { value: "good", label: "Bon", emoji: "😊" },
      { value: "excellent", label: "Excellent", emoji: "😴" },
    ],
  },
  {
    id: "stress_level",
    title: "Quel est votre niveau de stress ?",
    subtitle: "Le stress chronique affecte votre santé",
    type: "single",
    options: [
      { value: "low", label: "Faible", emoji: "😌" },
      { value: "moderate", label: "Modéré", emoji: "😐" },
      { value: "high", label: "Élevé", emoji: "😰" },
      { value: "very_high", label: "Très élevé", emoji: "🤯" },
    ],
  },
  {
    id: "supplements_experience",
    title: "Votre expérience avec les compléments ?",
    subtitle: "Pas de jugement, on adapte nos conseils",
    type: "single",
    options: [
      { value: "never", label: "Jamais utilisé", emoji: "🆕" },
      { value: "beginner", label: "Débutant", emoji: "📚" },
      { value: "intermediate", label: "Intermédiaire", emoji: "💊" },
      { value: "expert", label: "Expert", emoji: "🧪" },
    ],
  },
  {
    id: "allergies",
    title: "Avez-vous des allergies ?",
    subtitle: "Important pour éviter les mauvaises recommandations",
    type: "multi",
    options: [
      { value: "lactose", label: "Lactose", emoji: "🥛" },
      { value: "gluten", label: "Gluten", emoji: "🌾" },
      { value: "nuts", label: "Fruits à coque", emoji: "🥜" },
      { value: "soy", label: "Soja", emoji: "🫘" },
      { value: "shellfish", label: "Crustacés", emoji: "🦐" },
      { value: "none", label: "Aucune allergie", emoji: "✅" },
    ],
  },
  {
    id: "medical_conditions",
    title: "Conditions médicales particulières ?",
    subtitle: "Ces informations restent confidentielles",
    type: "multi",
    options: [
      { value: "diabetes", label: "Diabète", emoji: "💉" },
      { value: "hypertension", label: "Hypertension", emoji: "❤️" },
      { value: "thyroid", label: "Troubles thyroïdiens", emoji: "🦋" },
      { value: "heart", label: "Problèmes cardiaques", emoji: "💓" },
      { value: "none", label: "Aucune condition", emoji: "✅" },
    ],
  },
  {
    id: "age_range",
    title: "Quelle est votre tranche d'âge ?",
    subtitle: "Les besoins varient selon l'âge",
    type: "single",
    options: [
      { value: "18-25", label: "18-25 ans", emoji: "🌱" },
      { value: "26-35", label: "26-35 ans", emoji: "🌿" },
      { value: "36-45", label: "36-45 ans", emoji: "🌳" },
      { value: "46-55", label: "46-55 ans", emoji: "🍂" },
      { value: "56+", label: "56+ ans", emoji: "🌺" },
    ],
  },
];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { completeOnboarding } = useHealthProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleSelect = (value: string) => {
    const currentAnswer = answers[question.id];

    if (question.type === "multi") {
      const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (currentArray.includes(value)) {
        setAnswers({
          ...answers,
          [question.id]: currentArray.filter((v) => v !== value),
        });
      } else {
        setAnswers({
          ...answers,
          [question.id]: [...currentArray, value],
        });
      }
    } else {
      setAnswers({
        ...answers,
        [question.id]: value,
      });
    }
  };

  const isOptionSelected = (value: string) => {
    const answer = answers[question.id];
    if (Array.isArray(answer)) {
      return answer.includes(value);
    }
    return answer === value;
  };

  const canProceed = () => {
    const answer = answers[question.id];
    if (question.type === "multi") {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit onboarding
      setIsSubmitting(true);
      try {
        const formattedAnswers: Partial<HealthProfile> = {};
        for (const q of questions) {
          const answer = answers[q.id];
          if (q.type === "multi") {
            (formattedAnswers as any)[q.id] = Array.isArray(answer) ? answer : [];
          } else {
            (formattedAnswers as any)[q.id] = answer || null;
          }
        }

        const { error } = await completeOnboarding(formattedAnswers);
        if (error) {
          toast.error("Erreur lors de la sauvegarde");
          return;
        }

        toast.success("Profil complété !", {
          description: "Votre Coach IA est maintenant personnalisé",
        });
        navigate("/dashboard");
      } catch (error) {
        console.error("Onboarding error:", error);
        toast.error("Une erreur est survenue");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Passer
          </button>
        </div>
        <Progress value={progress} className="h-1" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {currentStep + 1} / {questions.length}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-8">
              <h1 className="text-2xl font-light text-foreground mb-2">
                {question.title}
              </h1>
              <p className="text-muted-foreground font-light">
                {question.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 content-start">
              {question.options.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isOptionSelected(option.value)
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-6">
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="w-full h-14 rounded-2xl text-base font-medium"
            size="lg"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : currentStep === questions.length - 1 ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Terminer
              </>
            ) : (
              <>
                Continuer
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
