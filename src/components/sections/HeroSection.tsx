import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import DisplayCards from "@/components/ui/display-cards";
import { Brain, Mic, Activity, ShieldCheck } from "lucide-react";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const heroCards = [
    {
      icon: <Brain className="size-6" />,
      title: t("hero.card1Title"),
      subtitle: t("hero.card1Sub"),
      description: t("hero.card1Desc"),
      date: t("hero.card1Date"),
      iconClassName: "text-primary",
      titleClassName: "text-primary",
      className:
        "[grid-area:stack] -translate-y-8 hover:-translate-y-36 before:absolute before:w-full before:outline-1 before:rounded-2xl before:outline-border before:h-full before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Mic className="size-6" />,
      title: t("hero.card2Title"),
      subtitle: t("hero.card2Sub"),
      description: t("hero.card2Desc"),
      date: t("hero.card2Date"),
      iconClassName: "text-secondary",
      titleClassName: "text-secondary",
      className:
        "[grid-area:stack] translate-x-6 translate-y-10 hover:-translate-y-12 before:absolute before:w-full before:outline-1 before:rounded-2xl before:outline-border before:h-full before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Activity className="size-6" />,
      title: t("hero.card3Title"),
      subtitle: t("hero.card3Sub"),
      description: t("hero.card3Desc"),
      date: t("hero.card3Date"),
      iconClassName: "text-accent-foreground",
      titleClassName: "text-accent-foreground",
      className:
        "[grid-area:stack] translate-x-12 translate-y-28 hover:-translate-y-0 before:absolute before:w-full before:outline-1 before:rounded-2xl before:outline-border before:h-full before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <ShieldCheck className="size-6" />,
      title: t("hero.card4Title"),
      subtitle: t("hero.card4Sub"),
      description: t("hero.card4Desc"),
      date: t("hero.card4Date"),
      iconClassName: "text-primary",
      titleClassName: "text-primary",
      className: "[grid-area:stack] translate-x-[4.5rem] translate-y-[11.5rem] hover:-translate-y-4 before:absolute before:w-full before:outline-1 before:rounded-2xl before:outline-border before:h-full before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
  ];

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden rounded-b-[2.5rem] md:rounded-b-[3.5rem] mx-4 md:mx-8 mb-4 md:mb-6">
      {/* Spline background — contained to hero only */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-b-[2.5rem] md:rounded-b-[3.5rem]">
        <div className="absolute inset-0 hidden md:block">
          <spline-viewer
            url="https://prod.spline.design/lp2LRzHKPG0tDDPn/scene.splinecode"
            style={{ width: "100%", height: "100%", pointerEvents: "none" }}
          />
        </div>
        <div className="absolute inset-0 md:hidden bg-gradient-mesh" />
        <div className="absolute inset-0 bg-background/70 dark:bg-background/60" />
      </div>

      <div className="relative z-10 flex items-center min-h-[88vh] md:min-h-[90vh]">
        <motion.div
          className="w-full px-4 sm:px-6 lg:px-12 py-16 md:py-24"
          style={{ opacity: contentOpacity, y: contentY }}
        >
          <div className="max-w-[90rem] mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-4">
            {/* Left side — Text content */}
            <div className="w-full lg:w-[50%] text-left">
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-full bg-white/10 dark:bg-white/10 border border-border/40 dark:border-white/20 text-sm md:text-base text-primary mb-6 md:mb-8 backdrop-blur-md shadow-lg">
                  <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-secondary animate-pulse" />
                  {t("hero.badge")}
                </span>
              </motion.div>

              <motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-[-0.04em] text-foreground mb-4 md:mb-6 leading-[1.1] hero-text-shadow">
                {t("hero.title").split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block mr-[0.3em]"
                  >
                    {word}
                  </motion.span>
                ))}{" "}
                <motion.span
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="gradient-text-hero inline-block"
                >
                  {t("hero.titleHighlight")}
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg md:text-xl lg:text-2xl text-foreground/70 mb-8 md:mb-12 max-w-2xl leading-relaxed"
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start pointer-events-auto"
              >
                <Link
                  to="/auth?mode=signup"
                  className="btn-hero-glass text-white text-base md:text-lg lg:text-xl py-3.5 px-8 md:py-5 md:px-12 w-full sm:w-auto"
                >
                  {t("hero.cta")}
                </Link>
                <a
                  href="#how-it-works"
                  className="btn-hero-secondary text-foreground text-base md:text-lg lg:text-xl py-3.5 px-8 md:py-5 md:px-12 w-full sm:w-auto"
                >
                  {t("hero.secondary")}
                </a>
              </motion.div>
            </div>

            {/* Right side — 50% — Display Cards */}
            <motion.div
              className="w-full lg:w-[50%] flex items-center justify-center min-h-[450px]"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <DisplayCards cards={heroCards} />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
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
      </div>
    </section>
  );
}
