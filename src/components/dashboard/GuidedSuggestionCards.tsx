import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Moon,
  Leaf,
  Brain,
  Lightning,
  ArrowRight,
  Check,
  ClipboardText,
  Sparkle,
  CaretLeft
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useHealthProfile } from '@/hooks/useHealthProfile';

interface SuggestionCard {
  id: string;
  icon: React.ElementType;
  title: string;
  category: 'sleep' | 'nutrition' | 'stress' | 'energy';
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
      },
      {
        id: 'activity',
        text: "Pratiquez-vous une activité physique régulière ?",
        options: [
          { value: 'daily', label: '🏃 Quotidien' },
          { value: 'regular', label: '💪 3-4x semaine' },
          { value: 'rarely', label: '🚶 Rarement' },
          { value: 'never', label: '🛋️ Jamais' }
        ]
      },
      {
        id: 'deficiencies',
        text: "Avez-vous des carences connues ?",
        options: [
          { value: 'iron', label: '🩸 Fer' },
          { value: 'vitd', label: '☀️ Vitamine D' },
          { value: 'vitb12', label: '💊 Vitamine B12' },
          { value: 'none', label: '✅ Non, pas à ma connaissance' }
        ]
      }
    ],
    getRecommendation: (answers) => {
      let reco = "Je cherche à booster mon énergie. ";
      if (answers.timing === 'morning') reco += "Je suis surtout fatigué le matin au réveil. ";
      else if (answers.timing === 'afternoon') reco += "J'ai un coup de barre après le déjeuner. ";
      else if (answers.timing === 'evening') reco += "Ma fatigue s'accumule en fin de journée. ";
      else reco += "Je me sens fatigué toute la journée. ";
      
      if (answers.caffeine === 'avoid' || answers.caffeine === 'sensitive') {
        reco += "Je suis sensible à la caféine, je préfère des alternatives naturelles. ";
      }
      if (answers.activity === 'daily' || answers.activity === 'regular') {
        reco += "Je fais du sport régulièrement. ";
      } else {
        reco += "Je suis plutôt sédentaire. ";
      }
      if (answers.deficiencies !== 'none') {
        const defMap: Record<string, string> = { iron: 'fer', vitd: 'vitamine D', vitb12: 'vitamine B12' };
        reco += `J'ai une carence en ${defMap[answers.deficiencies] || answers.deficiencies}. `;
      }
      reco += "Quels sont tes conseils pour améliorer mon énergie au quotidien ?";
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
      },
      {
        id: 'screens',
        text: "Utilisez-vous des écrans avant de dormir ?",
        options: [
          { value: 'always', label: '📱 Oui, constamment' },
          { value: 'sometimes', label: '🤷 Parfois' },
          { value: 'rarely', label: '📖 Rarement' },
          { value: 'never', label: '🚫 Non' }
        ]
      },
      {
        id: 'bedtime',
        text: "À quelle heure vous couchez-vous en général ?",
        options: [
          { value: 'before_22', label: '🌅 Avant 22h' },
          { value: '22_23', label: '🌙 22h-23h' },
          { value: '23_00', label: '🕛 23h-00h' },
          { value: 'after_midnight', label: '🌃 Après minuit' }
        ]
      }
    ],
    getRecommendation: (answers) => {
      let reco = "J'ai des problèmes de sommeil. ";
      if (answers.issue === 'falling_asleep') reco += "J'ai du mal à m'endormir. ";
      else if (answers.issue === 'staying_asleep') reco += "Je me réveille souvent la nuit. ";
      else if (answers.issue === 'quality') reco += "Mon sommeil n'est pas réparateur. ";
      else reco += "Mon rythme de sommeil est décalé. ";
      
      if (answers.stress === 'high' || answers.stress === 'very_high') {
        reco += "Je suis aussi assez stressé le soir. ";
      }
      if (answers.screens === 'always') {
        reco += "J'utilise constamment mes écrans avant de dormir. ";
      }
      if (answers.bedtime === 'after_midnight') {
        reco += "Je me couche souvent après minuit. ";
      }
      reco += "Que me recommandes-tu pour améliorer mon sommeil naturellement ?";
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
      },
      {
        id: 'relaxation',
        text: "Pratiquez-vous des techniques de relaxation ?",
        options: [
          { value: 'meditation', label: '🧘 Méditation' },
          { value: 'sport', label: '🏋️ Sport' },
          { value: 'breathing', label: '🌬️ Respiration' },
          { value: 'none', label: '❌ Aucune' }
        ]
      },
      {
        id: 'diet_balance',
        text: "Votre alimentation est-elle équilibrée ?",
        options: [
          { value: 'very', label: '🥗 Très équilibrée' },
          { value: 'good', label: '👍 Plutôt bien' },
          { value: 'improvable', label: '🤔 Améliorable' },
          { value: 'poor', label: '🍔 Pas du tout' }
        ]
      }
    ],
    getRecommendation: (answers) => {
      let reco = "Je cherche à mieux gérer mon stress. ";
      if (answers.type === 'mental') reco += "Je rumine beaucoup. ";
      else if (answers.type === 'physical') reco += "J'ai des tensions physiques. ";
      else if (answers.type === 'emotional') reco += "J'ai tendance à l'anxiété. ";
      else reco += "Mon stress est global. ";
      
      if (answers.frequency === 'chronic' || answers.frequency === 'daily') {
        reco += "C'est un problème quotidien pour moi. ";
      }
      if (answers.relaxation === 'none') {
        reco += "Je ne pratique aucune technique de relaxation. ";
      } else {
        reco += `Je pratique la ${answers.relaxation === 'meditation' ? 'méditation' : answers.relaxation === 'sport' ? 'sport' : 'respiration'}. `;
      }
      if (answers.diet_balance === 'poor' || answers.diet_balance === 'improvable') {
        reco += "Mon alimentation est à améliorer. ";
      }
      reco += "Quelles stratégies me proposes-tu pour mieux gérer mon stress ?";
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
      },
      {
        id: 'meals',
        text: "Combien de repas prenez-vous par jour ?",
        options: [
          { value: '2', label: '🍽️ 2 repas' },
          { value: '3', label: '🍽️🍽️ 3 repas' },
          { value: '4+', label: '🍽️🍽️🍽️ 4+ repas' },
          { value: 'irregular', label: '🔄 Irrégulier' }
        ]
      },
      {
        id: 'intolerances',
        text: "Avez-vous des intolérances alimentaires ?",
        options: [
          { value: 'gluten', label: '🌾 Gluten' },
          { value: 'lactose', label: '🥛 Lactose' },
          { value: 'nuts', label: '🥜 Noix' },
          { value: 'none', label: '✅ Aucune' }
        ]
      }
    ],
    getRecommendation: (answers) => {
      let reco = "Je cherche des conseils nutrition personnalisés. ";
      if (answers.goal === 'energy') reco += "Mon objectif est d'avoir plus d'énergie. ";
      else if (answers.goal === 'weight') reco += "Je veux mieux gérer mon poids. ";
      else if (answers.goal === 'muscle') reco += "Je veux prendre du muscle. ";
      else reco += "Je veux améliorer ma santé générale. ";
      
      if (answers.diet !== 'none') {
        const dietName = answers.diet === 'vegetarian' ? 'végétarien' : answers.diet === 'vegan' ? 'végan' : 'low-carb';
        reco += `Je suis ${dietName}. `;
      }
      if (answers.meals === 'irregular') {
        reco += "Mes repas sont irréguliers. ";
      } else {
        reco += `Je prends ${answers.meals} repas par jour. `;
      }
      if (answers.intolerances !== 'none') {
        reco += `J'ai une intolérance au ${answers.intolerances}. `;
      }
      reco += "Quels conseils nutritionnels personnalisés me donnes-tu ?";
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
  const totalSteps = activeCardData ? activeCardData.questions.length + 1 : 0;

  const handleCardClick = (cardId: string) => {
    setActiveCard(cardId);
    setCurrentStep(0);
    setAnswers({});
  };

  const handleAnswerSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
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

  if (activeCard && activeCardData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            <CaretLeft weight="bold" className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </button>
          
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
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-secondary/5" />
          
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[10px] font-medium text-foreground/50">5 étapes</span>
          </div>
          
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
          <p className="relative z-10 text-xs text-foreground/50 mt-2 flex items-center gap-1.5">
            <Sparkle weight="fill" className="w-3 h-3 text-primary" />
            Recommandation personnalisée
          </p>
        </motion.button>
      ))}
    </div>
  );
}
