import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHealthProfile, HealthProfile } from "@/hooks/useHealthProfile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { CountrySelect, Country } from "./CountrySelect";
import { SportSelector, SelectedSport, allSports } from "./SportSelector";
import { SliderQuestion } from "./SliderQuestion";
import { BudgetSlider } from "./BudgetSlider";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./ProgressRing";
import { ProgressParticles } from "./ProgressParticles";
import { StepTimeline } from "./StepTimeline";
import {
  Moon, Lightning, Crosshair, Leaf, Barbell,
  PersonSimpleRun, ShieldCheck, Sparkle, DotsThree,
  PersonSimpleWalk, Flame, CookingPot, Avocado, Plant,
  GrainsSlash, Drop as DropIcon,
  Pill, Cookie, Drop,
  CheckCircle, XCircle, Lock,
  MoonStars, Egg, Fish, Nut,
} from "@phosphor-icons/react";

type QuestionType = "yesno" | "country" | "multi" | "single" | "single-bonus" | "slider-single" | "dual-slider" | "multi-doses" | "budget" | "optional-text" | "sport-builder";

interface OnboardingQuestion {
  id: string;
  title: string;
  subtitle: string;
  type: QuestionType;
  options?: { value: string; label: string; icon?: ReactNode; iconBg?: string }[];
  bonusField?: { id: string; label: string; options: { value: string; label: string }[] };
  sliders?: { id: string; label: string; leftLabel: string; rightLabel: string }[];
  maxSelections?: number;
  required?: boolean;
}

const iconCircle = (icon: ReactNode, bg: string) => (
  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
    {icon}
  </div>
);

