import { useEffect } from "react";

const sections = [
  {
    title: "1. Acceptance",
    content:
      "By creating an account on VitaSync, you agree to these Terms of Service. If you do not agree, please do not use our service.",
  },
  {
    title: "2. Service Description",
    content:
      "VitaSync provides an AI-powered wellness coaching service and a personalized monthly supplement subscription. The AI coach offers health guidance based on information you voluntarily provide.",
  },
  {
    title: "3. Medical Disclaimer — IMPORTANT",
    content:
      "The VitaSync AI coach is NOT a medical professional and does NOT provide medical advice. All recommendations are for informational and wellness purposes only. Always consult a licensed healthcare provider before starting any supplement regimen, especially if you are pregnant, breastfeeding, have a chronic condition, take prescription medications, or are under 18 years of age. VitaSync shall not be held liable for any health outcomes resulting from the use of our AI recommendations.",
    alert: true,
  },
  {
    title: "4. Subscriptions & Payments",
    list: [
      "Free plan: basic AI coach access, limited features",
      "Pro plan ($7.99/month): full AI coach, personalized monthly stack",
      "Supplement subscriptions: billed monthly based on your selected stack",
      "All prices in USD. Payments via Stripe through Shopify.",
      "Cancel your subscription anytime from your account settings.",
    ],
  },
  {
    title: "5. Product Claims",
    content:
      "Our supplements are sold as dietary supplements under DSHEA (1994). These statements have not been evaluated by the Food and Drug Administration. Our products are not intended to diagnose, treat, cure, or prevent any disease.",
  },
  {
    title: "6. US Only",
    content:
      "VitaSync ships exclusively to addresses within the United States via Supliful. We do not ship internationally.",
  },
  {
    title: "7. Intellectual Property",
    content:
      "The VitaSync brand, AI coach, and all site content are the property of VitaSync. You may not reproduce or distribute them without written permission.",
  },
  {
    title: "8. Limitation of Liability",
    content:
      "VitaSync's liability is limited to the amount paid for the service in the 3 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.",
  },
  {
    title: "9. Changes to Terms",
    content:
      "We may update these terms at any time. You will be notified by email and must accept the new terms to continue using the service.",
  },
  {
    title: "10. Contact",
    content: "legal@vitasync.co",
  },
];

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <header className="w-full" style={{ backgroundColor: "#0A1628" }}>
        <div className="mx-auto" style={{ maxWidth: 760, padding: "48px 32px 40px" }}>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 26, color: "#FFFFFF", margin: 0, lineHeight: 1.3 }}>
            Terms of Service
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "#00D4C8", margin: "8px 0 0" }}>
            VitaSync — Last updated: April 2026
          </p>
        </div>
      </header>

      <div className="w-full" style={{ height: 2, backgroundColor: "#00D4C8" }} />

      <main className="mx-auto" style={{ maxWidth: 760, padding: "48px 32px" }}>
        {sections.map((section) => (
          <div key={section.title}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#0A1628", marginTop: 32, marginBottom: 12 }}>
              {section.title}
            </h2>

            {section.alert && section.content ? (
              <div style={{ backgroundColor: "#FFF5F5", border: "1px solid #E53E3E", borderRadius: 8, padding: "16px 20px", marginBottom: 8 }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15, color: "#4A5568", lineHeight: 1.7, textAlign: "justify", margin: 0 }}>
                  {section.content}
                </p>
              </div>
            ) : section.content ? (
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, textAlign: "justify", margin: "0 0 8px" }}>
                {section.content}
              </p>
            ) : null}

            {section.list && (
              <ul style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, paddingLeft: 20, margin: "4px 0 8px" }}>
                {section.list.map((item) => (
                  <li key={item} style={{ marginBottom: 4 }}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
