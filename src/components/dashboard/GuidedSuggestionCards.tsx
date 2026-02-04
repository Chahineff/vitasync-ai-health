import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Moon,
  Leaf,
  Brain,
  Heart,
  Lightning,
  Barbell,
  ShieldPlus,
  ArrowRight,
  Check,
  ClipboardText,
  Sparkle,
  CaretLeft
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { useDailyCheckin } from '@/hooks/useDailyCheckin';

interface SuggestionCard {
  id: string;
  icon: React.ElementType;
  title: string;
  category: 'sleep' | 'nutrition' | 'stress' | 'energy' | 'sport' | 'immunity' | 'digestion' | 'focus';
  gradient: string;
  iconColor: string;
  questions: {
    id: string;
    text: string;
    options: { value: string; label: string }[];
  }[];
  getRecommendation: (answers: Record<string, string>) => string;
}

const GUIDED_CARDS: SuggestionCard[] = [
  {
    id: 'energy',
    icon: Lightning,
    title: "Booster mon énergie",
    category: 'energy',
    gradient: "from-amber-500/10 to-yellow-500/10",
    iconColor: "text-amber-500",
    questions: [
      {
        id: 'timing',
        text: "Quand ressentez-vous le plus de fatigue ?",
        options: [
          { value: 'morning', label: '☀️ Le matin au réveil' },
          { value: 'afternoon', label: '🌤️ Après le déjeuner' },
          { value: 'evening', label: '🌙 En fin de journée' },
          { value: 'all_day', label: '😴 Toute la journée' }
        ]
      },
      {
        id: 'caffeine',
        text: "Quelle est votre relation avec la caféine ?",
        options: [
          { value: 'love', label: '☕ J\'adore, aucune limite' },
          { value: 'moderate', label: '🫖 Modérément sensible' },
          { value: 'sensitive', label: '⚡ Très sensible' },
          { value: 'avoid', label: '🚫 Je l\'évite complètement' }
        ]
      }
    ],
    getRecommendation: (answers) => {
      const timing = answers.timing;
      const caffeine = answers.caffeine;
      let reco = "Je cherche à booster mon énergie. ";
      if (timing === 'morning') reco += "Je suis surtout fatigué le matin au réveil. ";
      else if (timing === 'afternoon') reco += "J'ai un coup de barre après le déjeuner. ";
      else if (timing === 'evening') reco += "Ma fatigue s'accumule en fin de journée. ";
      else reco += "Je me sens fatigué toute la journée. ";
      
      if (caffeine === 'avoid' || caffeine === 'sensitive') {
        reco += "Je suis sensible à la caféine, je préfère des alternatives naturelles. ";
      }
      reco += "Quels compléments me conseilles-tu ?";
      return reco;
    }
  },
  {
    id: 'sleep',
    icon: Moon,
    title: "Améliorer mon sommeil",
    category: 'sleep',
    gradient: "from-indigo-500/10 to-purple-500/10",
    iconColor: "text-indigo-500",
    questions: [
      {
        id: 'issue',
        text: "Quel est votre principal problème de sommeil ?",
        options: [
          { value: 'falling_asleep', label: '😵 Difficultés à m\'endormir' },
          { value: 'staying_asleep', label: '🌙 Réveils nocturnes' },
          { value: 'quality', label: '😪 Sommeil non réparateur' },
          { value: 'timing', label: '⏰ Rythme décalé' }
        ]
      },
      {
        id: 'stress',
        text: "Votre niveau de stress au coucher ?",
        options: [
          { value: 'low', label: '😌 Calme et détendu' },
          { value: 'medium', label: '🤔 Quelques pensées' },
          { value: 'high', label: '😰 Mental très actif' },
          { value: 'very_high', label: '😫 Très anxieux' }
        ]
      }
    ],
    getRecommendation: (answers) => {
      const issue = answers.issue;
      const stress = answers.stress;
      let reco = "J'ai des problèmes de sommeil. ";
      if (issue === 'falling_asleep') reco += "J'ai du mal à m'endormir. ";
      else if (issue === 'staying_asleep') reco += "Je me réveille souvent la nuit. ";
      else if (issue === 'quality') reco += "Mon sommeil n'est pas réparateur. ";
      else reco += "Mon rythme de sommeil est décalé. ";
      
      if (stress === 'high' || stress === 'very_high') {
        reco += "Je suis aussi assez stressé le soir. ";
      }
      reco += "Quels compléments naturels pour améliorer mon sommeil ?";
      return reco;
    }
  },
  {
    id: 'stress',
    icon: Brain,
    title: "Gérer mon stress",
    category: 'stress',
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-500",
    questions: [
      {
        id: 'type',
        text: "Comment se manifeste votre stress ?",
        options: [
          { value: 'mental', label: '🧠 Mental (rumination)' },
          { value: 'physical', label: '💪 Physique (tensions)' },
          { value: 'emotional', label: '💔 Émotionnel (anxiété)' },
          { value: 'mixed', label: '🌀 Un peu de tout' }
        ]
      },
      {
        id: 'frequency',
        text: "À quelle fréquence êtes-vous stressé ?",
        options: [
          { value: 'occasional', label: '🌤️ Occasionnellement' },
          { value: 'work', label: '💼 Surtout au travail' },
          { value: 'daily', label: '📅 Quotidiennement' },
          { value: 'chronic', label: '⚡ Chroniquement' }
        ]
      }
    ],
    getRecommendation: (answers) => {
      const type = answers.type;
      const frequency = answers.frequency;
      let reco = "Je cherche à mieux gérer mon stress. ";
      if (type === 'mental') reco += "Je rumine beaucoup. ";
      else if (type === 'physical') reco += "J'ai des tensions physiques. ";
      else if (type === 'emotional') reco += "J'ai tendance à l'anxiété. ";
      else reco += "Mon stress est global. ";
      
      if (frequency === 'chronic' || frequency === 'daily') {
        reco += "C'est un problème quotidien pour moi. ";
      }
      reco += "Quelles solutions naturelles recommandes-tu ?";
      return reco;
    }
  },
  {
    id: 'nutrition',
    icon: Leaf,
    title: "Optimiser ma nutrition",
    category: 'nutrition',
    gradient: "from-emerald-500/10 to-green-500/10",
    iconColor: "text-emerald-500",
    questions: [
      {
        id: 'goal',
        text: "Quel est votre objectif principal ?",
        options: [
          { value: 'energy', label: '⚡ Plus d\'énergie' },
          { value: 'weight', label: '⚖️ Gestion du poids' },
          { value: 'muscle', label: '💪 Prise de muscle' },
          { value: 'health', label: '🌿 Santé générale' }
        ]
      },
      {
        id: 'diet',
        text: "Suivez-vous un régime particulier ?",
        options: [
          { value: 'none', label: '🍽️ Non, omnivore' },
          { value: 'vegetarian', label: '🥗 Végétarien' },
          { value: 'vegan', label: '🌱 Végan' },
          { value: 'keto', label: '🥩 Low-carb/Keto' }
        ]
      }
    ],
    getRecommendation: (answers) => {
      const goal = answers.goal;
      const diet = answers.diet;
      let reco = "Je cherche des conseils nutrition personnalisés. ";
      if (goal === 'energy') reco += "Mon objectif est d'avoir plus d'énergie. ";
      else if (goal === 'weight') reco += "Je veux mieux gérer mon poids. ";
      else if (goal === 'muscle') reco += "Je veux prendre du muscle. ";
      else reco += "Je veux améliorer ma santé générale. ";
      
      if (diet !== 'none') {
        const dietName = diet === 'vegetarian' ? 'végétarien' : diet === 'vegan' ? 'végan' : 'low-carb';
        reco += `Je suis ${dietName}. `;
      }
      reco += "Quels compléments me conseilles-tu ?";
      return reco;
    }
  }
];

