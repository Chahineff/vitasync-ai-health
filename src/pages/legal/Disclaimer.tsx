import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function Disclaimer() {
  return (
    <LegalPageLayout
      title="Disclaimer Santé et Médical"
      subtitle="Avertissements réglementaires — FDA, UE, EU AI Act, Directive 2002/46/CE"
      date="4 mars 2026"
    >
      <p>Ce document regroupe l'ensemble des avertissements réglementaires applicables à la plateforme VitaSync, à ses services d'intelligence artificielle et aux compléments alimentaires commercialisés.</p>

      <h2>1. Disclaimer Général — VitaSync n'est pas un Service Médical</h2>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground font-medium">
          ⚠️ VitaSync est une plateforme d'information sur le bien-être et le mode de vie. Les informations et recommandations fournies ne constituent PAS un avis médical, un diagnostic ou un traitement. VitaSync n'est PAS un dispositif médical au sens du Règlement (UE) 2017/745 (MDR). Consultez toujours un professionnel de santé qualifié avant toute décision concernant votre santé ou votre alimentation.
        </p>
      </div>

      <h2>2. Disclaimer Intelligence Artificielle (EU AI Act, Art. 50)</h2>
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
        <p className="text-foreground">
          <strong>Disclosure IA obligatoire :</strong> Vous interagissez avec un système d'intelligence artificielle propulsé par Google Gemini. Il ne s'agit pas d'un professionnel de santé humain. Toutes les réponses sont générées par une technologie IA. Les recommandations du Coach IA sont des informations générales de bien-être, pas des prescriptions médicales.
        </p>
      </div>
      <p>Ce disclaimer est requis par le Règlement (UE) 2024/1689 (EU AI Act) qui impose aux fournisseurs de systèmes IA une obligation de transparence (Art. 50) envers les utilisateurs. L'obligation de littératie en IA (Art. 4) est applicable depuis le 2 février 2025.</p>

      <h2>3. Disclaimer Analyses Sanguines</h2>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground">
          <strong>IMPORTANT :</strong> L'analyse de vos résultats sanguins est fournie à titre informatif et éducatif uniquement. Elle ne constitue PAS une interprétation médicale, un diagnostic ou une évaluation clinique. Seul un professionnel de santé agréé peut interpréter correctement vos résultats dans le contexte de votre historique médical complet. Si des valeurs semblent hors normes, consultez immédiatement votre médecin. Ne retardez jamais une consultation médicale sur la base des informations fournies par VitaSync.
        </p>
      </div>

      <h2>4. Disclaimer Compléments Alimentaires — Recommandations IA</h2>
      <p>Les suggestions de compléments alimentaires sont des informations générales de bien-être, pas des prescriptions médicales. Les compléments peuvent interagir avec des médicaments. Consultez votre médecin ou pharmacien avant tout nouveau complément, particulièrement en cas de grossesse, allaitement, traitement médicamenteux ou condition médicale. Les résultats individuels peuvent varier.</p>

      <h2>5. Disclaimer FDA/DSHEA (Marché américain)</h2>
      <div className="p-4 rounded-xl bg-muted/50 border border-border/50 my-4">
        <p className="text-foreground font-medium">
          FDA DISCLAIMER (21 CFR 101.93) : These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </div>
      <p>Ce disclaimer est obligatoire en vertu du DSHEA (Dietary Supplement Health and Education Act) de 1994 pour tout complément alimentaire portant une allégation de type structure/fonction.</p>

      <h2>6. Disclaimer UE — Directive 2002/46/CE</h2>
      <p>Les compléments alimentaires ne doivent pas être utilisés comme substituts d'un régime alimentaire varié et équilibré et d'un mode de vie sain. Ne pas dépasser la dose journalière recommandée. Tenir hors de la portée des jeunes enfants.</p>
      <p>Ces mentions sont imposées par l'article 6(2) de la Directive 2002/46/CE. Il est formellement INTERDIT d'attribuer aux compléments des propriétés de prévention, de traitement ou de guérison de maladies.</p>

      <h2>7. Disclaimer Combiné International (Pages Produit)</h2>
      <div className="p-4 rounded-xl bg-muted/50 border border-border/50 my-4 space-y-3">
        <p className="font-medium text-foreground">INFORMATIONS RÉGLEMENTAIRES</p>
        <ul>
          <li>Ces déclarations n'ont pas été évaluées par la Food and Drug Administration. Ce produit n'est pas destiné à diagnostiquer, traiter, guérir ou prévenir une quelconque maladie.</li>
          <li>Les compléments alimentaires ne doivent pas être utilisés comme substituts d'un régime alimentaire varié et équilibré et d'un mode de vie sain. Ne pas dépasser la dose journalière recommandée. Tenir hors de la portée des jeunes enfants.</li>
          <li>Les informations fournies sur ce site le sont à titre informatif uniquement et ne constituent pas un avis médical. Consultez un professionnel de santé avant de commencer tout programme de complémentation.</li>
        </ul>
      </div>

      <h2>8. Disclaimer Footer (Version Condensée)</h2>
      <p>VitaSync est une plateforme d'information sur le bien-être. Les produits proposés sont des compléments alimentaires et non des médicaments. Les recommandations IA ne constituent pas un avis médical. Consultez un professionnel de santé avant toute décision concernant votre santé. — These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.</p>

      <h2>9. Responsabilité Civile et Directive Produits Défectueux</h2>
      <p>La Directive (UE) 2024/2853 sur la responsabilité du fait des produits (applicable aux produits mis sur le marché à partir du 9 décembre 2026) inclut explicitement les logiciels et systèmes IA dans la définition de « produit ». VitaSync sera soumis à un régime de responsabilité stricte pour les défauts IA. Les clauses de limitation de responsabilité dans les CGU/CGV ne peuvent pas exclure cette responsabilité légale.</p>

      <h2>10. Tableau de Synthèse — Où Placer Chaque Disclaimer</h2>
      <table>
        <thead>
          <tr><th>Disclaimer</th><th>Emplacement</th><th>Obligatoire</th></tr>
        </thead>
        <tbody>
          <tr><td>Général (pas un service médical)</td><td>Footer toutes pages + landing + dashboard</td><td>Oui</td></tr>
          <tr><td>Transparence IA (EU AI Act)</td><td>Chaque interaction Coach IA</td><td>Oui (depuis 02/2025)</td></tr>
          <tr><td>Analyses sanguines</td><td>Écran upload + page résultats</td><td>Oui (évite MDR)</td></tr>
          <tr><td>Recommandation compléments</td><td>Avec chaque reco IA</td><td>Oui</td></tr>
          <tr><td>FDA/DSHEA</td><td>Chaque page produit (près des allégations)</td><td>Oui (marché USA)</td></tr>
          <tr><td>UE Directive 2002/46</td><td>Chaque page produit</td><td>Oui (marché UE)</td></tr>
          <tr><td>Combiné international</td><td>Pages produit (bloc complet)</td><td>Recommandé</td></tr>
          <tr><td>Footer condensé</td><td>Footer site (toutes pages)</td><td>Recommandé</td></tr>
        </tbody>
      </table>
    </LegalPageLayout>
  );
}
