import { useEffect } from "react";

export default function ShippingPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <header className="w-full" style={{ backgroundColor: "#0A1628" }}>
        <div className="mx-auto" style={{ maxWidth: 760, padding: "48px 32px 40px" }}>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 26, color: "#FFFFFF", margin: 0, lineHeight: 1.3 }}>Shipping Policy</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "#00D4C8", margin: "8px 0 0" }}>VitaSync — Last updated: April 2026</p>
        </div>
      </header>
      <div className="w-full" style={{ height: 2, backgroundColor: "#00D4C8" }} />
      <main className="mx-auto" style={{ maxWidth: 760, padding: "48px 32px" }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#0A1628", marginTop: 32, marginBottom: 12 }}>Shipping Zone</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, textAlign: "justify" }}>VitaSync ships exclusively to the contiguous United States (48 states). We do not ship to Hawaii, Alaska, US territories, or internationally.</p>

        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#0A1628", marginTop: 32, marginBottom: 12 }}>Fulfillment Partner</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, textAlign: "justify" }}>All orders are fulfilled by Supliful, our US-based fulfillment partner. Orders are processed within 1–3 business days.</p>

        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#0A1628", marginTop: 32, marginBottom: 12 }}>Shipping Rates</h2>
        <ul style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, paddingLeft: 20 }}>
          <li style={{ marginBottom: 4 }}>Up to 0.5 lb: $4.50</li>
          <li style={{ marginBottom: 4 }}>0.5 – 0.75 lb: $5.50</li>
          <li style={{ marginBottom: 4 }}>0.75 – 1 lb: $6.50</li>
          <li style={{ marginBottom: 4 }}>1 – 2 lb: $8.00</li>
        </ul>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, textAlign: "justify" }}>Rates calculated at checkout based on order weight.</p>

        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#0A1628", marginTop: 32, marginBottom: 12 }}>Delivery Times</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, textAlign: "justify" }}>Estimated delivery: 5–10 business days after processing. Delays may occur due to carrier capacity or weather.</p>

        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#0A1628", marginTop: 32, marginBottom: 12 }}>Tracking</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, textAlign: "justify" }}>A tracking number will be emailed once your order ships. Track via the carrier's website or your VitaSync account.</p>

        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#0A1628", marginTop: 32, marginBottom: 12 }}>Lost or Damaged Orders</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "#4A5568", lineHeight: 1.7, textAlign: "justify" }}>Contact support@vitasync.co within 14 days of the estimated delivery date. We will coordinate with Supliful to resolve the issue.</p>
      </main>
    </div>
  );
}
