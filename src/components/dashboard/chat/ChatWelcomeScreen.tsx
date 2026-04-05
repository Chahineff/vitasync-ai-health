import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ClipboardText, Sparkle, HandWaving, Target } from '@phosphor-icons/react';
import { GuidedSuggestionCards } from '../GuidedSuggestionCards';
import { ProfileSummaryCard } from '../ProfileSummaryCard';
import { DisclaimerModal } from '../DisclaimerModal';
import { cn } from '@/lib/utils';

// Official VitaSync PNG Logo
const vitasyncLogoUrl = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

interface ChatWelcomeScreenProps {
  firstName: string;
  healthProfile: {
    onboarding_completed?: boolean | null;
    health_goals?: string[] | null;
    allergies?: string[] | null;
    monthly_budget?: string | null;
  } | null;
  onSubmitPrompt: (prompt: string) => void;
}

export function ChatWelcomeScreen({ firstName, healthProfile, onSubmitPrompt }: ChatWelcomeScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-3xl w-full"
      >
        {/* Animated Logo with Halo Glow + Float */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative mx-auto mb-8 w-28 h-28"
        >
          <div className="absolute inset-0 rounded-full animate-halo-pulse" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/30 animate-gradient-rotate blur-md" />
          <motion.div 
            className="absolute inset-3 rounded-full bg-background/80 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src={vitasyncLogoUrl} alt="VitaSync" className="w-12 h-12 object-contain" />
          </motion.div>
        </motion.div>

        {/* Greeting with shimmer effect */}
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl md:text-5xl font-light text-foreground mb-4"
        >
          Bonjour{firstName !== 'toi' ? `, ${firstName}` : ''}{' '}
            <motion.span
              className="inline-block"
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <HandWaving weight="duotone" className="w-10 h-10 inline text-amber-400" />
            </motion.span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xl md:text-2xl font-light mb-8"
        >
          <span className="gradient-text-hero">Comment puis-je t'aider aujourd'hui ?</span>
        </motion.p>

        {/* Quiz CTA or Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="max-w-xl mx-auto mb-8"
        >
          {healthProfile?.onboarding_completed ? (
            <ProfileSummaryCard 
              goals={healthProfile.health_goals || []}
              allergies={healthProfile.allergies || []}
              budget={healthProfile.monthly_budget}
              onEdit={() => navigate("/onboarding?edit=true")}
            />
          ) : (
            <motion.button
              onClick={() => navigate("/onboarding")}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full p-5 rounded-2xl font-medium",
                "bg-gradient-to-r from-primary via-primary/90 to-secondary/80",
                "text-primary-foreground shadow-xl shadow-primary/25",
                "flex items-center justify-center gap-3",
                "hover:shadow-2xl hover:shadow-primary/30",
                "transition-shadow duration-300",
                "border border-white/20"
              )}
            >
              <ClipboardText weight="bold" className="w-6 h-6" />
              <Target weight="bold" className="w-5 h-5" />
              <span className="text-lg">{t('chat.personalizeMyPlan')}</span>
              <Sparkle weight="fill" className="w-5 h-5 opacity-70 animate-pulse" />
            </motion.button>
          )}
        </motion.div>

        {/* Guided Suggestion Cards */}
        <GuidedSuggestionCards 
          onSubmitPrompt={onSubmitPrompt}
          onboardingCompleted={healthProfile?.onboarding_completed ?? false}
        />

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-foreground/40">
            VitaSync AI est un outil de bien-être, pas un diagnostic médical.{' '}
            <DisclaimerModal />
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
