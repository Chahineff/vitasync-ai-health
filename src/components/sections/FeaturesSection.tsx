import { 
  Robot, 
  ChartLineUp, 
  FileMagnifyingGlass, 
  ShieldCheck,
  Check
} from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTranslation } from "@/hooks/useTranslation";

const featureIcons = [Robot, ChartLineUp, FileMagnifyingGlass, ShieldCheck];

const featureGradients = [
  { gradient: "from-primary to-primary/60", bgGradient: "from-primary/10 via-primary/5 to-transparent" },
  { gradient: "from-secondary to-secondary/60", bgGradient: "from-secondary/10 via-secondary/5 to-transparent" },
  { gradient: "from-accent to-accent/60", bgGradient: "from-accent/10 via-accent/5 to-transparent" },
  { gradient: "from-primary via-accent to-secondary", bgGradient: "from-primary/10 via-accent/5 to-secondary/10" },
];

interface FeatureBlockProps {
  index: number;
}

function FeatureBlock({ index }: FeatureBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isReversed = index % 2 === 1;
  const { t } = useTranslation();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const imageY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const Icon = featureIcons[index];
  const { gradient, bgGradient } = featureGradients[index];
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
        <GlassCard className="h-full p-6 md:p-8 lg:p-10">
          {/* Icon with gradient background */}
          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 mb-6`}>
            <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
              <Icon 
                size={28} 
                weight="light" 
                className="text-foreground md:hidden" 
              />
              <Icon 
                size={32} 
                weight="light" 
                className="text-foreground hidden md:block" 
              />
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
          <p className="text-sm md:text-base text-foreground/60 mb-6 leading-relaxed">
            {description}
          </p>

          {/* Details list with staggered animation */}
          <ul className="space-y-3 stagger-children">
            {details.map((detail, detailIndex) => (
              <li 
                key={detailIndex}
                className="flex items-start gap-3"
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Check size={12} weight="bold" className="text-primary-foreground" />
                </div>
                <span className="text-sm text-foreground/70">{detail}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
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
        <div className={`relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br ${bgGradient}`}>
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-secondary/30 to-transparent blur-3xl" />
          </div>
          
          {/* Glass card with icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="glass-card p-8 md:p-12 rounded-3xl"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={`w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br ${gradient} p-1`}>
                <div className="w-full h-full rounded-[14px] bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <Icon 
                    size={40} 
                    weight="light" 
                    className="text-foreground md:hidden" 
                  />
                  <Icon 
                    size={56} 
                    weight="light" 
                    className="text-foreground hidden md:block" 
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Floating decorative elements */}
          <motion.div 
            className="absolute top-8 right-8 w-12 h-12 md:w-16 md:h-16 rounded-xl glass-card flex items-center justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg bg-gradient-to-br ${gradient}`} />
          </motion.div>
          
          <motion.div 
            className="absolute bottom-8 left-8 w-10 h-10 md:w-14 md:h-14 rounded-full glass-card flex items-center justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
          >
            <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full bg-gradient-to-br ${gradient}`} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="section-padding overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16 lg:mb-24 px-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-xs md:text-sm text-secondary uppercase tracking-widest mb-3 md:mb-4 block">
            {t("features.badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-3 md:mb-4">
            {t("features.title")}{" "}
            <span className="gradient-text-reverse">{t("features.titleHighlight")}</span>
            {" "}{t("features.titleEnd")}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-foreground/50 max-w-2xl mx-auto px-4 md:px-0">
            {t("features.subtitle")}
          </p>
        </motion.div>

        {/* Features Grid - Zigzag layout */}
        <div className="space-y-12 md:space-y-16 lg:space-y-24">
          {[0, 1, 2, 3].map((index) => (
            <FeatureBlock key={index} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
