import { useRef, useState, useEffect } from "react";
import { ChatCircle, FileArrowUp, Package, ClipboardText } from "@phosphor-icons/react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

const stepIcons = [ClipboardText, ChatCircle, FileArrowUp, Package];

const stepAccents = [
  { color: "rgba(0, 240, 255, 0.8)", glow: "rgba(0, 240, 255, 0.15)", border: "rgba(0, 240, 255, 0.2)" },
  { color: "rgba(59, 130, 246, 0.8)", glow: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.2)" },
  { color: "rgba(0, 200, 180, 0.8)", glow: "rgba(0, 200, 180, 0.15)", border: "rgba(0, 200, 180, 0.2)" },
  { color: "rgba(0, 215, 135, 0.8)", glow: "rgba(0, 215, 135, 0.15)", border: "rgba(0, 215, 135, 0.2)" },
];

function StepCard({ stepIndex }: { stepIndex: number }) {
  const { t } = useTranslation();
  const IconComponent = stepIcons[stepIndex];
  const accent = stepAccents[stepIndex];
  const stepNum = stepIndex + 1;
  const number = `0${stepNum}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-5xl mx-auto px-4 md:px-8"
    >
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: "hsl(220 20% 8% / 0.95)",
          border: `1px solid ${accent.border}`,
          boxShadow: `0 0 60px ${accent.glow}, 0 25px 60px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Accent line at top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)` }}
        />

        <div className="flex flex-col md:flex-row items-stretch">
          {/* Left: Large number + icon */}
          <div className="relative flex flex-col items-center justify-center p-8 md:p-12 md:w-[280px] lg:w-[320px] border-b md:border-b-0 md:border-r border-white/5">
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${accent.glow}, transparent 70%)`,
              }}
            />

            <span
              className="relative text-[7rem] md:text-[9rem] lg:text-[11rem] font-extralight leading-none select-none"
              style={{ color: accent.color }}
            >
              {number}
            </span>

            <div
              className="relative mt-4 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: `${accent.color}15`, border: `1px solid ${accent.border}` }}
            >
              <IconComponent size={28} weight="light" style={{ color: accent.color }} />
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            {/* Step label */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="text-[10px] md:text-xs font-medium tracking-[0.25em] uppercase"
                style={{ color: accent.color }}
              >
                {t("howItWorks.step")} {number}
              </span>
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${accent.border}, transparent)` }} />
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-light tracking-tight text-white leading-[1.15] mb-5 md:mb-8">
              {t(`howItWorks.step${stepNum}.title`)}
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-white/50 leading-relaxed max-w-lg font-light">
              {t(`howItWorks.step${stepNum}.description`)}
            </p>

            {/* Bottom accent dots */}
            <div className="flex items-center gap-2 mt-8 md:mt-12">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === stepIndex ? 24 : 6,
                    height: 6,
                    background: i === stepIndex ? accent.color : "rgba(255,255,255,0.12)",
                    borderRadius: 999,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProgressIndicator({
  currentIndex,
  onStepClick,
}: {
  currentIndex: number;
  onStepClick: (index: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
      {stepAccents.map((accent, index) => (
        <button
          key={index}
          onClick={() => onStepClick(index)}
          className="relative transition-all duration-300 rounded-full focus:outline-none"
          style={{
            width: index === currentIndex ? 14 : 8,
            height: index === currentIndex ? 14 : 8,
          }}
          aria-label={`${t("howItWorks.step")} ${index + 1}`}
        >
          <span
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: index === currentIndex ? accent.color : "rgba(255,255,255,0.2)",
              boxShadow: index === currentIndex ? `0 0 12px ${accent.glow}` : "none",
            }}
          />
          {index === currentIndex && (
            <motion.span
              layoutId="activeStep"
              className="absolute -inset-1.5 rounded-full"
              style={{ border: `2px solid ${accent.border}` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
      <div className="absolute top-0 bottom-0 w-px bg-white/10 -z-10" />
    </div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const { t } = useTranslation();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const newIndex = Math.min(Math.floor(latest * 4), 3);
    if (newIndex !== currentStepIndex && newIndex >= 0) {
      setCurrentStepIndex(newIndex);
    }
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToStep = (index: number) => {
    if (!sectionRef.current) return;
    const sectionTop = sectionRef.current.offsetTop;
    const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight;
    const targetScroll = sectionTop + (sectionHeight * index) / 3;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative"
      style={{ height: `${4 * 60}vh` }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "hsl(222 25% 4%)" }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 40%, ${stepAccents[currentStepIndex].glow}, transparent)`,
            transition: "background 0.8s ease",
          }}
        />

        {/* Header */}
        <div className="absolute top-16 md:top-20 left-0 right-0 text-center px-4 z-10">
          <span className="text-[10px] md:text-xs text-cyan-400 uppercase tracking-[0.3em] mb-4 block font-medium">
            {t("howItWorks.badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white">
            {t("howItWorks.title")}{" "}
            <span className="gradient-text-hero">{t("howItWorks.titleHighlight")}</span>
          </h2>
        </div>

        {/* Step cards */}
        <div className="flex items-center justify-center w-full mt-16 md:mt-20">
          <AnimatePresence mode="wait">
            <StepCard key={currentStepIndex} stepIndex={currentStepIndex} />
          </AnimatePresence>
        </div>

        {/* Progress indicator */}
        {isInView && (
          <ProgressIndicator currentIndex={currentStepIndex} onStepClick={scrollToStep} />
        )}

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: currentStepIndex < 3 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-[10px] text-white/30 uppercase tracking-[0.25em]">
            {t("howItWorks.scroll")}
          </span>
          <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center p-1">
            <motion.div
              className="w-1 h-2 bg-white/30 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
