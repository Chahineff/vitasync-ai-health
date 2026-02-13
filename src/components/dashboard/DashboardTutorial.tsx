import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, X } from "lucide-react";
import {
  Sun, Moon, ChatCircleDots, Pill, Storefront,
  CheckCircle, Lightning, Brain,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface DashboardTutorialProps {
  onComplete: () => void;
}

const steps = [
  {
    id: "checkin",
    title: "Check-in du jour",
    description:
      "Chaque jour, réponds à un court formulaire sur ton sommeil, énergie et stress. Ces données permettent à ton Coach IA de mieux te conseiller.",
    icon: Sun,
    iconBg: "bg-amber-500/15 border-amber-500/20",
    iconColor: "text-amber-400",
    demo: "checkin",
  },
  {
    id: "coach",
    title: "Coach IA — VitaSync",
    description:
      "Pose tes questions santé à VitaSync, ton coach personnel. Il connaît ton profil et t'accompagne au quotidien.",
    icon: ChatCircleDots,
    iconBg: "bg-primary/15 border-primary/20",
    iconColor: "text-primary",
    demo: "chat",
  },
  {
    id: "supplements",
    title: "Suivi des compléments",
    description:
      "Suis ta routine quotidienne et coche tes prises. Ton Coach adapte ses conseils en fonction de ta régularité.",
    icon: Pill,
    iconBg: "bg-emerald-500/15 border-emerald-500/20",
    iconColor: "text-emerald-400",
    demo: "supplements",
  },
  {
    id: "shop",
    title: "Boutique personnalisée",
    description:
      "Découvre des compléments adaptés à ton profil dans notre boutique intégrée.",
    icon: Storefront,
    iconBg: "bg-violet-500/15 border-violet-500/20",
    iconColor: "text-violet-400",
    demo: "shop",
  },
];

function CheckinDemo() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  const metrics = [
    { label: "Sommeil", value: 4, icon: Moon, color: "text-indigo-400", bg: "bg-indigo-500/15" },
    { label: "Énergie", value: 3, icon: Lightning, color: "text-amber-400", bg: "bg-amber-500/15" },
    { label: "Stress", value: 2, icon: Brain, color: "text-rose-400", bg: "bg-rose-500/15" },
  ];

  return (
    <div className="space-y-3">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, x: -20 }}
          animate={animated ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: i * 0.2, duration: 0.4 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30"
        >
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", m.bg)}>
            <m.icon weight="duotone" className={cn("w-4 h-4", m.color)} />
          </div>
          <span className="text-sm text-foreground/70 flex-1">{m.label}</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <motion.div
                key={v}
                initial={{ scale: 0 }}
                animate={animated ? { scale: 1 } : {}}
                transition={{ delay: i * 0.2 + v * 0.05 }}
                className={cn(
                  "w-5 h-5 rounded-full border transition-colors",
                  v <= m.value
                    ? "bg-primary/80 border-primary"
                    : "border-border/40 bg-card/30"
                )}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ChatDemo() {
  const [messages, setMessages] = useState<string[]>([]);
  useEffect(() => {
    const msgs = [
      "Bonjour ! Comment te sens-tu aujourd'hui ?",
      "J'ai un peu mal dormi cette nuit…",
      "Je vois. Essaie le magnésium bisglycinate 30 min avant de dormir 💊",
    ];
    msgs.forEach((msg, i) => {
      setTimeout(() => setMessages((prev) => [...prev, msg]), 600 + i * 900);
    });
  }, []);

  return (
    <div className="space-y-2.5 max-h-40 overflow-hidden">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "px-3 py-2 rounded-2xl text-xs max-w-[85%]",
            i % 2 === 0
              ? "bg-primary/10 text-foreground/80 rounded-bl-sm"
              : "bg-card/60 border border-border/30 text-foreground/70 ml-auto rounded-br-sm"
          )}
        >
          {msg}
        </motion.div>
      ))}
    </div>
  );
}

function SupplementsDemo() {
  const [checked, setChecked] = useState<number[]>([]);
  useEffect(() => {
    setTimeout(() => setChecked([0]), 500);
    setTimeout(() => setChecked([0, 1]), 1200);
  }, []);

  const items = [
    { name: "Créatine Monohydrate", time: "Matin", icon: Sun },
    { name: "Whey Protein", time: "Soir", icon: Moon },
  ];

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
            checked.includes(i)
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-card/50 border-border/30"
          )}
        >
          <motion.div
            animate={checked.includes(i) ? { scale: [1, 1.2, 1] } : {}}
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              checked.includes(i)
                ? "bg-emerald-500 border-emerald-500"
                : "border-border/50"
            )}
          >
            {checked.includes(i) && (
              <Check className="w-3 h-3 text-white" />
            )}
          </motion.div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground/80">{item.name}</p>
            <div className="flex items-center gap-1 text-xs text-foreground/50">
              <item.icon weight="duotone" className="w-3 h-3" />
              <span>{item.time}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ShopDemo() {
  const products = [
    { name: "Magnésium", tag: "Sommeil", color: "bg-indigo-500/15 text-indigo-400" },
    { name: "Oméga-3", tag: "Focus", color: "bg-blue-500/15 text-blue-400" },
    { name: "Vitamine D3", tag: "Immunité", color: "bg-amber-500/15 text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {products.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.15 }}
          className="p-3 rounded-xl bg-card/50 border border-border/30 text-center"
        >
          <div className={cn("w-8 h-8 rounded-lg mx-auto mb-2", p.color.split(" ")[0])} />
          <p className="text-xs font-medium text-foreground/80 truncate">{p.name}</p>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block", p.color)}>
            {p.tag}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

const demoComponents: Record<string, () => JSX.Element> = {
  checkin: CheckinDemo,
  chat: ChatDemo,
  supplements: SupplementsDemo,
  shop: ShopDemo,
};

export function DashboardTutorial({ onComplete }: DashboardTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const DemoComponent = demoComponents[step.demo];

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, filter: "blur(8px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        className="w-full max-w-md glass-card-premium rounded-3xl border border-white/10 p-6 relative"
      >
        {/* Skip button */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 text-foreground/40 hover:text-foreground/70 transition-colors text-sm flex items-center gap-1"
        >
          Passer
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 40, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -40, filter: "blur(6px)" }}
            transition={{ duration: 0.35 }}
          >
            {/* Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border",
                  step.iconBg
                )}
              >
                <step.icon weight="duotone" className={cn("w-6 h-6", step.iconColor)} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">{step.title}</h3>
                <p className="text-xs text-foreground/50">
                  Étape {currentStep + 1} / {steps.length}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-foreground/70 font-light mb-5 leading-relaxed">
              {step.description}
            </p>

            {/* Demo */}
            <div className="mb-6 p-4 rounded-2xl bg-background/30 border border-border/20">
              <DemoComponent />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentStep
                    ? "w-6 bg-primary"
                    : i < currentStep
                    ? "w-1.5 bg-primary/50"
                    : "w-1.5 bg-foreground/15"
                )}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="rounded-xl px-5 shadow-lg shadow-primary/20"
          >
            {isLast ? (
              <>
                <CheckCircle weight="bold" className="w-4 h-4 mr-1.5" />
                C'est parti !
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
