import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, MagnifyingGlass, ShieldCheck, Brain, Trophy } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";

const promptPhrases = [
  "Quels suppléments pour mon énergie ?",
  "Comment améliorer mon sommeil ?",
  "Mon stack personnalisé anti-stress",
  "Analyse de mes biomarqueurs",
  "Optimiser ma récupération sportive",
];

export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % promptPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-immersive dark:bg-hero-immersive">
      {/* Light mode override */}
      <div className="absolute inset-0 bg-hero-immersive-light dark:hidden" />

      {/* Subtle ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-16 py-24 md:py-32 text-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {t("hero.badge")}
          </span>
        </motion.div>

        {/* Editorial Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-[-0.04em] text-foreground dark:text-white mb-6 leading-[1.05]"
        >
          <span className="font-editorial italic text-primary">Propulse</span>{" "}
          ta santé.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-foreground/60 dark:text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <Link 
            to="/auth?mode=signup" 
            className="btn-outline-hero group"
          >
            {t("hero.cta")}
            <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* AI Prompt Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl mx-auto mb-6"
        >
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-foreground/5 dark:bg-white/5 border border-foreground/10 dark:border-white/10 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group cursor-pointer"
          >
            <MagnifyingGlass size={20} className="text-foreground/40 dark:text-white/30 flex-shrink-0" />
            <span className="flex-1 text-left text-sm text-foreground/40 dark:text-white/30 truncate">
              <motion.span
                key={currentPhrase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {promptPhrases[currentPhrase]}
              </motion.span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Envoyer
            </span>
          </button>
          <p className="text-xs text-foreground/30 dark:text-white/20 mt-3">
            Suivez tout. Demandez tout.
          </p>
        </motion.div>

        {/* Credibility Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6 mt-12"
        >
          {[
            { icon: Trophy, label: "Top App Santé 2025" },
            { icon: Brain, label: "IA Certifiée" },
            { icon: ShieldCheck, label: "Données Protégées" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-foreground/30 dark:text-white/20">
              <Icon size={16} weight="light" />
              <span className="text-xs tracking-wide uppercase">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-foreground/15 dark:border-white/15 flex items-start justify-center p-1.5"
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1 rounded-full bg-primary"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
