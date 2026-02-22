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
      className="relative py-12 md:py-20 lg:py-32 overflow-hidden"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
      
      {/* Decorative blurs - smaller on mobile */}
      <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3 md:mb-4 px-2">
            {t("productPreview.title")} <span className="text-primary">{t("productPreview.titleHighlight")}</span> {t("productPreview.titleEnd")}
          </h2>
          <p className="text-foreground/60 text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-light px-4">
            {t("productPreview.subtitle")}
          </p>
        </motion.div>

        {/* Desktop Monitor Mockup with Real Screenshot */}
        <motion.div
          style={{ scale, rotateX, opacity }}
          className="relative max-w-5xl mx-auto perspective-[2000px]"
        >
          <div 
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* MacBook Frame */}
            <div className="relative">
              {/* Screen bezel */}
              <div 
                className="relative rounded-t-xl lg:rounded-t-2xl overflow-hidden border-[6px] lg:border-[10px] border-[#1a1a1a] dark:border-[#2a2a2a] bg-[#1a1a1a] dark:bg-[#2a2a2a]"
              >
                {/* Camera notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 lg:w-24 h-3 lg:h-4 bg-[#1a1a1a] dark:bg-[#2a2a2a] rounded-b-lg z-10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-[#3a3a3a]" />
                </div>

                {/* Screen Content */}
                <div className="aspect-[16/10] overflow-hidden rounded-sm">
                  <img 
                    src={resolvedTheme === 'dark' ? dashboardDark : dashboardLight}
                    alt="Dashboard VitaSync - Interface de suivi santé personnalisé"
                    className="w-full h-full object-cover object-top transition-opacity duration-500"
                  />
                </div>
              </div>

              {/* MacBook bottom hinge / keyboard base */}
              <div className="relative h-3 lg:h-5 bg-gradient-to-b from-[#c0c0c0] to-[#a8a8a8] dark:from-[#3a3a3a] dark:to-[#2a2a2a] rounded-b-xl lg:rounded-b-2xl flex items-center justify-center">
                <div className="w-12 lg:w-20 h-1 lg:h-1.5 bg-[#888] dark:bg-[#555] rounded-full" />
              </div>

              {/* Base shadow */}
              <div className="absolute -bottom-3 left-[10%] right-[10%] h-4 bg-foreground/10 blur-xl rounded-full" />
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
                animate={{ 
                  scale: isHovered ? 1 : 0.9, 
                  opacity: isHovered ? 1 : 0 
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
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
