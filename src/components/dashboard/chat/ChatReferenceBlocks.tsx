import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Pill, TestTube, FileText, DownloadSimple, 
  CaretDown, CaretUp, ShieldCheck, Lightning, Moon,
  Barbell, Brain, Warning, Package
} from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { useSupplementTracking } from '@/hooks/useSupplementTracking';
import { useEnrichedProductData } from '@/hooks/useEnrichedProductData';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ── Parse reference blocks from AI content ──
export function parseReferenceBlocks(content: string): {
  text: string;
  references: Array<{ type: string; id?: string; placeholder: string }>;
} {
  const references: Array<{ type: string; id?: string; placeholder: string }> = [];
  let text = content;

  // [[HEALTH_PROFILE]]
  text = text.replace(/\[\[HEALTH_PROFILE\]\]/g, () => {
    const ph = `__REF_${references.length}__`;
    references.push({ type: 'health_profile', placeholder: ph });
    return ph;
  });

  // [[BLOOD_TEST:id]]
  text = text.replace(/\[\[BLOOD_TEST:([^\]]+)\]\]/g, (_, id) => {
    const ph = `__REF_${references.length}__`;
    references.push({ type: 'blood_test', id: id.trim(), placeholder: ph });
    return ph;
  });

  // [[MY_STACK]]
  text = text.replace(/\[\[MY_STACK\]\]/g, () => {
    const ph = `__REF_${references.length}__`;
    references.push({ type: 'my_stack', placeholder: ph });
    return ph;
  });

  // [[PRODUCT_DETAIL:productTitle]]
  text = text.replace(/\[\[PRODUCT_DETAIL:([^\]]+)\]\]/g, (_, id) => {
    const ph = `__REF_${references.length}__`;
    references.push({ type: 'product_detail', id: id.trim(), placeholder: ph });
    return ph;
  });

  // [[REPORT:type]]
  text = text.replace(/\[\[REPORT:([^\]]+)\]\]/g, (_, type) => {
    const ph = `__REF_${references.length}__`;
    references.push({ type: 'report', id: type.trim(), placeholder: ph });
    return ph;
  });

  return { text, references };
}

// ── Health Profile Card ──
export function HealthProfileCard() {
  const { healthProfile, loading } = useHealthProfile();

  if (loading) return <Skeleton className="h-32 w-full rounded-2xl" />;
  if (!healthProfile) return <CardShell icon={Heart} title="Profil santé"><p className="text-xs text-muted-foreground">Profil non configuré</p></CardShell>;

  const items = [
    healthProfile.health_goals?.length && { label: 'Objectifs', value: healthProfile.health_goals.join(', ') },
    healthProfile.activity_level && { label: 'Activité', value: healthProfile.activity_level },
    healthProfile.diet_type && { label: 'Alimentation', value: healthProfile.diet_type },
    healthProfile.sleep_quality && { label: 'Sommeil', value: healthProfile.sleep_quality },
    healthProfile.stress_level && { label: 'Stress', value: healthProfile.stress_level },
    healthProfile.allergies?.length && { label: '⚠️ Allergies', value: healthProfile.allergies.join(', ') },
    healthProfile.medical_conditions?.length && { label: '⚠️ Conditions', value: healthProfile.medical_conditions.join(', ') },
    healthProfile.monthly_budget && { label: 'Budget', value: healthProfile.monthly_budget },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <CollapsibleCard icon={Heart} title="Mon profil santé" color="primary">
      <div className="grid gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-start gap-2 text-xs">
            <span className="text-muted-foreground font-medium shrink-0">{item.label}</span>
            <span className="text-foreground text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}

// ── Blood Test Card ──
export function BloodTestCard({ analysisId }: { analysisId: string }) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blood_test_analyses' as any)
      .select('*')
      .eq('id', analysisId)
      .maybeSingle()
      .then(({ data }) => {
        setAnalysis(data);
        setLoading(false);
      });
  }, [analysisId]);

  if (loading) return <Skeleton className="h-28 w-full rounded-2xl" />;
  if (!analysis) return <CardShell icon={TestTube} title="Analyse sanguine"><p className="text-xs text-muted-foreground">Analyse non trouvée</p></CardShell>;

  const deficiencies = Array.isArray(analysis.deficiencies) 
    ? (analysis.deficiencies as Array<{ name?: string }>).map(d => d.name).filter(Boolean)
    : [];

  return (
    <CollapsibleCard icon={TestTube} title={`Analyse: ${analysis.file_name}`} color="secondary">
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Statut</span>
          <span className={cn("font-medium", analysis.status === 'completed' ? 'text-green-500' : 'text-yellow-500')}>
            {analysis.status === 'completed' ? '✅ Analysé' : '⏳ En attente'}
          </span>
        </div>
        {deficiencies.length > 0 && (
          <div>
            <span className="text-muted-foreground block mb-1">Carences détectées :</span>
            <div className="flex flex-wrap gap-1">
              {deficiencies.map((d, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium">{d}</span>
              ))}
            </div>
          </div>
        )}
        {analysis.file_url && (
          <a
            href={analysis.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline mt-1"
          >
            <FileText weight="bold" className="w-3.5 h-3.5" />
            Voir le PDF
          </a>
        )}
      </div>
    </CollapsibleCard>
  );
}

