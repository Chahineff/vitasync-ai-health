import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/*  ───────────────────────────────────────────────────────
    VitaSync User API – REST endpoints for mobile app sync
    
    All endpoints require Authorization: Bearer <jwt>
    
    Routes (path after /user-api):
      GET  /profile
      PUT  /profile                  { first_name, last_name, ... }
      GET  /health-profile
      PUT  /health-profile           { health_goals, ... }
      GET  /supplements
      POST /supplements              { product_name, dosage, time_of_day }
      PUT  /supplements/:id          { active, dosage, ... }
      DELETE /supplements/:id
      GET  /supplement-logs?tracking_id=...&from=...&to=...
      POST /supplement-logs          { tracking_id, taken }
      GET  /checkins?from=...&to=...&limit=...
      POST /checkins                 { sleep_quality, energy_level, ... }
      PUT  /checkins/:id             { ... }
      GET  /conversations?limit=...
      POST /conversations            { title }
      DELETE /conversations/:id
      GET  /conversations/:id/messages?limit=...&before=...
      POST /conversations/:id/messages  { role, content }
      GET  /blood-tests
      GET  /wishlists
      POST /wishlists                { product_handle }
      DELETE /wishlists/:id
      GET  /all                      (full data dump)
    ─────────────────────────────────────────────────────── */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400) {
  return json({ error: message }, status);
}