const questions: OnboardingQuestion[] = [
  {
    id: "shipping_country",
    title: "Où souhaites-tu recevoir tes compléments ?",
    subtitle: "Nous livrons dans le monde entier. Sélectionne ton pays pour adapter le catalogue et les frais de livraison.",
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
      { value: "sleep", label: "Sommeil", icon: <Moon weight="duotone" className="w-5 h-5 text-indigo-400" />, iconBg: "bg-indigo-500/15 border border-indigo-500/20" },
      { value: "energy", label: "Énergie", icon: <Lightning weight="duotone" className="w-5 h-5 text-amber-400" />, iconBg: "bg-amber-500/15 border border-amber-500/20" },
      { value: "focus", label: "Focus", icon: <Crosshair weight="duotone" className="w-5 h-5 text-blue-400" />, iconBg: "bg-blue-500/15 border border-blue-500/20" },
      { value: "stress", label: "Stress", icon: <Leaf weight="duotone" className="w-5 h-5 text-green-400" />, iconBg: "bg-green-500/15 border border-green-500/20" },
      { value: "sport", label: "Performance sport", icon: <Barbell weight="duotone" className="w-5 h-5 text-orange-400" />, iconBg: "bg-orange-500/15 border border-orange-500/20" },
      { value: "muscle", label: "Prise de muscle", icon: <Barbell weight="duotone" className="w-5 h-5 text-red-400" />, iconBg: "bg-red-500/15 border border-red-500/20" },
      { value: "weight_loss", label: "Perte de poids", icon: <PersonSimpleRun weight="duotone" className="w-5 h-5 text-teal-400" />, iconBg: "bg-teal-500/15 border border-teal-500/20" },
      { value: "digestion", label: "Digestion", icon: <Leaf weight="duotone" className="w-5 h-5 text-emerald-400" />, iconBg: "bg-emerald-500/15 border border-emerald-500/20" },
      { value: "immunity", label: "Immunité", icon: <ShieldCheck weight="duotone" className="w-5 h-5 text-violet-400" />, iconBg: "bg-violet-500/15 border border-violet-500/20" },
      { value: "skin_hair", label: "Peau/cheveux", icon: <Sparkle weight="duotone" className="w-5 h-5 text-pink-400" />, iconBg: "bg-pink-500/15 border border-pink-500/20" },
      { value: "other", label: "Autre", icon: <DotsThree weight="duotone" className="w-5 h-5 text-muted-foreground" />, iconBg: "bg-muted/50 border border-border/50" },
    ],
    required: true,
  },
  {
    id: "activity_level",
    title: "Quels sports pratiques-tu ?",
    subtitle: "Ajoute chaque sport et précise ta fréquence hebdomadaire",
    type: "sport-builder",
    required: false,
  },
  {
    id: "sleep",
    title: "En moyenne, tu dors…",
    subtitle: "Le sommeil est la base de la santé",
    type: "slider-single",
    options: [
      { value: "<6h", label: "Moins de 6h", icon: <MoonStars weight="duotone" className="w-5 h-5 text-red-400" />, iconBg: "bg-red-500/15 border border-red-500/20" },
      { value: "6-7h", label: "6-7h", icon: <MoonStars weight="duotone" className="w-5 h-5 text-orange-400" />, iconBg: "bg-orange-500/15 border border-orange-500/20" },
      { value: "7-8h", label: "7-8h", icon: <MoonStars weight="duotone" className="w-5 h-5 text-green-400" />, iconBg: "bg-green-500/15 border border-green-500/20" },
      { value: ">8h", label: "Plus de 8h", icon: <MoonStars weight="duotone" className="w-5 h-5 text-indigo-400" />, iconBg: "bg-indigo-500/15 border border-indigo-500/20" },
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
      { value: "omnivore", label: "Omnivore", icon: <CookingPot weight="duotone" className="w-5 h-5 text-orange-400" />, iconBg: "bg-orange-500/15 border border-orange-500/20" },
      { value: "vegetarian", label: "Végétarien", icon: <Leaf weight="duotone" className="w-5 h-5 text-green-400" />, iconBg: "bg-green-500/15 border border-green-500/20" },
      { value: "vegan", label: "Vegan", icon: <Plant weight="duotone" className="w-5 h-5 text-emerald-400" />, iconBg: "bg-emerald-500/15 border border-emerald-500/20" },
      { value: "halal", label: "Halal", icon: <Moon weight="duotone" className="w-5 h-5 text-cyan-400" />, iconBg: "bg-cyan-500/15 border border-cyan-500/20" },
      { value: "keto", label: "Keto/low-carb", icon: <Avocado weight="duotone" className="w-5 h-5 text-lime-400" />, iconBg: "bg-lime-500/15 border border-lime-500/20" },
      { value: "gluten_free", label: "Sans gluten", icon: <GrainsSlash weight="duotone" className="w-5 h-5 text-amber-400" />, iconBg: "bg-amber-500/15 border border-amber-500/20" },
      { value: "lactose_free", label: "Sans lactose", icon: <DropIcon weight="duotone" className="w-5 h-5 text-blue-400" />, iconBg: "bg-blue-500/15 border border-blue-500/20" },
      { value: "unknown", label: "Je ne sais pas", icon: <DotsThree weight="duotone" className="w-5 h-5 text-muted-foreground" />, iconBg: "bg-muted/50 border border-border/50" },
    ],
    required: true,
  },
  {
    id: "allergies",
    title: "As-tu des allergies ou intolérances ?",
    subtitle: "Important pour éviter les mauvaises recommandations",
    type: "multi",
    options: [
      { value: "lactose", label: "Lactose", icon: <DropIcon weight="duotone" className="w-5 h-5 text-blue-400" />, iconBg: "bg-blue-500/15 border border-blue-500/20" },
      { value: "gluten", label: "Gluten", icon: <GrainsSlash weight="duotone" className="w-5 h-5 text-amber-400" />, iconBg: "bg-amber-500/15 border border-amber-500/20" },
      { value: "egg", label: "Œuf", icon: <Egg weight="duotone" className="w-5 h-5 text-yellow-400" />, iconBg: "bg-yellow-500/15 border border-yellow-500/20" },
      { value: "soy", label: "Soja", icon: <Plant weight="duotone" className="w-5 h-5 text-green-400" />, iconBg: "bg-green-500/15 border border-green-500/20" },
      { value: "fish", label: "Poisson", icon: <Fish weight="duotone" className="w-5 h-5 text-cyan-400" />, iconBg: "bg-cyan-500/15 border border-cyan-500/20" },
      { value: "nuts", label: "Fruits à coque", icon: <Nut weight="duotone" className="w-5 h-5 text-amber-600" />, iconBg: "bg-amber-600/15 border border-amber-600/20" },
      { value: "none", label: "Aucune", icon: <CheckCircle weight="duotone" className="w-5 h-5 text-green-400" />, iconBg: "bg-green-500/15 border border-green-500/20" },
      { value: "prefer_not_say", label: "Je préfère ne pas répondre", icon: <Lock weight="duotone" className="w-5 h-5 text-muted-foreground" />, iconBg: "bg-muted/50 border border-border/50" },
    ],
    required: false,
  },
  {
    id: "preferred_forms",
    title: "Tu préfères prendre tes compléments sous quelle forme ?",
    subtitle: "Sélectionne tes préférences",
    type: "multi-doses",
    options: [
      { value: "capsules", label: "Gélules", icon: <Pill weight="duotone" className="w-5 h-5 text-blue-400" />, iconBg: "bg-blue-500/15 border border-blue-500/20" },
      { value: "powder", label: "Poudre", icon: <Drop weight="duotone" className="w-5 h-5 text-purple-400" />, iconBg: "bg-purple-500/15 border border-purple-500/20" },
      { value: "gummies", label: "Gummies", icon: <Cookie weight="duotone" className="w-5 h-5 text-pink-400" />, iconBg: "bg-pink-500/15 border border-pink-500/20" },
      { value: "liquid", label: "Liquide", icon: <Drop weight="duotone" className="w-5 h-5 text-cyan-400" />, iconBg: "bg-cyan-500/15 border border-cyan-500/20" },
      { value: "any", label: "Peu importe", icon: <DotsThree weight="duotone" className="w-5 h-5 text-muted-foreground" />, iconBg: "bg-muted/50 border border-border/50" },
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

// Step transition with deblur
const stepTransition = {
  initial: { opacity: 0, x: 60, filter: "blur(6px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -60, filter: "blur(6px)" },
};

function OptionCard({ selected, icon, iconBg, label, onClick, index }: {
  selected: boolean;
  icon?: ReactNode;
  iconBg?: string;
  label: string;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, type: "spring" as const, stiffness: 300, damping: 24 }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={cn(
        "group relative p-4 rounded-2xl border-2 text-left transition-all duration-300",
        "backdrop-blur-sm shadow-sm hover:shadow-lg",
        selected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/15"
          : "border-border/60 bg-card/30 hover:border-primary/40 hover:bg-card/50"
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <motion.div
            animate={selected ? { scale: [1, 1.15, 1], rotate: [0, 8, 0] } : {}}
            transition={{ duration: 0.4, type: "spring" }}
            className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-shadow duration-300", iconBg, selected && "shadow-lg")}
          >
            {icon}
          </motion.div>
        )}
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-primary-foreground" />
        </motion.div>
      )}
    </motion.button>
  );
}

