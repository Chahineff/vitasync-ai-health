import { 
  Robot, 
  ChartLineUp, 
  FileMagnifyingGlass, 
  ShieldCheck,
  Check
} from "@phosphor-icons/react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { ChatPreviewWidget } from "./ChatPreviewWidget";
import { TrackerPreviewWidget } from "./TrackerPreviewWidget";
import { BiomarkerPreviewWidget } from "./BiomarkerPreviewWidget";
import { QualityPreviewWidget } from "./QualityPreviewWidget";

function ScrollHighlightText({ text, accentColor }: { text: string; accentColor: string }) {
  const words = text.split(" ");
  const containerRef = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.5 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isInView) { setProgress(0); return; }
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView]);

  return (
    <p ref={containerRef} className="text-sm md:text-base text-muted-foreground mb-6 leading-loose">
      {words.map((word, i) => {
        const wp = Math.min(Math.max((progress * words.length - i) / 1.5, 0), 1);
        return (
          <span key={i} className="inline-block mr-[0.3em]" style={{
            color: wp > 0.5 ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.2)",
            textShadow: wp > 0.8 ? `0 0 20px ${accentColor}` : "none",
            transition: "color 0.15s ease, text-shadow 0.3s ease",
          }}>{word}</span>
        );
      })}
    </p>
  );
}

const featureIcons = [Robot, ChartLineUp, FileMagnifyingGlass, ShieldCheck];

const featureAccents = [
  { color: "rgba(0, 240, 255, 0.8)", glow: "rgba(0, 240, 255, 0.12)", border: "rgba(0, 240, 255, 0.2)", borderLight: "rgba(0, 200, 220, 0.2)", gradient: "from-primary to-primary/60", bgGradient: "from-primary/10 via-primary/5 to-transparent" },
  { color: "rgba(0, 215, 135, 0.8)", glow: "rgba(0, 215, 135, 0.12)", border: "rgba(0, 215, 135, 0.2)", borderLight: "rgba(0, 195, 120, 0.2)", gradient: "from-secondary to-secondary/60", bgGradient: "from-secondary/10 via-secondary/5 to-transparent" },
  { color: "rgba(0, 200, 180, 0.8)", glow: "rgba(0, 200, 180, 0.12)", border: "rgba(0, 200, 180, 0.2)", borderLight: "rgba(0, 180, 160, 0.2)", gradient: "from-accent to-accent/60", bgGradient: "from-accent/10 via-accent/5 to-transparent" },
  { color: "rgba(59, 130, 246, 0.8)", glow: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.2)", borderLight: "rgba(59, 130, 246, 0.2)", gradient: "from-primary via-accent to-secondary", bgGradient: "from-primary/10 via-accent/5 to-secondary/10" },
];

interface FeatureBlockProps {
  index: number;
}

function FeatureBlock({ index }: FeatureBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isReversed = index % 2 === 1;
  const { t } = useTranslation();
  const accent = featureAccents[index];
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const imageY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const Icon = featureIcons[index];
  const { gradient, bgGradient } = accent;
  const featureNum = index + 1;

  const title = t(`features.feature${featureNum}.title`);
  const subtitle = t(`features.feature${featureNum}.subtitle`);
  const description = t(`features.feature${featureNum}.description`);
  const details = [
    t(`features.feature${featureNum}.detail1`),
    t(`features.feature${featureNum}.detail2`),
    t(`features.feature${featureNum}.detail3`),
    t(`features.feature${featureNum}.detail4`),
  ];

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-6 md:gap-8 lg:gap-12 items-center`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4 }}
    >
      {/* Text Block */}
      <motion.div 
        className="w-full lg:w-1/2"
        initial={{ opacity: 0, x: isReversed ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div 
          className="h-full rounded-3xl overflow-hidden relative p-6 md:p-8 lg:p-10 bg-white/70 dark:bg-transparent backdrop-blur-xl dark:backdrop-blur-none border dark:border-0 shine-hover"
          style={{ borderColor: accent.borderLight }}
        >
          {/* Dark mode card bg */}
          <div 
            className="absolute inset-0 hidden dark:block rounded-3xl"
            style={{
              background: "hsl(var(--card) / 0.92)",
              border: `1px solid ${accent.border}`,
              boxShadow: `0 0 40px ${accent.glow}`,
            }}
          />
          {/* Light mode shadow */}
          <div 
            className="absolute inset-0 dark:hidden rounded-3xl pointer-events-none"
            style={{ boxShadow: `0 0 30px ${accent.glow}, 0 15px 40px rgba(0,0,0,0.04)` }}
          />

          {/* Accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px z-10"
            style={{ background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)` }}
          />

          <div className="relative z-10">
            {/* Icon */}
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 mb-6`}>
              <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center">
                <Icon size={28} weight="light" className="text-foreground md:hidden" />
                <Icon size={32} weight="light" className="text-foreground hidden md:block" />
              </div>
            </div>

            {/* Subtitle badge */}
            <span className={`inline-block text-xs font-medium uppercase tracking-widest bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3`}>
              {subtitle}
            </span>

            {/* Title */}
            <h3 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-foreground mb-4">
              {title}
            </h3>

            {/* Description */}
            <ScrollHighlightText text={description} accentColor={accent.color} />

            {/* Details list */}
            <ul className="space-y-3 stagger-children">
              {details.map((detail, detailIndex) => (
                <li key={detailIndex} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Check size={12} weight="bold" className="text-primary-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Image Block */}
      <motion.div 
        className="w-full lg:w-1/2"
        initial={{ opacity: 0, x: isReversed ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        style={{ y: imageY }}
      >
        <div className={`relative aspect-[3/4] sm:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br ${bgGradient}`}>
          <div className="absolute inset-2 sm:inset-3 md:inset-5">
            {index === 0 && <ChatPreviewWidget />}
            {index === 1 && <TrackerPreviewWidget />}
            {index === 2 && <BiomarkerPreviewWidget />}
            {index === 3 && <QualityPreviewWidget />}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="section-padding overflow-hidden bg-transparent section-parallax">
      <div className="container-custom">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16 lg:mb-24 px-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-xs md:text-sm text-primary uppercase tracking-[0.2em] mb-3 md:mb-4 block font-medium">
            {t("features.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-3 md:mb-4">
            {t("features.title")}{" "}
            <span className="gradient-text">{t("features.titleHighlight")}</span>
            {" "}{t("features.titleEnd")}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4 md:px-0">
            {t("features.subtitle")}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-12 md:space-y-16 lg:space-y-24">
          {[0, 1, 2, 3].map((index) => (
            <FeatureBlock key={index} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
