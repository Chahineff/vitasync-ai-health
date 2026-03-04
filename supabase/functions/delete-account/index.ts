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

    // Require confirmation
    let body: { confirm?: boolean } = {};
    try { body = await req.json(); } catch { /* empty */ }
    if (!body.confirm) {
      return new Response(JSON.stringify({ error: "Confirmation required. Send { confirm: true }" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Delete all user data in order (respecting foreign keys)
    // 1. Supplement logs (via tracking IDs)
    const { data: supplements } = await supabaseAdmin.from("supplement_tracking").select("id").eq("user_id", userId);
    const supplementIds = (supplements || []).map((s: { id: string }) => s.id);
    if (supplementIds.length > 0) {
      await supabaseAdmin.from("supplement_logs").delete().in("tracking_id", supplementIds);
    }

    // 2. Messages (via conversation IDs)
    const { data: conversations } = await supabaseAdmin.from("conversations").select("id").eq("user_id", userId);
    const conversationIds = (conversations || []).map((c: { id: string }) => c.id);
    if (conversationIds.length > 0) {
      await supabaseAdmin.from("messages").delete().in("conversation_id", conversationIds);
    }

    // 3. Delete all user-owned rows
    await Promise.all([
      supabaseAdmin.from("supplement_tracking").delete().eq("user_id", userId),
      supabaseAdmin.from("conversations").delete().eq("user_id", userId),
      supabaseAdmin.from("daily_checkins").delete().eq("user_id", userId),
      supabaseAdmin.from("blood_test_analyses").delete().eq("user_id", userId),
      supabaseAdmin.from("user_health_profiles").delete().eq("user_id", userId),
      supabaseAdmin.from("shopify_customer_tokens").delete().eq("user_id", userId),
      supabaseAdmin.from("profiles").delete().eq("user_id", userId),
    ]);

    // 4. Delete avatar files from storage
    try {
      const { data: avatarFiles } = await supabaseAdmin.storage.from("avatars").list(userId);
      if (avatarFiles && avatarFiles.length > 0) {
        await supabaseAdmin.storage.from("avatars").remove(avatarFiles.map(f => `${userId}/${f.name}`));
      }
    } catch { /* non-critical */ }

    // 5. Delete blood test files from storage
    try {
      const { data: bloodFiles } = await supabaseAdmin.storage.from("blood-tests").list(userId);
      if (bloodFiles && bloodFiles.length > 0) {
        await supabaseAdmin.storage.from("blood-tests").remove(bloodFiles.map(f => `${userId}/${f.name}`));
      }
    } catch { /* non-critical */ }

    // 6. Delete the auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Failed to delete auth user:", deleteAuthError);
      return new Response(JSON.stringify({ error: "Failed to delete account", details: deleteAuthError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Successfully deleted user account:", userId);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("delete-account error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
