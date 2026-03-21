import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const { t } = useTranslation();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Shader Background */}
      <div ref={containerRef} className="absolute inset-0 z-0">
        {/* SVG Filters for gooey effect */}
        <svg className="absolute w-0 h-0">
          <defs>
            <filter id="gooey">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="gooey" />
              <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
            </filter>
          </defs>
        </svg>

        <MeshGradient
          style={{ width: "100%", height: "100%" }}
          speed={0.15}
          color1="#00f0ff"
          color2="#0066ff"
          color3="#00d787"
          color4="#001a33"
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-background/50 dark:bg-background/60" />
      </div>

      {/* Content Container with fade out on scroll */}
      <motion.div 
        className="relative z-10 px-4 sm:px-6 lg:px-16 py-16 md:py-24 text-center max-w-5xl mx-auto"
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
          className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-foreground/70 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2"
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
            className="btn-hero-glass text-white text-base md:text-lg lg:text-xl py-3.5 px-8 md:py-5 md:px-12 w-full sm:w-auto"
          >
            {t("hero.cta")}
          </Link>
          <a 
            href="#how-it-works" 
            className="btn-hero-secondary text-foreground text-base md:text-lg lg:text-xl py-3.5 px-8 md:py-5 md:px-12 w-full sm:w-auto"
          >
            {t("hero.secondary")}
          </a>
        </motion.div>
      </motion.div>

      {/* Pulsing Border Orb - bottom center */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="relative w-16 h-16 md:w-20 md:h-20">
          <PulsingBorder
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
            }}
            color1="#00f0ff"
            color2="#0066ff"
            speed={1.5}
          />
          {/* Scroll indicator inside */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 md:w-1.5 md:h-4 rounded-full bg-primary/60"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
