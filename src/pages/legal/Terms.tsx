import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function Terms() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="The rules that govern your use of VitaSync — United States"
      date="June 1, 2026"
    >
      <h2>1. Acceptance and Eligibility</h2>
      <p>By creating an account or using VitaSync (the "Platform"), you agree to these Terms of Service ("Terms") and our Privacy Policy. You must be <strong>18 or older</strong> and a <strong>United States resident</strong>. The VitaSync store ships only to the 48 contiguous U.S. states through our fulfillment partner Supliful.</p>

      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-6">
        <p className="text-foreground font-medium">
          VitaSync is a wellness, nutrition, and education platform powered by AI. It is NOT a medical device or a medical service and does not diagnose, treat, cure, or prevent any disease. The AI coach (powered by Google Gemini) provides general wellness information, not prescriptions. Always consult a qualified healthcare professional before making any health, diet, or supplement decision, especially if you are pregnant, nursing, taking medication, or have a medical condition.
        </p>
      </div>

      <h2>2. Definitions</h2>
      <ul>
        <li><strong>"Platform"</strong>: the VitaSync website and all of its features.</li>
        <li><strong>"User"</strong>: any individual aged 18 or older who registers on the Platform.</li>
        <li><strong>"AI Coach"</strong>: VitaSync's artificial-intelligence assistant, powered by Google Gemini.</li>
        <li><strong>"Stack"</strong>: the set of supplements in a User's monthly subscription.</li>
        <li><strong>"Check-in"</strong>: the daily wellness journal a User completes.</li>
        <li><strong>"Products"</strong>: the dietary supplements sold through the VitaSync store (U.S. shipping only).</li>
      </ul>

      <h2>3. Accounts</h2>
      <p>3.1 Registration is reserved for individuals 18 or older. You agree to provide accurate, current information. Passwords must contain at least 8 characters, including an uppercase letter, a number, and a special character.</p>
      <p>3.2 After registration you are invited to complete a wellness questionnaire (onboarding) to receive personalized recommendations. It is optional but necessary to receive tailored recommendations.</p>
      <p>3.3 You may delete your account at any time from your dashboard settings. Deletion erases your data in accordance with the Privacy Policy and applicable U.S. law (including CCPA/CPRA for California residents).</p>

      <h2>4. Subscriptions, Billing, and Cancellation</h2>
      <p>Paid plans (for example, Pro at $7.99/month) and monthly supplement stacks renew automatically until cancelled. You may cancel anytime from your account or the Shopify customer portal; cancellation stops future renewals and takes effect at the end of the current billing period. Prices are in U.S. dollars. Payments are processed by our payment processor.</p>

      <h2>5. Products and Dietary-Supplement Notice</h2>
      <p>Products are sold as dietary supplements under the Dietary Supplement Health and Education Act (DSHEA, 1994).</p>
      <div className="p-4 rounded-xl bg-muted/50 border border-border/50 my-4">
        <p className="text-foreground font-medium">
          These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </div>

      <h2>6. Returns and Shipping</h2>
      <p>See our Shipping &amp; Returns policy for details. Returns are accepted within 30 days under the conditions stated there. Delivery is via USPS within the United States, and delivery timeframes are estimates, not guarantees.</p>

      <h2>7. Acceptable Use and Intellectual Property</h2>
      <p>You agree not to misuse the Platform, scrape it, or infringe our intellectual property. VitaSync and its content are owned by VitaSync.</p>

      <h2>8. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, VitaSync is not liable for indirect or consequential damages, or for decisions you make based on Platform information. The Platform is provided "as is," without warranties of any kind.</p>

      <h2>9. Governing Law</h2>
      <p>These Terms are governed by U.S. federal law and the laws of the State of Delaware (or the State of incorporation, once the VitaSync entity is registered), without regard to conflict-of-laws rules.</p>

      <h2>10. Contact</h2>
      <p>VitaSync is currently forming its U.S. entity; full company details will be published upon registration. Contact: <a href="mailto:contact@vitasync.co">contact@vitasync.co</a>.</p>
    </LegalPageLayout>
  );
}
