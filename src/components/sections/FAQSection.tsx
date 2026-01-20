import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Comment l'IA protège-t-elle mes données de santé ?",
    answer: "Vos données sont chiffrées de bout en bout avec un protocole AES-256. Nous sommes conformes RGPD et certifiés HDS (Hébergeur de Données de Santé). Vos informations ne sont jamais partagées avec des tiers et vous pouvez les supprimer à tout moment.",
  },
  {
    question: "Comment fonctionne l'analyse des documents médicaux ?",
    answer: "Notre IA utilise la reconnaissance d'image avancée et le traitement du langage naturel pour extraire et interpréter vos résultats d'analyses. Il suffit de prendre une photo ou d'uploader un PDF, et l'IA analyse vos biomarqueurs en quelques secondes.",
  },
  {
    question: "D'où viennent les compléments alimentaires ?",
    answer: "Nos compléments sont fabriqués en France dans des laboratoires certifiés GMP (Bonnes Pratiques de Fabrication). Chaque lot est testé par des laboratoires indépendants pour garantir pureté et efficacité. Nous privilégions les formes bioactives pour une absorption optimale.",
  },
  {
    question: "Puis-je annuler mon abonnement à tout moment ?",
    answer: "Absolument. Vous pouvez annuler votre abonnement Premium IA ou votre abonnement compléments à tout moment depuis votre espace personnel. Aucun engagement, aucun frais caché.",
  },
  {
    question: "L'IA peut-elle remplacer mon médecin ?",
    answer: "Non. VitaSync est un outil d'accompagnement et de prévention, pas un substitut médical. Notre IA vous aide à mieux comprendre votre corps et à optimiser votre nutrition, mais elle ne pose pas de diagnostic. Pour toute question médicale, consultez un professionnel de santé.",
  },
];

function FAQItem({ 
  question, 
  answer, 
  isOpen, 
  onToggle 
}: { 
  question: string; 
  answer: string; 
  isOpen: boolean; 
  onToggle: () => void;
}) {
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-foreground font-light pr-4">{question}</span>
        <CaretDown 
          size={20} 
          weight="light"
          className={cn(
            "text-foreground/50 transition-transform duration-300 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-0">
            <p className="text-foreground/60">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-padding bg-gradient-subtle">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm text-primary uppercase tracking-widest mb-4 block">
              Questions fréquentes
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-4">
              Tout ce que vous devez{" "}
              <span className="gradient-text">savoir</span>
            </h2>
            <p className="text-lg text-foreground/50 max-w-2xl mx-auto">
              Des questions ? Nous avons les réponses.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <ScrollReveal key={faq.question} delay={index * 0.05}>
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
