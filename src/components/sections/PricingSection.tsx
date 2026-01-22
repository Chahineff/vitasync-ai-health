import { Check, Star } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "/mois",
    description: "Découvrez le potentiel de l'IA santé",
    features: [
      "Accès au Coach IA basique",
      "5 conversations par jour",
      "Recommandations générales",
      "Historique 7 jours",
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Premium IA",
    price: "7,99€",
    period: "/mois",
    description: "L'expérience IA santé complète",
    features: [
      "Coach IA illimité (chat & voix)",
      "Analyse de documents (PDF, photos)",
      "Suivi proactif en temps réel",
      "Fonctionnalités vocales avancées",
      "Historique illimité",
      "Support prioritaire",
    ],
    cta: "Démarrer mon essai",
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="section-padding">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-16 px-2">
            <span className="text-xs md:text-sm text-secondary uppercase tracking-widest mb-3 md:mb-4 block">
              Tarification simple
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-3 md:mb-4">
              Choisissez votre niveau{" "}
              <span className="gradient-text-reverse">d'intelligence</span>
            </h2>
            <p className="text-sm md:text-lg text-foreground/50 max-w-2xl mx-auto px-4 md:px-0">
              Commencez gratuitement et évoluez vers Premium pour débloquer tout le potentiel de l'IA santé.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto px-2 md:px-0">
          {plans.map((plan, index) => (
            <ScrollReveal key={plan.name} delay={index * 0.1}>
              <GlassCard 
                className={cn(
                  "h-full relative",
                  plan.popular && "border-2 border-primary/30"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs md:text-sm font-medium">
                      <Star size={14} weight="fill" />
                      Recommandé
                    </span>
                  </div>
                )}

                <div className="p-5 md:p-8">
                  {/* Plan Header */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-light text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2 md:mb-3">
                      <span className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-foreground/50 text-sm md:text-base">{plan.period}</span>
                    </div>
                    <p className="text-xs md:text-sm text-foreground/50">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 md:gap-3">
                        <div className={cn(
                          "w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          plan.popular ? "bg-primary/20" : "bg-secondary/20"
                        )}>
                          <Check 
                            size={10} 
                            weight="bold" 
                            className={cn(plan.popular ? "text-primary" : "text-secondary", "md:hidden")} 
                          />
                          <Check 
                            size={12} 
                            weight="bold" 
                            className={cn(plan.popular ? "text-primary" : "text-secondary", "hidden md:block")} 
                          />
                        </div>
                        <span className="text-xs md:text-sm text-foreground/70">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link 
                    to="/auth?mode=signup"
                    className={cn(
                      "w-full block text-center text-sm md:text-base py-3 md:py-4",
                      plan.popular 
                        ? "btn-neumorphic text-primary-foreground" 
                        : "btn-neumorphic-glass text-foreground"
                    )}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Note */}
        <ScrollReveal delay={0.3}>
          <div className="mt-8 md:mt-12 text-center px-4">
            <GlassCard className="inline-block px-4 md:px-6 py-3 md:py-4">
              <p className="text-xs md:text-sm text-foreground/60">
                <span className="text-foreground/80">Note :</span> L'abonnement aux compléments physiques est proposé séparément.
              </p>
            </GlassCard>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
