import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

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
    <div
      className={cn(
        "rounded-2xl overflow-hidden relative border backdrop-blur-xl transition-colors duration-200",
        "bg-card/80 border-border/60",
        isOpen
          ? "shadow-[0_8px_32px_-12px_hsl(var(--primary)/0.18)] border-primary/30"
          : "shadow-[0_2px_12px_-4px_hsl(var(--foreground)/0.06)] hover:border-border"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className={cn(
          "text-foreground font-normal text-base md:text-lg leading-snug transition-colors",
          isOpen ? "text-foreground" : "text-foreground/85 group-hover:text-foreground"
        )}>
          {question}
        </span>
        <span className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300",
          isOpen
            ? "border-primary/40 bg-primary/10 text-primary rotate-180"
            : "border-border/60 text-foreground/50 group-hover:border-foreground/40 group-hover:text-foreground/80"
        )}>
          <CaretDown size={14} weight="bold" />
        </span>
      </button>
      <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="px-5 md:px-6 pb-6 pt-0">
            <div className="h-px bg-border/40 mb-4" aria-hidden="true" />
            <p className="text-sm md:text-base text-foreground/65 leading-relaxed font-light">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useTranslation();

  const faqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
  ];

  return (
    <section id="faq" className="section-padding bg-transparent section-parallax">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block text-xs md:text-sm text-primary uppercase tracking-[0.3em] mb-4 font-medium">
              {t("faq.title")}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-4">
              {t("faq.sectionTitle")}{" "}
              <span className="gradient-text font-medium" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                {t("faq.sectionTitleHighlight")}
              </span>
            </h2>
            <p className="text-base md:text-lg text-foreground/55 max-w-2xl mx-auto font-light">
              {t("faq.sectionSubtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
          {faqs.map((faq, index) => (
            <ScrollReveal key={index} delay={index * 0.05}>
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