interface GuidedSuggestionCardsProps {
  onSubmitPrompt: (prompt: string) => void;
  onboardingCompleted?: boolean;
}

export function GuidedSuggestionCards({ onSubmitPrompt, onboardingCompleted }: GuidedSuggestionCardsProps) {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const activeCardData = GUIDED_CARDS.find(c => c.id === activeCard);
  const totalSteps = activeCardData ? activeCardData.questions.length + 1 : 0; // questions + recommendation

  const handleCardClick = (cardId: string) => {
    setActiveCard(cardId);
    setCurrentStep(0);
    setAnswers({});
  };

  const handleAnswerSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    // Auto-advance to next step after selection
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      setActiveCard(null);
      setAnswers({});
    }
  };

  const handleSubmitRecommendation = () => {
    if (activeCardData) {
      const prompt = activeCardData.getRecommendation(answers);
      onSubmitPrompt(prompt);
      setActiveCard(null);
      setCurrentStep(0);
      setAnswers({});
    }
  };

  const currentQuestion = activeCardData?.questions[currentStep];
  const isRecommendationStep = activeCardData && currentStep >= activeCardData.questions.length;

  // Render guided flow
  if (activeCard && activeCardData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-xl mx-auto"
      >
        {/* Header with progress */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            <CaretLeft weight="bold" className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </button>
          
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground/80">
              Étape {currentStep + 1}/{totalSteps}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    i <= currentStep
                      ? "bg-primary scale-110"
                      : "bg-foreground/20"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-2xl bg-gradient-to-br border border-white/10 mb-6",
            activeCardData.gradient
          )}
        >
          <div className="flex items-center gap-4">
            <activeCardData.icon
              weight="duotone"
              className={cn("w-10 h-10", activeCardData.iconColor)}
            />
            <div>
              <h3 className="text-lg font-semibold text-foreground">{activeCardData.title}</h3>
              <p className="text-sm text-foreground/60">
                {isRecommendationStep
                  ? "Voici ta recommandation personnalisée"
                  : "Réponds à quelques questions pour personnaliser"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Question or Recommendation */}
        <AnimatePresence mode="wait">
          {!isRecommendationStep && currentQuestion ? (
            <motion.div
              key={`question-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-lg font-medium text-foreground mb-4">
                {currentQuestion.text}
              </h4>
              <div className="grid gap-3">
                {currentQuestion.options.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all duration-200",
                      answers[currentQuestion.id] === option.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 text-foreground/80"
                    )}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : isRecommendationStep ? (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Summary of answers */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-medium text-foreground/60 mb-3">📋 Récapitulatif</h4>
                <div className="space-y-2">
                  {activeCardData.questions.map((q) => {
                    const answer = q.options.find(o => o.value === answers[q.id]);
                    return (
                      <div key={q.id} className="flex items-center gap-2">
                        <Check weight="bold" className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-foreground/80">{answer?.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitRecommendation}
                  className="w-full p-4 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Sparkle weight="fill" className="w-5 h-5" />
                  <span>Obtenir ma recommandation IA</span>
                  <ArrowRight weight="bold" className="w-5 h-5" />
                </motion.button>

                {!onboardingCompleted && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/onboarding?edit=true')}
                    className="w-full p-4 rounded-xl border border-primary/30 text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
                  >
                    <ClipboardText weight="bold" className="w-5 h-5" />
                    <span>Ou faire le quiz complet (10 questions)</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Default: Show 4 cards grid with premium design
  return (
    <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
      {GUIDED_CARDS.map((card, index) => (
        <motion.button
          key={card.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4 + index * 0.1, duration: 0.5, ease: "easeOut" }}
          whileHover={{ 
            scale: 1.03, 
            y: -4,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCardClick(card.id)}
          className={cn(
            "p-6 rounded-2xl bg-gradient-to-br border",
            "text-left transition-all duration-300",
            "backdrop-blur-xl group relative overflow-hidden",
            "hover:shadow-xl hover:shadow-primary/10",
            "border-white/10 hover:border-primary/30",
            card.gradient
          )}
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-secondary/5" />
          
          {/* Step indicator badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[10px] font-medium text-foreground/50">3 étapes</span>
          </div>
          
          {/* Icon with animation */}
          <motion.div
            className="relative z-10"
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <card.icon
              weight="duotone"
              className={cn("w-8 h-8 mb-4", card.iconColor)}
            />
          </motion.div>
          
          <p className="relative z-10 text-sm font-medium text-foreground">{card.title}</p>
          <p className="relative z-10 text-xs text-foreground/50 mt-1.5">Questions guidées</p>
        </motion.button>
      ))}
    </div>
  );
}
