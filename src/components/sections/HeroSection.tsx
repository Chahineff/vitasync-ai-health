import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { MorphingGradient } from "@/components/ui/v2/MorphingGradient";
import { fadeInBlur, fadeInUp, stagger } from "@/lib/motion";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const [splineReady, setSplineReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) return;
    const node = sectionRef.current;
    if (!node) return;
    const mount = () => setSplineReady(true);
    const idle = (cb: () => void) =>
      "requestIdleCallback" in window
        ? (window as any).requestIdleCallback(cb, { timeout: 1500 })
        : setTimeout(cb, 600);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          idle(mount);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] md:min-h-screen overflow-hidden rounded-b-[2.5rem] md:rounded-b-[3.5rem] mx-3 md:mx-5 mb-4 md:mb-6"
    >
      {/* Ambient page background — soft, never overpowering text */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-b-[2.5rem] md:rounded-b-[3.5rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/8" />
        <MorphingGradient intensity="subtle" className="opacity-60 dark:opacity-90" />
        <div className="absolute inset-0 bg-background/55 dark:bg-background/55" />
      </div>

      <motion.div
        className="relative z-10 mx-auto flex min-h-[100svh] md:min-h-[90vh] w-full max-w-[90rem] items-center px-4 sm:px-6 lg:px-12 py-12 md:py-20"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.div
          variants={stagger(0.05, 0.08)}
          initial="hidden"
          animate="visible"
          className="grid w-full grid-cols-1 items-center gap-10 md:gap-12 lg:grid-cols-12 lg:gap-16"
        >
          {/* LEFT — editorial text column */}
          <div className="lg:col-span-7 xl:col-span-7 text-left">
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/40 px-4 py-2 text-xs sm:text-sm text-foreground/80 backdrop-blur-md shadow-sm dark:border-white/15 dark:bg-white/5">
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" aria-hidden="true" />
                <span className="font-medium tracking-wide">{t("hero.badge")}</span>
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInBlur}
              className="mt-6 md:mt-8 text-[2.5rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[5.25rem] xl:text-[5.75rem] font-light tracking-[-0.035em] text-foreground hero-text-shadow"
            >
              <span className="block">{t("hero.title")}</span>
              <span
                className="gradient-text-hero block mt-1 md:mt-2"
                style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 600 }}
              >
                {t("hero.titleHighlight")}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-5 md:mt-7 max-w-xl text-base sm:text-lg md:text-xl text-foreground/75 leading-relaxed font-light"
            >
              {t("hero.subtitle")}
            </motion.p>

            {/* CTAs — primary dominant, secondary discreet */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center pointer-events-auto"
            >
              <Link
                to="/auth?mode=signup"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 md:px-9 md:py-4 text-base md:text-lg font-medium text-background shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_hsl(var(--primary)/0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <span>{t("hero.cta")}</span>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/30 px-6 py-3 md:px-7 md:py-3.5 text-sm md:text-base font-medium text-foreground/85 backdrop-blur-md transition-colors hover:bg-background/60 hover:text-foreground dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
              >
                {t("hero.secondary")}
              </a>
            </motion.div>

            {/* Trust microcopy — non-medical positioning */}
            <motion.p
              variants={fadeInUp}
              className="mt-6 md:mt-8 inline-flex items-center gap-2 text-xs md:text-sm text-foreground/55"
            >
              <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4 text-secondary" aria-hidden="true" />
              <span>{t("hero.trust")}</span>
            </motion.p>
          </div>

          {/* RIGHT — framed signature visual (Spline desktop, MorphingGradient fallback mobile) */}
          <motion.div
            variants={fadeInBlur}
            className="lg:col-span-5 xl:col-span-5 relative"
            aria-label={t("hero.visualLabel")}
          >
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[28rem] lg:max-w-none lg:aspect-[5/6]">
              {/* Outer glow halo */}
              <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.25),transparent_60%),radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.2),transparent_60%)] blur-3xl" aria-hidden="true" />

              {/* Frame */}
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-border/40 bg-background/30 backdrop-blur-xl shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.35)] dark:border-white/10 dark:bg-white/[0.03]">
                {/* Mobile / no-Spline fallback */}
                <div className="absolute inset-0 md:hidden">
                  <MorphingGradient intensity="medium" />
                </div>

                {/* Desktop Spline (deferred) */}
                {splineReady && (
                  <div className="absolute inset-0 hidden md:block">
                    <spline-viewer
                      url="https://prod.spline.design/lp2LRzHKPG0tDDPn/scene.splinecode"
                      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
                    />
                  </div>
                )}
                {/* Pre-Spline placeholder for desktop */}
                {!splineReady && (
                  <div className="absolute inset-0 hidden md:block">
                    <MorphingGradient intensity="medium" />
                  </div>
                )}

                {/* Subtle inner vignette for visual depth */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" aria-hidden="true" />

                {/* Corner accent line (clinical detail) */}
                <div className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l border-t border-foreground/30 rounded-tl-lg" aria-hidden="true" />
                <div className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-r border-b border-foreground/30 rounded-br-lg" aria-hidden="true" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block z-10"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-foreground/20 flex items-start justify-center p-1.5 md:p-2"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
