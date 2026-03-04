import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://vitasyncai.lovable.app",
  "https://id-preview--7f75c63b-4202-49a9-a875-e20700f8a0c8.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Vary": "Origin",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Use service role to gather all user data across tables
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const [
      profileRes,
      healthRes,
      checkinsRes,
      supplementsRes,
      conversationsRes,
      bloodTestsRes,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("user_id", userId),
      supabaseAdmin.from("user_health_profiles").select("*").eq("user_id", userId),
      supabaseAdmin.from("daily_checkins").select("*").eq("user_id", userId).order("checkin_date", { ascending: false }),
      supabaseAdmin.from("supplement_tracking").select("*").eq("user_id", userId),
      supabaseAdmin.from("conversations").select("*").eq("user_id", userId),
      supabaseAdmin.from("blood_test_analyses").select("id, file_name, status, analyzed_at, deficiencies, abnormal_values, suggested_supplements, analysis_text").eq("user_id", userId),
    ]);

    // Fetch messages for user's conversations
    const conversationIds = (conversationsRes.data || []).map((c: { id: string }) => c.id);
    let messages: unknown[] = [];
    if (conversationIds.length > 0) {
      const { data } = await supabaseAdmin
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: true });
      messages = data || [];
    }

    // Fetch supplement logs
    const supplementIds = (supplementsRes.data || []).map((s: { id: string }) => s.id);
    let logs: unknown[] = [];
    if (supplementIds.length > 0) {
      const { data } = await supabaseAdmin
        .from("supplement_logs")
        .select("*")
        .in("tracking_id", supplementIds);
      logs = data || [];
    }

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      email: claimsData.claims.email,
      profile: profileRes.data || [],
      health_profile: healthRes.data || [],
      daily_checkins: checkinsRes.data || [],
      supplements: supplementsRes.data || [],
      supplement_logs: logs,
      conversations: conversationsRes.data || [],
      messages,
      blood_test_analyses: bloodTestsRes.data || [],
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="vitasync-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error: unknown) {
    console.error("user-data-export error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
