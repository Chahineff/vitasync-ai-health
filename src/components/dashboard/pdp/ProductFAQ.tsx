import { useState } from 'react';
import { CaretDown, Question } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { FAQItem } from './types';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductFAQProps {
  productTitle: string;
  enrichedFaq?: FAQItem[];
}

export function ProductFAQ({ productTitle, enrichedFaq }: ProductFAQProps) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs: FAQItem[] = [
    { question: t('pdp.faqDefaultQ1'), answer: t('pdp.faqDefaultA1') },
    { question: t('pdp.faqDefaultQ2'), answer: t('pdp.faqDefaultA2') },
    { question: t('pdp.faqDefaultQ3'), answer: t('pdp.faqDefaultA3') },
    { question: t('pdp.faqDefaultQ4'), answer: t('pdp.faqDefaultA4') },
    { question: t('pdp.faqDefaultQ5'), answer: t('pdp.faqDefaultA5') },
  ];

  const faqs = enrichedFaq && enrichedFaq.length > 0 ? enrichedFaq : defaultFaqs;

  return (
    <section className="py-12 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Question weight="light" className="w-5 h-5 text-primary" />
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
          {t('pdp.faqTitle')}
        </h2>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <FAQAccordionItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
}

function FAQAccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-2xl bg-muted/30 border border-border/30 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors" aria-expanded={isOpen}>
        <span className="text-foreground font-light pr-4">{question}</span>
        <CaretDown weight="light" className={cn("w-5 h-5 text-foreground/50 transition-transform duration-300 flex-shrink-0", isOpen && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0">
            <p className="text-foreground/60 text-sm font-light leading-relaxed">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
