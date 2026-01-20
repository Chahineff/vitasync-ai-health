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
    avatar: "M",
  },
  {
    name: "Thomas D.",
    role: "Développeur",
    content: "L'analyse de mes biomarqueurs a révélé une carence en vitamine D que mon médecin avait manquée. Incroyable précision.",
    metric: "Carence détectée",
    avatar: "T",
  },
  {
    name: "Sophie B.",
    role: "Coach sportive",
    content: "En 3 mois, mon énergie quotidienne s'est transformée. VitaSync comprend vraiment les besoins des sportifs.",
    metric: "+45% énergie",
    avatar: "S",
  },
  {
    name: "Pierre M.",
    role: "Cadre dirigeant",
    content: "Le stress était mon ennemi. Grâce au stack personnalisé, je gère mes journées intenses avec sérénité.",
    metric: "-60% stress ressenti",
    avatar: "P",
  },
  {
    name: "Camille R.",
    role: "Médecin",
    content: "En tant que professionnelle de santé, je suis impressionnée par la rigueur scientifique de VitaSync.",
    metric: "Validé médicalement",
    avatar: "C",
  },
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
    <section id="testimonials" className="section-padding bg-gradient-subtle">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm text-primary uppercase tracking-widest mb-4 block">
              Témoignages
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-4">
              Des résultats{" "}
              <span className="gradient-text">mesurables</span>
            </h2>
            <p className="text-lg text-foreground/50 max-w-2xl mx-auto">
              Découvrez comment VitaSync a transformé la vie de nos utilisateurs.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div 
            className="relative max-w-4xl mx-auto"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Main Testimonial */}
            <GlassCard className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} weight="fill" className="text-secondary" />
                  ))}
                </div>

                {/* Metric Badge */}
                <span className="inline-flex px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  {testimonials[currentIndex].metric}
                </span>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl font-light text-foreground/80 mb-8 max-w-2xl">
                  "{testimonials[currentIndex].content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-primary-foreground font-medium">
                      {testimonials[currentIndex].avatar}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-foreground font-medium">
                      {testimonials[currentIndex].name}
                    </p>
                    <p className="text-sm text-foreground/50">
                      {testimonials[currentIndex].role}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                aria-label="Previous testimonial"
              >
                <CaretLeft size={24} weight="light" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? "w-8 bg-gradient-to-r from-primary to-secondary" 
                        : "bg-foreground/20 hover:bg-foreground/40"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                aria-label="Next testimonial"
              >
                <CaretRight size={24} weight="light" />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
