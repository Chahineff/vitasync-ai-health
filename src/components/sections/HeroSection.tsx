import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      {/* Decorative Elements - smaller on mobile */}
      <div className="absolute top-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-40 md:w-80 h-40 md:h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container-custom relative z-10 py-8 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/5 border border-primary/10 text-xs md:text-sm text-primary mb-6 md:mb-8">
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
              className="text-base md:text-lg lg:text-xl text-foreground/60 mb-8 md:mb-10 max-w-xl mx-auto lg:mx-0 px-2 md:px-0"
            >
              VitaSync analyse vos besoins en temps réel pour créer la routine de compléments parfaite, adaptée à votre mode de vie.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start px-4 sm:px-0"
            >
              <Link to="/auth?mode=signup" className="btn-neumorphic text-primary-foreground text-sm md:text-base py-3 md:py-4 px-6 md:px-8">
                Démarrer mon bilan gratuit
              </Link>
              <a href="#how-it-works" className="btn-neumorphic-glass text-foreground text-sm md:text-base py-3 md:py-4 px-6 md:px-8">
                Comment ça marche
              </a>
            </motion.div>
          </div>

          {/* Right: Spline 3D Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2 relative h-[280px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px]"
          >
            {/* Glow effect behind the 3D scene */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-3xl opacity-60 pointer-events-none" />
            
            {/* Spline Web Component */}
            <spline-viewer 
              url="https://prod.spline.design/5LW01USsusus0KGB/scene.splinecode"
              style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
