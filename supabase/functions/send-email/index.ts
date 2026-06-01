// Unified transactional email sender. Called by other edge functions and from
// the frontend. Validates a JWT for client calls; service-role calls bypass.
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendEmail, corsHeaders } from "../_shared/emails/sender.ts";
import type { EmailTemplateName } from "../_shared/emails/templates.ts";

const ALLOWED: EmailTemplateName[] = [
  "welcome",
  "stack_ready",
  "subscription_confirmed",
  "stack_shipped",
  "monthly_checkin",
  "subscription_cancelled",
  "pro_upsell",
  "quiz_reminder",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const body = await req.json();
    const { template, to, data } = body ?? {};
    if (!template || !to || typeof to !== "string" || !to.includes("@")) {
      return new Response(JSON.stringify({ error: "Missing template or recipient" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!ALLOWED.includes(template)) {
      return new Response(JSON.stringify({ error: "Template not allowed via this endpoint" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const isServiceRole = token && token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!isServiceRole) {
      const sb = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: claims, error } = await sb.auth.getClaims(token);
      if (error || !claims?.claims?.sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if ((claims.claims.email as string | undefined)?.toLowerCase() !== to.toLowerCase()) {
        return new Response(JSON.stringify({ error: "Recipient mismatch" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const result = await sendEmail({ template, to, data: data ?? {} });
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-email error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});