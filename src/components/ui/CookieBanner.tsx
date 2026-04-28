import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Cookie } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  readConsent,
  writeConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

type View = "banner" | "customize";

export function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<View>("banner");
  const [prefs, setPrefs] = useState({ preferences: false, analytics: false });

  const titleId = useId();
  const descId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  // First-visit detection + listener for "open settings" event from Footer.
  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      const t1 = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t1);
    }
    setPrefs({ preferences: existing.preferences, analytics: existing.analytics });
  }, []);

  useEffect(() => {
    const openHandler = () => {
      const c = readConsent();
      if (c) setPrefs({ preferences: c.preferences, analytics: c.analytics });
      setView("customize");
      setVisible(true);
    };
    window.addEventListener("cookie-consent-open", openHandler);
    return () => window.removeEventListener("cookie-consent-open", openHandler);
  }, []);

  // Focus trap + ESC + body scroll lock while customize modal is open.
  useEffect(() => {
    if (!visible) return;
    lastFocusRef.current = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const root = containerRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      focusable[0]?.focus();
    };
    const t1 = setTimeout(focusFirst, 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && view === "customize") {
        e.preventDefault();
        // Closing customize without saving falls back to banner if no consent yet.
        if (readConsent()) {
          setVisible(false);
        } else {
          setView("banner");
        }
        return;
      }
      if (e.key === "Tab") {
        const root = containerRef.current;
        if (!root) return;
        const focusable = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = view === "customize" ? document.body.style.overflow : "";
    if (view === "customize") document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(t1);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocusRef.current?.focus?.();
    };
  }, [visible, view]);

  const finalize = (next: Pick<CookieConsent, "preferences" | "analytics">) => {
    writeConsent(next);
    setVisible(false);
    setView("banner");
  };

  const acceptAll = () => finalize({ preferences: true, analytics: true });
  const rejectAll = () => finalize({ preferences: false, analytics: false });
  const saveCustom = () => finalize(prefs);

  return (
    <AnimatePresence>
      {visible && view === "banner" && (
        <motion.div
          key="banner"
          ref={containerRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          aria-describedby={descId}
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="fixed inset-x-0 bottom-0 z-[9999] px-3 pb-3 sm:px-6 sm:pb-6"
        >
          <div className="mx-auto max-w-5xl rounded-2xl border border-primary/30 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/10 border-t-2 border-t-primary/60">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
              <div className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id={titleId} className="font-display text-base font-semibold text-foreground sm:text-lg">
                  {t("cookies.banner.title")}
                </h2>
                <p id={descId} className="mt-1.5 text-sm leading-relaxed text-foreground/70">
                  {t("cookies.banner.description")}{" "}
                  <Link to="/cookies" className="text-primary underline-offset-4 hover:underline">
                    {t("cookies.banner.learnMore")}
                  </Link>
                </p>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-2 sm:flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setView("customize")}>
                  {t("cookies.banner.customize")}
                </Button>
                <Button variant="outline" size="sm" onClick={rejectAll}>
                  {t("cookies.banner.reject")}
                </Button>
                <Button size="sm" onClick={acceptAll} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("cookies.banner.accept")}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {visible && view === "customize" && (
        <motion.div
          key="customize-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-background/70 backdrop-blur-sm p-3 sm:items-center sm:p-6"
        >
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative w-full max-w-lg rounded-2xl border border-primary/30 bg-background shadow-2xl shadow-primary/10"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/60 p-5 sm:p-6">
              <div>
                <h2 id={titleId} className="font-display text-lg font-semibold text-foreground">
                  {t("cookies.banner.customizeTitle")}
                </h2>
                <p className="mt-1 text-sm text-foreground/70">
                  {t("cookies.banner.customizeDescription")}
                </p>
              </div>
              <button
                type="button"
                aria-label={t("cookies.banner.close")}
                onClick={() => (readConsent() ? setVisible(false) : setView("banner"))}
                className="-m-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground/60 hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <CategoryRow
                title={t("cookies.banner.cat.necessary.title")}
                desc={t("cookies.banner.cat.necessary.desc")}
                checked
                disabled
              />
              <CategoryRow
                title={t("cookies.banner.cat.preferences.title")}
                desc={t("cookies.banner.cat.preferences.desc")}
                checked={prefs.preferences}
                onChange={(v) => setPrefs((p) => ({ ...p, preferences: v }))}
              />
              <CategoryRow
                title={t("cookies.banner.cat.analytics.title")}
                desc={t("cookies.banner.cat.analytics.desc")}
                checked={prefs.analytics}
                onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border/60 p-5 sm:flex-row sm:justify-end sm:p-6">
              <Button variant="outline" size="sm" onClick={rejectAll}>
                {t("cookies.banner.reject")}
              </Button>
              <Button variant="outline" size="sm" onClick={acceptAll}>
                {t("cookies.banner.accept")}
              </Button>
              <Button size="sm" onClick={saveCustom} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t("cookies.banner.save")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CategoryRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-muted/30 p-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-foreground/65">{desc}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange?.(!!v)}
        aria-label={title}
      />
    </div>
  );
}
