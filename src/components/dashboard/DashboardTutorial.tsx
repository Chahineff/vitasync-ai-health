import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  House, FirstAidKit, Storefront, Gear, Question, DeviceMobile,
  User, Crown, CheckCircle, ArrowRight, ArrowLeft, SignOut, CaretLeft,
  Package, TestTube, Play, X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import {
  TutorialHomeDemo,
  TutorialCoachDemo,
  TutorialSupplementsDemo,
  TutorialShopDemo,
  TutorialMyStackDemo,
  TutorialAnalysesDemo,
  TutorialSettingsDemo,
} from "./tutorial";

const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

interface DashboardTutorialProps {
  onComplete: () => void;
}

const VitaSyncIcon = ({ className, weight }: { className?: string; weight?: string }) => (
  <img src={vitasyncLogo} alt="Coach IA" className={className || "w-5 h-5"} />
);

/* ── Step config (7 steps) ── */
const STEPS = [
  { id: "home", label: "Accueil", icon: House, bubble: "Chaque jour, remplis ton check-in pour que ton Coach IA s'adapte à toi." },
  { id: "coach", label: "Coach IA", icon: VitaSyncIcon, bubble: "Pose tes questions santé à VitaSync. Il connaît ton profil et s'adapte à tes besoins." },
  { id: "supplements", label: "Suppléments", icon: FirstAidKit, bubble: "Suis ta routine et coche tes prises. Exemple : Créatine le matin, Magnésium le soir." },
  { id: "shop", label: "Boutique", icon: Storefront, bubble: "Découvre une large sélection de compléments adaptés à ton profil." },
  { id: "mystack", label: "Mon Stack", icon: Package, bubble: "Connecte ton compte boutique pour suivre tes commandes, abonnements et livraisons." },
  { id: "analyses", label: "Mes Analyses", icon: TestTube, bubble: "Importe tes analyses sanguines en PDF et laisse l'IA les décrypter pour toi." },
  { id: "settings", label: "Paramètres", icon: Gear, bubble: "Modifie ton profil de santé, change de thème, ajuste tes préférences à tout moment." },
];

const DEMO_MAP: Record<string, React.FC> = {
  home: TutorialHomeDemo,
  coach: TutorialCoachDemo,
  supplements: TutorialSupplementsDemo,
  shop: TutorialShopDemo,
  mystack: TutorialMyStackDemo,
  analyses: TutorialAnalysesDemo,
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

/* ── Intro Screen ── */
function TutorialIntro({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-background"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Floating logo */}
        <motion.div
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center mb-8 backdrop-blur-sm"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src={vitasyncLogo} alt="VitaSync" className="w-14 h-14 object-contain" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-3"
        >
          Bienvenue dans le tutoriel{" "}
          <span className="text-primary font-medium">VitaSync</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-base md:text-lg text-foreground/50 font-light mb-10"
        >
          Découvrez votre dashboard en 7 étapes — moins d'une minute
        </motion.p>

        {/* Steps preview dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-3 mb-10"
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 + i * 0.06, type: "spring", stiffness: 400, damping: 20 }}
              className="w-9 h-9 rounded-xl bg-card/60 border border-border/30 flex items-center justify-center"
              title={s.label}
            >
              <s.icon weight="light" className="w-4 h-4 text-foreground/50" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col items-center gap-3"
        >
          <button
            onClick={onStart}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-base font-semibold shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play weight="fill" className="w-5 h-5" />
            Commencer la visite
          </button>
          <button
            onClick={onSkip}
            className="text-sm text-foreground/40 hover:text-foreground/60 font-light transition-colors py-2"
          >
            Passer le tutoriel
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Main Tutorial ── */
export function DashboardTutorial({ onComplete }: DashboardTutorialProps) {
  const isMobile = useIsMobile();
  const [showIntro, setShowIntro] = useState(true);
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

  // Sidebar split: first 6 items in "Menu", last 1 in "Général"
  const menuItems = STEPS.slice(0, 6);
  const generalItems = [STEPS[6]]; // settings

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
    if (showIntro) return;
    const t = setTimeout(() => updateCursorTarget(0), 200);
    return () => clearTimeout(t);
  }, [updateCursorTarget, showIntro]);

  const startAutoAdvance = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      if (!isLast) goToStep(currentStep + 1);
    }, 6000);
  }, [currentStep, isLast]);

  useEffect(() => {
    if (showIntro) return;
    if (phase === "showing") startAutoAdvance();
    return () => { if (autoTimerRef.current) clearTimeout(autoTimerRef.current); };
  }, [phase, startAutoAdvance, showIntro]);

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
    <>
      {/* ═══ INTRO SCREEN ═══ */}
      <AnimatePresence>
        {showIntro && (
          <TutorialIntro
            onStart={() => setShowIntro(false)}
            onSkip={onComplete}
          />
        )}
      </AnimatePresence>

      {/* ═══ TUTORIAL BODY ═══ */}
      {!showIntro && (
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
            className="absolute top-4 right-4 z-[70] text-foreground/70 hover:text-foreground transition-colors text-sm font-medium flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-card/80 border border-border/30 backdrop-blur-md pointer-events-auto shadow-lg shadow-black/10 hover:bg-card/90"
          >
            Passer le tutoriel
          </button>

          <div className="h-full flex w-full">
            {/* ═══ SIDEBAR (desktop) ═══ */}
            {!isMobile && (
              <aside className="fixed top-4 bottom-4 left-4 z-[61] glass-sidebar-floating flex flex-col w-72 pointer-events-none">
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
                      const globalIdx = 6 + gi;
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
                      Soon
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
                          i === currentStep ? "w-8 bg-primary" : i < currentStep ? "w-2 bg-primary/50" : "w-2 bg-foreground/15"
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrev}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-card/80 border border-border/30 text-foreground/80 text-sm font-medium hover:bg-card transition-colors shadow-md"
                      >
                        <ArrowLeft weight="bold" className="w-4 h-4" /> Retour
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-xl shadow-primary/30 hover:bg-primary/90 transition-colors"
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

            {/* ═══ MOBILE BOTTOM NAV ═══ */}
            {isMobile && (
              <nav className="fixed bottom-0 left-0 right-0 z-[61] pointer-events-none">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/10" />
                <div className="relative flex items-center justify-around px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                  {STEPS.map((s, i) => {
                    const isActive = currentStep === i && phase === "showing";
                    return (
                      <button
                        key={s.id}
                        ref={(el) => { sidebarRefs.current[i] = el; }}
                        className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[44px]"
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
                        <span className={cn("text-[9px] font-medium relative z-10", isActive ? "text-primary" : "text-foreground/50")}>
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
      )}
    </>
  );
}
