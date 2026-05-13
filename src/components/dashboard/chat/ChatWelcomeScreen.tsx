import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ClipboardText, Sparkle, HandWaving, Target } from '@phosphor-icons/react';
import { GuidedSuggestionCards } from '../GuidedSuggestionCards';
import { ProfileSummaryCard } from '../ProfileSummaryCard';
import { DisclaimerModal } from '../DisclaimerModal';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation();

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
          className="relative mx-auto mb-8 w-24 h-24"
        >
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute inset-2 rounded-full bg-card/70 backdrop-blur-xl border border-border/40 flex items-center justify-center shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.3)]">
            <img src={vitasyncLogoUrl} alt="VitaSync" className="w-11 h-11 object-contain" />
          </div>
        </motion.div>

        {/* Greeting with shimmer effect */}
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-3"
        >
          Bonjour{firstName !== 'toi' ? `, ${firstName}` : ''}
          <span className="inline-block ml-2 align-middle">
            <HandWaving weight="duotone" className="w-7 h-7 md:w-8 md:h-8 inline text-amber-400/80" />
          </span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base md:text-lg font-light text-foreground/60 mb-8"
        >
          Comment puis-je t'aider aujourd'hui&nbsp;?
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
            <button
              onClick={() => navigate("/onboarding")}
              className={cn(
                "w-full px-5 py-4 rounded-2xl font-medium tracking-tight",
                "bg-primary text-primary-foreground",
                "shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.5)]",
                "flex items-center justify-center gap-2.5",
                "hover:bg-primary/90 transition-colors duration-200"
              )}
            >
              <ClipboardText weight="duotone" className="w-5 h-5" />
              <span className="text-[15px]">{t('chat.personalizeMyPlan')}</span>
              <Sparkle weight="fill" className="w-4 h-4 opacity-60" />
            </button>
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
