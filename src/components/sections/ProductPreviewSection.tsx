import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "next-themes";
import dashboardLight from "@/assets/dashboard-preview-light.png";
import dashboardDark from "@/assets/dashboard-preview-dark.png";

export const ProductPreviewSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.9, 1, 1.02, 0.98]);
  const rotateX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [12, 4, 0, 2]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.8]);

  return (
    <section 
      ref={containerRef}
      className="relative py-12 md:py-20 lg:py-32 overflow-hidden bg-muted/20 dark:bg-[hsl(222_25%_4%)] section-parallax"
    >
      {/* Decorative blurs - themed */}
      <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3 md:mb-4 px-2 text-foreground">
            {t("productPreview.title")} <span className="gradient-text">{t("productPreview.titleHighlight")}</span> {t("productPreview.titleEnd")}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-light px-4">
            {t("productPreview.subtitle")}
          </p>
        </motion.div>

        {/* Desktop Monitor Mockup */}
        <motion.div
          style={{ scale, rotateX, opacity }}
          className="relative max-w-5xl mx-auto perspective-[2000px]"
        >
          <div 
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative">
              {/* Screen bezel */}
              <div className="relative rounded-t-xl lg:rounded-t-2xl overflow-hidden border-[6px] lg:border-[10px] border-[#e0e0e0] dark:border-[#1a1a1a] bg-[#e0e0e0] dark:bg-[#1a1a1a]">
                {/* Camera notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 lg:w-24 h-3 lg:h-4 bg-[#e0e0e0] dark:bg-[#1a1a1a] rounded-b-lg z-10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-[#c0c0c0] dark:bg-[#3a3a3a]" />
                </div>

                <div className="aspect-[16/10] overflow-hidden rounded-sm bg-background">
                  <img 
                    src={resolvedTheme === 'dark' ? dashboardDark : dashboardLight}
                    alt="Dashboard VitaSync - Interface de suivi santé personnalisé"
                    className="w-full h-full object-contain transition-opacity duration-500"
                  />
                </div>
              </div>

              {/* Hinge */}
              <div className="relative h-1.5 lg:h-2 bg-gradient-to-b from-[#d4d4d4] to-[#b8b8b8] dark:from-[#3a3a3a] dark:to-[#2a2a2a] flex items-center justify-center">
                <div className="w-12 lg:w-20 h-0.5 lg:h-1 bg-[#999] dark:bg-[#555] rounded-full" />
              </div>

              {/* Keyboard body */}
              <div 
                className="relative mx-auto rounded-b-xl lg:rounded-b-2xl overflow-hidden"
                style={{ width: '108%', marginLeft: '-4%', height: '16px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#d6d6d6] to-[#b8b8b8] dark:from-[#333] dark:to-[#222] rounded-b-xl lg:rounded-b-2xl" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[25%] h-[60%] rounded-t-sm bg-[#c0c0c0] dark:bg-[#2a2a2a] border border-[#aaa]/30 dark:border-[#444]/30" />
              </div>

              <div className="absolute -bottom-4 left-[5%] right-[5%] h-6 bg-foreground/5 dark:bg-foreground/8 blur-2xl rounded-full" />
            </div>

            {/* CTA Overlay on Hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl lg:rounded-2xl"
            >
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: isHovered ? 1 : 0.9, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                onClick={() => window.location.href = '/auth'}
              >
                {t("productPreview.cta")}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
