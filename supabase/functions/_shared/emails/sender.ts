// Resend gateway sender. Routes all emails through the Lovable connector gateway.
import { FROM_ADDRESS } from "./design.ts";
import { renderTemplate, type EmailTemplateName, type RenderedEmail } from "./templates.ts";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export interface SendOptions {
  to: string;
  template: EmailTemplateName;
  data: Record<string, any>;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail(opts: SendOptions): Promise<{ id?: string; status: number; error?: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

  const rendered: RenderedEmail = renderTemplate(opts.template, { ...opts.data, email: opts.to });

  const headers: Record<string, string> = {};
  if (rendered.listUnsubscribe) {
    headers["List-Unsubscribe"] = rendered.listUnsubscribe;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  const payload: Record<string, unknown> = {
    from: FROM_ADDRESS,
    to: [opts.to],
    subject: rendered.subject,
    html: rendered.html,
  };
  if (Object.keys(headers).length) payload.headers = headers;
  if (opts.replyTo) payload.reply_to = opts.replyTo;
  if (opts.tags) payload.tags = opts.tags;

  const resp = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const text = await resp.text();
  let parsed: any = null;
  try { parsed = JSON.parse(text); } catch { /* not JSON */ }

  if (!resp.ok) {
    console.error("Resend gateway error", { template: opts.template, status: resp.status, body: text.slice(0, 500) });
    return { status: resp.status, error: parsed?.message || text.slice(0, 300) };
  }
  return { id: parsed?.id, status: resp.status };
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};