/** Parse the sub-path after /user-api */
function parsePath(url: string): { segments: string[]; params: URLSearchParams } {
  const u = new URL(url);
  // Edge function path is /user-api/...
  const full = u.pathname.replace(/^\/user-api\/?/, "");
  const segments = full.split("/").filter(Boolean);
  return { segments, params: u.searchParams };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Auth ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return err("Unauthorized – missing Bearer token", 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return err("Unauthorized – invalid token", 401);
    }
    const userId = claimsData.claims.sub as string;

    // Service-role client (bypasses RLS)
    const admin = createClient(supabaseUrl, serviceKey);

    const { segments, params } = parsePath(req.url);
    const method = req.method;
    const resource = segments[0] || "";
    const resourceId = segments[1] || "";
    const subResource = segments[2] || "";

    let body: Record<string, unknown> = {};
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        body = await req.json();
      } catch {
        // empty body is OK for some routes
      }
    }

    // ────────────────────── PROFILE ──────────────────────
    if (resource === "profile") {
      if (method === "GET") {
        const { data, error: e } = await admin
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        if (e) return err(e.message, 500);
        return json(data);
      }
      if (method === "PUT") {
        const allowed = ["first_name", "last_name", "date_of_birth", "avatar_url"];
        const updates: Record<string, unknown> = {};
        for (const k of allowed) if (k in body) updates[k] = body[k];
        const { data, error: e } = await admin
          .from("profiles")
          .update(updates)
          .eq("user_id", userId)
          .select()
          .maybeSingle();
        if (e) return err(e.message, 500);
        return json(data);
      }
    }

    // ────────────────── HEALTH PROFILE ───────────────────
    if (resource === "health-profile") {
      if (method === "GET") {
        const { data, error: e } = await admin
          .from("user_health_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        if (e) return err(e.message, 500);
        return json(data);
      }
      if (method === "PUT") {
        const { data, error: e } = await admin
          .from("user_health_profiles")
          .update(body)
          .eq("user_id", userId)
          .select()
          .maybeSingle();
        if (e) return err(e.message, 500);
        return json(data);
      }
    }

    // ────────────────── SUPPLEMENTS ──────────────────────
    if (resource === "supplements") {
      if (method === "GET" && !resourceId) {
        const { data, error: e } = await admin
          .from("supplement_tracking")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (e) return err(e.message, 500);
        return json(data);
      }
      if (method === "POST" && !resourceId) {
        const { data, error: e } = await admin
          .from("supplement_tracking")
          .insert({ user_id: userId, ...body })
          .select()
          .single();
        if (e) return err(e.message, 500);
        return json(data, 201);
      }
      if (method === "PUT" && resourceId) {
        const { data, error: e } = await admin
          .from("supplement_tracking")
          .update(body)
          .eq("id", resourceId)
          .eq("user_id", userId)
          .select()
          .maybeSingle();
        if (e) return err(e.message, 500);
        if (!data) return err("Not found", 404);
        return json(data);
      }
      if (method === "DELETE" && resourceId) {
        const { error: e } = await admin
          .from("supplement_tracking")
          .delete()
          .eq("id", resourceId)
          .eq("user_id", userId);
        if (e) return err(e.message, 500);
        return json({ deleted: true });
      }
    }

    // ─────────────── SUPPLEMENT LOGS ─────────────────────
    if (resource === "supplement-logs") {
      if (method === "GET") {
        let query = admin.from("supplement_logs").select("*");
        const trackingId = params.get("tracking_id");
        if (trackingId) {
          query = query.eq("tracking_id", trackingId);
        } else {
          // Only return logs belonging to user's supplements
          const { data: sups } = await admin
            .from("supplement_tracking")
            .select("id")
            .eq("user_id", userId);
          const ids = (sups || []).map((s: { id: string }) => s.id);
          if (ids.length === 0) return json([]);
          query = query.in("tracking_id", ids);
        }
        const from = params.get("from");
        const to = params.get("to");
        if (from) query = query.gte("taken_at", from);
        if (to) query = query.lte("taken_at", to);
        query = query.order("taken_at", { ascending: false });
        const { data, error: e } = await query;
        if (e) return err(e.message, 500);
        return json(data);
      }
      if (method === "POST") {
        // Verify tracking_id belongs to user
        const tid = body.tracking_id as string;
        if (!tid) return err("tracking_id required");
        const { data: sup } = await admin
          .from("supplement_tracking")
          .select("id")
          .eq("id", tid)
          .eq("user_id", userId)
          .maybeSingle();
        if (!sup) return err("tracking_id not found or not yours", 403);
        const { data, error: e } = await admin
          .from("supplement_logs")
          .insert({ tracking_id: tid, taken: body.taken ?? true })
          .select()
          .single();
        if (e) return err(e.message, 500);
        return json(data, 201);
      }
    }

    // ────────────────── CHECKINS ─────────────────────────
    if (resource === "checkins") {
      if (method === "GET" && !resourceId) {
        let query = admin
          .from("daily_checkins")
          .select("*")
          .eq("user_id", userId)
          .order("checkin_date", { ascending: false });
        const from = params.get("from");
        const to = params.get("to");
        const limit = parseInt(params.get("limit") || "30");
        if (from) query = query.gte("checkin_date", from);
        if (to) query = query.lte("checkin_date", to);
        query = query.limit(limit);
        const { data, error: e } = await query;
        if (e) return err(e.message, 500);
        return json(data);
      }
      if (method === "POST" && !resourceId) {
        const { data, error: e } = await admin
          .from("daily_checkins")
          .insert({ user_id: userId, ...body })
          .select()
          .single();
        if (e) return err(e.message, 500);
        return json(data, 201);
      }
      if (method === "PUT" && resourceId) {
        const { data, error: e } = await admin
          .from("daily_checkins")
          .update(body)
          .eq("id", resourceId)
          .eq("user_id", userId)
          .select()
          .maybeSingle();
        if (e) return err(e.message, 500);
        if (!data) return err("Not found", 404);
        return json(data);
      }
    }

    // ────────────────── CONVERSATIONS ────────────────────
    if (resource === "conversations") {
      if (method === "GET" && !resourceId) {
        const limit = parseInt(params.get("limit") || "50");
        const { data, error: e } = await admin
          .from("conversations")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(limit);
        if (e) return err(e.message, 500);
        return json(data);
      }
      if (method === "POST" && !resourceId) {
        const { data, error: e } = await admin
          .from("conversations")
          .insert({ user_id: userId, title: (body.title as string) || null })
          .select()
          .single();
        if (e) return err(e.message, 500);
        return json(data, 201);
      }
      if (method === "DELETE" && resourceId && !subResource) {
        const { error: e } = await admin
          .from("conversations")
          .delete()
          .eq("id", resourceId)
          .eq("user_id", userId);
        if (e) return err(e.message, 500);
        return json({ deleted: true });
      }

      // ── Messages sub-resource ──
      if (resourceId && subResource === "messages") {
        // Verify conversation belongs to user
        const { data: conv } = await admin
          .from("conversations")
          .select("id")
          .eq("id", resourceId)
          .eq("user_id", userId)
          .maybeSingle();
        if (!conv) return err("Conversation not found", 404);

        if (method === "GET") {
          const limit = parseInt(params.get("limit") || "100");
          let query = admin
            .from("messages")
            .select("*")
            .eq("conversation_id", resourceId)
            .order("created_at", { ascending: true })
            .limit(limit);
          const before = params.get("before");
          if (before) query = query.lt("created_at", before);
          const { data, error: e } = await query;
          if (e) return err(e.message, 500);
          return json(data);
        }
        if (method === "POST") {
          const { data, error: e } = await admin
            .from("messages")
            .insert({
              conversation_id: resourceId,
              role: (body.role as string) || "user",
              content: (body.content as string) || "",
            })
            .select()
            .single();
          if (e) return err(e.message, 500);
          return json(data, 201);
        }
      }
    }

    // ────────────────── BLOOD TESTS ─────────────────────
    if (resource === "blood-tests") {
      if (method === "GET") {
        const { data, error: e } = await admin
          .from("blood_test_analyses")
          .select("id, file_name, status, analyzed_at, deficiencies, abnormal_values, suggested_supplements, analysis_text, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (e) return err(e.message, 500);
        return json(data);
      }
    }

    // ────────────────── WISHLISTS ────────────────────────
    if (resource === "wishlists") {
      if (method === "GET") {
        const { data, error: e } = await admin
          .from("user_wishlists")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (e) return err(e.message, 500);
        return json(data);
      }
      if (method === "POST") {
        const handle = body.product_handle as string;
        if (!handle) return err("product_handle required");
        const { data, error: e } = await admin
          .from("user_wishlists")
          .insert({ user_id: userId, product_handle: handle })
          .select()
          .single();
        if (e) return err(e.message, 500);
        return json(data, 201);
      }
      if (method === "DELETE" && resourceId) {
        const { error: e } = await admin
          .from("user_wishlists")
          .delete()
          .eq("id", resourceId)
          .eq("user_id", userId);
        if (e) return err(e.message, 500);
        return json({ deleted: true });
      }
    }

    // ────────────────── ALL (full dump) ──────────────────
    if (resource === "all") {
      if (method === "GET") {
        const [profileRes, healthRes, checkinsRes, supplementsRes, conversationsRes, bloodTestsRes, wishlistsRes] =
          await Promise.all([
            admin.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
            admin.from("user_health_profiles").select("*").eq("user_id", userId).maybeSingle(),
            admin.from("daily_checkins").select("*").eq("user_id", userId).order("checkin_date", { ascending: false }),
            admin.from("supplement_tracking").select("*").eq("user_id", userId),
            admin.from("conversations").select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
            admin.from("blood_test_analyses").select("id, file_name, status, analyzed_at, deficiencies, abnormal_values, suggested_supplements, analysis_text, created_at").eq("user_id", userId),
            admin.from("user_wishlists").select("*").eq("user_id", userId),
          ]);

        const conversationIds = (conversationsRes.data || []).map((c: { id: string }) => c.id);
        let messages: unknown[] = [];
        if (conversationIds.length > 0) {
          const { data } = await admin.from("messages").select("*").in("conversation_id", conversationIds).order("created_at", { ascending: true });
          messages = data || [];
        }

        const supplementIds = (supplementsRes.data || []).map((s: { id: string }) => s.id);
        let logs: unknown[] = [];
        if (supplementIds.length > 0) {
          const { data } = await admin.from("supplement_logs").select("*").in("tracking_id", supplementIds);
          logs = data || [];
        }

        return json({
          fetched_at: new Date().toISOString(),
          user_id: userId,
          email: claimsData.claims.email,
          profile: profileRes.data,
          health_profile: healthRes.data,
          daily_checkins: checkinsRes.data || [],
          supplements: supplementsRes.data || [],
          supplement_logs: logs,
          conversations: conversationsRes.data || [],
          messages,
          blood_test_analyses: bloodTestsRes.data || [],
          wishlists: wishlistsRes.data || [],
        });
      }
    }

    return err(`Route not found: ${method} /${segments.join("/")}`, 404);
  } catch (error: unknown) {
    console.error("user-api error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ error: message }, 500);
  }
});
