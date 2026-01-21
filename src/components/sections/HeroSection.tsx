import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const splineContainerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Allow scroll through Spline animation
  useEffect(() => {
    const container = splineContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      window.scrollBy({
        top: e.deltaY,
        behavior: 'auto'
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: true });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Float animation for the Spline container
  const floatAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none z-[1]" />
      <div className="absolute bottom-1/4 left-1/4 w-40 md:w-80 h-40 md:h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none z-[1]" />
      
      {/* Two-column grid layout */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 lg:gap-4 items-center max-w-7xl mx-auto">
          
          {/* Left Column - Text Content */}
          <div className="text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-primary/10 border border-primary/20 text-sm md:text-base text-primary mb-6 md:mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-secondary animate-pulse" />
                Nouveau : Analyse vocale IA disponible
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-extrabold tracking-[-0.05em] text-foreground mb-4 md:mb-6 text-balance leading-tight"
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
              <Link 
                to="/auth?mode=signup" 
                className="btn-hero-primary text-primary-foreground text-sm md:text-base py-3 md:py-4 px-6 md:px-8"
              >
                Démarrer mon bilan gratuit
              </Link>
              <a 
                href="#how-it-works" 
                className="btn-neumorphic-glass text-foreground text-sm md:text-base py-3 md:py-4 px-6 md:px-8 backdrop-blur-sm"
              >
                Comment ça marche
              </a>
            </motion.div>
          </div>

          {/* Right Column - Spline Animation */}
          <motion.div 
            ref={splineContainerRef}
            className="relative order-1 lg:order-2 flex justify-center lg:justify-end overflow-visible"
            style={{ y }}
            animate={floatAnimation}
          >
            <motion.div 
              className="relative aspect-square w-full max-w-[500px] lg:max-w-none lg:w-[120%] lg:-mr-[10%]"
              style={{ opacity }}
            >
              <spline-viewer 
                url="https://prod.spline.design/9TTyk0TgEbKUqqjz/scene.splinecode"
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
