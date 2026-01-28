import { useState, useEffect, useCallback } from "react";
import { CaretLeft, CaretRight, Star } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";

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

export function TestimonialsSection() {
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
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-medium tracking-wider uppercase">Témoignages</span>
            <h2 className="text-4xl md:text-5xl font-light mt-4 mb-6 text-foreground">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all hidden md:flex items-center justify-center"
          >
            <CaretLeft weight="bold" className="w-5 h-5 text-foreground/60" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all hidden md:flex items-center justify-center"
          >
            <CaretRight weight="bold" className="w-5 h-5 text-foreground/60" />
          </button>

          {/* Testimonial Card */}
          <GlassCard className="p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-semibold text-primary mb-6">
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
              <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                {testimonials[currentIndex].metric}
              </div>

              {/* Author */}
              <div>
                <p className="font-medium text-foreground">{testimonials[currentIndex].name}</p>
                <p className="text-sm text-foreground/60">{testimonials[currentIndex].role}</p>
              </div>
            </div>
          </GlassCard>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-foreground/20 hover:bg-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
