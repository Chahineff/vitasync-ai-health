import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { useTranslation } from "@/hooks/useTranslation";

const buildContent = (locale: "fr" | "en") => {
  if (locale === "fr") {
    return {
      title: "Livraison & Retours",
      subtitle: "Conditions de livraison, zones desservies et retours — Logistique assurée par Supliful",
      date: "8 avril 2026",
      body: (
        <>
          <h2>1. Présentation du Service de Livraison</h2>
          <p>Les produits VitaSync sont fabriqués et expédiés par notre partenaire logistique Supliful (Brand On Demand, Inc., Delaware, USA), depuis des entrepôts situés principalement à Arvada, Colorado, USA. Les produits sont fabriqués à la demande sous un modèle de marque blanche (étiquetés au moment de la commande aux couleurs de VitaSync).</p>

          <h2>2. Zones de Livraison et Tarifs</h2>
          <p><strong>Livraison domestique aux États-Unis uniquement</strong> — Transporteur : <span lang="en">USPS Ground Advantage</span> (Supliful).</p>
          <table>
            <thead>
              <tr><th>Poids total de la commande</th><th>Tarif de livraison</th><th>Délai estimé</th></tr>
            </thead>
            <tbody>
              <tr><td>Jusqu'à 0,5 lb (≈ 225 g)</td><td>4,50 $</td><td>4 à 10 jours ouvrés</td></tr>
              <tr><td>0,51 à 0,75 lb (≈ 340 g)</td><td>5,50 $</td><td>4 à 10 jours ouvrés</td></tr>
              <tr><td>0,76 à 1,00 lb (≈ 450 g)</td><td>6,50 $</td><td>4 à 10 jours ouvrés</td></tr>
              <tr><td>1,01 à 2,00 lb (≈ 900 g)</td><td>8,00 $</td><td>4 à 10 jours ouvrés</td></tr>
            </tbody>
          </table>
          <p>Les tarifs ci-dessus sont calculés automatiquement lors du paiement Shopify, en fonction du poids total du panier. La taxe de vente applicable (<span lang="en">sales tax</span>) est ajoutée automatiquement selon l'État de livraison.</p>

          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
            <p className="text-foreground">
              <strong>ZONES NON DESSERVIES :</strong> Alaska, Hawaii, territoires américains (Porto Rico, Guam, Îles Vierges) et tous les pays hors États-Unis. Si vous ne résidez pas dans l'un des 48 États contigus, vous ne pourrez pas finaliser une commande. Nous vous invitons à vous inscrire à notre newsletter pour être informé de l'ouverture de nouvelles zones.
            </p>
          </div>

          <h2>3. Délais de Préparation et de Livraison</h2>
          <p><strong>Délai de fabrication et d'expédition :</strong> les produits étant fabriqués à la demande sous un modèle de marque blanche, un délai de 1 à 3 jours ouvrés est nécessaire entre la validation de la commande et l'expédition (étiquetage, conditionnement, remise au transporteur).</p>
          <p><strong>Délai de livraison :</strong> 4 à 10 jours ouvrés après expédition via <span lang="en">USPS Ground Advantage</span>. Ce délai court à compter de l'expédition du colis (et non de la commande). Les délais de livraison ne sont pas garantis et peuvent être impactés par les périodes de forte affluence, les conditions climatiques ou les opérations postales USPS.</p>
          <p>Sauf date de livraison spécifiée lors du paiement, la livraison interviendra dans un délai de 30 jours suivant la confirmation de la commande. En cas de retard, l'acheteur peut, après mise en demeure restée sans réponse, résoudre le contrat et obtenir un remboursement intégral dans un délai de 14 jours.</p>

          <h2>4. Suivi de Commande</h2>
          <p>Un numéro de suivi USPS est communiqué par e-mail dès l'expédition du colis. Le suivi est disponible sur <a href="https://www.usps.com/tracking" target="_blank" rel="noopener noreferrer">www.usps.com/tracking</a>. Les notifications d'étapes de livraison sont envoyées automatiquement par Shopify.</p>

          <h2>5. Politique de Retour</h2>

          <h3>5.1 Droit de rétractation (14 jours — produits scellés uniquement)</h3>
          <p><strong>Pour les consommateurs résidant dans l'Union européenne :</strong> les consommateurs UE disposent de 14 jours calendaires à compter de la réception pour exercer leur droit de rétractation, sans justification, sur les produits restés scellés (scellé inviolable intact).</p>
          <p><strong>Pour les consommateurs résidant aux États-Unis :</strong> vous disposez de 14 jours calendaires à compter de la réception pour retourner un produit scellé et non ouvert, conformément à notre politique commerciale volontaire.</p>
          <p>Pour exercer ce droit, contactez-nous à <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a> en indiquant votre numéro de commande.</p>
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
            <p className="text-foreground">
              <strong>Exception santé et hygiène :</strong> le droit de rétractation et les retours commerciaux ne s'appliquent PAS aux compléments alimentaires dont le scellé de sécurité (film thermorétractable, scellé inviolable) a été rompu après livraison. Cette exception se fonde sur le droit de la consommation applicable en UE pour les consommateurs UE, et sur les pratiques standards de l'industrie des compléments alimentaires aux USA, pour des raisons de protection de la santé publique et d'hygiène.
            </p>
          </div>

          <h3>5.2 Produits défectueux ou endommagés</h3>
          <p>Si vous recevez un produit défectueux, endommagé pendant le transport ou mal imprimé, contactez-nous à <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a> dans les 30 jours suivant la réception, accompagné d'une photo claire du problème (produit, scellé, emballage extérieur). VitaSync prendra en charge le remplacement ou le remboursement intégral, les frais de retour étant à la charge de VitaSync.</p>

          <h3>5.3 Colis perdus en transit</h3>
          <p>Si votre colis est déclaré perdu en transit par USPS (aucune mise à jour de suivi pendant plus de 10 jours ouvrés après expédition), contactez-nous. Nous ouvrirons une enquête auprès d'USPS et, une fois la perte confirmée, procèderons au remplacement ou au remboursement.</p>

          <h3>5.4 Cas exclus de remboursement</h3>
          <ul>
            <li>Erreur d'adresse de livraison fournie par le client (adresse incomplète, inexistante, code postal erroné).</li>
            <li>Colis non récupéré auprès du transporteur et retourné à l'expéditeur.</li>
            <li>Regret d'achat après ouverture du produit (scellé rompu).</li>
            <li>Dépassement du délai de 14 jours pour le droit de rétractation (produits scellés).</li>
            <li>Dommages causés par une mauvaise utilisation ou un stockage inapproprié après réception.</li>
          </ul>

          <h3>5.5 Modalités de Remboursement</h3>
          <p>Les remboursements sont effectués sur le moyen de paiement initial (via <span lang="en">Shopify Payments</span>) dans un délai de 14 jours à compter de la réception du retour ou de la preuve de perte. Pour les consommateurs UE exerçant leur droit de rétractation, le remboursement inclut les frais de livraison initiaux au tarif standard. Les frais de retour sont à la charge de l'acheteur, sauf en cas de produit défectueux ou d'erreur de VitaSync.</p>

          <h2>6. Garanties Légales</h2>
          <p>Indépendamment de la présente politique, le consommateur bénéficie des garanties légales applicables :</p>
          <ul>
            <li><strong>UE / France :</strong> garantie légale de conformité (2 ans pour les consommateurs UE) et garantie des vices cachés (droit de la consommation applicable).</li>
            <li><strong>USA :</strong> <span lang="en">Magnuson-Moss Warranty Act</span> (fédéral) et <span lang="en">Uniform Commercial Code (UCC)</span> de l'État de résidence de l'acheteur, y compris les garanties implicites de qualité marchande (<span lang="en">implied warranties of merchantability and fitness for a particular purpose</span>).</li>
          </ul>

          <h2>7. Contact</h2>
          <p>Pour toute question concernant une livraison ou un retour :</p>
          <p>Email : <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a><br />Délai de réponse : sous 48 heures ouvrées</p>
        </>
      ),
    };
  }
  return {
    title: "Shipping & Returns Policy",
    subtitle: "Shipping conditions, delivery zones and returns — Fulfillment by Supliful",
    date: "April 8, 2026",
    body: (
      <>
        <h2>1. Overview of the Shipping Service</h2>
        <p>VitaSync products are manufactured and shipped by our fulfillment partner Supliful (Brand On Demand, Inc., Delaware, USA) from warehouses located primarily in Arvada, Colorado, USA. Products are made on demand under a white-label model (labeled at order time with the VitaSync brand).</p>

        <h2>2. Shipping Zones and Rates</h2>
        <p><strong>Domestic US shipping only</strong> — Carrier: USPS Ground Advantage (Supliful).</p>
        <table>
          <thead>
            <tr><th>Total order weight</th><th>Shipping rate</th><th>Estimated delivery</th></tr>
          </thead>
          <tbody>
            <tr><td>Up to 0.5 lb (≈ 225 g)</td><td>$4.50</td><td>4-10 business days</td></tr>
            <tr><td>0.51 to 0.75 lb (≈ 340 g)</td><td>$5.50</td><td>4-10 business days</td></tr>
            <tr><td>0.76 to 1.00 lb (≈ 450 g)</td><td>$6.50</td><td>4-10 business days</td></tr>
            <tr><td>1.01 to 2.00 lb (≈ 900 g)</td><td>$8.00</td><td>4-10 business days</td></tr>
          </tbody>
        </table>
        <p>The rates above are calculated automatically at Shopify checkout based on the total cart weight. Applicable sales tax is added automatically based on the shipping state.</p>

        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
          <p className="text-foreground">
            <strong>UNSERVED ZONES:</strong> Alaska, Hawaii, US territories (Puerto Rico, Guam, Virgin Islands), and all countries outside the United States. If you are not a resident of the 48 contiguous states, you will not be able to complete an order. We invite you to subscribe to our newsletter to be notified when new zones open.
          </p>
        </div>

        <h2>3. Processing and Delivery Times</h2>
        <p><strong>Manufacturing and dispatch time:</strong> as products are made on demand under a white-label model, a delay of 1 to 3 business days is required between order validation and dispatch (labeling, packaging, handing over to the carrier).</p>
        <p><strong>Delivery time:</strong> 4 to 10 business days after dispatch via USPS Ground Advantage. This time begins from the dispatch of the package (not from the order). Delivery times are not guaranteed and may be impacted by peak periods, weather conditions, or USPS postal operations.</p>
        <p>Unless a delivery date is specified at checkout, delivery shall occur within 30 days of order confirmation. In the event of a delay, the buyer may, after a written notice that remains unanswered, terminate the contract and obtain a full refund within 14 days.</p>

        <h2>4. Order Tracking</h2>
        <p>A USPS tracking number is provided by email as soon as the package ships. Tracking is available at <a href="https://www.usps.com/tracking" target="_blank" rel="noopener noreferrer">www.usps.com/tracking</a>. Delivery milestone notifications are sent automatically by Shopify.</p>

        <h2>5. Return Policy</h2>

        <h3>5.1 Right of withdrawal (14 days — sealed products only)</h3>
        <p><strong>For consumers residing in the European Union:</strong> EU consumers have 14 calendar days from receipt to exercise their right of withdrawal, without justification, for products that remain sealed (tamper seal intact).</p>
        <p><strong>For consumers residing in the United States:</strong> you have 14 calendar days from receipt to return a sealed, unopened product, in accordance with our voluntary commercial policy.</p>
        <p>To exercise this right, contact us at <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a> with your order number.</p>
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
          <p className="text-foreground">
            <strong>Health and hygiene exception:</strong> The right of withdrawal and commercial returns do NOT apply to dietary supplements whose safety seal (shrink-wrap, tamper-evident seal) has been broken after delivery. This exception is based on applicable EU consumer protection law for EU consumers, and on standard practices in the dietary supplement industry in the USA, for reasons of public health protection and hygiene.
          </p>
        </div>

        <h3>5.2 Defective or damaged products</h3>
        <p>If you receive a defective product, one damaged in transit, or misprinted, contact us at <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a> within 30 days of receipt with a clear photo of the issue (product, seal, outer packaging). VitaSync will cover replacement or full refund, with return shipping at VitaSync's expense.</p>

        <h3>5.3 Packages lost in transit</h3>
        <p>If your package is declared lost in transit by USPS (no tracking update for more than 10 business days after dispatch), contact us. We will open an investigation with USPS and, once the loss is confirmed, proceed with replacement or refund.</p>

        <h3>5.4 Cases excluded from refund</h3>
        <ul>
          <li>Shipping address error provided by the customer (incomplete address, non-existent address, wrong zip code).</li>
          <li>Package not picked up from the carrier and returned to sender.</li>
          <li>Buyer's remorse after opening the product (broken seal).</li>
          <li>Exceeding the 14-day window for the right of withdrawal (sealed products).</li>
          <li>Damage caused by misuse or improper storage after receipt.</li>
        </ul>

        <h3>5.5 Refund Terms</h3>
        <p>Refunds are issued to the original payment method (via Shopify Payments) within 14 days of receipt of the return or proof of loss. For EU consumers exercising the right of withdrawal, the refund includes initial shipping fees at the standard rate. Return shipping costs are the buyer's responsibility, except in case of a defective product or VitaSync error.</p>

        <h2>6. Legal Warranties</h2>
        <p>Independent of this policy, the consumer benefits from the applicable legal warranties:</p>
        <ul>
          <li><strong>EU / France:</strong> legal warranty of conformity (2 years for EU consumers) and warranty against hidden defects (applicable consumer law).</li>
          <li><strong>USA:</strong> Magnuson-Moss Warranty Act (federal) and the Uniform Commercial Code (UCC) of the buyer's state of residence, including implied warranties of merchantability and fitness for a particular purpose.</li>
        </ul>

        <h2>7. Contact</h2>
        <p>For any question regarding a delivery or return:</p>
        <p>Email: <a href="mailto:contact@vitasync.ai">contact@vitasync.ai</a><br />Response time: within 48 business hours</p>
      </>
    ),
  };
};

export default function Shipping() {
  const { locale } = useTranslation();
  const effectiveLocale: "fr" | "en" = locale === "fr" ? "fr" : "en";
  const c = buildContent(effectiveLocale);
  return (
    <LegalPageLayout title={c.title} subtitle={c.subtitle} date={c.date}>
      {c.body}
    </LegalPageLayout>
  );
}
