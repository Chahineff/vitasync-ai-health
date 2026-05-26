import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function slugFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

export default function AdminImportResearch() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ ok: number; fail: number; errors: string[] } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user, loading, navigate]);

  const handleImport = async () => {
    if (!files.length) return;
    setBusy(true);
    setResults(null);
    let ok = 0, fail = 0;
    const errors: string[] = [];

    for (const file of files) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const product_id = json.product_id;
        if (!product_id) throw new Error(`${file.name}: missing product_id`);
        const product_handle = slugFromUrl(json.source_url);
        const row = {
          product_id,
          name: json.name || product_id,
          category: json.category || null,
          source_url: json.source_url || null,
          product_handle,
          data: json,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from("product_research")
          .upsert(row, { onConflict: "product_id" });
        if (error) throw error;
        ok++;
      } catch (e: any) {
        fail++;
        errors.push(`${file.name}: ${e.message || String(e)}`);
      }
    }
    setResults({ ok, fail, errors });
    setBusy(false);
    toast.success(`Imported ${ok} record(s)${fail ? `, ${fail} failed` : ""}`);
  };

  if (loading || isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center text-foreground/60">Loading…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader><CardTitle>Admin access required</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/70">
            <p>Your account does not have the <code>admin</code> role.</p>
            <p>To grant access, run in the SQL editor:</p>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${user?.id}', 'admin');`}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Import Product Research</h1>
      <p className="text-foreground/60 mb-6 text-sm">
        Upload one or more <code>.json</code> files. Existing records (matched by <code>product_id</code>) are updated, not duplicated.
      </p>

      <Card>
        <CardContent className="p-6 space-y-4">
          <input
            type="file"
            accept=".json,application/json"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground"
          />
          {files.length > 0 && (
            <p className="text-sm text-foreground/70">{files.length} file(s) selected</p>
          )}
          <Button onClick={handleImport} disabled={!files.length || busy}>
            {busy ? "Importing…" : "Import"}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Results</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-green-600">✓ {results.ok} succeeded</p>
            {results.fail > 0 && <p className="text-red-600">✗ {results.fail} failed</p>}
            {results.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-foreground/70">Errors</summary>
                <ul className="mt-2 space-y-1 text-xs text-red-500">
                  {results.errors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </details>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}