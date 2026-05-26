import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function Privacy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How VitaSync collects, uses, and protects your information — United States"
      date="June 1, 2026"
    >
      <p>VitaSync ("VitaSync," "we," "us") respects your privacy, especially your health-related information. This policy explains what we collect, how we use it, who we share it with, and the rights you have under the California Consumer Privacy Act as amended by the CPRA, and comparable U.S. state privacy laws (Virginia VCDPA, Colorado CPA, Connecticut CTDPA, Utah UCPA, Texas TDPSA, and Oregon OCPA).</p>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 my-4">
        <p className="text-foreground">
          <strong>Scope:</strong> VitaSync sells and ships only within the United States (48 contiguous states) through our fulfillment partner Supliful. VitaSync is a wellness and nutrition platform; it is not a medical service and does not provide medical advice, diagnosis, or treatment.
        </p>
      </div>

      <h2>1. Information We Collect</h2>

      <h3>1.1 Identification data</h3>
      <ul>
        <li>First and last name, email address (at sign-up)</li>
        <li>Date of birth (age verification and personalization)</li>
        <li>Optional profile photo (stored in a private, encrypted bucket)</li>
        <li>An automatically generated account ID</li>
      </ul>

      <h3>1.2 Sensitive health information you provide</h3>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground">
          <strong>Sensitive information:</strong> The information below is treated as sensitive personal information under the CCPA/CPRA and comparable state laws. We use it only to generate your personalized recommendations, and you can withdraw it or delete your account at any time from your settings.
        </p>
      </div>
      <ul>
        <li>Wellness goals (energy, performance, sleep, nutrition, stress)</li>
        <li>Self-reported health concerns</li>
        <li>Physical activity level and types of sport</li>
        <li>Sleep quality, stress level, and mood (daily check-ins rated 1–5)</li>
        <li>Allergies and self-reported conditions</li>
        <li>Diet and supplement-form preferences</li>
        <li>Monthly supplement budget</li>
        <li>Blood-test values you enter manually (and any PDF you upload, stored in a private encrypted bucket)</li>
        <li>The supplements you choose to track (name, dosage, schedule)</li>
      </ul>

      <h3>1.3 Purchase data</h3>
      <ul>
        <li>Orders, subscriptions, and U.S. shipping address</li>
        <li>Payment status (payments are processed by our payment processor; we do not store full card numbers)</li>
      </ul>

      <h3>1.4 Technical data</h3>
      <ul>
        <li>IP address, browser, and operating system</li>
        <li>Pages visited and session duration</li>
        <li>Interface preferences (theme, language)</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>To create and operate your account; to power the AI coach and generate personalized, non-medical supplement recommendations; to process orders and subscriptions through Shopify and Supliful; to send service emails and, with your consent, marketing emails; to improve the product; and to comply with applicable law.</p>

      <h2>3. Sensitive Health Information — We Do Not Sell It</h2>
      <p>Information you share with the AI coach (sleep, stress, medications, goals, blood-test values) is used solely to generate your personalized recommendations. <strong>We do not sell or "share" (as defined by the CCPA/CPRA) your personal information, and we do not sell or share your sensitive health information for cross-context behavioral advertising.</strong></p>

      <h2>4. Who We Share Data With (Service Providers)</h2>
      <p>We share data only with service providers that help us run VitaSync, under contracts that limit their use of your data to providing services to us:</p>
      <ul>
        <li><strong>Shopify</strong> — store, checkout, and subscriptions</li>
        <li><strong>Supabase</strong> — database, authentication, and storage</li>
        <li><strong>Google Gemini</strong> — AI coach inference</li>
        <li><strong>Supliful</strong> — order fulfillment</li>
        <li><strong>Klaviyo</strong> — email</li>
        <li>Analytics providers</li>
      </ul>

      <h2>5. Your U.S. Privacy Rights</h2>
      <p>Depending on your state, you may have the right to: know and access the personal information we hold; correct it; delete it; obtain a portable copy; opt out of the sale or sharing of personal information; limit the use of sensitive personal information; and not be discriminated against for exercising these rights.</p>
      <p><strong>We do not sell your data, so there is no "Do Not Sell" transaction to opt out of</strong>, but you can still exercise the rights above. Exercise any right from your account settings (Export / Delete) or by emailing <a href="mailto:contact@vitasync.co">contact@vitasync.co</a>. We respond within the timeframe required by applicable law (generally 45 days). You may use an authorized agent.</p>

      <h2>6. Data Retention and Security</h2>
      <p>We keep personal data only as long as needed for the purposes above or as required by law (for example, order and tax records). Data is encrypted in transit (TLS) and at rest (AES-256); health files are stored in a private, encrypted bucket.</p>

      <h2>7. Children</h2>
      <p>VitaSync is intended for users 18 and older. We do not knowingly collect personal information from anyone under 18.</p>

      <h2>8. Changes and Contact</h2>
      <p>We will post changes here with a new "Last updated" date. VitaSync is currently forming its U.S. entity; full company details will be published upon registration. Contact: <a href="mailto:contact@vitasync.co">contact@vitasync.co</a>.</p>
    </LegalPageLayout>
  );
}
