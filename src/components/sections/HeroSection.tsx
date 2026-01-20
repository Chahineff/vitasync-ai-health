import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      
      <div className="container-custom relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
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
              <a href="#pricing" className="btn-neumorphic text-primary-foreground">
                Démarrer mon bilan gratuit
              </a>
              <a href="#how-it-works" className="btn-neumorphic-glass text-foreground">
                Comment ça marche
              </a>
            </motion.div>
          </div>

          {/* Right Side - Spline 3D Reactive Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[380px] sm:h-[480px] lg:h-[580px]"
          >
            {/* @ts-ignore */}
            <spline-viewer 
              url="https://prod.spline.design/SesUS9CodeODnLXa/scene.splinecode"
              style={{ width: '100%', height: '100%' }}
            />
          </motion.div>
        </div>

        {/* Dashboard Mockup */}
        <ScrollReveal delay={0.4} className="mt-16 md:mt-24">
          <div className="relative max-w-5xl mx-auto">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl opacity-50 animate-pulse-glow" />
            
            {/* Dashboard Card */}
            <div className="relative glass-card-strong p-4 md:p-8 rounded-3xl shadow-2xl">
              {/* Top Bar */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-destructive/50" />
                <div className="w-3 h-3 rounded-full bg-secondary/50" />
                <div className="w-3 h-3 rounded-full bg-primary/50" />
              </div>

              {/* Dashboard Content */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Health Score */}
                <div className="glass-card p-6">
                  <p className="text-sm text-foreground/50 mb-2">Score Santé Global</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-light text-foreground">87</span>
                    <span className="text-sm text-secondary mb-1">+12%</span>
                  </div>
                  <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[87%] bg-gradient-to-r from-primary to-secondary rounded-full" />
                  </div>
                </div>

                {/* Sleep Quality */}
                <div className="glass-card p-6">
                  <p className="text-sm text-foreground/50 mb-2">Qualité du Sommeil</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-light text-foreground">92%</span>
                    <span className="text-sm text-secondary mb-1">Optimal</span>
                  </div>
                  <div className="mt-4 flex gap-1">
                    {[80, 65, 90, 85, 95, 88, 92].map((h, i) => (
                      <div key={i} className="flex-1 bg-muted rounded-full overflow-hidden h-12">
                        <div 
                          className="w-full bg-gradient-to-t from-primary/60 to-secondary/60 rounded-full mt-auto" 
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Energy Level */}
                <div className="glass-card p-6">
                  <p className="text-sm text-foreground/50 mb-2">Niveau d'Énergie</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-light text-foreground">Élevé</span>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {["Matin", "Midi", "Après-midi", "Soir"].map((time, i) => (
                      <div key={time} className="text-center">
                        <div className={`w-full h-8 rounded-lg ${i < 3 ? 'bg-secondary/30' : 'bg-primary/20'}`} />
                        <span className="text-xs text-foreground/40 mt-1 block">{time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Assistant Preview */}
              <div className="mt-6 glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground text-sm">IA</span>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">
                      D'après vos données, je recommande d'augmenter votre apport en magnésium. Votre qualité de sommeil s'est améliorée de 20% ce mois-ci. Continuez ainsi ! 🌙
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">Magnésium</span>
                      <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs">Sommeil</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
