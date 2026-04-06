import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ShieldCheck, Flask, Certificate, QrCode, Leaf } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";

export function QualityPreviewWidget() {
  const { t } = useTranslation();

  const qualityItems = [
    { icon: Flask, label: t("preview.quality.purity"), detail: "Lot #VD3-2026-018", status: "99.7%" },
    { icon: Certificate, label: t("preview.quality.gmp"), detail: "ISO 22000", status: t("preview.quality.verified") },
    { icon: Leaf, label: t("preview.quality.natural"), detail: t("preview.quality.naturalDetail"), status: "100%" },
    { icon: QrCode, label: t("preview.quality.traceability"), detail: t("preview.quality.traceabilityDetail"), status: t("preview.quality.complete") },
  ];

  const [visibleItems, setVisibleItems] = useState(0);
  const [showVerified, setShowVerified] = useState(false);

  useEffect(() => {
    if (visibleItems < qualityItems.length) {
      const timer = setTimeout(() => setVisibleItems((v) => v + 1), 700);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowVerified(true), 600);
      return () => clearTimeout(timer);
    }
  }, [visibleItems]);

  useEffect(() => {
    if (!showVerified) return;
    const timer = setTimeout(() => { setVisibleItems(0); setShowVerified(false); }, 4000);
    return () => clearTimeout(timer);
  }, [showVerified]);

  return (
    <div className="w-full h-full flex flex-col gap-1.5 sm:gap-2.5 p-0.5 sm:p-1">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl sm:rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl p-2 sm:p-3 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/10">
            <ShieldCheck weight="light" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium text-foreground">Vitamine D3 2000UI</div>
            <div className="text-[10px] text-foreground/40">{t("preview.quality.certificate")}</div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl overflow-hidden shadow-xl flex-1">
        <div className="divide-y divide-border/20">
          {qualityItems.map((item, i) => {
            const Icon = item.icon;
            return visibleItems > i ? (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                className="px-2 py-1.5 sm:px-3 sm:py-2.5 flex items-center gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon weight="bold" className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground">{item.label}</div>
                  <div className="text-[10px] text-foreground/40">{item.detail}</div>
                </div>
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                  className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {item.status}
                </motion.span>
              </motion.div>
            ) : null;
          })}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: showVerified ? 1 : 0.4, scale: showVerified ? 1 : 0.95 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl p-2 flex items-center justify-center gap-2">
        <motion.div animate={showVerified ? { rotate: [0, -10, 10, 0] } : {}} transition={{ duration: 0.5 }}>
          <ShieldCheck weight="fill" className="w-4 h-4 text-emerald-500" />
        </motion.div>
        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
          {t("preview.quality.verifiedBadge")}
        </span>
      </motion.div>
    </div>
  );
}
