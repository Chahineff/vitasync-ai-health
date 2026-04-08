import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function CGV() {
  return (
    <LegalPageLayout
      title="Conditions Générales de Vente"
      subtitle="Vente de compléments alimentaires — Livraison USA uniquement via Supliful"
      date="8 avril 2026"
    >
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
        <p className="text-foreground">
          <strong>Périmètre :</strong> Les présentes CGV s'appliquent aux ventes de compléments alimentaires VitaSync livrés exclusivement aux États-Unis (48 États contigus hors Alaska et Hawaii) via le partenaire de fulfillment Supliful (Brand On Demand, Inc., Colorado, USA). Aucune livraison internationale n'est actuellement proposée.
        </p>
      </div>

      <h2>1. Objet et Champ d'Application</h2>
      <p>Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les ventes de compléments alimentaires réalisées via la boutique en ligne VitaSync (ci-après « la Boutique »), accessible depuis la Plateforme VitaSync. Toute commande implique l'acceptation sans réserve des présentes CGV. Les CGV applicables sont celles en vigueur au jour de la commande. VitaSync se réserve le droit de les modifier à tout moment, les modifications ne s'appliquant qu'aux commandes postérieures.</p>

      <h2>2. Identification du Vendeur</h2>
      <p>VitaSync — Plateforme de bien-être et nutrition<br />Email : <a href="mailto:contact@vitasync.com">contact@vitasync.com</a><br />Site : vitasync-ai-health.lovable.app</p>
      <p><em>Note : les informations complètes du vendeur (dénomination sociale, forme juridique, SIRET, RCS, siège social, TVA intracommunautaire, capital social) seront ajoutées dès l'immatriculation définitive de la société. Les produits sont expédiés par Supliful (Brand On Demand, Inc., Delaware, USA) en mode white-label.</em></p>

      <h2>3. Produits</h2>

      <h3>3.1 Nature des produits</h3>
      <p>VitaSync commercialise des compléments alimentaires au sens de la Directive 2002/46/CE (UE) et du Décret français 2006-352, et au sens du Dietary Supplement Health and Education Act (DSHEA, 1994) pour le marché américain. Ces produits sont des denrées alimentaires et ne sont pas des médicaments.</p>
      <div className="p-4 rounded-xl bg-muted/50 border border-border/50 my-4 space-y-3">
        <p><strong>USA (21 CFR 101.93 — DSHEA) :</strong> These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.</p>
        <p><strong>Usage recommandé :</strong> Les compléments alimentaires ne doivent pas être utilisés comme substituts d'un régime alimentaire varié et équilibré et d'un mode de vie sain. Ne pas dépasser la dose journalière recommandée. Tenir hors de la portée des jeunes enfants.</p>
        <p>Les informations fournies sont à titre informatif uniquement et ne constituent pas un avis médical. Consultez un professionnel de santé avant de commencer tout programme de complémentation, en particulier si vous êtes enceinte, allaitante, sous traitement médicamenteux ou souffrez d'une condition médicale.</p>
      </div>

      <h3>3.2 Fabrication et qualité</h3>
      <p>Les produits sont fabriqués et expédiés par Supliful (Brand On Demand, Inc., Delaware, USA) en mode white-label depuis des sites de fabrication enregistrés auprès de la FDA, adhérant aux standards cGMP (current Good Manufacturing Practices, 21 CFR Part 111). Des certifications tierces (NSF International) sont disponibles pour certains fournisseurs. Les certificats d'analyse (COAs) sont disponibles par lot sur demande.</p>

      <h3>3.3 Allégations de santé</h3>
      <p>VitaSync utilise exclusivement des allégations de santé autorisées : pour les USA, seules les allégations de type structure/fonction conformes au DSHEA sont utilisées, accompagnées du disclaimer FDA obligatoire. Pour l'UE (à des fins de communication marketing sur la Plateforme), seules les allégations inscrites au Registre de l'Union des allégations autorisées par l'EFSA (Règlement CE 1924/2006) sont utilisées, mot pour mot.</p>

      <h2>4. Prix</h2>
      <p>Les prix sont indiqués en dollars américains (USD). Les taxes de vente applicables (sales tax) sont calculées automatiquement par Shopify lors du checkout en fonction de l'état de livraison, conformément aux règles de nexus applicables à VitaSync. Les frais de livraison sont indiqués avant la validation de la commande. VitaSync se réserve le droit de modifier ses prix à tout moment, les commandes étant facturées au prix en vigueur lors de la validation.</p>

      <h2>5. Commande et Paiement</h2>
      <p>Les commandes sont passées via Shopify. Le paiement est sécurisé par Shopify Payments (PCI DSS Level 1). Les moyens de paiement acceptés sont indiqués lors du processus de commande (cartes de crédit principales, Shop Pay, Apple Pay, Google Pay selon disponibilité). La commande est définitive après validation du paiement. Un email de confirmation est envoyé à l'Utilisateur.</p>

      <h2>6. Livraison</h2>
      <p>La livraison est assurée par Supliful via USPS Ground Advantage (USA uniquement). Les conditions détaillées de livraison sont décrites dans la <a href="/shipping">Politique de Livraison et Retours</a>. Les délais indicatifs sont de 4 à 10 jours ouvrés après expédition.</p>
      <p>Conformément à l'article L. 216-1 du Code de la consommation français (applicable aux Utilisateurs ayant leur résidence habituelle en France), à défaut de date de livraison indiquée, la livraison doit intervenir dans les 30 jours suivant la conclusion du contrat. En cas de retard, l'acheteur peut mettre en demeure le vendeur puis, si le délai supplémentaire raisonnable n'est pas respecté, résoudre le contrat et obtenir le remboursement intégral sous 14 jours.</p>

      <h2>7. Droit de Rétractation</h2>
      <p><strong>Pour les consommateurs résidant dans l'Union européenne :</strong> conformément aux articles L. 221-18 et suivants du Code de la consommation, le consommateur dispose d'un délai de 14 jours calendaires à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à justifier de motif ni à payer de pénalités.</p>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground">
          <strong>Exception — Produits scellés :</strong> Conformément à l'article L. 221-28, 5° du Code de la consommation, le droit de rétractation ne peut être exercé pour les biens scellés ne pouvant être renvoyés pour des raisons de protection de la santé ou d'hygiène et ayant été descellés après la livraison. Les compléments alimentaires dont le sceau d'inviolabilité a été brisé après livraison ne sont pas éligibles au retour pour des raisons sanitaires.
        </p>
      </div>
      <p><strong>Pour les consommateurs résidant aux États-Unis :</strong> la politique de retour VitaSync est détaillée dans la Politique de Livraison et Retours. Les produits scellés non ouverts peuvent être retournés dans un délai de 14 jours après réception. Les produits descellés ne sont pas retournables pour des raisons d'hygiène et de sécurité alimentaire.</p>
      <p>En cas d'exercice du droit de rétractation (produit scellé non ouvert), VitaSync rembourse tous les paiements, y compris les frais de livraison initiale (au tarif standard), dans un délai de 14 jours suivant la notification de la rétractation. Le remboursement peut être différé jusqu'à la réception des biens retournés. Les frais de retour sont à la charge de l'acheteur.</p>

      <h2>8. Garanties Légales</h2>
      <p>Le consommateur bénéficie des garanties légales prévues par la réglementation applicable :</p>
      <ul>
        <li><strong>Garantie légale de conformité (Art. L. 217-3 et suivants du Code de la consommation) :</strong> VitaSync est tenu de livrer un bien conforme au contrat. Le consommateur dispose d'un délai de 2 ans à compter de la délivrance du bien pour agir.</li>
        <li><strong>Garantie légale des vices cachés (Art. 1641 et suivants du Code civil) :</strong> VitaSync est tenu des vices cachés rendant le bien impropre à l'usage auquel on le destine.</li>
        <li><strong>Pour les consommateurs US :</strong> les garanties légales applicables selon le droit de l'état de résidence de l'acheteur (Magnuson-Moss Warranty Act et Uniform Commercial Code).</li>
      </ul>

      <h2>9. Médiation et Règlement des Litiges</h2>
      <p>Conformément à l'article L. 612-1 du Code de la consommation, en cas de litige non résolu directement avec VitaSync, le consommateur UE peut recourir gratuitement à un médiateur de la consommation. Le nom et les coordonnées du médiateur seront communiqués dès la désignation de celui-ci. Plateforme européenne de règlement des litiges en ligne : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>. Pour les litiges avec des consommateurs US, les parties s'efforceront de trouver une solution amiable avant tout recours judiciaire.</p>

      <h2>10. Loi Applicable</h2>
      <p>Les présentes CGV sont régies par le droit français. Si vous résidez dans l'Union européenne, vous bénéficiez également des dispositions impératives de la loi de protection des consommateurs du pays dans lequel vous résidez. Pour les ventes aux consommateurs résidant aux États-Unis, les dispositions impératives du droit fédéral américain et du droit de l'État de résidence du consommateur s'appliquent également.</p>

      <h2>11. Données Personnelles</h2>
      <p>Les données collectées lors des commandes sont traitées conformément à notre <a href="/privacy">Politique de Confidentialité</a>, au RGPD et aux lois américaines applicables (CCPA/CPRA). Les données de facturation sont conservées pendant 10 ans conformément aux obligations comptables.</p>
    </LegalPageLayout>
  );
}
