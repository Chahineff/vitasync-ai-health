import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  // Parallax effect based on scroll - Hero fades, scales down, and blurs as user scrolls
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Spline background transforms
  const splineY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const splineScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.95, 0.9]);
  const splineOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.6, 0.2]);
  const splineBlur = useTransform(scrollYProgress, [0, 0.5, 1], [0, 5, 15]);

  // Content transforms - fades out faster
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Spline 3D Background with Parallax - Hidden on mobile for performance */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none hidden md:block"
        style={{ 
          y: splineY, 
          scale: splineScale,
          opacity: splineOpacity,
          filter: useTransform(splineBlur, (v) => `blur(${v}px)`)
        }}
      >
        <spline-viewer 
          url="https://prod.spline.design/lp2LRzHKPG0tDDPn/scene.splinecode"
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
      </motion.div>
      
      {/* Mobile background fallback */}
      <div className="absolute inset-0 z-0 md:hidden bg-gradient-mesh" />
      <div className="absolute inset-0 z-0 md:hidden bg-gradient-to-b from-background/20 via-background/60 to-background" />

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
          <span className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-white/10 border border-white/20 text-xs md:text-sm text-primary mb-6 md:mb-8 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-secondary animate-pulse" />
            {t("hero.badge")}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-[-0.04em] text-foreground mb-4 md:mb-6 leading-[1.1] hero-text-shadow"
        >
          {t("hero.title")}{" "}
          <span className="gradient-text-hero">{t("hero.titleHighlight")}</span>
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
