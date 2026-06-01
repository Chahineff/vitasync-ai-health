// Supliful fulfillment webhook → triggers "stack shipped" email.
import { sendEmail } from "../_shared/emails/sender.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const expected = Deno.env.get("SUPLIFUL_WEBHOOK_SECRET");
  const provided = req.headers.get("x-supliful-secret") || req.headers.get("x-webhook-secret");
  if (expected && provided !== expected) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  let payload: any;
  try { payload = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }

  const eventType = payload.event || payload.type || "";
  if (eventType && !/ship/i.test(eventType)) return new Response(JSON.stringify({ ignored: eventType }), { status: 200 });

  const d = payload.data || payload;
  const to: string | undefined = d.customer_email || d.email || d.customer?.email;
  if (!to) return new Response(JSON.stringify({ error: "No recipient email" }), { status: 400 });

  const orderNumber = String(d.order_number || d.order_id || d.id || "");
  const carrier = String(d.carrier || d.shipping_carrier || "USPS");
  const trackingNumber = String(d.tracking_number || d.tracking || "");
  const trackingUrl = String(d.tracking_url || d.tracking_link || `https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}`);
  const estimatedDelivery = String(d.estimated_delivery || d.eta || "3-5 business days");

  try {
    const r = await sendEmail({ template: "stack_shipped", to, data: { orderNumber, carrier, trackingNumber, trackingUrl, estimatedDelivery } });
    return new Response(JSON.stringify({ ok: true, id: r.id }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("supliful-webhook error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }), { status: 500 });
  }
});