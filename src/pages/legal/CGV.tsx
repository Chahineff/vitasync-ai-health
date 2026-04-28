import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { useTranslation } from "@/hooks/useTranslation";

const buildContent = (locale: "fr" | "en") => {
  if (locale === "fr") {
    return {
      title: "Conditions Générales de Vente",
      subtitle: "Conditions applicables aux achats de produits sur vitasync.ai — Livraison aux États-Unis uniquement via Supliful",
      date: "8 avril 2026",
      body: (
        <>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
            <p className="text-foreground">
              <strong>Champ d'application :</strong> Les présentes Conditions Générales de Vente s'appliquent aux ventes de compléments alimentaires VitaSync expédiés exclusivement aux États-Unis (48 États contigus, hors Alaska et Hawaii) via notre partenaire logistique Supliful (Brand On Demand, Inc., Colorado, USA). La livraison internationale n'est pas proposée à ce jour.
            </p>
          </div>

          <h2>1. Objet et Champ d'application</h2>
          <p>Les présentes Conditions Générales de Vente (« CGV ») régissent la vente des compléments alimentaires effectuée via la boutique en ligne VitaSync (la « Boutique »), accessible depuis la Plateforme VitaSync. Toute commande implique l'acceptation sans réserve des présentes CGV. Les CGV applicables sont celles en vigueur au jour de la commande. VitaSync se réserve le droit de les modifier à tout moment, les modifications ne s'appliquant qu'aux commandes ultérieures.</p>

          <h2>2. Identification du Vendeur</h2>
          <p>VitaSync — Plateforme de bien-être et nutrition<br />Email : <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a><br />Site : vitasync.ai</p>
          <p><em>Note : les informations complètes du vendeur (dénomination sociale, forme juridique, EIN, siège social, immatriculation à la sales tax, capital social) seront ajoutées dès l'immatriculation définitive de la société. Les produits sont expédiés par Supliful (Brand On Demand, Inc., Delaware, USA) sous un modèle de marque blanche.</em></p>

          <h2>3. Produits</h2>

          <h3>3.1 Nature des Produits</h3>
          <p>VitaSync vend des compléments alimentaires au sens du <span lang="en">US Dietary Supplement Health and Education Act (DSHEA, 1994)</span> pour le marché américain, et de la Directive 2002/46/CE pour toute référence UE. Ces produits sont des denrées alimentaires et ne sont pas des médicaments.</p>
          <div className="p-4 rounded-xl bg-muted/50 border border-border/50 my-4 space-y-3">
            <p><strong>USA (<span lang="en">21 CFR 101.93 — DSHEA</span>) :</strong> <span lang="en">These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.</span></p>
            <p><strong>Conseils d'utilisation :</strong> Les compléments alimentaires ne doivent pas se substituer à une alimentation variée et équilibrée ni à un mode de vie sain. Ne pas dépasser la dose journalière recommandée. Tenir hors de portée des jeunes enfants.</p>
            <p>Les informations fournies sont à titre informatif uniquement et ne constituent pas un avis médical. Consultez un professionnel de santé avant de commencer toute supplémentation, en particulier en cas de grossesse, d'allaitement, de prise de médicaments ou de pathologie.</p>
          </div>

          <h3>3.2 Fabrication et Qualité</h3>
          <p>Les produits sont fabriqués et expédiés par Supliful (Brand On Demand, Inc., Delaware, USA) sous un modèle de marque blanche, depuis des sites de fabrication enregistrés auprès de la FDA et conformes aux standards <span lang="en">cGMP (current Good Manufacturing Practices, 21 CFR Part 111)</span>. Des certifications tierces (NSF International) sont disponibles pour certains fournisseurs. Les certificats d'analyse (COAs) sont disponibles par lot sur demande.</p>

          <h3>3.3 Allégations de Santé</h3>
          <p>VitaSync n'utilise que des allégations de santé autorisées : pour les USA, seules les <span lang="en">structure/function claims</span> conformes au DSHEA sont utilisées, accompagnées du disclaimer FDA obligatoire. Pour l'UE (en communication marketing sur la Plateforme), seules les allégations inscrites au Registre UE des allégations autorisées par l'EFSA (Règlement CE 1924/2006) sont utilisées, à la lettre.</p>

          <h2>4. Tarifs</h2>
          <p>Les prix sont indiqués en dollars américains (USD). La taxe de vente applicable (<span lang="en">sales tax</span>) est calculée automatiquement par Shopify lors du paiement, en fonction de l'État de livraison et conformément aux règles de <span lang="en">nexus</span> applicables à VitaSync. Les frais de livraison sont indiqués avant la confirmation de commande. VitaSync se réserve le droit de modifier ses prix à tout moment ; les commandes sont facturées au prix en vigueur au moment de la confirmation.</p>

          <h2>5. Commande et Paiement</h2>
          <p>Les commandes sont passées via Shopify. Le paiement est sécurisé par <span lang="en">Shopify Payments (PCI DSS Level 1)</span>. Les moyens de paiement acceptés sont indiqués lors du processus de commande (principales cartes bancaires, Shop Pay, Apple Pay, Google Pay selon disponibilité). La commande est définitive dès validation du paiement. Un e-mail de confirmation est envoyé à l'Utilisateur.</p>

          <h2>6. Livraison</h2>
          <p>La livraison est assurée par Supliful via <span lang="en">USPS Ground Advantage</span> (USA uniquement). Les conditions détaillées de livraison sont décrites dans la <a href="/shipping">Politique de Livraison & Retours</a>. Le délai de livraison estimé est de 4 à 10 jours ouvrés après expédition.</p>
          <p>Sauf date de livraison spécifiée, la livraison interviendra dans un délai de 30 jours suivant la confirmation de la commande. En cas de retard, l'acheteur peut mettre en demeure le vendeur et, à défaut d'exécution dans un délai supplémentaire raisonnable, résoudre le contrat et obtenir un remboursement intégral dans un délai de 14 jours.</p>

          <h2>7. Droit de Rétractation</h2>
          <p><strong>Pour les consommateurs résidant dans l'Union européenne :</strong> les consommateurs UE disposent de 14 jours calendaires à compter de la réception du produit pour exercer leur droit de rétractation, sans avoir à justifier de motif ni à payer de pénalité.</p>
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
            <p className="text-foreground">
              <strong>Exception — Produits scellés :</strong> Conformément au droit applicable de la consommation, le droit de rétractation ne peut pas être exercé sur des biens scellés ne pouvant être retournés pour des raisons de protection de la santé ou d'hygiène et qui ont été descellés après livraison. Les compléments alimentaires dont le scellé inviolable a été rompu après livraison ne sont pas éligibles au retour, pour des raisons de santé et de sécurité.
            </p>
          </div>
          <p><strong>Pour les consommateurs résidant aux États-Unis :</strong> la politique de retour VitaSync est détaillée dans la Politique de Livraison & Retours. Les produits scellés et non ouverts peuvent être retournés dans les 14 jours suivant leur réception. Les produits descellés ne sont pas retournables, pour des raisons d'hygiène et de sécurité alimentaire.</p>
          <p>Si le droit de rétractation est exercé (produit scellé, non ouvert), VitaSync remboursera l'ensemble des paiements, y compris les frais de livraison initiaux (au tarif standard), dans un délai de 14 jours à compter de la notification de la rétractation. Le remboursement peut être différé jusqu'à réception des biens retournés. Les frais de retour sont à la charge de l'acheteur.</p>

          <h2>8. Garanties Légales</h2>
          <p>Le consommateur bénéficie des garanties légales prévues par les réglementations applicables :</p>
          <ul>
            <li><strong>Garantie légale de conformité (consommateurs UE) :</strong> VitaSync est tenu de livrer un bien conforme au contrat. Le consommateur dispose d'un délai de 2 ans à compter de la délivrance pour agir.</li>
            <li><strong>Garantie des vices cachés (droit applicable) :</strong> VitaSync est responsable des défauts cachés rendant le bien impropre à son usage.</li>
            <li><strong>Pour les consommateurs américains :</strong> garanties légales applicables en vertu des lois de l'État de résidence de l'acheteur (<span lang="en">Magnuson-Moss Warranty Act and Uniform Commercial Code</span>), y compris les garanties implicites de qualité marchande (<span lang="en">implied warranties of merchantability and fitness for a particular purpose</span>).</li>
          </ul>

          <h2>9. Médiation et Règlement des Litiges</h2>
          <p>En cas de litige non résolu, les consommateurs UE peuvent recourir à un service gratuit de médiation de la consommation. Le nom et les coordonnées du médiateur seront communiqués lors de sa désignation. Plateforme européenne de règlement en ligne des litiges : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>. Pour les litiges avec des consommateurs américains, les parties s'engagent à rechercher d'abord une solution amiable avant toute procédure judiciaire ; les litiges peuvent être soumis à un arbitrage exécutoire selon les règles de l'<span lang="en">American Arbitration Association (AAA)</span>, sauf interdiction légale.</p>

          <h2>10. Droit Applicable</h2>
          <p>Les présentes CGV sont régies par le droit fédéral américain et par les lois de l'État du Delaware. Si vous résidez dans l'Union européenne, vous bénéficiez également des dispositions impératives de la loi de protection des consommateurs du pays dans lequel vous résidez. Pour les ventes aux consommateurs résidant aux États-Unis, les dispositions impératives du droit fédéral américain et du droit de l'État de résidence du consommateur s'appliquent également.</p>

          <h2>11. Données Personnelles</h2>
          <p>Les données collectées lors des commandes sont traitées conformément à notre <a href="/privacy">Politique de Confidentialité</a>, au RGPD (pour les utilisateurs UE) et aux lois américaines applicables (<span lang="en">CCPA/CPRA</span>). Les données de facturation sont conservées pendant la durée requise par les obligations comptables et fiscales applicables.</p>
        </>
      ),
    };
  }
  return {
    title: "Terms of Sale",
    subtitle: "Conditions applicable to product purchases on vitasync.ai — US shipping only via Supliful",
    date: "April 8, 2026",
    body: (
      <>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
          <p className="text-foreground">
            <strong>Scope:</strong> These Terms of Sale apply to sales of VitaSync dietary supplements shipped exclusively within the United States (48 contiguous states, excluding Alaska and Hawaii) through our fulfillment partner Supliful (Brand On Demand, Inc., Colorado, USA). International shipping is not currently offered.
          </p>
        </div>

        <h2>1. Purpose and Scope</h2>
        <p>These Terms of Sale ("Terms") govern the sale of dietary supplements made through the VitaSync online shop (the "Shop"), accessible from the VitaSync Platform. Any order implies the unconditional acceptance of these Terms. The applicable Terms are those in force on the day of the order. VitaSync reserves the right to modify them at any time, with changes applying only to subsequent orders.</p>

        <h2>2. Seller Identification</h2>
        <p>VitaSync — Wellness and nutrition platform<br />Email: <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a><br />Website: vitasync.ai</p>
        <p><em>Note: complete seller information (legal name, entity type, EIN, registered office, sales tax registration, share capital) will be added upon final incorporation of the company. Products are shipped by Supliful (Brand On Demand, Inc., Delaware, USA) under a white-label model.</em></p>

        <h2>3. Products</h2>

        <h3>3.1 Nature of the Products</h3>
        <p>VitaSync sells dietary supplements as defined by the US Dietary Supplement Health and Education Act (DSHEA, 1994) for the US market, and by EU Directive 2002/46/EC for any EU references. These products are foods and are not medications.</p>
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50 my-4 space-y-3">
          <p><strong>USA (21 CFR 101.93 — DSHEA):</strong> These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.</p>
          <p><strong>Recommended use:</strong> Dietary supplements should not be used as a substitute for a varied and balanced diet and a healthy lifestyle. Do not exceed the recommended daily dose. Keep out of reach of young children.</p>
          <p>The information provided is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before starting any supplementation program, especially if you are pregnant, breastfeeding, taking medication, or have a medical condition.</p>
        </div>

        <h3>3.2 Manufacturing and Quality</h3>
        <p>Products are manufactured and shipped by Supliful (Brand On Demand, Inc., Delaware, USA) under a white-label model from FDA-registered manufacturing facilities adhering to cGMP standards (current Good Manufacturing Practices, 21 CFR Part 111). Third-party certifications (NSF International) are available for selected suppliers. Certificates of analysis (COAs) are available by lot upon request.</p>

        <h3>3.3 Health Claims</h3>
        <p>VitaSync uses only authorized health claims: for the USA, only structure/function claims compliant with DSHEA are used, accompanied by the mandatory FDA disclaimer. For the EU (for marketing communication on the Platform), only claims listed in the EU Register of authorized claims by EFSA (Regulation EC 1924/2006) are used, verbatim.</p>

        <h2>4. Pricing</h2>
        <p>Prices are listed in US dollars (USD). Applicable sales tax is automatically calculated by Shopify at checkout based on the shipping state, in accordance with the nexus rules applicable to VitaSync. Shipping fees are shown before order confirmation. VitaSync reserves the right to change prices at any time; orders are billed at the price in effect at the time of confirmation.</p>

        <h2>5. Order and Payment</h2>
        <p>Orders are placed through Shopify. Payment is secured by Shopify Payments (PCI DSS Level 1). Accepted payment methods are indicated during the order process (major credit cards, Shop Pay, Apple Pay, Google Pay where available). The order is final once payment is validated. A confirmation email is sent to the User.</p>

        <h2>6. Shipping</h2>
        <p>Shipping is handled by Supliful via USPS Ground Advantage (USA only). Detailed shipping conditions are described in the <a href="/shipping">Shipping &amp; Returns Policy</a>. Estimated delivery time is 4 to 10 business days after dispatch.</p>
        <p>Unless a delivery date is specified, delivery shall occur within 30 days of order confirmation. In the event of a delay, the buyer may notify the seller and, if a reasonable additional period is not met, terminate the contract and obtain a full refund within 14 days.</p>

        <h2>7. Right of Withdrawal</h2>
        <p><strong>For consumers residing in the European Union:</strong> EU consumers have 14 calendar days from receipt of the product to exercise their right of withdrawal, without having to justify a reason or pay any penalty.</p>
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
          <p className="text-foreground">
            <strong>Exception — Sealed products:</strong> In accordance with applicable consumer protection law, the right of withdrawal cannot be exercised for sealed goods that cannot be returned for reasons of health protection or hygiene and that have been unsealed after delivery. Dietary supplements whose tamper seal has been broken after delivery are not eligible for return for health and safety reasons.
          </p>
        </div>
        <p><strong>For consumers residing in the United States:</strong> The VitaSync return policy is detailed in the Shipping &amp; Returns Policy. Sealed, unopened products may be returned within 14 days of receipt. Unsealed products are not returnable for hygiene and food safety reasons.</p>
        <p>If the right of withdrawal is exercised (sealed, unopened product), VitaSync will refund all payments, including the initial shipping fees (at the standard rate), within 14 days of being notified of the withdrawal. The refund may be deferred until receipt of the returned goods. Return shipping costs are the buyer's responsibility.</p>

        <h2>8. Legal Warranties</h2>
        <p>The consumer benefits from the legal warranties provided by applicable regulations:</p>
        <ul>
          <li><strong>Legal warranty of conformity (applicable to EU consumers):</strong> VitaSync is required to deliver goods that conform to the contract. The consumer has 2 years from delivery to take action.</li>
          <li><strong>Warranty against hidden defects (applicable warranty law):</strong> VitaSync is liable for hidden defects rendering the goods unfit for their intended use.</li>
          <li><strong>For US consumers:</strong> the legal warranties applicable under the laws of the buyer's state of residence (Magnuson-Moss Warranty Act and Uniform Commercial Code), including implied warranties of merchantability and fitness for a particular purpose.</li>
        </ul>

        <h2>9. Mediation and Dispute Resolution</h2>
        <p>In case of an unresolved dispute, EU consumers may use a free consumer mediation service. The name and contact details of the mediator will be communicated upon designation. European Online Dispute Resolution platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>. For disputes with US consumers, the parties shall first seek an amicable resolution before any legal proceedings; disputes may be submitted to binding arbitration under the American Arbitration Association (AAA) rules, except where prohibited by law.</p>

        <h2>10. Governing Law</h2>
        <p>These Terms of Sale are governed by US federal law and the laws of the State of Delaware. If you reside in the European Union, you also benefit from the mandatory provisions of the consumer protection law of the country in which you reside. For sales to consumers residing in the United States, the mandatory provisions of US federal law and the law of the consumer's state of residence also apply.</p>

        <h2>11. Personal Data</h2>
        <p>Data collected during orders is processed in accordance with our <a href="/privacy">Privacy Policy</a>, the GDPR (for EU users), and applicable US laws (CCPA/CPRA). Billing data is retained for the period required by applicable accounting and tax obligations.</p>
      </>
    ),
  };
};

export default function CGV() {
  const { locale } = useTranslation();
  const effectiveLocale: "fr" | "en" = locale === "fr" ? "fr" : "en";
  const c = buildContent(effectiveLocale);
  return (
    <LegalPageLayout title={c.title} subtitle={c.subtitle} date={c.date}>
      {c.body}
    </LegalPageLayout>
  );
}
