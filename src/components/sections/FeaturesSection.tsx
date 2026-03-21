import { 
  Robot, 
  ChartLineUp, 
  FileMagnifyingGlass, 
  ShieldCheck,
  Check,
  ArrowRight
} from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { MagicText } from "@/components/ui/magic-text";
import { AnimatedText } from "@/components/ui/animated-shiny-text";
import { ChatPreviewWidget } from "./ChatPreviewWidget";
import { TrackerPreviewWidget } from "./TrackerPreviewWidget";
import { BiomarkerPreviewWidget } from "./BiomarkerPreviewWidget";
import { QualityPreviewWidget } from "./QualityPreviewWidget";
import { GlowCard } from "@/components/ui/spotlight-card";
import { cn } from "@/lib/utils";

const featureIcons = [Robot, ChartLineUp, FileMagnifyingGlass, ShieldCheck];

const featureAccents = [
  { color: "rgba(0, 240, 255, 0.8)", glow: "rgba(0, 240, 255, 0.12)", border: "rgba(0, 240, 255, 0.25)", borderLight: "rgba(0, 200, 220, 0.2)", gradient: "from-primary to-primary/60", bgGradient: "from-primary/10 via-primary/5 to-transparent", glowColor: "cyan" as const },
  { color: "rgba(0, 215, 135, 0.8)", glow: "rgba(0, 215, 135, 0.12)", border: "rgba(0, 215, 135, 0.25)", borderLight: "rgba(0, 195, 120, 0.2)", gradient: "from-secondary to-secondary/60", bgGradient: "from-secondary/10 via-secondary/5 to-transparent", glowColor: "green" as const },
  { color: "rgba(0, 200, 180, 0.8)", glow: "rgba(0, 200, 180, 0.12)", border: "rgba(0, 200, 180, 0.25)", borderLight: "rgba(0, 180, 160, 0.2)", gradient: "from-accent to-accent/60", bgGradient: "from-accent/10 via-accent/5 to-transparent", glowColor: "cyan" as const },
  { color: "rgba(59, 130, 246, 0.8)", glow: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.25)", borderLight: "rgba(59, 130, 246, 0.2)", gradient: "from-primary via-accent to-secondary", bgGradient: "from-primary/10 via-accent/5 to-secondary/10", glowColor: "blue" as const },
];

function FeatureBlock({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isReversed = index % 2 === 1;
  const { t } = useTranslation();
  const accent = featureAccents[index];
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);

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
      className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 md:gap-10 lg:gap-12 items-stretch max-w-7xl mx-auto`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      {/* Text Block */}
      <motion.div 
        className="w-full lg:w-1/2 relative z-10"
        initial={{ opacity: 0, x: isReversed ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full"
        >
        <GlowCard glowColor={accent.glowColor} className="h-full transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)]">
          <div className="relative p-8 md:p-10 lg:p-14">
            {/* Radial glow behind content */}
            <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 60% 40% at 20% 20%, ${accent.glow}, transparent)`,
              }}
            />

            {/* Accent line top */}
            <div
              className="absolute top-0 left-0 right-0 h-px z-10"
              style={{ background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)` }}
            />

            <div className="relative z-10">
              {/* Icon + subtitle row */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 flex-shrink-0`}>
                  <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center">
                    <Icon size={28} weight="light" className="text-foreground md:hidden" />
                    <Icon size={32} weight="light" className="text-foreground hidden md:block" />
                  </div>
                </div>
                <span className={`text-xs font-semibold uppercase tracking-[0.2em] bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                  {subtitle}
                </span>
              </div>

              {/* Title — larger */}
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-5 leading-tight">
                {title}
              </h3>

              {/* Description with MagicText */}
              <MagicText
                text={description}
                className="text-base md:text-lg leading-relaxed mb-8 font-light"
              />

              {/* Details list */}
              <ul className="space-y-4">
                {details.map((detail, detailIndex) => (
                  <motion.li
                    key={detailIndex}
                    className="flex items-start gap-3 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: detailIndex * 0.08 }}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      style={{ boxShadow: `0 0 12px ${accent.glow}` }}
                    >
                      <Check size={12} weight="bold" className="text-primary-foreground" />
                    </div>
                    <span className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors duration-200">{detail}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA link */}
              <motion.a
                href="/auth"
                className="inline-flex items-center gap-2 mt-10 text-sm font-medium transition-all duration-300 group/cta"
                style={{ color: accent.color }}
                whileHover={{ x: 4 }}
              >
                {t("features.cta") || "Découvrir"}
                <ArrowRight size={16} weight="bold" className="transition-transform group-hover/cta:translate-x-1" />
              </motion.a>
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Preview Block — overlapping slightly */}
      <motion.div 
        className={cn(
          "w-full lg:w-[50%] relative",
          isReversed ? "lg:-mr-[5%]" : "lg:-ml-[5%]"
        )}
        initial={{ opacity: 0, x: isReversed ? -60 : 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        style={{ y: imageY }}
      >
        <div className={`relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-auto lg:h-full min-h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden`}>
          {/* Background gradient */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl"
            style={{
              background: `linear-gradient(135deg, ${accent.glow}, transparent 40%, ${accent.glow})`,
            }}
          />
          {/* Inner glow */}
          <div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${accent.color}08, transparent 60%)`,
            }}
          />
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
          className="text-center mb-16 md:mb-20 lg:mb-28 px-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light tracking-tight text-foreground mb-4 md:mb-5">
            {t("features.title")}{" "}
            <AnimatedText
              text={t("features.titleHighlight")}
              textClassName="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight"
              className="inline-block"
            />
            {" "}{t("features.titleEnd")}
          </h2>
          <MagicText
            text={t("features.subtitle")}
            className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto font-light px-4 md:px-0 justify-center"
          />
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-16 md:space-y-24 lg:space-y-32">
          {[0, 1, 2, 3].map((index) => (
            <FeatureBlock key={index} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
