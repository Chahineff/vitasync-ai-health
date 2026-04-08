import { useEffect } from "react";

export default function RefundPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <header className="w-full" style={{ backgroundColor: "#0A1628" }}>
        <div className="mx-auto" style={{ maxWidth: 760, padding: "48px 32px 40px" }}>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 26, color: "#FFFFFF", margin: 0, lineHeight: 1.3 }}>Refund Policy</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "#00D4C8", margin: "8px 0 0" }}>VitaSync — Last updated: April 2026</p>
        </div>
      </header>
      <div className="w-full" style={{ height: 2, backgroundColor: "#00D4C8" }} />
      <main className="mx-auto" style={{ maxWidth: 760, padding: "48px 32px" }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#0A1628", marginTop: 32, marginBottom: 12 }}>30-Day Satisfaction Guarantee</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, textAlign: "justify" }}>If you are not satisfied with your first order, contact us within 30 days of delivery for a full refund.</p>

        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#0A1628", marginTop: 32, marginBottom: 12 }}>Conditions</h2>
        <ul style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, paddingLeft: 20 }}>
          <li style={{ marginBottom: 4 }}>Unopened product in original packaging: full refund</li>
          <li style={{ marginBottom: 4 }}>Opened product: 50% refund if you experience an adverse reaction, at our discretion</li>
          <li style={{ marginBottom: 4 }}>Shipping costs are non-refundable unless the error is on our side</li>
          <li style={{ marginBottom: 4 }}>Pro subscription (AI coach): cancel anytime, no refund for the current billing period</li>
        </ul>

        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#0A1628", marginTop: 32, marginBottom: 12 }}>How to Request a Refund</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, textAlign: "justify" }}>Email support@vitasync.co with your order number and reason. We respond within 2 business days.</p>

        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#0A1628", marginTop: 32, marginBottom: 12 }}>Processing Time</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, textAlign: "justify" }}>Refunds processed within 5–7 business days after approval, credited to your original payment method.</p>
      </main>
    </div>
  );
}
