import { useEffect } from "react";

const sections = [
  {
    title: "1. Introduction",
    content:
      "VitaSync is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our website and AI wellness coach.",
  },
  {
    title: "2. Information We Collect",
    content: null,
    list: [
      "Account information: name, email address, password (encrypted)",
      "Health data: sleep patterns, stress levels, fitness goals, dietary preferences, medication mentions — shared voluntarily through the AI coach",
      "Purchase data: order history, subscription status, US shipping address",
      "Usage data: pages visited, coach interactions, session duration",
      "Technical data: IP address, browser type, device type, cookies",
    ],
  },
  {
    title: "3. Sensitive Health Data",
    content:
      "Data shared with our AI coach (sleep, stress, medications, goals) is treated as sensitive health information. We do not sell, share, or monetize this data. It is used solely to generate your personalized supplement recommendations.",
  },
  {
    title: "4. How We Use Your Data",
    content: null,
    list: [
      "To provide personalized supplement recommendations via our AI coach",
      "To process your orders through Shopify and Supliful (US fulfillment)",
      "To manage your subscription and account",
      "To improve AI performance (anonymized and aggregated only)",
      "To send transactional emails (order confirmations, shipping updates)",
      "To send marketing emails, only with your explicit consent",
    ],
  },
  {
    title: "5. Data Sharing",
    content: "We share minimal data with:",
    list: [
      "Supliful: shipping name and address only (no health data)",
      "Shopify: order and payment data",
      "Supabase: secure encrypted database hosting",
      "Gemini API (Google): anonymized chat context for AI responses only",
    ],
    after: "We do NOT sell your personal data to any third party.",
  },
  {
    title: "6. Your Rights (GDPR / CCPA)",
    content: null,
    list: [
      "Right to access: email privacy@vitasync.co",
      "Right to erasure: delete your account and data from settings",
      "Right to data portability: export your data in JSON from account settings",
      "Right to opt-out of marketing emails at any time",
      "California residents: right to know what data we collect; we do not sell data",
    ],
  },
  {
    title: "7. Cookies",
    content:
      "We use essential cookies (authentication, session) and optional analytics cookies. Manage preferences via the consent banner on your first visit.",
  },
  {
    title: "8. Data Retention",
    content:
      "Account data kept while account is active. Deleted accounts: all personal data erased within 30 days. Order data retained 7 years for legal/tax purposes.",
  },
  {
    title: "9. Security",
    content:
      "All data transmitted over HTTPS. Health data stored encrypted in Supabase with Row Level Security. Only you can access your health profile.",
  },
  {
    title: "10. Contact",
    content: "privacy@vitasync.co",
  },
];

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <header
        className="w-full"
        style={{ backgroundColor: "#0A1628" }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: 760,
            padding: "48px 32px 40px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 26,
              color: "#FFFFFF",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Privacy Policy
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: 12,
              color: "#00D4C8",
              margin: "8px 0 0",
            }}
          >
            VitaSync — Last updated: April 2026
          </p>
        </div>
      </header>

      {/* Separator */}
      <div
        className="w-full"
        style={{ height: 2, backgroundColor: "#00D4C8" }}
      />

      {/* Content */}
      <main
        className="mx-auto"
        style={{
          maxWidth: 760,
          padding: "48px 32px",
        }}
      >
        {sections.map((section) => (
          <div key={section.title}>
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#0A1628",
                marginTop: 32,
                marginBottom: 12,
              }}
            >
              {section.title}
            </h2>

            {section.content && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: 15,
                  color: "#4A5568",
                  lineHeight: 1.7,
                  textAlign: "justify",
                  margin: "0 0 8px",
                }}
              >
                {section.content}
              </p>
            )}

            {section.list && (
              <ul
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: 15,
                  color: "#4A5568",
                  lineHeight: 1.7,
                  paddingLeft: 20,
                  margin: "4px 0 8px",
                }}
              >
                {section.list.map((item) => (
                  <li key={item} style={{ marginBottom: 4 }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {section.after && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#4A5568",
                  lineHeight: 1.7,
                  textAlign: "justify",
                  marginTop: 8,
                }}
              >
                {section.after}
              </p>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
