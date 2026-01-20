import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-[120vh] lg:min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container-custom relative z-10 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary mb-8">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Nouveau : Analyse vocale IA disponible
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-foreground mb-6 text-balance"
            >
              Votre Santé,{" "}
              <span className="gradient-text">Propulsée par l'Intelligence Artificielle</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-foreground/60 mb-10 max-w-xl mx-auto lg:mx-0"
            >
              VitaSync analyse vos besoins en temps réel pour créer la routine de compléments parfaite, adaptée à votre mode de vie.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/auth?mode=signup" className="btn-neumorphic text-primary-foreground">
                Démarrer mon bilan gratuit
              </Link>
              <a href="#how-it-works" className="btn-neumorphic-glass text-foreground">
                Comment ça marche
              </a>
            </motion.div>
          </div>

          {/* Right: Spline 3D Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2 relative h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px]"
          >
            {/* Slightly darker background for better visibility */}
            <div className="absolute inset-0 bg-foreground/5 rounded-2xl" />
            
            {/* Glow effect behind the 3D scene */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-3xl opacity-60 pointer-events-none" />
            
            {/* Spline Web Component - scaled down for better framing */}
            <div className="w-full h-full flex items-center justify-center" style={{ transform: 'scale(0.6)', transformOrigin: 'center center' }}>
              <spline-viewer 
                url="https://prod.spline.design/tX4bFFTJveu7haxH/scene.splinecode"
                style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
