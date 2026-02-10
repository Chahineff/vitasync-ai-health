import { useState, useEffect } from 'react';
import { BookOpen, ArrowSquareOut, Lightbulb, ShieldCheck, Warning, Flask } from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface KeyFinding {
  finding: string;
  confidence: string;
}

interface ClinicalReference {
  title: string;
  journal: string;
  year: number;
  url: string;
}

interface SafetyWarning {
  level: string;
  warning: string;
  detail: string;
}

interface ProductKnowledge {
  tldr: string | null;
  key_findings: KeyFinding[];
  clinical_references: ClinicalReference[];
  safety_warnings: SafetyWarning[];
  efficacy_score: string | null;
  product_name: string;
}

interface ScienceSectionProps {
  productTitle: string;
  productHandle?: string;
}

export function ScienceSection({ productTitle, productHandle }: ScienceSectionProps) {
  const [knowledge, setKnowledge] = useState<ProductKnowledge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKnowledge = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('product_knowledge' as any)
          .select('tldr, key_findings, clinical_references, safety_warnings, efficacy_score, product_name');

        if (productHandle) {
          query = query.eq('product_handle', productHandle);
        } else {
          query = query.ilike('product_name', `%${productTitle.split('(')[0].trim().split(' - ')[0].trim()}%`);
        }

        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          setKnowledge(data as unknown as ProductKnowledge);
        }
      } catch (err) {
        console.error('Failed to fetch product knowledge:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledge();
  }, [productHandle, productTitle]);

  if (loading) {
    return (
      <section className="py-8 space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen weight="light" className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">The Science (Simplified)</h2>
        </div>
        <Skeleton className="h-24 rounded-2xl" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-6 w-full" />)}
        </div>
      </section>
    );
  }

  if (!knowledge) {
    return <FallbackScience productTitle={productTitle} />;
  }

  const efficacyColor = knowledge.efficacy_score === 'fort' ? 'text-green-500' 
    : knowledge.efficacy_score === 'modéré' ? 'text-yellow-500' 
    : knowledge.efficacy_score === 'faible' ? 'text-orange-500'
    : 'text-red-500';

  return (
    <section className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen weight="light" className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">The Science (Simplified)</h2>
        </div>
        {knowledge.efficacy_score && (
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${efficacyColor} border-current/20 bg-current/5`}>
            Efficacité: {knowledge.efficacy_score}
          </span>
        )}
      </div>

      {/* TL;DR */}
      {knowledge.tldr && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
          <div className="flex items-start gap-3">
            <Lightbulb weight="fill" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary mb-1">TL;DR</p>
              <p className="text-foreground font-light text-sm leading-relaxed">{knowledge.tldr}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Findings */}
      {knowledge.key_findings?.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-foreground/60 font-medium flex items-center gap-2">
            <Flask weight="light" className="w-4 h-4" />
            Ce que disent les études :
          </p>
          <ul className="space-y-2">
            {knowledge.key_findings.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-foreground/70 font-light">
                <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                  item.confidence === 'high' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span>{item.finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety Warnings */}
      {knowledge.safety_warnings?.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-foreground/60 font-medium flex items-center gap-2">
            <ShieldCheck weight="light" className="w-4 h-4" />
            Sécurité & précautions :
          </p>
          <div className="space-y-2">
            {knowledge.safety_warnings.map((warning, index) => (
              <div key={index} className={`p-3 rounded-xl border text-sm ${
                warning.level === 'danger' ? 'bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400' :
                warning.level === 'caution' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                'bg-muted/30 border-border/30 text-foreground/60'
              }`}>
                <div className="flex items-start gap-2">
                  <Warning weight="fill" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{warning.warning}</p>
                    <p className="font-light text-xs mt-1 opacity-80">{warning.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical References */}
      {knowledge.clinical_references?.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-foreground/60 font-medium">Sources & références :</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {knowledge.clinical_references.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors group"
              >
                <ArrowSquareOut weight="light" className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                <div className="truncate">
                  <span className="text-sm text-foreground/60 font-light truncate group-hover:text-foreground transition-colors block">
                    {source.title}
                  </span>
                  <span className="text-xs text-foreground/30">{source.journal} ({source.year})</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-foreground/40 font-light">
        Ces informations sont fournies à titre éducatif uniquement et sont basées sur des rapports de recherche indépendants. Les résultats peuvent varier. Consultez un professionnel de santé pour des conseils personnalisés.
      </p>
    </section>
  );
}

// Fallback when no data exists
function FallbackScience({ productTitle }: { productTitle: string }) {
  return (
    <section className="py-8 space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen weight="light" className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">The Science (Simplified)</h2>
      </div>
      <div className="p-5 rounded-2xl bg-muted/30 border border-border/30">
        <p className="text-sm text-foreground/50 font-light">
          Les données scientifiques détaillées pour {productTitle} seront bientôt disponibles.
        </p>
      </div>
    </section>
  );
}