// ── My Stack Card ──
export function MyStackCard() {
  const { supplements, loading } = useSupplementTracking();

  if (loading) return <Skeleton className="h-28 w-full rounded-2xl" />;

  const active = supplements.filter(s => s.active);
  if (active.length === 0) return <CardShell icon={Pill} title="Mon stack"><p className="text-xs text-muted-foreground">Aucun complément suivi</p></CardShell>;

  const timeIcon = (t: string) => {
    if (t === 'morning') return <Lightning weight="fill" className="w-3 h-3 text-yellow-500" />;
    if (t === 'evening' || t === 'night') return <Moon weight="fill" className="w-3 h-3 text-indigo-400" />;
    return <Barbell weight="fill" className="w-3 h-3 text-green-500" />;
  };

  return (
    <CollapsibleCard icon={Pill} title={`Mon stack (${active.length})`} color="secondary">
      <div className="space-y-1.5">
        {active.map(s => (
          <div key={s.id} className="flex items-center gap-2 text-xs">
            {timeIcon(s.time_of_day)}
            <span className="text-foreground font-medium">{s.product_name}</span>
            {s.dosage && <span className="text-muted-foreground">• {s.dosage}</span>}
            {s.recommended_by_ai && <Brain weight="fill" className="w-3 h-3 text-primary ml-auto" />}
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}

// ── Product Detail Card ──
export function ProductDetailCard({ productTitle }: { productTitle: string }) {
  const { enrichedData, enrichedLoading } = useEnrichedProductData(productTitle);

  if (enrichedLoading) return <Skeleton className="h-32 w-full rounded-2xl" />;
  if (!enrichedData) return <CardShell icon={Package} title={productTitle}><p className="text-xs text-muted-foreground">Données non disponibles</p></CardShell>;

  const benefits = Array.isArray(enrichedData.key_benefits) ? enrichedData.key_benefits as Array<{ title?: string; description?: string }> : [];
  const warnings = enrichedData.safety_warnings as { contraindications?: string[]; interactions?: string[] } | null;

  return (
    <CollapsibleCard icon={Package} title={enrichedData.shopify_product_title} color="primary">
      <div className="space-y-3 text-xs">
        {enrichedData.summary && <p className="text-foreground/80">{enrichedData.summary}</p>}
        
        {benefits.length > 0 && (
          <div>
            <span className="text-muted-foreground font-medium block mb-1">Bienfaits clés :</span>
            <ul className="space-y-1">
              {benefits.slice(0, 4).map((b, i) => (
                <li key={i} className="flex gap-1.5">
                  <ShieldCheck weight="fill" className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  <span>{b.title || b.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings?.contraindications?.length ? (
          <div>
            <span className="text-muted-foreground font-medium flex items-center gap-1 mb-1">
              <Warning weight="fill" className="w-3.5 h-3.5 text-yellow-500" /> Précautions
            </span>
            <ul className="space-y-0.5 text-foreground/70">
              {warnings.contraindications.slice(0, 3).map((c, i) => <li key={i}>• {c}</li>)}
            </ul>
          </div>
        ) : null}

        {enrichedData.coach_tip && (
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
            <span className="text-primary font-medium">💡 Tip Coach : </span>
            <span className="text-foreground/80">{enrichedData.coach_tip}</span>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}

// ── Report Button ──
export function ReportButton({ reportType }: { reportType: string }) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    
    // Create a printable view
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setGenerating(false);
      return;
    }

    const title = reportType === 'health' ? 'Bilan Santé VitaSync' : 'Mon Stack VitaSync';
    const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a2e; }
          h1 { color: #00f0ff; border-bottom: 2px solid #00f0ff; padding-bottom: 12px; }
          h2 { color: #333; margin-top: 24px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 32px; }
          .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>📋 ${title}</h1>
        <p class="meta">Généré le ${date}</p>
        <p>Ce rapport a été généré par VitaSync AI. Pour des informations détaillées, consultez votre dashboard.</p>
        <p class="footer">VitaSync AI — Votre coach santé intelligent • Ce document ne constitue pas un avis médical</p>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
    setGenerating(false);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleGenerate}
      disabled={generating}
      className="my-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
    >
      <DownloadSimple weight="bold" className="w-4 h-4" />
      {generating ? 'Génération...' : `Télécharger le rapport ${reportType === 'health' ? 'santé' : 'stack'}`}
    </motion.button>
  );
}

// ── Shared UI Components ──

function CardShell({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-3 p-4 rounded-2xl bg-card border border-border/50"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon weight="duotone" className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      {children}
    </motion.div>
  );
}

function CollapsibleCard({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "my-3 rounded-2xl border backdrop-blur-sm overflow-hidden",
        color === 'primary' ? 'bg-primary/5 border-primary/20' : 'bg-secondary/5 border-secondary/20'
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon weight="duotone" className={cn("w-4 h-4", color === 'primary' ? 'text-primary' : 'text-secondary')} />
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        </div>
        {open ? <CaretUp weight="bold" className="w-3.5 h-3.5 text-muted-foreground" /> : <CaretDown weight="bold" className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </motion.div>
  );
}
