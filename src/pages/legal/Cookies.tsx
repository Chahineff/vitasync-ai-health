import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export default function Cookies() {
  return (
    <LegalPageLayout
      title="Cookie Notice"
      subtitle="How VitaSync uses cookies — United States"
      date="June 1, 2026"
    >
      <p>This notice explains how VitaSync uses cookies and similar technologies on our website.</p>

      <h2>1. Cookies We Use</h2>
      <ul>
        <li><strong>Strictly necessary cookies</strong> — required to run the service (authentication, security, and the Shopify cart). These are always active.</li>
        <li><strong>Optional cookies</strong> — analytics and non-essential preferences. These are used only with your choice.</li>
      </ul>

      <h2>2. Your Choices</h2>
      <p>U.S. privacy laws let you opt out of non-essential cookies and tracking. You can manage your choice through the cookie banner shown on your first visit, or later in your settings. Where required, we honor Global Privacy Control (GPC) browser signals.</p>

      <h2>3. We Do Not Sell Your Information</h2>
      <p>We do not sell your personal information. For details on the data we collect and your rights, see our <a href="/privacy">Privacy Policy</a>.</p>

      <h2>4. Contact</h2>
      <p>Questions about this notice? Contact <a href="mailto:contact@vitasync.co">contact@vitasync.co</a>.</p>
    </LegalPageLayout>
  );
}
