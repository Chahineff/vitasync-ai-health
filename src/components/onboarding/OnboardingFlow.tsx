import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHealthProfile, HealthProfile } from "@/hooks/useHealthProfile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { CountrySelect, Country } from "./CountrySelect";
import { SliderQuestion } from "./SliderQuestion";
import { BudgetSlider } from "./BudgetSlider";
import { cn } from "@/lib/utils";

type QuestionType = "yesno" | "country" | "multi" | "single" | "single-bonus" | "slider-single" | "dual-slider" | "multi-doses" | "budget" | "optional-text";

interface OnboardingQuestion {
  id: string;
  title: string;
  subtitle: string;
  type: QuestionType;
  options?: { value: string; label: string; emoji?: string }[];
  bonusField?: { id: string; label: string; options: { value: string; label: string }[] };
  sliders?: { id: string; label: string; leftLabel: string; rightLabel: string }[];
  maxSelections?: number;
  required?: boolean;
}

const questions: OnboardingQuestion[] = [
  {
    id: "is_adult",
    title: "As-tu 18 ans ou plus ?",
    subtitle: "Cette information est nécessaire pour te proposer des recommandations adaptées",
    type: "yesno",
    required: true,
  },
  {
    id: "shipping_country",
    title: "Où souhaites-tu être livré ?",
    subtitle: "Pour afficher le bon catalogue et les délais de livraison",
    type: "country",
    required: true,
  },
  {
    id: "health_goals",
    title: "Quels résultats veux-tu améliorer en priorité ?",
    subtitle: "Choisis jusqu'à 3 objectifs",
    type: "multi",
    maxSelections: 3,
    options: [
      { value: "sleep", label: "Sommeil", emoji: "😴" },
      { value: "energy", label: "Énergie", emoji: "⚡" },
      { value: "focus", label: "Focus", emoji: "🎯" },
      { value: "stress", label: "Stress", emoji: "🧘" },
      { value: "sport", label: "Performance sport", emoji: "🏋️" },
      { value: "muscle", label: "Prise de muscle", emoji: "💪" },
      { value: "weight_loss", label: "Perte de poids", emoji: "🏃" },
      { value: "digestion", label: "Digestion", emoji: "🍃" },
      { value: "immunity", label: "Immunité", emoji: "🛡️" },
      { value: "skin_hair", label: "Peau/cheveux", emoji: "✨" },
      { value: "other", label: "Autre", emoji: "💭" },
    ],
    required: true,
  },
  {
    id: "activity_level",
    title: "À quelle fréquence fais-tu du sport ?",
    subtitle: "Cela nous aide à adapter tes recommandations",
    type: "single-bonus",
    options: [
      { value: "0-1", label: "0-1x/semaine", emoji: "🚶" },
      { value: "2-3", label: "2-3x/semaine", emoji: "🏃" },
      { value: "4-5", label: "4-5x/semaine", emoji: "🏋️" },
      { value: "6+", label: "6x+/semaine", emoji: "🔥" },
    ],
    bonusField: {
      id: "sport_types",
      label: "Quel type de sport ?",
      options: [
        { value: "muscu", label: "Musculation" },
        { value: "cardio", label: "Cardio" },
        { value: "team", label: "Sports co" },
        { value: "endurance", label: "Endurance" },
        { value: "mix", label: "Mix" },
      ],
    },
    required: true,
  },
  {
    id: "sleep",
    title: "En moyenne, tu dors…",
    subtitle: "Le sommeil est la base de la santé",
    type: "slider-single",
    options: [
      { value: "<6h", label: "Moins de 6h", emoji: "😫" },
      { value: "6-7h", label: "6-7h", emoji: "😕" },
      { value: "7-8h", label: "7-8h", emoji: "😊" },
      { value: ">8h", label: "Plus de 8h", emoji: "😴" },
    ],
    sliders: [
      { id: "sleep_quality_score", label: "Qualité du sommeil", leftLabel: "Mauvaise", rightLabel: "Excellente" },
    ],
    required: true,
  },
  {
    id: "energy_stress",
    title: "Cette dernière semaine, tu te sens plutôt…",
    subtitle: "Évalue ton niveau d'énergie et de stress",
    type: "dual-slider",
    sliders: [
      { id: "energy_level", label: "Énergie", leftLabel: "Faible", rightLabel: "Élevée" },
      { id: "stress_level", label: "Stress", leftLabel: "Faible", rightLabel: "Élevé" },
    ],
    required: true,
  },
  {
    id: "diet_type",
    title: "Ton style alimentaire est plutôt…",
    subtitle: "Cela influence les compléments recommandés",
    type: "single",
    options: [
      { value: "omnivore", label: "Omnivore", emoji: "🍖" },
      { value: "vegetarian", label: "Végétarien", emoji: "🥗" },
      { value: "vegan", label: "Vegan", emoji: "🌱" },
      { value: "halal", label: "Halal", emoji: "🌙" },
      { value: "keto", label: "Keto/low-carb", emoji: "🥑" },
      { value: "gluten_free", label: "Sans gluten", emoji: "🌾" },
      { value: "lactose_free", label: "Sans lactose", emoji: "🥛" },
      { value: "unknown", label: "Je ne sais pas", emoji: "🤷" },
    ],
    required: true,
  },
  {
    id: "allergies",
    title: "As-tu des allergies ou intolérances ?",
    subtitle: "Important pour éviter les mauvaises recommandations",
    type: "multi",
    options: [
      { value: "lactose", label: "Lactose", emoji: "🥛" },
      { value: "gluten", label: "Gluten", emoji: "🌾" },
      { value: "egg", label: "Œuf", emoji: "🥚" },
      { value: "soy", label: "Soja", emoji: "🫘" },
      { value: "fish", label: "Poisson", emoji: "🐟" },
      { value: "nuts", label: "Fruits à coque", emoji: "🥜" },
      { value: "none", label: "Aucune", emoji: "✅" },
      { value: "prefer_not_say", label: "Je préfère ne pas répondre", emoji: "🔒" },
    ],
    required: false,
  },
  {
    id: "preferred_forms",
    title: "Tu préfères prendre tes compléments sous quelle forme ?",
    subtitle: "Sélectionne tes préférences",
    type: "multi-doses",
    options: [
      { value: "capsules", label: "Gélules", emoji: "💊" },
      { value: "powder", label: "Poudre", emoji: "🥤" },
      { value: "gummies", label: "Gummies", emoji: "🍬" },
      { value: "liquid", label: "Liquide", emoji: "💧" },
      { value: "any", label: "Peu importe", emoji: "🤷" },
    ],
    bonusField: {
      id: "max_daily_intakes",
      label: "Nombre de prises/jour acceptable",
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3+", label: "3+" },
      ],
    },
    required: true,
  },
  {
    id: "monthly_budget",
    title: "Quel budget mensuel veux-tu viser pour ton stack ?",
    subtitle: "On s'adapte à tes moyens",
    type: "budget",
    required: true,
  },
  {
    id: "medications_notes",
    title: "Plus de précision ?",
    subtitle: "Prends-tu des médicaments ou as-tu une condition à connaître pour éviter des incompatibilités ?",
    type: "optional-text",
    required: false,
  },
];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const { healthProfile, completeOnboarding } = useHealthProfile();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showMinorWarning, setShowMinorWarning] = useState(false);

  // Pre-fill answers in edit mode
  useEffect(() => {
    if (isEditMode && healthProfile) {
      const prefilled: Record<string, any> = {};
      if (healthProfile.is_adult !== null) prefilled.is_adult = healthProfile.is_adult ? "yes" : "no";
      if (healthProfile.shipping_country) prefilled.shipping_country = healthProfile.shipping_country;
      if (healthProfile.health_goals?.length) prefilled.health_goals = healthProfile.health_goals;
      if (healthProfile.activity_level) prefilled.activity_level = healthProfile.activity_level;
      if (healthProfile.sport_types?.length) prefilled.sport_types = healthProfile.sport_types;
      if (healthProfile.sleep_hours) prefilled.sleep_hours = healthProfile.sleep_hours;
      if (healthProfile.sleep_quality_score) prefilled.sleep_quality_score = healthProfile.sleep_quality_score;
      if (healthProfile.energy_level) prefilled.energy_level = healthProfile.energy_level;
      if (healthProfile.stress_level) prefilled.stress_level = healthProfile.stress_level;
      if (healthProfile.diet_type) prefilled.diet_type = healthProfile.diet_type;
      if (healthProfile.allergies?.length) prefilled.allergies = healthProfile.allergies;
      if (healthProfile.preferred_forms?.length) prefilled.preferred_forms = healthProfile.preferred_forms;
      if (healthProfile.max_daily_intakes) prefilled.max_daily_intakes = healthProfile.max_daily_intakes;
      if (healthProfile.monthly_budget) prefilled.monthly_budget = healthProfile.monthly_budget;
      if (healthProfile.budget_range_min && healthProfile.budget_range_max) {
        prefilled.budget_range = { min: healthProfile.budget_range_min, max: healthProfile.budget_range_max };
      }
      if (healthProfile.medications_notes) prefilled.medications_notes = healthProfile.medications_notes;
      setAnswers(prefilled);
    }
  }, [isEditMode, healthProfile]);

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleSelect = (value: string) => {
    const q = question;
    
    if (q.type === "yesno") {
      setAnswers({ ...answers, [q.id]: value });
      if (value === "no") {
        setShowMinorWarning(true);
      } else {
        setShowMinorWarning(false);
      }
      return;
    }
    
    if (q.type === "multi" || q.type === "multi-doses") {
      const current = Array.isArray(answers[q.id]) ? answers[q.id] : [];
      
      // Handle "none" or "prefer_not_say" exclusive selections
      if (value === "none" || value === "prefer_not_say" || value === "any") {
        setAnswers({ ...answers, [q.id]: [value] });
        return;
      }
      
      // Remove exclusive options if selecting something else
      const filtered = current.filter((v: string) => v !== "none" && v !== "prefer_not_say" && v !== "any");
      
      if (filtered.includes(value)) {
        setAnswers({ ...answers, [q.id]: filtered.filter((v: string) => v !== value) });
      } else {
        // Check max selections
        if (q.maxSelections && filtered.length >= q.maxSelections) {
          toast.error(`Maximum ${q.maxSelections} choix`);
          return;
        }
        setAnswers({ ...answers, [q.id]: [...filtered, value] });
      }
      return;
    }
    
    if (q.type === "single" || q.type === "single-bonus" || q.type === "slider-single") {
      setAnswers({ ...answers, [q.id]: value });
      return;
    }
  };

  const handleBonusSelect = (fieldId: string, value: string) => {
    const current = Array.isArray(answers[fieldId]) ? answers[fieldId] : [];
    if (current.includes(value)) {
      setAnswers({ ...answers, [fieldId]: current.filter((v: string) => v !== value) });
    } else {
      setAnswers({ ...answers, [fieldId]: [...current, value] });
    }
  };

  const handleSliderChange = (sliderId: string, value: number) => {
    setAnswers({ ...answers, [sliderId]: value });
  };

  const handleCountryChange = (code: string, country: Country) => {
    setSelectedCountry(country);
    setAnswers({ ...answers, shipping_country: code });
  };

  const handleBudgetPresetChange = (preset: string) => {
    setAnswers({ ...answers, monthly_budget: preset });
  };

  const handleBudgetRangeChange = (range: { min: number; max: number }) => {
    setAnswers({ ...answers, budget_range: range });
  };

  const handleTextChange = (value: string) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const isOptionSelected = (value: string) => {
    const answer = answers[question.id];
    if (Array.isArray(answer)) {
      return answer.includes(value);
    }
    return answer === value;
  };

  const canProceed = () => {
    const q = question;
    
    if (!q.required) return true;
    
    if (q.type === "yesno") {
      return answers[q.id] === "yes" || answers[q.id] === "no";
    }
    
    if (q.type === "country") {
      return !!answers.shipping_country;
    }
    
    if (q.type === "multi" || q.type === "multi-doses") {
      const arr = answers[q.id];
      return Array.isArray(arr) && arr.length > 0;
    }
    
    if (q.type === "single" || q.type === "single-bonus" || q.type === "slider-single") {
      return !!answers[q.id];
    }
    
    if (q.type === "dual-slider") {
      return q.sliders?.every((s) => answers[s.id] !== undefined) ?? false;
    }
    
    if (q.type === "budget") {
      return !!answers.monthly_budget || !!answers.budget_range;
    }
    
    return true;
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit onboarding
      setIsSubmitting(true);
      try {
        const formattedAnswers: Partial<HealthProfile> = {
          is_adult: answers.is_adult === "yes",
          shipping_country: answers.shipping_country,
          health_goals: answers.health_goals || [],
          activity_level: answers.activity_level,
          sport_types: answers.sport_types || [],
          sleep_hours: answers.sleep_hours,
          sleep_quality_score: answers.sleep_quality_score,
          energy_level: answers.energy_level,
          stress_level: answers.stress_level === 1 ? "low" : answers.stress_level === 2 ? "moderate" : answers.stress_level === 3 ? "moderate" : answers.stress_level === 4 ? "high" : answers.stress_level === 5 ? "very_high" : null,
          diet_type: answers.diet_type,
          allergies: answers.allergies || [],
          preferred_forms: answers.preferred_forms || [],
          max_daily_intakes: answers.max_daily_intakes,
          monthly_budget: answers.monthly_budget,
          budget_range_min: answers.budget_range?.min,
          budget_range_max: answers.budget_range?.max,
          medications_notes: answers.medications_notes,
        };

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
      setShowMinorWarning(false);
    }
  };

  const handleSkip = () => {
    if (isEditMode) {
      navigate("/dashboard");
    } else if (question.required === false) {
      handleNext();
    }
  };

  const renderQuestion = () => {
    const q = question;

    // Yes/No (Age verification)
    if (q.type === "yesno") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "yes", label: "Oui, j'ai 18 ans ou plus", emoji: "✅" },
              { value: "no", label: "Non, j'ai moins de 18 ans", emoji: "🔞" },
            ].map((opt) => (
              <motion.button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-6 rounded-2xl border text-center transition-all",
                  answers[q.id] === opt.value
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
                )}
              >
                <span className="text-3xl mb-3 block">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </motion.button>
            ))}
          </div>
          
          {showMinorWarning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30"
            >
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                VitaSync peut proposer du contenu bien-être, mais pas de recommandations de compléments ni d'achat sans consentement parental.
              </p>
            </motion.div>
          )}
        </div>
      );
    }

    // Country selection
    if (q.type === "country") {
      return (
        <CountrySelect
          value={answers.shipping_country}
          onChange={handleCountryChange}
        />
      );
    }

    // Multi-select
    if (q.type === "multi") {
      return (
        <div className="space-y-4">
          {q.maxSelections && (
            <p className="text-xs text-muted-foreground text-center">
              {(answers[q.id] || []).length}/{q.maxSelections} sélectionnés
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {q.options?.map((opt) => (
              <motion.button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all",
                  isOptionSelected(opt.value)
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
                )}
              >
                <span className="text-2xl mb-2 block">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      );
    }

    // Single select
    if (q.type === "single") {
      return (
        <div className="grid grid-cols-2 gap-3">
          {q.options?.map((opt) => (
            <motion.button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all",
                isOptionSelected(opt.value)
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
              )}
            >
              <span className="text-2xl mb-2 block">{opt.emoji}</span>
              <span className="text-sm font-medium">{opt.label}</span>
            </motion.button>
          ))}
        </div>
      );
    }

    // Single with bonus field (activity + sport type)
    if (q.type === "single-bonus") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {q.options?.map((opt) => (
              <motion.button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all",
                  isOptionSelected(opt.value)
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
                )}
              >
                <span className="text-2xl mb-2 block">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </motion.button>
            ))}
          </div>
          
          {q.bonusField && answers[q.id] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground">{q.bonusField.label}</p>
              <div className="flex flex-wrap gap-2">
                {q.bonusField.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleBonusSelect(q.bonusField!.id, opt.value)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm transition-all",
                      (answers[q.bonusField!.id] || []).includes(opt.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border hover:border-primary/50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      );
    }

    // Single select with slider (sleep)
    if (q.type === "slider-single") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {q.options?.map((opt) => (
              <motion.button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all",
                  isOptionSelected(opt.value)
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
                )}
              >
                <span className="text-2xl mb-2 block">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </motion.button>
            ))}
          </div>
          
          {q.sliders?.map((slider) => (
            <div key={slider.id} className="p-4 rounded-xl bg-card/30 border border-border/50">
              <SliderQuestion
                label={slider.label}
                value={answers[slider.id] || 3}
                onChange={(v) => handleSliderChange(slider.id, v)}
                labels={{ left: slider.leftLabel, right: slider.rightLabel }}
              />
            </div>
          ))}
        </div>
      );
    }

    // Dual sliders (energy + stress)
    if (q.type === "dual-slider") {
      return (
        <div className="space-y-6">
          {q.sliders?.map((slider) => (
            <div key={slider.id} className="p-4 rounded-xl bg-card/30 border border-border/50">
              <SliderQuestion
                label={slider.label}
                value={answers[slider.id] || 3}
                onChange={(v) => handleSliderChange(slider.id, v)}
                labels={{ left: slider.leftLabel, right: slider.rightLabel }}
              />
            </div>
          ))}
        </div>
      );
    }

    // Multi select with doses (preferred forms)
    if (q.type === "multi-doses") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {q.options?.map((opt) => (
              <motion.button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all",
                  isOptionSelected(opt.value)
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
                )}
              >
                <span className="text-2xl mb-2 block">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </motion.button>
            ))}
          </div>
          
          {q.bonusField && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{q.bonusField.label}</p>
              <div className="flex gap-3">
                {q.bonusField.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers({ ...answers, [q.bonusField!.id]: opt.value })}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      answers[q.bonusField!.id] === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border hover:border-primary/50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Budget
    if (q.type === "budget") {
      const currency = selectedCountry?.currency || "EUR";
      return (
        <BudgetSlider
          currency={currency}
          selectedPreset={answers.monthly_budget}
          customRange={answers.budget_range}
          onPresetChange={handleBudgetPresetChange}
          onCustomRangeChange={handleBudgetRangeChange}
        />
      );
    }

    // Optional text (medications)
    if (q.type === "optional-text") {
      return (
        <div className="space-y-4">
          <textarea
            value={answers[q.id] || ""}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Ex: Je prends des anticoagulants, j'ai une hypothyroïdie..."
            className="w-full h-32 p-4 rounded-xl bg-card/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <button
            onClick={() => setAnswers({ ...answers, [q.id]: "" })}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            🔒 Je préfère ne pas répondre
          </button>
        </div>
      );
    }

    return null;
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
            {isEditMode ? "Annuler" : question.required === false ? "Passer" : ""}
          </button>
        </div>
        <Progress value={progress} className="h-1" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {currentStep + 1} / {questions.length}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-auto"
          >
            <div className="mb-6">
              <h1 className="text-2xl font-light text-foreground mb-2">
                {question.title}
              </h1>
              <p className="text-muted-foreground font-light">
                {question.subtitle}
              </p>
            </div>

            <div className="flex-1 overflow-auto pb-4">
              {renderQuestion()}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border/30">
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
