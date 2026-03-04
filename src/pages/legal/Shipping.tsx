import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function Shipping() {
  return (
    <LegalPageLayout
      title="Politique de Livraison et Retours"
      subtitle="Conditions d'expédition, zones de livraison et retours — Fulfillment par Supliful"
      date="4 mars 2026"
    >
      <h2>1. Présentation du Service de Livraison</h2>
      <p>
        Les produits VitaSync sont fabriqués et expédiés par notre partenaire fulfillment Supliful (Brand On Demand, Inc., Delaware, USA) depuis ses entrepôts situés principalement à Arvada, Colorado, USA. Les produits sont fabriqués à la demande en mode white-label (étiquetage à la commande avec la marque VitaSync).
      </p>

      <h2>2. Zones de Livraison et Tarifs</h2>
      <table>
        <thead>
          <tr><th>Zone</th><th>Pays couverts</th><th>Tarif</th><th>Délai estimé</th><th>Transporteur</th></tr>
        </thead>
        <tbody>
          <tr><td>USA</td><td>48 États contigus (hors Alaska, Hawaï)</td><td>4,50 $</td><td>4-10 jours ouvrés</td><td>USPS Ground Advantage</td></tr>
          <tr><td>Zone 1</td><td>Canada</td><td>17,00 $</td><td>3-5 jours + douane</td><td>FedEx International</td></tr>
          <tr><td>Zone 2</td><td>France, Belgique, Pays-Bas, Italie, Portugal, UK, Danemark, Suède, Norvège, Finlande, Croatie</td><td>18,00 $</td><td>3-5 jours + douane</td><td>FedEx International</td></tr>
          <tr><td>Zone 3</td><td>Australie, Corée du Sud, Philippines, Pologne, Roumanie, Japon, Israël, Nouvelle-Zélande</td><td>20,00 $</td><td>3-5 jours + douane</td><td>FedEx International</td></tr>
        </tbody>
      </table>
      <p>
        <strong>PAYS NON DESSERVIS :</strong> Allemagne, Espagne (interdite suite à des refus douaniers systématiques), Autriche, Suisse, Irlande. Cette liste est susceptible d'évoluer. Si votre pays n'est pas dans les zones ci-dessus, la livraison n'est malheureusement pas disponible.
      </p>

      <h2>3. Livraison Internationale — Douane et Taxes</h2>
      <p>
        <strong>IMPORTANT — DDU (Delivery Duties Unpaid) :</strong> Toutes les livraisons internationales (hors USA) sont effectuées en mode DDU. Cela signifie que le client final assume l'intégralité des droits de douane, taxes d'importation et frais de dédouanement de son pays. Supliful ne gère pas les formalités douanières. VitaSync n'a aucun contrôle sur les droits et taxes appliqués par votre pays. Ces frais additionnels ne sont ni inclus dans le prix du produit ni dans les frais de livraison affichés.
      </p>
      <ul>
        <li>Les commandes vers le Royaume-Uni nécessitent un numéro EORI.</li>
        <li>Les délais de dédouanement peuvent ajouter 1 à 5 jours ouvrés supplémentaires.</li>
        <li>En cas de rejet douanier, le colis est retourné et aucun remboursement n'est prévu par le fulfiller.</li>
      </ul>

      <h2>4. Délais de Livraison</h2>
      <p>
        Les délais indiqués sont des estimations et commencent à courir à compter de l'expédition du colis (et non de la commande). Le délai entre la commande et l'expédition peut varier de 1 à 3 jours ouvrés (étiquetage à la demande). Les délais ne sont pas garantis et peuvent être impactés par les périodes de forte demande, les conditions météorologiques ou les formalités douanières.
      </p>
      <p>
        Conformément à l'article L. 216-1 du Code de la consommation, à défaut de date de livraison indiquée lors de la commande, la livraison doit intervenir dans un délai de 30 jours. En cas de dépassement de ce délai, l'acheteur peut, après mise en demeure restée infructueuse, résoudre le contrat et obtenir le remboursement intégral sous 14 jours.
      </p>

      <h2>5. Suivi de Commande</h2>
      <p>Un numéro de suivi est fourni par email dès l'expédition du colis. Le suivi est disponible via le site du transporteur (USPS ou FedEx).</p>

      <h2>6. Politique de Retours</h2>

      <h3>6.1 Droit de rétractation (14 jours)</h3>
      <p>
        Conformément aux articles L. 221-18 et suivants du Code de la consommation, vous disposez de 14 jours calendaires après réception pour exercer votre droit de rétractation, sans motif. Pour exercer ce droit, contactez-nous à <a href="mailto:contact@vitasync.com">contact@vitasync.com</a> avec votre numéro de commande.
      </p>
      <p>
        <strong>Exception santé/hygiène :</strong> Le droit de rétractation ne s'applique pas aux compléments alimentaires dont le sceau de sécurité a été brisé après livraison (Art. L. 221-28, 5° du Code de la consommation), pour des raisons de protection de la santé et d'hygiène.
      </p>

      <h3>6.2 Produits défectueux ou endommagés</h3>
      <p>Si vous recevez un produit défectueux, endommagé ou mal imprimé, contactez-nous dans les 30 jours suivant la réception avec une photo du problème. VitaSync prendra en charge le remplacement ou le remboursement.</p>

      <h3>6.3 Colis perdus en transit</h3>
      <p>Si votre colis est perdu en transit, nous procéderons à un remplacement ou un remboursement après vérification auprès du transporteur.</p>

      <h3>6.4 Cas exclus de remboursement</h3>
      <ul>
        <li>Erreur d'adresse de livraison fournie par le client.</li>
        <li>Colis non réclamé auprès du transporteur.</li>
        <li>Remords d'acheteur (après ouverture du sceau).</li>
        <li>Rejet douanier du colis dans le pays de destination.</li>
        <li>Colis FedEx non collecté au point de retrait (destruction sans compensation par FedEx).</li>
      </ul>

      <h3>6.5 Modalités de remboursement</h3>
      <p>
        Les remboursements sont effectués sur le moyen de paiement original dans un délai de 14 jours suivant la réception du retour ou la preuve de perte. Pour les consommateurs UE, le remboursement inclut les frais de livraison initiale (au tarif standard). Les frais de retour sont à la charge de l'acheteur sauf en cas de produit défectueux.
      </p>

      <h2>7. Garanties Légales</h2>
      <p>
        Indépendamment de la présente politique, le consommateur bénéficie des garanties légales de conformité (Art. L. 217-3 et suivants du Code de la consommation) et des vices cachés (Art. 1641 et suivants du Code civil).
      </p>

      <h2>8. Contact</h2>
      <p>Pour toute question relative à une livraison ou un retour :</p>
      <p>Email : <a href="mailto:contact@vitasync.com">contact@vitasync.com</a><br />Délai de réponse : 48h ouvrées maximum</p>
    </LegalPageLayout>
  );
}
