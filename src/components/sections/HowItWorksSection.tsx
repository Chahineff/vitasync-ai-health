import { ChatCircle, FileArrowUp, Package } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
const steps = [
  {
    icon: ChatCircle,
    title: "Échangez avec votre Coach IA",
    description: "Clarifiez vos objectifs (sommeil, stress, énergie) par chat ou voix. Notre IA comprend vos besoins en profondeur.",
    color: "primary",
  },
  {
    icon: FileArrowUp,
    title: "Analyse Poussée (Optionnel)",
    description: "Importez vos analyses sanguines pour une précision maximale. L'IA interprète vos biomarqueurs instantanément.",
    color: "accent",
  },
  {
    icon: Package,
    title: "Recevez votre Stack",
    description: "Abonnez-vous à votre pack personnalisé de compléments, ajusté mensuellement selon vos progrès.",
    color: "secondary",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-padding bg-gradient-subtle">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-16 px-2">
            <span className="text-xs md:text-sm text-primary uppercase tracking-widest mb-3 md:mb-4 block">
              Processus simple
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-3 md:mb-4">
              Votre parcours vers une{" "}
              <span className="gradient-text">santé optimisée</span>
            </h2>
            <p className="text-sm md:text-lg text-foreground/50 max-w-2xl mx-auto px-4 md:px-0">
              En trois étapes simples, découvrez une approche personnalisée de la nutrition et du bien-être.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
          {steps.map((step, index) => (
            <ScrollReveal key={step.title} delay={index * 0.1}>
              <GlassCard hover className="h-full relative p-4 md:p-6">

                {/* Icon */}
                <div className="icon-container mb-4 md:mb-6 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl">
                  <step.icon 
                    size={20} 
                    weight="light" 
                    className={cn(
                      step.color === "primary" ? "text-primary" : step.color === "secondary" ? "text-secondary" : "text-accent",
                      "md:hidden"
                    )} 
                  />
                  <step.icon 
                    size={28} 
                    weight="light" 
                    className={cn(
                      step.color === "primary" ? "text-primary" : step.color === "secondary" ? "text-secondary" : "text-accent",
                      "hidden md:block"
                    )} 
                  />
                </div>

                {/* Content */}
                <h3 className="text-base md:text-xl font-light tracking-tight text-foreground mb-2 md:mb-3">
                  {step.title}
                </h3>
                <p className="text-xs md:text-base text-foreground/50">
                  {step.description}
                </p>

                {/* Connector Line (not on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-2 md:-right-4 w-4 md:w-8 h-px bg-gradient-to-r from-border to-transparent" />
                )}
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
