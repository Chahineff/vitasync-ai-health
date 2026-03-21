import { 
  Robot, 
  ChartLineUp, 
  FileMagnifyingGlass, 
  ShieldCheck,
} from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { MagicText } from "@/components/ui/magic-text";
import { Meteors } from "@/components/ui/meteors";
import { AnimatedCard, CardBody, CardTitle, CardDescription, CardVisual, Visual1 } from "@/components/ui/animated-card";

const featureIcons = [Robot, ChartLineUp, FileMagnifyingGlass, ShieldCheck];

const featureAccents = [
  { mainColor: "hsl(var(--primary))", secondaryColor: "hsl(var(--secondary))", rawMain: "#00f0ff", rawSecondary: "#00d787" },
  { mainColor: "hsl(var(--secondary))", secondaryColor: "hsl(var(--primary))", rawMain: "#00d787", rawSecondary: "#00f0ff" },
  { mainColor: "hsl(var(--accent))", secondaryColor: "hsl(var(--primary))", rawMain: "#00c8b4", rawSecondary: "#00f0ff" },
  { mainColor: "hsl(var(--primary))", secondaryColor: "hsl(var(--secondary))", rawMain: "#3b82f6", rawSecondary: "#00d787" },
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
  const featureNum = index + 1;

  const title = t(`features.feature${featureNum}.title`);
  const description = t(`features.feature${featureNum}.description`);

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-6 md:gap-8 lg:gap-12 items-center`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4 }}
    >
      {/* Left: Meteor card with condensed text */}
      <motion.div 
        className="w-full lg:w-1/2"
        initial={{ opacity: 0, x: isReversed ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/80 backdrop-blur-xl p-8 md:p-10 lg:p-12 min-h-[280px] flex flex-col justify-center">
          {/* Meteors background effect */}
          <Meteors number={12} />
          
          <div className="relative z-10">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
              <Icon size={24} weight="light" className="text-primary" />
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-foreground mb-4">
              {title}
            </h3>

            {/* Description with MagicText */}
            <MagicText
              text={description}
              className="text-sm md:text-base leading-relaxed font-light"
            />
          </div>
        </div>
      </motion.div>

      {/* Right: AnimatedCard visual */}
      <motion.div 
        className="w-full lg:w-1/2"
        initial={{ opacity: 0, x: isReversed ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        style={{ y: imageY }}
      >
        <AnimatedCard>
          <CardVisual className="h-56 md:h-64">
            <Visual1 mainColor={accent.rawMain} secondaryColor={accent.rawSecondary} />
          </CardVisual>
          <CardBody>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardBody>
        </AnimatedCard>
      </motion.div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="section-padding overflow-hidden bg-transparent section-parallax">
      <div className="container-custom">
        {/* Header — no badge, MagicText animations */}
        <motion.div 
          className="text-center mb-12 md:mb-16 lg:mb-24 px-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-3 md:mb-4">
            <MagicText
              text={`${t("features.title")} ${t("features.titleHighlight")} ${t("features.titleEnd")}`}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight justify-center"
            />
          </h2>
          <MagicText
            text={t("features.subtitle")}
            className="text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-4 md:px-0 justify-center font-light"
          />
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
