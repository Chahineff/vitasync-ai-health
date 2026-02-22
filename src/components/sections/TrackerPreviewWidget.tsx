import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, Sun, Moon, Coffee } from "@phosphor-icons/react";

interface Supplement {
  name: string;
  dosage: string;
  time: string;
  icon: "sun" | "coffee" | "moon";
  taken: boolean;
}

const initialSupplements: Supplement[] = [
  { name: "Vitamine D3", dosage: "2000 UI", time: "Matin", icon: "sun", taken: false },
  { name: "Magnésium", dosage: "300mg", time: "Matin", icon: "coffee", taken: false },
  { name: "Oméga-3", dosage: "1000mg", time: "Midi", icon: "sun", taken: false },
  { name: "Zinc", dosage: "15mg", time: "Soir", icon: "moon", taken: false },
];

const TimeIcon = ({ icon }: { icon: string }) => {
  const cls = "w-3 h-3 text-foreground/40";
  if (icon === "sun") return <Sun weight="bold" className={cls} />;
  if (icon === "coffee") return <Coffee weight="bold" className={cls} />;
  return <Moon weight="bold" className={cls} />;
};

export function TrackerPreviewWidget() {
  const [supplements, setSupplements] = useState(initialSupplements);
  const [step, setStep] = useState(0);

  // Animate checking off supplements one by one
  useEffect(() => {
    if (step >= supplements.length) {
      const timer = setTimeout(() => {
        setSupplements(initialSupplements);
        setStep(0);
      }, 3000);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setSupplements((prev) =>
        prev.map((s, i) => (i === step ? { ...s, taken: true } : s))
      );
      setStep((s) => s + 1);
    }, 1200);

    return () => clearTimeout(timer);
  }, [step, supplements.length]);

  const takenCount = supplements.filter((s) => s.taken).length;
  const progress = (takenCount / supplements.length) * 100;

  return (
    <div className="w-full h-full flex flex-col gap-2.5 p-1">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl p-3 shadow-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/50">
            Aujourd'hui
          </span>
          <span className="text-xs font-semibold text-primary">
            {takenCount}/{supplements.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="relative h-1.5 bg-muted/60 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Supplement list */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl overflow-hidden shadow-xl flex-1"
      >
        <div className="divide-y divide-border/20">
          {supplements.map((sup, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="px-3 py-2.5 flex items-center gap-2.5"
            >
              {/* Checkbox */}
              <motion.div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                  sup.taken
                    ? "bg-primary border-primary"
                    : "border-foreground/20 bg-transparent"
                }`}
                animate={sup.taken ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {sup.taken && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Check weight="bold" className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium transition-all duration-300 ${
                  sup.taken ? "text-foreground/40 line-through" : "text-foreground"
                }`}>
                  {sup.name}
                </div>
                <div className="text-[10px] text-foreground/40">{sup.dosage}</div>
              </div>

              {/* Time badge */}
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50">
                <TimeIcon icon={sup.icon} />
                <span className="text-[9px] text-foreground/40">{sup.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Streak badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: takenCount === supplements.length ? 1 : 0.5, scale: takenCount === supplements.length ? 1 : 0.95 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border/30 bg-muted/50 backdrop-blur-xl p-2 flex items-center justify-center gap-2"
      >
        <span className="text-sm">🔥</span>
        <span className="text-[10px] font-medium text-foreground/60">
          Série de 12 jours
        </span>
      </motion.div>
    </div>
  );
}