const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

/* ── AI Analysis Animation (shown after onboarding completes) ── */
function AIAnalysisAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const steps = [
    "Analyse de votre profil santé...",
    "Évaluation de vos objectifs...",
    "Identification de vos besoins nutritionnels...",
    "Génération de recommandations personnalisées...",
    "Votre dashboard est prêt !"
  ];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setPhase(i), i * 1200));
    });
    timers.push(setTimeout(() => onComplete(), steps.length * 1200 + 800));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Logo */}
      <motion.div
        className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center mb-8"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src={vitasyncLogo} alt="VitaSync" className="w-12 h-12 object-contain" />
        {/* Spinning ring */}
        <motion.div
          className="absolute inset-[-4px] rounded-3xl border-2 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Steps */}
      <div className="relative z-10 flex flex-col items-center gap-4 max-w-md px-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-light text-foreground text-center"
          >
            {steps[phase]}
          </motion.p>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-2 mt-4">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: i <= phase ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)",
                scale: i === phase ? 1.3 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 rounded-full bg-muted/50 overflow-hidden mt-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: "0%" }}
            animate={{ width: `${((phase + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

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
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  // Pre-fill answers in edit mode
  useEffect(() => {
    if (isEditMode && healthProfile) {
      const prefilled: Record<string, any> = {};
      if (healthProfile.is_adult !== null) prefilled.is_adult = healthProfile.is_adult ? "yes" : "no";
      if (healthProfile.shipping_country) prefilled.shipping_country = healthProfile.shipping_country;
      if (healthProfile.health_goals?.length) prefilled.health_goals = healthProfile.health_goals;
      if (healthProfile.sport_types?.length) {
        prefilled.selected_sports = healthProfile.sport_types.map((id: string) => {
          const found = allSports.find((s) => s.id === id);
          return { id, label: found?.label || id, emoji: found?.emoji || "🎯", frequency: 2 };
        });
      }
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
      
      if (value === "none" || value === "prefer_not_say" || value === "any") {
        setAnswers({ ...answers, [q.id]: [value] });
        return;
      }
      
      const filtered = current.filter((v: string) => v !== "none" && v !== "prefer_not_say" && v !== "any");
      
      if (filtered.includes(value)) {
        setAnswers({ ...answers, [q.id]: filtered.filter((v: string) => v !== value) });
      } else {
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
    if (q.type === "yesno") return answers[q.id] === "yes" || answers[q.id] === "no";
    if (q.type === "country") return !!answers.shipping_country;
    if (q.type === "multi" || q.type === "multi-doses") {
      const arr = answers[q.id];
      return Array.isArray(arr) && arr.length > 0;
    }
    if (q.type === "single" || q.type === "single-bonus" || q.type === "slider-single") return !!answers[q.id];
    if (q.type === "sport-builder") return true; // optional
    if (q.type === "dual-slider") return q.sliders?.every((s) => answers[s.id] !== undefined) ?? false;
    if (q.type === "budget") return !!answers.monthly_budget || !!answers.budget_range;
    return true;
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      try {
        // Derive activity_level and sport_types from sport builder
        const sportData: SelectedSport[] = answers.selected_sports || [];
        const totalWeekly = sportData.reduce((sum: number, s: SelectedSport) => sum + s.frequency, 0);
        const derivedActivityLevel = totalWeekly === 0 ? "0-1" : totalWeekly <= 3 ? "2-3" : totalWeekly <= 5 ? "4-5" : "6+";
        const derivedSportTypes = sportData.map((s: SelectedSport) => s.id);

        const formattedAnswers: Partial<HealthProfile> = {
          is_adult: true,
          shipping_country: answers.shipping_country,
          health_goals: answers.health_goals || [],
          activity_level: derivedActivityLevel,
          sport_types: derivedSportTypes,
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
          description: "Votre Coach IA analyse votre profil...",
        });
        setShowAIAnalysis(true);
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
      const yesNoOptions = [
        { value: "yes", label: "Oui, j'ai 18 ans ou plus", icon: <CheckCircle weight="duotone" className="w-6 h-6 text-green-400" />, iconBg: "bg-green-500/15 border border-green-500/20" },
        { value: "no", label: "Non, j'ai moins de 18 ans", icon: <XCircle weight="duotone" className="w-6 h-6 text-red-400" />, iconBg: "bg-red-500/15 border border-red-500/20" },
      ];
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {yesNoOptions.map((opt, index) => (
              <motion.button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.04, type: "spring" as const, stiffness: 300, damping: 24 }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className={cn(
                  "group relative p-6 rounded-2xl border-2 text-center transition-all duration-300",
                  "backdrop-blur-sm shadow-sm hover:shadow-lg",
                  answers[q.id] === opt.value
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                    : "border-border/60 bg-card/30 hover:border-primary/40 hover:bg-card/50"
                )}
              >
                <motion.div 
                  className="flex justify-center mb-3"
                  animate={answers[q.id] === opt.value ? { scale: [1, 1.15, 1], rotate: [0, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", opt.iconBg)}>
                    {opt.icon}
                  </div>
                </motion.div>
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
                {answers[q.id] === opt.value && (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </motion.div>
                )}
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
            <p className="text-xs text-muted-foreground text-center bg-muted/30 px-3 py-2 rounded-full inline-flex mx-auto">
              {(answers[q.id] || []).length}/{q.maxSelections} sélectionnés
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {q.options?.map((opt, index) => (
              <OptionCard
                key={opt.value}
                selected={isOptionSelected(opt.value)}
                icon={opt.icon}
                iconBg={opt.iconBg}
                label={opt.label}
                onClick={() => handleSelect(opt.value)}
                index={index}
              />
            ))}
          </div>
        </div>
      );
    }

    // Single select
    if (q.type === "single") {
      return (
        <div className="grid grid-cols-2 gap-3">
          {q.options?.map((opt, index) => (
            <OptionCard
              key={opt.value}
              selected={isOptionSelected(opt.value)}
              icon={opt.icon}
              iconBg={opt.iconBg}
              label={opt.label}
              onClick={() => handleSelect(opt.value)}
              index={index}
            />
          ))}
        </div>
      );
    }

    // Sport builder
    if (q.type === "sport-builder") {
      return (
        <SportSelector
          selectedSports={answers.selected_sports || []}
          onChange={(sports) => setAnswers({ ...answers, selected_sports: sports })}
        />
      );
    }

    if (q.type === "single-bonus") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {q.options?.map((opt, index) => (
              <OptionCard
                key={opt.value}
                selected={isOptionSelected(opt.value)}
                icon={opt.icon}
                iconBg={opt.iconBg}
                label={opt.label}
                onClick={() => handleSelect(opt.value)}
                index={index}
              />
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
                  <motion.button
                    key={opt.value}
                    onClick={() => handleBonusSelect(q.bonusField!.id, opt.value)}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm transition-all",
                      (answers[q.bonusField!.id] || []).includes(opt.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border hover:border-primary/50"
                    )}
                  >
                    {opt.label}
                  </motion.button>
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
            {q.options?.map((opt, index) => (
              <OptionCard
                key={opt.value}
                selected={isOptionSelected(opt.value)}
                icon={opt.icon}
                iconBg={opt.iconBg}
                label={opt.label}
                onClick={() => handleSelect(opt.value)}
                index={index}
              />
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
                invertColors={slider.id === "stress_level"}
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
            {q.options?.map((opt, index) => (
              <OptionCard
                key={opt.value}
                selected={isOptionSelected(opt.value)}
                icon={opt.icon}
                iconBg={opt.iconBg}
                label={opt.label}
                onClick={() => handleSelect(opt.value)}
                index={index}
              />
            ))}
          </div>
          
          {q.bonusField && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{q.bonusField.label}</p>
              <div className="flex gap-3">
                {q.bonusField.options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => setAnswers({ ...answers, [q.bonusField!.id]: opt.value })}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      answers[q.bonusField!.id] === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border hover:border-primary/50"
                    )}
                  >
                    {opt.label}
                  </motion.button>
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
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Lock weight="duotone" className="w-4 h-4" />
            Je préfère ne pas répondre
          </button>
        </div>
      );
    }

    return null;
  };

  // AI Analysis animation screen
  if (showAIAnalysis) {
    return <AIAnalysisAnimation onComplete={() => navigate("/dashboard")} />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden transition-all duration-1000"
      style={{
        background: `linear-gradient(135deg, 
          hsl(var(--background)) ${Math.max(0, 100 - progress * 1.5)}%, 
          hsl(var(--primary) / ${0.05 + progress * 0.002}) ${50}%, 
          hsl(160 50% 40% / ${progress * 0.0015}) 100%)`
      }}
    >
      {/* Reactive particles */}
      <ProgressParticles progress={progress} />

      {/* Progress ring (desktop top-right) */}
      <ProgressRing progress={progress} currentStep={currentStep} totalSteps={questions.length} />

      {/* Step timeline (desktop left) */}
      <StepTimeline currentStep={currentStep} totalSteps={questions.length} />

      {/* Decorative floating orbs - intensity scales with progress */}
      <motion.div
        className="absolute top-1/4 -left-32 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: `hsl(var(--primary) / ${0.05 + progress * 0.002})` }}
        animate={{ y: [0, 30, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: `hsl(var(--secondary) / ${0.05 + progress * 0.002})` }}
        animate={{ y: [0, -25, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main container - 3/4 on desktop, full on mobile */}
      <div className="w-full max-w-3xl mx-auto min-h-screen md:min-h-0 md:max-h-[90vh] flex flex-col md:rounded-3xl md:border md:border-white/10 md:shadow-2xl md:backdrop-blur-xl md:bg-card/50 relative z-10">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={handleBack}
              disabled={currentStep === 0}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isEditMode ? "Annuler" : question.required === false ? "Passer" : ""}
            </button>
          </div>
          <motion.div layoutId="onboarding-progress">
            <Progress value={progress} className="h-1.5" />
          </motion.div>
          <p className="text-xs text-muted-foreground mt-2 text-center tabular-nums">
            {currentStep + 1} / {questions.length}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-6 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={stepTransition.initial}
              animate={stepTransition.animate}
              exit={stepTransition.exit}
              transition={{ duration: 0.4 }}
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
            <motion.div
              whileTap={canProceed() ? { scale: 0.97 } : {}}
            >
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className={cn(
                  "w-full h-14 rounded-2xl text-base font-medium transition-all duration-300",
                  canProceed() && !isSubmitting && "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                )}
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
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
