import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function CGV() {
  return (
    <LegalPageLayout
      title="Terms of Sale"
      subtitle="Conditions applicable to product purchases on vitasync.ai — US shipping only via Supliful"
      date="April 8, 2026"
    >
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
    </LegalPageLayout>
  );
}
