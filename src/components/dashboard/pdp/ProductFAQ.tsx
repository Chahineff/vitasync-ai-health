import { useState } from 'react';
import { CaretDown, Question } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ProductFAQProps {
  productTitle: string;
}

export function ProductFAQ({ productTitle }: ProductFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How often can I take it?',
      answer: 'Follow the recommended dosage on the label. Most supplements are designed for daily use. Do not exceed the recommended dose unless advised by a healthcare professional.',
    },
    {
      question: 'When will I feel results?',
      answer: 'Results vary by individual and supplement type. Some effects may be noticed within days, while others may take 4-8 weeks of consistent use. Patience and consistency are key.',
    },
    {
      question: 'Can I combine with other supplements?',
      answer: 'Many supplements can be safely combined, but some may interact. Consult with a healthcare provider or our AI Coach for personalized stacking recommendations.',
    },
    {
      question: 'Is it okay to take daily?',
      answer: 'Yes, most supplements are formulated for daily use as part of your wellness routine. Follow the recommended dosage and listen to your body.',
    },
    {
      question: 'Does it contain allergens?',
      answer: 'Check the ingredient list and allergen information on the product label. Common allergens include dairy, soy, gluten, and shellfish. When in doubt, consult the full label.',
    },
    {
      question: 'Is it stimulant-free?',
      answer: 'Check the product details. Products containing caffeine, green tea extract, or guarana contain stimulants. Sleep and relaxation formulas are typically stimulant-free.',
    },
    {
      question: 'Best time to take it?',
      answer: 'Optimal timing depends on the supplement. Some are best taken with food, others on an empty stomach. Check the "How to Take" section for specific guidance.',
    },
    {
      question: 'Can beginners use it?',
      answer: 'Most supplements are suitable for beginners. Start with the minimum recommended dose to assess tolerance, then adjust as needed.',
    },
    {
      question: 'How should I store it?',
      answer: 'Store in a cool, dry place away from direct sunlight and heat. Keep the container tightly closed. Some products may require refrigeration after opening.',
    },
    {
      question: 'What if I miss a day?',
      answer: 'Missing an occasional dose is not a concern. Simply resume your normal schedule the next day. Do not double up to compensate for missed doses.',
    },
  ];

  return (
    <section className="py-8 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Question weight="light" className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <FAQItem
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

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="rounded-2xl bg-muted/30 border border-border/30 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-foreground font-light pr-4">{question}</span>
        <CaretDown 
          weight="light"
          className={cn(
            "w-5 h-5 text-foreground/50 transition-transform duration-300 flex-shrink-0",
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
          <div className="px-4 pb-4 pt-0">
            <p className="text-foreground/60 text-sm font-light leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
