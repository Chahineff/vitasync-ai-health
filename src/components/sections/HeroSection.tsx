import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Content Container with fade out on scroll */}
      <motion.div 
        className="relative z-10 px-4 sm:px-6 lg:px-16 py-16 md:py-24 text-center max-w-4xl mx-auto"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-full bg-white/10 border border-white/20 text-sm md:text-base text-primary mb-6 md:mb-8 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-secondary animate-pulse" />
            {t("hero.badge")}
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-[-0.04em] text-foreground mb-4 md:mb-6 leading-[1.1] hero-text-shadow"
        >
          {t("hero.title").split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block mr-[0.3em]"
            >
              {word}
            </motion.span>
          ))}{" "}
          <motion.span 
            initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="gradient-text-hero inline-block"
          >
            {t("hero.titleHighlight")}
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg lg:text-xl xl:text-2xl text-foreground/70 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-2"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pointer-events-auto px-4"
        >
          <Link 
            to="/auth?mode=signup" 
            className="btn-hero-glass text-white text-sm md:text-base lg:text-lg py-3 px-6 md:py-4 md:px-10 w-full sm:w-auto"
          >
            {t("hero.cta")}
          </Link>
          <a 
            href="#how-it-works" 
            className="btn-hero-secondary text-foreground text-sm md:text-base lg:text-lg py-3 px-6 md:py-4 md:px-10 w-full sm:w-auto"
          >
            {t("hero.secondary")}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator - hidden on small mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-foreground/20 flex items-start justify-center p-1.5 md:p-2"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
