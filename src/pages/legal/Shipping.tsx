import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function Shipping() {
  return (
    <LegalPageLayout
      title="Shipping &amp; Returns Policy"
      subtitle="Shipping conditions, delivery zones and returns — Fulfillment by Supliful"
      date="April 8, 2026"
    >
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
    </LegalPageLayout>
  );
}
