// Supabase Auth "Send Email" hook. Replaces default auth emails with
// Resend-powered VitaSync-branded versions (confirm signup + password reset).
import { sendEmail, corsHeaders } from "../_shared/emails/sender.ts";

async function verify(secret: string, id: string, ts: string, body: string, header: string): Promise<boolean> {
  const cleaned = secret.replace(/^v1,whsec_/, "").replace(/^whsec_/, "");
  const key = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(atob(cleaned), c => c.charCodeAt(0)),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return header.split(" ").some(s => s.split(",")[1] === expected);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const raw = await req.text();
  const secret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
  if (secret) {
    const id = req.headers.get("webhook-id") ?? "";
    const ts = req.headers.get("webhook-timestamp") ?? "";
    const sig = req.headers.get("webhook-signature") ?? "";
    if (!id || !ts || !sig) return new Response(JSON.stringify({ error: "Missing signature" }), { status: 401 });
    const ok = await verify(secret, id, ts, raw, sig).catch(() => false);
    if (!ok) return new Response(JSON.stringify({ error: "Bad signature" }), { status: 401 });
  }

  let payload: any;
  try { payload = JSON.parse(raw); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }

  const user = payload?.user ?? {};
  const ed = payload?.email_data ?? {};
  const to: string | undefined = user.email;
  if (!to) return new Response(JSON.stringify({ error: "No recipient" }), { status: 400 });

  const siteUrl = "https://vitasync.me";
  const verificationUrl = `${siteUrl}/auth/confirm?token_hash=${encodeURIComponent(ed.token_hash || "")}&type=${encodeURIComponent(ed.email_action_type || "signup")}${ed.redirect_to ? `&redirect_to=${encodeURIComponent(ed.redirect_to)}` : ""}`;
  const firstName = user.user_metadata?.first_name || null;

  try {
    if (ed.email_action_type === "recovery") {
      await sendEmail({ template: "password_reset", to, data: { resetUrl: verificationUrl } });
    } else {
      await sendEmail({ template: "confirm_account", to, data: { firstName, confirmationUrl: verificationUrl } });
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("auth-email-hook error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }), { status: 500 });
  }
});