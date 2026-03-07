import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Upload, Check, X, ArrowUpDown, AlertTriangle, Loader2,
  ChevronDown, ChevronUp, RotateCcw, PlayCircle,
} from "lucide-react";

// ─── Types ───
interface CsvRow {
  handle: string;
  title: string;
  sku: string;
  newPrice: number;
}

interface ShopifyVariant {
  productId: number;
  productTitle: string;
  productHandle: string;
  variantId: number;
  variantTitle: string;
  sku: string;
  currentPrice: string;
}

interface RepricingRow {
  handle: string;
  title: string;
  sku: string;
  variantId: number | null;
  currentPrice: number | null;
  newPrice: number;
  diff: number | null;
  diffPct: number | null;
  status: "pending" | "updating" | "success" | "error" | "skipped" | "reverted";
  errorMsg?: string;
  matched: boolean;
}

type SortKey = "title" | "currentPrice" | "newPrice" | "diffPct";
type SortDir = "asc" | "desc";

// Admin emails — hardcoded for simplicity
const ADMIN_EMAILS = ["contact@vitacinc.com"];

// ─── CSV Parser ───
function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  return lines.slice(1).map((line) => {
    const parts = line.split(",");
    const handle = parts[0]?.trim() || "";
    const title = parts[1]?.trim() || "";
    const sku = parts[2]?.trim() || "";
    const price = parseFloat(parts[3]?.trim() || "0");
    return { handle, title, sku, newPrice: price };
  });
}

