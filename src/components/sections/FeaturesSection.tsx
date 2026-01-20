import { 
  Robot, 
  ChartLineUp, 
  FileMagnifyingGlass, 
  ShieldCheck 
} from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";

const features = [
  {
    icon: Robot,
    title: "Coach IA disponible 24/7",
    description: "Votre assistant personnel répond à vos questions de santé à tout moment, par chat ou par voix.",
    gradient: "from-primary to-primary/60",
  },
  {
    icon: ChartLineUp,
    title: "Suivi proactif en temps réel",
    description: "L'IA analyse vos données continuellement et ajuste ses recommandations automatiquement.",
    gradient: "from-secondary to-secondary/60",
  },
  {
    icon: FileMagnifyingGlass,
    title: "Analyse de biomarqueurs",
    description: "Importez vos résultats d'analyses (PDF/Photos) pour des recommandations ultra-précises.",
    gradient: "from-accent to-accent/60",
  },
  {
    icon: ShieldCheck,
    title: "Qualité pharmaceutique",
    description: "Compléments de grade médical, testés en laboratoire, avec traçabilité complète.",
    gradient: "from-primary via-accent to-secondary",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm text-secondary uppercase tracking-widest mb-4 block">
              Technologie de pointe
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-4">
              Une IA qui{" "}
              <span className="gradient-text-reverse">comprend vraiment</span>
              {" "}votre corps
            </h2>
            <p className="text-lg text-foreground/50 max-w-2xl mx-auto">
              Découvrez les fonctionnalités qui font de VitaSync le coach santé le plus avancé du marché.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 0.1}>
              <GlassCard hover className="h-full group">
                {/* Icon with gradient background */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6`}>
                  <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                    <feature.icon 
                      size={26} 
                      weight="light" 
                      className="text-foreground group-hover:text-primary-foreground transition-colors duration-300" 
                    />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-light tracking-tight text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground/50">
                  {feature.description}
                </p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
