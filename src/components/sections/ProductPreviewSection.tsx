import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "next-themes";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { AnimatedText } from "@/components/ui/animated-shiny-text";
import { MagicText } from "@/components/ui/magic-text";
import { useIsMobile } from "@/hooks/use-mobile";

import dashboardLight from "@/assets/dashboard-preview-light.png";
import dashboardDark from "@/assets/dashboard-preview-dark.png";

export const ProductPreviewSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();

  const dashboardSrc = resolvedTheme === "dark" ? dashboardDark : dashboardLight;

  return (
    <section className="relative overflow-hidden bg-transparent mt-8 md:mt-16 lg:mt-24">
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl" />

      {isMobile ? (
        /* Mobile: iPhone-style mockup */
        <div className="flex flex-col items-center px-4 py-10">
          <div className="mb-6 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-3 px-2 text-foreground">
              {t("productPreview.title")}{" "}
              <AnimatedText
                text={t("productPreview.titleHighlight")}
                textClassName="text-2xl sm:text-3xl font-extrabold tracking-tight"
                className="inline-block"
              />{" "}
              {t("productPreview.titleEnd")}
            </h2>
            <MagicText
              text={t("productPreview.subtitle")}
              className="text-base max-w-xl mx-auto font-light px-4 justify-center"
            />
          </div>

          {/* iPhone frame */}
          <div className="relative mx-auto w-[260px]">
            <div className="rounded-[2.5rem] border-[6px] border-foreground/10 bg-card shadow-2xl overflow-hidden aspect-[9/19.5]">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground/10 rounded-b-2xl z-10" />
              <img
                src={dashboardSrc}
                alt="Dashboard VitaSync mobile"
                className="w-full h-full object-cover object-left-top"
              />
            </div>
            {/* CTA */}
            <motion.button
              className="mt-6 mx-auto block px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25"
              onClick={() => (window.location.href = "/auth")}
              whileTap={{ scale: 0.95 }}
            >
              {t("productPreview.cta")}
            </motion.button>
          </div>
        </div>
      ) : (
        /* Desktop/Tablet: Container scroll animation */
        <ContainerScroll
          titleComponent={
            <div className="mb-6 max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light tracking-tight mb-4 md:mb-5 px-2 text-foreground">
                {t("productPreview.title")}{" "}
                <AnimatedText
                  text={t("productPreview.titleHighlight")}
                  textClassName="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight"
                  className="inline-block"
                />{" "}
                {t("productPreview.titleEnd")}
              </h2>
              <MagicText
                text={t("productPreview.subtitle")}
                className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto font-light px-4 justify-center"
              />
            </div>
          }
        >
          <div
            className="relative w-full h-full group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              src={dashboardSrc}
              alt="Dashboard VitaSync - Interface de suivi santé personnalisé"
              className="w-full h-full object-cover object-left-top rounded-lg"
            />

            {/* CTA Overlay on Hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-background/60 dark:bg-background/60 backdrop-blur-sm rounded-lg"
            >
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                  scale: isHovered ? 1 : 0.9,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                onClick={() => (window.location.href = "/auth")}
              >
                {t("productPreview.cta")}
              </motion.button>
            </motion.div>
          </div>
        </ContainerScroll>
      )}
    </section>
  );
};