export default function AdminRepricing() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [shopifyVariants, setShopifyVariants] = useState<ShopifyVariant[]>([]);
  const [rows, setRows] = useState<RepricingRow[]>([]);
  const [loadingCsv, setLoadingCsv] = useState(true);
  const [loadingShopify, setLoadingShopify] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("diffPct");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterChanged, setFilterChanged] = useState(false);
  const [phase, setPhase] = useState<"loading" | "preview" | "updating" | "done">("loading");

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  // ─── Load CSV ───
  useEffect(() => {
    fetch("/data/repricing.csv")
      .then((r) => r.text())
      .then((text) => {
        setCsvRows(parseCsv(text));
        setLoadingCsv(false);
      })
      .catch(() => {
        toast.error("Erreur de chargement du CSV");
        setLoadingCsv(false);
      });
  }, []);

  // ─── Fetch Shopify prices ───
  const fetchShopifyPrices = useCallback(async () => {
    setLoadingShopify(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-repricing", {
        body: { action: "fetch-products" },
      });
      if (error) throw error;
      setShopifyVariants(data.variants || []);
    } catch (err: any) {
      toast.error("Erreur Shopify: " + (err.message || "Erreur inconnue"));
    } finally {
      setLoadingShopify(false);
    }
  }, []);

  // ─── Match CSV → Shopify ───
  useEffect(() => {
    if (csvRows.length === 0 || shopifyVariants.length === 0) return;

    const byHandle = new Map<string, ShopifyVariant>();
    const bySku = new Map<string, ShopifyVariant>();
    for (const v of shopifyVariants) {
      if (v.productHandle) byHandle.set(v.productHandle, v);
      if (v.sku) bySku.set(v.sku, v);
    }

    const matched: RepricingRow[] = csvRows.map((csv) => {
      const sv = byHandle.get(csv.handle) || bySku.get(csv.sku);
      if (!sv) {
        return {
          handle: csv.handle,
          title: csv.title,
          sku: csv.sku,
          variantId: null,
          currentPrice: null,
          newPrice: csv.newPrice,
          diff: null,
          diffPct: null,
          status: "pending" as const,
          matched: false,
        };
      }
      const current = parseFloat(sv.currentPrice);
      const diff = csv.newPrice - current;
      const diffPct = current > 0 ? (diff / current) * 100 : 0;
      const isIdentical = Math.abs(diff) < 0.01;
      return {
        handle: csv.handle,
        title: sv.productTitle || csv.title,
        sku: csv.sku,
        variantId: sv.variantId,
        currentPrice: current,
        newPrice: csv.newPrice,
        diff: isIdentical ? 0 : diff,
        diffPct: isIdentical ? 0 : diffPct,
        status: isIdentical ? ("skipped" as const) : ("pending" as const),
        matched: true,
      };
    });

    setRows(matched);
    setPhase("preview");
  }, [csvRows, shopifyVariants]);

  // ─── Sorting ───
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sortedRows = useMemo(() => {
    let filtered = filterChanged ? rows.filter((r) => r.diff !== 0 && r.diff !== null) : rows;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (typeof av === "string" && typeof bv === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [rows, sortKey, sortDir, filterChanged]);

  // ─── Stats ───
  const stats = useMemo(() => {
    const total = rows.length;
    const changed = rows.filter((r) => r.status === "pending").length;
    const skipped = rows.filter((r) => r.status === "skipped").length;
    const unmatched = rows.filter((r) => !r.matched).length;
    const success = rows.filter((r) => r.status === "success").length;
    const errors = rows.filter((r) => r.status === "error").length;
    return { total, changed, skipped, unmatched, success, errors };
  }, [rows]);

  // ─── Apply updates ───
  const applyUpdates = async () => {
    const toUpdate = rows.filter((r) => r.status === "pending" && r.variantId && r.diff !== 0);
    if (toUpdate.length === 0) return;

    setUpdating(true);
    setPhase("updating");
    setProgress(0);

    for (let i = 0; i < toUpdate.length; i++) {
      const row = toUpdate[i];
      setRows((prev) =>
        prev.map((r) => (r.sku === row.sku ? { ...r, status: "updating" } : r))
      );

      try {
        const { error } = await supabase.functions.invoke("admin-repricing", {
          body: {
            action: "update-price",
            variantId: row.variantId,
            newPrice: row.newPrice.toFixed(2),
          },
        });
        if (error) throw error;

        setRows((prev) =>
          prev.map((r) => (r.sku === row.sku ? { ...r, status: "success" } : r))
        );
      } catch (err: any) {
        setRows((prev) =>
          prev.map((r) =>
            r.sku === row.sku ? { ...r, status: "error", errorMsg: err.message } : r
          )
        );
      }

      setProgress(((i + 1) / toUpdate.length) * 100);
      // Small delay to avoid rate limiting
      if (i < toUpdate.length - 1) await new Promise((r) => setTimeout(r, 300));
    }

    setUpdating(false);
    setPhase("done");

    const finalRows = rows;
    const successCount = finalRows.filter((r) => r.status === "success").length;
    const errorCount = finalRows.filter((r) => r.status === "error").length;
    toast.success(`Mise à jour terminée : ${successCount} succès, ${errorCount} erreurs`);
  };

  // ─── Revert a single product ───
  const revertPrice = async (row: RepricingRow) => {
    if (!row.variantId || row.currentPrice === null) return;
    try {
      const { error } = await supabase.functions.invoke("admin-repricing", {
        body: {
          action: "update-price",
          variantId: row.variantId,
          newPrice: row.currentPrice.toFixed(2),
        },
      });
      if (error) throw error;
      setRows((prev) =>
        prev.map((r) => (r.sku === row.sku ? { ...r, status: "reverted" } : r))
      );
      toast.success(`${row.title} — prix restauré à $${row.currentPrice.toFixed(2)}`);
    } catch (err: any) {
      toast.error(`Erreur annulation ${row.title}: ${err.message}`);
    }
  };

  // ─── Auth guard ───
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-bold text-foreground">Accès refusé</h1>
        <p className="text-muted-foreground">Cette page est réservée aux administrateurs.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  // ─── Sort icon ───
  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Repricing Admin</h1>
              <p className="text-sm text-muted-foreground">
                Mise à jour des prix — Benchmark concurrentiel
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {user.email}
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Step 1: Load data */}
        {phase === "loading" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Chargement des données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {loadingCsv ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm">
                  CSV : {csvRows.length > 0 ? `${csvRows.length} produits chargés` : "Chargement..."}
                </span>
              </div>

              {csvRows.length > 0 && !loadingShopify && shopifyVariants.length === 0 && (
                <Button onClick={fetchShopifyPrices}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Récupérer les prix actuels depuis Shopify
                </Button>
              )}

              {loadingShopify && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Récupération des prix Shopify...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {phase !== "loading" && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.changed}</div>
                <div className="text-xs text-muted-foreground">À modifier</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold text-muted-foreground">{stats.skipped}</div>
                <div className="text-xs text-muted-foreground">Inchangés</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold text-green-500">{stats.success}</div>
                <div className="text-xs text-muted-foreground">Succès</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold text-destructive">{stats.errors}</div>
                <div className="text-xs text-muted-foreground">Erreurs</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress bar during update */}
        {phase === "updating" && (
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Mise à jour en cours...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {phase === "preview" && (
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={applyUpdates} disabled={stats.changed === 0}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Appliquer {stats.changed} modifications
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilterChanged(!filterChanged)}
            >
              {filterChanged ? "Voir tous" : "Voir uniquement les changements"}
            </Button>
          </div>
        )}

        {phase === "done" && (
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" onClick={() => setFilterChanged(!filterChanged)}>
              {filterChanged ? "Voir tous" : "Voir uniquement les changements"}
            </Button>
            <Button variant="outline" onClick={fetchShopifyPrices}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Rafraîchir les prix
            </Button>
          </div>
        )}

        {/* Table */}
        {rows.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">
                        <button
                          className="flex items-center gap-1 hover:text-foreground"
                          onClick={() => toggleSort("title")}
                        >
                          Produit <SortIcon col="title" />
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          className="flex items-center gap-1 ml-auto hover:text-foreground"
                          onClick={() => toggleSort("currentPrice")}
                        >
                          Ancien prix <SortIcon col="currentPrice" />
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          className="flex items-center gap-1 ml-auto hover:text-foreground"
                          onClick={() => toggleSort("newPrice")}
                        >
                          Nouveau prix <SortIcon col="newPrice" />
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          className="flex items-center gap-1 ml-auto hover:text-foreground"
                          onClick={() => toggleSort("diffPct")}
                        >
                          Variation <SortIcon col="diffPct" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRows.map((row) => (
                      <TableRow
                        key={row.sku}
                        className={
                          row.status === "success"
                            ? "bg-green-50 dark:bg-green-950/20"
                            : row.status === "error"
                            ? "bg-red-50 dark:bg-red-950/20"
                            : row.status === "skipped"
                            ? "opacity-50"
                            : ""
                        }
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{row.title}</div>
                            <div className="text-xs text-muted-foreground">{row.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {row.currentPrice !== null ? `$${row.currentPrice.toFixed(2)}` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">
                          ${row.newPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.diff !== null && row.diff !== 0 ? (
                            <div className="space-y-0.5">
                              <div
                                className={`text-sm font-semibold ${
                                  row.diff < 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {row.diff > 0 ? "+" : ""}${row.diff.toFixed(2)}
                              </div>
                              <div
                                className={`text-xs ${
                                  row.diffPct! < 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {row.diffPct! > 0 ? "+" : ""}
                                {row.diffPct!.toFixed(1)}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.status === "pending" && (
                            <Badge variant="outline" className="text-xs">En attente</Badge>
                          )}
                          {row.status === "updating" && (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                          )}
                          {row.status === "success" && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                              <Check className="h-3 w-3 mr-1" /> OK
                            </Badge>
                          )}
                          {row.status === "error" && (
                            <Badge variant="destructive" className="text-xs">
                              <X className="h-3 w-3 mr-1" /> Erreur
                            </Badge>
                          )}
                          {row.status === "skipped" && (
                            <span className="text-xs text-muted-foreground">Inchangé</span>
                          )}
                          {row.status === "reverted" && (
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                              <RotateCcw className="h-3 w-3 mr-1" /> Annulé
                            </Badge>
                          )}
                          {!row.matched && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Non trouvé
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.status === "success" && row.currentPrice !== null && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => revertPrice(row)}
                              className="text-xs"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Annuler
                            </Button>
                          )}
                          {row.status === "error" && row.errorMsg && (
                            <span className="text-xs text-destructive max-w-[150px] block truncate" title={row.errorMsg}>
                              {row.errorMsg}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
