import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function LegalNotice() {
  return (
    <LegalPageLayout
      title="Legal Notice"
      subtitle="Legal information — vitasync.ai"
      date="8 avril 2026"
    >
      <h2>1. Publisher</h2>
      <p>The website vitasync.ai is published by:</p>
      <p><strong>VitaSync</strong><br />Plateforme de bien-être et nutrition propulsée par l'intelligence artificielle<br />Email de contact : <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a><br />Directeur de la publication : le responsable légal de VitaSync</p>
      <p><em>Structure juridique en cours de création : conformément au Code civil (art. 388) et au Code de commerce (art. L.121-2), VitaSync est en cours de création sous forme de société (structure envisagée : SASU ou OÜ estonienne selon arbitrage en cours). Les mentions suivantes seront mises à jour dès l'immatriculation : dénomination sociale, forme juridique, numéro SIRET/SIREN, RCS et ville du greffe, capital social, adresse du siège social, numéro de TVA intracommunautaire.</em></p>

      <h2>2. Hosting</h2>
      <ul>
        <li><strong>Lovable :</strong> front-end et déploiement — lovable.dev</li>
        <li><strong>Supabase Inc. :</strong> base de données, authentification, stockage — supabase.com</li>
        <li><strong>Shopify Inc. :</strong> e-commerce et paiements — 151 O'Connor Street, Ottawa, Ontario K2P 2L8, Canada — shopify.com</li>
      </ul>

      <h2>3. Nature of the Site — Regulatory Notices</h2>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground">
          <strong>⚠️ AVERTISSEMENT IMPORTANT :</strong> VitaSync est une plateforme d'information sur le bien-être et le mode de vie. VitaSync n'est PAS un dispositif médical au sens du Règlement (UE) 2017/745 (MDR), un service de diagnostic, un substitut à une consultation médicale ou un service de prescription. Les compléments alimentaires proposés sont des denrées alimentaires au sens de la Directive 2002/46/CE et du DSHEA américain, et ne sont pas des médicaments. Ils ne prétendent pas guérir, traiter ou prévenir une quelconque maladie. Consultez un professionnel de santé qualifié avant toute prise de compléments.
        </p>
      </div>

      <h2>4. Artificial Intelligence — Transparency</h2>
      <p>Conformément au Règlement (UE) 2024/1689 (EU AI Act), VitaSync informe ses utilisateurs que la Plateforme utilise des systèmes d'intelligence artificielle (Google Gemini) pour fournir des recommandations de bien-être, analyser les résultats sanguins à titre informatif et animer le Coach IA. Ces systèmes ne constituent pas des dispositifs médicaux et ne sont pas classés comme systèmes IA à haut risque au sens de l'Annexe III de l'EU AI Act.</p>

      <h2>5. Dietary Supplements — Regulatory Compliance</h2>
      <p>Les compléments alimentaires commercialisés par VitaSync sont conformes aux réglementations suivantes :</p>
      <ul>
        <li><strong>États-Unis (marché principal) :</strong> Dietary Supplement Health and Education Act (DSHEA, 1994). 21 CFR Part 111 (cGMP). 21 CFR 101.93 (disclaimer obligatoire). Supervision FDA.</li>
        <li><strong>France (pour référence) :</strong> Décret 2006-352 du 20 mars 2006. Déclaration auprès de la DGCCRF/DGAL via le téléservice Compl'Alim (applicable uniquement en cas de commercialisation sur le marché français).</li>
        <li><strong>Union européenne :</strong> Directive 2002/46/CE. Règlement (CE) 1924/2006 sur les allégations nutritionnelles et de santé (seules les allégations autorisées EFSA et inscrites au Registre UE sont utilisées).</li>
        <li><strong>Fabrication :</strong> Sites de fabrication Supliful enregistrés auprès de la FDA, adhérant aux standards cGMP, avec certifications tierces NSF International pour certains fournisseurs. COAs disponibles par lot sur demande.</li>
      </ul>
      <p><strong>Livraison :</strong> Actuellement, VitaSync livre exclusivement aux États-Unis (48 États contigus hors Alaska et Hawaii) via Supliful. Aucune commercialisation sur le marché européen n'est effective à ce jour.</p>

      <h2>6. Intellectual Property</h2>
      <p>L'ensemble des éléments composant le site (textes, images, logos, code, design, bases de données, contenus scientifiques) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, représentation, modification, publication ou exploitation non autorisée est interdite (articles L.335-2 et suivants du Code de la propriété intellectuelle). La marque VitaSync et ses logos associés sont la propriété exclusive de VitaSync.</p>

      <h2>7. Personal Data Protection</h2>
      <p>In accordance with the General Data Protection Regulation (GDPR – EU 2016/679), the California Consumer Privacy Act (CCPA/CPRA), and other applicable US state privacy laws, users have rights over their personal data. VitaSync processes health data (GDPR Art. 9) with explicit consent. For details, see our <a href="/privacy">Privacy Policy</a>. DPO contact: <a href="mailto:privacy@vitasync.ai">privacy@vitasync.ai</a>. EU supervisory authority: your local data protection authority. US users may also contact the FTC at <a href="https://www.ftc.gov/complaint" target="_blank" rel="noopener noreferrer">ftc.gov/complaint</a>.</p>

      <h2>8. Cookies</h2>
      <p>Le site utilise des cookies techniques nécessaires à son fonctionnement, ainsi que des cookies soumis à consentement (analytics). Voir notre <a href="/cookies">Politique de Cookies</a> pour plus de détails.</p>

      <h2>9. Limitation of Liability</h2>
      <p>VitaSync s'efforce de maintenir le site accessible et les informations à jour, mais ne peut garantir l'absence d'erreurs ou d'interruptions. L'utilisation du site se fait aux risques et périls de l'Utilisateur. Sous réserve des dispositions impératives applicables (notamment la Directive UE 2024/2853 sur la responsabilité du fait des produits IA et les règles de product liability américaines), VitaSync ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site.</p>

      <h2>10. Governing Law</h2>
      <p>This Legal Notice is governed by US federal law and the laws of the State of Delaware. For users residing in the European Union, the mandatory provisions of their country's consumer protection laws also apply. Any dispute shall first be subject to an amicable resolution attempt before any legal proceedings.</p>

      <h2>11. Credits</h2>
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