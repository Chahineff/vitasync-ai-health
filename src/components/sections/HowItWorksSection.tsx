import { useRef, useState, useEffect } from "react";
import { ChatCircle, FileArrowUp, Package, ClipboardText } from "@phosphor-icons/react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: ClipboardText,
    number: "01",
    title: "Onboarding personnalisé",
    description: "Répondez à 10 questions simples sur vos objectifs, votre sommeil, votre alimentation et votre niveau de stress. L'IA apprend à vous connaître en profondeur.",
    colorClass: "text-cyan-500",
    bgClass: "bg-cyan-500",
    borderClass: "border-cyan-500/50",
    gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
  },
  {
    icon: ChatCircle,
    number: "02",
    title: "Échangez avec votre Coach IA",
    description: "Clarifiez vos besoins par chat ou voix. Notre IA comprend vos objectifs en profondeur et adapte ses conseils personnalisés en temps réel.",
    colorClass: "text-primary",
    bgClass: "bg-primary",
    borderClass: "border-primary/50",
    gradient: "from-primary/10 via-primary/5 to-transparent",
  },
  {
    icon: FileArrowUp,
    number: "03",
    title: "Analyse Poussée (Optionnel)",
    description: "Importez vos analyses sanguines pour une précision maximale. L'IA interprète vos biomarqueurs instantanément et affine ses recommandations.",
    colorClass: "text-accent",
    bgClass: "bg-accent",
    borderClass: "border-accent/50",
    gradient: "from-accent/10 via-accent/5 to-transparent",
  },
  {
    icon: Package,
    number: "04",
    title: "Recevez votre Stack",
    description: "Abonnez-vous à votre pack personnalisé de compléments, ajusté mensuellement selon vos progrès et l'évolution de vos besoins.",
    colorClass: "text-secondary",
    bgClass: "bg-secondary",
    borderClass: "border-secondary/50",
    gradient: "from-secondary/10 via-secondary/5 to-transparent",
  },
];

function StepCard({ step }: { step: typeof steps[0] }) {
  const IconComponent = step.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.98 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full max-w-3xl mx-auto px-4"
    >
        <div 
          className={cn(
            "glass-card-premium relative overflow-hidden p-6 md:p-8 lg:p-10",
            "border border-white/10 dark:border-white/5"
          )}
        >
        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          step.gradient
        )} />
        
        {/* Large step number in background */}
        <span className="absolute -top-8 -right-4 text-[12rem] md:text-[16rem] font-extralight text-foreground/[0.03] select-none pointer-events-none">
          {step.number}
        </span>
        
        <div className="relative z-10">
          {/* Step number badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className={cn(
              "text-sm font-medium tracking-widest uppercase",
              step.colorClass
            )}>
              Étape {step.number}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-foreground/10 to-transparent" />
          </div>
          
          {/* Icon */}
          <div className="icon-container w-16 h-16 md:w-20 md:h-20 rounded-2xl mb-6 md:mb-8 flex items-center justify-center">
            <IconComponent 
              size={36} 
              weight="light" 
              className={cn(step.colorClass, "md:hidden")} 
            />
            <IconComponent 
              size={48} 
              weight="light" 
              className={cn(step.colorClass, "hidden md:block")} 
            />
          </div>
          
          {/* Title */}
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4 md:mb-6">
            {step.title}
          </h3>
          
          {/* Description */}
          <p className="text-base md:text-lg lg:text-xl text-foreground/60 leading-relaxed max-w-xl">
            {step.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ProgressIndicator({ 
  currentIndex, 
  onStepClick 
}: { 
  currentIndex: number; 
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
      {steps.map((step, index) => (
        <button
          key={index}
          onClick={() => onStepClick(index)}
          className={cn(
            "relative transition-all duration-300 rounded-full",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            index === currentIndex 
              ? "w-3 h-3 md:w-4 md:h-4" 
              : "w-2 h-2 md:w-2.5 md:h-2.5 hover:scale-125"
          )}
          aria-label={`Aller à l'étape ${index + 1}`}
        >
          <span className={cn(
            "absolute inset-0 rounded-full transition-all duration-300",
            index === currentIndex 
              ? cn("animate-pulse-glow", step.bgClass)
              : "bg-foreground/20 dark:bg-foreground/30"
          )} />
          
          {/* Active indicator ring */}
          {index === currentIndex && (
            <motion.span
              layoutId="activeStep"
              className={cn(
                "absolute -inset-1.5 rounded-full border-2",
                step.borderClass
              )}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
      
      {/* Progress line */}
      <div className="absolute top-0 bottom-0 w-px bg-foreground/10 -z-10" />
    </div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  
  // Listen to scroll progress and update current step
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const newIndex = Math.min(Math.floor(latest * steps.length), steps.length - 1);
    if (newIndex !== currentStepIndex && newIndex >= 0) {
      setCurrentStepIndex(newIndex);
    }
  });

  // Track if section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const scrollToStep = (index: number) => {
    if (!sectionRef.current) return;
    const sectionTop = sectionRef.current.offsetTop;
    const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight;
    const targetScroll = sectionTop + (sectionHeight * index) / (steps.length - 1);
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const currentStep = steps[currentStepIndex];

  return (
    <section 
      ref={sectionRef}
      id="how-it-works" 
      className="relative"
      style={{ height: `${steps.length * 60}vh` }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-subtle" />
        
        {/* Header */}
        <div className="absolute top-16 md:top-20 left-0 right-0 text-center px-4 z-10">
          <span className="text-xs md:text-sm text-primary uppercase tracking-widest mb-3 block">
            Processus simple
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground">
            Votre parcours vers une{" "}
            <span className="gradient-text">santé optimisée</span>
          </h2>
        </div>
        
        {/* Step cards with AnimatePresence */}
        <div className="flex items-center justify-center w-full mt-16 md:mt-20">
          <AnimatePresence mode="wait">
            <StepCard key={currentStepIndex} step={currentStep} />
          </AnimatePresence>
        </div>
        
        {/* Progress indicator - only show when section is in view */}
        {isInView && (
          <ProgressIndicator 
            currentIndex={currentStepIndex} 
            onStepClick={scrollToStep}
          />
        )}
        
        {/* Scroll hint at bottom */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: currentStepIndex < steps.length - 1 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-xs text-foreground/40 uppercase tracking-widest">
            Scrollez
          </span>
          <div className="w-5 h-8 rounded-full border border-foreground/20 flex items-start justify-center p-1">
            <motion.div 
              className="w-1 h-2 bg-foreground/40 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
