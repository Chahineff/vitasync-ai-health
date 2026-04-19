import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function LegalNotice() {
  return (
    <LegalPageLayout
      title="Mentions Légales"
      subtitle="Informations légales obligatoires — LCEN Art. 6 III-1"
      date="8 avril 2026"
    >
      <h2>1. Éditeur du Site</h2>
      <p>Conformément à l'article 6 III-1 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN), le site vitasync-ai-health.lovable.app est édité par :</p>
      <p><strong>VitaSync</strong><br />Plateforme de bien-être et nutrition propulsée par l'intelligence artificielle<br />Email de contact : <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a><br />Directeur de la publication : le responsable légal de VitaSync</p>
      <p><em>Structure juridique en cours de création : conformément au Code civil (art. 388) et au Code de commerce (art. L.121-2), VitaSync est en cours de création sous forme de société (structure envisagée : SASU ou OÜ estonienne selon arbitrage en cours). Les mentions suivantes seront mises à jour dès l'immatriculation : dénomination sociale, forme juridique, numéro SIRET/SIREN, RCS et ville du greffe, capital social, adresse du siège social, numéro de TVA intracommunautaire.</em></p>

      <h2>2. Hébergement</h2>
      <ul>
        <li><strong>Lovable :</strong> front-end et déploiement — lovable.dev</li>
        <li><strong>Supabase Inc. :</strong> base de données, authentification, stockage — supabase.com</li>
        <li><strong>Shopify Inc. :</strong> e-commerce et paiements — 151 O'Connor Street, Ottawa, Ontario K2P 2L8, Canada — shopify.com</li>
      </ul>

      <h2>3. Nature du Site — Avertissements Réglementaires</h2>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground">
          <strong>⚠️ AVERTISSEMENT IMPORTANT :</strong> VitaSync est une plateforme d'information sur le bien-être et le mode de vie. VitaSync n'est PAS un dispositif médical au sens du Règlement (UE) 2017/745 (MDR), un service de diagnostic, un substitut à une consultation médicale ou un service de prescription. Les compléments alimentaires proposés sont des denrées alimentaires au sens de la Directive 2002/46/CE et du DSHEA américain, et ne sont pas des médicaments. Ils ne prétendent pas guérir, traiter ou prévenir une quelconque maladie. Consultez un professionnel de santé qualifié avant toute prise de compléments.
        </p>
      </div>

      <h2>4. Intelligence Artificielle — Transparence</h2>
      <p>Conformément au Règlement (UE) 2024/1689 (EU AI Act), VitaSync informe ses utilisateurs que la Plateforme utilise des systèmes d'intelligence artificielle (Google Gemini) pour fournir des recommandations de bien-être, analyser les résultats sanguins à titre informatif et animer le Coach IA. Ces systèmes ne constituent pas des dispositifs médicaux et ne sont pas classés comme systèmes IA à haut risque au sens de l'Annexe III de l'EU AI Act.</p>

      <h2>5. Compléments Alimentaires — Réglementation</h2>
      <p>Les compléments alimentaires commercialisés par VitaSync sont conformes aux réglementations suivantes :</p>
      <ul>
        <li><strong>États-Unis (marché principal) :</strong> Dietary Supplement Health and Education Act (DSHEA, 1994). 21 CFR Part 111 (cGMP). 21 CFR 101.93 (disclaimer obligatoire). Supervision FDA.</li>
        <li><strong>France (pour référence) :</strong> Décret 2006-352 du 20 mars 2006. Déclaration auprès de la DGCCRF/DGAL via le téléservice Compl'Alim (applicable uniquement en cas de commercialisation sur le marché français).</li>
        <li><strong>Union européenne :</strong> Directive 2002/46/CE. Règlement (CE) 1924/2006 sur les allégations nutritionnelles et de santé (seules les allégations autorisées EFSA et inscrites au Registre UE sont utilisées).</li>
        <li><strong>Fabrication :</strong> Sites de fabrication Supliful enregistrés auprès de la FDA, adhérant aux standards cGMP, avec certifications tierces NSF International pour certains fournisseurs. COAs disponibles par lot sur demande.</li>
      </ul>
      <p><strong>Livraison :</strong> Actuellement, VitaSync livre exclusivement aux États-Unis (48 États contigus hors Alaska et Hawaii) via Supliful. Aucune commercialisation sur le marché européen n'est effective à ce jour.</p>

      <h2>6. Propriété Intellectuelle</h2>
      <p>L'ensemble des éléments composant le site (textes, images, logos, code, design, bases de données, contenus scientifiques) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, représentation, modification, publication ou exploitation non autorisée est interdite (articles L.335-2 et suivants du Code de la propriété intellectuelle). La marque VitaSync et ses logos associés sont la propriété exclusive de VitaSync.</p>

      <h2>7. Protection des Données Personnelles</h2>
      <p>Conformément au RGPD (UE 2016/679), à la loi Informatique et Libertés, et aux lois américaines applicables (CCPA/CPRA et équivalents), l'Utilisateur dispose de droits sur ses données personnelles. VitaSync traite des données de santé (Art. 9 RGPD) avec consentement explicite. Pour plus de détails, consultez notre <a href="/privacy">Politique de Confidentialité</a>. Contact DPO : <a href="mailto:contact@vitasync.com">contact@vitasync.com</a>. Autorité de contrôle UE : CNIL, 3 Place de Fontenoy, 75007 Paris.</p>

      <h2>8. Cookies</h2>
      <p>Le site utilise des cookies techniques nécessaires à son fonctionnement, ainsi que des cookies soumis à consentement (analytics). Voir notre <a href="/cookies">Politique de Cookies</a> pour plus de détails.</p>

      <h2>9. Limitation de Responsabilité</h2>
      <p>VitaSync s'efforce de maintenir le site accessible et les informations à jour, mais ne peut garantir l'absence d'erreurs ou d'interruptions. L'utilisation du site se fait aux risques et périls de l'Utilisateur. Sous réserve des dispositions impératives applicables (notamment la Directive UE 2024/2853 sur la responsabilité du fait des produits IA et les règles de product liability américaines), VitaSync ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site.</p>

      <h2>10. Droit Applicable</h2>
      <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux français seront compétents, sous réserve des dispositions impératives de protection des consommateurs applicables dans l'État membre de l'UE où réside l'Utilisateur ou, pour les consommateurs US, du droit fédéral américain et du droit de leur État de résidence.</p>

      <h2>11. Crédits</h2>
      <ul>
        <li>Conception et développement : VitaSync avec Lovable.dev</li>
        <li>Intelligence artificielle : Google Gemini (via Lovable AI Gateway)</li>
        <li>Icônes : Phosphor Icons</li>
        <li>Design system : shadcn/ui, Tailwind CSS</li>
        <li>E-commerce : Shopify Storefront API</li>
        <li>Fournisseur produits : Supliful (Brand On Demand, Inc., Delaware, USA)</li>
      </ul>
    </LegalPageLayout>
  );
}
