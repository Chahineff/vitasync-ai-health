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
    <>
      {/* Light mode */}
      <div
        className="dark:hidden rounded-2xl overflow-hidden relative bg-white/70 backdrop-blur-xl border border-border/60"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, rgba(0,240,255,0.4), rgba(0,240,255,0.1))" }} />
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
        <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="px-6 pb-6 pt-0">
              <p className="text-foreground/60">{answer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dark mode */}
      <div
        className="hidden dark:block rounded-2xl overflow-hidden relative border border-white/[0.06]"
        style={{
          background: "hsl(220 20% 8% / 0.92)",
          boxShadow: "0 0 20px rgba(0, 240, 255, 0.04), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, rgba(0,240,255,0.3), rgba(0,240,255,0.05))" }} />
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
        <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="px-6 pb-6 pt-0">
              <p className="text-foreground/60">{answer}</p>
            </div>
          </div>
        </div>
      </div>
    </>
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
    <section id="faq" className="section-padding bg-background dark:bg-[hsl(222_25%_5%)]">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm text-primary uppercase tracking-[0.3em] mb-4 block">
              {t("faq.title")}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-4">
              {t("faq.sectionTitle")}{" "}
              <span className="gradient-text">{t("faq.sectionTitleHighlight")}</span>
            </h2>
            <p className="text-lg text-foreground/50 max-w-2xl mx-auto">
              {t("faq.sectionSubtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto space-y-4">
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
