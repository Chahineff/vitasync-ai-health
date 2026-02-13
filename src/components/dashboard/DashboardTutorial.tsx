import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  House, ChatCircleDots, FirstAidKit, Storefront, Gear,
  Sun, Moon, Lightning, Brain, Check, CheckCircle,
  ArrowRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

interface DashboardTutorialProps {
  onComplete: () => void;
}

/* ── Step config ─────────────────────────────────────────── */
const STEPS = [
  {
    id: "home",
    label: "Accueil",
    icon: House,
    bubble: "Chaque jour, remplis ton check-in pour que ton Coach IA s'adapte à toi.",
  },
  {
    id: "coach",
    label: "Coach IA",
    icon: ChatCircleDots,
    bubble: "Pose tes questions santé à VitaSync. Il connaît ton profil et s'adapte à tes besoins.",
  },
  {
    id: "supplements",
    label: "Suppléments",
    icon: FirstAidKit,
    bubble: "Suis ta routine et coche tes prises. Exemple : Créatine le matin, Magnésium le soir.",
  },
  {
    id: "shop",
    label: "Boutique",
    icon: Storefront,
    bubble: "Découvre une large sélection de compléments adaptés à ton profil.",
  },
  {
    id: "settings",
    label: "Paramètres",
    icon: Gear,
    bubble: "Modifie ton profil de santé, change de thème, ajuste tes préférences à tout moment.",
  },
];

