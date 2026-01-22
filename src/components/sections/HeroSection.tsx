import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

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
      {/* Spline 3D Background with Parallax - pointer-events: none for smooth native scroll */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none"
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

      {/* Content Container with fade out on scroll */}
      <motion.div 
        className="relative z-10 px-6 sm:px-10 lg:px-16 py-24 text-center max-w-4xl mx-auto"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-sm md:text-base text-primary mb-8 backdrop-blur-md shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            Nouveau : Analyse vocale IA disponible
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] text-foreground mb-6 leading-[1.1] hero-text-shadow"
        >
          Votre Santé,{" "}
          <span className="gradient-text-hero">Propulsée par l'Intelligence Artificielle</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl lg:text-2xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          VitaSync analyse vos besoins en temps réel pour créer la routine de compléments parfaite, adaptée à votre mode de vie.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto"
        >
          <Link 
            to="/auth?mode=signup" 
            className="btn-hero-glass text-white text-base md:text-lg py-4 px-10"
          >
            Démarrer mon bilan gratuit
          </Link>
          <a 
            href="#how-it-works" 
            className="btn-hero-secondary text-foreground text-base md:text-lg py-4 px-10"
          >
            Comment ça marche
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-foreground/20 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-primary"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
