import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  House, FirstAidKit, Storefront, Gear, Question, DeviceMobile,
  User, Crown, CheckCircle, ArrowRight, ArrowLeft, SignOut, CaretLeft,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import {
  TutorialHomeDemo,
  TutorialCoachDemo,
  TutorialSupplementsDemo,
  TutorialShopDemo,
  TutorialSettingsDemo,
} from "./tutorial";

const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

interface DashboardTutorialProps {
  onComplete: () => void;
}

/* ── VitaSync icon (same as Dashboard.tsx) ── */
const VitaSyncIcon = ({ className, weight }: { className?: string; weight?: string }) => (
  <img src={vitasyncLogo} alt="Coach IA" className={className || "w-5 h-5"} />
);

/* ── Step config ── */
const STEPS = [
  { id: "home", label: "Accueil", icon: House, bubble: "Chaque jour, remplis ton check-in pour que ton Coach IA s'adapte à toi." },
  { id: "coach", label: "Coach IA", icon: VitaSyncIcon, bubble: "Pose tes questions santé à VitaSync. Il connaît ton profil et s'adapte à tes besoins." },
  { id: "supplements", label: "Suppléments", icon: FirstAidKit, bubble: "Suis ta routine et coche tes prises. Exemple : Créatine le matin, Magnésium le soir." },
  { id: "shop", label: "Boutique", icon: Storefront, bubble: "Découvre une large sélection de compléments adaptés à ton profil." },
  { id: "settings", label: "Paramètres", icon: Gear, bubble: "Modifie ton profil de santé, change de thème, ajuste tes préférences à tout moment." },
];

const DEMO_MAP: Record<string, React.FC> = {
  home: TutorialHomeDemo,
  coach: TutorialCoachDemo,
  supplements: TutorialSupplementsDemo,
  shop: TutorialShopDemo,
  settings: TutorialSettingsDemo,
};

