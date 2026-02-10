import { useState } from 'react';
import { CaretDown, Warning, User, Pill, Baby, WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ParsedProductData } from '@/lib/shopify-parser';
import { EnrichedSafetyWarnings } from './types';

interface SafetyCautionsProps {
  parsedData: ParsedProductData | null;
  enrichedSafety?: EnrichedSafetyWarnings;
}

interface AccordionItemData {
  icon: React.ComponentType<{ className?: string; weight?: string }>;
  title: string;
  content: string;
}

export function SafetyCautions({ parsedData, enrichedSafety }: SafetyCautionsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const hasEnriched = !!enrichedSafety;

  const warnings = parsedData?.warnings || [];

  const accordionItems: AccordionItemData[] = [
    {
      icon: User,
      title: 'Qui devrait éviter ce produit ?',
      content: hasEnriched && enrichedSafety.contraindications.length > 0
        ? enrichedSafety.contraindications.join('. ')
        : warnings.length > 0
        ? warnings.join('. ')
        : 'Les personnes allergiques à l\'un des ingrédients. En cas de doute, consultez un professionnel de santé.',
    },
    {
      icon: Pill,
      title: 'Interactions médicamenteuses',
      content: hasEnriched && enrichedSafety.interactions.length > 0
        ? enrichedSafety.interactions.join('. ')
        : 'Si vous prenez des médicaments ou suivez un traitement médical, consultez votre médecin ou pharmacien avant utilisation.',
    },
    {
      icon: Baby,
      title: 'Grossesse & allaitement',
      content: hasEnriched
        ? (enrichedSafety.pregnancy_safe
          ? 'Ce produit est généralement considéré comme sûr pendant la grossesse et l\'allaitement, mais consultez votre médecin.'
          : 'Déconseillé aux femmes enceintes ou allaitantes sans avis médical préalable.')
        : 'Déconseillé aux femmes enceintes ou allaitantes sans avis médical préalable.',
    },
    {
      icon: WarningCircle,
      title: 'Allergènes',
      content: hasEnriched && enrichedSafety.allergens.length > 0
        ? `Contient ou peut contenir : ${enrichedSafety.allergens.join(', ')}.`
        : 'Vérifiez la liste des ingrédients pour les allergènes potentiels.',
    },
  ];

  return (
    <section className="py-12 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Warning weight="fill" className="w-5 h-5 text-amber-500" />
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
          Safety & Cautions
        </h2>
      </div>

      <div className="space-y-2">
        {accordionItems.map((item, index) => (
          <AccordionItem
            key={index}
            icon={item.icon}
            title={item.title}
            content={item.content}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>

      <p className="text-xs text-foreground/40 font-light pt-4">
        Les compléments alimentaires ne peuvent se substituer à une alimentation variée et équilibrée et à un mode de vie sain. Ne pas dépasser la dose journalière recommandée.
      </p>
    </section>
  );
}

interface AccordionItemProps {
  icon: React.ComponentType<{ className?: string; weight?: string }>;
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ icon: Icon, title, content, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="rounded-2xl bg-muted/30 border border-border/30 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <Icon weight="light" className="w-5 h-5 text-foreground/60" />
          <span className="text-foreground font-light">{title}</span>
        </div>
        <CaretDown
          weight="light"
          className={cn(
            "w-5 h-5 text-foreground/50 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0">
            <p className="text-foreground/60 text-sm font-light leading-relaxed pl-8">{content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
