import { Star } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const testimonials = [
  {
    name: "Marie L.",
    role: "Entrepreneure",
    content: "Mon sommeil profond a augmenté de 20% grâce aux recommandations de l'IA. Je me réveille enfin reposée !",
    metric: "+20% sommeil profond",
  },
  {
    name: "Thomas D.",
    role: "Développeur",
    content: "L'analyse de mes biomarqueurs a révélé une carence en vitamine D que mon médecin avait manquée.",
    metric: "Carence détectée",
  },
  {
    name: "Sophie B.",
    role: "Coach sportive",
    content: "En 3 mois, mon énergie quotidienne s'est transformée. VitaSync comprend vraiment les besoins des sportifs.",
    metric: "+45% énergie",
  },
  {
    name: "Pierre M.",
    role: "Cadre dirigeant",
    content: "Le stress était mon ennemi. Grâce au stack personnalisé, je gère mes journées intenses avec sérénité.",
    metric: "-60% stress",
  },
  {
    name: "Camille R.",
    role: "Médecin",
    content: "En tant que professionnelle de santé, je suis impressionnée par la rigueur scientifique de VitaSync.",
    metric: "Validé médicalement",
  },
  {
    name: "Lucas T.",
    role: "Étudiant",
    content: "Ma concentration en période d'examens a complètement changé. Le stack focus est incroyable.",
    metric: "+35% concentration",
  },
];

function TestimonialCard({ name, role, content, metric }: typeof testimonials[0]) {
  return (
    <div className="flex-shrink-0 w-[320px] md:w-[380px] glass-card-premium rounded-2xl p-6 md:p-8">
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} weight="fill" className="w-4 h-4 text-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-sm md:text-base text-foreground/70 leading-relaxed mb-5 line-clamp-4">
        "{content}"
      </blockquote>

      {/* Metric */}
      <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
        {metric}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-medium text-primary">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-foreground/40">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  // Duplicate for infinite loop
  const allCards = [...testimonials, ...testimonials];

  return (
    <section className="py-20 md:py-28 overflow-hidden">
      <div className="container-custom mb-12">
        <ScrollReveal>
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block">Témoignages</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Ce que disent nos{" "}
              <span className="font-editorial italic text-primary">utilisateurs</span>
            </h2>
            <p className="text-foreground/50 max-w-lg mx-auto text-base">
              Découvrez comment VitaSync transforme la santé de milliers de personnes.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className="testimonial-carousel">
          {allCards.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}
