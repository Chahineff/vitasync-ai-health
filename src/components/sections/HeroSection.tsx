import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      {/* Spline Background - Full Screen with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y, scale }}
      >
        <spline-viewer 
          url="https://prod.spline.design/9TTyk0TgEbKUqqjz/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
        {/* Overlay for text readability - reduced opacity */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent pointer-events-none"
          style={{ opacity }}
        />
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none z-[1]" />
      <div className="absolute bottom-1/4 left-1/4 w-40 md:w-80 h-40 md:h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none z-[1]" />
      
      <div className="container-custom relative z-10 py-8 lg:py-20">
        <div className="max-w-2xl text-left">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20 text-xs md:text-sm text-primary mb-6 md:mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-secondary animate-pulse" />
              Nouveau : Analyse vocale IA disponible
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-foreground mb-4 md:mb-6 text-balance leading-tight"
          >
            Votre Santé,{" "}
            <span className="gradient-text">Propulsée par l'Intelligence Artificielle</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg lg:text-xl text-foreground/70 mb-8 md:mb-10 max-w-xl"
          >
            VitaSync analyse vos besoins en temps réel pour créer la routine de compléments parfaite, adaptée à votre mode de vie.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4"
          >
            <Link to="/auth?mode=signup" className="btn-neumorphic text-primary-foreground text-sm md:text-base py-3 md:py-4 px-6 md:px-8">
              Démarrer mon bilan gratuit
            </Link>
            <a href="#how-it-works" className="btn-neumorphic-glass text-foreground text-sm md:text-base py-3 md:py-4 px-6 md:px-8 backdrop-blur-sm">
              Comment ça marche
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
