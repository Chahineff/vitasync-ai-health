// Cron-driven sender for the 3 scheduled emails:
//   action=quiz_reminder    → 24h after signup if onboarding incomplete
//   action=monthly_checkin  → 25th of each month for active subscribers
//   action=pro_upsell       → 7 days after signup, still on free plan
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendEmail } from "../_shared/emails/sender.ts";

function authorized(req: Request): boolean {
  const expected = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return !!expected && got === expected;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!authorized(req)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || (await req.json().catch(() => ({}))).action;

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let sent = 0; let skipped = 0; const failures: string[] = [];

  async function listUsers(): Promise<any[]> {
    const out: any[] = [];
    for (let page = 1; page <= 25; page++) {
      const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      out.push(...(data?.users ?? []));
      if (!data?.users?.length || data.users.length < 200) break;
    }
    return out;
  }

  try {
    const users = await listUsers();
    const now = Date.now();
    const oneDay = 86_400_000;

    for (const u of users) {
      const email = u.email; if (!email) { skipped++; continue; }
      const firstName = u.user_metadata?.first_name || null;
      const ageDays = (now - new Date(u.created_at).getTime()) / oneDay;

      try {
        if (action === "quiz_reminder") {
          if (ageDays < 1 || ageDays > 2) { skipped++; continue; }
          const { data: hp } = await sb.from("user_health_profiles").select("user_id, primary_goals").eq("user_id", u.id).maybeSingle();
          const goals = (hp as any)?.primary_goals;
          if (Array.isArray(goals) && goals.length > 0) { skipped++; continue; }
          await sendEmail({ template: "quiz_reminder", to: email, data: { firstName } }); sent++;
        } else if (action === "pro_upsell") {
          if (ageDays < 7 || ageDays > 8) { skipped++; continue; }
          const { data: hasSub } = await sb.rpc("has_active_subscription", { user_uuid: u.id, check_env: "live" });
          if (hasSub) { skipped++; continue; }
          await sendEmail({ template: "pro_upsell", to: email, data: { firstName } }); sent++;
        } else if (action === "monthly_checkin") {
          const { data: hasSub } = await sb.rpc("has_active_subscription", { user_uuid: u.id, check_env: "live" });
          if (!hasSub) { skipped++; continue; }
          await sendEmail({ template: "monthly_checkin", to: email, data: { firstName } }); sent++;
        } else {
          return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
        }
      } catch (err) {
        failures.push(`${email}: ${err instanceof Error ? err.message : "Unknown"}`);
      }
    }

    return new Response(JSON.stringify({ action, sent, skipped, failed: failures.length, failures: failures.slice(0, 10) }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("email-cron error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }), { status: 500 });
  }
});