/* ── Cursor SVG ──────────────────────────────────────────── */
function CursorSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 3L19 12L12 13L9 20L5 3Z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Demo content per step ───────────────────────────────── */
function HomeDemo() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 500); }, []);
  const metrics = [
    { label: "Sommeil", value: 4, icon: Moon, color: "text-indigo-400", bg: "bg-indigo-500/15" },
    { label: "Énergie", value: 3, icon: Lightning, color: "text-amber-400", bg: "bg-amber-500/15" },
    { label: "Stress", value: 2, icon: Brain, color: "text-rose-400", bg: "bg-rose-500/15" },
  ];
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground/50 mb-2">Check-in du jour</p>
      {metrics.map((m, i) => (
        <motion.div key={m.label} initial={{ opacity: 0, x: -15 }} animate={animated ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.15 }} className="flex items-center gap-2 p-2 rounded-lg bg-card/40 border border-border/20">
          <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", m.bg)}>
            <m.icon weight="duotone" className={cn("w-3 h-3", m.color)} />
          </div>
          <span className="text-xs text-foreground/60 flex-1">{m.label}</span>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(v => (
              <motion.div key={v} initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ delay: i * 0.15 + v * 0.04 }} className={cn("w-3.5 h-3.5 rounded-full border", v <= m.value ? "bg-primary/80 border-primary" : "border-border/30")} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CoachDemo() {
  const [msgs, setMsgs] = useState<string[]>([]);
  useEffect(() => {
    const all = [
      "Bonjour ! Comment te sens-tu aujourd'hui ?",
      "J'ai un peu mal dormi cette nuit…",
      "Je vois. Essaie le magnésium bisglycinate 30 min avant de dormir 💊",
    ];
    all.forEach((m, i) => setTimeout(() => setMsgs(p => [...p, m]), 500 + i * 800));
  }, []);
  return (
    <div className="space-y-2">
      {msgs.map((m, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={cn("px-3 py-1.5 rounded-xl text-xs max-w-[85%]", i % 2 === 0 ? "bg-primary/10 text-foreground/80 rounded-bl-sm" : "bg-card/50 border border-border/20 text-foreground/70 ml-auto rounded-br-sm")}>
          {m}
        </motion.div>
      ))}
    </div>
  );
}

function SupplementsDemo() {
  const [checked, setChecked] = useState<number[]>([]);
  useEffect(() => {
    setTimeout(() => setChecked([0]), 600);
    setTimeout(() => setChecked([0, 1]), 1300);
    setTimeout(() => setChecked([0, 1, 2]), 1900);
  }, []);
  const items = [
    { name: "Créatine Monohydrate", time: "Matin" },
    { name: "Magnésium Bisglycinate", time: "Soir" },
    { name: "Oméga-3", time: "Midi" },
  ];
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <motion.div key={it.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={cn("flex items-center gap-2 p-2 rounded-lg border transition-all", checked.includes(i) ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card/40 border-border/20")}>
          <motion.div animate={checked.includes(i) ? { scale: [1, 1.2, 1] } : {}} className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", checked.includes(i) ? "bg-emerald-500 border-emerald-500" : "border-border/40")}>
            {checked.includes(i) && <Check className="w-2.5 h-2.5 text-white" weight="bold" />}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground/80 truncate">{it.name}</p>
            <p className="text-[10px] text-foreground/40">{it.time}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ShopDemo() {
  const products = [
    { name: "Magnésium", tag: "Sommeil", color: "bg-indigo-500/15" },
    { name: "Oméga-3", tag: "Focus", color: "bg-blue-500/15" },
    { name: "Vitamine D3", tag: "Immunité", color: "bg-amber-500/15" },
  ];
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {products.map((p, i) => (
        <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.12 }} className="p-2 rounded-lg bg-card/40 border border-border/20 text-center">
          <div className={cn("w-6 h-6 rounded-md mx-auto mb-1", p.color)} />
          <p className="text-[10px] font-medium text-foreground/80 truncate">{p.name}</p>
          <span className="text-[9px] text-foreground/40">{p.tag}</span>
        </motion.div>
      ))}
    </div>
  );
}

function SettingsDemo() {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => { setTimeout(() => setDarkMode(true), 800); }, []);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-2 rounded-lg bg-card/40 border border-border/20">
        <span className="text-xs text-foreground/70">Thème</span>
        <motion.div animate={{ backgroundColor: darkMode ? "hsl(var(--primary))" : "hsl(var(--muted))" }} className="w-10 h-5 rounded-full relative cursor-default" transition={{ duration: 0.3 }}>
          <motion.div animate={{ x: darkMode ? 20 : 2 }} className="w-4 h-4 rounded-full bg-white absolute top-0.5" transition={{ type: "spring", stiffness: 400, damping: 25 }} />
        </motion.div>
      </div>
      <div className="p-2 rounded-lg bg-card/40 border border-border/20">
        <p className="text-xs text-foreground/70 mb-1">Profil de santé</p>
        <div className="flex gap-1 flex-wrap">
          {["Muscle", "Sommeil", "Énergie"].map(g => (
            <span key={g} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{g}</span>
          ))}
        </div>
      </div>
      <div className="p-2 rounded-lg bg-card/40 border border-border/20">
        <p className="text-xs text-foreground/70">Langue, informations personnelles…</p>
      </div>
    </div>
  );
}

const DEMO_MAP: Record<string, React.FC> = {
  home: HomeDemo,
  coach: CoachDemo,
  supplements: SupplementsDemo,
  shop: ShopDemo,
  settings: SettingsDemo,
};

/* ── Main Tutorial Component ─────────────────────────────── */
export function DashboardTutorial({ onComplete }: DashboardTutorialProps) {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<"moving" | "clicking" | "showing">("showing"); // start showing step 0
  const [ripple, setRipple] = useState(false);
  const sidebarRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = STEPS[currentStep];
  const DemoComponent = DEMO_MAP[step.id];
  const isLast = currentStep === STEPS.length - 1;

  // Calculate cursor target position
  const updateCursorTarget = useCallback((stepIndex: number) => {
    const el = sidebarRefs.current[stepIndex];
    const container = containerRef.current;
    if (!el || !container) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setCursorPos({
      x: eRect.left - cRect.left + eRect.width / 2,
      y: eRect.top - cRect.top + eRect.height / 2,
    });
  }, []);

  // Initialize cursor on first step
  useEffect(() => {
    const t = setTimeout(() => updateCursorTarget(0), 100);
    return () => clearTimeout(t);
  }, [updateCursorTarget]);

  // Auto-advance timer
  const startAutoAdvance = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      if (!isLast) goToStep(currentStep + 1);
    }, 5000);
  }, [currentStep, isLast]);

  useEffect(() => {
    if (phase === "showing") startAutoAdvance();
    return () => { if (autoTimerRef.current) clearTimeout(autoTimerRef.current); };
  }, [phase, startAutoAdvance]);

  const goToStep = useCallback((nextStep: number) => {
    if (nextStep >= STEPS.length) { onComplete(); return; }
    // Phase 1: move cursor
    setPhase("moving");
    updateCursorTarget(nextStep);
    
    // Phase 2: click ripple
    setTimeout(() => {
      setPhase("clicking");
      setRipple(true);
      setTimeout(() => setRipple(false), 400);
      
      // Phase 3: show content
      setTimeout(() => {
        setCurrentStep(nextStep);
        setPhase("showing");
      }, 500);
    }, 800);
  }, [onComplete, updateCursorTarget]);

  const handleNext = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (isLast) { onComplete(); return; }
    goToStep(currentStep + 1);
  };

  /* ── Sidebar items (used for both desktop & mobile) ──── */
  const navItems = STEPS.map((s, i) => (
    <button
      key={s.id}
      ref={(el) => { sidebarRefs.current[i] = el; }}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all relative",
        currentStep === i && phase === "showing"
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-foreground/50"
      )}
    >
      <s.icon weight="light" className="w-5 h-5 shrink-0" />
      {!isMobile && <span>{s.label}</span>}
    </button>
  ));

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background"
    >
      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute top-4 right-4 z-[70] text-foreground/50 hover:text-foreground transition-colors text-sm flex items-center gap-1 px-3 py-2 rounded-xl bg-card/60 border border-border/20 backdrop-blur-md"
      >
        Passer
      </button>

      <div className="h-full flex flex-col lg:flex-row">
        {/* Sidebar (desktop) */}
        {!isMobile && (
          <div className="w-64 shrink-0 glass-sidebar-floating m-4 rounded-3xl flex flex-col pointer-events-none">
            <div className="p-5 flex items-center gap-2 border-b border-white/5">
              <img src={vitasyncLogo} alt="" className="w-7 h-7" />
              <span className="text-lg font-light text-foreground">
                Vita<span className="text-primary font-medium">Sync</span>
              </span>
            </div>
            <div className="p-3 flex-1 space-y-1">
              {navItems}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0 p-4 lg:p-8 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col lg:flex-row gap-6 items-start"
            >
              {/* Demo area */}
              <div className="flex-1 w-full max-w-lg">
                <div className="glass-card-premium rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <step.icon weight="duotone" className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-medium text-foreground">{step.label}</h3>
                  </div>
                  <DemoComponent />
                </div>
              </div>

              {/* Speech bubble */}
              <motion.div
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.3, duration: 0.35 }}
                className="w-full lg:max-w-xs"
              >
                <div className="glass-card rounded-2xl p-5 border border-primary/20 bg-primary/5">
                  <p className="text-sm text-foreground/80 font-light leading-relaxed">
                    {step.bubble}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Footer controls */}
          <div className="mt-6 flex items-center justify-between pointer-events-auto">
            {/* Progress dots */}
            <div className="flex gap-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentStep ? "w-6 bg-primary" : i < currentStep ? "w-1.5 bg-primary/50" : "w-1.5 bg-foreground/15"
                  )}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              {isLast ? (
                <>
                  <CheckCircle weight="bold" className="w-4 h-4" />
                  C'est parti !
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight weight="bold" className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile bottom nav (fake) */}
        {isMobile && (
          <div className="shrink-0 flex justify-around items-center py-3 px-2 glass-card border-t border-white/10 pointer-events-none">
            {navItems}
          </div>
        )}
      </div>

      {/* Animated cursor */}
      <motion.div
        className="absolute z-[65] pointer-events-none"
        animate={{ x: cursorPos.x - 4, y: cursorPos.y - 4 }}
        transition={{ type: "spring", stiffness: 120, damping: 20, duration: 0.8 }}
      >
        <CursorSVG />
        {/* Ripple on click */}
        <AnimatePresence>
          {ripple && (
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary/40 -translate-x-1/2 -translate-y-1/2"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
