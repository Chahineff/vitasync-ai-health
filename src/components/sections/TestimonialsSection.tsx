import { useState, useEffect, useCallback } from "react";
import { CaretLeft, CaretRight, Star } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const testimonials = [
  {
    name: "Marie L.",
    role: "Entrepreneure",
    content: "Mon sommeil profond a augmenté de 20% grâce aux recommandations de l'IA. Je me réveille enfin reposée !",
    metric: "+20% sommeil profond",
    avatar: "M"
  },
  {
    name: "Thomas D.",
    role: "Développeur",
    content: "L'analyse de mes biomarqueurs a révélé une carence en vitamine D que mon médecin avait manquée. Incroyable précision.",
    metric: "Carence détectée",
    avatar: "T"
  },
  {
    name: "Sophie B.",
    role: "Coach sportive",
    content: "En 3 mois, mon énergie quotidienne s'est transformée. VitaSync comprend vraiment les besoins des sportifs.",
    metric: "+45% énergie",
    avatar: "S"
  },
  {
    name: "Pierre M.",
    role: "Cadre dirigeant",
    content: "Le stress était mon ennemi. Grâce au stack personnalisé, je gère mes journées intenses avec sérénité.",
    metric: "-60% stress ressenti",
    avatar: "P"
  },
  {
    name: "Camille R.",
    role: "Médecin",
    content: "En tant que professionnelle de santé, je suis impressionnée par la rigueur scientifique de VitaSync.",
    metric: "Validé médicalement",
    avatar: "C"
  }
];

const accentColor = "rgba(0, 240, 255, 0.8)";
const accentGlow = "rgba(0, 240, 255, 0.1)";
const accentBorder = "rgba(0, 240, 255, 0.15)";

export function TestimonialsSection(): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="py-24 relative overflow-hidden bg-muted/20 dark:bg-[hsl(222_25%_4%)]">
      {/* Background glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${accentGlow}, transparent)`,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-[10px] md:text-xs text-primary font-medium tracking-[0.3em] uppercase">Témoignages</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mt-4 mb-6 text-foreground">
              Ce que disent nos <span className="gradient-text">utilisateurs</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-light">
              Découvrez comment VitaSync transforme la santé de milliers de personnes.
            </p>
          </div>
        </ScrollReveal>

        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 p-3 rounded-full border border-border/30 dark:border-white/10 bg-background/50 dark:bg-white/5 hover:bg-background/80 dark:hover:bg-white/10 transition-all hidden md:flex items-center justify-center backdrop-blur-sm"
          >
            <CaretLeft weight="bold" className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 p-3 rounded-full border border-border/30 dark:border-white/10 bg-background/50 dark:bg-white/5 hover:bg-background/80 dark:hover:bg-white/10 transition-all hidden md:flex items-center justify-center backdrop-blur-sm"
          >
            <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Testimonial Card */}
          <div
            className="relative rounded-3xl overflow-hidden bg-white/70 dark:bg-transparent backdrop-blur-xl dark:backdrop-blur-none border dark:border-0"
            style={{ borderColor: "rgba(0, 200, 220, 0.15)" }}
          >
            {/* Dark mode bg */}
            <div 
              className="absolute inset-0 hidden dark:block rounded-3xl"
              style={{
                background: "hsl(220 20% 8% / 0.92)",
                border: `1px solid ${accentBorder}`,
                boxShadow: `0 0 50px ${accentGlow}, 0 20px 50px rgba(0,0,0,0.3)`,
              }}
            />
            {/* Light mode shadow */}
            <div 
              className="absolute inset-0 dark:hidden rounded-3xl pointer-events-none"
              style={{ boxShadow: `0 0 30px ${accentGlow}, 0 15px 40px rgba(0,0,0,0.04)` }}
            />
            {/* Accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px z-10"
              style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 p-8 md:p-12"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-primary/15 dark:bg-primary/20 flex items-center justify-center text-2xl font-semibold text-primary mb-6 border border-primary/20">
                    {testimonials[currentIndex].avatar}
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} weight="fill" className="w-5 h-5 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg md:text-xl text-foreground/80 font-light leading-relaxed mb-6 max-w-2xl">
                    "{testimonials[currentIndex].content}"
                  </blockquote>

                  {/* Metric Badge */}
                  <div 
                    className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
                    style={{ 
                      background: `${accentColor}12`,
                      color: accentColor,
                      border: `1px solid ${accentBorder}`,
                    }}
                  >
                    {testimonials[currentIndex].metric}
                  </div>

                  {/* Author */}
                  <div>
                    <p className="font-medium text-foreground">{testimonials[currentIndex].name}</p>
                    <p className="text-sm text-muted-foreground">{testimonials[currentIndex].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: index === currentIndex ? 28 : 8,
                  height: 8,
                  background: index === currentIndex ? accentColor : "hsl(var(--foreground) / 0.12)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
