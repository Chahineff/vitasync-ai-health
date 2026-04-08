import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function Shipping() {
  return (
    <LegalPageLayout
      title="Politique de Livraison et Retours"
      subtitle="Conditions d'expédition, zones de livraison et retours — Fulfillment par Supliful"
      date="8 avril 2026"
    >
      <h2>1. Présentation du Service de Livraison</h2>
      <p>Les produits VitaSync sont fabriqués et expédiés par notre partenaire fulfillment Supliful (Brand On Demand, Inc., Delaware, USA) depuis ses entrepôts situés principalement à Arvada, Colorado, USA. Les produits sont fabriqués à la demande en mode white-label (étiquetage à la commande avec la marque VitaSync).</p>

      <h2>2. Zones de Livraison et Tarifs</h2>
      <p><strong>Livraison domestique États-Unis uniquement</strong> — Transporteur : USPS Ground Advantage (Supliful).</p>
      <table>
        <thead>
          <tr><th>Poids total commande</th><th>Tarif livraison</th><th>Délai estimé</th></tr>
        </thead>
        <tbody>
          <tr><td>Jusqu'à 0,5 lb (≈ 225 g)</td><td>4,50 $</td><td>4-10 jours ouvrés</td></tr>
          <tr><td>0,51 à 0,75 lb (≈ 340 g)</td><td>5,50 $</td><td>4-10 jours ouvrés</td></tr>
          <tr><td>0,76 à 1,00 lb (≈ 450 g)</td><td>6,50 $</td><td>4-10 jours ouvrés</td></tr>
          <tr><td>1,01 à 2,00 lb (≈ 900 g)</td><td>8,00 $</td><td>4-10 jours ouvrés</td></tr>
        </tbody>
      </table>
      <p>Les tarifs ci-dessus sont calculés automatiquement au checkout Shopify en fonction du poids total du panier. La sales tax applicable est ajoutée automatiquement selon l'état de livraison.</p>

      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground">
          <strong>ZONES NON DESSERVIES :</strong> Alaska, Hawaii, territoires US (Porto Rico, Guam, îles Vierges), et tous les pays hors États-Unis. Si vous n'êtes pas résident des 48 États contigus, vous ne pourrez pas finaliser de commande. Nous vous invitons à vous inscrire à notre newsletter pour être informé de l'ouverture de nouvelles zones.
        </p>
      </div>

      <h2>3. Délais de Traitement et de Livraison</h2>
      <p><strong>Délai de fabrication et d'expédition :</strong> les produits étant fabriqués à la demande en mode white-label, un délai de 1 à 3 jours ouvrés est nécessaire entre la validation de la commande et l'expédition (étiquetage, conditionnement, remise au transporteur).</p>
      <p><strong>Délai de livraison :</strong> 4 à 10 jours ouvrés après expédition via USPS Ground Advantage. Ce délai commence à courir à compter de l'expédition du colis (et non de la commande). Les délais ne sont pas garantis et peuvent être impactés par les périodes de forte demande, les conditions météorologiques ou les opérations postales USPS.</p>
      <p>Conformément à l'article L. 216-1 du Code de la consommation français (applicable aux Utilisateurs résidant en France), à défaut de date de livraison indiquée lors de la commande, la livraison doit intervenir dans un délai maximal de 30 jours. En cas de dépassement de ce délai, l'acheteur peut, après mise en demeure restée infructueuse, résoudre le contrat et obtenir le remboursement intégral sous 14 jours.</p>

      <h2>4. Suivi de Commande</h2>
      <p>Un numéro de suivi USPS est fourni par email dès l'expédition du colis. Le suivi est disponible sur <a href="https://www.usps.com/tracking" target="_blank" rel="noopener noreferrer">www.usps.com/tracking</a>. Les notifications d'étapes de livraison sont envoyées automatiquement par Shopify.</p>

      <h2>5. Politique de Retours</h2>

      <h3>5.1 Droit de rétractation (14 jours — produits scellés uniquement)</h3>
      <p><strong>Pour les consommateurs résidant dans l'Union européenne :</strong> conformément aux articles L. 221-18 et suivants du Code de la consommation, vous disposez de 14 jours calendaires après réception pour exercer votre droit de rétractation, sans motif, pour les produits restés scellés (sceau d'inviolabilité intact).</p>
      <p><strong>Pour les consommateurs résidant aux États-Unis :</strong> vous disposez d'un délai de 14 jours calendaires après réception pour retourner un produit scellé non ouvert, conformément à notre politique commerciale volontaire.</p>
      <p>Pour exercer ce droit, contactez-nous à <a href="mailto:contact@vitasync.com">contact@vitasync.com</a> avec votre numéro de commande.</p>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground">
          <strong>Exception santé et hygiène :</strong> Le droit de rétractation et le retour commercial ne s'appliquent PAS aux compléments alimentaires dont le sceau de sécurité (shrink-wrap, scellé d'inviolabilité) a été brisé après livraison. Cette exception est fondée sur l'article L. 221-28, 5° du Code de la consommation pour les consommateurs UE, et sur les pratiques standards du secteur des compléments alimentaires aux USA, pour des raisons de protection de la santé publique et d'hygiène.
        </p>
      </div>

      <h3>5.2 Produits défectueux ou endommagés</h3>
      <p>Si vous recevez un produit défectueux, endommagé en transit ou mal imprimé, contactez-nous à <a href="mailto:contact@vitasync.com">contact@vitasync.com</a> dans les 30 jours suivant la réception avec une photo claire du problème (produit, sceau, emballage extérieur). VitaSync prendra en charge le remplacement ou le remboursement intégral, frais de retour à la charge de VitaSync.</p>

      <h3>5.3 Colis perdus en transit</h3>
      <p>Si votre colis est déclaré perdu en transit par USPS (aucune mise à jour du suivi pendant plus de 10 jours ouvrés après expédition), contactez-nous. Nous procéderons à une enquête auprès de USPS et, une fois la perte confirmée, à un remplacement ou remboursement.</p>

      <h3>5.4 Cas exclus de remboursement</h3>
      <ul>
        <li>Erreur d'adresse de livraison fournie par le client (adresse incomplète, inexistante, zip code erroné).</li>
        <li>Colis non réclamé auprès du transporteur et retourné à l'expéditeur.</li>
        <li>Remords d'acheteur après ouverture du produit (sceau brisé).</li>
        <li>Dépassement du délai de 14 jours pour le droit de rétractation (produits scellés).</li>
        <li>Dommages causés par une mauvaise utilisation ou un stockage inadapté après réception.</li>
      </ul>

      <h3>5.5 Modalités de remboursement</h3>
      <p>Les remboursements sont effectués sur le moyen de paiement original (via Shopify Payments) dans un délai de 14 jours suivant la réception du retour ou la preuve de perte. Pour les consommateurs UE exerçant leur droit de rétractation, le remboursement inclut les frais de livraison initiale au tarif standard. Les frais de retour sont à la charge de l'acheteur, sauf en cas de produit défectueux ou d'erreur de VitaSync.</p>

      <h2>6. Garanties Légales</h2>
      <p>Indépendamment de la présente politique, le consommateur bénéficie des garanties légales applicables :</p>
      <ul>
        <li><strong>UE / France :</strong> garantie légale de conformité (Art. L. 217-3 et suivants du Code de la consommation, 2 ans) et garantie des vices cachés (Art. 1641 et suivants du Code civil).</li>
        <li><strong>USA :</strong> Magnuson-Moss Warranty Act (fédéral) et Uniform Commercial Code (UCC) de l'état de résidence de l'acheteur, incluant les garanties implicites de qualité marchande (implied warranty of merchantability) et d'adéquation à un usage particulier (fitness for a particular purpose).</li>
      </ul>

      <h2>7. Contact</h2>
      <p>Pour toute question relative à une livraison ou un retour :</p>
      <p>Email : <a href="mailto:contact@vitasync.com">contact@vitasync.com</a><br />Délai de réponse : 48h ouvrées maximum</p>
    </LegalPageLayout>
  );
}