/* ── Cursor SVG ── */
function CursorSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Main Tutorial ── */
export function DashboardTutorial({ onComplete }: DashboardTutorialProps) {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<"moving" | "clicking" | "showing">("showing");
  const [ripple, setRipple] = useState(false);
  const sidebarRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = STEPS[currentStep];
  const DemoComponent = DEMO_MAP[step.id];
  const isLast = currentStep === STEPS.length - 1;

  const menuItems = STEPS.slice(0, 4); // home, coach, supplements, shop
  const generalItems = [STEPS[4]]; // settings

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

  useEffect(() => {
    const t = setTimeout(() => updateCursorTarget(0), 200);
    return () => clearTimeout(t);
  }, [updateCursorTarget]);

  const startAutoAdvance = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      if (!isLast) goToStep(currentStep + 1);
    }, 6000);
  }, [currentStep, isLast]);

  useEffect(() => {
    if (phase === "showing") startAutoAdvance();
    return () => { if (autoTimerRef.current) clearTimeout(autoTimerRef.current); };
  }, [phase, startAutoAdvance]);

  const goToStep = useCallback((nextStep: number) => {
    if (nextStep >= STEPS.length) { onComplete(); return; }
    setPhase("moving");
    updateCursorTarget(nextStep);
    setTimeout(() => {
      setPhase("clicking");
      setRipple(true);
      setTimeout(() => setRipple(false), 400);
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

  const handlePrev = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (currentStep > 0) goToStep(currentStep - 1);
  };

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
        className="absolute top-4 right-4 z-[70] text-foreground/50 hover:text-foreground transition-colors text-sm flex items-center gap-1 px-4 py-2 rounded-xl bg-card/60 border border-border/20 backdrop-blur-md pointer-events-auto"
      >
        Passer
      </button>

      <div className="h-full flex w-full">
        {/* ═══ SIDEBAR (desktop) — exact replica of Dashboard.tsx ═══ */}
        {!isMobile && (
          <aside className="fixed top-4 bottom-4 left-4 z-[61] glass-sidebar-floating flex flex-col w-72 pointer-events-none">
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img alt="VitaSync" className="w-8 h-8" src={vitasyncLogo} />
                <span className="text-xl font-light tracking-tight text-foreground whitespace-nowrap">
                  Vita<span className="text-primary font-medium">Sync</span>
                </span>
              </div>
              <div className="p-2 rounded-lg">
                <CaretLeft weight="light" className="w-5 h-5 text-foreground/60" />
              </div>
            </div>

            <div className="px-4 flex-1">
              <p className="px-3 text-xs font-medium text-foreground/40 uppercase tracking-wider mb-3">Menu</p>
              <nav className="space-y-1">
                {menuItems.map((item, i) => (
                  <button
                    key={item.id}
                    ref={(el) => { sidebarRefs.current[i] = el; }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all relative",
                      currentStep === i && phase === "showing"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-foreground/70"
                    )}
                  >
                    <item.icon weight="light" className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <p className="px-3 text-xs font-medium text-foreground/40 uppercase tracking-wider mb-3 mt-8">Général</p>
              <nav className="space-y-1">
                {generalItems.map((item, gi) => {
                  const globalIdx = 4 + gi;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => { sidebarRefs.current[globalIdx] = el; }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all relative",
                        currentStep === globalIdx && phase === "showing"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-foreground/70"
                      )}
                    >
                      <item.icon weight="light" className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light text-foreground/70">
                  <Question weight="light" className="w-5 h-5 flex-shrink-0" />
                  <span>Aide</span>
                </div>
                <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light text-foreground/70">
                  <SignOut weight="light" className="w-5 h-5 flex-shrink-0" />
                  <span>Se déconnecter</span>
                </div>
              </nav>
            </div>

            {/* App Promo Card */}
            <div className="px-4 mb-4">
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-white/10 rounded-xl p-4 backdrop-blur-[20px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <DeviceMobile weight="light" className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Application mobile</p>
                </div>
                <div className="w-full mt-2 px-3 py-2 rounded-lg bg-foreground/5 text-foreground/40 text-xs font-medium text-center border border-white/10">
                  Bientôt
                </div>
              </Card>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <User weight="light" className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">User</p>
                  <div className="flex items-center gap-1">
                    <Crown weight="fill" className="w-3 h-3 text-foreground/40" />
                    <span className="text-xs text-foreground/50">Plan Gratuit</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ═══ MAIN CONTENT ═══ */}
        <main className={cn("flex-1 flex flex-col min-h-0", !isMobile && "ml-80")}>
          <div className={cn(
            "flex-1 overflow-auto pointer-events-none",
            step.id === "coach" ? "p-0 lg:p-8" : "p-4 lg:p-8",
            isMobile && "pb-24"
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <DemoComponent />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ═══ FLOATING BUBBLE + CONTROLS ═══ */}
          <div className="p-4 lg:p-8 pt-0 pointer-events-auto">
            {/* Explanatory bubble */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="mb-4"
              >
                <div className="glass-card rounded-2xl p-5 border border-primary/20 bg-primary/5 flex items-start gap-4">
                  <img src={vitasyncLogo} alt="" className="w-8 h-8 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">{step.label}</p>
                    <p className="text-base text-foreground/80 font-light leading-relaxed">{step.bubble}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/20 text-foreground/70 text-sm font-medium hover:bg-card/80 transition-colors"
                  >
                    <ArrowLeft weight="bold" className="w-4 h-4" /> Retour
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                >
                  {isLast ? (
                    <><CheckCircle weight="bold" className="w-4 h-4" /> C'est parti !</>
                  ) : (
                    <>Suivant <ArrowRight weight="bold" className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* ═══ MOBILE BOTTOM NAV (replica of MobileBottomNav) ═══ */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-[61] pointer-events-none">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/10" />
            <div className="relative flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {STEPS.map((s, i) => {
                const isActive = currentStep === i && phase === "showing";
                return (
                  <button
                    key={s.id}
                    ref={(el) => { sidebarRefs.current[i] = el; }}
                    className="relative flex flex-col items-center gap-1 px-3 py-2 min-w-[56px]"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="tutorialMobileNavIndicator"
                        className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                    <motion.div
                      animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative z-10"
                    >
                      <s.icon
                        weight={isActive ? "fill" : "light"}
                        className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-foreground/60")}
                      />
                    </motion.div>
                    <span className={cn("text-[10px] font-medium relative z-10", isActive ? "text-primary" : "text-foreground/50")}>
                      {s.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>

      {/* ═══ ANIMATED CURSOR ═══ */}
      {!isMobile && (
        <motion.div
          className="absolute z-[65] pointer-events-none"
          animate={{ x: cursorPos.x - 4, y: cursorPos.y - 4 }}
          transition={{ type: "spring", stiffness: 120, damping: 20, duration: 0.8 }}
        >
          <CursorSVG />
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
      )}
    </motion.div>
  );
}
